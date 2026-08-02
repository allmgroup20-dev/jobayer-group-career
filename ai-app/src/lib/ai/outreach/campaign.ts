import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { enqueueMessage } from "@/lib/whatsapp";
import { detectLanguage } from "@/lib/ai/analyzer";
import { callAI } from "@/lib/ai/router";

export interface OutreachCampaign {
  id: number;
  name: string;
  status: "draft" | "running" | "paused" | "completed";
  targetStatus: string | null;
  targetMinPriority: number;
  targetDaysSinceContact: number;
  messageTemplate: string | null;
  aiGenerated: number;
  totalTargets: number;
  sentCount: number;
  replyCount: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachLog {
  id: number;
  campaignId: number;
  phone: string;
  message: string;
  status: string;
  replied: number;
  error: string | null;
  sentAt: string | null;
}

const OUTREACH_MODEL = { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free" };

async function generateOutreachMessage(phone: string, name: string | null, campaign: OutreachCampaign): Promise<string> {
  if (!campaign.aiGenerated && campaign.messageTemplate) {
    return campaign.messageTemplate.replace(/\{name\}/g, name || "there");
  }
  const lang = name ? detectLanguage(name) : "bn";
  const prompt = lang === "en"
    ? `Write a friendly WhatsApp message (max 3 sentences, 40 words) to ${name || "a new contact"} welcoming them to Jobayer Group Career. Tone: warm, professional. Invite them to explore free resources and courses. No links.`
    : `জবায়ের গ্রুপ ক্যারিয়ারে নতুন একজন গ্রাহককে স্বাগতম জানিয়ে একটি বন্ধুত্বপূর্ণ WhatsApp মেসেজ লিখুন (সর্বোচ্চ ৩ বাক্য, ৪০ শব্দ)। সুর: উষ্ণ, পেশাদার। তাদের বিনামূল্যের রিসোর্স ও কোর্স দেখার জন্য আমন্ত্রণ জানান। কোনো লিংক দেবেন না।`;
  try {
    const result = await callAI({ messages: [{ role: "user", content: prompt }] }, 100, OUTREACH_MODEL.model, OUTREACH_MODEL.provider);
    return result.text || (lang === "en" ? "Welcome to Jobayer Group Career! Explore our free resources to start your journey." : "জবায়ের গ্রুপ ক্যারিয়ারে আপনাকে স্বাগতম! বিনামূল্যের রিসোর্স দেখে আপনার যাত্রা শুরু করুন।");
  } catch {
    return lang === "en"
      ? "Welcome to Jobayer Group Career! Explore our free resources to start your journey."
      : "জবায়ের গ্রুপ ক্যারিয়ারে আপনাকে স্বাগতম! বিনামূল্যের রিসোর্স দেখে আপনার যাত্রা শুরু করুন।";
  }
}

export async function createCampaign(data: {
  name: string;
  targetStatus?: string;
  targetMinPriority?: number;
  targetDaysSinceContact?: number;
  messageTemplate?: string;
  aiGenerated?: boolean;
}): Promise<OutreachCampaign | null> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    `INSERT INTO wa_outreach_campaigns (name, status, target_status, target_min_priority, target_days_since_contact, message_template, ai_generated, created_at, updated_at)
     VALUES (?, 'draft', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      data.name,
      data.targetStatus || null,
      data.targetMinPriority || 0,
      data.targetDaysSinceContact || 7,
      data.messageTemplate || null,
      data.aiGenerated !== false ? 1 : 0,
    ]
  );
  return queryFirst<OutreachCampaign>(
    { DB: db },
    `SELECT id, name, status, target_status AS targetStatus, target_min_priority AS targetMinPriority,
            target_days_since_contact AS targetDaysSinceContact, message_template AS messageTemplate,
            ai_generated AS aiGenerated, total_targets AS totalTargets, sent_count AS sentCount,
            reply_count AS replyCount, scheduled_at AS scheduledAt, started_at AS startedAt,
            completed_at AS completedAt, created_at AS createdAt, updated_at AS updatedAt
     FROM wa_outreach_campaigns ORDER BY id DESC LIMIT 1`
  );
}

export async function getTargets(campaign: OutreachCampaign, limit = 10): Promise<{ phone: string; name: string | null }[]> {
  const db = await ensureDB();
  const daysAgo = new Date(Date.now() - campaign.targetDaysSinceContact * 86400000).toISOString();
  let statusFilter = "";
  const params: unknown[] = [];
  if (campaign.targetStatus) {
    statusFilter = "AND c.status = ?";
    params.push(campaign.targetStatus);
  }
  params.push(campaign.targetMinPriority, daysAgo, limit);
  return query<{ phone: string; name: string | null }>(
    { DB: db },
    `SELECT c.phone, c.name FROM wa_contacts c
     WHERE c.priority_score >= ?
       AND (c.last_contacted_at IS NULL OR c.last_contacted_at < ?)
       ${statusFilter}
       AND c.phone NOT IN (SELECT phone FROM wa_outreach_log WHERE campaign_id = ?)
     ORDER BY c.priority_score DESC, c.last_contacted_at ASC
     LIMIT ?`,
    [...params, campaign.id, limit]
  );
}

export async function executeCampaign(campaignId: number, batchSize = 10): Promise<{ sent: number; total: number }> {
  const db = await ensureDB();
  const campaign = await queryFirst<OutreachCampaign>(
    { DB: db },
    `SELECT id, name, status, target_status AS targetStatus, target_min_priority AS targetMinPriority,
            target_days_since_contact AS targetDaysSinceContact, message_template AS messageTemplate,
            ai_generated AS aiGenerated, total_targets AS totalTargets, sent_count AS sentCount,
            reply_count AS replyCount, scheduled_at AS scheduledAt, started_at AS startedAt,
            completed_at AS completedAt, created_at AS createdAt, updated_at AS updatedAt
     FROM wa_outreach_campaigns WHERE id = ?`,
    [campaignId]
  );
  if (!campaign || campaign.status !== "running") return { sent: 0, total: 0 };

  const targets = await getTargets(campaign, batchSize);
  if (targets.length === 0) {
    await execute({ DB: db }, "UPDATE wa_outreach_campaigns SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [campaignId]);
    return { sent: 0, total: campaign.totalTargets };
  }

  let sentCount = 0;
  for (const target of targets) {
    const message = await generateOutreachMessage(target.phone, target.name, campaign);
    const queueId = await enqueueMessage(target.phone, message, 1, {
      accountId: "web_main",
      campaignId: String(campaignId),
      messageType: "outreach",
      viaRelay: true,
    });
    await execute(
      { DB: db },
      "INSERT INTO wa_outreach_log (campaign_id, phone, message, status, message_id, created_at) VALUES (?, ?, ?, 'queued', ?, datetime('now'))",
      [campaignId, target.phone, message, queueId || null]
    );
    sentCount++;
  }

  await execute(
    { DB: db },
    "UPDATE wa_outreach_campaigns SET total_targets = total_targets + ?, sent_count = sent_count + ?, updated_at = datetime('now') WHERE id = ?",
    [sentCount, sentCount, campaignId]
  );

  return { sent: sentCount, total: campaign.totalTargets + targets.length };
}

export async function getCampaigns(): Promise<OutreachCampaign[]> {
  const db = await ensureDB();
  return query<OutreachCampaign>(
    { DB: db },
    `SELECT id, name, status, target_status AS targetStatus, target_min_priority AS targetMinPriority,
            target_days_since_contact AS targetDaysSinceContact, message_template AS messageTemplate,
            ai_generated AS aiGenerated, total_targets AS totalTargets, sent_count AS sentCount,
            reply_count AS replyCount, scheduled_at AS scheduledAt, started_at AS startedAt,
            completed_at AS completedAt, created_at AS createdAt, updated_at AS updatedAt
     FROM wa_outreach_campaigns ORDER BY created_at DESC`
  );
}

export async function getCampaignLogs(campaignId: number, limit = 50): Promise<OutreachLog[]> {
  const db = await ensureDB();
  return query<OutreachLog>(
    { DB: db },
    `SELECT id, campaign_id AS campaignId, phone, message, status, replied, error, sent_at AS sentAt
     FROM wa_outreach_log WHERE campaign_id = ? ORDER BY created_at DESC LIMIT ?`,
    [campaignId, limit]
  );
}
