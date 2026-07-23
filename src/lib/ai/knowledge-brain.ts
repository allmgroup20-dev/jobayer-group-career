import { execute, query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface KnowledgeEntry {
  id: number;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  sourceType: string | null;
  sourceName: string | null;
  confidence: number;
  tags: string | null;
  version: number;
  createdAt: string;
}

export async function addKnowledgeEntry(entry: {
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  sourceType?: string;
  sourceName?: string;
  sourceUrl?: string;
  confidence?: number;
  tags?: string[];
}): Promise<number> {
  const db = await ensureDB();
  const res = await execute(
    { DB: db },
    `INSERT INTO knowledge_entries (category, subcategory, title, content, source_type, source_name, source_url, confidence, tags, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      entry.category,
      entry.subcategory || null,
      entry.title,
      entry.content,
      entry.sourceType || null,
      entry.sourceName || null,
      entry.sourceUrl || null,
      entry.confidence ?? 0.5,
      entry.tags ? JSON.stringify(entry.tags) : null,
    ]
  );
  return res.meta?.last_row_id ?? 0;
}

export async function searchKnowledge(
  query_text: string,
  options?: {
    category?: string;
    limit?: number;
    minConfidence?: number;
  }
): Promise<KnowledgeEntry[]> {
  const db = await ensureDB();
  const limit = options?.limit ?? 20;
  const minConf = options?.minConfidence ?? 0.3;
  const conditions: string[] = ["is_active = 1", "confidence >= ?"];
  const params: any[] = [minConf];

  if (options?.category) {
    conditions.push("category = ?");
    params.push(options.category);
  }

  params.push(`%${query_text}%`);
  params.push(`%${query_text}%`);
  params.push(`%${query_text}%`);
  params.push(limit);

  const sql = `SELECT id, category, subcategory, title, content, source_type, source_name, confidence, tags, version, created_at FROM knowledge_entries WHERE ${conditions.join(" AND ")} AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) ORDER BY confidence DESC, created_at DESC LIMIT ?`;
  return query<KnowledgeEntry>({ DB: db }, sql, ...params);
}

export async function getKnowledgeByCategory(category: string, limit = 50): Promise<KnowledgeEntry[]> {
  const db = await ensureDB();
  return query<KnowledgeEntry>(
    { DB: db },
    "SELECT id, category, subcategory, title, content, source_type, source_name, confidence, tags, version, created_at FROM knowledge_entries WHERE is_active = 1 AND category = ? ORDER BY confidence DESC, created_at DESC LIMIT ?",
    [category, limit]
  );
}

/**
 * retrieveKnowledge — unified entry point for all agent knowledge retrieval.
 * Replaces both getContextualKnowledge() and getKnowledgeContext().
 */
export async function retrieveKnowledge(params: {
  intent: string;
  department: string;
  language: string;
  agentType?: string;
  limit?: number;
  minConfidence?: number;
}): Promise<string> {
  const db = await ensureDB();
  const limit = params.limit ?? 15;
  const minConf = params.minConfidence ?? 0.3;

  const relevant = await query<{ category: string; title: string; content: string; confidence: number }>(
    { DB: db },
    `SELECT category, title, content, confidence FROM knowledge_entries
     WHERE is_active = 1 AND confidence >= ? AND (category = ? OR category = 'general' OR tags LIKE ?)
     ORDER BY confidence DESC, created_at DESC LIMIT ?`,
    [minConf, params.department, `%${params.intent}%`, limit]
  );
  if (!relevant.length) return "";
  return relevant.map((r) => `[${r.category}] ${r.title} (confidence: ${(r.confidence * 100).toFixed(0)}%)\n${r.content}`).join("\n\n");
}

/** @deprecated Use retrieveKnowledge() instead */
export async function getContextualKnowledge(
  intent: string,
  department: string,
  language: string
): Promise<string> {
  return retrieveKnowledge({ intent, department, language });
}

export async function logConversationLearning(learning: {
  conversationId?: string;
  agentType?: string;
  learningType: string;
  context?: string;
  insight: string;
}): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    `INSERT INTO conversation_learnings (conversation_id, agent_type, learning_type, context, insight) VALUES (?, ?, ?, ?, ?)`,
    [learning.conversationId || null, learning.agentType || null, learning.learningType, learning.context || null, learning.insight]
  );
}

export async function getUnappliedLearnings(limit = 20): Promise<any[]> {
  const db = await ensureDB();
  return query(
    { DB: db },
    "SELECT id, learning_type, insight, context, created_at FROM conversation_learnings WHERE applied = 0 ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
}

export async function markLearningApplied(id: number): Promise<void> {
  const db = await ensureDB();
  await execute({ DB: db }, "UPDATE conversation_learnings SET applied = 1 WHERE id = ?", [id]);
}

export async function submitFeedback(fb: {
  agentType: string;
  rating?: number;
  feedbackText?: string;
  issueType?: string;
}): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    `INSERT INTO agent_feedback (agent_type, rating, feedback_text, issue_type) VALUES (?, ?, ?, ?)`,
    [fb.agentType, fb.rating ?? null, fb.feedbackText || null, fb.issueType || null]
  );
}

export async function getKnowledgeStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  avgConfidence: number;
  totalLearnings: number;
  unappliedLearnings: number;
  totalFeedback: number;
}> {
  const db = await ensureDB();
  const total = await query<{ c: number }>({ DB: db }, "SELECT COUNT(*) as c FROM knowledge_entries WHERE is_active = 1");
  const byCat = await query<{ category: string; c: number }>({ DB: db }, "SELECT category, COUNT(*) as c FROM knowledge_entries WHERE is_active = 1 GROUP BY category ORDER BY c DESC");
  const avg = await query<{ a: number }>({ DB: db }, "SELECT COALESCE(AVG(confidence), 0) as a FROM knowledge_entries WHERE is_active = 1");
  const learnings = await query<{ c: number }>({ DB: db }, "SELECT COUNT(*) as c FROM conversation_learnings");
  const unapplied = await query<{ c: number }>({ DB: db }, "SELECT COUNT(*) as c FROM conversation_learnings WHERE applied = 0");
  const fbTotal = await query<{ c: number }>({ DB: db }, "SELECT COUNT(*) as c FROM agent_feedback");
  return {
    total: total[0]?.c ?? 0,
    byCategory: Object.fromEntries(byCat.map((r) => [r.category, r.c])),
    avgConfidence: avg[0]?.a ?? 0,
    totalLearnings: learnings[0]?.c ?? 0,
    unappliedLearnings: unapplied[0]?.c ?? 0,
    totalFeedback: fbTotal[0]?.c ?? 0,
  };
}

export async function getRelatedEntries(entryId: number): Promise<KnowledgeEntry[]> {
  const db = await ensureDB();
  const related = await query<{ target_id: number }>(
    { DB: db },
    "SELECT target_id FROM knowledge_relationships WHERE source_id = ?",
    [entryId]
  );
  if (!related.length) return [];
  const ids = related.map((r) => r.target_id);
  return query<KnowledgeEntry>(
    { DB: db },
    `SELECT id, category, subcategory, title, content, source_type, source_name, confidence, tags, version, created_at FROM knowledge_entries WHERE id IN (${ids.map(() => "?").join(",")}) AND is_active = 1`,
    ...ids as any[]
  );
}

export async function checkContradictions(category: string, newContent: string): Promise<any[]> {
  const db = await ensureDB();
  const existing = await query<{ id: number; title: string; content: string }>(
    { DB: db },
    "SELECT id, title, content FROM knowledge_entries WHERE is_active = 1 AND category = ? ORDER BY confidence DESC LIMIT 30",
    [category]
  );
  const contradictions: { id: number; title: string; reason: string }[] = [];
  for (const e of existing) {
    if (e.content.toLowerCase().includes("not") && newContent.toLowerCase().includes("not")) {
      const ePos = e.content.toLowerCase().split("not")[1]?.trim().slice(0, 50);
      const nPos = newContent.toLowerCase().split("not")[1]?.trim().slice(0, 50);
      if (ePos && nPos && ePos !== nPos) {
        contradictions.push({ id: e.id, title: e.title, reason: `Potential contradiction with "${e.title}"` });
      }
    }
  }
  return contradictions;
}

// Auto-seed knowledge from database on first load
let seeded = false;
export async function ensureKnowledgeSeeded(): Promise<void> {
  if (seeded) return;
  try {
    const db = await ensureDB();
    const existing = await query<{ c: number }>(
      { DB: db },
      "SELECT COUNT(*) as c FROM knowledge_entries WHERE source_name = 'auto_seed'"
    );
    if (existing[0]?.c > 0) { seeded = true; return; }
    const { autoSeedKnowledge } = await import("./knowledge-auto-seed");
    const result = await autoSeedKnowledge();
    if (result.seeded > 0) {
      seeded = true;
      console.log(`[Knowledge] Auto-seeded ${result.seeded} entries: ${result.categories.join(", ")}`);
    }
  } catch {}
}

// Trigger auto-seed on module load
ensureKnowledgeSeeded();
