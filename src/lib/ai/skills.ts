import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface Skill {
  id: number;
  keywords: string;
  question: string;
  answer: string;
  usage_count: number;
  category: string;
}

export async function findSkill(text: string): Promise<string | null> {
  const db = await ensureDB();
  const skills = await query<Skill>(
    { DB: db },
    "SELECT * FROM ai_skills ORDER BY usage_count DESC"
  );

  const normalizedText = text.toLowerCase();

  for (const skill of skills) {
    const keywords = skill.keywords.split(",").map((k) => k.trim().toLowerCase());
    const matchCount = keywords.filter((k) => normalizedText.includes(k)).length;
    if (matchCount >= 2) {
      await execute(
        { DB: db },
        "UPDATE ai_skills SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?",
        [skill.id]
      );
      return skill.answer;
    }
  }

  return null;
}

export async function saveSkill(
  keywords: string[],
  question: string,
  answer: string,
  category = "general"
): Promise<void> {
  const db = await ensureDB();
  const existing = await queryFirst<Skill>(
    { DB: db },
    "SELECT id FROM ai_skills WHERE question = ?",
    [question]
  );

  if (existing) {
    await execute(
      { DB: db },
      "UPDATE ai_skills SET keywords = ?, answer = ?, usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?",
      [keywords.join(","), answer, existing.id]
    );
  } else {
    await execute(
      { DB: db },
      "INSERT INTO ai_skills (keywords, question, answer, category, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
      [keywords.join(","), question, answer, category]
    );
  }
}
