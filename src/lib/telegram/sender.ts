import { execute, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

const TG_API = "https://api.telegram.org/bot";

export async function getBotToken(): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) return token;
  const db = await ensureDB();
  const bot = await queryFirst<{ token: string }>({ DB: db }, "SELECT token FROM tg_bots WHERE is_active = 1 LIMIT 1");
  if (bot?.token) return bot.token;
  throw new Error("No Telegram bot token configured. Set TELEGRAM_BOT_TOKEN env var or add a bot in /dashboard/telegram");
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  botToken?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const token = botToken || await getBotToken();
    const res = await fetch(`${TG_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(chatId),
        text,
        parse_mode: "Markdown",
      }),
    });
    const data = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string };
    if (!data.ok) {
      return { success: false, error: data.description || "Telegram API error" };
    }
    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO tg_logs (chat_id, message, direction, status, created_at) VALUES (?, ?, 'outbound', 'sent', datetime('now'))",
      [String(chatId), text]
    );
    return { success: true, messageId: data.result?.message_id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function setWebhook(botToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = botToken || await getBotToken();
    const webhookUrl = `${process.env.PUBLIC_URL || "https://jobayer-group-career.workers.dev"}/api/telegram/webhook`;
    const res = await fetch(`${TG_API}${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`, { method: "POST" });
    const data = await res.json() as { ok: boolean; description?: string; result?: boolean };
    if (!data.ok) return { success: false, error: data.description };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getWebhookInfo(botToken?: string): Promise<{
  url?: string; pendingCount?: number; error?: string
}> {
  try {
    const token = botToken || await getBotToken();
    const res = await fetch(`${TG_API}${token}/getWebhookInfo`);
    const data = await res.json() as { ok: boolean; result?: { url: string; pending_update_count: number } };
    if (!data.ok) return { error: "Failed to get webhook info" };
    return { url: data.result?.url, pendingCount: data.result?.pending_update_count };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
