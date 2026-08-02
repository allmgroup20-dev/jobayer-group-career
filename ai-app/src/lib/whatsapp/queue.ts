import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { sendMessage } from "./sender";
import type { MessageQueueItem, MessagePriority } from "./types";

export async function enqueueMessage(
  to: string,
  text: string,
  priority: MessagePriority = 0,
  context?: { campaignId?: string; accountId?: string; messageType?: string; viaRelay?: boolean }
): Promise<number | null> {
  const db = await ensureDB();
  const useRelay = context?.viaRelay !== false;
  const status = useRelay ? "pending_web" : "queued";
  const result = await execute(
    { DB: db },
    `INSERT INTO wa_message_queue (to_phone, text_content, priority, status, account_id, campaign_id, message_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      to,
      text,
      priority,
      status,
      context?.accountId || (useRelay ? "web_main" : null),
      context?.campaignId || null,
      context?.messageType || "outreach",
    ]
  );
  return result?.meta?.last_row_id ?? null;
}

export async function processQueue(batchSize = 3): Promise<number> {
  const db = await ensureDB();
  const items = await query<MessageQueueItem>(
    { DB: db },
    `SELECT id, to_phone AS to, text_content AS text, priority, status, account_id, campaign_id, message_type, attempts, error, scheduled_at, sent_at, created_at FROM wa_message_queue WHERE status = 'queued'
     ORDER BY priority DESC, created_at ASC LIMIT ?`,
    [batchSize]
  );

  let sent = 0;
  for (const item of items) {
    await execute(
      { DB: db },
      "UPDATE wa_message_queue SET status = 'sending', attempts = attempts + 1 WHERE id = ?",
      [item.id]
    );

    const result = await sendMessage(item.to, item.text);

    if (result.success) {
      await execute(
        { DB: db },
        "UPDATE wa_message_queue SET status = 'sent', sent_at = datetime('now') WHERE id = ?",
        [item.id]
      );
      sent++;
    } else {
      await execute(
        { DB: db },
        "UPDATE wa_message_queue SET status = 'failed', error = ? WHERE id = ?",
        [result.error || "Unknown error", item.id]
      );
    }
  }

  return sent;
}

export async function getPendingWebMessages(accountId: string, limit = 10): Promise<MessageQueueItem[]> {
  const db = await ensureDB();
  return query<MessageQueueItem>(
    { DB: db },
    `SELECT id, to_phone AS to, text_content AS text, priority, status, account_id, campaign_id, message_type, attempts, error, scheduled_at, sent_at, created_at FROM wa_message_queue WHERE status = 'pending_web' AND account_id = ?
     ORDER BY priority DESC, created_at ASC LIMIT ?`,
    [accountId, limit]
  );
}

export async function markWebSent(id: number, messageId?: string): Promise<void> {
  const db = await ensureDB();
  // First get the queue item to know what we're updating
  const items = await query<{ to_phone: string; text_content: string }>(
    { DB: db },
    "SELECT to_phone, text_content FROM wa_message_queue WHERE id = ?",
    [id]
  );
  await execute(
    { DB: db },
    "UPDATE wa_message_queue SET status = 'sent', sent_at = datetime('now') WHERE id = ?",
    [id]
  );
  if (items.length > 0) {
    await execute(
      { DB: db },
      "UPDATE wa_logs SET status = 'sent' WHERE phone = ? AND message = ? AND direction = 'outbound' ORDER BY created_at DESC LIMIT 1",
      [items[0].to_phone, items[0].text_content]
    );
  }
}

export async function getQueueStats() {
  const db = await ensureDB();
  const queued = await query<{ count: number }>(
    { DB: db },
    "SELECT COUNT(*) as count FROM wa_message_queue WHERE status = 'queued'"
  );
  const sent = await query<{ count: number }>(
    { DB: db },
    "SELECT COUNT(*) as count FROM wa_message_queue WHERE status = 'sent'"
  );
  const failed = await query<{ count: number }>(
    { DB: db },
    "SELECT COUNT(*) as count FROM wa_message_queue WHERE status = 'failed'"
  );
  return {
    queued: queued[0]?.count || 0,
    sent: sent[0]?.count || 0,
    failed: failed[0]?.count || 0,
  };
}
