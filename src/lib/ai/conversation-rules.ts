export const CONVERSATION_RULES_EN =
  `Conversation Rules (follow strictly):
- Every reply must contain 15–40 words.
- Use a maximum of 2 short sentences.
- Keep each sentence under 20 words.
- Discuss only one main idea per reply.
- Use simple, natural, conversational language.
- Never send long paragraphs.
- If more explanation is needed, continue in later replies only after the user responds.`;

export const CONVERSATION_RULES_BN =
  `কথোপকথনের নিয়ম (কঠোরভাবে অনুসরণ করুন):
- প্রতিটি উত্তরে ১৫–৪০ শব্দ থাকবে।
- সর্বোচ্চ ২টি ছোট বাক্য ব্যবহার করুন।
- প্রতিটি বাক্য ২০ শব্দের কম রাখুন।
- একটি উত্তরে শুধুমাত্র একটি মূল বিষয় নিয়ে আলোচনা করুন।
- সহজ, প্রাকৃতিক ও বন্ধুসুলভ ভাষা ব্যবহার করুন।
- কখনো বড় প্যারাগ্রাফ লিখবেন না।
- বেশি ব্যাখ্যার প্রয়োজন হলে, ব্যবহারকারী সাড়া দেওয়ার পর পরবর্তী উত্তরগুলোতে দিন।`;

export function getConversationRules(language: string): string {
  return language === "bn" ? CONVERSATION_RULES_BN : CONVERSATION_RULES_EN;
}

export function enforceWordLimit(
  text: string,
  maxWords = 40,
  maxSentences = 2,
): string {
  let trimmed = text.trim();
  if (!trimmed) return trimmed;

  const sentencePattern = /[.!?]+/g;
  const rawParts = trimmed.split(sentencePattern).filter(Boolean);
  const sentences: string[] = [];
  for (const part of rawParts) {
    const clean = part.trim();
    if (clean) sentences.push(clean);
  }
  if (sentences.length > maxSentences) {
    trimmed = sentences.slice(0, maxSentences).join(". ") + ".";
  }

  const words = trimmed.split(/\s+/);
  if (words.length > maxWords) {
    trimmed = words.slice(0, maxWords).join(" ");
    if (!trimmed.endsWith(".") && !trimmed.endsWith("!") && !trimmed.endsWith("?")) {
      trimmed += ".";
    }
  }

  return trimmed;
}
