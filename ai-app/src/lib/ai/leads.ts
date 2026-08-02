import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface Lead {
  id: number; phone: string; name: string | null; status: string;
  priorityScore: number; source: string | null; genderGuess: string | null;
  ageGroupGuess: string | null; sector: string | null; language: string;
  painPoints: string | null; interests: string | null; totalChats: number;
  lastChatAt: string | null; notes: string | null; createdAt: string;
}

export async function getOrCreateLead(phone: string): Promise<Lead | null> {
  const db = await ensureDB();
  let lead = await queryFirst<Lead>(
    { DB: db },
    "SELECT id, phone, name, status, priority_score, source, gender_guess, age_group_guess, sector, language, pain_points, interests, total_chats, last_chat_at, notes, created_at, updated_at FROM ai_leads WHERE phone = ?", [phone]
  );
  if (!lead) {
    await execute({ DB: db },
      "INSERT INTO ai_leads (phone, status, created_at, updated_at) VALUES (?, 'new', datetime('now'), datetime('now'))",
      [phone]
    );
    lead = await queryFirst<Lead>(
      { DB: db },
      "SELECT id, phone, name, status, priority_score, source, gender_guess, age_group_guess, sector, language, pain_points, interests, total_chats, last_chat_at, notes, created_at, updated_at FROM ai_leads WHERE phone = ?", [phone]
    );
  }
  return lead;
}

export async function updateLeadStatus(phone: string, status: string, notes?: string): Promise<void> {
  const db = await ensureDB();
  if (notes) {
    await execute({ DB: db },
      "UPDATE ai_leads SET status = ?, notes = ?, updated_at = datetime('now') WHERE phone = ?",
      [status, notes, phone]
    );
  } else {
    await execute({ DB: db },
      "UPDATE ai_leads SET status = ?, updated_at = datetime('now') WHERE phone = ?",
      [status, phone]
    );
  }
}

export async function getLeads(options: {
  status?: string; limit?: number; offset?: number;
} = {}): Promise<{ leads: Lead[]; total: number }> {
  const db = await ensureDB();
  const where = options.status ? "WHERE status = ?" : "";
  const params: unknown[] = options.status ? [options.status] : [];
  const total = await queryFirst<{ count: number }>(
    { DB: db },
    `SELECT COUNT(*) as count FROM ai_leads ${where}`, params
  );
  const leads = await query<Lead>(
    { DB: db },
    `SELECT id, phone, name, status, priority_score, source, gender_guess, age_group_guess, sector, language, pain_points, interests, total_chats, last_chat_at, notes, created_at, updated_at FROM ai_leads ${where} ORDER BY priority_score DESC, last_chat_at DESC LIMIT ? OFFSET ?`,
    [...params, options.limit || 50, options.offset || 0]
  );
  return { leads, total: total?.count || 0 };
}

export async function getLeadStats(): Promise<{
  total: number; new: number; contacted: number; replied: number;
  converted: number; blocked: number; highPriority: number;
}> {
  const db = await ensureDB();
  const rows = await query<{ status: string; count: number }>(
    { DB: db },
    "SELECT status, COUNT(*) as count FROM ai_leads GROUP BY status"
  );
  const high = await queryFirst<{ count: number }>(
    { DB: db },
    "SELECT COUNT(*) as count FROM ai_leads WHERE priority_score >= 5"
  );
  const stats = { total: 0, new: 0, contacted: 0, replied: 0, converted: 0, blocked: 0, highPriority: high?.count || 0 };
  for (const r of rows) {
    stats.total += r.count;
    if (r.status in stats) (stats as any)[r.status] = r.count;
  }
  return stats;
}
