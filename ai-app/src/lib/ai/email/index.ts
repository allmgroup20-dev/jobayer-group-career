import { ensureDB } from "@/lib/db";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: { filename: string; content: string }[];
}

export async function ensureEmailTables(): Promise<void> {
  const db = await ensureDB();
  await db.prepare(`CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, recipient TEXT NOT NULL,
    subject TEXT NOT NULL, html_body TEXT, status TEXT DEFAULT 'sent',
    error TEXT, sent_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, subject TEXT NOT NULL,
    subject_bn TEXT, html_body TEXT NOT NULL, html_body_bn TEXT,
    category TEXT DEFAULT 'general'
  )`).run();
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const db = await ensureDB();
  const sendgridKey = typeof process !== "undefined" ? (process.env.SENDGRID_API_KEY || "") : "";

  try {
    if (sendgridKey) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${sendgridKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: "noreply@jobayergroup.com", name: "Jobayer Group Career" },
          subject: payload.subject,
          content: [{ type: "text/html", value: payload.html }],
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown");
        await db.prepare("INSERT INTO email_logs (recipient, subject, status, error) VALUES (?, ?, 'failed', ?)")
          .bind(payload.to, payload.subject, errText).run();
        return false;
      }
    }
    console.log(`[Email] TO: ${payload.to} | SUBJECT: ${payload.subject}`);
    await db.prepare("INSERT INTO email_logs (recipient, subject, html_body, status) VALUES (?, ?, ?, 'sent')")
      .bind(payload.to, payload.subject, payload.html.slice(0, 500)).run();
    return true;
  } catch (e) {
    const errMsg = (e as Error)?.message || "Unknown error";
    await db.prepare("INSERT INTO email_logs (recipient, subject, status, error) VALUES (?, ?, 'failed', ?)")
      .bind(payload.to, payload.subject, errMsg).run();
    return false;
  }
}

export async function seedEmailTemplates(): Promise<void> {
  const db = await ensureDB();
  const existing = await db.prepare("SELECT COUNT(*) as cnt FROM email_templates").first() as any;
  if (existing && existing.cnt > 0) return;

  const templates = [
    { id: "welcome", name: "Welcome Email",
      subject: "Welcome to Jobayer Group Career!",
      subject_bn: "Jobayer Group Career-এ আপনাকে স্বাগতম!",
      html_body: "<h1>Welcome {{name}}!</h1><p>Thank you for joining. Get started: <a href='https://career.jobayergroup.com/training'>Start Learning</a></p>",
      html_body_bn: "<h1>{{name}} আপনাকে স্বাগতম!</h1><p>যোগ দেওয়ার জন্য ধন্যবাদ। শুরু করুন: <a href='https://career.jobayergroup.com/training'>শেখা শুরু করুন</a></p>",
      category: "onboarding" },
    { id: "purchase_confirmation", name: "Purchase Confirmation",
      subject: "Your purchase is confirmed!",
      subject_bn: "আপনার ক্রয় নিশ্চিত হয়েছে!",
      html_body: "<h1>Thank you, {{name}}!</h1><p>Purchased: {{product}} (Amount: {{amount}} ৳)</p><p>Order ID: {{orderId}}</p>",
      html_body_bn: "<h1>{{name}}, ধন্যবাদ!</h1><p>কেনেছেন: {{product}} (পরিমাণ: {{amount}} ৳)</p><p>অর্ডার আইডি: {{orderId}}</p>",
      category: "transaction" },
    { id: "inactivity", name: "Inactivity Reminder",
      subject: "We miss you at Jobayer Group Career!",
      subject_bn: "Jobayer Group Career-এ আপনাকে মিস করছি!",
      html_body: "<h1>Hi {{name}},</h1><p>It's been a while. Check out our latest courses.</p><p><a href='https://career.jobayergroup.com'>Visit Now</a></p>",
      html_body_bn: "<h1>হাই {{name}},</h1><p>আপনাকে অনেক দিন দেখছি না। নতুন কোর্স দেখুন।</p><p><a href='https://career.jobayergroup.com'>এখনই দেখুন</a></p>",
      category: "retention" },
  ];
  for (const t of templates) {
    await db.prepare(
      "INSERT OR IGNORE INTO email_templates (id, name, subject, subject_bn, html_body, html_body_bn, category) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(t.id, t.name, t.subject, t.subject_bn, t.html_body, t.html_body_bn, t.category).run();
  }
}
