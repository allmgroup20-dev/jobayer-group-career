import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "session id required" }, { status: 400 });

    const db = await ensureDB();

    const [session, events] = await Promise.all([
      db.prepare("SELECT id, worker_id, session_start, session_end, duration_seconds, ip_address, user_agent, device_type, browser, os, screen_resolution, referrer, city, country, timezone, language, utm_source, utm_campaign, created_at FROM user_sessions WHERE session_start = ?").bind(id).first() as Promise<any>,
      db.prepare(
        "SELECT event_type, page_url, page_category, time_spent_seconds, product_category, search_keyword, created_at FROM user_events WHERE session_id = ? ORDER BY created_at ASC"
      ).bind(id).all() as Promise<any>,
    ]);

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ session, events: events.results || [] });
  } catch (err) {
    console.error("Session detail error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
