import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export type CampaignChannel = "whatsapp" | "sms" | "email";

export interface SegmentCampaignConfig {
  id?: number;
  name: string;
  nameBn: string;
  segment: string;
  channel: CampaignChannel;
  template: string;
  templateBn: string;
  schedule: "immediate" | "daily" | "weekly" | "monthly";
  scheduledHour?: number;
  isActive: boolean;
  maxPerBatch: number;
  cooldownDays: number;
  createdAt?: string;
}

export interface CampaignAnalytics {
  campaignId: number;
  name: string;
  segment: string;
  channel: string;
  totalTargeted: number;
  totalSent: number;
  delivered: number;
  read: number;
  replied: number;
  converted: number;
  conversionRate: number;
}

const SEGMENTS = ["vip", "active_buyer", "engaged_learner", "at_risk", "new", "dormant"] as const;

export async function ensureCampaignEngineTables(): Promise<void> {
  const db = await ensureDB();
  await db.prepare(`CREATE TABLE IF NOT EXISTS segment_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, name_bn TEXT,
    segment TEXT NOT NULL, channel TEXT DEFAULT 'whatsapp',
    template TEXT, template_bn TEXT, schedule TEXT DEFAULT 'immediate',
    scheduled_hour INTEGER DEFAULT 10, is_active INTEGER DEFAULT 1,
    max_per_batch INTEGER DEFAULT 50, cooldown_days INTEGER DEFAULT 7,
    last_run_at TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS campaign_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER NOT NULL,
    segment TEXT NOT NULL, total_targeted INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0, delivered INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0, replied INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0, run_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_segment_campaigns_segment ON segment_campaigns(segment)").run().catch(() => {});
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id)").run().catch(() => {});
}

export async function registerSegmentCampaign(config: SegmentCampaignConfig): Promise<number> {
  const db = await ensureDB();
  const result = await db.prepare(
    `INSERT INTO segment_campaigns (name, name_bn, segment, channel, template, template_bn, schedule, scheduled_hour, is_active, max_per_batch, cooldown_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(config.name, config.nameBn, config.segment, config.channel,
    config.template, config.templateBn, config.schedule,
    config.scheduledHour ?? 10, config.isActive ? 1 : 0,
    config.maxPerBatch || 50, config.cooldownDays || 7
  ).run() as any;
  return result.meta?.last_row_id || 0;
}

export async function getSegmentCampaigns(segment?: string): Promise<SegmentCampaignConfig[]> {
  const db = await ensureDB();
  let sql = "SELECT * FROM segment_campaigns";
  const params: unknown[] = [];
  if (segment) { sql += " WHERE segment = ?"; params.push(segment); }
  sql += " ORDER BY is_active DESC, created_at DESC";

  const rows = await query<any>({ DB: db }, sql, params);
  return rows.map((r: any) => ({
    id: r.id, name: r.name, nameBn: r.name_bn || r.name,
    segment: r.segment, channel: r.channel as CampaignChannel,
    template: r.template, templateBn: r.template_bn || r.template,
    schedule: r.schedule, scheduledHour: r.scheduled_hour,
    isActive: r.is_active === 1, maxPerBatch: r.max_per_batch,
    cooldownDays: r.cooldown_days, createdAt: r.created_at,
  }));
}

// Get phone numbers by behavioral segment
export async function getSegmentPhones(segment: string, limit: number = 50): Promise<string[]> {
  const db = await ensureDB();
  const rows = await db.prepare(
    `SELECT phone FROM user_behavior_scores
     WHERE segment = ? AND phone IS NOT NULL
     ORDER BY updated_at DESC LIMIT ?`
  ).bind(segment, limit).all() as any;
  return (rows?.results || []).map((r: any) => r.phone);
}

export async function executeSegmentCampaign(
  campaignId: number, channel: CampaignChannel = "whatsapp"
): Promise<{ sent: number; failed: number }> {
  const db = await ensureDB();
  const campaigns = await getSegmentCampaigns();
  const config = campaigns.find((c) => c.id === campaignId);
  if (!config) return { sent: 0, failed: 0 };

  const phones = await getSegmentPhones(config.segment, config.maxPerBatch);
  if (phones.length === 0) return { sent: 0, failed: 0 };

  // Exclude phones contacted within cooldown period
  const cooldownDate = `-${config.cooldownDays} days`;
  const filteredPhones: string[] = [];
  for (const phone of phones) {
    const recent = await db.prepare(
      `SELECT COUNT(*) as cnt FROM campaign_analytics ca
       JOIN segment_campaigns sc ON sc.id = ca.campaign_id
       WHERE ca.segment = ? AND ca.total_sent > 0 AND ca.run_at >= datetime('now', ?)
       AND ca.campaign_id IN (SELECT id FROM segment_campaigns WHERE segment = ?)`
    ).bind(config.segment, cooldownDate, config.segment).first() as any;
    if (!recent || recent.cnt === 0) filteredPhones.push(phone);
  }

  if (filteredPhones.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const phone of filteredPhones) {
    try {
      const variables: Record<string, string> = { phone };
      const text = (channel === "whatsapp" ? config.template : config.templateBn)
        .replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || key);

      if (channel === "whatsapp") {
        const { sendMessage } = await import("@/lib/whatsapp/sender");
        const profile = await db.prepare(
          "SELECT name FROM ai_phone_profiles WHERE phone = ?"
        ).bind(phone).first() as any;
        const personalized = text.replace("{{name}}", profile?.name || phone);
        await sendMessage(phone, personalized);
      } else if (channel === "sms") {
        const { sendSMS } = await import("./sms");
        await sendSMS({ to: phone, text });
      } else if (channel === "email") {
        const { sendEmail } = await import("./email");
        const profile = await db.prepare(
          "SELECT name FROM ai_phone_profiles WHERE phone = ?"
        ).bind(phone).first() as any;
        await sendEmail({ to: phone, subject: config.name, html: `<p>${text}</p>` });
      }
      sent++;
    } catch {
      failed++;
    }
  }

  // Record analytics
  await db.prepare(
    `INSERT INTO campaign_analytics (campaign_id, segment, total_targeted, total_sent)
     VALUES (?, ?, ?, ?)`
  ).bind(campaignId, config.segment, filteredPhones.length, sent).run();

  // Update last_run_at
  await db.prepare(
    "UPDATE segment_campaigns SET last_run_at = datetime('now') WHERE id = ?"
  ).bind(campaignId).run();

  return { sent, failed };
}

// Run due campaigns (for cron)
export async function runDueSegmentCampaigns(): Promise<{ campaign: string; sent: number }[]> {
  const results: { campaign: string; sent: number }[] = [];
  for (const segment of SEGMENTS) {
    const campaigns = await getSegmentCampaigns(segment);
    for (const c of campaigns.filter((c) => c.isActive && c.schedule !== "immediate")) {
      const db = await ensureDB();
      const lastRun = await db.prepare(
        "SELECT last_run_at FROM segment_campaigns WHERE id = ?"
      ).bind(c.id).first() as any;

      const shouldRun = !lastRun?.last_run_at || (() => {
        const last = new Date(lastRun.last_run_at + "Z").getTime();
        const now = Date.now();
        const hoursSince = (now - last) / 3600000;
        if (c.schedule === "daily") return hoursSince >= 24;
        if (c.schedule === "weekly") return hoursSince >= 168;
        if (c.schedule === "monthly") return hoursSince >= 720;
        return false;
      })();

      if (shouldRun && c.id) {
        const { sent } = await executeSegmentCampaign(c.id, c.channel);
        if (sent > 0) results.push({ campaign: c.name, sent });
      }
    }
  }
  return results;
}

export async function getCampaignAnalytics(campaignId?: number): Promise<CampaignAnalytics[]> {
  const db = await ensureDB();
  const rows = await query<any>(
    { DB: db },
    `SELECT ca.id, sc.name, ca.segment, sc.channel,
            ca.total_targeted, ca.total_sent,
            ca.delivered, ca.read_count as read, ca.replied, ca.converted,
            CASE WHEN ca.total_sent > 0 THEN ROUND((ca.converted * 100.0 / ca.total_sent), 1) ELSE 0 END as conversionRate
     FROM campaign_analytics ca
     JOIN segment_campaigns sc ON sc.id = ca.campaign_id
     ${campaignId ? "WHERE ca.campaign_id = ?" : ""}
     ORDER BY ca.run_at DESC LIMIT 50`,
    campaignId ? [campaignId] : []
  );
  return rows.map((r: any) => ({
    campaignId: r.id, name: r.name, segment: r.segment, channel: r.channel,
    totalTargeted: r.total_targeted, totalSent: r.total_sent,
    delivered: r.delivered, read: r.read, replied: r.replied,
    converted: r.converted, conversionRate: r.conversionRate,
  }));
}

// Seed default segment campaigns
export async function seedDefaultCampaigns(): Promise<void> {
  const db = await ensureDB();
  const existing = await db.prepare("SELECT COUNT(*) as cnt FROM segment_campaigns").first() as any;
  if (existing && existing.cnt > 0) return;

  const defaults: SegmentCampaignConfig[] = [
    { name: "VIP Loyalty Reward", nameBn: "ভিআইপি লয়ালটি রিওয়ার্ড", segment: "vip", channel: "whatsapp",
      template: "🎉 Exclusive VIP offer for you! Get {{discount}}% off on our premium upgrade. Reply for details.",
      templateBn: "🎉 আপনার জন্য এক্সক্লুসিভ ভিআইপি অফার! প্রিমিয়াম আপগ্রেডে {{discount}}% ছাড়। বিস্তারিত জানান।",
      schedule: "monthly", scheduledHour: 10, isActive: true, maxPerBatch: 20, cooldownDays: 20 },
    { name: "Cross-sell to Buyers", nameBn: "ক্রেতাদের জন্য ক্রস-সেল", segment: "active_buyer", channel: "whatsapp",
      template: "Hi {{name}}, since you enjoyed our course, check out {{product}} — specially recommended for you!",
      templateBn: "হাই {{name}}, যেহেতু আপনি আমাদের কোর্স পছন্দ করেছেন, তাই {{product}} দেখুন — বিশেষভাবে আপনার জন্য!",
      schedule: "weekly", scheduledHour: 11, isActive: true, maxPerBatch: 30, cooldownDays: 7 },
    { name: "Learner to Buyer", nameBn: "শিক্ষার্থী থেকে ক্রেতা", segment: "engaged_learner", channel: "whatsapp",
      template: "You've been learning with us! Now turn that knowledge into income. Check our income programs.",
      templateBn: "আপনি আমাদের সাথে শিখছেন! এখন সেই জ্ঞানকে আয়ে রূপান্তর করুন। আমাদের আয় প্রোগ্রাম দেখুন।",
      schedule: "weekly", scheduledHour: 12, isActive: true, maxPerBatch: 30, cooldownDays: 7 },
    { name: "Win-back At-Risk", nameBn: "ঝুঁকিপূর্ণ সদস্য ফিরিয়ে আনা", segment: "at_risk", channel: "sms",
      template: "{{name}}, we miss you! Here's a special {{discount}}% coupon for your next purchase: {{coupon}}",
      templateBn: "{{name}}, আপনাকে মিস করছি! আপনার পরবর্তী ক্রয়ের জন্য বিশেষ {{discount}}% কুপন: {{coupon}}",
      schedule: "weekly", scheduledHour: 15, isActive: true, maxPerBatch: 20, cooldownDays: 14 },
    { name: "New Lead Nurture", nameBn: "নতুন লিড নারচার", segment: "new", channel: "whatsapp",
      template: "Welcome {{name}}! Start with our free resources and see how you can earn from day one.",
      templateBn: "স্বাগতম {{name}}! আমাদের ফ্রি রিসোর্স দিয়ে শুরু করুন এবং দেখুন কীভাবে প্রথম দিন থেকেই আয় করতে পারেন।",
      schedule: "daily", scheduledHour: 9, isActive: true, maxPerBatch: 10, cooldownDays: 1 },
    { name: "Dormant Reactivation", nameBn: "নিষ্ক্রিয় পুনরায় সক্রিয়করণ", segment: "dormant", channel: "sms",
      template: "Long time {{name}}! We have new opportunities. Visit career.jobayergroup.com to see what's new.",
      templateBn: "অনেক দিন {{name}}! আমাদের নতুন সুযোগ আছে। কী নতুন আছে দেখতে career.jobayergroup.com দেখুন।",
      schedule: "monthly", scheduledHour: 14, isActive: true, maxPerBatch: 15, cooldownDays: 25 },
  ];

  for (const c of defaults) {
    await registerSegmentCampaign(c);
  }
}
