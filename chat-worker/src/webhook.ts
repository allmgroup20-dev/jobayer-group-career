import type { Env, ChatMessage } from "./types";
import { processAI } from "./ai";
import { getOrCreateSession, saveMessage, getHistory } from "./d1";

const BRAIN_TIMEOUT_MS = 30_000;

// Route web chat through the ai-app brain (/api/chat/web) so web + WhatsApp
// share ONE AI thread (history, memory, intent). Falls back to the local
// OpenRouter call when the brain is unreachable.
async function callBrain(env: Env, sessionId: string, message: string): Promise<string | null> {
  const base = (env.BRAIN_API_URL || "https://jgcareer-ai.allmgroup20.workers.dev").replace(/\/+$/, "");
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), BRAIN_TIMEOUT_MS);
    const res = await fetch(`${base}/api/chat/web`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[Brain] POST ${base}/api/chat/web -> ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }
    const data = await res.json() as { reply?: string };
    return data?.reply || null;
  } catch (e) {
    console.error("[Brain] call failed:", (e as Error)?.message || String(e));
    return null;
  }
}

export async function handleIncoming(
  env: Env,
  body: { message: string; sessionId?: string; phone?: string; name?: string },
): Promise<{ reply: string; sessionId: string; total: number }> {
  const sessionId = body.sessionId || body.phone || `anon_${crypto.randomUUID().slice(0, 8)}`;
  const message = body.message?.trim();

  if (!message) {
    return { reply: "দয়া করে একটি বার্তা লিখুন।", sessionId, total: 0 };
  }

  await getOrCreateSession(env, sessionId);

  await saveMessage(env, sessionId, "user", message);

  const history = await getHistory(env, sessionId);

  const brainReply = await callBrain(env, sessionId, message);
  const reply = brainReply ?? (await processAI(env, message, history, sessionId));

  await saveMessage(env, sessionId, "assistant", reply);

  const totalMessages = (await getHistory(env, sessionId)).length;

  return { reply, sessionId, total: totalMessages };
}
