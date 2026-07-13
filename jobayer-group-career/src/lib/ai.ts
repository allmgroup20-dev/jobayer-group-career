interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
}

interface AIResponse {
  text: string;
  model: string;
  tokens: number;
}

export async function callOpenRouter(
  request: AIRequest,
  apiKey: string
): Promise<AIResponse> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://jobayer-group-career.workers.dev",
      },
      body: JSON.stringify({
        model: request.model || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: request.maxTokens || 500,
      }),
    });

    const data = await response.json() as {
      choices: { message: { content: string } }[];
      usage: { total_tokens: number };
      model: string;
    };

    return {
      text: data.choices?.[0]?.message?.content || "No response",
      model: data.model || request.model || "unknown",
      tokens: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    throw new Error(`AI API error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function generateAIPrompt(context: string, userQuery: string, language: "en" | "bn" = "en"): string {
  if (language === "bn") {
    return `তুমি Jobayer Group Career-এর একজন AI সহায়ক। প্রসঙ্গ: ${context}\n\nব্যবহারকারীর প্রশ্ন: ${userQuery}\n\nবাংলায় উত্তর দাও।`;
  }
  return `You are an AI assistant for Jobayer Group Career. Context: ${context}\n\nUser query: ${userQuery}\n\nAnswer in English.`;
}
