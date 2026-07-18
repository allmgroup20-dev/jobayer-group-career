import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { callAI } from "./router";

interface Conversation {
  id: number;
  phone: string;
  role: string;
  messages: string;
  summary: string;
  persona_name: string | null;
  persona_gender: string | null;
  language: string;
  pain_points: string | null;
  interests: string | null;
  created_at: string;
  updated_at: string;
}

export async function getHistory(phone: string): Promise<{ role: string; content: string }[] | null> {
  const db = await ensureDB();
  const conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT id, messages, summary, updated_at FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );

  if (!conv?.messages) return null;

  try {
    return JSON.parse(conv.messages) as { role: string; content: string }[];
  } catch {
    return null;
  }
}

export async function getSummary(phone: string): Promise<string | null> {
  const db = await ensureDB();
  const conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT summary FROM ai_conversations WHERE phone = ? AND summary != '' ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );
  return conv?.summary || null;
}

export async function saveMessage(
  phone: string,
  role: "user" | "assistant" | "system",
  content: string,
  context?: {
    personaName?: string;
    personaGender?: string;
    language?: string;
    painPoints?: string[];
    interests?: string[];
    source?: string;
  }
): Promise<void> {
  const db = await ensureDB();
  let conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT id, messages, summary, updated_at FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );

  let messages: { role: string; content: string }[] = [];
  if (conv?.messages) {
    try {
      messages = JSON.parse(conv.messages);
    } catch {
      messages = [];
    }
  }

  messages.push({ role, content });

  if (messages.length > 100) {
    messages = messages.slice(-100);
  }

  const serialized = JSON.stringify(messages);
  const messageCount = messages.length;

  // Generate summary every 5 assistant messages
  let summary = conv?.summary || "";
  if (role === "assistant" && messageCount > 0 && messageCount % 5 === 0) {
    try {
      const summaryResult = await callAI(
        {
          messages: [
            { role: "system", content: "সংক্ষেপে ১ বাক্যে এই কথোপকথনের মূল বিষয় লিখুন। শুধু বিষয়বস্তু, কোন মেটা তথ্য নয়। বাংলায় লিখুন।" },
            { role: "user", content: `কথোপকথন: ${messages.slice(-10).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}` },
          ],
          temperature: 0.3,
        },
        50
      );
      summary = summaryResult.text.slice(0, 300);
    } catch {}
  }

  if (conv) {
    await execute(
      { DB: db },
      `UPDATE ai_conversations SET messages = ?, summary = COALESCE(?, summary), language = COALESCE(?, language),
       pain_points = COALESCE(?, pain_points), interests = COALESCE(?, interests),
       updated_at = datetime('now') WHERE id = ?`,
      [
        serialized,
        summary || null,
        context?.language || null,
        context?.painPoints ? JSON.stringify(context.painPoints) : null,
        context?.interests ? JSON.stringify(context.interests) : null,
        conv.id,
      ]
    );
  } else {
    await execute(
      { DB: db },
      `INSERT INTO ai_conversations (phone, role, messages, summary, persona_name, persona_gender, language, pain_points, interests, source, created_at, updated_at)
       VALUES (?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        phone,
        serialized,
        summary || null,
        context?.personaName || null,
        context?.personaGender || null,
        context?.language || "bn",
        context?.painPoints ? JSON.stringify(context.painPoints) : null,
        context?.interests ? JSON.stringify(context.interests) : null,
        context?.source || "whatsapp",
      ]
    );
  }
}
