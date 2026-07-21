import { NextResponse } from "next/server";
import { addKnowledgeEntry } from "@/lib/ai/knowledge-brain";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { ALL_ENTRIES } from "@/lib/ai/seed-data/all-entries";

export async function GET() {
  try {
    const db = await ensureDB();

    // Ensure the knowledge_entries table exists (ensureSchema fast-check skips Phase 10)
    await db.prepare(`CREATE TABLE IF NOT EXISTS knowledge_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      subcategory TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source_type TEXT,
      source_name TEXT,
      source_url TEXT,
      confidence REAL DEFAULT 0.5,
      tags TEXT,
      version INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS knowledge_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL,
      target_id INTEGER NOT NULL,
      relationship_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS conversation_learnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT,
      agent_type TEXT,
      learning_type TEXT NOT NULL,
      context TEXT,
      insight TEXT NOT NULL,
      applied INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    try { await db.prepare("CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category, confidence)").run(); } catch {}
    try { await db.prepare("CREATE INDEX IF NOT EXISTS idx_knowledge_entries_tags ON knowledge_entries(tags)").run(); } catch {}

    let inserted = 0;
    let skipped = 0;

    for (const entry of ALL_ENTRIES) {
      const existing = await query(
        { DB: db },
        "SELECT id FROM knowledge_entries WHERE title = ? AND category = ? AND is_active = 1",
        [entry.title, entry.category]
      );
      if (existing.length > 0) { skipped++; continue; }

      await addKnowledgeEntry(entry);
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} entries (${skipped} skipped — already exist)`,
      inserted,
      skipped,
      total: ALL_ENTRIES.length,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
