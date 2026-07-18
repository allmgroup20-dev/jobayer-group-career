import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();
    const { results: prefs } = await db.prepare(
      "SELECT id, worker_id, channel, category, enabled, updated_at FROM notification_preferences WHERE worker_id = ? ORDER BY channel, category"
    ).bind(workerId).all() as { results: any[] };

    return NextResponse.json({ preferences: prefs || [] });
  } catch (err) {
    console.error("Notification prefs GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { workerId, channel, category, enabled } = body;

    if (!workerId || !channel || !category || enabled === undefined) {
      return NextResponse.json({ error: "workerId, channel, category, enabled required" }, { status: 400 });
    }

    const db = await ensureDB();
    await db.prepare(
      "INSERT INTO notification_preferences (worker_id, channel, category, enabled, updated_at) VALUES (?, ?, ?, ?, datetime('now')) ON CONFLICT DO NOTHING"
    ).bind(workerId, channel, category, enabled ? 1 : 0).run();

    await db.prepare(
      "UPDATE notification_preferences SET enabled = ?, updated_at = datetime('now') WHERE worker_id = ? AND channel = ? AND category = ?"
    ).bind(enabled ? 1 : 0, workerId, channel, category).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification prefs PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
