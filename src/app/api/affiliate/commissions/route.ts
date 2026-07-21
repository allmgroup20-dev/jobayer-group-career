import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const sql = workerId
      ? `SELECT c.id, c.from_worker_id, c.to_worker_id, c.total_amount as amount, c.percentage as rate, c.status, c.order_id, c.created_at, w.name as from_name FROM commissions c 
         LEFT JOIN workers w ON c.from_worker_id = w.worker_id 
         WHERE c.to_worker_id = ? ORDER BY c.created_at DESC LIMIT 50`
      : `SELECT c.id, c.from_worker_id, c.to_worker_id, c.total_amount as amount, c.percentage as rate, c.status, c.order_id, c.created_at, w.name as from_name FROM commissions c 
         LEFT JOIN workers w ON c.from_worker_id = w.worker_id 
         ORDER BY c.created_at DESC LIMIT 50`;

    const params = workerId ? [workerId] : [];
    const commissions = await query(await getDB(), sql, params);

    return NextResponse.json({ commissions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
