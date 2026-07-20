import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();
    const rows = await query<any>(db, `SELECT w.worker_id as workerId, w.name, w.phone,
      COALESCE((SELECT SUM(c.total_amount) FROM commissions c WHERE c.to_worker_id = w.worker_id AND c.status = 'paid'), 0) -
      COALESCE((SELECT SUM(wd.final_amount) FROM withdrawals wd WHERE wd.worker_id = w.worker_id AND wd.status = 'completed'), 0) as balance,
      sa.id as accountId, sa.account_type as accountType, sa.account_number as accountNumber
      FROM workers w
      LEFT JOIN saved_accounts sa ON sa.worker_id = w.worker_id AND sa.is_default = 1
      WHERE w.membership_status = 'premium'
      HAVING balance >= 20
      ORDER BY balance DESC LIMIT 100`);
    return NextResponse.json({ members: rows });
  } catch {
    return NextResponse.json({ members: [] });
  }
}
