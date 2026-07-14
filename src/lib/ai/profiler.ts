import { queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { detectLanguage } from "./analyzer";

export interface PhoneProfile {
  phone: string;
  name_guess: string | null;
  gender_guess: string | null;
  age_group_guess: string | null;
  sector: string | null;
  language: string;
  pain_points: string | null;
  interests: string | null;
  priority_score: number;
  total_chats: number;
  last_chat_at: string | null;
  status: string;
  notes: string | null;
}

const SECTOR_PATTERNS: [RegExp, string][] = [
  [/\b(?:student|কলেজ|বিশ্ববিদ্যালয়|university|school|স্কুল)\b/i, "student"],
  [/\b(?:homemaker|housewife|গৃহিণী|বাড়ি)\b/i, "homemaker"],
  [/\b(?:job|employee|কর্মচারী|অফিস|চাকরি|service)\b/i, "job_holder"],
  [/\b(?:business|ব্যবসা|shop|দোকান|owner|মালিক)\b/i, "business_owner"],
  [/\b(?:freelanc|fiverr|upwork|ফ্রিল্যান্স)\b/i, "freelancer"],
  [/\b(?:unemployed|বেকার|no work|কাজ নেই)\b/i, "unemployed"],
  [/\b(?:village|গ্রাম|গাও|rural|মফস্বল)\b/i, "rural"],
  [/\b(?:city|শহর|ঢাকা|dhaka|রাজধানী|capital)\b/i, "urban_educated"],
];

const AGE_PATTERNS: [RegExp, string][] = [
  [/\b(?:1[5-9]\s*(?:year|বছর)|teen|টিন)\b/i, "15-20"],
  [/\b(?:2[0-9]\s*(?:year|বছর)|twenty)\b/i, "21-29"],
  [/\b(?:3[0-9]\s*(?:year|বছর)|thirty)\b/i, "30-39"],
  [/\b(?:4[0-9]\s*(?:year|বছর)|forty)\b/i, "40-49"],
  [/\b(?:5[0-9])\s*(?:year|বছর)/i, "50+"],
];

const GENDER_KEYWORDS_MALE = [
  /\b(?:ভাই|brother|ছেলে|boy|পুরুষ|male|আমি.{0,10}ছি)\b/i,
  /\b(?:abdul|md\.?|mohammad|muhammad|shahin|jahangir|kamal|rafiq|abdullah|shafiq)\b/i,
];

const GENDER_KEYWORDS_FEMALE = [
  /\b(?:আপু|sister|মেয়ে|girl|নারী|female|বেগম|আক্তার)\b/i,
  /\b(?:fatima|nasima|parvin|rokeya|shahin|sultana|khatun)\b/i,
];

export async function getOrCreateProfile(phone: string): Promise<PhoneProfile | null> {
  const db = await ensureDB();
  let profile = await queryFirst<PhoneProfile>(
    { DB: db },
    "SELECT * FROM ai_phone_profiles WHERE phone = ?",
    [phone]
  );

  if (!profile) {
    await execute(
      { DB: db },
      "INSERT INTO ai_phone_profiles (phone, status, created_at, updated_at) VALUES (?, 'new', datetime('now'), datetime('now'))",
      [phone]
    );
    profile = await queryFirst<PhoneProfile>(
      { DB: db },
      "SELECT * FROM ai_phone_profiles WHERE phone = ?",
      [phone]
    );
  }

  return profile;
}

export async function updateProfileFromChat(
  phone: string,
  text: string
): Promise<void> {
  const db = await ensureDB();
  const lang = detectLanguage(text);

  const matchedSector = SECTOR_PATTERNS.find(([re]) => re.test(text));
  const matchedAge = AGE_PATTERNS.find(([re]) => re.test(text));
  const isMale = GENDER_KEYWORDS_MALE.some((re) => re.test(text));
  const isFemale = GENDER_KEYWORDS_FEMALE.some((re) => re.test(text));

  const updates: string[] = ["total_chats = total_chats + 1", "updated_at = datetime('now')", "last_chat_at = datetime('now')"];
  const params: unknown[] = [];

  if (lang !== "en") {
    updates.push("language = ?");
    params.push(lang);
  }

  if (matchedSector) {
    updates.push("sector = ?");
    params.push(matchedSector[1]);
  }

  if (matchedAge) {
    updates.push("age_group_guess = ?");
    params.push(matchedAge[1]);
  }

  if (isMale && !isFemale) {
    updates.push("gender_guess = 'male'");
  } else if (isFemale && !isMale) {
    updates.push("gender_guess = 'female'");
  }

  updates.push("updated_at = datetime('now')");

  if (params.length > 0) {
    params.push(phone);
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET ${updates.join(", ")} WHERE phone = ?`,
      params
    );
  }
}

export async function updateProfileScore(phone: string, score: number): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    "UPDATE ai_phone_profiles SET priority_score = ?, updated_at = datetime('now') WHERE phone = ?",
    [score, phone]
  );
}
