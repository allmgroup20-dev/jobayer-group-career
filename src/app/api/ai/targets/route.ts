import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

interface Target {
  id: number;
  period: string;
  target_sales: number;
  target_revenue: number;
  current_sales: number;
  current_revenue: number;
  start_date: string;
  end_date: string;
  status: string;
  report_generated: number;
  report_content: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const period = searchParams.get("period");
    const generateReport = searchParams.get("report") === "true";

    if (generateReport) {
      const targets = await query<Target>(env,
        "SELECT * FROM ai_targets WHERE status = 'active' AND end_date < datetime('now') AND report_generated = 0"
      );
      const reports: string[] = [];
      for (const t of targets) {
        const missed = t.current_sales < t.target_sales;
        const ratio = t.target_sales > 0 ? (t.current_sales / t.target_sales * 100).toFixed(1) : "0";
        const report = missed
          ? `[MISSED] ${t.period} target (${t.start_date} to ${t.end_date}): Achieved ${t.current_sales}/${t.target_sales} sales (${ratio}%). Revenue: ৳${t.current_revenue}/৳${t.target_revenue}. Root causes: low engagement, price sensitivity, trust barriers. Recommendations: increase proactive outreach, offer installment plans, share more social proof.`
          : `[ACHIEVED] ${t.period} target (${t.start_date} to ${t.end_date}): ${t.current_sales}/${t.target_sales} sales (${ratio}%). Revenue: ৳${t.current_revenue}. Keep current strategy.`;
        await execute(env,
          "UPDATE ai_targets SET report_generated = 1, report_content = ?, status = ? WHERE id = ?",
          [report, missed ? "missed" : "completed", t.id]
        );
        reports.push(report);
      }
      return NextResponse.json({ reports, count: reports.length });
    }

    let sql = "SELECT * FROM ai_targets WHERE status = ?";
    const params: any[] = [status];
    if (period) { sql += " AND period = ?"; params.push(period); }
    sql += " ORDER BY start_date DESC";
    const targets = await query<Target>(env, sql, params);
    return NextResponse.json({ targets });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as { period: string; targetSales: number; targetRevenue?: number; startDate: string; endDate: string };
    if (!body.period || !body.targetSales || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "period, targetSales, startDate, endDate required" }, { status: 400 });
    }
    const result = await execute(env,
      `INSERT INTO ai_targets (period, target_sales, target_revenue, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [body.period, body.targetSales, body.targetRevenue || 0, body.startDate, body.endDate]
    );
    return NextResponse.json({ success: true, id: result?.meta?.last_row_id || 0 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as { id: number; currentSales: number; currentRevenue?: number };
    if (!body.id || body.currentSales === undefined) {
      return NextResponse.json({ error: "id and currentSales required" }, { status: 400 });
    }
    await execute(env,
      "UPDATE ai_targets SET current_sales = ?, current_revenue = ?, updated_at = datetime('now') WHERE id = ?",
      [body.currentSales, body.currentRevenue || 0, body.id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
