import { execute, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import type { SendResult, WhatsAppAccount } from "./types";

async function getActiveAccount(): Promise<WhatsAppAccount | null> {
  const db = await ensureDB();
  const account = await queryFirst<WhatsAppAccount>(
    { DB: db },
    "SELECT * FROM wa_accounts WHERE status = 'connected' ORDER BY daily_sent ASC LIMIT 1"
  );
  return account;
}

export async function sendMessage(
  to: string,
  text: string,
  accountId?: string
): Promise<SendResult> {
  const db = await ensureDB();

  let account: WhatsAppAccount | null = null;

  if (accountId) {
    account = await queryFirst<WhatsAppAccount>(
      { DB: db },
      "SELECT * FROM wa_accounts WHERE account_id = ?",
      [accountId]
    );
  } else {
    account = await getActiveAccount();
  }

  if (!account) {
    await execute(
      { DB: db },
      "INSERT INTO wa_logs (phone, message, direction, status, error, message_type, created_at) VALUES (?, ?, 'outbound', 'failed', 'No active account', 'text', datetime('now'))",
      [to, text]
    );
    return { success: false, error: "No active WhatsApp account" };
  }

  if (account.provider === "meta") {
    return sendViaMeta(to, text, account);
  }

  if (account.provider === "bridge") {
    return sendViaBridge(to, text, account);
  }

  await execute(
    { DB: db },
    "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'logged', 'text', datetime('now'))",
    [to, text]
  );
  return { success: true, messageId: "log-only" };
}

async function sendViaMeta(
  to: string,
  text: string,
  account: WhatsAppAccount
): Promise<SendResult> {
  try {
    const config = account.config ? (typeof account.config === "string" ? JSON.parse(account.config) : account.config) : {};
    const token = config.access_token || process.env.WHATSAPP_META_TOKEN;
    const phoneId = config.phone_id || process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      return { success: false, error: "Meta API not configured (WHATSAPP_META_TOKEN / WHATSAPP_PHONE_ID)" };
    }

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
      return { success: false, error: `Meta API error: ${err}` };
    }

    const data = await res.json() as { messages?: { id: string }[] };
    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'text', datetime('now'))",
      [to, text]
    );
    await execute(
      { DB: db },
      "UPDATE wa_accounts SET daily_sent = daily_sent + 1, total_sent = total_sent + 1, last_used_at = datetime('now') WHERE account_id = ?",
      [account.accountId]
    );

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

async function sendViaBridge(
  to: string,
  text: string,
  account: WhatsAppAccount
): Promise<SendResult> {
  try {
    const config = account.config ? (typeof account.config === "string" ? JSON.parse(account.config) : account.config) : {};
    const bridgeUrl = config.bridge_url || process.env.WHATSAPP_BRIDGE_URL;

    if (!bridgeUrl) {
      return { success: false, error: "Bridge URL not configured" };
    }

    const res = await fetch(`${bridgeUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, text, accountId: account.accountId }),
    });

    if (!res.ok) return { success: false, error: "Bridge send failed" };

    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'text', datetime('now'))",
      [to, text]
    );
    await execute(
      { DB: db },
      "UPDATE wa_accounts SET daily_sent = daily_sent + 1, total_sent = total_sent + 1, last_used_at = datetime('now') WHERE account_id = ?",
      [account.accountId]
    );

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
