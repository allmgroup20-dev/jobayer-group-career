import { execute, query } from "@/lib/db/queries";

interface ContactProfile {
  phone: string;
  name: string;
  language: string;
  totalChats: number;
  lastIntent: string;
  lastMood: string;
  interests: string[];
  objections: string[];
  painPoints: string[];
  funnelStage: string;
  preferredTime: string;
  lastContactAt: string;
}

const FUNNEL_STAGES = [
  { id: "awareness", label: "Awareness", minChats: 0, maxChats: 2 },
  { id: "interest", label: "Interest", minChats: 3, maxChats: 5 },
  { id: "consideration", label: "Consideration", minChats: 6, maxChats: 8 },
  { id: "intent", label: "Intent", minChats: 9, maxChats: 12 },
  { id: "purchase", label: "Purchase", minChats: 13, maxChats: 999 },
];

function getFunnelStage(totalChats: number): string {
  for (const stage of FUNNEL_STAGES) {
    if (totalChats >= stage.minChats && totalChats <= stage.maxChats) return stage.id;
  }
  return "awareness";
}

export async function getContactIntelligence(phone: string): Promise<string> {
  try {
    const { getMemory } = await import("./brain/memory");
    const db = await (await import("@/lib/db")).getDB?.();
    if (!db) return "";

    const memories = await getMemory(db, phone, "_profile");

    const profile: Record<string, string> = {};
    for (const m of memories) {
      profile[m.key] = m.value;
    }

    const totalChats = parseInt(profile.total_chats || "0", 10);
    const funnelStage = getFunnelStage(totalChats);
    const tags = profile.tags || "";
    const objections = profile.objections || "";
    const interests = profile.interests || "";
    const painPoints = profile.pain_points || "";

    const parts: string[] = [];
    if (profile.name) parts.push(`Name: ${profile.name}`);
    if (profile.language) parts.push(`Language: ${profile.language}`);
    parts.push(`Total conversations: ${totalChats}`);
    parts.push(`Funnel stage: ${funnelStage}`);
    if (interests) parts.push(`Known interests: ${interests}`);
    if (objections) parts.push(`Objections raised: ${objections}`);
    if (painPoints) parts.push(`Pain points: ${painPoints}`);
    if (tags) parts.push(`Tags: ${tags}`);
    if (profile.last_intent) parts.push(`Last intent: ${profile.last_intent}`);
    if (profile.last_mood) parts.push(`Last mood: ${profile.last_mood}`);
    if (profile.last_topic) parts.push(`Last topic discussed: ${profile.last_topic}`);

    return parts.join("\n");
  } catch {
    return "";
  }
}

export async function storeContactInsight(
  phone: string,
  insight: {
    name?: string;
    language?: string;
    intent?: string;
    mood?: string;
    interests?: string[];
    objections?: string[];
    painPoints?: string[];
    topics?: string[];
  }
): Promise<void> {
  try {
    const db = await (await import("@/lib/db")).getDB?.();
    if (!db) return;
    const { setMemory } = await import("./brain/memory");

    const promises: Promise<void>[] = [];

    if (insight.name) promises.push(setMemory(db, phone, "_profile", "name", insight.name, "profile", 5, 43200));
    if (insight.language) promises.push(setMemory(db, phone, "_profile", "language", insight.language, "profile", 3, 43200));
    if (insight.intent) promises.push(setMemory(db, phone, "_profile", "last_intent", insight.intent, "session", 2, 1440));
    if (insight.mood) promises.push(setMemory(db, phone, "_profile", "last_mood", insight.mood, "session", 1, 1440));

    if (insight.interests?.length) {
      const existing = await query<{ value: string }>(
        db,
        "SELECT value FROM agent_memory WHERE phone = ? AND agent_id = '_profile' AND key = 'interests'",
        [phone]
      );
      const existingTags = existing.length > 0 ? existing[0].value.split(",").map((s: string) => s.trim()) : [];
      const merged = [...new Set([...existingTags, ...insight.interests])].slice(0, 10);
      promises.push(setMemory(db, phone, "_profile", "interests", merged.join(", "), "profile", 4, 43200));
    }

    if (insight.objections?.length) {
      const existing = await query<{ value: string }>(
        db,
        "SELECT value FROM agent_memory WHERE phone = ? AND agent_id = '_profile' AND key = 'objections'",
        [phone]
      );
      const existingObs = existing.length > 0 ? existing[0].value.split(",").map((s: string) => s.trim()) : [];
      const merged = [...new Set([...existingObs, ...insight.objections])].slice(0, 10);
      promises.push(setMemory(db, phone, "_profile", "objections", merged.join(", "), "profile", 3, 43200));
    }

    if (insight.painPoints?.length) {
      promises.push(setMemory(db, phone, "_profile", "pain_points", insight.painPoints.slice(0, 5).join(", "), "profile", 3, 43200));
    }

    if (insight.topics?.length) {
      promises.push(setMemory(db, phone, "_profile", "last_topic", insight.topics.slice(0, 3).join(", "), "session", 2, 1440));
    }

    await Promise.allSettled(promises);
  } catch {}
}

export function extractInsightsFromText(text: string, intent: string): {
  interests: string[];
  objections: string[];
  painPoints: string[];
  topics: string[];
} {
  const lower = text.toLowerCase();
  const interests: string[] = [];
  const objections: string[] = [];
  const painPoints: string[] = [];
  const topics: string[] = [];

  if (/(training|skill|শিখতে|learn|কোর্স|course|ফ্রিল্যান্সিং|freelancing|গ্রাফিক|graphic|ডিজাইন|design)/i.test(lower)) {
    interests.push("training"); topics.push("training");
  }
  if (/(income|আয়|earn|earning|টাকা|money|কমিশন|commission)/i.test(lower)) {
    interests.push("income"); topics.push("income");
  }
  if (/(team|টিম|group|গ্রুপ|refer|রেফারেল|referral)/i.test(lower)) {
    interests.push("team_building"); topics.push("referral");
  }
  if (/(premium|প্রিমিয়াম|vip)/i.test(lower)) {
    interests.push("premium"); topics.push("membership");
  }
  if (/(youtube|yt|চ্যানেল|channel|ভিডিও|video)/i.test(lower)) {
    interests.push("youtube"); topics.push("youtube");
  }
  if (/(ফ্রি|free|no cost|বিনামূল্য)/i.test(lower)) {
    interests.push("free_trial");
  }

  if (/(дорого|expensive|price|দাম বেশি|বেশি দাম|costly|বাজেট|budget)/i.test(lower)) {
    objections.push("price"); painPoints.push("price_concern");
  }
  if (/(scam|fraud|cheat|ভুয়া|প্রতারনা|ঠকানো|বিশ্বাস|trust|suspicious|সন্দেহ)/i.test(lower)) {
    objections.push("trust"); painPoints.push("trust_issue");
  }
  if (/(time|সময়|busy|ব্যস্ত|no time|later|পরে)/i.test(lower)) {
    objections.push("time"); painPoints.push("time_constraint");
  }
  if (/(experience|অভিজ্ঞতা|skill|দক্ষতা|no knowledge|জানি না|can't|পারব না|できない)/i.test(lower)) {
    objections.push("skill"); painPoints.push("skill_gap");
  }
  if (/(family|পরিবার|parents|বাবা|মা|husband|স্বামী|wife|স্ত্রী)/i.test(lower)) {
    painPoints.push("family_obligation");
  }

  return { interests, objections, painPoints, topics };
}
