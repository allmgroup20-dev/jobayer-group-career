import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import type { SendResult } from "./types";

export async function sendMessage(
  to: string,
  text: string
): Promise<SendResult> {
  const token = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_META_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO wa_logs (phone, message, direction, status, error, message_type, created_at) VALUES (?, ?, 'outbound', 'failed', 'WHATSAPP_API_KEY/WHATSAPP_META_TOKEN or WHATSAPP_PHONE_ID not set', 'text', datetime('now'))",
      [to, text]
    );
    return { success: false, error: "WhatsApp API not configured" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[WhatsApp Send] Meta API error (${res.status}): ${err.slice(0, 300)}`);
      return { success: false, error: `Meta API error: ${err}` };
    }

    const data = await res.json() as { messages?: { id: string }[] };
    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'text', datetime('now'))",
      [to, text]
    );

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (e) {
    console.error(`[WhatsApp Send] Failed to send to ${to}:`, (e as Error).message);
    return { success: false, error: (e as Error).message };
  }
}
