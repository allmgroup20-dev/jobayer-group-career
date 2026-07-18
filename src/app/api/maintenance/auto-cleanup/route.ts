import { NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getSystemTimezone, isScheduledTime } from "@/lib/timezone";

const TABLES = [
  "user_events", "user_sessions", "user_searches", "notifications",
  "communication_history", "ai_log", "ai_conversations", "ai_agent_logs",
  "ai_agent_tasks", "ai_agent_submissions", "ai_agent_reports",
  "wa_logs", "brain_usage", "agent_feedback",
];

export async function GET() {
  try {
    const db = await getDB();

    const settings = await query<{ setting_key: string; setting_value: string }>(
      db,
      "SELECT setting_key, setting_value FROM company_settings WHERE setting_key IN ('maintenance_auto_enabled', 'maintenance_retention_days', 'maintenance_schedule_hour', 'timezone')"
    );
    const s: Record<string, string> = {};
    for (const row of settings) s[row.setting_key] = row.setting_value;

    if (s.maintenance_auto_enabled !== "1") {
      return NextResponse.json({ skipped: true, reason: "Auto-cleanup disabled" });
    }

    const tz = s.timezone || getSystemTimezone();
    const scheduleHour = parseInt(s.maintenance_schedule_hour || "3");

    if (!isScheduledTime(scheduleHour, tz)) {
      return NextResponse.json({ skipped: true, reason: "Not scheduled time", tz, scheduleHour });
    }

    const days = parseInt(s.maintenance_retention_days || "90");
    const results: { table: string; rowsDeleted: number }[] = [];

    for (const table of TABLES) {
      try {
        const countRes = await queryFirst<{ cnt: number }>(
          db,
          `SELECT COUNT(*) as cnt FROM ${table} WHERE created_at < datetime('now', '-${days} days')`
        );
        const rows = countRes?.cnt || 0;
        if (rows > 0) {
          await execute(db, `DELETE FROM ${table} WHERE created_at < datetime('now', '-${days} days')`);
          await execute(db,
            `INSERT INTO maintenance_log (action, table_name, rows_deleted, status, details) VALUES ('auto-cleanup', ?, ?, 'success', ?)`,
            [table, rows, `Auto cleanup: rows older than ${days} days at ${new Date().toISOString()}`]
          );
        }
        results.push({ table, rowsDeleted: rows });
      } catch {
        results.push({ table, rowsDeleted: -1 });
      }
    }

    const total = results.reduce((s, r) => s + (r.rowsDeleted > 0 ? r.rowsDeleted : 0), 0);
    return NextResponse.json({ success: true, results, totalRowsDeleted: total, retentionDays: days, timezone: tz });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
