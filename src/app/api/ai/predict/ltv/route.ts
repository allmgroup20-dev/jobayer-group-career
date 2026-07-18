import { ensureDB } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const db = await ensureDB();
    const results = workerId
      ? [await computeLTV(db, workerId)]
      : await computeAllLTVs(db);
    return Response.json({ success: true, predictions: results });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

async function computeLTV(db: D1Database, workerId: string) {
  const worker = await db.prepare("SELECT worker_id, name, total_spent, join_date FROM workers WHERE worker_id = ?").bind(workerId).first() as any;
  if (!worker) return { workerId, error: "Worker not found" };

  const ordersRes = await db.prepare(
    "SELECT total_amount, created_at FROM orders WHERE worker_id = ? AND payment_status = 'completed' ORDER BY created_at ASC"
  ).bind(workerId).all() as { results: { total_amount: number; created_at: string }[] };
  const orders = ordersRes.results;

  const eventsRes = await db.prepare(
    "SELECT COUNT(*) as c FROM user_events WHERE worker_id = ? AND created_at IS NOT NULL"
  ).bind(workerId).first() as { c: number } | undefined;

  const sessionsRes = await db.prepare(
    "SELECT COUNT(*) as c FROM user_sessions WHERE worker_id = ?"
  ).bind(workerId).first() as { c: number } | undefined;

  const score = await db.prepare(
    "SELECT segment, lifetime_value FROM user_behavior_scores WHERE worker_id = ?"
  ).bind(workerId).first() as { segment: string; lifetime_value: number } | null;

  const now = Date.now();
  const totalSpent = worker.total_spent || 0;
  const joinDate = worker.join_date ? new Date(worker.join_date).getTime() : now;
  const daysSinceJoin = Math.max(1, (now - joinDate) / 86400000);
  const spendPerDay = totalSpent / daysSinceJoin;

  // Segment multipliers based on platform data
  const segmentMultipliers: Record<string, { d30: number; d60: number; d90: number }> = {
    vip: { d30: 3.0, d60: 2.5, d90: 2.0 },
    active: { d30: 1.5, d60: 1.3, d90: 1.1 },
    at_risk: { d30: 0.6, d60: 0.5, d90: 0.4 },
    churned: { d30: 0.1, d60: 0.1, d90: 0.1 },
    new: { d30: 0.8, d60: 0.9, d90: 1.0 },
  };
  const segment = score?.segment || "new";
  const mult = segmentMultipliers[segment] || segmentMultipliers.new;

  // If the user has orders, use spend-based projection
  if (orders.length > 0) {
    const recentOrders = orders.slice(-3);
    const avgOrderValue = recentOrders.reduce((s, o) => s + o.total_amount, 0) / recentOrders.length;
    const orderFrequency = orders.length / Math.max(30, daysSinceJoin); // orders per day
    const monthlyOrders = orderFrequency * 30;

    const ltv30 = Math.round(avgOrderValue * monthlyOrders * mult.d30);
    const ltv60 = Math.round(avgOrderValue * monthlyOrders * 2 * mult.d60);
    const ltv90 = Math.round(avgOrderValue * monthlyOrders * 3 * mult.d90);

    return {
      workerId,
      name: worker.name || workerId,
      segment,
      historicalSpend: totalSpent,
      predictedLTV: { d30: ltv30, d60: ltv60, d90: ltv90 },
      avgOrderValue: Math.round(avgOrderValue),
      orderFrequency: `${orderFrequency.toFixed(3)}/day`,
      totalOrders: orders.length,
      totalEvents: eventsRes?.c || 0,
      totalSessions: sessionsRes?.c || 0,
      confidenceScore: segment === "vip" || segment === "active" ? "high" : "medium",
      predictedAt: new Date().toISOString(),
    };
  }

  // For users with no orders, use engagement-based projection
  const eventValue = (eventsRes?.c || 0) * 0.5;
  const sessionValue = (sessionsRes?.c || 0) * 1.0;
  const projectedBase = (eventValue + sessionValue) * spendPerDay * 30;

  return {
    workerId,
    name: worker.name || workerId,
    segment,
    historicalSpend: 0,
    predictedLTV: {
      d30: Math.round(projectedBase * mult.d30),
      d60: Math.round(projectedBase * 2 * mult.d60),
      d90: Math.round(projectedBase * 3 * mult.d90),
    },
    avgOrderValue: 0,
    orderFrequency: "0/day (no orders yet)",
    totalOrders: 0,
    totalEvents: eventsRes?.c || 0,
    totalSessions: sessionsRes?.c || 0,
    confidenceScore: "low",
    predictedAt: new Date().toISOString(),
  };
}

async function computeAllLTVs(db: D1Database) {
  const workers = await db.prepare("SELECT worker_id FROM workers WHERE membership_status = 'active' LIMIT 500").bind().all() as { results: { worker_id: string }[] };
  const results: any[] = [];
  for (const w of workers.results) {
    try { results.push(await computeLTV(db, w.worker_id)); } catch {}
  }
  return results;
}
