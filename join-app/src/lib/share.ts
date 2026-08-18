import { query, queryFirst } from "./queries";

export const SHARE_TARGET = 30;
// Hard safety cap so a single request can't flood the DB. Real limit: none —
// users may pick as many contacts as they want (the whole phonebook).
export const MAX_BATCH = 500;
// The relay /check endpoint accepts at most 20 numbers per request.
const CHECK_CHUNK = 20;

// Research-backed "fast-to-slow" (degressive) progress schedule for 30 shares.
// Meta-analyses (32 experiments) show fast-to-slow bars reduce drop-offs while
// slow-to-fast / linear bars don't help. First shares jump big (1st=15%,
// 2nd=22%, 3rd=28%), ~60% by share 12, then gentle 1–2% steps so the bar ALWAYS
// moves (stalling kills motivation) and only hits 100% at exactly the target.
const SHARE_PERCENT_SCHEDULE = [
  0, 15, 22, 28, 33, 37, 41, 44, 48, 51, 54, 57, 60, 63, 65, 68,
  70, 73, 75, 77, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
];

export function percentFor(sent: number): number {
  if (sent <= 0) return 0;
  if (sent >= SHARE_TARGET) return 100;
  const idx = Math.min(sent, SHARE_PERCENT_SCHEDULE.length - 1);
  return SHARE_PERCENT_SCHEDULE[idx];
}

export type ShareContact = {
  phone: string;
  name: string;
  status: string;
  link?: string;
  shareText?: string;
  waExists?: boolean;
  sentAt?: string | null;
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
  const normalized = (phones || []).filter((p) => !!p);
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
  const map: Record<string, boolean> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < normalized.length; i += CHECK_CHUNK) {
    chunks.push(normalized.slice(i, i + CHECK_CHUNK));
  }
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await fetch(`${relayUrl.replace(/\/+$/, "")}/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": relayToken },
          body: JSON.stringify({ phones: chunk }),
        });
        if (!res.ok) return [] as { phone: string; exists: boolean }[];
        const data = await res.json() as { results?: { phone: string; exists: boolean }[] };
        return data.results || [];
      } catch {
        return [] as { phone: string; exists: boolean }[];
      }
    })
  );
  for (const data of results) {
    for (const r of data) {
      if (r && r.phone) map[r.phone] = !!r.exists;
    }
  }
  return map;
}

export async function getShareSummary(env: { DB: D1Database }, workerId: string): Promise<ShareSummary> {
  const siteUrl = process.env.SITE_URL || "https://youtube.earner.workers.dev";

  const rows = await query<{ contact_phone: string; contact_name: string | null; status: string | null; share_token: string | null; wa_exists: string | null; sent_at: string | null; group_id: string | null }>(
    env,
    `SELECT contact_phone, contact_name, status, share_token, wa_exists, sent_at, group_id FROM user_phonebooks
     WHERE worker_id = ? AND source = 'share_task'`,
    [workerId]
  ).catch(() => []);

  // "sent" is the real count of PEOPLE. Numbers known NOT to have WhatsApp
  // (wa_exists='0') never count even if status were set — the flow prevents
  // that anyway. A person with several numbers (group_id) counts ONCE: sending
  // to any one number marks the whole group sent.
  const personKey = (r: { contact_phone: string; group_id: string | null }) =>
    r.group_id && r.group_id !== "" ? `g:${r.group_id}` : `p:${r.contact_phone}`;
  const sent = new Set(rows.filter((r) => r.status === "sent" && r.wa_exists !== "0").map(personKey)).size;
  const selected = new Set(rows.filter((r) => r.status === "selected" && r.wa_exists !== "0").map(personKey)).size;
  const percent = percentFor(sent);
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
    contacts: rows
      .map((r) => {
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
          sentAt: r.sent_at || null,
        };
      })
      // Sent contacts sink to the bottom (still visible) — never hidden.
      .sort((a, b) => (a.status === "sent" ? 1 : 0) - (b.status === "sent" ? 1 : 0)),
  };
}