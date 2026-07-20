import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, queryFirst, execute } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "log";
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (action === "log") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const logs = await query<{ habit_type: string; count: number; date: string }>(
        db,
        `SELECT habit_type, DATE(created_at) as date, COUNT(*) as count
         FROM daily_habits_log
         WHERE created_at >= ?
         GROUP BY habit_type, DATE(created_at)
         ORDER BY date DESC, habit_type`,
        [cutoff.toISOString().replace("T", " ").slice(0, 19)]
      );
      return NextResponse.json({ logs });
    }

    if (action === "stats") {
      const today = new Date().toISOString().split("T")[0];
      const morningSent = await queryFirst<{ c: number }>(
        db,
        "SELECT COUNT(*) as c FROM daily_habits_log WHERE habit_type = 'morning_value' AND DATE(created_at) = ?",
        [today]
      );
      const eveningSnap = await queryFirst<{ c: number }>(
        db,
        "SELECT COUNT(*) as c FROM daily_habits_log WHERE habit_type = 'trust_currency_snapshot' AND DATE(created_at) = ?",
        [today]
      );
      const avgTrust = await queryFirst<{ avg: number }>(
        db,
        "SELECT ROUND(AVG(trust_currency), 2) as avg FROM daily_habits_log WHERE habit_type = 'trust_currency_snapshot' AND DATE(created_at) = ?",
        [today]
      );
      return NextResponse.json({
        today: { morningSent: morningSent?.c || 0, eveningSnap: eveningSnap?.c || 0, avgTrust: avgTrust?.avg || 0 },
        totalWorkers: await queryFirst<{ c: number }>(db, "SELECT COUNT(*) as c FROM workers WHERE membership_status IN ('general', 'premium')").then(r => r?.c || 0),
      });
    }

    if (action === "morning_candidates") {
      const candidates = await query<{ worker_id: string; name: string; phone: string; sector: string | null; last_activity: string | null }>(
        db,
        `SELECT w.worker_id, w.name, w.phone, COALESCE(p.sector, w.occupation) as sector, (SELECT MAX(created_at) FROM user_events WHERE worker_id = w.worker_id) as last_activity
         FROM workers w
         LEFT JOIN ai_phone_profiles p ON w.phone = p.phone
         WHERE w.membership_status IN ('general', 'premium')
         ORDER BY last_activity DESC NULLS LAST
         LIMIT 50`
      );
      const todayVal = new Date().toISOString().split("T")[0];
      const alreadySent = await query<{ worker_id: string }>(
        db,
        "SELECT DISTINCT worker_id FROM daily_habits_log WHERE habit_type = 'morning_value' AND DATE(created_at) = ?",
        [todayVal]
      );
      const sentSet = new Set(alreadySent.map(s => s.worker_id));
      const pending = candidates.filter(c => !sentSet.has(c.worker_id));
      return NextResponse.json({ candidates: pending, totalCandidates: candidates.length, alreadyToday: sentSet.size });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      workerId?: string;
      phone?: string;
      habitType?: string;
      messagePreview?: string;
      trustCurrency?: number;
    };
    const db = await getDB();

    if (body.action === "log_morning") {
      if (!body.phone || !body.habitType) {
        return NextResponse.json({ error: "phone and habitType required" }, { status: 400 });
      }
      await execute(
        db,
        `INSERT INTO daily_habits_log (habit_type, phone, worker_id, message_preview, status, created_at)
         VALUES (?, ?, ?, ?, 'sent', datetime('now'))`,
        [body.habitType || "morning_value", body.phone, body.workerId || "", body.messagePreview || ""]
      );
      return NextResponse.json({ success: true });
    }

    if (body.action === "snapshot_trust") {
      const avgTrust = await queryFirst<{ avg: number }>(
        db,
        "SELECT ROUND(AVG(trust_score), 2) as avg FROM ai_phone_profiles WHERE trust_score IS NOT NULL"
      );
      const totalProfiles = await queryFirst<{ c: number }>(
        db,
        "SELECT COUNT(*) as c FROM ai_phone_profiles"
      );
      const trusting = await queryFirst<{ c: number }>(
        db,
        "SELECT COUNT(*) as c FROM ai_phone_profiles WHERE trust_score >= 7"
      );
      await execute(
        db,
        `INSERT INTO daily_habits_log (habit_type, phone, trust_currency, message_preview, status, created_at)
         VALUES (?, '', ?, ?, 'completed', datetime('now'))`,
        ["trust_currency_snapshot", String(avgTrust?.avg || 0), `Trust snapshot: avg=${avgTrust?.avg || 0}, total=${totalProfiles?.c || 0}, trusting=${trusting?.c || 0}`]
      );
      return NextResponse.json({ success: true, avgTrust: avgTrust?.avg || 0, totalProfiles: totalProfiles?.c || 0, trusting: trusting?.c || 0 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 500 });
  }
}
