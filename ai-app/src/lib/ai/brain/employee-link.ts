import { query, queryFirst, execute } from "@/lib/db/queries";

export interface WorkerKnowledge {
  id: number;
  agent_id: string;
  agent_name: string;
  knowledge: string;
  source: string;
  created_at: string;
}

export async function ensureWorkerAgentTables(db: D1Database): Promise<void> {
  await execute({ DB: db },
    `CREATE TABLE IF NOT EXISTS worker_agent_links (
      phone TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      linked_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (phone, agent_id)
    )`
  );
  await execute({ DB: db },
    `CREATE TABLE IF NOT EXISTS worker_agent_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT DEFAULT '',
      knowledge TEXT NOT NULL,
      source TEXT DEFAULT 'brain',
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
}

export async function linkWorkerToAgent(
  db: D1Database,
  phone: string,
  agentId: string,
  agentName?: string
): Promise<void> {
  try {
    await ensureWorkerAgentTables(db);
    await execute({ DB: db },
      `INSERT OR IGNORE INTO worker_agent_links (phone, agent_id, linked_at) VALUES (?, ?, datetime('now'))`,
      [phone, agentId]
    );
  } catch (e) {
    console.error("[EmployeeLink] linkWorkerToAgent error:", (e as Error)?.message);
  }
}

export async function saveAgentKnowledge(
  db: D1Database,
  phone: string,
  agentId: string,
  agentName: string,
  knowledge: string
): Promise<void> {
  try {
    await ensureWorkerAgentTables(db);
    const trimmed = knowledge.slice(0, 2000);
    await execute({ DB: db },
      `INSERT INTO worker_agent_knowledge (phone, agent_id, agent_name, knowledge, source, created_at) VALUES (?, ?, ?, ?, 'brain', datetime('now'))`,
      [phone, agentId, agentName, trimmed]
    );
  } catch (e) {
    console.error("[EmployeeLink] saveAgentKnowledge error:", (e as Error)?.message);
  }
}

export async function getWorkerKnowledge(
  db: D1Database,
  phone: string,
  limit = 50
): Promise<WorkerKnowledge[]> {
  try {
    await ensureWorkerAgentTables(db);
    return await query<WorkerKnowledge>(
      { DB: db },
      `SELECT wk.id, wk.agent_id, wk.agent_name, wk.knowledge, wk.source, wk.created_at
       FROM worker_agent_knowledge wk
       WHERE wk.phone = ?
       ORDER BY wk.created_at DESC
       LIMIT ?`,
      [phone, limit]
    );
  } catch (e) {
    console.error("[EmployeeLink] getWorkerKnowledge error:", (e as Error)?.message);
    return [];
  }
}

export async function getWorkerLinkedAgents(
  db: D1Database,
  phone: string
): Promise<{ agent_id: string; linked_at: string }[]> {
  try {
    await ensureWorkerAgentTables(db);
    return await query<{ agent_id: string; linked_at: string }>(
      { DB: db },
      "SELECT agent_id, linked_at FROM worker_agent_links WHERE phone = ? ORDER BY linked_at DESC",
      [phone]
    );
  } catch (e) {
    console.error("[EmployeeLink] getWorkerLinkedAgents error:", (e as Error)?.message);
    return [];
  }
}
