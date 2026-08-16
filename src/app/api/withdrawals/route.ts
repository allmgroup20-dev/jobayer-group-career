import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { sendWhatsAppMessage, generateWhatsAppTemplate } from "@/lib/whatsapp";
import { isFeatureEnabled } from "@/lib/features";

export async function POST(request: NextRequest) {
  try {
    if (!(await isFeatureEnabled("withdrawals"))) {
      return NextResponse.json({ error: "Withdrawals are currently disabled", disabled: true }, { status: 403 });
    }
    const { workerId, amount, paymentMethod, accountNumber } = await request.json() as {
      workerId: string; amount: number; paymentMethod?: string; accountNumber?: string;
    };

    if (!workerId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const env = await getDB();

    // Check payment system mode
    const paySetting = await query<{ setting_value: string }>(
      env, "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_system_active'"
    );
    const isAutoMode = paySetting.length > 0 && paySetting[0].setting_value === "0";

    const worker = await query<{ worker_id: string; balance: number; resource_income: number; name: string; phone: string; membership_status: string }>(
      env, "SELECT worker_id, balance, name, phone, membership_status, resource_income FROM workers WHERE worker_id = ?", [workerId]
    );

    if (!worker || worker.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Calculate real available balance: total earned commissions - amounts already requested (locked)
    const [earned, locked] = await Promise.all([
      query<{ total: number }>(env, "SELECT COALESCE(SUM(total_amount), 0) as total FROM commissions WHERE to_worker_id = ?", [workerId]),
      query<{ total: number }>(env, "SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE worker_id = ? AND status IN ('pending', 'processing', 'completed')", [workerId]),
    ]);
    const realBalance = Math.max(0, (earned[0]?.total || 0) - (locked[0]?.total || 0));

    if (realBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const isPremium = worker[0].membership_status === "premium";

    // Membership-based min withdrawal check
    const minSetting = await query<{ setting_value: string }>(
      env, `SELECT setting_value FROM company_settings WHERE setting_key = ?`,
      [isPremium ? "min_withdrawal_premium" : "min_withdrawal"]
    );
    const minAmount = minSetting.length > 0 ? parseFloat(minSetting[0].setting_value) : (isPremium ? 200 : 500);
    if (amount < minAmount) {
      return NextResponse.json({ error: `Minimum withdrawal is ৳${minAmount}` }, { status: 400 });
    }

    // Calculate tax for general members (premium members pay no tax)
    let taxAmount = 0;
    let finalAmount = amount;
    if (!isPremium) {
      const taxSetting = await query<{ setting_value: string }>(
        env, "SELECT setting_value FROM company_settings WHERE setting_key = 'general_member_withdrawal_tax_percent'"
      );
      const taxPercent = taxSetting.length > 0 ? parseFloat(taxSetting[0].setting_value) : 5;
      taxAmount = Math.round(amount * taxPercent / 100);
      finalAmount = amount - taxAmount;
    }

    const status = isAutoMode ? "completed" : "pending";
    const processedAt = isAutoMode ? "datetime('now')" : "NULL";

    const withdrawalId = `WTH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await execute(env,
      `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, tax_amount, final_amount, currency, payment_method, account_number, status, processed_at)
       VALUES (?, ?, ?, ?, ?, 'BDT', ?, ?, ?, ${processedAt})`,
      [withdrawalId, workerId, amount, taxAmount, finalAmount, paymentMethod || "bkash", accountNumber || null, status]
    );

    // Resource income is NOT deducted on withdrawal — it can only be used to unlock resources

    try {
      const apiKey = process.env.WHATSAPP_API_KEY || "";
      if (apiKey) {
        const message = generateWhatsAppTemplate(worker[0].name, "withdrawal");
        await sendWhatsAppMessage({ to: worker[0].phone, text: message }, apiKey);
      }
    } catch {}

    return NextResponse.json({ withdrawalId, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawalId, status, transactionId } = await request.json() as {
      withdrawalId: string; status: string; transactionId?: string;
    };
    if (!withdrawalId || !status) {
      return NextResponse.json({ error: "withdrawalId and status required" }, { status: 400 });
    }
    if (!["completed", "rejected", "processing"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const env = await getDB();
    const existing = await query<{ worker_id: string; amount: number; status: string }>(
      env, "SELECT worker_id, amount, status FROM withdrawals WHERE withdrawal_id = ?", [withdrawalId]
    );
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }
    const prevStatus = existing[0].status;
    const workerId = existing[0].worker_id;
    const amount = existing[0].amount;

    if (transactionId) {
      await execute(env, "UPDATE withdrawals SET transaction_id = ? WHERE withdrawal_id = ?", [transactionId, withdrawalId]);
    }

    await execute(env,
      `UPDATE withdrawals SET status = ?, processed_at = datetime('now') WHERE withdrawal_id = ?`,
      [status, withdrawalId]
    );

    // When a withdrawal is completed, mark the worker's pending commissions as paid (FIFO up to the withdrawn amount)
    if (status === "completed" && prevStatus !== "completed") {
      await markCommissionsPaid(env, workerId, amount);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function markCommissionsPaid(env: { DB: D1Database }, workerId: string, amount: number) {
  const pending = await query<{ id: number; total_amount: number }>(
    env,
    "SELECT id, total_amount FROM commissions WHERE to_worker_id = ? AND status = 'pending' ORDER BY created_at ASC, id ASC",
    [workerId]
  );
  let remaining = amount;
  for (const c of pending) {
    if (remaining <= 0) break;
    await execute(env, "UPDATE commissions SET status = 'paid' WHERE id = ?", [c.id]);
    remaining -= c.total_amount;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const sql = workerId
      ? `SELECT w.id, w.withdrawal_id as withdrawalId, w.worker_id as workerId, w.amount, w.tax_amount as taxAmount, w.final_amount as finalAmount, w.currency, w.payment_method as paymentMethod, w.account_number as accountNumber, w.transaction_id as transactionId, w.status, w.processed_at as processedAt, w.created_at as createdAt, wr.name as workerName
         FROM withdrawals w
         LEFT JOIN workers wr ON w.worker_id = wr.worker_id
         WHERE w.worker_id = ? ORDER BY w.created_at DESC LIMIT 20`
      : `SELECT w.id, w.withdrawal_id as withdrawalId, w.worker_id as workerId, w.amount, w.tax_amount as taxAmount, w.final_amount as finalAmount, w.currency, w.payment_method as paymentMethod, w.account_number as accountNumber, w.transaction_id as transactionId, w.status, w.processed_at as processedAt, w.created_at as createdAt, wr.name as workerName
         FROM withdrawals w
         LEFT JOIN workers wr ON w.worker_id = wr.worker_id
         WHERE w.created_at > datetime('now', '-6 months')
         ORDER BY w.created_at DESC LIMIT 50`;
    const params = workerId ? [workerId] : [];
    const withdrawals = await query(await getDB(), sql, params);
    return NextResponse.json({ withdrawals });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
