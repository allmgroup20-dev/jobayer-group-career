import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { logApiCost } from "@/lib/cost-log";
import { WHATSAPP_MSG_USD } from "@/lib/cost-prices";
import type { SendResult } from "./types";

export async function sendMessage(
  to: string,
  text: string
): Promise<SendResult> {
  const token = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_META_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    // Meta API is not configured → deliver through the Baileys relay queue so
    // outbound messages still reach customers without WhatsApp/Meta secrets.
    try {
      const { enqueueMessage } = await import("./queue");
      const id = await enqueueMessage(to, text, 1, { messageType: "text", viaRelay: true });
      if (id) {
        logApiCost({
          provider: "whatsapp", feature: "whatsapp", operation: "send", quantity: 1,
          unitCostUsd: WHATSAPP_MSG_USD, estCostUsd: WHATSAPP_MSG_USD, status: "queued",
        }).catch(() => {});
        return { success: true, messageId: `relay:${id}` };
      }
      return { success: false, error: "Relay queue unavailable" };
    } catch (e) {
      console.error("[WhatsApp Send] Relay fallback failed:", (e as Error).message);
      const db = await ensureDB();
      await execute(
        { DB: db },
        "INSERT INTO wa_logs (phone, message, direction, status, error, message_type, created_at) VALUES (?, ?, 'outbound', 'failed', ?, 'text', datetime('now'))",
        [to, text, (e as Error).message]
      );
      return { success: false, error: (e as Error).message };
    }
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
    logApiCost({
      provider: "whatsapp", feature: "whatsapp", operation: "send", quantity: 1,
      unitCostUsd: WHATSAPP_MSG_USD, estCostUsd: WHATSAPP_MSG_USD,
    }).catch(() => {});

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (e) {
    console.error(`[WhatsApp Send] Failed to send to ${to}:`, (e as Error).message);
    return { success: false, error: (e as Error).message };
  }
}
