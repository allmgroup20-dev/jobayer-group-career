import { ensureDB } from "@/lib/db";

interface WorkerData {
  worker_id: string;
  name: string;
  phone: string;
  membership_status: string | null;
}

interface EventRow {
  event_type: string;
  created_at: string;
  page_category: string | null;
}

interface SearchRow {
  created_at: string;
}

interface SessionRow {
  session_start: string;
  duration: number | null;
}

interface OrderRow {
  created_at: string;
  total_amount: number;
}

interface CommRow {
  created_at: string;
  direction: string;
  channel: string;
}

interface ScoreRow {
  churn_probability: number;
  segment: string;
  lifetime_value: number;
  lead_score: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const db = await ensureDB();
    const results = workerId
      ? [await predictWorker(db, workerId)]
      : await predictAllWorkers(db);
    return Response.json({ success: true, predictions: results });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

async function predictWorker(db: D1Database, workerId: string) {
  const worker = await db.prepare("SELECT worker_id, name, phone, membership_status FROM workers WHERE worker_id = ?").bind(workerId).first() as WorkerData | null;
  if (!worker) return { workerId, error: "Worker not found" };
  return computeChurnPrediction(db, worker);
}

async function predictAllWorkers(db: D1Database) {
  const workers = await db.prepare("SELECT worker_id, name, phone, membership_status FROM workers WHERE membership_status = 'active' LIMIT 500").bind().all() as { results: WorkerData[] };
  const predictions: any[] = [];
  for (const w of workers.results) {
    try {
      predictions.push(await computeChurnPrediction(db, w));
    } catch {}
  }
  return predictions;
}

async function computeChurnPrediction(db: D1Database, worker: WorkerData) {
  const { worker_id } = worker;

  const eventsRes = await db.prepare(
    "SELECT event_type, created_at, page_category FROM user_events WHERE worker_id = ? AND created_at IS NOT NULL ORDER BY created_at DESC"
  ).bind(worker_id).all() as { results: EventRow[] };
  const events = eventsRes.results;

  const searchesRes = await db.prepare(
    "SELECT created_at FROM user_searches WHERE worker_id = ? AND created_at IS NOT NULL ORDER BY created_at DESC"
  ).bind(worker_id).all() as { results: SearchRow[] };
  const searches = searchesRes.results;

  const sessionsRes = await db.prepare(
    "SELECT session_start, duration FROM user_sessions WHERE worker_id = ? ORDER BY session_start DESC"
  ).bind(worker_id).all() as { results: SessionRow[] };
  const sessions = sessionsRes.results;

  const ordersRes = await db.prepare(
    "SELECT created_at, total_amount FROM orders WHERE worker_id = ? AND payment_status = 'completed' ORDER BY created_at DESC"
  ).bind(worker_id).all() as { results: OrderRow[] };
  const orders = ordersRes.results;

  const commsRes = await db.prepare(
    "SELECT created_at, direction, channel FROM communication_history WHERE worker_id = ? ORDER BY created_at DESC"
  ).bind(worker_id).all() as { results: CommRow[] };
  const comms = commsRes.results;

  const score = await db.prepare(
    "SELECT churn_probability, segment, lifetime_value, lead_score FROM user_behavior_scores WHERE worker_id = ?"
  ).bind(worker_id).first() as ScoreRow | null;

  const now = Date.now();
  const factors: { factor: string; score: number; detail: string }[] = [];
  let totalScore = 0;

  // Factor 1: Recency (0-30 pts)
  if (events.length > 0) {
    const lastEvent = new Date(events[0].created_at).getTime();
    const daysSince = (now - lastEvent) / 86400000;
    const recencyScore = daysSince > 90 ? 30 : daysSince > 60 ? 22 : daysSince > 30 ? 14 : daysSince > 14 ? 7 : 0;
    factors.push({ factor: "recency", score: recencyScore, detail: `${Math.round(daysSince)} days since last activity` });
    totalScore += recencyScore;
  } else {
    factors.push({ factor: "recency", score: 30, detail: "No events recorded" });
    totalScore += 30;
  }

  // Factor 2: Engagement decline (0-20 pts)
  if (events.length >= 10) {
    const recent = events.filter(e => (now - new Date(e.created_at).getTime()) / 86400000 <= 30).length;
    const older = events.filter(e => (now - new Date(e.created_at).getTime()) / 86400000 > 30 && (now - new Date(e.created_at).getTime()) / 86400000 <= 90).length;
    const declineRatio = older > 5 ? recent / older : 1;
    const declineScore = declineRatio < 0.3 ? 20 : declineRatio < 0.5 ? 14 : declineRatio < 0.8 ? 7 : 0;
    if (declineScore > 0) factors.push({ factor: "engagement_decline", score: declineScore, detail: `Recent/older activity ratio: ${declineRatio.toFixed(2)}` });
    totalScore += declineScore;
  }

  // Factor 3: Session quality (0-15 pts)
  if (sessions.length > 0) {
    const avgDuration = sessions.filter(s => s.duration).reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.duration).length || 0;
    const sessionScore = avgDuration < 30 ? 15 : avgDuration < 60 ? 10 : avgDuration < 180 ? 5 : 0;
    factors.push({ factor: "session_quality", score: sessionScore, detail: `Avg session duration: ${Math.round(avgDuration)}s` });
    totalScore += sessionScore;
  }

  // Factor 4: Search inactivity (0-10 pts)
  if (searches.length > 0) {
    const lastSearch = new Date(searches[0].created_at).getTime();
    const daysSinceSearch = (now - lastSearch) / 86400000;
    const searchScore = daysSinceSearch > 90 ? 10 : daysSinceSearch > 60 ? 7 : daysSinceSearch > 30 ? 4 : 0;
    if (searchScore > 0) factors.push({ factor: "search_inactivity", score: searchScore, detail: `${Math.round(daysSinceSearch)} days since last search` });
    totalScore += searchScore;
  } else {
    factors.push({ factor: "search_inactivity", score: 10, detail: "No searches recorded" });
    totalScore += 10;
  }

  // Factor 5: Purchase recency (0-15 pts)
  if (orders.length > 0) {
    const lastOrder = new Date(orders[0].created_at).getTime();
    const daysSinceOrder = (now - lastOrder) / 86400000;
    const purchaseScore = daysSinceOrder > 180 ? 15 : daysSinceOrder > 90 ? 10 : daysSinceOrder > 60 ? 5 : 0;
    if (purchaseScore > 0) factors.push({ factor: "purchase_recency", score: purchaseScore, detail: `${Math.round(daysSinceOrder)} days since last purchase` });
    totalScore += purchaseScore;
  } else {
    factors.push({ factor: "purchase_recency", score: 15, detail: "No purchases made" });
    totalScore += 15;
  }

  // Factor 6: Communication negativity (0-10 pts)
  if (comms.length > 0) {
    const outgoingFailed = comms.filter(c => c.direction === "outgoing" && c.channel === "failed").length;
    const totalComms = comms.length;
    const failRatio = totalComms > 0 ? outgoingFailed / totalComms : 0;
    const commScore = failRatio > 0.5 ? 10 : failRatio > 0.3 ? 6 : 0;
    if (commScore > 0) factors.push({ factor: "communication_issues", score: commScore, detail: `${outgoingFailed}/${totalComms} failed communications` });
    totalScore += commScore;
  }

  const churnScore = Math.min(100, totalScore);
  const riskLevel = churnScore >= 80 ? "critical" : churnScore >= 60 ? "high" : churnScore >= 35 ? "medium" : "low";

  return {
    workerId: worker_id,
    name: worker.name || worker_id,
    phone: worker.phone,
    churnScore,
    riskLevel,
    segment: score?.segment || "unknown",
    previousChurnProbability: score?.churn_probability ?? null,
    lifetimeValue: score?.lifetime_value ?? 0,
    leadScore: score?.lead_score ?? 0,
    factors: factors.sort((a, b) => b.score - a.score),
    totalEvents: events.length,
    totalSessions: sessions.length,
    totalOrders: orders.length,
    totalSearches: searches.length,
    predictedAt: new Date().toISOString(),
  };
}
