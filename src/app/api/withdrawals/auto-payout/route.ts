import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const env = await getDB();

    // Only allowed when payment_system_active = 0 (auto-payout mode)
    const paySetting = await query<{ setting_value: string }>(
      env, "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_system_active'"
    );
    if (paySetting.length > 0 && paySetting[0].setting_value !== "0") {
      return NextResponse.json({ error: "Auto-payout only available when payment system is disabled" }, { status: 400 });
    }

    // Get all workers with balance > 0
    const workers = await query<{ worker_id: string; name: string; phone: string; balance: number }>(
      env, "SELECT worker_id, name, phone, balance FROM workers WHERE balance > 0"
    );

    let processed = 0;
    let errors = 0;

    for (const w of workers) {
      try {
        // Find default saved account
        const accounts = await query<{ id: number; account_type: string; account_number: string }>(
          env, "SELECT id, account_type, account_number FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, id ASC LIMIT 1",
          [w.worker_id]
        );

        const hasAccount = accounts.length > 0;
        const accountType = hasAccount ? accounts[0].account_type : "bkash";
        const accountNumber = hasAccount ? accounts[0].account_number : null;

        const withdrawalId = `AUTO${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        await execute(env,
          `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, currency, payment_method, account_number, status, processed_at)
           VALUES (?, ?, ?, 'BDT', ?, ?, 'completed', datetime('now'))`,
          [withdrawalId, w.worker_id, w.balance, accountType, accountNumber]
        );

        // Deduct balance
        await execute(env,
          "UPDATE workers SET balance = 0 WHERE worker_id = ?",
          [w.worker_id]
        );

        processed++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      totalWorkers: workers.length,
      message: `Auto-payout completed for ${processed} workers${errors > 0 ? `, ${errors} errors` : ""}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
