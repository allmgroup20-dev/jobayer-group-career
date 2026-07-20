import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

export async function POST() {
  try {
    const db = await getDB();

    const books = await query<{ source_type: string; source_id: string; source_name: string; knowledge_title: string; knowledge_content: string; knowledge_category: string }>(
      db,
      `SELECT DISTINCT source_type, source_id, source_name, knowledge_title, knowledge_content, knowledge_category
       FROM ai_knowledge_distribution
       WHERE origin = 'book'
       ORDER BY source_id, knowledge_title`
    );

    const workers = await query<{ phone: string; name: string }>(
      db,
      `SELECT DISTINCT w.phone, w.name
       FROM workers w
       INNER JOIN worker_agent_links l ON w.phone = l.phone`
    );

    let assigned = 0;
    let skipped = 0;

    for (const worker of workers) {
      for (const book of books) {
        const existing = await query(
          db,
          `SELECT id FROM worker_agent_knowledge
           WHERE phone = ? AND knowledge = ?
           LIMIT 1`,
          [worker.phone, book.knowledge_content]
        );
        if (existing.length > 0) {
          skipped++;
          continue;
        }
        await execute(
          db,
          `INSERT INTO worker_agent_knowledge (phone, agent_id, agent_name, knowledge, source, version, updated_by, psychologist_notes, created_at)
           VALUES (?, ?, ?, ?, 'book', 1, 'auto_assign', ?, datetime('now'))`,
          [worker.phone, book.source_id, book.source_name, book.knowledge_content, `From book: ${book.knowledge_title} (${book.knowledge_category})`]
        );
        assigned++;
      }
    }

    return NextResponse.json({ success: true, assigned, skipped, totalBooks: books.length, totalWorkers: workers.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
