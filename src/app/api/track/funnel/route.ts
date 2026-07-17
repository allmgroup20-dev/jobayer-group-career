import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = await ensureDB();

    // ── Funnel Stages ──
    const [totalWorkers, totalVisits, totalSearches, totalProductViews, totalAddToCart, totalPurchases] = await Promise.all([
      db.prepare("SELECT COUNT(DISTINCT worker_id) as c FROM user_events WHERE worker_id != ''").bind().first() as Promise<{ c: number }>,
      db.prepare("SELECT COUNT(DISTINCT worker_id) as c FROM user_events WHERE event_type = 'page_view' AND worker_id != ''").bind().first() as Promise<{ c: number }>,
      db.prepare("SELECT COUNT(DISTINCT worker_id) as c FROM user_events WHERE event_type IN ('search', 'product_view') AND worker_id != ''").bind().first() as Promise<{ c: number }>,
      db.prepare("SELECT COUNT(DISTINCT worker_id) as c FROM user_events WHERE event_type = 'product_view' AND worker_id != ''").bind().first() as Promise<{ c: number }>,
      db.prepare("SELECT COUNT(DISTINCT worker_id) as c FROM user_events WHERE event_type = 'add_to_cart' AND worker_id != ''").bind().first() as Promise<{ c: number }>,
      db.prepare("SELECT COUNT(DISTINCT w.worker_id) as c FROM workers w INNER JOIN orders o ON w.worker_id = o.worker_id WHERE o.payment_status = 'completed'").bind().first() as Promise<{ c: number }>,
    ]);

    const total = totalWorkers?.c || 0;
    const funnel = [
      { stage: "visit", label: "Visit", users: totalVisits?.c || 0, color: "#3b82f6" },
      { stage: "interest", label: "Interest (Search/View)", users: totalSearches?.c || 0, color: "#8b5cf6" },
      { stage: "product_view", label: "Product View", users: totalProductViews?.c || 0, color: "#f59e0b" },
      { stage: "add_to_cart", label: "Add to Cart", users: totalAddToCart?.c || 0, color: "#f97316" },
      { stage: "purchase", label: "Purchase", users: totalPurchases?.c || 0, color: "#22c55e" },
    ];

    const funnelWithRate = funnel.map((f, i) => ({
      ...f,
      conversionRate: i === 0 ? (total > 0 ? Math.round((f.users / total) * 100) : 0) : (funnel[i - 1].users > 0 ? Math.round((f.users / funnel[i - 1].users) * 100) : 0),
      overallRate: total > 0 ? Math.round((f.users / total) * 100) : 0,
    }));

    // ── Weekly Cohort Analysis ──
    const cohortData = await db.prepare(`
      SELECT 
        strftime('%Y-W%W', w.created_at) as cohort_week,
        w.worker_id,
        w.created_at as joined_at
      FROM workers w
      WHERE w.membership_status = 'active' AND w.created_at IS NOT NULL
      ORDER BY w.created_at
    `).bind().all() as { results: { cohort_week: string; worker_id: string; joined_at: string }[] };

    // Group by cohort week
    const cohorts: Record<string, { total: number; weeklyActivity: Record<string, number> }> = {};
    for (const row of cohortData.results) {
      if (!cohorts[row.cohort_week]) cohorts[row.cohort_week] = { total: 0, weeklyActivity: {} };
      cohorts[row.cohort_week].total++;
    }

    // For each cohort, count how many were active in subsequent weeks
    const cohortWeeks = Object.keys(cohorts).sort();
    for (const cohortWeek of cohortWeeks) {
      const { results: activity } = await db.prepare(`
        SELECT strftime('%Y-W%W', e.created_at) as activity_week, COUNT(DISTINCT e.worker_id) as active_users
        FROM user_events e
        INNER JOIN workers w ON e.worker_id = w.worker_id
        WHERE strftime('%Y-W%W', w.created_at) = ? AND e.created_at IS NOT NULL
        GROUP BY activity_week
        ORDER BY activity_week
      `).bind(cohortWeek).all() as { results: { activity_week: string; active_users: number }[] };

      for (const a of activity) {
        cohorts[cohortWeek].weeklyActivity[a.activity_week] = a.active_users;
      }
    }

    const cohortAnalysis = cohortWeeks.slice(-12).map(cw => ({
      cohortWeek: cw,
      totalUsers: cohorts[cw].total,
      retention: cohortWeeks.filter(w => w >= cw).map(w => ({
        week: w,
        activeUsers: cohorts[cw].weeklyActivity[w] || 0,
        retentionRate: cohorts[cw].total > 0 ? Math.round(((cohorts[cw].weeklyActivity[w] || 0) / cohorts[cw].total) * 100) : 0,
      })),
    }));

    // ── Channel Attribution ──
    const channelData = await db.prepare(`
      SELECT channel, COUNT(*) as count,
        SUM(CASE WHEN converted = 1 THEN 1 ELSE 0 END) as conversions
      FROM attribution_log
      GROUP BY channel
      ORDER BY count DESC
    `).bind().all() as { results: { channel: string; count: number; conversions: number }[] };

    // ── Top referrers ──
    const referrerData = await db.prepare(`
      SELECT referrer, COUNT(*) as count
      FROM user_sessions
      WHERE referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `).bind().all() as { results: { referrer: string; count: number }[] };

    return NextResponse.json({
      funnel: funnelWithRate,
      totalWorkers: total,
      cohortAnalysis,
      channelAttribution: channelData.results || [],
      topReferrers: referrerData.results || [],
    });
  } catch (err) {
    console.error("Funnel analytics error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
