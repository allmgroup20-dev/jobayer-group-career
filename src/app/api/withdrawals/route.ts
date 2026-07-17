import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { sendWhatsAppMessage, generateWhatsAppTemplate } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
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

    const worker = await query<{ worker_id: string; balance: number; name: string; phone: string; membership_status: string }>(
      env, "SELECT worker_id, balance, name, phone, membership_status FROM workers WHERE worker_id = ?", [workerId]
    );

    if (!worker || worker.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    if (worker[0].balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Membership-based min withdrawal check
    const isPremium = worker[0].membership_status === "premium";
    const minSetting = await query<{ setting_value: string }>(
      env, `SELECT setting_value FROM company_settings WHERE setting_key = ?`,
      [isPremium ? "min_withdrawal_premium" : "min_withdrawal"]
    );
    const minAmount = minSetting.length > 0 ? parseFloat(minSetting[0].setting_value) : (isPremium ? 200 : 500);
    if (amount < minAmount) {
      return NextResponse.json({ error: `Minimum withdrawal is ৳${minAmount}` }, { status: 400 });
    }

    const status = isAutoMode ? "completed" : "pending";
    const processedAt = isAutoMode ? "datetime('now')" : "NULL";

    const withdrawalId = `WTH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await execute(env,
      `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, currency, payment_method, account_number, status, processed_at)
       VALUES (?, ?, ?, 'BDT', ?, ?, ?, ${processedAt})`,
      [withdrawalId, workerId, amount, paymentMethod || "bkash", accountNumber || null, status]
    );

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
    const { withdrawalId, status } = await request.json() as {
      withdrawalId: string; status: string;
    };
    if (!withdrawalId || !status) {
      return NextResponse.json({ error: "withdrawalId and status required" }, { status: 400 });
    }
    if (!["completed", "rejected", "processing"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const env = await getDB();
    await execute(env,
      `UPDATE withdrawals SET status = ?, processed_at = datetime('now') WHERE withdrawal_id = ?`,
      [status, withdrawalId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const sql = workerId
      ? "SELECT * FROM withdrawals WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20"
      : "SELECT * FROM withdrawals ORDER BY created_at DESC LIMIT 50";
    const params = workerId ? [workerId] : [];
    const withdrawals = await query(await getDB(), sql, params);
    return NextResponse.json({ withdrawals });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
