import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface Conversation {
  id: number;
  phone: string;
  role: string;
  messages: string;
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
    "SELECT * FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
    [phone]
  );

  if (!conv?.messages) return null;

  try {
    return JSON.parse(conv.messages) as { role: string; content: string }[];
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
  }
): Promise<void> {
  const db = await ensureDB();
  let conv = await queryFirst<Conversation>(
    { DB: db },
    "SELECT * FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 1",
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

  if (conv) {
    await execute(
      { DB: db },
      `UPDATE ai_conversations SET messages = ?, language = COALESCE(?, language),
       pain_points = COALESCE(?, pain_points), interests = COALESCE(?, interests),
       updated_at = datetime('now') WHERE id = ?`,
      [
        serialized,
        context?.language || null,
        context?.painPoints ? JSON.stringify(context.painPoints) : null,
        context?.interests ? JSON.stringify(context.interests) : null,
        conv.id,
      ]
    );
  } else {
    await execute(
      { DB: db },
      `INSERT INTO ai_conversations (phone, role, messages, persona_name, persona_gender, language, pain_points, interests, source, created_at, updated_at)
       VALUES (?, 'customer', ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        phone,
        serialized,
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
