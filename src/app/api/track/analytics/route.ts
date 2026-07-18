import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    const allCustomers = req.nextUrl.searchParams.get("allCustomers");
    const allSessions = req.nextUrl.searchParams.get("allSessions");

    if (allSessions) {
      const db = await ensureDB();
      const { results: sessions } = await db.prepare(
        "SELECT id, worker_id, session_start, session_end, duration_seconds, ip_address, user_agent, device_type, browser, os, screen_resolution, referrer, city, country, timezone, language, utm_source, utm_campaign, created_at FROM user_sessions ORDER BY created_at DESC LIMIT 200"
      ).bind().all() as { results: any[] };
      return NextResponse.json({ sessions: sessions || [] });
    }

    if (allCustomers) {
      const cached = await getCached<any[]>("analytics:customers", 60);
      if (cached) return NextResponse.json({ customers: cached });

      const db = await ensureDB();
      const { results: customers } = await db.prepare(`
        SELECT w.worker_id, w.name, w.phone, w.email, w.membership_status,
               w.preferred_language, w.age_group, w.occupation, w.education_level, w.religion,
               w.join_date, w.total_spent, w.total_earned, w.created_at,
               bs.segment, bs.lead_score, bs.lifetime_value
        FROM workers w
        LEFT JOIN user_behavior_scores bs ON w.worker_id = bs.worker_id
        WHERE w.membership_status = 'active'
        ORDER BY w.created_at DESC
        LIMIT 1000
      `).bind().all() as { results: any[] };
      const data = customers || [];
      await setCached("analytics:customers", data);
      return NextResponse.json({ customers: data });
    }

    if (workerId) {
      const db = await ensureDB();

      const [interests, behavior, eventCount, recentEvents] = await Promise.all([
        db.prepare("SELECT category_scores, top_categories, last_calculated_at FROM user_interests WHERE worker_id = ?").bind(workerId).first() as Promise<{ category_scores: string; top_categories: string; last_calculated_at: string } | undefined>,
        db.prepare("SELECT id, worker_id, lead_score, churn_probability, purchase_intent, rfm_recency, rfm_frequency, rfm_monetary, segment, lifetime_value, last_updated FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).first() as Promise<Record<string, unknown> | undefined>,
        db.prepare("SELECT COUNT(*) as c FROM user_events WHERE worker_id = ?").bind(workerId).first() as Promise<{ c: number } | undefined>,
        db.prepare("SELECT event_type, page_category, created_at FROM user_events WHERE worker_id = ? ORDER BY created_at DESC LIMIT 10").bind(workerId).all() as Promise<{ results: { event_type: string; page_category: string | null; created_at: string }[] }>,
      ]);

      return NextResponse.json({
        interests: interests ? { categoryScores: JSON.parse(interests.category_scores), topCategories: JSON.parse(interests.top_categories), lastCalculatedAt: interests.last_calculated_at } : null,
        behavior,
        totalEvents: eventCount?.c || 0,
        recentEvents: recentEvents.results || [],
      });
    }

    const cached = await getCached<any>("analytics:overview", 60);
    if (cached) {
      const resp = NextResponse.json(cached);
      resp.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
      return resp;
    }

    const db = await ensureDB();

    const results = await db.batch([
      db.prepare("SELECT segment, COUNT(*) as count FROM user_behavior_scores GROUP BY segment ORDER BY count DESC"),
      db.prepare("SELECT COUNT(*) as c FROM workers WHERE membership_status = 'active'"),
      db.prepare("SELECT category_scores FROM user_interests WHERE category_scores IS NOT NULL AND category_scores != '{}' LIMIT 500"),
      db.prepare("SELECT event_type, COUNT(*) as count FROM user_events WHERE created_at >= datetime('now', '-7 days') GROUP BY event_type ORDER BY count DESC"),
      db.prepare("SELECT COUNT(*) as c FROM user_events WHERE created_at >= datetime('now', '-7 days')"),
      db.prepare(`SELECT
        COUNT(*) as total_scored,
        SUM(CASE WHEN churn_probability >= 50 THEN 1 ELSE 0 END) as churn_risk,
        SUM(CASE WHEN purchase_intent >= 60 THEN 1 ELSE 0 END) as high_intent,
        SUM(CASE WHEN lead_score >= 60 THEN 1 ELSE 0 END) as high_lead,
        SUM(CASE WHEN lifetime_value >= 5000 THEN 1 ELSE 0 END) as high_ltv,
        AVG(churn_probability) as avg_churn,
        AVG(purchase_intent) as avg_intent,
        AVG(lead_score) as avg_lead
      FROM user_behavior_scores`),
    ]);

    const segmentsBatch = results[0].results as { segment: string; count: number }[];
    const totalWorkersBatch = results[1].results as { c: number }[];
    const topInterestsBatch = results[2].results as { category_scores: string }[];
    const eventStatsBatch = results[3].results as { event_type: string; count: number }[];
    const totalEventsBatch = results[4].results as { c: number }[];
    const predictionStatsBatch = results[5].results as Record<string, any>[];

    const interestAgg: Record<string, { total: number; count: number }> = {};
    for (const row of topInterestsBatch) {
      try {
        const scores = JSON.parse(row.category_scores) as Record<string, number>;
        for (const [cat, score] of Object.entries(scores)) {
          if (!interestAgg[cat]) interestAgg[cat] = { total: 0, count: 0 };
          interestAgg[cat].total += score;
          interestAgg[cat].count++;
        }
      } catch {}
    }

    const topInterestCategories = Object.entries(interestAgg)
      .map(([cat, data]) => ({ category: cat, avgScore: Math.round(data.total / data.count), workerCount: data.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    const scored = segmentsBatch.reduce((s, r) => s + r.count, 0);
    const segmentData = segmentsBatch.map(r => ({ segment: r.segment, count: r.count }));
    const totalWorkersVal = totalWorkersBatch[0]?.c || 0;
    if (totalWorkersVal > scored) {
      segmentData.push({ segment: "unscored", count: totalWorkersVal - scored });
    }

    const result = {
      segments: segmentData,
      totalWorkers: totalWorkersVal,
      topInterestCategories,
      eventStats: eventStatsBatch || [],
      totalEvents: totalEventsBatch[0]?.c || 0,
      predictions: predictionStatsBatch[0] || { total_scored: 0, churn_risk: 0, high_intent: 0, high_lead: 0, high_ltv: 0, avg_churn: 0, avg_intent: 0, avg_lead: 0 },
    };
    await setCached("analytics:overview", result);
    const resp = NextResponse.json(result);
    resp.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return resp;
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
