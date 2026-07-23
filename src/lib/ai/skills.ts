import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { semanticSearch, type SkillEntry } from "./semantic-cache";

interface Skill {
  id: number;
  keywords: string;
  question: string;
  answer: string;
  usage_count: number;
  category: string;
  updated_by: string;
  manual_override: number;
}

async function logAudit(
  db: D1Database,
  skillId: number,
  action: string,
  fieldName: string | null,
  oldValue: string | null,
  newValue: string | null,
  updatedBy: string
): Promise<void> {
  try {
    await execute(
      { DB: db },
      `INSERT INTO skill_audit_log (skill_id, action, field_name, old_value, new_value, updated_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [skillId, action, fieldName, oldValue, newValue, updatedBy]
    );
  } catch {}
}

export async function findSkill(text: string, phone = ""): Promise<string | null> {
  try {
    const db = await ensureDB();
    const skills = await query<Skill>(
      { DB: db },
      "SELECT id, keywords, question, answer, usage_count FROM ai_skills WHERE manual_override = 1 OR usage_count > 3 ORDER BY usage_count DESC LIMIT 500"
    );
    if (skills.length === 0) return null;

    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/[\s,;:.!?()\[\]{}""'']+/).filter((w) => w.length > 2);

    // Pass 1: Fast keyword matching (existing)
    for (const skill of skills) {
      const keywords = skill.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
      if (keywords.length === 0) continue;
      let matchCount = 0;
      for (const keyword of keywords) {
        if (!keyword) continue;
        if (normalizedText.includes(keyword)) matchCount++;
        else if (words.some((w) => w.includes(keyword) || keyword.includes(w))) matchCount++;
      }
      const minRequired = Math.max(2, Math.ceil(keywords.length * 0.3));
      if (matchCount >= minRequired) {
        await execute(
          { DB: db },
          "UPDATE ai_skills SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?",
          [skill.id]
        );
        return skill.answer;
      }
    }

    // Pass 2: Semantic matching (TF-IDF + cosine similarity) — zero API cost
    const skillEntries: SkillEntry[] = skills.map(s => ({
      id: s.id, question: s.question, answer: s.answer, keywords: s.keywords,
    }));
    const semanticHit = semanticSearch(text, skillEntries);
    if (semanticHit) {
      await execute(
        { DB: db },
        "UPDATE ai_skills SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?",
        [semanticHit.skill.id]
      );
      return semanticHit.skill.answer;
    }

    return null;
  } catch (e) {
    console.error("[Skills] findSkill error:", (e as Error)?.message);
    return null;
  }
}

export async function saveSkill(
  keywords: string[],
  question: string,
  answer: string,
  category = "general",
  updatedBy = ""
): Promise<void> {
  try {
    const db = await ensureDB();
    const normalizedQuestion = question.toLowerCase().trim();

    // Step 1: Exact match
    let existing = await queryFirst<Skill>(
      { DB: db },
      "SELECT id, answer, keywords FROM ai_skills WHERE LOWER(question) = ?",
      [normalizedQuestion]
    );

    // Step 2: Semantic dedup — check if a semantically similar skill exists
    if (!existing) {
      const allSkills = await query<Skill>(
        { DB: db },
        "SELECT id, keywords, question, answer FROM ai_skills LIMIT 500"
      );
      const entries: SkillEntry[] = allSkills.map(s => ({
        id: s.id, question: s.question, answer: s.answer, keywords: s.keywords,
      }));
      const semanticHit = semanticSearch(question, entries);
      if (semanticHit && semanticHit.score > 0.25) {
        existing = allSkills.find(s => s.id === semanticHit.skill.id) || null;
      }
    }

    if (existing) {
      const oldAnswer = existing.answer || "";
      const oldKeywords = existing.keywords || "";
      const newKeywordsStr = keywords.join(",");

      if (oldAnswer !== answer) {
        await logAudit(db, existing.id, "updated", "answer", oldAnswer, answer, updatedBy);
      }
      if (oldKeywords !== newKeywordsStr) {
        await logAudit(db, existing.id, "updated", "keywords", oldKeywords, newKeywordsStr, updatedBy);
      }

      await execute(
        { DB: db },
        `UPDATE ai_skills SET keywords = ?, answer = ?, usage_count = usage_count + 1,
         updated_by = COALESCE(NULLIF(?, ''), updated_by), updated_at = datetime('now') WHERE id = ?`,
        [newKeywordsStr, answer, updatedBy, existing.id]
      );
    } else {
      const result = await execute(
        { DB: db },
        `INSERT INTO ai_skills (keywords, question, answer, category, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [keywords.join(","), question, answer, category, updatedBy]
      );

      const newId = (result as any)?.meta?.last_row_id || 0;
      if (newId > 0) {
        await logAudit(db, newId, "created", null, null, answer, updatedBy);
      }
    }
  } catch (e) {
    console.error("[Skills] saveSkill error:", (e as Error)?.message);
  }
}

export async function getSkillHistory(): Promise<any[]> {
  const db = await ensureDB();
  const skills = await query<Skill>(
    { DB: db },
    "SELECT s.*, COALESCE(u.employee_name, '') as updated_by_name FROM ai_skills s LEFT JOIN (SELECT DISTINCT phone, name as employee_name FROM workers) u ON u.phone = s.updated_by ORDER BY s.updated_at DESC LIMIT 500"
  );

  const result = [];
  for (const skill of skills) {
    const auditLog = await query(
      { DB: db },
      "SELECT id, skill_id, action, details, created_at FROM skill_audit_log WHERE skill_id = ? ORDER BY created_at DESC LIMIT 10",
      [skill.id]
    );
    result.push({
      ...skill,
      is_psychologist_updated: skill.updated_by !== "",
      manual_override: skill.manual_override || 0,
      audit_log: auditLog,
    });
  }
  return result;
}
