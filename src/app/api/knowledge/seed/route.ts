import { NextResponse } from "next/server";
import { addKnowledgeEntry } from "@/lib/ai/knowledge-brain";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { ALL_ENTRIES } from "@/lib/ai/seed-data/all-entries";

interface BookInfo {
  key: string;
  bookTitle: string;
  author: string;
  total: number;
  inserted: number;
  skipped: number;
}

const BOOK_MAP: { key: string; bookTitle: string; author: string }[] = [
  { key: "start with why", bookTitle: "Start with WHY", author: "Simon Sinek" },
  { key: "power of habit", bookTitle: "The Power of Habit", author: "Charles Duhigg" },
  { key: "how to win friends", bookTitle: "How to Win Friends & Influence People", author: "Dale Carnegie" },
  { key: "never split", bookTitle: "Never Split the Difference", author: "Chris Voss" },
  { key: "emotional intelligence", bookTitle: "Emotional Intelligence", author: "Daniel Goleman" },
  { key: "predictably irrational", bookTitle: "Predictably Irrational", author: "Dan Ariely" },
  { key: "to sell is human", bookTitle: "To Sell Is Human", author: "Daniel H. Pink" },
  { key: "culture map", bookTitle: "The Culture Map", author: "Erin Meyer" },
  { key: "drive", bookTitle: "Drive", author: "Daniel H. Pink" },
  { key: "hooked", bookTitle: "Hooked", author: "Nir Eyal" },
  { key: "this is marketing", bookTitle: "This Is Marketing", author: "Seth Godin" },
  { key: "influence", bookTitle: "Influence", author: "Robert Cialdini" },
  { key: "talking with psychopaths", bookTitle: "Talking with Psychopaths", author: "Christopher Berry-Dee" },
  { key: "art of persuasion", bookTitle: "The Art of Persuasion", author: "Bob Berg" },
];

function extractBookInfo(sourceName: string): { bookTitle: string; author: string } {
  const s = sourceName.toLowerCase();
  for (const b of BOOK_MAP) {
    if (s.includes(b.key)) return { bookTitle: b.bookTitle, author: b.author };
  }
  // Fallback: split on ' — ' or ' by '
  const byMatch = sourceName.match(/^(.+?)\s+by\s+(.+)$/);
  if (byMatch) return { bookTitle: byMatch[1].trim(), author: byMatch[2].trim() };
  const dashMatch = sourceName.match(/^(.+?)\s*[—–-]\s*(.+)$/);
  if (dashMatch) return { bookTitle: dashMatch[1].trim(), author: dashMatch[2].trim() };
  return { bookTitle: sourceName, author: "" };
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
      const { bookTitle, author } = extractBookInfo(entry.sourceName);
      if (!books[bookTitle]) books[bookTitle] = { key: bookTitle, bookTitle, author, total: 0, inserted: 0, skipped: 0 };
      books[bookTitle].total++;

      const existing = await query(
        { DB: db },
        "SELECT id FROM knowledge_entries WHERE title = ? AND category = ? AND is_active = 1",
        [entry.title, entry.category]
      );
      if (existing.length > 0) {
        books[bookTitle].skipped++;
        skipped++;
        continue;
      }

      await addKnowledgeEntry(entry);
      books[bookTitle].inserted++;
      inserted++;
    }

    const sortedBooks = Object.values(books).sort((a, b) => b.total - a.total);
    const bookCount = sortedBooks.length;

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} entries (${skipped} skipped) across ${bookCount} books`,
      inserted,
      skipped,
      total: ALL_ENTRIES.length,
      bookCount,
      books: sortedBooks,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
