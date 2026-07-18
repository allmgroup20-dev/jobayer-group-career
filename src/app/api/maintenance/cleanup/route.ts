import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

const ALLOWED_TABLES = [
  "user_events", "user_sessions", "user_searches", "notifications",
  "communication_history", "ai_log", "ai_conversations", "ai_agent_logs",
  "ai_agent_tasks", "ai_agent_submissions", "ai_agent_reports",
  "wa_logs", "wa_message_queue", "brain_usage", "agent_feedback",
];

export async function POST(request: NextRequest) {
  try {
    const { table, olderThanDays, force } = await request.json() as {
      table: string; olderThanDays?: number; force?: boolean;
    };

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    const days = olderThanDays || 90;
    if (days < 30 && !force) {
      return NextResponse.json({ error: "Minimum retention is 30 days. Use force=true to override." }, { status: 400 });
    }

    const db = await getDB();

    const countRes = await queryFirst<{ cnt: number }>(
      db,
      `SELECT COUNT(*) as cnt FROM ${table} WHERE created_at < datetime('now', '-${days} days')`
    );
    const rowsToDelete = countRes?.cnt || 0;

    // Delete
    await execute(db,
      `DELETE FROM ${table} WHERE created_at < datetime('now', '-${days} days')`
    );

    // Log the action
    await execute(db,
      `INSERT INTO maintenance_log (action, table_name, rows_deleted, status, details) VALUES (?, ?, ?, 'success', ?)`,
      ["cleanup", table, rowsToDelete, `Deleted rows older than ${days} days`]
    );

    await invalidateCache("maintenance:stats");

    return NextResponse.json({ success: true, table, rowsDeleted: rowsToDelete, olderThanDays: days });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
