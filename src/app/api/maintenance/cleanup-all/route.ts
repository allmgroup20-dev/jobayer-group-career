import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

const TABLES = [
  "user_events", "user_sessions", "user_searches", "notifications",
  "communication_history", "ai_log", "ai_conversations", "ai_agent_logs",
  "ai_agent_tasks", "ai_agent_submissions", "ai_agent_reports",
  "wa_logs", "wa_message_queue", "brain_usage", "agent_feedback",
];

export async function POST(request: NextRequest) {
  try {
    const { olderThanDays } = await request.json() as { olderThanDays?: number };
    const days = olderThanDays || 90;
    const db = await getDB();

    const results = await Promise.all(TABLES.map(async (table) => {
      try {
        const delResult = await execute(db,
          `DELETE FROM ${table} WHERE created_at < datetime('now', '-${days} days')`
        );
        const rows = delResult.meta?.changes || 0;
        if (rows > 0) {
          await execute(db,
            `INSERT INTO maintenance_log (action, table_name, rows_deleted, status, details) VALUES (?, ?, ?, 'success', ?)`,
            ["cleanup-all", table, rows, `Bulk cleanup: rows older than ${days} days`]
          );
        }
        return { table, rowsDeleted: rows };
      } catch {
        return { table, rowsDeleted: -1 };
      }
    }));

    const total = results.reduce((s, r) => s + (r.rowsDeleted > 0 ? r.rowsDeleted : 0), 0);
    await invalidateCache("maintenance:stats");

    return NextResponse.json({ success: true, results, totalRowsDeleted: total, olderThanDays: days });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
