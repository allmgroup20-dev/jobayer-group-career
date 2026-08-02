import { execute, query } from "@/lib/db/queries";

export interface MemoryEntry {
  id?: number;
  phone: string;
  agent_id: string;
  key: string;
  value: string;
  category: string;
  priority: number;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getMemory(
  db: any,
  phone: string,
  agent_id?: string,
  category?: string,
): Promise<MemoryEntry[]> {
  let sql = `SELECT id, phone, agent_id, key, value, category, priority, expires_at, created_at, updated_at FROM agent_memory WHERE phone = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`;
  const params: unknown[] = [phone];

  if (agent_id) { sql += ` AND agent_id = ?`; params.push(agent_id); }
  if (category) { sql += ` AND category = ?`; params.push(category); }

  sql += ` ORDER BY priority DESC, updated_at DESC LIMIT 50`;
  return query<MemoryEntry>(db, sql, params);
}

export async function setMemory(
  db: any,
  phone: string,
  agent_id: string,
  key: string,
  value: string,
  category = "general",
  priority = 0,
  ttlMinutes?: number,
): Promise<void> {
  const expires = ttlMinutes
    ? `datetime('now', '+${ttlMinutes} minutes')`
    : "NULL";
  await execute(
    db,
    `INSERT INTO agent_memory (phone, agent_id, key, value, category, priority, expires_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ${expires}, datetime('now'))
     ON CONFLICT(phone, agent_id, key) DO UPDATE SET
       value = excluded.value,
       category = excluded.category,
       priority = excluded.priority,
       expires_at = excluded.expires_at,
       updated_at = datetime('now')`,
    [phone, agent_id, key, value, category, priority],
  );
}

export async function deleteMemory(
  db: any,
  phone: string,
  agent_id: string,
  key: string,
): Promise<void> {
  await execute(
    db,
    `DELETE FROM agent_memory WHERE phone = ? AND agent_id = ? AND key = ?`,
    [phone, agent_id, key],
  );
}

export async function clearPhoneMemory(db: any, phone: string): Promise<void> {
  await execute(db, `DELETE FROM agent_memory WHERE phone = ?`, [phone]);
}

export function buildMemoryContext(memories: MemoryEntry[]): string {
  if (memories.length === 0) return "";
  const parts = memories.map(
    m => `[${m.category}] ${m.key}: ${m.value}`,
  );
  return `\n## Known Information About This User\n${parts.join("\n")}\n`;
}
