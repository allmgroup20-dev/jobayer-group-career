import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const db = await ensureDB();
    let synced = 0;

    // Sync wa_logs → communication_history
    const waLogs = await db.prepare(
      "SELECT phone, message, direction, status, created_at FROM wa_logs WHERE created_at > (SELECT COALESCE(MAX(created_at), '2000-01-01') FROM communication_history WHERE channel = 'whatsapp') ORDER BY created_at ASC LIMIT 500"
    ).bind().all() as { results: any[] };

    for (const log of waLogs.results) {
      const match = await db.prepare(
        "SELECT worker_id FROM workers WHERE phone = ?"
      ).bind(log.phone).first() as { worker_id: string } | undefined;

      if (match) {
        await db.prepare(
          "INSERT OR IGNORE INTO communication_history (worker_id, channel, direction, message, status, reference_id, sent_at, created_at) VALUES (?, 'whatsapp', ?, ?, ?, ?, ?, ?)"
        ).bind(match.worker_id, log.direction || "outbound", log.message || "", log.status || "sent", String(log.phone), log.created_at, log.created_at).run();
        synced++;
      }
    }

    // Sync ai_conversations → communication_history
    const convos = await db.prepare(
      "SELECT phone, substr(COALESCE(messages, ''), 1, 500) as messages, created_at FROM ai_conversations WHERE created_at > (SELECT COALESCE(MAX(created_at), '2000-01-01') FROM communication_history WHERE channel = 'ai_assistant') ORDER BY created_at ASC LIMIT 200"
    ).bind().all() as { results: any[] };

    for (const c of convos.results) {
      const match = await db.prepare(
        "SELECT worker_id FROM workers WHERE phone = ? OR phone = ?"
      ).bind(c.phone, `+${c.phone.replace(/^\+/, "")}`).first() as { worker_id: string } | undefined;

      if (match) {
        await db.prepare(
          "INSERT OR IGNORE INTO communication_history (worker_id, channel, direction, message, status, reference_id, sent_at, created_at) VALUES (?, 'ai_assistant', 'inbound', ?, 'received', ?, ?, ?)"
        ).bind(match.worker_id, typeof c.messages === "string" ? c.messages.slice(0, 500) : JSON.stringify(c.messages || "").slice(0, 500), c.phone, c.created_at, c.created_at).run();
        synced++;
      }
    }

    // Sync whatsapp_log (legacy) → communication_history
    const legacy = await db.prepare(
      "SELECT worker_id, phone, message, status, sent_at FROM whatsapp_log WHERE sent_at > (SELECT COALESCE(MAX(sent_at), '2000-01-01') FROM communication_history WHERE channel = 'whatsapp_legacy') ORDER BY sent_at ASC LIMIT 500"
    ).bind().all() as { results: any[] };

    for (const l of legacy.results) {
      if (l.worker_id) {
        await db.prepare(
          "INSERT OR IGNORE INTO communication_history (worker_id, channel, direction, message, status, reference_id, sent_at, created_at) VALUES (?, 'whatsapp', 'outbound', ?, ?, ?, ?, ?)"
        ).bind(l.worker_id, l.message || "", l.status || "sent", l.phone || "", l.sent_at, l.sent_at).run();
        synced++;
      }
    }

    return NextResponse.json({ ok: true, synced });
  } catch (err) {
    console.error("Notification sync error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
