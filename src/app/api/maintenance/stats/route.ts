import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

const TABLES = [
  "user_events", "user_sessions", "user_searches", "notifications",
  "communication_history", "ai_log", "ai_conversations", "ai_agent_logs",
  "ai_agent_tasks", "ai_agent_submissions", "ai_agent_reports",
  "wa_logs", "wa_message_queue", "brain_usage", "agent_feedback",
  "workers", "orders", "commissions", "withdrawals", "saved_accounts",
];

export async function GET() {
  const cached = await getCached<any[]>("maintenance:stats", 120);
  if (cached) return NextResponse.json({ tables: cached });

  try {
    const db = await getDB();
    const results = await Promise.all(TABLES.map(table =>
      query<{ cnt: number }>(db, `SELECT COUNT(*) as cnt FROM ${table}`)
        .then(res => ({ name: table, rows: res[0]?.cnt || 0 }))
        .catch(() => ({ name: table, rows: -1 }))
    ));

    await setCached("maintenance:stats", results);
    return NextResponse.json({ tables: results });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
