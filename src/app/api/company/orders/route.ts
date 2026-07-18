import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;

  try {
    const db = await getDB();
    const conditions: string[] = [];
    const params: string[] = [];

    if (search) {
      conditions.push("o.created_at > datetime('now', '-3 months')");
      conditions.push("(o.order_id LIKE ? OR w.name LIKE ? OR w.phone LIKE ? OR o.product_name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      conditions.push("o.order_status = ?");
      params.push(status);
    }
    if (paymentStatus) {
      conditions.push("o.payment_status = ?");
      params.push(paymentStatus);
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const countResult = await query<{ total: number }>(
      db,
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN workers w ON o.worker_id = w.worker_id ${where}`,
      params.length ? params : undefined
    );
    const total = (countResult as any[])?.[0]?.total || 0;

    const orders = await query<any>(
      db,
      `SELECT o.id, o.order_id, o.worker_id, o.product_id, o.product_name, o.quantity, o.total_amount, o.currency, o.payment_method, o.payment_status, o.commission_status, o.order_status, o.created_at, w.name as worker_name, w.phone as worker_phone
       FROM orders o
       LEFT JOIN workers w ON o.worker_id = w.worker_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      params.length ? [...params, String(limit), String(offset)] : [String(limit), String(offset)]
    );

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, orderStatus, paymentStatus, commissionStatus } = await request.json() as {
      orderId: string; orderStatus?: string; paymentStatus?: string; commissionStatus?: string;
    };
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const db = await getDB();
    const updates: string[] = [];
    const params: string[] = [];

    if (orderStatus) { updates.push("order_status = ?"); params.push(orderStatus); }
    if (paymentStatus) { updates.push("payment_status = ?"); params.push(paymentStatus); }
    if (commissionStatus) { updates.push("commission_status = ?"); params.push(commissionStatus); }

    if (updates.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    params.push(orderId);
    await execute(db, `UPDATE orders SET ${updates.join(", ")} WHERE order_id = ?`, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
