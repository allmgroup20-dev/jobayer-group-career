import type { Env, ChatMessage } from "./types";

const SYSTEM_PROMPT = `You are a helpful assistant for Jobayer Group Career (জোবায়ের গ্রুপ ক্যারিয়ার). 
You help with career guidance, course information, and business opportunities.
Respond naturally in the same language the user writes in (Bengali or English).
Keep responses concise, friendly, and helpful.
If the user writes in Bengali, respond in Bengali. If they write in English, respond in English.
For career-related questions, provide practical advice about freelancing, digital marketing, web design, graphics design, and other skills.
For business questions, explain the MLM/network marketing opportunity professionally.
Never make unrealistic income promises.
Always be honest and transparent.`;

const LANGS = ["bn", "en", "bn-en"] as const;
type Lang = (typeof LANGS)[number];

function detectLanguage(text: string): Lang {
  const bnChar = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const enChar = text.replace(/[\u0980-\u09FF\s]/g, "").length;
  if (bnChar > enChar * 2) return "bn";
  if (bnChar > enChar * 0.3) return "bn-en";
  return "en";
}

const FAST_LANES: [RegExp, string][] = [
  [/^(hi|hello|hey|assalamualaikum|ওয়ে|হ্যালো|হাই|আসলামুআলাইকুম|আসসালামুআলাইকুম|سلام)\b/i, "greeting"],
  [/^(thanks|thank you|ধন্যবাদ|জাজাকাল্লাহ)\b/i, "thanks"],
  [/^(bye|goodbye|allah hafez|আল্লাহ হাফেজ|বাই)\b/i, "farewell"],
];

const FAST_REPLIES: Record<string, Record<string, string>> = {
  greeting: {
    bn: "ওয়ে! 👋 আমি জোবায়ের গ্রুপ ক্যারিয়ারের সহকারী। আজ আপনাকে কিভাবে সাহায্য করতে পারি?",
    en: "Hey! 👋 I'm your Jobayer Group Career assistant. How can I help you today?",
    "bn-en": "ওয়ে! 👋 I'm your Jobayer Group Career assistant. কিভাবে সাহায্য করতে পারি?",
  },
  thanks: {
    bn: "আপনাকে ধন্যবাদ! 😊 অন্য কিছু জানতে চান?",
    en: "Thank you! 😊 Anything else you'd like to know?",
    "bn-en": "Thank you! 😊 অন্য কিছু জানতে চান?",
  },
  farewell: {
    bn: "আল্লাহ হাফেজ! 👋 আবার কথা হবে।",
    en: "Goodbye! 👋 Talk to you later.",
    "bn-en": "Allah Hafez! 👋 Talk to you later.",
  },
};

function getFastReply(text: string, lang: Lang): string | null {
  for (const [pattern, lane] of FAST_LANES) {
    if (pattern.test(text.trim())) {
      return FAST_REPLIES[lane]?.[lang] ?? FAST_REPLIES[lane].en;
    }
  }
  return null;
}

function buildContext(messages: ChatMessage[]): string {
  const recent = messages.slice(-6);
  return recent.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
}

export async function processAI(
  env: Env,
  text: string,
  history: ChatMessage[],
  phone: string,
): Promise<string> {
  const lang = detectLanguage(text);

  const fast = getFastReply(text, lang);
  if (fast) return fast;

  const systemMsg = { role: "system", content: SYSTEM_PROMPT };
  const context = buildContext(history);
  const userMsg = {
    role: "user",
    content: context
      ? `Previous conversation:\n${context}\n\nUser: ${text}`
      : text,
  };

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return "দুঃখিত, বর্তমানে সিস্টেম কনফিগার করা নেই। পরে আবার চেষ্টা করুন।";
  }

  try {
    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://career.jobayergroup.com",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [systemMsg, ...history.slice(-10).map(m => ({
            role: m.role === "agent" ? "assistant" : m.role,
            content: m.content,
          })), userMsg],
          max_tokens: 500,
          temperature: 0.7,
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter error:", res.status, errText);
      return "দুঃখিত, একটি ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন।";
    }

    const data: any = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return "দুঃখিত, উত্তর পেতে ব্যর্থ হয়েছে।";
    }
    return reply;
  } catch (err) {
    console.error("AI call failed:", err);
    return "দুঃখিত, সংযোগে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।";
  }
}
