import { NextRequest, NextResponse } from "next/server";
import { getTeamMetrics, getTeamHierarchy, getLeaderboard, getDailyTrends, snapshotTeamPerf, buildTeamPerfContext } from "@/lib/ai/team-perf";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "metrics";
    const phone = searchParams.get("phone") || "";
    const days = parseInt(searchParams.get("days") || "30");
    const lang = searchParams.get("lang") || "en";

    switch (action) {
      case "metrics": {
        if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
        const metrics = await getTeamMetrics(phone);
        return NextResponse.json({ metrics, context: buildTeamPerfContext(metrics, lang) });
      }
      case "hierarchy": {
        if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
        const depth = parseInt(searchParams.get("depth") || "3");
        const hierarchy = await getTeamHierarchy(phone, depth);
        return NextResponse.json({ hierarchy });
      }
      case "leaderboard": {
        const limit = parseInt(searchParams.get("limit") || "20");
        const board = await getLeaderboard(limit);
        return NextResponse.json({ leaderboard: board, total: board.length });
      }
      case "trends": {
        if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
        return NextResponse.json({ trends: await getDailyTrends(phone, days) });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const { action } = body;

    switch (action) {
      case "snapshot": {
        const phone = body.phone;
        if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
        await snapshotTeamPerf(phone);
        return NextResponse.json({ success: true });
      }
      case "snapshot-all": {
        const { query } = await import("@/lib/db/queries");
        const { ensureDB } = await import("@/lib/db");
        const db = await ensureDB();
        const workers = await query<any>(
          { DB: db },
          "SELECT phone FROM workers WHERE phone IS NOT NULL"
        );
        for (const w of workers) {
          try { await snapshotTeamPerf(w.phone); } catch {}
        }
        return NextResponse.json({ success: true, total: workers.length });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}
