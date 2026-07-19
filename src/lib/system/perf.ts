import { ensureDB } from "@/lib/db";
import { logSystemEvent } from "./logger";

export async function trackApiDuration(
  route: string,
  method: string,
  durationMs: number,
  statusCode: number,
  error?: string
) {
  await logSystemEvent(error ? "error" : "perf", route, `${method} ${durationMs}ms${error ? " " + error : ""}`, {
    duration_ms: durationMs,
    status_code: statusCode,
    route,
    method,
    ...(error ? { stack_trace: error } : {}),
  });
}

export async function generatePerfSnapshot() {
  try {
    const db = await ensureDB();
    const cutoff = new Date(Date.now() - 3600000).toISOString();

    const snapshot = await db.prepare(`
      SELECT
        COALESCE(route, 'unknown') as route,
        COALESCE(method, 'unknown') as method,
        COUNT(*) as request_count,
        SUM(CASE WHEN log_type = 'error' THEN 1 ELSE 0 END) as error_count,
        AVG(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE 0 END) as avg_duration_ms,
        MAX(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE 0 END) as max_duration_ms,
        MIN(CASE WHEN duration_ms IS NOT NULL THEN duration_ms ELSE 0 END) as min_duration_ms
      FROM system_logs
      WHERE created_at >= ? AND (log_type = 'perf' OR log_type = 'error')
      GROUP BY route, method
    `).bind(cutoff).all() as { results: Record<string, unknown>[] };

    if (snapshot.results.length === 0) return { ok: true, rows: 0 };

    const stmt = db.prepare(
      `INSERT INTO perf_snapshots (route, method, avg_duration_ms, max_duration_ms, min_duration_ms, request_count, error_count, period_start, period_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    );
    let inserted = 0;
    for (const row of snapshot.results) {
      await stmt.bind(
        row.route,
        row.method,
        row.avg_duration_ms || 0,
        row.max_duration_ms || 0,
        row.min_duration_ms || 0,
        row.request_count || 0,
        row.error_count || 0,
        cutoff
      ).run();
      inserted++;
    }
    return { ok: true, rows: inserted };
  } catch (err) {
    console.error("Perf snapshot error:", err);
    return { ok: false, error: String(err) };
  }
}
