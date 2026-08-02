import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { extractKeywords } from "./analyzer";
import { scoreQuality, QUALITY_THRESHOLD } from "./quality-gate";

export async function consolidateSkills(): Promise<{ faqs: number; shortcuts: number }> {
  const db = await ensureDB();
  const convs = await query<{ phone: string; messages: string; key_points: string }>(
    { DB: db },
    "SELECT phone, messages, key_points FROM ai_conversations WHERE source = 'whatsapp' ORDER BY created_at DESC LIMIT 500"
  );
  const questionCounts = new Map<string, { count: number; answer: string; keywords: string[] }>();
  for (const conv of convs) {
    try {
      const msgs = JSON.parse(conv.messages || "[]");
      for (let i = 0; i < msgs.length - 1; i++) {
        if (msgs[i].role === "user" && msgs[i + 1]?.role === "assistant") {
          const q = msgs[i].content?.substring(0, 200);
          const a = msgs[i + 1]?.content?.substring(0, 500);
          if (q && a && q.length > 5) {
            const key = q.toLowerCase().trim();
            const existing = questionCounts.get(key);
            if (existing) {
              existing.count++;
            } else {
              questionCounts.set(key, { count: 1, answer: a, keywords: extractKeywords(q) });
            }
          }
        }
      }
    } catch {}
  }
  let faqs = 0, shortcuts = 0;
  for (const [question, data] of questionCounts) {
    const qScore = scoreQuality(question, data.answer);
    if (qScore.score < QUALITY_THRESHOLD) continue;

    if (data.count >= 3) {
      const existing = await queryFirst<{ id: number }>(
        { DB: db },
        "SELECT id FROM ai_skills WHERE question = ?", [question]
      );
      if (!existing) {
        await execute({ DB: db },
          "INSERT INTO ai_skills (keywords, question, answer, category, usage_count, created_at, updated_at) VALUES (?, ?, ?, 'auto_learn', ?, datetime('now'), datetime('now'))",
          [data.keywords.join(","), question, data.answer, data.count]
        );
        shortcuts++;
      }
    } else if (data.count >= 2) {
      const existing = await queryFirst<{ id: number }>(
        { DB: db },
        "SELECT id FROM ai_skills WHERE question = ? AND category = 'faq'", [question]
      );
      if (!existing) {
        await execute({ DB: db },
          "INSERT INTO ai_skills (keywords, question, answer, category, usage_count, created_at, updated_at) VALUES (?, ?, ?, 'faq', ?, datetime('now'), datetime('now'))",
          [data.keywords.join(","), question, data.answer, data.count]
        );
        faqs++;
      }
    }
  }
  return { faqs, shortcuts };
}
