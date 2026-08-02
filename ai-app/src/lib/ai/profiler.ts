import { queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { detectLanguage, detectCommStyle, detectTrustReadiness, detectBuyerPersonality, detectBuyingMotivation, detectCustomerNeed, detectMarketSegment, detectLoyaltyStage, detectBrandPosition, detectPLCStage, detectPricingStrategy, detectServiceQualityIssue, detectGrowthStrategy, detectTargetingStrategy, detectCommunicationChannel, detectEducationLevel, detectIncomeRange, detectSkills, detectGoal, detectFamilyStatus, detectLifeSituation, detectContentPreference } from "./analyzer";

export interface PhoneProfile {
  phone: string;
  name_guess: string | null;
  gender_guess: string | null;
  age_group_guess: string | null;
  sector: string | null;
  education_level: string | null;
  occupation: string | null;
  monthly_income_range: string | null;
  skills: string | null;
  short_term_goal: string | null;
  long_term_goal: string | null;
  family_status: string | null;
  referral_source: string | null;
  content_preferences: string | null;
  active_hours: string | null;
  language: string;
  pain_points: string | null;
  interests: string | null;
  priority_score: number;
  total_chats: number;
  last_chat_at: string | null;
  status: string;
  notes: string | null;
  trust_score: number;
  control_sensitivity: string | null;
  manipulation_risk: string | null;
  communication_style: string | null;
  trust_readiness: string | null;
  value_sensitivity: string | null;
  listening_need: string | null;
  buyer_personality: string | null;
  primary_need: string | null;
  buying_motivation: string | null;
  sales_goal: string | null;
  market_segment: string | null;
  targeting_strategy: string | null;
  brand_position: string | null;
  plc_stage: string | null;
  pricing_strategy: string | null;
  loyalty_stage: string | null;
  service_quality_issues: string | null;
  nps_score: number | null;
  clv_estimate: number | null;
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
    "SELECT phone, name_guess, gender_guess, age_group_guess, sector, education_level, occupation, monthly_income_range, skills, short_term_goal, long_term_goal, family_status, referral_source, content_preferences, active_hours, language, pain_points, interests, priority_score, total_chats, last_chat_at, status, notes FROM ai_phone_profiles WHERE phone = ?",
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
      "SELECT phone, name_guess, gender_guess, age_group_guess, sector, education_level, occupation, monthly_income_range, skills, short_term_goal, long_term_goal, family_status, referral_source, content_preferences, active_hours, language, pain_points, interests, priority_score, total_chats, last_chat_at, status, notes FROM ai_phone_profiles WHERE phone = ?",
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

  const updates: string[] = ["total_chats = total_chats + 1", "last_chat_at = datetime('now')"];
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

  if (updates.length > 0) {
    params.push(phone);
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET ${updates.join(", ")} WHERE phone = ?`,
      params
    );
  }

  // Life profile detection (async, non-blocking)
  try { await updateProfileLife(phone, text); } catch {}
}

export async function updateProfileScore(phone: string, score: number): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    "UPDATE ai_phone_profiles SET priority_score = ?, updated_at = datetime('now') WHERE phone = ?",
    [score, phone]
  );
}

export async function updateProfileTrust(
  phone: string,
  trustScore: number,
  controlSensitivity: string,
  manipulationRisk: string
): Promise<void> {
  const db = await ensureDB();
  try {
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET trust_score = ?, control_sensitivity = ?, manipulation_risk = ?, updated_at = datetime('now') WHERE phone = ?`,
      [trustScore, controlSensitivity, manipulationRisk, phone]
    );
  } catch {
    try {
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN trust_score REAL DEFAULT 0");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN control_sensitivity TEXT DEFAULT 'medium'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN manipulation_risk TEXT DEFAULT 'medium'");
      await execute(
        { DB: db },
        `UPDATE ai_phone_profiles SET trust_score = ?, control_sensitivity = ?, manipulation_risk = ?, updated_at = datetime('now') WHERE phone = ?`,
        [trustScore, controlSensitivity, manipulationRisk, phone]
      );
    } catch {}
  }
}

export async function updateProfileCommunication(
  phone: string,
  text: string
): Promise<void> {
  const db = await ensureDB();
  const commStyle = detectCommStyle(text);
  const trustReadiness = detectTrustReadiness(text);
  try {
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET communication_style = ?, trust_readiness = ?, updated_at = datetime('now') WHERE phone = ?`,
      [commStyle, trustReadiness, phone]
    );
    await execute(
      { DB: db },
      `INSERT INTO communication_styles (phone, style, trust_readiness, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(phone) DO UPDATE SET style = ?, trust_readiness = ?, updated_at = datetime('now')`,
      [phone, commStyle, trustReadiness, commStyle, trustReadiness]
    );
  } catch {
    try {
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN communication_style TEXT DEFAULT 'standard'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN trust_readiness TEXT DEFAULT 'needs_time'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN value_sensitivity TEXT DEFAULT 'balanced'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN listening_need TEXT DEFAULT 'medium'");
      await execute(
        { DB: db },
        `UPDATE ai_phone_profiles SET communication_style = ?, trust_readiness = ?, updated_at = datetime('now') WHERE phone = ?`,
        [commStyle, trustReadiness, phone]
      );
    } catch {}
  }
}

export async function updateProfileTracy(
  phone: string,
  text: string
): Promise<void> {
  const db = await ensureDB();
  const { personality } = detectBuyerPersonality(text);
  const { motivation } = detectBuyingMotivation(text);
  const { need } = detectCustomerNeed(text);
  try {
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET buyer_personality = ?, buying_motivation = ?, primary_need = ?, updated_at = datetime('now') WHERE phone = ?`,
      [personality, motivation, need, phone]
    );
  } catch {
    try {
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN buyer_personality TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN primary_need TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN buying_motivation TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN sales_goal TEXT DEFAULT NULL");
      await execute(
        { DB: db },
        `UPDATE ai_phone_profiles SET buyer_personality = ?, buying_motivation = ?, primary_need = ?, updated_at = datetime('now') WHERE phone = ?`,
        [personality, motivation, need, phone]
      );
    } catch {}
  }
}

export async function updateProfileKotler(
  phone: string,
  text: string
): Promise<void> {
  const db = await ensureDB();
  const { segment } = detectMarketSegment(text);
  const { stage: loyalty } = detectLoyaltyStage(text);
  const { position } = detectBrandPosition(text);
  const { stage: plc } = detectPLCStage(text);
  const { strategy: pricing } = detectPricingStrategy(text);
  try {
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET market_segment = ?, loyalty_stage = ?, brand_position = ?, plc_stage = ?, pricing_strategy = ?, updated_at = datetime('now') WHERE phone = ?`,
      [segment, loyalty, position, plc, pricing, phone]
    );
  } catch {
    try {
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN market_segment TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN targeting_strategy TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN brand_position TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN plc_stage TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN pricing_strategy TEXT DEFAULT 'unknown'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN loyalty_stage TEXT DEFAULT 'suspect'");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN service_quality_issues TEXT DEFAULT NULL");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN nps_score INTEGER DEFAULT NULL");
      await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN clv_estimate REAL DEFAULT NULL");
      await execute(
        { DB: db },
        `UPDATE ai_phone_profiles SET market_segment = ?, loyalty_stage = ?, brand_position = ?, plc_stage = ?, pricing_strategy = ?, updated_at = datetime('now') WHERE phone = ?`,
        [segment, loyalty, position, plc, pricing, phone]
      );
    } catch {}
  }
}

export async function updateProfileServiceQuality(
  phone: string,
  text: string
): Promise<void> {
  const db = await ensureDB();
  const { dimension, severity, evidence } = detectServiceQualityIssue(text);
  try {
    await execute(
      { DB: db },
      `UPDATE ai_phone_profiles SET service_quality_issues = ?, updated_at = datetime('now') WHERE phone = ?`,
      [JSON.stringify({ dimension, severity, evidence }), phone]
    );
  } catch {}
}

export async function updateProfileLife(phone: string, text: string): Promise<void> {
  const db = await ensureDB();
  const { level: educationLevel } = detectEducationLevel(text);
  const { range: incomeRange } = detectIncomeRange(text);
  const { skills } = detectSkills(text);
  const { goal } = detectGoal(text);
  const { status: familyStatus } = detectFamilyStatus(text);
  const { situation: lifeSituation } = detectLifeSituation(text);
  const contentPref = detectContentPreference(text);

  const updates: string[] = [];
  const params: unknown[] = [];

  if (lifeSituation !== "unknown") { updates.push("sector = ?"); params.push(lifeSituation); }
  if (educationLevel !== "unknown") { updates.push("education_level = ?"); params.push(educationLevel); }
  if (incomeRange !== "unknown") { updates.push("monthly_income_range = ?"); params.push(incomeRange); }
  if (skills.length > 0) { updates.push("skills = ?"); params.push(skills.join(",")); }
  if (goal !== "unknown") { updates.push("short_term_goal = ?"); params.push(goal); }
  if (familyStatus !== "unknown") { updates.push("family_status = ?"); params.push(familyStatus); }
  if (contentPref !== "unknown") { updates.push("content_preferences = ?"); params.push(contentPref); }

  if (updates.length > 0) {
    try {
      params.push(phone);
      await execute(
        { DB: db },
        `UPDATE ai_phone_profiles SET ${updates.join(", ")}, updated_at = datetime('now') WHERE phone = ?`,
        params
      );
    } catch {
      try {
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN education_level TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN occupation TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN monthly_income_range TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN skills TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN short_term_goal TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN long_term_goal TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN family_status TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN referral_source TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN content_preferences TEXT");
        await execute({ DB: db }, "ALTER TABLE ai_phone_profiles ADD COLUMN active_hours TEXT");
        await execute(
          { DB: db },
          `UPDATE ai_phone_profiles SET ${updates.join(", ")}, updated_at = datetime('now') WHERE phone = ?`,
          params
        );
      } catch {}
    }
  }
}

export function buildLifeProfileContext(profile: PhoneProfile, lang: string): string {
  const lines: string[] = [];

  if (profile.education_level) {
    const label = lang === "bn"
      ? ({ ssc: "এসএসসি", hsc: "এইচএসসি", graduate: "স্নাতক", masters: "মাস্টার্স", phd: "পিএইচডি", none: "কোনো" } as Record<string, string>)
      : ({ ssc: "SSC", hsc: "HSC", graduate: "Graduate", masters: "Masters", phd: "PhD", none: "No formal education" } as Record<string, string>);
    lines.push(`Education: ${label[profile.education_level] || profile.education_level}`);
  }

  if (profile.monthly_income_range) {
    const label = lang === "bn"
      ? ({ lt_10k: "< ১০,০০০", "10k_25k": "১০,০০০-২৫,০০০", "25k_50k": "২৫,০০০-৫০,০০০", "50k_plus": "৫০,০০০+", no_income: "কোনো আয় নেই" } as Record<string, string>)
      : ({ lt_10k: "< 10,000", "10k_25k": "10,000-25,000", "25k_50k": "25,000-50,000", "50k_plus": "50,000+", no_income: "No income" } as Record<string, string>);
    lines.push(`Income: ${label[profile.monthly_income_range] || profile.monthly_income_range}`);
  }

  if (profile.skills) {
    const skillsList = profile.skills.split(",").map((s) => s.trim()).join(", ");
    lines.push(`Skills: ${skillsList}`);
  }

  if (profile.short_term_goal) {
    const label = lang === "bn"
      ? ({ job: "চাকরি", foreign_travel: "বিদেশ যাওয়া", business_start: "ব্যবসা শুরু", education: "শিক্ষা", skill_development: "দক্ষতা উন্নয়ন", financial_freedom: "আর্থিক স্বাধীনতা", house_property: "বাড়ি/সম্পত্তি", family: "পরিবার", health: "স্বাস্থ্য" } as Record<string, string>)
      : ({ job: "Job", foreign_travel: "Going abroad", business_start: "Starting business", education: "Education", skill_development: "Skill development", financial_freedom: "Financial freedom", house_property: "House/Property", family: "Family", health: "Health" } as Record<string, string>);
    lines.push(`Goal: ${label[profile.short_term_goal] || profile.short_term_goal}`);
  }

  if (profile.family_status) {
    const label = lang === "bn"
      ? ({ single: "একক", married: "বিবাহিত", parent: "সন্তান আছে", guardian: "অভিভাবক" } as Record<string, string>)
      : ({ single: "Single", married: "Married", parent: "Has children", guardian: "Guardian" } as Record<string, string>);
    lines.push(`Family: ${label[profile.family_status] || profile.family_status}`);
  }

  if (profile.content_preferences && profile.content_preferences !== "unknown") {
    const label = lang === "bn"
      ? ({ video: "ভিডিও", text: "লেখা", audio: "অডিও", interactive: "ইন্টারঅ্যাক্টিভ" } as Record<string, string>)
      : ({ video: "Video", text: "Text", audio: "Audio", interactive: "Interactive" } as Record<string, string>);
    lines.push(`Prefers: ${label[profile.content_preferences] || profile.content_preferences} content`);
  }

  if (lines.length === 0) return "";
  return `## LIFE PROFILE\n${lines.join("\n")}\n`;
}
