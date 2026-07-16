import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword, generateToken, generateWorkerId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, referralCode } = await request.json() as { name?: string; phone: string; password: string; referralCode?: string };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }
    const displayName = name || `User${phone.slice(-6)}`;

    const env = await getDB();

    const existing = await queryFirst<{ worker_id: string }>(
      env, "SELECT worker_id FROM workers WHERE phone = ?", [phone]
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

    const workerId = generateWorkerId(displayName, phone);
    const hashedPassword = await hashWorkerPassword(password);

    await execute(env,
      `INSERT INTO workers (worker_id, name, phone, password, sponsor_id, sponsor_name, level, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), 'active')`,
      [workerId, displayName, phone, hashedPassword, sponsorId, sponsorName]
    );

    await execute(env,
      `INSERT INTO mlm_tree (worker_id, parent_id, sponsor_id, level_number, position)
       VALUES (?, ?, ?, 1, 0)`,
      [workerId, sponsorId, sponsorId]
    );

    if (sponsorId) {
      await execute(env,
        "UPDATE workers SET total_team_members = total_team_members + 1 WHERE worker_id = ?",
        [sponsorId]
      );
    }

    const token = generateToken(workerId, process.env.JWT_SECRET || "default-secret");
    return NextResponse.json({ token, workerId, name: displayName }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
