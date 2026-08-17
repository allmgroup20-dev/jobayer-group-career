import { query, queryFirst } from "./queries";

export const SHARE_TARGET = 25;
export const MAX_PER_ROUND = 5;

export type ShareSummary = {
  target: number;
  selected: number;
  sent: number;
  percent: number;
  completed: boolean;
  certificateId: string | null;
  contacts: { phone: string; name: string; status: string }[];
};

export function generateCertificateId(now: Date = new Date()): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `YA-REF-${now.getFullYear()}-${rand}`;
}

export async function getShareSummary(env: { DB: D1Database }, workerId: string): Promise<ShareSummary> {
  const rows = await query<{ contact_phone: string; contact_name: string | null; status: string | null }>(
    env,
    `SELECT contact_phone, contact_name, status FROM user_phonebooks
     WHERE worker_id = ? AND source = 'share_task'`,
    [workerId]
  ).catch(() => []);

  const sent = rows.filter((r) => r.status === "sent").length;
  const selected = rows.length - sent;
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
    contacts: rows.map((r) => ({
      phone: r.contact_phone,
      name: r.contact_name || "",
      status: r.status === "sent" ? "sent" : "selected",
    })),
  };
}