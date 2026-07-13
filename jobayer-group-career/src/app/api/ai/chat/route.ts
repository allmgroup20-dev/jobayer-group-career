import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt, workerId, language } = await request.json() as { prompt: string; workerId?: string; language?: string };
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured. Add OPENROUTER_API_KEY in Cloudflare dashboard." }, { status: 500 });
    }

    const context = "Jobayer Group Career MLM platform with unilevel commission, e-commerce, and WhatsApp automation";
    const systemPrompt = language === "bn"
      ? `তুমি Jobayer Group Career-এর একজন AI সহায়ক। প্রসঙ্গ: ${context}\n\nব্যবহারকারীর প্রশ্ন: ${prompt}\n\nবাংলায় উত্তর দাও।`
      : `You are an AI assistant for Jobayer Group Career. Context: ${context}\n\nUser query: ${prompt}\n\nAnswer in English.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "https://jobayer-group.pages.dev",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json() as {
      choices?: { message: { content: string } }[];
      usage?: { total_tokens: number };
      model?: string;
    };

    const text = data.choices?.[0]?.message?.content || "No response generated";
    const model = data.model || "unknown";
    const tokens = data.usage?.total_tokens || 0;

    if (workerId) {
      await execute(await getDB(),
        "INSERT INTO ai_log (worker_id, prompt, response, model, tokens_used) VALUES (?, ?, ?, ?, ?)",
        [workerId, prompt, text, model, tokens]
      );
    }

    return NextResponse.json({ text, model, tokens });
  } catch (error) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
