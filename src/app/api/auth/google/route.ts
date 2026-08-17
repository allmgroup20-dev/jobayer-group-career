import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, generateWorkerId, hashWorkerPassword, getJwtSecret } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";
import { enrichWorkerProfile } from "./people/route";

type WorkerRow = { worker_id: string; name: string; phone: string; email: string | null };
type GoogleProfile = { sub?: string; email?: string; email_verified?: string; name?: string; picture?: string; aud?: string };

// Links the Google ID to an existing worker and refreshes profile fields:
// - avatar_url: always refreshed from Google (people change their picture)
// - email: filled only when empty (respects user edits)
// - name: filled only when empty or a "User..." placeholder (respects user edits)
async function linkAndRefresh(
  env: any,
  worker: WorkerRow,
  profile: GoogleProfile,
  googleId: string
): Promise<{ worker_id: string; name: string }> {
  const sets: string[] = ["google_id = ?"];
  const params: unknown[] = [googleId];
  if (profile.picture) {
    sets.push("avatar_url = ?");
    params.push(profile.picture);
  }
  let updatedName = worker.name;
  if ((!worker.name || worker.name.startsWith("User")) && profile.name) {
    sets.push("name = ?");
    params.push(profile.name);
    updatedName = profile.name;
  }
  if (!worker.email && profile.email) {
    sets.push("email = ?");
    params.push(profile.email);
  }
  params.push(worker.worker_id);
  await execute(env, `UPDATE workers SET ${sets.join(", ")} WHERE worker_id = ?`, params);
  return { worker_id: worker.worker_id, name: updatedName };
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, accessToken } = await request.json() as { idToken?: string; accessToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (!expectedAud) {
      return NextResponse.json({ error: "Google login is not configured" }, { status: 501 });
    }

    // Verify the Google ID Token server-side via Google's tokeninfo endpoint.
    // Signature, issuer, audience and email_verified are all validated by Google here.
    let profile: GoogleProfile;
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

    let workerId: string | null = null;
    let name = "";
    let status = 200;

    // 1. Existing worker linked to this Google account.
    let worker = await queryFirst<WorkerRow>(
      env, "SELECT worker_id, name, phone, email FROM workers WHERE google_id = ?", [googleId]
    );

    if (worker) {
      const linked = await linkAndRefresh(env, worker, profile, googleId);
      workerId = linked.worker_id;
      name = linked.name;
    }

    // 2. Account linking: worker already registered with this email
    //    (either email-as-phone, or a real phone with email stored in the email column).
    if (!workerId && email) {
      worker = await queryFirst<WorkerRow>(
        env, "SELECT worker_id, name, phone, email FROM workers WHERE phone = ? OR email = ?", [email, email]
      );
      // Never merge two distinct Google accounts that share an email.
      if (worker && !worker.phone.startsWith("google_")) {
        const linked = await linkAndRefresh(env, worker, profile, googleId);
        workerId = linked.worker_id;
        name = linked.name;
      }
    }

    // 3. Auto-register with google_id.
    // The phone column is UNIQUE NOT NULL, but an email is NOT a WhatsApp
    // number — storing the email as phone breaks phone verification later.
    // Use a stable unique placeholder and keep the real email in its own column.
    if (!workerId) {
      const phone = `google_${googleId.slice(0, 12)}`;
      name = profile.name || `User${googleId.slice(0, 6)}`;
      workerId = generateWorkerId(name, phone);
      const hashedPw = await hashWorkerPassword("google_oauth_" + googleId.slice(0, 8));
      await execute(env,
         `INSERT INTO workers (worker_id, name, phone, password, google_id, email, avatar_url, join_date, membership_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'general')`,
        [workerId, name, phone, hashedPw, googleId, email || null, profile.picture || null]
      );
      status = 201;
    }

    // Optional People API enrichment (phone/birthday/gender/occupation/address).
    // Best-effort and awaited so it completes before the response; never blocks login.
    if (accessToken && process.env.GOOGLE_PEOPLE_SCOPES) {
      await enrichWorkerProfile(env, workerId, accessToken).catch(() => {});
    }

    const token = await generateToken(workerId, getJwtSecret());
    const response = NextResponse.json({ workerId, name }, { status });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
