import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  if (!workerId) {
    return NextResponse.json({ error: "workerId required" }, { status: 400 });
  }

  try {
    const worker = await queryFirst<{
      worker_id: string; name: string; phone: string; email: string;
      sponsor_id: string; sponsor_name: string; level: number;
      join_date: string; balance: number; total_earned: number;
      total_spent: number; total_team_members: number; membership_status: string;
    }>(
      await getDB(),
      `SELECT worker_id, name, phone, email, sponsor_id, sponsor_name,
              level, join_date, balance, total_earned, total_spent,
              total_team_members, membership_status
       FROM workers WHERE worker_id = ?`,
      [workerId]
    );

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({
      workerId: worker.worker_id,
      name: worker.name,
      phone: worker.phone,
      email: worker.email,
      sponsorId: worker.sponsor_id,
      sponsorName: worker.sponsor_name,
      level: worker.level,
      joinDate: worker.join_date,
      balance: worker.balance,
      totalEarned: worker.total_earned,
      totalSpent: worker.total_spent,
      totalTeamMembers: worker.total_team_members,
      membershipStatus: worker.membership_status,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { workerId, name, email, password } = await request.json() as {
      workerId: string; name?: string; email?: string; password?: string;
    };
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const env = await getDB();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (email !== undefined) { updates.push("email = ?"); params.push(email || null); }
    if (password) {
      const hashed = await hashWorkerPassword(password);
      updates.push("password = ?");
      params.push(hashed);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    params.push(workerId);

    await execute(env,
      `UPDATE workers SET ${updates.join(", ")} WHERE worker_id = ?`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
