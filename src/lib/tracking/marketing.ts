import { ensureDB } from "@/lib/db";
import { enqueueMessage } from "@/lib/whatsapp";

export interface SegmentStats {
  segment: string;
  count: number;
}

export async function getSegmentStats(): Promise<SegmentStats[]> {
  const db = await ensureDB();
  const rows = await db.prepare(
    "SELECT segment, COUNT(*) as count FROM user_behavior_scores GROUP BY segment ORDER BY count DESC"
  ).bind().all() as { results: { segment: string; count: number }[] };

  const total = await db.prepare(
    "SELECT COUNT(*) as c FROM workers WHERE membership_status = 'active'"
  ).bind().first() as { c: number } | undefined;

  const stats: SegmentStats[] = rows.results.map(r => ({ segment: r.segment, count: r.count }));
  const scored = stats.reduce((s, r) => s + r.count, 0);
  if (total && total.c > scored) {
    stats.push({ segment: "unscored", count: total.c - scored });
  }
  return stats;
}

export async function getWorkersBySegment(segment: string): Promise<{ workerId: string; name: string; phone: string }[]> {
  const db = await ensureDB();
  let rows: { results: { workerId: string; name: string; phone: string }[] };

  if (segment === "unscored") {
    rows = await db.prepare(
       `SELECT w.worker_id as workerId, w.name, w.phone FROM workers w
        WHERE w.membership_status = 'active'
        AND w.worker_id NOT IN (SELECT worker_id FROM user_behavior_scores)
        LIMIT 200`
    ).bind().all() as typeof rows;
  } else if (segment === "all") {
    rows = await db.prepare(
      "SELECT worker_id as workerId, name, phone FROM workers WHERE membership_status = 'active' LIMIT 200"
    ).bind().all() as typeof rows;
  } else {
    rows = await db.prepare(
      `SELECT w.worker_id as workerId, w.name, w.phone FROM workers w
       INNER JOIN user_behavior_scores s ON w.worker_id = s.worker_id
       WHERE s.segment = ? AND w.membership_status = 'active'`
    ).bind(segment).all() as typeof rows;
  }

  return rows.results || [];
}

export async function sendToSegment(
  segment: string,
  message: string,
  options?: { campaignId?: string; limit?: number }
): Promise<{ sent: number; skipped: number; total: number }> {
  const workers = await getWorkersBySegment(segment);
  let sent = 0;
  let skipped = 0;

  const targets = options?.limit ? workers.slice(0, options.limit) : workers;

  for (const w of targets) {
    if (!w.phone || w.phone.length < 10) { skipped++; continue; }
    const personalized = message.replace(/\{name\}/g, w.name).replace(/\{workerId\}/g, w.workerId);
    await enqueueMessage(w.phone, personalized, 0, {
      campaignId: options?.campaignId,
      messageType: "campaign",
    });
    sent++;
  }

  return { sent, skipped, total: targets.length };
}

const REENGAGEMENT_MESSAGES: Record<string, { en: string; bn: string }> = {
  at_risk: {
    en: "Hi {name}, we noticed you haven't been active lately. Check out new courses and products waiting for you!",
    bn: "হ্যালো {name}, আমরা দেখেছি আপনি কিছুদিন পরিদর্শন করেননি। আপনার জন্য নতুন কোর্স এবং পণ্য অপেক্ষা করছে!",
  },
  churned: {
    en: "Hi {name}, it's been a while! We have exciting new updates. Come back and see what's new!",
    bn: "হ্যালো {name}, অনেক দিন দেখা নেই! আমাদের নতুন আপডেটগুলো দেখুন এবং ফিরে আসুন!",
  },
};

export async function automatedReEngagement(
  segment: "at_risk" | "churned",
  lang: "en" | "bn" = "bn"
): Promise<{ sent: number; skipped: number; total: number }> {
  const msg = REENGAGEMENT_MESSAGES[segment];
  if (!msg) return { sent: 0, skipped: 0, total: 0 };
  return sendToSegment(segment, msg[lang], { limit: 100 });
}

export async function scheduleAutomatedCampaigns(): Promise<{
  atRisk: { sent: number; skipped: number; total: number };
  churned: { sent: number; skipped: number; total: number };
}> {
  const atRisk = await automatedReEngagement("at_risk", "bn");
  const churned = await automatedReEngagement("churned", "bn");
  return { atRisk, churned };
}
