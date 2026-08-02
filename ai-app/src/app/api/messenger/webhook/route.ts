import { NextRequest, NextResponse } from "next/server";
import { sendMessengerMessage } from "@/lib/messenger/sender";
import { ensureDB } from "@/lib/db";
import {
  processMessage,
  analyzePainPoints,
  analyzeInterests,
  detectLanguage,
  detectMood,
  detectDialect,
  detectReligion,
  getOrCreateProfile,
  updateProfileFromChat,
  updateProfileScore,
  saveMessage,
  findSkill,
  fastLane,
  saveSkill,
  extractKeywords,
  isWorkerPhone,
  getWorkerPremiumStatus,
  getOrCreateLead,
  updateLeadStatus,
} from "@/lib/ai";
import { recordPlatformActivity } from "@/lib/platform-router";
import { linkWorkerToAgent, saveAgentKnowledge } from "@/lib/ai/brain/employee-link";
import { scoreQuality, QUALITY_THRESHOLD } from "@/lib/ai/quality-gate";
import { enforceWordLimit } from "@/lib/ai/conversation-rules";
import type { MessageCtx } from "@/lib/ai/brain/types";

function mapSenderId(senderId: string): string {
  return `fb_${senderId}`;
}

function parseMessengerUpdate(body: any): { senderId: string; text: string; name?: string } | null {
  const messaging = body?.entry?.[0]?.messaging?.[0];
  if (!messaging?.sender?.id || !messaging?.message?.text) return null;
  return {
    senderId: messaging.sender.id,
    text: messaging.message.text,
    name: messaging.sender.name || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const parsed = parseMessengerUpdate(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }
    const { senderId, text, name } = parsed;
    const phone = mapSenderId(senderId);

    const isWorker = await isWorkerPhone(phone);
    const role = isWorker ? "worker" : "customer";

    await getOrCreateLead(phone);

    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const dialect = detectDialect(text);
    const religion = detectReligion(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await updateProfileFromChat(phone, text);

    const score = calculatePriorityScoreSimple(profile);
    if (score > 0) {
      await updateProfileScore(phone, score);
    }

    const totalMessages = (profile?.total_chats || 0) + 1;
    let funnelStage: string | undefined;
    if (role === "customer") {
      if (totalMessages <= 4) funnelStage = "1-4";
      else if (totalMessages <= 6) funnelStage = "5-6";
      else if (totalMessages <= 8) funnelStage = "7-8";
      else if (totalMessages <= 10) funnelStage = "9-10";
      else funnelStage = "11-12";
    }

    let reply: string | null = null;

    // ── Fast Lane: 0-token instant replies ──
    const fastHit = fastLane(text, lang as "en" | "bn");
    if (fastHit) {
      reply = fastHit.reply;
    } else {
      const cachedSkill = await findSkill(text);
      if (cachedSkill) {
        reply = cachedSkill;
      } else {
        const isPremium = isWorker ? await getWorkerPremiumStatus(phone) : false;
        const brainCtx: MessageCtx = {
          phone,
          text,
          name,
          role,
          language: lang,
          mood,
          dialect,
          religion,
          funnelStage,
          totalChats: profile?.total_chats || 0,
          painPoints,
          interests,
          isWorker,
          isPremium,
        };
        const brainResult = await processMessage(brainCtx);
        reply = brainResult.text;

        if (isWorker && brainResult.agentsUsed.length > 0) {
          const db = await ensureDB();
          const agentName = brainResult.agentsUsed[0];
          await linkWorkerToAgent(db, phone, agentName, agentName);
          await saveAgentKnowledge(db, phone, agentName, agentName, reply.slice(0, 1000));
        }
      }
    }

    reply = enforceWordLimit(reply);

    // Skip auto-save for fast lane replies (zero-token, no AI involved)
    if (!fastHit) {
      try {
        const keywords = extractKeywords(text);
        const q = scoreQuality(text, reply || "");
        if (q.score >= QUALITY_THRESHOLD && keywords.length >= 2) {
          await saveSkill(keywords, text, reply!, "auto_learned");
        }
      } catch (e) {
        console.error("[Skills] Failed to auto-save:", (e as Error)?.message);
      }
    }

    await recordPlatformActivity(phone, "messenger");

    await saveMessage(phone, "user", text, { language: lang, painPoints, interests, source: "messenger" });
    await saveMessage(phone, "assistant", reply, { language: lang, source: "messenger" });
    await updateLeadStatus(phone, "replied");

    const sendResult = await sendMessengerMessage(senderId, reply);

    return NextResponse.json({ ok: true, replied: sendResult.success });
  } catch (error) {
    console.error("Messenger webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

function calculatePriorityScoreSimple(profile: any): number {
  let score = 0;
  if (profile?.gender_guess === "female") score += 5;
  if (profile?.age_group_guess === "18-25") score += 3;
  else if (profile?.age_group_guess === "26-35") score += 2;
  if (profile?.sector) score += 2;
  return score;
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.MESSENGER_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
