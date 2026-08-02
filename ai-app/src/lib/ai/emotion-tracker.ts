import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface EmotionEntry {
  id: number;
  phone: string;
  mood: string;
  trust_level: string | null;
  fear_profile: string | null;
  decision_mode: string | null;
  trigger_event: string | null;
  recorded_at: string;
}

export interface EmotionSummary {
  phone: string;
  totalEntries: number;
  moodDistribution: Record<string, number>;
  currentMood: string;
  trend: "improving" | "declining" | "stable" | "volatile";
  dominantMood: string;
  moodStability: number;
  negativeRatio: number;
  lastPositive: string | null;
  lastNegative: string | null;
  riskLevel: "low" | "medium" | "high";
}

const NEGATIVE_MOODS = ["skeptical", "bored", "distracted"];
const POSITIVE_MOODS = ["enthusiastic"];

export async function logEmotion(
  phone: string,
  mood: string,
  trustLevel?: string,
  fearProfile?: string,
  decisionMode?: string,
  triggerEvent?: string
): Promise<void> {
  const db = await ensureDB();
  try {
    await execute(
      { DB: db },
      `INSERT INTO emotion_timeline (phone, mood, trust_level, fear_profile, decision_mode, trigger_event, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [phone, mood, trustLevel || null, fearProfile || null, decisionMode || null, triggerEvent || null]
    );
  } catch {
    try {
      await execute({ DB: db }, "CREATE TABLE IF NOT EXISTS emotion_timeline (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, mood TEXT NOT NULL, trust_level TEXT, fear_profile TEXT, decision_mode TEXT, trigger_event TEXT, recorded_at TEXT NOT NULL)");
      await execute({ DB: db }, "CREATE INDEX IF NOT EXISTS idx_emotion_phone ON emotion_timeline(phone)");
      await execute({ DB: db }, "CREATE INDEX IF NOT EXISTS idx_emotion_recorded ON emotion_timeline(recorded_at)");
      await execute(
        { DB: db },
        `INSERT INTO emotion_timeline (phone, mood, trust_level, fear_profile, decision_mode, trigger_event, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [phone, mood, trustLevel || null, fearProfile || null, decisionMode || null, triggerEvent || null]
      );
    } catch {}
  }
}

export async function getEmotionHistory(
  phone: string,
  days: number = 30
): Promise<EmotionEntry[]> {
  const db = await ensureDB();
  try {
    return query<EmotionEntry>(
      { DB: db },
      `SELECT id, phone, mood, trust_level, fear_profile, decision_mode, trigger_event, recorded_at
       FROM emotion_timeline
       WHERE phone = ? AND recorded_at > datetime('now', ?)
       ORDER BY recorded_at DESC`,
      [phone, `-${days} days`]
    );
  } catch {
    return [];
  }
}

export async function analyzeEmotionTrend(phone: string, days: number = 30): Promise<EmotionSummary> {
  const entries = await getEmotionHistory(phone, days);
  const totalEntries = entries.length;

  if (totalEntries === 0) {
    return {
      phone, totalEntries: 0, moodDistribution: {},
      currentMood: "unknown", trend: "stable", dominantMood: "unknown",
      moodStability: 0, negativeRatio: 0,
      lastPositive: null, lastNegative: null, riskLevel: "low",
    };
  }

  // Mood distribution
  const moodDistribution: Record<string, number> = {};
  for (const e of entries) {
    moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
  }

  // Current mood = most recent
  const currentMood = entries[0].mood;

  // Dominant mood = most frequent
  let dominantMood = "unknown";
  let maxCount = 0;
  for (const [mood, count] of Object.entries(moodDistribution)) {
    if (count > maxCount) { maxCount = count; dominantMood = mood; }
  }

  // Negative ratio
  let negativeCount = 0;
  for (const e of entries) {
    if (NEGATIVE_MOODS.includes(e.mood)) negativeCount++;
  }
  const negativeRatio = totalEntries > 0 ? negativeCount / totalEntries : 0;

  // Mood stability: how many times mood changed vs total entries
  let moodChanges = 0;
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].mood !== entries[i + 1].mood) moodChanges++;
  }
  const moodStability = totalEntries > 1 ? Math.max(0, 1 - (moodChanges / (totalEntries - 1))) : 1;

  // Trend detection
  const firstHalf = entries.slice(Math.floor(entries.length / 2));
  const secondHalf = entries.slice(0, Math.floor(entries.length / 2));
  const firstHalfNegative = firstHalf.filter((e) => NEGATIVE_MOODS.includes(e.mood)).length / Math.max(firstHalf.length, 1);
  const secondHalfNegative = secondHalf.filter((e) => NEGATIVE_MOODS.includes(e.mood)).length / Math.max(secondHalf.length, 1);

  let trend: "improving" | "declining" | "stable" | "volatile";
  const diff = secondHalfNegative - firstHalfNegative;
  if (Math.abs(diff) < 0.1) trend = "stable";
  else if (diff < -0.1) trend = "improving";
  else if (diff > 0.1) trend = "declining";
  else trend = "stable";

  // Volatile if high mood change rate
  if (moodStability < 0.3 && totalEntries > 5) trend = "volatile";

  // Last positive/negative timestamps
  const lastPositive = entries.find((e) => POSITIVE_MOODS.includes(e.mood));
  const lastNegative = entries.find((e) => NEGATIVE_MOODS.includes(e.mood));

  // Risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  if (negativeRatio > 0.5 && trend === "declining") riskLevel = "high";
  else if (negativeRatio > 0.3 || trend === "declining") riskLevel = "medium";

  return {
    phone, totalEntries, moodDistribution,
    currentMood, trend, dominantMood,
    moodStability: Math.round(moodStability * 100),
    negativeRatio: Math.round(negativeRatio * 100),
    lastPositive: lastPositive?.recorded_at || null,
    lastNegative: lastNegative?.recorded_at || null,
    riskLevel,
  };
}

export function buildEmotionContext(summary: EmotionSummary, lang: string): string {
  if (summary.totalEntries === 0) return "";

  const moodLabel = lang === "bn"
    ? ({ enthusiastic: "উৎসাহী", neutral: "নিরপেক্ষ", skeptical: "সন্দেহপ্রবণ", bored: "উদাসীন", distracted: "বিভ্রান্ত" } as Record<string, string>)
    : ({ enthusiastic: "Enthusiastic", neutral: "Neutral", skeptical: "Skeptical", bored: "Bored", distracted: "Distracted" } as Record<string, string>);

  const trendLabel = lang === "bn"
    ? ({ improving: "উন্নতি", declining: "অবনতি", stable: "স্থিতিশীল", volatile: "অস্থির" } as Record<string, string>)
    : ({ improving: "Improving", declining: "Declining", stable: "Stable", volatile: "Volatile" } as Record<string, string>);

  const riskLabel = lang === "bn"
    ? ({ low: "কম", medium: "মাঝারি", high: "উচ্চ" } as Record<string, string>)
    : ({ low: "Low", medium: "Medium", high: "High" } as Record<string, string>);

  const header = lang === "bn" ? "## ইমোশন টাইমলাইন" : "## Emotion Timeline";
  const lines = [
    header,
    `${lang === "bn" ? `- মুড: ${moodLabel[summary.currentMood] || summary.currentMood}` : `- Mood: ${moodLabel[summary.currentMood] || summary.currentMood}`}`,
    `${lang === "bn" ? `- ট্রেন্ড: ${trendLabel[summary.trend]}` : `- Trend: ${trendLabel[summary.trend]}`}`,
    `${lang === "bn" ? `- নেগেটিভ রেশিও: ${summary.negativeRatio}%` : `- Negative ratio: ${summary.negativeRatio}%`}`,
    `${lang === "bn" ? `- রিস্ক লেভেল: ${riskLabel[summary.riskLevel]}` : `- Risk: ${riskLabel[summary.riskLevel]}`}`,
  ];

  if (summary.riskLevel === "high" || summary.riskLevel === "medium") {
    lines.push(lang === "bn"
      ? "⚠️ এই ইউজারের সাথে সতর্ক থাকুন — বেশি চাপ না দিয়ে বিশ্বাস গড়ুন।"
      : "⚠️ Handle this user with care — build trust before pushing offers.");
  }

  return lines.join("\n") + "\n";
}
