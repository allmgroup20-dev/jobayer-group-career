import { NextRequest, NextResponse } from "next/server";
import { execute, query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { workerId: targetWorkerId, accountType, accountNumber } = body as {
      workerId?: string; accountType?: string; accountNumber?: string;
    };

    const env = await getDB();

    const paySetting = await query<{ setting_value: string }>(
      env, "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_system_active'"
    );
    const isSystemDisabled = paySetting.length > 0 && paySetting[0].setting_value === "0";

    if (targetWorkerId) {
      // Single worker payout (used by Premium Payout tab)
      const worker = await queryFirst<any>(env,
        `SELECT w.worker_id, w.name,
          COALESCE((SELECT SUM(c.total_amount) FROM commissions c WHERE c.to_worker_id = w.worker_id AND c.status = 'paid'), 0) -
          COALESCE((SELECT SUM(wd.final_amount) FROM withdrawals wd WHERE wd.worker_id = w.worker_id AND wd.status = 'completed'), 0) as bal
        FROM workers w WHERE w.worker_id = ? AND w.membership_status = 'premium'`,
        [targetWorkerId]
      );
      if (!worker || !worker.bal || worker.bal < 20) {
        return NextResponse.json({ error: "Not eligible" }, { status: 400 });
      }
      const accType = accountType || "bkash";
      const accNum = accountNumber || null;
      const wid = `PRM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await execute(env,
        `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, tax_amount, final_amount, currency, payment_method, account_number, status, processed_at)
         VALUES (?, ?, ?, 0, ?, 'BDT', ?, ?, 'completed', datetime('now'))`,
        [wid, targetWorkerId, worker.bal, worker.bal, accType, accNum]
      );
      return NextResponse.json({ success: true, workerId: targetWorkerId, amount: worker.bal, withdrawalId: wid });
    }

    // Bulk auto-payout (only when payment system is disabled)
    if (!isSystemDisabled) {
      return NextResponse.json({ error: "Auto-payout only available when payment system is disabled" }, { status: 400 });
    }

    const workers = await query<{ worker_id: string; name: string; phone: string; balance: number }>(
      env, "SELECT worker_id, name, phone, balance FROM workers WHERE balance > 0 LIMIT 200"
    );

    let processed = 0;
    let errors = 0;

    for (const w of workers) {
      try {
        const accounts = await query<{ id: number; account_type: string; account_number: string }>(
          env, "SELECT id, account_type, account_number FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, id ASC LIMIT 1",
          [w.worker_id]
        );
        const hasAccount = accounts.length > 0;
        const aType = hasAccount ? accounts[0].account_type : "bkash";
        const aNum = hasAccount ? accounts[0].account_number : null;
        const wid = `AUTO${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await execute(env,
          `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, tax_amount, final_amount, currency, payment_method, account_number, status, processed_at)
           VALUES (?, ?, ?, 0, ?, 'BDT', ?, ?, 'completed', datetime('now'))`,
          [wid, w.worker_id, w.balance, w.balance, aType, aNum]
        );
        await execute(env, "UPDATE workers SET balance = 0 WHERE worker_id = ?", [w.worker_id]);
        processed++;
      } catch { errors++; }
    }

    return NextResponse.json({
      success: true, processed, errors, totalWorkers: workers.length,
      message: `Auto-payout completed for ${processed} workers${errors > 0 ? `, ${errors} errors` : ""}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
