import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { workerId, confirm } = body;

    if (!workerId || confirm !== true) {
      return NextResponse.json({ error: "workerId and confirm=true required" }, { status: 400 });
    }

    const db = await ensureDB();

    // Anonymize worker personal data instead of full deletion
    await db.prepare(
      "UPDATE workers SET name = 'Deleted User', phone = CONCAT('deleted_', worker_id), email = NULL, password = 'DELETED', avatar_url = NULL, preferred_language = NULL, age_group = NULL, occupation = NULL, education_level = NULL WHERE worker_id = ?"
    ).bind(workerId).run();

    await db.prepare("DELETE FROM user_events WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM user_sessions WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM user_searches WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM user_interests WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM product_reviews WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM user_devices WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM communication_history WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM notifications WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM notification_preferences WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM privacy_consent WHERE worker_id = ?").bind(workerId).run();
    await db.prepare("DELETE FROM attribution_log WHERE worker_id = ?").bind(workerId).run();

    return NextResponse.json({ ok: true, message: "All personal data has been deleted/anonymized" });
  } catch (err) {
    console.error("Data deletion error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
