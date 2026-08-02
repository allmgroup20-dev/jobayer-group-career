import { ensureDB } from "@/lib/db";

export interface SMSPayload {
  to: string;
  text: string;
  senderId?: string;
}

export interface SMSLog {
  id: number;
  recipient: string;
  text: string;
  status: "sent" | "failed" | "delivered";
  error: string | null;
  sentAt: string;
}

export async function ensureSMSTables(): Promise<void> {
  const db = await ensureDB();
  await db.prepare(`CREATE TABLE IF NOT EXISTS sms_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, recipient TEXT NOT NULL,
    text TEXT, status TEXT DEFAULT 'sent', error TEXT,
    sent_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS sms_templates (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, text TEXT NOT NULL,
    text_bn TEXT, category TEXT DEFAULT 'general'
  )`).run();
}

export async function sendSMS(payload: SMSPayload): Promise<boolean> {
  const db = await ensureDB();
  const smsApiUrl = typeof process !== "undefined" ? (process.env.SMS_API_URL || "") : "";
  const smsApiKey = typeof process !== "undefined" ? (process.env.SMS_API_KEY || "") : "";
  const defaultSender = typeof process !== "undefined" ? (process.env.SMS_SENDER_ID || "Jobayer") : "Jobayer";

  try {
    if (smsApiUrl && smsApiKey) {
      const res = await fetch(smsApiUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${smsApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          to: payload.to,
          text: payload.text,
          sender_id: payload.senderId || defaultSender,
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown");
        await db.prepare("INSERT INTO sms_logs (recipient, text, status, error) VALUES (?, ?, 'failed', ?)")
          .bind(payload.to, payload.text.slice(0, 200), errText).run();
        return false;
      }
    } else {
      console.log(`[SMS] TO: ${payload.to} | TEXT: ${payload.text.slice(0, 80)}...`);
    }
    await db.prepare("INSERT INTO sms_logs (recipient, text, status) VALUES (?, ?, 'sent')")
      .bind(payload.to, payload.text.slice(0, 200)).run();
    return true;
  } catch (e) {
    const errMsg = (e as Error)?.message || "Unknown error";
    await db.prepare("INSERT INTO sms_logs (recipient, text, status, error) VALUES (?, ?, 'failed', ?)")
      .bind(payload.to, payload.text.slice(0, 200), errMsg).run();
    return false;
  }
}

export async function sendTemplatedSMS(
  to: string, templateId: string, variables: Record<string, string>, lang: string = "en"
): Promise<boolean> {
  const db = await ensureDB();
  const template = await db.prepare("SELECT * FROM sms_templates WHERE id = ?").bind(templateId).first() as any;
  if (!template) return false;

  let text = lang === "bn" && template.text_bn ? template.text_bn : template.text;
  for (const [key, val] of Object.entries(variables)) {
    text = text.replace(new RegExp(`{{${key}}}`, "g"), val);
  }
  return sendSMS({ to, text });
}

export async function seedSMSTemplates(): Promise<void> {
  const db = await ensureDB();
  const existing = await db.prepare("SELECT COUNT(*) as cnt FROM sms_templates").first() as any;
  if (existing && existing.cnt > 0) return;

  const templates = [
    { id: "welcome", name: "Welcome SMS",
      text: "Welcome to Jobayer Group Career, {{name}}! Start your journey: career.jobayergroup.com",
      text_bn: "Jobayer Group Career-এ স্বাগতম {{name}}! আপনার যাত্রা শুরু করুন: career.jobayergroup.com",
      category: "onboarding" },
    { id: "promo", name: "Promotional SMS",
      text: "Special offer for you {{name}}! Join our premium program at {{discount}}% off. Reply for details.",
      text_bn: "আপনার জন্য বিশেষ অফার {{name}}! {{discount}}% ছাড়ে প্রিমিয়াম প্রোগ্রামে যোগ দিন। বিস্তারিত জানতে রিপ্লাই দিন।",
      category: "promotional" },
    { id: "reminder", name: "Reminder SMS",
      text: "Reminder {{name}}: Your course {{course}} starts soon. Don't miss out!",
      text_bn: "রিমাইন্ডার {{name}}: আপনার কোর্স {{course}} শীঘ্রই শুরু হচ্ছে। মিস করবেন না!",
      category: "retention" },
  ];
  for (const t of templates) {
    await db.prepare(
      "INSERT OR IGNORE INTO sms_templates (id, name, text, text_bn, category) VALUES (?, ?, ?, ?, ?)"
    ).bind(t.id, t.name, t.text, t.text_bn, t.category).run();
  }
}
