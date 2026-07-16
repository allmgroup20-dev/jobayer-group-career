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

    // Check if payment system is active
    const paySetting = await query<{ setting_value: string }>(
      env, "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_system_active'"
    );
    if (paySetting.length > 0 && paySetting[0].setting_value === "0") {
      return NextResponse.json({ error: "Payment system is currently disabled" }, { status: 400 });
    }

    const worker = await query<{ worker_id: string; balance: number; name: string; phone: string }>(
      env, "SELECT worker_id, balance, name, phone FROM workers WHERE worker_id = ?", [workerId]
    );

    if (!worker || worker.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    if (worker[0].balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const withdrawalId = `WTH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await execute(env,
      `INSERT INTO withdrawals (withdrawal_id, worker_id, amount, currency, payment_method, account_number, status)
       VALUES (?, ?, ?, 'BDT', ?, ?, 'pending')`,
      [withdrawalId, workerId, amount, paymentMethod || "bkash", accountNumber || null]
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
