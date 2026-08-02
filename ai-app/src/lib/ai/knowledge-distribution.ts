import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface KnowledgeEntry {
  id: number;
  sourceType: string;
  sourceId: string;
  sourceName: string | null;
  targetType: string;
  targetId: string;
  targetName: string | null;
  knowledgeTitle: string;
  knowledgeContent: string;
  knowledgeCategory: string;
  origin: string;
  confidence: number;
  createdAt: string;
  updatedAt: string | null;
}

export async function logKnowledgeDistribution(entry: {
  sourceType: string;
  sourceId: string;
  sourceName?: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  knowledgeTitle: string;
  knowledgeContent: string;
  knowledgeCategory?: string;
  origin?: string;
  confidence?: number;
}): Promise<void> {
  const db = await ensureDB();
  try {
    await execute(
      { DB: db },
      `INSERT INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, confidence, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        entry.sourceType, entry.sourceId, entry.sourceName || null,
        entry.targetType, entry.targetId, entry.targetName || null,
        entry.knowledgeTitle, entry.knowledgeContent,
        entry.knowledgeCategory || "general", entry.origin || "system",
        entry.confidence ?? 1.0,
      ]
    );
  } catch {
    try {
      await ensureDistributionTable(db);
      await execute(
        { DB: db },
        `INSERT INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, confidence, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          entry.sourceType, entry.sourceId, entry.sourceName || null,
          entry.targetType, entry.targetId, entry.targetName || null,
          entry.knowledgeTitle, entry.knowledgeContent,
          entry.knowledgeCategory || "general", entry.origin || "system",
          entry.confidence ?? 1.0,
        ]
      );
    } catch {}
  }
}

async function ensureDistributionTable(db: any): Promise<void> {
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_knowledge_distribution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_name TEXT,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT,
      knowledge_title TEXT NOT NULL,
      knowledge_content TEXT NOT NULL,
      knowledge_category TEXT DEFAULT 'general',
      origin TEXT DEFAULT 'system',
      confidence REAL DEFAULT 1.0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    )`).run();
  } catch {}
}

export async function getKnowledgeDistribution(options?: {
  targetType?: string;
  targetId?: string;
  sourceType?: string;
  sourceId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<KnowledgeEntry[]> {
  const db = await ensureDB();
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (options?.targetType) { conditions.push("target_type = ?"); params.push(options.targetType); }
  if (options?.targetId) { conditions.push("target_id = ?"); params.push(options.targetId); }
  if (options?.sourceType) { conditions.push("source_type = ?"); params.push(options.sourceType); }
  if (options?.sourceId) { conditions.push("source_id = ?"); params.push(options.sourceId); }
  if (options?.category) { conditions.push("knowledge_category = ?"); params.push(options.category); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<KnowledgeEntry>(
    { DB: db },
    `SELECT * FROM ai_knowledge_distribution ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, options?.limit || 50, options?.offset || 0]
  );
}

export async function getKnowledgeDistributionSummary(): Promise<{
  totalEntries: number;
  bySource: { sourceType: string; count: number }[];
  byTarget: { targetType: string; count: number }[];
  byCategory: { category: string; count: number }[];
}> {
  const db = await ensureDB();
  const total = await queryFirst<{ c: number }>(
    { DB: db }, "SELECT COUNT(*) as c FROM ai_knowledge_distribution"
  );
  const bySource = await query<{ sourceType: string; count: number }>(
    { DB: db }, "SELECT source_type, COUNT(*) as count FROM ai_knowledge_distribution GROUP BY source_type ORDER BY count DESC"
  );
  const byTarget = await query<{ targetType: string; count: number }>(
    { DB: db }, "SELECT target_type, COUNT(*) as count FROM ai_knowledge_distribution GROUP BY target_type ORDER BY count DESC"
  );
  const byCategory = await query<{ category: string; count: number }>(
    { DB: db }, "SELECT knowledge_category as category, COUNT(*) as count FROM ai_knowledge_distribution GROUP BY knowledge_category ORDER BY count DESC"
  );
  return {
    totalEntries: total?.c || 0,
    bySource: bySource || [],
    byTarget: byTarget || [],
    byCategory: byCategory || [],
  };
}
