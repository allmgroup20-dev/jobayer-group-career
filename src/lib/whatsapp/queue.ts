import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { sendMessage } from "./sender";
import type { MessageQueueItem, MessagePriority } from "./types";

export async function enqueueMessage(
  to: string,
  text: string,
  priority: MessagePriority = 0,
  context?: { campaignId?: string; accountId?: string; messageType?: string }
): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    `INSERT INTO wa_message_queue (to_phone, text_content, priority, status, account_id, campaign_id, message_type, created_at)
     VALUES (?, ?, ?, 'queued', ?, ?, ?, datetime('now'))`,
    [
      to,
      text,
      priority,
      context?.accountId || null,
      context?.campaignId || null,
      context?.messageType || "outreach",
    ]
  );
}

export async function processQueue(batchSize = 3): Promise<number> {
  const db = await ensureDB();
  const items = await query<MessageQueueItem>(
    { DB: db },
    `SELECT * FROM wa_message_queue WHERE status = 'queued'
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

    const result = await sendMessage(item.to, item.text, item.accountId);

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
