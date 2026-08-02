import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface SkillScore {
  skill: string;
  skillBn: string;
  score: number; // 0-100
  level: "beginner" | "intermediate" | "advanced" | "expert";
  assessmentsDone: number;
  lastAssessed: string | null;
}

const SKILL_LEVEL_CUTOFFS = [
  { max: 25, level: "beginner" as const },
  { max: 50, level: "intermediate" as const },
  { max: 75, level: "advanced" as const },
  { max: 100, level: "expert" as const },
];

export async function ensureSkillScoreTables(): Promise<void> {
  try {
    const db = await ensureDB();
    await db.prepare(`CREATE TABLE IF NOT EXISTS skill_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      skill TEXT NOT NULL,
      score REAL DEFAULT 0,
      assessments_done INTEGER DEFAULT 0,
      last_assessed TEXT,
      UNIQUE(phone, skill)
    )`).run();
  } catch {}
}

export async function getSkillScores(phone: string): Promise<SkillScore[]> {
  const db = await ensureDB();
  try {
    const rows = await query<any>(
      { DB: db },
      `SELECT ss.skill, ss.score, ss.assessments_done, ss.last_assessed,
              COALESCE(s.skill_bn, ss.skill) as skill_bn
       FROM skill_scores ss
       LEFT JOIN skill_definitions s ON s.skill_key = ss.skill
       WHERE ss.phone = ?
       ORDER BY ss.score DESC`,
      [phone]
    );
    return rows.map((r: any) => ({
      skill: r.skill,
      skillBn: r.skill_bn || r.skill,
      score: Math.round(r.score),
      level: getLevel(Math.round(r.score)),
      assessmentsDone: r.assessments_done || 0,
      lastAssessed: r.last_assessed || null,
    }));
  } catch { return []; }
}

export async function updateSkillScore(
  phone: string,
  skill: string,
  newScore: number,
  assessmentsIncrement: number = 1
): Promise<void> {
  const db = await ensureDB();
  // Weighted average: new weight is 1, existing gets weight based on assessments_done
  try {
    const existing = await db.prepare(
      "SELECT score, assessments_done FROM skill_scores WHERE phone = ? AND skill = ?"
    ).bind(phone, skill).first() as any;

    if (existing) {
      const total = existing.assessments_done + assessmentsIncrement;
      const weighted = ((existing.score * existing.assessments_done) + (newScore * assessmentsIncrement)) / total;
      await db.prepare(
        "UPDATE skill_scores SET score = ?, assessments_done = assessments_done + ?, last_assessed = datetime('now') WHERE phone = ? AND skill = ?"
      ).bind(Math.round(weighted * 10) / 10, assessmentsIncrement, phone, skill).run();
    } else {
      await db.prepare(
        "INSERT INTO skill_scores (phone, skill, score, assessments_done, last_assessed) VALUES (?, ?, ?, ?, datetime('now'))"
      ).bind(phone, skill, newScore, assessmentsIncrement).run();
    }
  } catch {}
}

export async function inferSkillFromText(phone: string, text: string): Promise<void> {
  // If user talks about a topic confidently, infer a default score
  const skillPatterns: [RegExp, string, number][] = [
    [/\b(?:I (?:(?:can|could|know|understand|am good at|have experience in)))\b/i, "communication", 40],
    [/\b(?:I (?:can|could|know|understand|) (?:English|ইংরেজি))\b/i, "english", 40],
    [/\b(?:I (?:can|could|know|understand|) (?:marketing|marketing))\b/i, "marketing", 30],
    [/\b(?:I (?:can|could|know|understand|) (?:programming|web))\b/i, "programming", 30],
    [/\b(?:I (?:can|could|know|understand|) (?:design|graphic))\b/i, "design", 30],
    [/\b(?:I (?:have|has|got) (?:leadership|team))\b/i, "leadership", 35],
    [/\b(?:I (?:have|has|got) (?:sales))\b/i, "sales", 35],
    [/\b(?:teach|teach others|train others)\b/i, "teaching", 30],
  ];

  for (const [re, skill, baseScore] of skillPatterns) {
    if (re.test(text)) {
      await updateSkillScore(phone, skill, baseScore, 1);
    }
  }
}

export function buildSkillScoreContext(scores: SkillScore[], lang: string): string {
  if (scores.length === 0) return "";

  const header = lang === "bn"
    ? "## দক্ষতা স্কোর\n"
    : "## Skill Scores\n";

  const lines: string[] = [header];
  for (const s of scores) {
    const levelLabel = lang === "bn"
      ? ({ beginner: "শিক্ষার্থী", intermediate: "মাধ্যমিক", advanced: "উন্নত", expert: "বিশেষজ্ঞ" } as Record<string, string>)
      : ({ beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" } as Record<string, string>);
    const name = lang === "bn" ? s.skillBn : s.skill;
    lines.push(`- **${name.charAt(0).toUpperCase() + name.slice(1)}**: ${s.score}/100 (${levelLabel[s.level]})`);
  }

  return lines.join("\n") + "\n";
}

function getLevel(score: number): "beginner" | "intermediate" | "advanced" | "expert" {
  for (const cutoff of SKILL_LEVEL_CUTOFFS) {
    if (score <= cutoff.max) return cutoff.level;
  }
  return "expert";
}
