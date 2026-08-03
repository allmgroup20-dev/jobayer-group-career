import { NextRequest, NextResponse } from "next/server";
import {
  processMessage,
  analyzePainPoints,
  analyzeInterests,
  detectLanguage,
  detectMood,
  getOrCreateProfile,
  updateProfileFromChat,
  saveMessage,
  fastLane,
} from "@/lib/ai";
import type { MessageCtx } from "@/lib/ai/brain/types";

const WEB_CHAT_TIMEOUT = 45000;

// Fail-open when BRAIN_API_SECRET is not configured (matches chat-worker's
// verifyMetaSignature / isAuthorized pattern). The chat-worker will send
// `x-api-key: <BRAIN_API_SECRET>` once the value is set on both workers.
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.BRAIN_API_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("x-api-key") || "";
  const expected = secret;
  if (auth.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { message?: string; sessionId?: string; name?: string };
    const sessionId = (body.sessionId || "").trim();
    const text = (body.message || "").trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ reply: "দয়া করে একটি বার্তা লিখুন।", sessionId });
    }

    // Web chat users are treated as customers. sessionId becomes the brain's
    // conversation key, so web + WhatsApp can share one unified thread.
    const profile = await getOrCreateProfile(sessionId);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await updateProfileFromChat(sessionId, text);

    const brainCtx: MessageCtx = {
      phone: sessionId,
      text,
      name: body.name,
      role: "customer",
      language: lang,
      mood,
      totalChats: profile?.total_chats || 0,
      painPoints,
      interests,
      isWorker: false,
      isPremium: false,
    };

    // Fast Lane: 0-token instant replies (greetings etc.)
    const fastHit = fastLane(text, lang as "en" | "bn");
    if (fastHit) {
      await saveMessage(sessionId, "user", text, { language: lang, painPoints, interests, source: "web" });
      await saveMessage(sessionId, "assistant", fastHit.reply, { language: lang, source: "web" });
      return NextResponse.json({ reply: fastHit.reply, sessionId, fastLane: fastHit.lane });
    }

    const brainResult = await Promise.race([
      processMessage(brainCtx),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Brain processing timed out")), WEB_CHAT_TIMEOUT)
      ),
    ]).catch(() => ({
      text: lang === "en"
        ? "Sorry, the system is currently busy. Please try again shortly."
        : "ক্ষমা করবেন, সিস্টেমটি বর্তমানে ব্যস্ত। দয়া করে একটু পর আবার চেষ্টা করুন।",
      model: "smart-fallback",
      tokens: 0,
      agentsUsed: [],
      departmentsUsed: [],
      department: "customer_experience",
      intent: "general",
      ms: WEB_CHAT_TIMEOUT,
    }));

    const reply = brainResult.text || (lang === "en"
      ? "Sorry, I couldn't process that. Please try again."
      : "ক্ষমা করবেন, আমি উত্তর দিতে পারিনি। আবার চেষ্টা করুন।");

    await saveMessage(sessionId, "user", text, { language: lang, painPoints, interests, source: "web" });
    await saveMessage(sessionId, "assistant", reply, { language: lang, source: "web" });

    return NextResponse.json({ reply, sessionId, mood });
  } catch (error) {
    console.error("Web chat error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Web chat failed",
    }, { status: 500 });
  }
}
