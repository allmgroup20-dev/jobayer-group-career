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

    // Resolve the course so we can enforce per-resource rules server-side.
    const course = await queryFirst<{ id: number; is_premium: number }>(
      db, "SELECT id, is_premium FROM courses WHERE id = ?", [body.courseId]
    );
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.is_premium === 1) {
      // C4: price resolved server-side from company settings, never hardcoded
      const settingsRow = await queryFirst<{ setting_value: string }>(
        db, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_unlock_price'"
      );
      const unlockPrice = Number(settingsRow?.setting_value);
      if (!Number.isFinite(unlockPrice) || unlockPrice <= 0) {
        return NextResponse.json({ error: "Resource unlock price not configured" }, { status: 500 });
      }
      if (body.useResourceIncome) {
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
        const orderId = `RI${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        await execute(db,
          `INSERT INTO resource_purchases (order_id, worker_id, course_id, amount, resource_count, payment_status, completed_at)
           VALUES (?, ?, ?, ?, 1, 'completed', datetime('now'))`,
          [orderId, body.workerId, course.id, unlockPrice]
        );
      } else {
        // Premium resource requires an actual purchase — premium badge alone grants nothing.
        const purchase = await queryFirst<{ id: number }>(
          db, `SELECT id FROM resource_purchases
               WHERE worker_id = ? AND course_id = ? AND payment_status = 'completed' LIMIT 1`,
          [body.workerId, body.courseId]
        );
        if (!purchase) {
          return NextResponse.json(
            { error: `This resource is paid. Buy it (৳${unlockPrice}) or pay with resource income to unlock.` },
            { status: 403 }
          );
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
