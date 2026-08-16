import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { batch, execute, query, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { events } = await request.json() as { events?: Record<string, any>[] };
    const list = Array.isArray(events) ? events.slice(0, 100) : [];
    if (list.length === 0) {
      return NextResponse.json({ error: "No events" }, { status: 400 });
    }

    const country = request.headers.get("cf-ipcountry") || null;
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;

    const env = await getDB();

    const stmts = list.map((ev) => {
      const extra: Record<string, unknown> = { ...(ev.metadata || {}) };
      if (country) extra.country = country;
      if (ip) extra.ip = ip;
      const metadata = Object.keys(extra).length > 0 ? JSON.stringify(extra) : null;
      return {
        sql: `INSERT INTO user_events (worker_id, event_type, page_url, page_category, search_keyword, product_id, product_category, time_spent_seconds, device_info, session_id, metadata, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        params: [
          workerId,
          ev.eventType || "event",
          ev.pageUrl || null,
          ev.pageCategory || null,
          ev.searchKeyword || null,
          ev.productId || null,
          ev.productCategory || null,
          typeof ev.timeSpentSeconds === "number" ? ev.timeSpentSeconds : null,
          ev.deviceInfo || null,
          ev.sessionId || null,
          metadata,
        ],
      };
    });

    await batch(env, stmts).catch(() => {});

    const count = await queryFirst<{ c: number }>(
      env, "SELECT COUNT(*) as c FROM user_events WHERE worker_id = ?", [workerId]
    ).catch(() => null);
    if (count && count.c > 0 && count.c % 10 === 0) {
      recomputeInterests(env, workerId).catch(() => {});
    }

    return NextResponse.json({ success: true, count: list.length });
  } catch (error) {
    console.error("Track events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function recomputeInterests(env: { DB: D1Database }, workerId: string) {
  const rows = await query<{ search_keyword: string | null; page_category: string | null; product_category: string | null }>(
    env,
    `SELECT search_keyword, page_category, product_category FROM user_events
     WHERE worker_id = ? AND created_at IS NOT NULL ORDER BY created_at DESC LIMIT 500`,
    [workerId]
  ).catch(() => []);

  const scores: Record<string, number> = {};
  for (const r of rows) {
    for (const key of [r.search_keyword, r.page_category, r.product_category]) {
      if (key) scores[key] = (scores[key] || 0) + 1;
    }
  }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);

  const existing = await queryFirst<{ category_scores: string | null }>(
    env, "SELECT category_scores FROM user_interests WHERE worker_id = ?", [workerId]
  ).catch(() => null);

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