import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface StageSummary {
  stage: string;
  count: number;
  conversionRate: number;
  avgTimeInStageHours: number;
}

const FUNNEL_STAGES = ["stranger", "lead", "free_member", "premium", "vip"];
const STAGE_LABELS: Record<string, string> = {
  stranger: "New Visitor", lead: "Lead", free_member: "Free Member",
  premium: "Premium Member", vip: "VIP Member",
};
const STAGE_LABELS_BN: Record<string, string> = {
  stranger: "নতুন দর্শক", lead: "লিড", free_member: "ফ্রি সদস্য",
  premium: "প্রিমিয়াম সদস্য", vip: "ভিআইপি সদস্য",
};

export async function getFunnelAnalytics(days: number = 30): Promise<StageSummary[]> {
  const db = await ensureDB();
  const summaries: StageSummary[] = [];

  for (let i = 0; i < FUNNEL_STAGES.length; i++) {
    const stage = FUNNEL_STAGES[i];
    const nextStage = FUNNEL_STAGES[i + 1] || null;

    const stageRow = await db.prepare(
      `SELECT COUNT(DISTINCT phone) as cnt FROM funnel_events
       WHERE stage = ? AND created_at >= datetime('now', ?)`
    ).bind(stage, `-${days} days`).first() as any;
    const count = stageRow?.cnt || 0;

    let conversionRate = 0;
    if (nextStage) {
      const nextRow = await db.prepare(
        `SELECT COUNT(DISTINCT phone) as cnt FROM funnel_events
         WHERE stage = ? AND created_at >= datetime('now', ?)`
      ).bind(nextStage, `-${days} days`).first() as any;
      conversionRate = count > 0 ? ((nextRow?.cnt || 0) / count) * 100 : 0;
    } else {
      conversionRate = 100;
    }

    let avgTimeInStageHours = 0;
    if (nextStage) {
      const times = await query<any>(
        { DB: db },
        `SELECT AVG(CAST(julianday(n.created_at) - julianday(t.created_at) AS REAL) * 24) as avgHours
         FROM funnel_events t JOIN funnel_events n ON n.phone = t.phone AND n.stage = ? AND n.created_at > t.created_at
         WHERE t.stage = ? AND t.created_at >= datetime('now', ?)`,
        [nextStage, stage, `-${days} days`]
      );
      if (times.length > 0) avgTimeInStageHours = Math.round(times[0].avgHours * 10) / 10;
    }

    summaries.push({ stage, count, conversionRate: Math.round(conversionRate * 10) / 10, avgTimeInStageHours });
  }

  return summaries;
}

export async function getCampaignPerformance(campaignId?: number): Promise<any[]> {
  const db = await ensureDB();
  let sql = `SELECT c.id, c.name, c.status,
    COUNT(l.id) as total_sent,
    SUM(CASE WHEN l.delivered = 1 THEN 1 ELSE 0 END) as delivered,
    SUM(CASE WHEN l.read = 1 THEN 1 ELSE 0 END) as read,
    SUM(CASE WHEN l.replied = 1 THEN 1 ELSE 0 END) as replied,
    SUM(CASE WHEN l.converted = 1 THEN 1 ELSE 0 END) as converted
  FROM wa_outreach_campaigns c LEFT JOIN wa_outreach_log l ON l.campaign_id = c.id`;
  const params: unknown[] = [];
  if (campaignId) { sql += " WHERE c.id = ?"; params.push(campaignId); }
  sql += " GROUP BY c.id ORDER BY c.created_at DESC LIMIT 20";
  return await query<any>({ DB: db }, sql, params);
}

export async function getFunnelBreakdown(days: number = 30): Promise<any> {
  const db = await ensureDB();
  const events = await query<any>(
    { DB: db },
    `SELECT stage, event, COUNT(*) as count FROM funnel_events
     WHERE created_at >= datetime('now', ?) GROUP BY stage, event ORDER BY stage, count DESC`,
    [`-${days} days`]
  );
  const grouped: Record<string, { event: string; count: number }[]> = {};
  for (const e of events) {
    if (!grouped[e.stage]) grouped[e.stage] = [];
    grouped[e.stage].push({ event: e.event, count: e.count });
  }
  return { totalEvents: events.reduce((s: number, e: any) => s + e.count, 0), stages: grouped };
}

export function buildFunnelAnalyticsContext(summaries: StageSummary[], lang: string): string {
  if (summaries.length === 0) return "";
  const lines: string[] = [lang === "bn" ? "## ফানেল অ্যানালিটিক্স\n" : "## Funnel Analytics\n"];
  for (const s of summaries) {
    const label = lang === "bn" ? (STAGE_LABELS_BN[s.stage] || s.stage) : (STAGE_LABELS[s.stage] || s.stage);
    const conversion = lang === "bn"
      ? `পরবর্তী পর্যায়ে রূপান্তর: ${s.conversionRate}%`
      : `→ Next stage: ${s.conversionRate}%`;
    const time = s.avgTimeInStageHours > 0
      ? (lang === "bn" ? ` (গড় ${s.avgTimeInStageHours} ঘণ্টা)` : ` (avg ${s.avgTimeInStageHours}h)`)
      : "";
    lines.push(`- **${label}**: ${s.count} জন${time}`);
    lines.push(`  ${conversion}`);
  }
  return lines.join("\n") + "\n";
}
