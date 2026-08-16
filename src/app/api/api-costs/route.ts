import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { requireCompany } from "@/lib/auth/guard";
import { WHATSAPP_MSG_USD, SMS_MSG_USD, EMAIL_USD } from "@/lib/cost-prices";

const BDT_PER_USD = 120;

function fmt(n: number): number {
  return Math.round((Number(n) || 0) * 10000) / 10000;
}

export async function GET(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDB();

    const [byProvider, byFeature, byDay, today, total, recent] = await Promise.all([
      query<{ provider: string; total: number; calls: number }>(
        db,
        `SELECT provider, SUM(est_cost_usd) as total, COUNT(*) as calls
         FROM api_cost_logs GROUP BY provider ORDER BY total DESC`
      ),
      query<{ feature: string; total: number; calls: number }>(
        db,
        `SELECT feature, SUM(est_cost_usd) as total, COUNT(*) as calls
         FROM api_cost_logs GROUP BY feature ORDER BY total DESC`
      ),
      query<{ day: string; total: number; calls: number }>(
        db,
        `SELECT date(created_at) as day, SUM(est_cost_usd) as total, COUNT(*) as calls
         FROM api_cost_logs WHERE created_at >= datetime('now', '-29 days')
         GROUP BY day ORDER BY day ASC`
      ),
      query<{ total: number; calls: number }>(
        db,
        `SELECT SUM(est_cost_usd) as total, COUNT(*) as calls
         FROM api_cost_logs WHERE created_at >= datetime('now', '-1 day')`
      ),
      query<{ total: number; calls: number }>(
        db,
        `SELECT SUM(est_cost_usd) as total, COUNT(*) as calls FROM api_cost_logs`
      ),
      query<{ id: number; provider: string; feature: string; operation: string; model: string; input_tokens: number; output_tokens: number; quantity: number; est_cost_usd: number; created_at: string }>(
        db,
        `SELECT id, provider, feature, operation, model, input_tokens, output_tokens,
                quantity, est_cost_usd, created_at
         FROM api_cost_logs ORDER BY id DESC LIMIT 50`
      ),
    ]);

    const todayTotal = fmt(today[0]?.total || 0);
    const totalAll = fmt(total[0]?.total || 0);

    return NextResponse.json({
      summary: {
        today: todayTotal,
        todayBdt: Math.round(todayTotal * BDT_PER_USD),
        allTime: totalAll,
        allTimeBdt: Math.round(totalAll * BDT_PER_USD),
        callsToday: today[0]?.calls || 0,
        callsAll: total[0]?.calls || 0,
      },
      byProvider: byProvider.map(r => ({ provider: r.provider, total: fmt(r.total), calls: r.calls })),
      byFeature: byFeature.map(r => ({ feature: r.feature, total: fmt(r.total), calls: r.calls })),
      byDay: byDay.map(r => ({ day: r.day, total: fmt(r.total), calls: r.calls })),
      recent,
      unitCosts: {
        whatsappPerMsg: WHATSAPP_MSG_USD,
        smsPerMsg: SMS_MSG_USD,
        emailPer: EMAIL_USD,
        bdtPerUsd: BDT_PER_USD,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { action } = await request.json() as { action?: string };
    const db = await getDB();
    if (action === "clear") {
      await db.DB.prepare("DELETE FROM api_cost_logs").run();
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}