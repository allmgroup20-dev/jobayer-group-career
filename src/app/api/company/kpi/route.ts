import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export const TARGET_REVENUE = 100000000; // ৳10 crore

export async function GET() {
  try {
    const cached = await getCached<any>("company:kpi", 60);
    if (cached) {
      const resp = NextResponse.json(cached);
      resp.headers.set("Cache-Control", "public, s-maxage=45, stale-while-revalidate=120");
      return resp;
    }

    const db = await getDB();

    const users = await query<any>(db, "SELECT COUNT(*) as c FROM workers WHERE membership_status IN ('general', 'premium')");
    const sales = await query<any>(db, "SELECT COUNT(*) as c, COALESCE(SUM(total_amount),0) as s FROM orders WHERE payment_status = 'completed'");
    const events = await query<any>(db, "SELECT COUNT(*) as c FROM user_events WHERE event_type = 'checkout_started'");
    const commissions = await query<any>(db, "SELECT COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END),0) as paid, COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END),0) as pending FROM commissions");
    const referrers = await query<any>(db, "SELECT COUNT(DISTINCT to_worker_id) as c FROM commissions WHERE to_worker_id IS NOT NULL");
    const referrals = await query<any>(db, "SELECT COUNT(*) as c FROM commissions WHERE to_worker_id IS NOT NULL");

    const userCount = firstInt(users);
    const salesCount = firstInt(sales);
    const revenue = firstNum(sales, "s");
    const checkoutCount = firstInt(events);
    const refUsers = firstInt(referrers);
    const refTotal = firstInt(referrals);

    const viralK = userCount && refUsers ? refUsers / userCount : 0;
    const avgOrder = salesCount ? revenue / salesCount : 0;
    const funnelRate = checkoutCount ? salesCount / checkoutCount : 0;
    const progress = revenue / TARGET_REVENUE;

    const result = {
      targetRevenue: TARGET_REVENUE,
      users: { total: userCount, referrers: refUsers, referralRate: userCount ? refUsers / userCount : 0 },
      sales: { count: salesCount, revenue, avgOrder },
      commissions: { paid: firstNum(commissions, "paid"), pending: firstNum(commissions, "pending") },
      viral: { k: viralK, referrals: refTotal },
      funnel: { checkoutStarted: checkoutCount, completed: salesCount, conversionRate: funnelRate },
      progress,
      pct: progress * 100,
    };

    await setCached("company:kpi", result);
    const resp = NextResponse.json(result);
    resp.headers.set("Cache-Control", "public, s-maxage=45, stale-while-revalidate=120");
    return resp;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function firstInt(r: any[] | undefined): number {
  return Number((r && (r as any[])[0]?.c) || 0);
}

function firstNum(r: any[] | undefined, key: string): number {
  return Math.round(Number((r && (r as any[])[0]?.[key]) || 0));
}
