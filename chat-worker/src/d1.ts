import type { Env, ChatMessage } from "./types";

export async function getOrCreateSession(env: Env, phone: string): Promise<void> {
  const existing = await env.DB.prepare(
    "SELECT id FROM ai_conversations WHERE phone = ? AND source = 'web' LIMIT 1",
  ).bind(phone).first();

  if (!existing) {
    await env.DB.prepare(
      `INSERT INTO ai_conversations (phone, role, messages, source, language, created_at, updated_at)
       VALUES (?, 'customer', '[]', 'web', 'bn', datetime('now'), datetime('now'))`,
    ).bind(phone).run();
  }
}

export async function saveMessage(
  env: Env,
  phone: string,
  role: "user" | "assistant" | "agent",
  content: string,
): Promise<void> {
  const row = await env.DB.prepare(
    "SELECT messages FROM ai_conversations WHERE phone = ? AND source = 'web' ORDER BY id DESC LIMIT 1",
  ).bind(phone).first<{ messages: string }>();

  let msgs: any[] = [];
  if (row?.messages) {
    try { msgs = JSON.parse(row.messages); } catch { msgs = []; }
  }

  msgs.push({ role, content, created_at: new Date().toISOString() });

  await env.DB.prepare(
    `UPDATE ai_conversations SET messages = ?, updated_at = datetime('now')
     WHERE phone = ? AND source = 'web'
     ORDER BY id DESC LIMIT 1`,
  ).bind(JSON.stringify(msgs), phone).run();
}

export async function getHistory(
  env: Env,
  phone: string,
): Promise<ChatMessage[]> {
  const row = await env.DB.prepare(
    "SELECT messages FROM ai_conversations WHERE phone = ? AND source = 'web' ORDER BY id DESC LIMIT 1",
  ).bind(phone).first<{ messages: string }>();

  if (!row?.messages) return [];
  try {
    const msgs = JSON.parse(row.messages);
    return msgs.map((m: any) => ({
      phone,
      role: m.role,
      content: m.content,
      source: "web" as const,
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getConversations(env: Env): Promise<any[]> {
  const { results } = await env.DB.prepare(
    `SELECT phone, messages, language, updated_at FROM ai_conversations
     WHERE source = 'web' ORDER BY updated_at DESC LIMIT 50`,
  ).all();

  return (results || []).map((r: any) => {
    let lastMsg = "";
    let msgCount = 0;
    try {
      const msgs = JSON.parse(r.messages || "[]");
      msgCount = msgs.length;
      lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].content : "";
    } catch {}

    return {
      phone: r.phone,
      lastMessage: lastMsg.slice(0, 100),
      messageCount: msgCount,
      language: r.language || "bn",
      updatedAt: r.updated_at,
    };
  });
}

export async function markAgentReply(
  env: Env,
  phone: string,
  agentPhone: string,
  message: string,
): Promise<void> {
  await saveMessage(env, phone, "agent", `[${agentPhone}]: ${message}`);
}
