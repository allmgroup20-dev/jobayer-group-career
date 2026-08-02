import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { callAI } from "./router";

interface Conversation {
  id: number;
  phone: string;
  messages: string;
  summary: string;
  keyPoints: string;
  painPoints: string | null;
  interests: string | null;
}

export async function getHistory(phone: string): Promise<{ role: string; content: string }[] | null> {
  const db = await ensureDB();
  const conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT id, messages, summary, key_points FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
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

export async function getKeyPoints(phone: string): Promise<Record<string, any> | null> {
  const db = await ensureDB();
  const conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT key_points FROM ai_conversations WHERE phone = ? AND key_points != '{}' AND key_points IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );
  if (!conv?.keyPoints) return null;
  try {
    return JSON.parse(conv.keyPoints);
  } catch {
    return null;
  }
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
    mood?: string;
    personality?: string;
    buyingStage?: string;
    trustLevel?: string;
    controlResistance?: string;
    manipulationVulnerability?: string;
    fearProfile?: string;
    maskStatus?: string;
  }
): Promise<void> {
  const db = await ensureDB();
  let conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT id, messages, summary, key_points FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );

  let messages: { role: string; content: string }[] = [];
  if (conv?.messages) {
    try { messages = JSON.parse(conv.messages); } catch { messages = []; }
  }

  messages.push({ role, content });
  if (messages.length > 3) messages = messages.slice(-3);

  const serialized = JSON.stringify(messages);
  const messageCount = messages.length;

  let summary = conv?.summary || "";
  if (role === "assistant" && messageCount > 0 && messageCount % 3 === 0) {
    try {
      const summaryResult = await callAI(
        {
          messages: [
            { role: "system", content: "সংক্ষেপে ১ বাক্যে এই কথোপকথনের মূল বিষয় লিখুন। বাংলায়।" },
            { role: "user", content: `কথোপকথন: ${messages.map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}` },
          ],
          temperature: 0.3,
        },
        50
      );
      summary = summaryResult.text.slice(0, 300);
    } catch {}
  }

  let keyPoints: Record<string, any> = {};
  if (conv?.keyPoints) {
    try { keyPoints = JSON.parse(conv.keyPoints); } catch { keyPoints = {}; }
  }
  if (context?.mood) keyPoints.lastMood = context.mood;
  if (context?.personality) keyPoints.personality = context.personality;
  if (context?.buyingStage) keyPoints.buyingStage = context.buyingStage;
  if (context?.painPoints) keyPoints.painPoints = context.painPoints;
  if (context?.interests) keyPoints.interests = context.interests;
  if (context?.trustLevel) keyPoints.trustLevel = context.trustLevel;
  if (context?.controlResistance) keyPoints.controlResistance = context.controlResistance;
  if (context?.manipulationVulnerability) keyPoints.manipulationVulnerability = context.manipulationVulnerability;
  if (context?.fearProfile) keyPoints.fearProfile = context.fearProfile;
  if (context?.maskStatus) keyPoints.maskStatus = context.maskStatus;
  keyPoints.lastMessageCount = (keyPoints.lastMessageCount || 0) + 1;

  if (conv) {
    await execute(
      { DB: db },
      `UPDATE ai_conversations SET messages = ?, summary = COALESCE(?, summary), key_points = ?,
       language = COALESCE(?, language), pain_points = COALESCE(?, pain_points),
       interests = COALESCE(?, interests), updated_at = datetime('now') WHERE id = ?`,
      [
        serialized,
        summary || null,
        JSON.stringify(keyPoints),
        context?.language || null,
        context?.painPoints ? JSON.stringify(context.painPoints) : null,
        context?.interests ? JSON.stringify(context.interests) : null,
        conv.id,
      ]
    );
  } else {
    await execute(
      { DB: db },
      `INSERT INTO ai_conversations (phone, role, messages, summary, key_points, persona_name, persona_gender, language, pain_points, interests, source, created_at, updated_at)
       VALUES (?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        phone,
        serialized,
        summary || null,
        JSON.stringify(keyPoints),
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
