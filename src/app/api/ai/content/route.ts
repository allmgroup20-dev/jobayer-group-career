import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { buildContentPrompt, parseContentResponse, getContentIdeas } from "@/lib/ai/content-engine";
import type { ContentType, ContentLanguage } from "@/lib/ai/content-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      type?: ContentType;
      topic?: string;
      language?: ContentLanguage;
      tone?: string;
      keywords?: string[];
      wordCount?: number;
      targetAudience?: string;
    };

    const type = body.type || "blog";
    const topic = body.topic || "";
    const language = body.language || "bn";

    if (!topic) {
      const ideas = getContentIdeas(type, language);
      return NextResponse.json({ ideas, message: "Pick a topic from the list or provide your own." });
    }

    // Build the AI prompt for content generation
    const prompt = buildContentPrompt({
      type,
      topic,
      language,
      tone: (body.tone as any) || "professional",
      keywords: body.keywords,
      wordCount: body.wordCount,
      targetAudience: body.targetAudience,
    });

    // Use the orchestrator's AI model for generation
    const { callAI } = await import("@/lib/ai/router");

    const result = await callAI({
      messages: [
        { role: "system", content: "You are a professional content writer. Generate content in the requested language only. Return valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }, 30000);

    const content = parseContentResponse(result.text || "", language);

    return NextResponse.json({ success: true, ...content, type, language, model: result.model || "default" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message || "Content generation failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const type = (request.nextUrl.searchParams.get("type") || "blog") as ContentType;
  const language = (request.nextUrl.searchParams.get("language") || "bn") as ContentLanguage;
  const ideas = getContentIdeas(type, language);
  return NextResponse.json({ ideas, type, language });
}
