import { NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();

    const totalRevenue = await queryFirst<{ s: number }>(
      db, "SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE payment_status = 'completed'"
    );
    const totalOrders = await queryFirst<{ c: number }>(
      db, "SELECT COUNT(*) as c FROM orders"
    );
    const completedOrders = await queryFirst<{ c: number }>(
      db, "SELECT COUNT(*) as c FROM orders WHERE payment_status = 'completed'"
    );
    const pendingOrders = await queryFirst<{ c: number }>(
      db, "SELECT COUNT(*) as c FROM orders WHERE payment_status = 'pending'"
    );

    const totalCommissions = await queryFirst<{ s: number }>(
      db, "SELECT COALESCE(SUM(total_amount), 0) as s FROM commissions WHERE status = 'paid'"
    );
    const pendingCommissions = await queryFirst<{ s: number }>(
      db, "SELECT COALESCE(SUM(total_amount), 0) as s FROM commissions WHERE status = 'pending'"
    );

    const totalWithdrawals = await queryFirst<{ s: number }>(
      db, "SELECT COALESCE(SUM(amount), 0) as s FROM withdrawals WHERE status = 'completed'"
    );
    const pendingWithdrawals = await queryFirst<{ s: number }>(
      db, "SELECT COALESCE(SUM(amount), 0) as s FROM withdrawals WHERE status = 'pending'"
    );

    const totalWorkers = await queryFirst<{ c: number }>(
      db, "SELECT COUNT(*) as c FROM workers WHERE membership_status = 'active'"
    );

    return NextResponse.json({
      revenue: { total: totalRevenue?.s || 0, completed: completedOrders?.c || 0, pending: pendingOrders?.c || 0 },
      orders: { total: totalOrders?.c || 0, completed: completedOrders?.c || 0, pending: pendingOrders?.c || 0 },
      commissions: { total: totalCommissions?.s || 0, pending: pendingCommissions?.s || 0 },
      withdrawals: { total: totalWithdrawals?.s || 0, pending: pendingWithdrawals?.s || 0 },
      workers: { active: totalWorkers?.c || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
