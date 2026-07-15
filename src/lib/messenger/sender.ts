import { execute, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

const GRAPH_API = "https://graph.facebook.com/v18.0/me/messages";

export async function getPageToken(): Promise<string> {
  const token = process.env.MESSENGER_PAGE_TOKEN;
  if (token) return token;
  const db = await ensureDB();
  const bot = await queryFirst<{ token: string }>({ DB: db }, "SELECT token FROM fb_pages WHERE is_active = 1 LIMIT 1");
  if (bot?.token) return bot.token;
  throw new Error("No Facebook Page token. Set MESSENGER_PAGE_TOKEN env var or add a page in /dashboard/messenger");
}

export async function sendMessengerMessage(
  senderId: string,
  text: string,
  pageToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const token = pageToken || await getPageToken();
    const res = await fetch(`${GRAPH_API}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text },
      }),
    });
    const data = await res.json() as { message_id?: string; error?: { message: string }; recipient_id?: string };
    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message || "Messenger API error" };
    }
    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO fb_logs (sender_id, message, direction, status, created_at) VALUES (?, ?, 'outbound', 'sent', datetime('now'))",
      [senderId, text]
    );
    return { success: true, messageId: data.message_id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function setMessengerWebhook(verifyToken: string, pageToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = pageToken || await getPageToken();
    const webhookUrl = `${process.env.PUBLIC_URL || "https://jobayer-group-career.workers.dev"}/api/messenger/webhook`;
    const res = await fetch(`https://graph.facebook.com/v18.0/me/subscribed_apps?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscribed_fields: ["messages", "messaging_postbacks"],
        callback_url: webhookUrl,
        verify_token: verifyToken,
      }),
    });
    const data = await res.json() as { success?: boolean; error?: { message: string } };
    if (!data.success) return { success: false, error: data.error?.message || "Failed to subscribe" };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
