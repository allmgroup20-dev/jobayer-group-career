import { NextRequest, NextResponse } from "next/server";
import {
  processMessage,
  detectLanguage, detectMood, detectDialect, detectReligion,
  analyzePainPoints, analyzeInterests,
  getOrCreateProfile, isWorkerPhone, getWorkerByPhone,
  getOrCreateLead,
} from "@/lib/ai";
import type { MessageCtx } from "@/lib/ai/brain/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string;
      text: string;
      name?: string;
      role?: string;
    };

    if (!body.phone || !body.text) {
      return NextResponse.json({ error: "phone and text required" }, { status: 400 });
    }

    const { phone, text, name } = body;

    const isWorker = await isWorkerPhone(phone);
    const role = body.role === "admin" ? "admin" : isWorker ? "worker" : "customer";

    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const dialect = detectDialect(text);
    const religion = detectReligion(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await getOrCreateLead(phone);

    const ctx: MessageCtx = {
      phone,
      text,
      name: name || profile?.name_guess || undefined,
      role,
      language: lang,
      mood,
      dialect,
      religion,
      totalChats: profile?.total_chats || 0,
      painPoints,
      interests,
      isWorker,
    };

    const result = await processMessage(ctx);

    return NextResponse.json({
      success: true,
      reply: result.text,
      model: result.model,
      tokens: result.tokens,
      agentsUsed: result.agentsUsed,
      department: result.department,
      intent: result.intent,
      processingMs: result.ms,
    });
  } catch (error) {
    console.error("Brain chat error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Brain chat failed",
    }, { status: 500 });
  }
}
