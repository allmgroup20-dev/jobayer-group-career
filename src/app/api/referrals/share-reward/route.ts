import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";
import { verifyToken, getJwtSecret } from "@/lib/auth";

// Share-to-unlock: granting +1 unlock quota per share, rate-limited to once per 24h
export async function POST(request: NextRequest) {
  try {
    const { workerId } = await request.json() as { workerId?: string };
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    // H6: only the authenticated worker may grant themselves the reward —
    // prevent anyone from inflating arbitrary accounts' unlock quotas
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = token ? await verifyToken(token, getJwtSecret()) : null;
    if (!payload || payload.type !== "worker" || payload.sub !== workerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const env = await getDB();
    const worker = await queryFirst<{ worker_id: string }>(
      env, "SELECT worker_id FROM workers WHERE worker_id = ?", [workerId]
    );
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const limitKey = `share_reward:${workerId}`;
    const recent = await getCached<{ granted: boolean }>(limitKey, 86400);
    if (recent) {
      return NextResponse.json({ error: "আজকের শেয়ার বোনাস নেওয়া হয়েছে — আগামীকাল আবার নিতে পারবেন" }, { status: 429 });
    }

    await execute(env,
      `INSERT INTO unlock_limits (worker_id, max_unlocks, set_by, set_at, updated_at)
       VALUES (?, 1, 'share_reward', datetime('now'), datetime('now'))
       ON CONFLICT(worker_id) DO UPDATE SET max_unlocks = max_unlocks + 1, updated_at = datetime('now')`,
      [workerId]
    );

    await setCached(limitKey, { granted: true });

    return NextResponse.json({ ok: true, granted: 1 });
  } catch (error) {
    console.error("Share reward error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}