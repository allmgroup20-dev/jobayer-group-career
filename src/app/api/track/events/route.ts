import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { workerId: string; events: Record<string, unknown>[] };
    if (!body.workerId || !body.events?.length) {
      return NextResponse.json({ error: "workerId and events required" }, { status: 400 });
    }
    const db = await ensureDB();
    const stmt = db.prepare(
      `INSERT INTO user_events (worker_id, event_type, page_url, page_category, search_keyword, product_id, product_category, time_spent_seconds, device_info, session_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const ev of body.events) {
      await stmt.bind(
        body.workerId,
        ev.eventType || "",
        ev.pageUrl || null,
        ev.pageCategory || null,
        ev.searchKeyword || null,
        ev.productId || null,
        ev.productCategory || null,
        ev.timeSpentSeconds || null,
        ev.deviceInfo || null,
        ev.sessionId || null,
        ev.metadata ? JSON.stringify(ev.metadata) : null
      ).run();
    }
    const count = await db.prepare(
      "SELECT COUNT(*) as c FROM user_events WHERE worker_id = ?"
    ).bind(body.workerId).first() as { c: number } | undefined;
    if (count && count.c % 10 === 0) {
      const { computeWorkerInterests, computeWorkerBehaviorScore } = await import("@/lib/tracking/scoring");
      computeWorkerInterests(body.workerId).catch(() => {});
      computeWorkerBehaviorScore(body.workerId).catch(() => {});
    }
    return NextResponse.json({ ok: true, count: body.events.length });
  } catch (err) {
    console.error("Batch events error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    const eventType = req.nextUrl.searchParams.get("eventType");
    const search = req.nextUrl.searchParams.get("search");
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get("limit") || "30"));
    const offset = (page - 1) * limit;

    const db = await ensureDB();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (workerId) { conditions.push("worker_id = ?"); params.push(workerId); }
    if (eventType) { conditions.push("event_type = ?"); params.push(eventType); }
    if (search) {
      conditions.push("created_at > datetime('now', '-30 days')");
      conditions.push("(page_url LIKE ? OR search_keyword LIKE ? OR page_category LIKE ?)");
      const p = `%${search}%`;
      params.push(p, p, p);
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const allParams = [...params];
    const countParams = [...params];

    const [rows, countResult] = await Promise.all([
      db.prepare(`SELECT id, worker_id, event_type, page_url, page_category, search_keyword, product_id, product_category, time_spent_seconds, device_info, session_id, metadata, created_at FROM user_events ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...allParams, limit, offset).all() as Promise<{ results: Record<string, unknown>[] }>,
      db.prepare(`SELECT COUNT(*) as count FROM user_events ${where}`).bind(...countParams).first() as Promise<{ count: number } | undefined>,
    ]);

    return NextResponse.json({
      events: rows.results || [],
      total: countResult?.count || 0,
      page, limit,
    });
  } catch (err) {
    console.error("Events list error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
