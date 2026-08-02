import { ensureDB } from "@/lib/db";
import { callAI } from "@/lib/ai/router";

export async function analyzeRecentErrors(): Promise<{
  ok: boolean;
  reportId?: number;
  note?: string;
  error?: string;
}> {
  try {
    const db = await ensureDB();

    const errors = await db.prepare(`
      SELECT id, log_type, source, message, stack_trace, status_code, route, method, duration_ms, created_at
      FROM system_logs
      WHERE log_type IN ('error', 'warning')
        AND created_at >= datetime('now', '-1 day')
        AND is_ai_analyzed = 0
      ORDER BY created_at DESC
      LIMIT 50
    `).bind().all() as { results: Record<string, unknown>[] };

    if (!errors.results || errors.results.length === 0) {
      return { ok: true, note: "No errors to analyze" };
    }

    const routeNames = [...new Set(errors.results.map((e) => e.route).filter(Boolean))];
    const perfData: Record<string, unknown>[] = [];
    for (const r of routeNames.slice(0, 10)) {
      const snap = await db.prepare(`
        SELECT route, method, avg_duration_ms, error_count, request_count
        FROM perf_snapshots WHERE route = ? ORDER BY created_at DESC LIMIT 1
      `).bind(r).all() as { results: Record<string, unknown>[] };
      if (snap.results?.[0]) perfData.push(snap.results[0]);
    }

    const errorCount = errors.results.filter((e) => e.log_type === "error").length;
    const warningCount = errors.results.filter((e) => e.log_type === "warning").length;

    const errorSummary = errors.results.map((e) =>
      `[${e.log_type}] ${e.source}: ${e.message}${e.route ? ` (route: ${e.method} ${e.route})` : ""}${e.status_code ? ` status=${e.status_code}` : ""}${e.duration_ms ? ` ${e.duration_ms}ms` : ""}`
    ).join("\n");

    const perfSummary = perfData.map((p) =>
      `${p.route}: avg=${Math.round(Number(p.avg_duration_ms))}ms, errors=${p.error_count}/${p.request_count} req`
    ).join("\n");

    const prompt = `You are a site reliability engineer for career.jobayergroup.com (Next.js on Cloudflare Workers, D1 database, KV cache). Analyze these errors and give a structured report.

ERRORS (last 24h):
${errorSummary}

PERFORMANCE DATA:
${perfSummary || "No perf data available"}

Respond in this exact JSON format (no markdown, no code fences, pure JSON):
{
  "severity": "low|medium|high|critical",
  "rootCause": "brief root cause summary",
  "detailedAnalysis": "2-3 sentence analysis",
  "affectedRoutes": ["route1", "route2"],
  "suggestedFixes": ["fix1", "fix2", "fix3"],
  "estimatedImpact": "brief impact description"
}`;

    let analysisText: string | null = null;
    let modelUsed = "";

    // Try opencode.ai directly (free tier, no key needed)
    try {
      const res = await fetch("https://opencode.ai/zen/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-v4-flash-free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) {
        const data = await res.json() as { choices?: { message: { content: string | null } }[] };
        analysisText = data?.choices?.[0]?.message?.content || null;
        modelUsed = "opencode:deepseek-v4-flash-free";
      }
    } catch {}

    // Fallback: use existing AI router (requires configured API keys)
    if (!analysisText) {
      try {
        const result = await callAI(
          { messages: [{ role: "user", content: prompt }], temperature: 0.3 },
          1000,
          undefined,
          "opencode"
        );
        analysisText = result.text;
        modelUsed = result.model;
      } catch (err) {
        const msg = String(err);
        if (!analysisText) {
          if (msg.includes("No API keys")) {
            return { ok: false, error: "No AI API keys configured. Add an API key in AI Settings, or opencode.ai direct access failed." };
          }
          return { ok: false, error: "AI analysis failed: " + msg };
        }
      }
    }

    if (!analysisText) {
      return { ok: false, error: "AI analysis failed — all models unavailable" };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(analysisText.trim());
    } catch {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: analysisText };
    }

    const reportResult = await db.prepare(
      `INSERT INTO ai_analysis_reports (report_type, title, summary, details, affected_routes, severity, suggested_fixes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      "error_analysis",
      `Error Analysis — ${errorCount} errors, ${warningCount} warnings`,
      parsed.rootCause || parsed.summary || analysisText.slice(0, 200),
      JSON.stringify({ rawAnalysis: analysisText, model: modelUsed, errorCount, warningCount, perfData, analyzedAt: new Date().toISOString() }),
      JSON.stringify(parsed.affectedRoutes || routeNames),
      parsed.severity || "medium",
      JSON.stringify(parsed.suggestedFixes || [])
    ).run() as { meta: { last_row_id: number } };

    const ids = errors.results.map((e) => e.id).filter(Boolean);
    for (const id of ids) {
      await db.prepare("UPDATE system_logs SET is_ai_analyzed = 1 WHERE id = ?").bind(id).run().catch(() => {});
    }

    return { ok: true, reportId: reportResult.meta.last_row_id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function getReports(
  reportType?: string,
  page = 1,
  limit = 20
): Promise<{ reports: Record<string, unknown>[]; total: number }> {
  const db = await ensureDB();
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (reportType) { conditions.push("report_type = ?"); params.push(reportType); }

  const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const [rows, countResult] = await Promise.all([
    db.prepare(`SELECT id, report_type, title, summary, severity, affected_routes, created_at FROM ai_analysis_reports ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all() as Promise<{ results: Record<string, unknown>[] }>,
    db.prepare(`SELECT COUNT(*) as count FROM ai_analysis_reports ${where}`).bind(...params).first() as Promise<{ count: number } | undefined>,
  ]);

  return {
    reports: (rows.results || []).map((r) => ({
      ...r,
      affected_routes: typeof r.affected_routes === "string" ? JSON.parse(r.affected_routes as string) : r.affected_routes,
    })),
    total: countResult?.count || 0,
  };
}
