import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { requireWorker } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const unlocks = await query<any>(
      await getDB(),
      `SELECT u.id, u.worker_id as workerId, u.course_id as courseId, u.unlocked_at as unlockedAt, u.unlocked_by as unlockedBy
       FROM user_unlocks u WHERE u.worker_id = ? ORDER BY u.unlocked_at DESC LIMIT 100`,
      [workerId]
    );
    return NextResponse.json({ unlocks });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      workerId: string; courseId: number; unlockedBy?: string; useResourceIncome?: boolean;
    };
    if (!body.workerId || !body.courseId) {
      return NextResponse.json({ error: "workerId and courseId required" }, { status: 400 });
    }

    // C6: only the authenticated worker may unlock for themselves —
    // prevents draining another account's resource income or quota
    const payload = await requireWorker(request, body.workerId);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = await getDB();

    if (body.useResourceIncome) {
      // C4: price resolved server-side from company settings, never hardcoded
      const settingsRow = await queryFirst<{ setting_value: string }>(
        db, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_unlock_price'"
      );
      const unlockPrice = Number(settingsRow?.setting_value);
      if (!Number.isFinite(unlockPrice) || unlockPrice <= 0) {
        return NextResponse.json({ error: "Resource unlock price not configured" }, { status: 500 });
      }
      const worker = await queryFirst<{ resource_income: number }>(
        db, "SELECT resource_income FROM workers WHERE worker_id = ?", [body.workerId]
      );
      if (!worker || worker.resource_income < unlockPrice) {
        return NextResponse.json({ error: "Insufficient resource income" }, { status: 400 });
      }
      await execute(db,
        "UPDATE workers SET resource_income = resource_income - ? WHERE worker_id = ?",
        [unlockPrice, body.workerId]
      );
    } else {
      // Free unlock — check unlock limit
      const limit = await queryFirst<{ maxUnlocks: number }>(
        db, "SELECT max_unlocks as maxUnlocks FROM unlock_limits WHERE worker_id = ?", [body.workerId]
      );
      if (limit && limit.maxUnlocks > 0) {
        const count = await queryFirst<{ cnt: number }>(
          db, "SELECT COUNT(*) as cnt FROM user_unlocks WHERE worker_id = ?", [body.workerId]
        );
        if (count && count.cnt >= limit.maxUnlocks) {
          return NextResponse.json({ error: "Unlock limit reached. Use resource income to unlock more." }, { status: 403 });
        }
      }
    }

    await execute(db,
      `INSERT OR IGNORE INTO user_unlocks (worker_id, course_id, unlocked_by) VALUES (?, ?, ?)`,
      [body.workerId, body.courseId, body.unlockedBy || "user"]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
