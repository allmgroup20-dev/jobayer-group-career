import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { callAI } from "@/lib/ai/router";

export async function GET() {
  try {
    const db = await getDB();

    // Gather all data
    const stats = await query<Record<string, number>>(db, `SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT phone) as unique_users,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
      AVG(processing_ms) as avg_ms,
      SUM(tokens_used) as total_tokens
    FROM brain_usage WHERE created_at > datetime('now', '-30 days')`);

    const byDept = await query<Record<string, any>>(db, `SELECT primary_department, COUNT(*) as count, AVG(processing_ms) as avg_ms FROM brain_usage WHERE created_at > datetime('now', '-30 days') GROUP BY primary_department ORDER BY count DESC`);

    const byIntent = await query<Record<string, any>>(db, `SELECT intent, COUNT(*) as count FROM brain_usage WHERE created_at > datetime('now', '-30 days') GROUP BY intent ORDER BY count DESC`);

    const byModel = await query<Record<string, any>>(db, `SELECT model_used, COUNT(*) as count FROM brain_usage WHERE created_at > datetime('now', '-30 days') AND model_used != '' GROUP BY model_used ORDER BY count DESC`);

    const recentFailures = await query<Record<string, any>>(db, `SELECT phone, intent, primary_department, error_message, created_at FROM brain_usage WHERE success = 0 AND created_at > datetime('now', '-7 days') ORDER BY created_at DESC LIMIT 5`);

    const s = stats[0] || { total: 0, unique_users: 0, successful: 0, failed: 0, avg_ms: 0, total_tokens: 0 };

    const deptSummary = byDept.map((d: any) => `${d.primary_department}: ${d.count} requests (avg ${Math.round(d.avg_ms)}ms)`).join("\n");
    const intentSummary = byIntent.map((d: any) => `${d.intent}: ${d.count}`).join("\n");
    const modelSummary = byModel.map((d: any) => `${d.model_used}: ${d.count}`).join("\n");
    const failureSummary = recentFailures.length > 0
      ? recentFailures.map((f: any) => `${f.created_at} | ${f.phone} | ${f.intent} | ${f.error_message?.slice(0, 100)}`).join("\n")
      : "No recent failures";

    // Have AI generate a summary report
    let aiSummary = "AI summary unavailable";
    try {
      const reportPrompt = `You are Agent Senior, the CEO analyst at Jobayer Group Career. Generate a short executive report from these stats:

## 30-Day Brain Performance Report
- Total requests: ${s.total}
- Unique users: ${s.unique_users}
- Success rate: ${s.total > 0 ? Math.round((s.successful / s.total) * 100) : 0}%
- Avg response time: ${Math.round(s.avg_ms)}ms
- Total tokens consumed: ${s.total_tokens}

## Department Breakdown
${deptSummary}

## Intent Distribution
${intentSummary}

## Model Usage
${modelSummary}

## Recent Failures (7d)
${failureSummary}

## Report Format
Provide a concise 4-5 line executive summary in English. Include:
1. Overall health assessment (GREEN/YELLOW/RED)
2. Top performing department
3. Most common intent
4. Key areas for improvement
5. Recommendation`;

      const result = await callAI(
        { messages: [{ role: "system", content: reportPrompt }, { role: "user", content: "Generate the executive report." }] },
        200, "llama-3.3-70b", "openrouter"
      );
      aiSummary = result.text;
    } catch {}

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      period: "last_30_days",
      stats: s,
      ai_summary: aiSummary,
      departments: byDept,
      intents: byIntent,
      models: byModel,
      recent_failures: recentFailures,
    });
  } catch (error) {
    console.error("Brain report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
