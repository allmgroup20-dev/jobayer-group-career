import { query, queryFirst } from "./queries";

export const SHARE_TARGET = 25;
export const MAX_PER_ROUND = 5;

export type ShareContact = {
  phone: string;
  name: string;
  status: string;
  link?: string;
  shareText?: string;
  waExists?: boolean;
};

export type ShareSummary = {
  target: number;
  selected: number;
  sent: number;
  percent: number;
  completed: boolean;
  certificateId: string | null;
  contacts: ShareContact[];
};

export function generateCertificateId(now: Date = new Date()): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `YA-REF-${now.getFullYear()}-${rand}`;
}

// One unique token per share round (≤5 people). A fresh token is generated on
// every round so WhatsApp/Facebook never sees the same link twice.
export function generateRoundToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function buildShareLink(siteUrl: string, workerId: string, token: string): string {
  return `${siteUrl}/${token}?ref=${workerId}`;
}

export function buildShareText(siteUrl: string, workerId: string, token: string): string {
  const link = buildShareLink(siteUrl, workerId, token);
  return `🎯 এখনই জয়েন করুন! ইউটিউব আর্নারে প্রিমিয়াম রিসোর্স, বোনাস রিসোর্স ও সার্টিফিকেট অর্জনের সুযোগ।\nআমার রেফারেল: ${link}`;
}

// Checks whether numbers have WhatsApp using the Baileys relay (/check).
// Returns a map phone → exists. Returns {} (no check) when the relay is not
// configured or unreachable — never blocks the user.
export async function checkWhatsAppNumbers(phones: string[]): Promise<Record<string, boolean>> {
  const normalized = (phones || []).filter((p) => !!p).slice(0, MAX_PER_ROUND);
  if (normalized.length === 0) return {};
  let relayUrl = "";
  let relayToken = "";
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const env = (ctx.env || {}) as Record<string, string | undefined>;
    relayUrl = env.RELAY_URL || "";
    relayToken = env.RELAY_AUTH_TOKEN || "";
  } catch {
    relayUrl = process.env.RELAY_URL || "";
    relayToken = process.env.RELAY_AUTH_TOKEN || "";
  }
  if (!relayUrl || !relayToken) return {};
  try {
    const res = await fetch(`${relayUrl.replace(/\/+$/, "")}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": relayToken },
      body: JSON.stringify({ phones: normalized }),
    });
    if (!res.ok) return {};
    const data = await res.json() as { results?: { phone: string; exists: boolean }[] };
    const map: Record<string, boolean> = {};
    for (const r of data.results || []) {
      if (r && r.phone) map[r.phone] = !!r.exists;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getShareSummary(env: { DB: D1Database }, workerId: string): Promise<ShareSummary> {
  const siteUrl = process.env.SITE_URL || "https://youtube.earner.workers.dev";

  const rows = await query<{ contact_phone: string; contact_name: string | null; status: string | null; share_token: string | null; wa_exists: string | null }>(
    env,
    `SELECT contact_phone, contact_name, status, share_token, wa_exists FROM user_phonebooks
     WHERE worker_id = ? AND source = 'share_task'`,
    [workerId]
  ).catch(() => []);

  // "sent" is the real count. Numbers known NOT to have WhatsApp (wa_exists='0')
  // never count even if status were set — the flow prevents that anyway.
  const sent = rows.filter((r) => r.status === "sent" && r.wa_exists !== "0").length;
  const selected = rows.filter((r) => r.status === "selected" && r.wa_exists !== "0").length;
  const percent = Math.min(100, Math.round((sent / SHARE_TARGET) * 100));
  const completed = sent >= SHARE_TARGET;

  const worker = await queryFirst<{ certificate_id: string | null }>(
    env, "SELECT certificate_id FROM workers WHERE worker_id = ?", [workerId]
  ).catch(() => null);

  return {
    target: SHARE_TARGET,
    selected,
    sent,
    percent,
    completed,
    certificateId: worker?.certificate_id || null,
    contacts: rows.map((r) => {
      const wa = r.wa_exists === "0" ? false : r.wa_exists === "1" ? true : undefined;
      return {
        phone: r.contact_phone,
        name: r.contact_name || "",
        status: r.status === "sent" ? "sent" : "selected",
        // Each contact has its own unique, single-use link. Once this contact
        // is shared to, its token is never reused for anyone else.
        link: r.share_token ? buildShareLink(siteUrl, workerId, r.share_token) : undefined,
        shareText: r.share_token ? buildShareText(siteUrl, workerId, r.share_token) : undefined,
        waExists: wa,
      };
    }),
  };
}