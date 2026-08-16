import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst, execute } from "@/lib/queries";
import { generateToken, generateWorkerId, hashPassword, getJwtSecret } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { idToken, referralCode } = await request.json() as { idToken?: string; referralCode?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (!expectedAud) {
      return NextResponse.json({ error: "Google login is not configured" }, { status: 501 });
    }

    // Verify the Google ID Token server-side via Google's tokeninfo endpoint.
    let profile: { sub?: string; email?: string; email_verified?: string; name?: string; picture?: string; aud?: string };
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
        headers: { "accept": "application/json" },
      });
      if (!res.ok) throw new Error("tokeninfo failed");
      profile = await res.json();
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (profile.aud !== expectedAud) {
      return NextResponse.json({ error: "Invalid token audience" }, { status: 400 });
    }
    const googleId = profile.sub;
    if (!googleId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    const email = profile.email || "";
    if (email && profile.email_verified !== "true") {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    const env = await getDB();

    // 1. Existing worker linked to this Google account.
    let worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
      env, "SELECT worker_id, name, phone FROM workers WHERE google_id = ?", [googleId]
    );

    if (worker) {
      if (profile.picture) {
        await execute(env, "UPDATE workers SET avatar_url = ? WHERE worker_id = ?", [profile.picture, worker.worker_id]).catch(() => {});
      }
      const token = await generateToken(worker.worker_id, getJwtSecret());
      const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name, isNew: false });
      setSessionCookie(response, token);
      return response;
    }

    // 2. Account linking: worker already registered on the platform with this email.
    if (email) {
      worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
        env, "SELECT worker_id, name, phone FROM workers WHERE phone = ?", [email]
      );
      if (worker) {
        await execute(env, "UPDATE workers SET google_id = ? WHERE worker_id = ?", [googleId, worker.worker_id]);
        if (profile.picture) {
          await execute(env, "UPDATE workers SET avatar_url = ? WHERE worker_id = ?", [profile.picture, worker.worker_id]).catch(() => {});
        }
        const token = await generateToken(worker.worker_id, getJwtSecret());
        const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name, isNew: false });
        setSessionCookie(response, token);
        return response;
      }
    }

    // 3. Auto-register. Same account on the main platform (same DB, same google_id).
    let sponsorId: string | null = null;
    let sponsorName: string | null = null;
    if (referralCode) {
      const sponsor = await queryFirst<{ worker_id: string; name: string }>(
        env, "SELECT worker_id, name FROM workers WHERE worker_id = ?", [referralCode]
      );
      if (sponsor) { sponsorId = sponsor.worker_id; sponsorName = sponsor.name; }
    }

    const phone = `google_${googleId.slice(0, 12)}`;
    const name = profile.name || `User${googleId.slice(0, 6)}`;
    const workerId = generateWorkerId(name, phone);
    const hashedPw = await hashPassword("google_oauth_" + googleId.slice(0, 8));

    await execute(env,
      `INSERT INTO workers (worker_id, name, phone, email, password, google_id, sponsor_id, sponsor_name, join_date, membership_status, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'general', ?)`,
      [workerId, name, phone, email || null, hashedPw, googleId, sponsorId, sponsorName, profile.picture || null]
    );

    // Affiliate tree + sponsor team count (same structure as the platform register).
    await execute(env,
      `INSERT INTO affiliate_tree (worker_id, parent_id, sponsor_id, level_number, position)
       VALUES (?, ?, ?, 1, 0)`,
      [workerId, sponsorId, sponsorId]
    ).catch(() => {});

    if (sponsorId) {
      await execute(env,
        "UPDATE workers SET total_team_members = total_team_members + 1 WHERE worker_id = ?",
        [sponsorId]
      ).catch(() => {});
    }

    // Attribution log for this signup.
    await execute(env,
      `INSERT INTO attribution_log (worker_id, channel, referrer, first_visit_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [workerId, sponsorId ? "referral" : "google", sponsorId || null]
    ).catch(() => {});

    // Auto-award resource income (mirrors platform register behavior).
    try {
      const incomeSetting = await queryFirst<{ setting_value: string }>(
        env, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_income_default_amount'"
      );
      const amount = parseFloat(incomeSetting?.setting_value || "0") || 0;
      if (amount > 0) {
        await execute(env,
          "UPDATE workers SET resource_income = resource_income + ?, resource_income_original = resource_income_original + ? WHERE worker_id = ?",
          [amount, amount, workerId]
        ).catch(() => {});
      }
    } catch {}

    const token = await generateToken(workerId, getJwtSecret());
    const response = NextResponse.json({ workerId, name, isNew: true }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
