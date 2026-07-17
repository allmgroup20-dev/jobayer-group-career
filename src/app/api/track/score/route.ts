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
      "SELECT * FROM user_interests WHERE worker_id = ?"
    ).bind(workerId).first();

    const behavior = await db.prepare(
      "SELECT * FROM user_behavior_scores WHERE worker_id = ?"
    ).bind(workerId).first();

    return NextResponse.json({ interests: interests || null, behavior: behavior || null });
  } catch (err) {
    console.error("Score fetch error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
