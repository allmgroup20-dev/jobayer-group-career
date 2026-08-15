import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { execute, batch } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { interests } = await request.json() as { interests?: string[] };
    const list = Array.isArray(interests) ? interests.slice(0, 20) : [];

    const env = await getDB();

    // Log each interest as a search/interest event (same pattern as onboarding).
    const stmts = list.map((interest) => ({
      sql: `INSERT INTO user_events (worker_id, event_type, page_url, page_category, search_keyword, created_at)
            VALUES (?, 'search', '/onboarding', 'onboarding', ?, datetime('now'))`,
      params: [workerId, interest],
    }));
    if (stmts.length > 0) {
      await batch(env, stmts).catch(() => {});
    }

    // Store interest scores in the user_interests table.
    if (list.length > 0) {
      const existing = await env.DB.prepare("SELECT category_scores, top_categories FROM user_interests WHERE worker_id = ?").bind(workerId).first() as
        { category_scores?: string; top_categories?: string } | null;
      const scores: Record<string, number> = {};
      try { Object.assign(scores, existing?.category_scores ? JSON.parse(existing.category_scores) : {}); } catch {}
      for (const interest of list) {
        scores[interest] = (scores[interest] || 0) + 1;
      }
      const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
      if (existing) {
        await execute(env,
          "UPDATE user_interests SET category_scores = ?, top_categories = ?, last_calculated_at = datetime('now'), updated_at = datetime('now') WHERE worker_id = ?",
          [JSON.stringify(scores), JSON.stringify(top), workerId]
        ).catch(() => {});
      } else {
        await execute(env,
          "INSERT INTO user_interests (worker_id, category_scores, top_categories, last_calculated_at, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'), datetime('now'))",
          [workerId, JSON.stringify(scores), JSON.stringify(top)]
        ).catch(() => {});
      }
    }

    await execute(env,
      "UPDATE workers SET interests_updated_at = datetime('now') WHERE worker_id = ?",
      [workerId]
    ).catch(() => {});

    return NextResponse.json({ success: true, count: list.length });
  } catch (error) {
    console.error("Interests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
