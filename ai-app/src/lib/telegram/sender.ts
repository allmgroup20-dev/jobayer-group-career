const TG_API = "https://api.telegram.org/bot";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN env var not set");
  return token;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  botToken?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const token = botToken || getBotToken();
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
    return { success: true, messageId: data.result?.message_id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function setWebhook(botToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = botToken || getBotToken();
    const webhookUrl = `${process.env.PUBLIC_URL || "https://career.jobayergroup.com"}/api/telegram/webhook`;
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
    const token = botToken || getBotToken();
    const res = await fetch(`${TG_API}${token}/getWebhookInfo`);
    const data = await res.json() as { ok: boolean; result?: { url: string; pending_update_count: number } };
    if (!data.ok) return { error: "Failed to get webhook info" };
    return { url: data.result?.url, pendingCount: data.result?.pending_update_count };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
