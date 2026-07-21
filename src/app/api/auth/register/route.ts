import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword, generateToken, generateWorkerId, getJwtSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, referralCode, referralSource, utmSource, utmMedium, utmCampaign } = await request.json() as {
      name?: string; phone: string; email?: string; password: string; referralCode?: string;
      referralSource?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string;
    };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const displayName = name || `User${cleanPhone.slice(-6)}`;

    const env = await getDB();

    const existing = await queryFirst<{ worker_id: string }>(
      env, "SELECT worker_id FROM workers WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = ?", [cleanPhone]
    );
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    let sponsorId: string | null = null;
    let sponsorName: string | null = null;

    if (referralCode) {
      const sponsor = await queryFirst<{ worker_id: string; name: string }>(
        env, "SELECT worker_id, name FROM workers WHERE worker_id = ?", [referralCode]
      );
      if (sponsor) { sponsorId = sponsor.worker_id; sponsorName = sponsor.name; }
    }

    const workerId = generateWorkerId(displayName, cleanPhone);
    const hashedPassword = await hashWorkerPassword(password);

    await execute(env,
       `INSERT INTO workers (worker_id, name, phone, email, password, sponsor_id, sponsor_name, level, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), 'general')`,
      [workerId, displayName, cleanPhone, email || null, hashedPassword, sponsorId, sponsorName]
    );

    // Store referral source if provided
    if (referralSource) {
      await execute(env,
        "UPDATE workers SET referral_source = ? WHERE worker_id = ?",
        [referralSource, workerId]
      ).catch(() => {});
    }

    // Log attribution
    const attributionChannel = utmSource || referralSource || "direct";
    await execute(env,
      `INSERT INTO attribution_log (worker_id, channel, utm_source, utm_medium, utm_campaign, referrer, landing_page, first_visit_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [workerId, attributionChannel, utmSource || null, utmMedium || null, utmCampaign || null, null, null]
    ).catch(() => {});

    await execute(env,
      `INSERT INTO affiliate_tree (worker_id, parent_id, sponsor_id, level_number, position)
       VALUES (?, ?, ?, 1, 0)`,
      [workerId, sponsorId, sponsorId]
    );

    if (sponsorId) {
      await execute(env,
        "UPDATE workers SET total_team_members = total_team_members + 1 WHERE worker_id = ?",
        [sponsorId]
      );
    }

    // Auto-award resource income on registration
    try {
      const incomeSetting = await query<{ setting_value: string }>(
        env, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_income_default_amount'"
      );
      if (incomeSetting.length > 0) {
        const amount = parseFloat(incomeSetting[0].setting_value) || 0;
        if (amount > 0) {
          await execute(env,
            "UPDATE workers SET resource_income = resource_income + ?, resource_income_original = resource_income_original + ? WHERE worker_id = ?",
            [amount, amount, workerId]
          );
        }
      }
    } catch {}

    const token = await generateToken(workerId, getJwtSecret());
    return NextResponse.json({ token, workerId, name: displayName }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
