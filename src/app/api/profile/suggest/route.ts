import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

const GOAL_KEYWORDS: { pattern: RegExp; goal: string }[] = [
  { pattern: /\b(fiverr|upwork|freelanc|ফ্রিল্যান্স)\b/i, goal: "freelancing" },
  { pattern: /\b(job|chakri|চাকরি|bcs|bank|govt|সরকারি)\b/i, goal: "job" },
  { pattern: /\b(business|ব্যবসা|startup|শুরু)\b/i, goal: "business" },
  { pattern: /\b(career|ক্যারিয়ার|professional)\b/i, goal: "career" },
  { pattern: /\b(skill|দক্ষতা|develop|উন্নয়ন|learn|শিখ)\b/i, goal: "skill" },
];

const SECTOR_TO_OCCUPATION: Record<string, string> = {
  student: "student",
  homemaker: "homemaker",
  job_holder: "employed",
  business_owner: "business",
  freelancer: "freelancer",
  unemployed: "unemployed",
};

const AGE_MAP: Record<string, string> = {
  "15-20": "under_18",
  "21-29": "18_24",
  "30-39": "25_34",
  "40-49": "35_44",
  "50+": "45_plus",
};

export async function POST(req: NextRequest) {
  try {
    const { workerId } = await req.json() as { workerId?: string };
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const geo = (req as any).cf || {};
    const ipCity = (geo as any)?.city || null;
    const ipCountry = (geo as any)?.country || null;

    const env = await getDB();

    const sessionGeo = await queryFirst<{ city: string | null; country: string | null }>(
      env,
      "SELECT city, country FROM user_sessions WHERE worker_id = ? AND city IS NOT NULL ORDER BY created_at DESC LIMIT 1",
      [workerId],
    );

    const deviceGeo = await queryFirst<{ city: string | null; country: string | null }>(
      env,
      "SELECT city, country FROM user_devices WHERE worker_id = ? AND city IS NOT NULL ORDER BY last_seen_at DESC LIMIT 1",
      [workerId],
    );

    const attribution = await queryFirst<{ channel: string | null; utm_source: string | null }>(
      env,
      "SELECT channel, utm_source FROM attribution_log WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1",
      [workerId],
    );

    const platformPref = await queryFirst<{ preferred_platform: string | null }>(
      env,
      "SELECT preferred_platform FROM user_platform_preferences WHERE phone = (SELECT phone FROM workers WHERE worker_id = ?)",
      [workerId],
    );

    const aiProfile = await queryFirst<{ age_group_guess: string | null; sector: string | null }>(
      env,
      "SELECT age_group_guess, sector FROM ai_phone_profiles WHERE phone = (SELECT phone FROM workers WHERE worker_id = ?)",
      [workerId],
    );

    const recentSearches = await query<any>(
      env,
      "SELECT search_keyword FROM user_events WHERE worker_id = ? AND search_keyword IS NOT NULL AND search_keyword != '' ORDER BY created_at DESC LIMIT 20",
      [workerId],
    );

    let suggestedGoal: string | null = null;
    for (const row of recentSearches) {
      const kw = row.search_keyword as string;
      for (const { pattern, goal } of GOAL_KEYWORDS) {
        if (pattern.test(kw)) {
          suggestedGoal = goal;
          break;
        }
      }
      if (suggestedGoal) break;
    }

    const city = ipCity || sessionGeo?.city || deviceGeo?.city || null;
    const country = ipCountry || sessionGeo?.country || deviceGeo?.country || null;

    const rawAge = aiProfile?.age_group_guess || null;
    const suggestedAgeGroup = rawAge ? AGE_MAP[rawAge] || null : null;

    const rawSector = aiProfile?.sector || null;
    const suggestedOccupation = rawSector ? SECTOR_TO_OCCUPATION[rawSector] || null : null;

    let suggestedReferralSource: string | null = null;
    if (attribution?.channel && attribution.channel !== "direct") {
      suggestedReferralSource = attribution.channel;
    } else if (attribution?.utm_source) {
      suggestedReferralSource = attribution.utm_source;
    }

    let suggestedCommPref: string | null = null;
    if (platformPref?.preferred_platform) {
      const p = platformPref.preferred_platform;
      if (p === "whatsapp") suggestedCommPref = "whatsapp";
      else if (p === "messenger") suggestedCommPref = "email";
      else if (p === "telegram") suggestedCommPref = "sms";
    }

    return NextResponse.json({
      city,
      country,
      ageGroup: suggestedAgeGroup,
      occupation: suggestedOccupation,
      goal: suggestedGoal,
      referralSource: suggestedReferralSource,
      communicationPreference: suggestedCommPref,
    });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
