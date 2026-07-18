import { queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { sendMessage as sendWhatsApp } from "@/lib/whatsapp/sender";
import { sendTelegramMessage } from "@/lib/telegram/sender";
import { sendMessengerMessage } from "@/lib/messenger/sender";

export type Platform = "whatsapp" | "messenger" | "telegram";

// Ordered priority: WhatsApp > Messenger > Telegram
const PLATFORM_ORDER: Platform[] = ["whatsapp", "messenger", "telegram"];

interface PlatformUser {
  phone: string;                // unified ID: phone, tg_{chatId}, fb_{psid}
  preferredPlatform: Platform;
  lastActivePlatform?: Platform;
  platformsTried: Platform[];
}

// ─── DB Helpers ─────────────────────────────────────────

function parsePhone(phone: string): { platform: Platform; nativeId: string } {
  if (phone.startsWith("tg_")) return { platform: "telegram", nativeId: phone.slice(3) };
  if (phone.startsWith("fb_")) return { platform: "messenger", nativeId: phone.slice(3) };
  return { platform: "whatsapp", nativeId: phone };
}

export async function getPlatformPref(phone: string): Promise<PlatformUser | null> {
  const db = await ensureDB();
  const row = await queryFirst<{
    phone: string; preferred_platform: string;
    last_active_platform: string | null; platforms_tried: string; last_active_at: string | null;
  }>({ DB: db }, "SELECT phone, preferred_platform, last_active_platform, platforms_tried, last_active_at FROM user_platform_preferences WHERE phone = ?", [phone]);
  if (!row) return null;
  return {
    phone: row.phone,
    preferredPlatform: row.preferred_platform as Platform,
    lastActivePlatform: (row.last_active_platform || undefined) as Platform | undefined,
    platformsTried: JSON.parse(row.platforms_tried || "[]"),
  };
}

export async function recordPlatformActivity(phone: string, platform: Platform): Promise<void> {
  const db = await ensureDB();
  const existing = await getPlatformPref(phone);
  if (existing) {
    const tried = new Set(existing.platformsTried);
    tried.add(platform);
    // If user replied on this platform, it becomes preferred
    await execute(
      { DB: db },
      `UPDATE user_platform_preferences SET
        preferred_platform = ?,
        last_active_platform = ?,
        platforms_tried = ?,
        last_active_at = datetime('now'),
        updated_at = datetime('now')
      WHERE phone = ?`,
      [platform, platform, JSON.stringify(Array.from(tried)), phone]
    );
  } else {
    await execute(
      { DB: db },
      `INSERT INTO user_platform_preferences (phone, preferred_platform, last_active_platform, platforms_tried, last_active_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
      [phone, platform, platform, JSON.stringify([platform])]
    );
  }
}

export async function getPreferredPlatform(phone: string): Promise<Platform> {
  const pref = await getPlatformPref(phone);
  return pref?.preferredPlatform || "whatsapp";
}

// ─── Cross-Platform Sender ──────────────────────────────

interface SendResult {
  success: boolean;
  platform: Platform;
  error?: string;
}

export async function sendToPreferred(
  phone: string,
  text: string
): Promise<SendResult> {
  const pref = await getPlatformPref(phone);
  const preferred = pref?.preferredPlatform || "whatsapp";
  return sendToPlatform(phone, text, preferred);
}

export async function sendToPlatform(
  phone: string,
  text: string,
  platform: Platform
): Promise<SendResult> {
  const { nativeId } = parsePhone(phone);

  switch (platform) {
    case "whatsapp": {
      const result = await sendWhatsApp(nativeId, text);
      return { success: result.success, platform, error: result.error };
    }
    case "telegram": {
      const result = await sendTelegramMessage(nativeId, text);
      return { success: result.success, platform, error: result.error };
    }
    case "messenger": {
      const result = await sendMessengerMessage(nativeId, text);
      return { success: result.success, platform, error: result.error };
    }
  }
}

export async function sendWithFailover(
  phone: string,
  text: string
): Promise<SendResult> {
  const pref = await getPlatformPref(phone);

  // Determine platform try order
  const tryOrder: Platform[] = pref
    ? [pref.preferredPlatform, ...PLATFORM_ORDER.filter((p) => p !== pref.preferredPlatform)]
    : PLATFORM_ORDER;

  for (const platform of tryOrder) {
    const result = await sendToPlatform(phone, text, platform);
    if (result.success) {
      await recordPlatformActivity(phone, platform);
      return result;
    }
  }

  return { success: false, platform: "whatsapp", error: "All platforms failed" };
}
