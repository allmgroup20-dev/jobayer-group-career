import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();

    const [worker, events, sessions, searches, interests, behavior, orders, reviews, devices, comms, consents] = await Promise.all([
      db.prepare("SELECT * FROM workers WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT * FROM user_events WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM user_sessions WHERE worker_id = ? ORDER BY created_at DESC LIMIT 100").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM user_searches WHERE worker_id = ? ORDER BY created_at DESC LIMIT 100").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM user_interests WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT * FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT * FROM orders WHERE worker_id = ? ORDER BY created_at DESC").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM product_reviews WHERE worker_id = ? ORDER BY created_at DESC").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM user_devices WHERE worker_id = ?").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM communication_history WHERE worker_id = ? ORDER BY created_at DESC LIMIT 500").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT * FROM privacy_consent WHERE worker_id = ?").bind(workerId).all() as Promise<any>,
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      worker,
      events: events?.results || [],
      sessions: sessions?.results || [],
      searches: searches?.results || [],
      interests,
      behavior,
      orders: orders?.results || [],
      reviews: reviews?.results || [],
      devices: devices?.results || [],
      communications: comms?.results || [],
      consents: consents?.results || [],
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error("Data export error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
