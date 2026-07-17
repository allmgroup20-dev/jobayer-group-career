import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");

    if (workerId) {
      const db = await ensureDB();

      const [interests, behavior, eventCount, recentEvents] = await Promise.all([
        db.prepare("SELECT category_scores, top_categories, last_calculated_at FROM user_interests WHERE worker_id = ?").bind(workerId).first() as Promise<{ category_scores: string; top_categories: string; last_calculated_at: string } | undefined>,
        db.prepare("SELECT * FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).first() as Promise<Record<string, unknown> | undefined>,
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

    const db = await ensureDB();

    const [segments, totalWorkers, topInterests, eventStats, totalEvents] = await Promise.all([
      db.prepare("SELECT segment, COUNT(*) as count FROM user_behavior_scores GROUP BY segment ORDER BY count DESC").bind().all() as Promise<{ results: { segment: string; count: number }[] }>,
      db.prepare("SELECT COUNT(*) as c FROM workers WHERE membership_status = 'active'").bind().first() as Promise<{ c: number } | undefined>,
      db.prepare("SELECT category_scores FROM user_interests WHERE category_scores IS NOT NULL AND category_scores != '{}'").bind().all() as Promise<{ results: { category_scores: string }[] }>,
      db.prepare("SELECT event_type, COUNT(*) as count FROM user_events GROUP BY event_type ORDER BY count DESC").bind().all() as Promise<{ results: { event_type: string; count: number }[] }>,
      db.prepare("SELECT COUNT(*) as c FROM user_events").bind().first() as Promise<{ c: number } | undefined>,
    ]);

    const interestAgg: Record<string, { total: number; count: number }> = {};
    for (const row of topInterests.results) {
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

    const scored = segments.results.reduce((s, r) => s + r.count, 0);
    const segmentData = segments.results.map(r => ({ segment: r.segment, count: r.count }));
    if (totalWorkers && totalWorkers.c > scored) {
      segmentData.push({ segment: "unscored", count: totalWorkers.c - scored });
    }

    return NextResponse.json({
      segments: segmentData,
      totalWorkers: totalWorkers?.c || 0,
      topInterestCategories,
      eventStats: eventStats.results || [],
      totalEvents: totalEvents?.c || 0,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
