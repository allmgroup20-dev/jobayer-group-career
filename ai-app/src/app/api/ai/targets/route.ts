import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

interface Target {
  id: number;
  type: string;
  period: string;
  target_sales: number;
  target_revenue: number;
  base_amount: number | null;
  current_day: number;
  current_sales: number;
  current_revenue: number;
  start_date: string;
  end_date: string;
  status: string;
  report_generated: number;
  report_content: string | null;
}

function computePriority(t: Target): number {
  if (t.type === "geometric" && t.base_amount && t.current_day > 1) {
    return t.base_amount * Math.pow(2, t.current_day - 1);
  }
  return t.target_sales;
}

function computeDayTarget(baseAmount: number, currentDay: number): number {
  return baseAmount * Math.pow(2, currentDay - 1);
}

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const period = searchParams.get("period");
    const sortBy = searchParams.get("sortBy") || "start_date";
    const generateReport = searchParams.get("report") === "true";

    if (generateReport) {
      const targets = await query<Target>(env,
        "SELECT * FROM ai_targets WHERE status = 'active' AND end_date < datetime('now') AND report_generated = 0"
      );
      const reports: string[] = [];
      for (const t of targets) {
        const missed = t.current_sales < (t.type === "geometric" && t.base_amount ? computeDayTarget(t.base_amount, t.current_day) : t.target_sales);
        const effectiveTarget = t.type === "geometric" && t.base_amount ? computeDayTarget(t.base_amount, t.current_day) : t.target_sales;
        const ratio = effectiveTarget > 0 ? (t.current_sales / effectiveTarget * 100).toFixed(1) : "0";
        const typeLabel = t.type === "geometric" ? `Geometric Day ${t.current_day}` : t.period;
        const report = missed
          ? `[MISSED] ${typeLabel} target (${t.start_date} to ${t.end_date}): Achieved ${t.current_sales}/${effectiveTarget} sales (${ratio}%). Revenue: ৳${t.current_revenue}. Root causes: low engagement, price sensitivity, trust barriers. Recommendations: increase proactive outreach, offer installment plans, share more social proof.`
          : `[ACHIEVED] ${typeLabel} target (${t.start_date} to ${t.end_date}): ${t.current_sales}/${effectiveTarget} sales (${ratio}%). Revenue: ৳${t.current_revenue}. Keep current strategy.`;
        await execute(env,
          "UPDATE ai_targets SET report_generated = 1, report_content = ?, status = ? WHERE id = ?",
          [report, missed ? "missed" : "completed", t.id]
        );
        reports.push(report);
      }
      return NextResponse.json({ reports, count: reports.length });
    }

    // Advance geometric target days before fetching
    const geometricTargets = await query<Target>(env,
      "SELECT * FROM ai_targets WHERE type = 'geometric' AND status = 'active' AND base_amount IS NOT NULL"
    );
    const now = /* @__PURE__ */ new Date().toISOString().split("T")[0];
    for (const t of geometricTargets) {
      const daysSinceStart = Math.floor(
        (new Date(now).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const expectedDay = Math.min(daysSinceStart + 1, 365);
      if (expectedDay > t.current_day) {
        const newDay = expectedDay;
        const newTarget = computeDayTarget(t.base_amount!, newDay);
        await execute(env,
          "UPDATE ai_targets SET current_day = ?, target_sales = ?, updated_at = datetime('now') WHERE id = ?",
          [newDay, newTarget, t.id]
        );
        t.current_day = newDay;
        t.target_sales = newTarget;
      }
    }

    let sql = "SELECT * FROM ai_targets WHERE status = ?";
    const params: any[] = [status];
    if (period) { sql += " AND period = ?"; params.push(period); }
    if (sortBy === "priority") {
      sql += " ORDER BY target_sales DESC";
    } else {
      sql += " ORDER BY start_date DESC";
    }
    const targets = await query<Target>(env, sql, params);

    const enriched = targets.map(t => ({
      ...t,
      priority: computePriority(t),
      dayTarget: t.type === "geometric" && t.base_amount ? computeDayTarget(t.base_amount, t.current_day) : null,
    }));

    if (sortBy === "priority") {
      enriched.sort((a, b) => b.priority - a.priority);
    }

    return NextResponse.json({ targets: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as {
      type?: string;
      period: string;
      targetSales?: number;
      targetRevenue?: number;
      baseAmount?: number;
      startDate: string;
      endDate: string;
    };
    const type = body.type || "fixed";

    if (type === "geometric") {
      if (!body.baseAmount || !body.startDate || !body.endDate) {
        return NextResponse.json({ error: "geometric target requires baseAmount, startDate, endDate" }, { status: 400 });
      }
      const dayTarget = computeDayTarget(body.baseAmount, 1);
      const result = await execute(env,
        `INSERT INTO ai_targets (type, period, target_sales, target_revenue, base_amount, current_day, start_date, end_date, status)
         VALUES ('geometric', 'days', ?, ?, ?, 1, ?, ?, 'active')`,
        [dayTarget, body.targetRevenue || 0, body.baseAmount, body.startDate, body.endDate]
      );
      return NextResponse.json({ success: true, id: result?.meta?.last_row_id || 0, type: "geometric", dayTarget });
    }

    if (!body.period || !body.targetSales || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "fixed target requires period, targetSales, startDate, endDate" }, { status: 400 });
    }
    const result = await execute(env,
      `INSERT INTO ai_targets (type, period, target_sales, target_revenue, start_date, end_date, status)
       VALUES ('fixed', ?, ?, ?, ?, ?, 'active')`,
      [body.period, body.targetSales, body.targetRevenue || 0, body.startDate, body.endDate]
    );
    return NextResponse.json({ success: true, id: result?.meta?.last_row_id || 0, type: "fixed" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as { id: number; currentSales: number; currentRevenue?: number; forceDay?: number };
    if (!body.id || body.currentSales === undefined) {
      return NextResponse.json({ error: "id and currentSales required" }, { status: 400 });
    }

    const existing = await query<Target>(env, "SELECT * FROM ai_targets WHERE id = ?", [body.id]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    const t = existing[0];
    const effectiveTarget = t.type === "geometric" && t.base_amount ? computeDayTarget(t.base_amount, t.current_day) : t.target_sales;
    const now = /* @__PURE__ */ new Date().toISOString().split("T")[0];

    let autoComplete = false;
    let newStatus: string | null = null;

    if (body.currentSales >= effectiveTarget) {
      autoComplete = true;
      newStatus = "completed";
    } else if (now > t.end_date) {
      autoComplete = true;
      newStatus = "missed";
    }

    if (autoComplete) {
      const missed = newStatus === "missed";
      const ratio = effectiveTarget > 0 ? (body.currentSales / effectiveTarget * 100).toFixed(1) : "0";
      const typeLabel = t.type === "geometric" ? `Geometric Day ${t.current_day}` : t.period;
      const report = missed
        ? `[MISSED] ${typeLabel} target: Achieved ${body.currentSales}/${effectiveTarget} sales (${ratio}%). Revenue: ৳${body.currentRevenue || 0}.`
        : `[ACHIEVED] ${typeLabel} target: ${body.currentSales}/${effectiveTarget} sales (${ratio}%). Revenue: ৳${body.currentRevenue || 0}. Keep current strategy.`;
      await execute(env,
        "UPDATE ai_targets SET current_sales = ?, current_revenue = ?, status = ?, report_generated = 1, report_content = ?, updated_at = datetime('now') WHERE id = ?",
        [body.currentSales, body.currentRevenue || 0, newStatus, report, body.id]
      );
      return NextResponse.json({ success: true, autoCompleted: true, status: newStatus, report });
    }

    await execute(env,
      "UPDATE ai_targets SET current_sales = ?, current_revenue = ?, updated_at = datetime('now') WHERE id = ?",
      [body.currentSales, body.currentRevenue || 0, body.id]
    );
    return NextResponse.json({ success: true, progress: body.currentSales / effectiveTarget });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
