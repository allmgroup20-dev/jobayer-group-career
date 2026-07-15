import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string;
      text: string;
      intent: string;
      primary_department: string;
      departments_used: string;
      agents_used: string;
      chain_type: string;
      model_used: string;
      tokens_used: number;
      processing_ms: number;
      success: number;
      error_message?: string;
    };

    const db = await getDB();
    await execute(
      db,
      `INSERT INTO brain_usage (phone, text, intent, primary_department, departments_used, agents_used, chain_type, model_used, tokens_used, processing_ms, success, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.phone, body.text?.slice(0, 500), body.intent,
        body.primary_department, body.departments_used, body.agents_used,
        body.chain_type, body.model_used, body.tokens_used,
        body.processing_ms, body.success ?? 1, body.error_message || "",
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Brain log error:", error);
    return NextResponse.json({ error: "Failed to log brain usage" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDB();
    const stats = await query<Record<string, number>>(db, `SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT phone) as unique_users,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
      COUNT(DISTINCT primary_department) as departments_used,
      AVG(processing_ms) as avg_processing_ms,
      SUM(tokens_used) as total_tokens
    FROM brain_usage WHERE created_at > datetime('now', '-7 days')`);

    const byDept = await query<Record<string, number | string>>(db, `SELECT primary_department, COUNT(*) as count, AVG(processing_ms) as avg_ms FROM brain_usage WHERE created_at > datetime('now', '-7 days') GROUP BY primary_department ORDER BY count DESC`);

    const byIntent = await query<Record<string, number | string>>(db, `SELECT intent, COUNT(*) as count FROM brain_usage WHERE created_at > datetime('now', '-7 days') GROUP BY intent ORDER BY count DESC LIMIT 10`);

    return NextResponse.json({
      stats: stats[0] || { total: 0, unique_users: 0, successful: 0, failed: 0, departments_used: 0, avg_processing_ms: 0, total_tokens: 0 },
      byDepartment: byDept,
      byIntent: byIntent,
    });
  } catch (error) {
    console.error("Brain stats error:", error);
    return NextResponse.json({ error: "Failed to load brain stats" }, { status: 500 });
  }
}
