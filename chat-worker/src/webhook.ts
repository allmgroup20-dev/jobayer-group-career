import type { Env, ChatMessage } from "./types";
import { processAI } from "./ai";
import { getOrCreateSession, saveMessage, getHistory } from "./d1";

export async function handleIncoming(
  env: Env,
  body: { message: string; sessionId?: string; phone?: string; name?: string },
): Promise<{ reply: string; sessionId: string }> {
  const sessionId = body.sessionId || body.phone || `anon_${crypto.randomUUID().slice(0, 8)}`;
  const message = body.message?.trim();

  if (!message) {
    return { reply: "দয়া করে একটি বার্তা লিখুন।", sessionId };
  }

  await getOrCreateSession(env, sessionId);

  await saveMessage(env, sessionId, "user", message);

  const history = await getHistory(env, sessionId);

  const reply = await processAI(env, message, history, sessionId);

  await saveMessage(env, sessionId, "assistant", reply);

  return { reply, sessionId };
}
