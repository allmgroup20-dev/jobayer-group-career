import { NextRequest, NextResponse } from "next/server";
import { computeWorkerInterests, computeWorkerBehaviorScore, scoreAllWorkers } from "@/lib/tracking/scoring";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { workerId?: string } | undefined;
    const workerId = body?.workerId;

    if (workerId) {
      await computeWorkerInterests(workerId);
      await computeWorkerBehaviorScore(workerId);
      return NextResponse.json({ ok: true, workerId });
    }

    const result = await scoreAllWorkers();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Score trigger error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const db = await (await import("@/lib/db")).ensureDB();

    const interests = await db.prepare(
      "SELECT id, worker_id, category_scores, top_categories, last_calculated_at, created_at, updated_at FROM user_interests WHERE worker_id = ?"
    ).bind(workerId).first();

    const behavior = await db.prepare(
      "SELECT id, worker_id, lead_score, churn_probability, purchase_intent, rfm_recency, rfm_frequency, rfm_monetary, segment, lifetime_value, last_updated FROM user_behavior_scores WHERE worker_id = ?"
    ).bind(workerId).first();

    return NextResponse.json({ interests: interests || null, behavior: behavior || null });
  } catch (err) {
    console.error("Score fetch error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
