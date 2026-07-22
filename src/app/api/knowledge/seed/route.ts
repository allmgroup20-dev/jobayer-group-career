import { NextResponse } from "next/server";
import { addKnowledgeEntry } from "@/lib/ai/knowledge-brain";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { ALL_ENTRIES } from "@/lib/ai/seed-data/all-entries";

interface BookInfo {
  sourceName: string;
  total: number;
  inserted: number;
  skipped: number;
}

function extractBookLabel(sourceName: string): string {
  // Normalize common source names for display
  const s = sourceName.toLowerCase();
  if (s.includes("start with why")) return "Start with WHY — Simon Sinek";
  if (s.includes("power of habit")) return "The Power of Habit — Charles Duhigg";
  if (s.includes("how to win friends")) return "How to Win Friends & Influence People — Dale Carnegie";
  if (s.includes("never split")) return "Never Split the Difference — Chris Voss";
  if (s.includes("emotional intelligence")) return "Emotional Intelligence — Daniel Goleman";
  if (s.includes("predictably irrational")) return "Predictably Irrational — Dan Ariely";
  if (s.includes("to sell is human")) return "To Sell Is Human — Daniel H. Pink";
  if (s.includes("culture map")) return "The Culture Map — Erin Meyer";
  if (s.includes("drive")) return "Drive — Daniel H. Pink";
  if (s.includes("hooked")) return "Hooked — Nir Eyal";
  if (s.includes("this is marketing")) return "This Is Marketing — Seth Godin";
  if (s.includes("influence") && s.includes("cialdini")) return "Influence — Robert Cialdini";
  if (s.includes("talking with psychopaths")) return "Talking with Psychopaths — Christopher Berry-Dee";
  if (s.includes("art of persuasion")) return "The Art of Persuasion — Bob Berg";
  return sourceName;
}

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

    const books: Record<string, BookInfo> = {};
    let inserted = 0;
    let skipped = 0;

    for (const entry of ALL_ENTRIES) {
      const label = extractBookLabel(entry.sourceName);
      if (!books[label]) books[label] = { sourceName: label, total: 0, inserted: 0, skipped: 0 };
      books[label].total++;

      const existing = await query(
        { DB: db },
        "SELECT id FROM knowledge_entries WHERE title = ? AND category = ? AND is_active = 1",
        [entry.title, entry.category]
      );
      if (existing.length > 0) {
        books[label].skipped++;
        skipped++;
        continue;
      }

      await addKnowledgeEntry(entry);
      books[label].inserted++;
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} entries (${skipped} skipped) across ${Object.keys(books).length} books`,
      inserted,
      skipped,
      total: ALL_ENTRIES.length,
      books: Object.values(books).sort((a, b) => b.total - a.total),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
