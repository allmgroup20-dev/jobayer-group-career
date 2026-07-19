import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { generatePerfSnapshot } from "@/lib/system/perf";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const route = sp.get("route");
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(100, parseInt(sp.get("limit") || "30"));
    const offset = (page - 1) * limit;

    const db = await ensureDB();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (route) { conditions.push("route = ?"); params.push(route); }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const [rows, countResult] = await Promise.all([
      db.prepare(`SELECT id, route, method, avg_duration_ms, max_duration_ms, min_duration_ms, request_count, error_count, period_start, period_end, created_at FROM perf_snapshots ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all() as Promise<{ results: Record<string, unknown>[] }>,
      db.prepare(`SELECT COUNT(*) as count FROM perf_snapshots ${where}`).bind(...params).first() as Promise<{ count: number } | undefined>,
    ]);

    // Aggregate by route for summary
    const summary = await db.prepare(`
      SELECT route, method, COUNT(*) as snapshots,
             AVG(avg_duration_ms) as overall_avg,
             SUM(error_count) as total_errors,
             SUM(request_count) as total_requests
      FROM perf_snapshots
      GROUP BY route, method
      ORDER BY overall_avg DESC
      LIMIT 50
    `).bind().all() as { results: Record<string, unknown>[] };

    return NextResponse.json({
      snapshots: rows.results || [],
      summary: summary.results || [],
      total: countResult?.count || 0,
      page, limit,
    });
  } catch (err) {
    console.error("System perf error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST() {
  const result = await generatePerfSnapshot();
  return NextResponse.json(result);
}
