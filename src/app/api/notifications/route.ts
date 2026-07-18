import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);

    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();
    let query = "SELECT id, worker_id, title, message, type, link, is_read, created_at FROM notifications WHERE worker_id = ?";
    const params: unknown[] = [workerId];
    if (unreadOnly) { query += " AND is_read = 0"; }
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const { results: notifications } = await db.prepare(query).bind(...params).all() as { results: any[] };

    const unread = await db.prepare(
      "SELECT COUNT(*) as c FROM notifications WHERE worker_id = ? AND is_read = 0"
    ).bind(workerId).first() as { c: number } | undefined;

    return NextResponse.json({ notifications: notifications || [], unreadCount: unread?.c || 0 });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { workerId, title, message, type, link } = body;

    if (!workerId || !title) {
      return NextResponse.json({ error: "workerId and title required" }, { status: 400 });
    }

    const db = await ensureDB();
    await db.prepare(
      "INSERT INTO notifications (worker_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)"
    ).bind(workerId, title, message || null, type || "info", link || null).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notifications POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
