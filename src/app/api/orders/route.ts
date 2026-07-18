import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { workerId, productId, productName, quantity, totalAmount, currency, paymentMethod } = await request.json() as { workerId: string; productId?: string; productName?: string; quantity?: number; totalAmount: number; currency?: string; paymentMethod?: string };
    const env = await getDB();
    const orderId = generateId("ORD");

    await execute(env,
      `INSERT INTO orders (order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [orderId, workerId, productId || null, productName || null, quantity || 1, totalAmount, currency || "BDT", paymentMethod || null]
    );

    await execute(env,
      "UPDATE workers SET total_spent = total_spent + ? WHERE worker_id = ?",
      [totalAmount, workerId]
    );

    return NextResponse.json({ orderId, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const sql = workerId
      ? "SELECT id, order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, commission_status, order_status, shipping_address, transaction_id, created_at FROM orders WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20"
      : "SELECT id, order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, commission_status, order_status, shipping_address, transaction_id, created_at FROM orders ORDER BY created_at DESC LIMIT 50";

    const params = workerId ? [workerId] : [];
    const orders = await query(await getDB(), sql, params);

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
