import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { processQueue, getQueueStats, getPendingWebMessages, markWebSent } from "@/lib/whatsapp";
import { isFeatureEnabled } from "@/lib/features";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("account_id");
    if (accountId) {
      const [pending, relay] = await Promise.all([
        getPendingWebMessages(accountId),
        getQueuedForRelay(accountId),
      ]);
      return NextResponse.json({ pending: [...pending, ...relay] });
    }
    const stats = await getQueueStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load queue"
    }, { status: 500 });
  }
}

async function getQueuedForRelay(accountId: string, limit = 10) {
  const { ensureDB } = await import("@/lib/db");
  const db = await ensureDB();
  return query<import("@/lib/whatsapp/types").MessageQueueItem>(
    { DB: db },
    `SELECT id, to_phone AS to, text_content AS text, priority, status, account_id, campaign_id, message_type, attempts, error, scheduled_at, sent_at, created_at FROM wa_message_queue WHERE status = 'queued' AND account_id = ?
     ORDER BY priority DESC, created_at ASC LIMIT ?`,
    [accountId, limit]
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: string; id?: number; messageId?: string; accountId?: string };
    const { action } = body;
    const env = await getDB();

    // Cost-bearing actions are gated by the whatsapp flag (flush = send).
    if ((action === "flush" || action === "retry_failed") && !(await isFeatureEnabled("whatsapp"))) {
      return NextResponse.json({ error: "WhatsApp messaging is disabled", disabled: true }, { status: 403 });
    }

    if (action === "flush") {
      const sent = await processQueue(5);
      return NextResponse.json({ sent, remaining: (await getQueueStats()).queued });
    }

    if (action === "clear_failed") {
      await execute(env,
        "DELETE FROM wa_message_queue WHERE status = 'failed'"
      );
      return NextResponse.json({ cleared: true });
    }

    if (action === "retry_failed") {
      await execute(env,
        "UPDATE wa_message_queue SET status = 'queued', attempts = 0, error = NULL WHERE status = 'failed' AND attempts < 3"
      );
      return NextResponse.json({ retried: true });
    }

    if (action === "mark_sent") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await markWebSent(body.id, body.messageId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Queue action failed"
    }, { status: 500 });
  }
}
