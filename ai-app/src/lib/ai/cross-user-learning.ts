import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface SimilarProfile {
  phone: string; painPoints: string | null; interests: string | null;
  sector: string | null; whatWorked: string | null;
}

export async function getSimilarUserContext(phone: string, painPoints?: string[], interests?: string[]): Promise<string> {
  const db = await ensureDB();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (painPoints?.length) {
    for (const pp of painPoints) {
      conditions.push("pain_points LIKE ?");
      params.push(`%${pp}%`);
    }
  }
  if (interests?.length) {
    for (const int of interests) {
      conditions.push("interests LIKE ?");
      params.push(`%${int}%`);
    }
  }
  if (!conditions.length) return "";
  const similar = await query<SimilarProfile>(
    { DB: db },
    `SELECT phone, pain_points, interests, sector, notes as whatWorked FROM ai_phone_profiles WHERE (${conditions.join(" OR ")}) AND phone != ? AND total_chats > 2 ORDER BY priority_score DESC LIMIT 3`,
    [...params, phone]
  );
  if (!similar.length) return "";
  const parts = similar.map((p, i) => {
    const items: string[] = [];
    if (p.sector) items.push(`sector: ${p.sector}`);
    if (p.painPoints) items.push(`pain points: ${p.painPoints}`);
    if (p.interests) items.push(`interests: ${p.interests}`);
    if (p.whatWorked) items.push(`what worked for them: ${p.whatWorked}`);
    return `Example ${i + 1}: phone ending in ${p.phone.slice(-4)} — ${items.join(", ")}`;
  });
  return `SIMILAR USERS' EXPERIENCES:\n${parts.join("\n")}\n(Use these patterns to guide your response, but adapt to current person's unique situation.)`;
}
