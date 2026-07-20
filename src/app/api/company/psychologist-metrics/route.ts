import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, queryFirst, execute } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "overview";
    const phone = searchParams.get("phone");
    const period = searchParams.get("period") || "daily";
    const days = parseInt(searchParams.get("days") || "14", 10);

    if (action === "overview") {
      const avgTrustCurrency = await queryFirst<{ avg: number; count: number }>(
        db,
        "SELECT ROUND(AVG(score), 2) as avg, COUNT(*) as count FROM psychologist_metrics WHERE metric_type = 'trust_currency' AND period = ?",
        [period]
      );
      const avgListening = await queryFirst<{ avg: number; count: number }>(
        db,
        "SELECT ROUND(AVG(score), 2) as avg, COUNT(*) as count FROM psychologist_metrics WHERE metric_type = 'listening_quality' AND period = ?",
        [period]
      );
      const avgValueDelivery = await queryFirst<{ avg: number; count: number }>(
        db,
        "SELECT ROUND(AVG(score), 2) as avg, COUNT(*) as count FROM psychologist_metrics WHERE metric_type = 'value_delivery' AND period = ?",
        [period]
      );
      const avgResistance = await queryFirst<{ avg: number; count: number }>(
        db,
        "SELECT ROUND(AVG(score), 2) as avg, COUNT(*) as count FROM psychologist_metrics WHERE metric_type = 'resistance_handling' AND period = ?",
        [period]
      );
      const feedbackCountRes = await queryFirst<{ total: number; unresolved: number }>(
        db,
        "SELECT COUNT(*) as total, SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END) as unresolved FROM psychologist_feedback"
      );
      const feedbackResRate = await queryFirst<{ rate: number }>(
        db,
        "SELECT ROUND(AVG(CASE WHEN resolved = 1 THEN 1.0 ELSE 0.0 END) * 100, 1) as rate FROM psychologist_feedback"
      );

      return NextResponse.json({
        metrics: {
          trust_currency: { score: avgTrustCurrency?.avg || 0, samples: avgTrustCurrency?.count || 0 },
          listening_quality: { score: avgListening?.avg || 0, samples: avgListening?.count || 0 },
          value_delivery: { score: avgValueDelivery?.avg || 0, samples: avgValueDelivery?.count || 0 },
          resistance_handling: { score: avgResistance?.avg || 0, samples: avgResistance?.count || 0 },
        },
        feedback: {
          total: feedbackCountRes?.total || 0,
          unresolved: feedbackCountRes?.unresolved || 0,
          resolution_rate: feedbackResRate?.rate || 0,
        },
      });
    }

    if (action === "trends") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().replace("T", " ").slice(0, 19);
      const trends = await query<{ metric_type: string; date: string; avg: number }>(
        db,
        `SELECT metric_type, DATE(recorded_at) as date, ROUND(AVG(score), 2) as avg
         FROM psychologist_metrics
         WHERE recorded_at >= ?
         GROUP BY metric_type, DATE(recorded_at)
         ORDER BY date ASC`,
        [cutoffStr]
      );
      return NextResponse.json({ trends });
    }

    if (action === "agent_breakdown") {
      const byAgent = await query<{ agent_id: string; total: number; unresolved: number; avg_listening: number; avg_language: number }>(
        db,
        `SELECT agent_id,
                COUNT(*) as total,
                SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END) as unresolved,
                ROUND(AVG(COALESCE(listening_score, 0)), 2) as avg_listening,
                ROUND(AVG(COALESCE(language_matching_score, 0)), 2) as avg_language
         FROM psychologist_feedback
         GROUP BY agent_id
         ORDER BY total DESC
         LIMIT 20`
      );
      return NextResponse.json({ agents: byAgent });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load metrics",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      phone?: string;
      metricType?: string;
      score?: number;
      period?: string;
    };
    const db = await getDB();

    if (body.action === "record_metric") {
      if (!body.phone || !body.metricType || body.score === undefined) {
        return NextResponse.json({ error: "phone, metricType, score required" }, { status: 400 });
      }
      if (!["trust_currency", "listening_quality", "value_delivery", "resistance_handling"].includes(body.metricType)) {
        return NextResponse.json({ error: "Invalid metricType" }, { status: 400 });
      }
      await execute(
        db,
        `INSERT INTO psychologist_metrics (phone, metric_type, score, period, recorded_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [body.phone, body.metricType, String(body.score), body.period || "daily"]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Action failed",
    }, { status: 500 });
  }
}
