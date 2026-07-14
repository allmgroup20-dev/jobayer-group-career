import { NextRequest, NextResponse } from "next/server";
import { callAI, buildSystemPrompt, getPersona, analyzePainPoints, analyzeInterests, detectLanguage, getOrCreateProfile, updateProfileFromChat, saveMessage } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, phone, role = "customer", workerId } = await request.json() as {
      prompt: string;
      phone?: string;
      role?: "customer" | "worker" | "admin";
      workerId?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const persona = getPersona(phone);
    const lang = detectLanguage(prompt);
    const painPoints = analyzePainPoints(prompt);
    const interests = analyzeInterests(prompt);

    let profile = null;
    if (phone) {
      profile = await getOrCreateProfile(phone);
      await updateProfileFromChat(phone, prompt);
      await saveMessage(phone, "user", prompt, {
        personaName: persona.name,
        personaGender: persona.gender,
        language: lang,
        painPoints,
        interests,
      });
    }

    const systemPrompt = await buildSystemPrompt({
      role,
      persona,
      profile,
      painPoints,
      interests,
      language: lang,
      phone,
    });

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      maxTokens: 600,
    });

    if (phone) {
      await saveMessage(phone, "assistant", result.text, {
        personaName: persona.name,
        personaGender: persona.gender,
        language: lang,
        painPoints,
        interests,
      });
    }

    return NextResponse.json({
      text: result.text,
      model: result.model,
      tokens: result.tokens,
      persona: persona.name,
      language: lang,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI request failed",
    }, { status: 500 });
  }
}
