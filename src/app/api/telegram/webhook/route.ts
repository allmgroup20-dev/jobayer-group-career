import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, getBotToken } from "@/lib/telegram/sender";
import { execute } from "@/lib/db/queries";
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
  isWorkerPhone,
  getOrCreateLead,
  updateLeadStatus,
} from "@/lib/ai";
import type { MessageCtx } from "@/lib/ai/brain/types";

function mapChatId(chatId: number | string): string {
  return `tg_${chatId}`;
}

function parseTelegramUpdate(body: any): { chatId: number; text: string; name?: string } | null {
  const msg = body?.message || body?.edited_message;
  if (!msg?.chat?.id || !msg?.text) return null;
  return {
    chatId: msg.chat.id,
    text: msg.text,
    name: msg.from?.first_name
      ? [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" ")
      : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const parsed = parseTelegramUpdate(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }
    const { chatId, text, name } = parsed;
    const phone = mapChatId(chatId);

    const db = await ensureDB();
    await execute(
      { DB: db },
      "INSERT INTO tg_logs (chat_id, message, direction, status, created_at) VALUES (?, ?, 'inbound', 'received', datetime('now'))",
      [String(chatId), text]
    );

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
    const cachedSkill = await findSkill(text);
    if (cachedSkill) {
      reply = cachedSkill;
    } else {
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
      };
      const brainResult = await processMessage(brainCtx);
      reply = brainResult.text;
    }

    await saveMessage(phone, "user", text, { language: lang, painPoints, interests, source: "telegram" });
    await saveMessage(phone, "assistant", reply, { language: lang, source: "telegram" });
    await updateLeadStatus(phone, "replied");

    const sendResult = await sendTelegramMessage(chatId, reply);
    await execute(
      { DB: db },
      "UPDATE tg_logs SET status = ? WHERE chat_id = ? AND direction = 'inbound' AND status = 'received'",
      [sendResult.success ? "replied" : "failed", String(chatId)]
    );

    return NextResponse.json({ ok: true, replied: sendResult.success });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

function calculatePriorityScoreSimple(profile: any): number {
  const gender = profile?.gender_guess;
  const age = profile?.age_group_guess;
  let score = 0;
  if (gender === "female") score += 5;
  if (age === "18-25") score += 3;
  else if (age === "26-35") score += 2;
  if (profile?.sector) score += 2;
  return score;
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: true,
    message: "Telegram webhook endpoint active. Use POST for updates.",
    setup: "Run POST /api/telegram/setup to configure webhook with Telegram servers.",
  });
}
