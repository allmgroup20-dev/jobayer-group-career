import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { ensureDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();

    const pendingTriggers = await query<any>(
      db,
      `SELECT w.worker_id, w.name, w.phone, ube.churn_probability, ube.segment,
              (SELECT MAX(created_at) FROM user_events WHERE worker_id = w.worker_id) as last_activity,
              (SELECT COUNT(*) FROM user_events WHERE worker_id = w.worker_id AND event_type = 'product_view') as product_views,
              (SELECT COUNT(*) FROM orders WHERE worker_id = w.worker_id AND payment_status = 'completed') as total_orders,
              (SELECT MAX(created_at) FROM orders WHERE worker_id = w.worker_id) as last_purchase
       FROM workers w
       LEFT JOIN user_behavior_scores ube ON ube.worker_id = w.worker_id
       WHERE w.membership_status = 'active'
       ORDER BY last_activity DESC
       LIMIT 100`
    );

    const now = Date.now();
    const triggers: any[] = [];
    const workers = pendingTriggers as any[] || [];

    for (const w of workers) {
      const lastAct = w.last_activity ? new Date(w.last_activity).getTime() : 0;
      const daysSinceActivity = (now - lastAct) / 86400000;
      const lastPurchase = w.last_purchase ? new Date(w.last_purchase).getTime() : 0;
      const daysSincePurchase = (now - lastPurchase) / 86400000;

      if ((w.product_views || 0) >= 3 && (w.total_orders || 0) === 0) {
        triggers.push({
          workerId: w.worker_id, name: w.name, phone: w.phone, trigger: "browse_abandon",
          detail: `${w.product_views} product views, no purchase`, segment: w.segment,
        });
      }

      if (daysSinceActivity > 14 && daysSinceActivity <= 30) {
        triggers.push({
          workerId: w.worker_id, name: w.name, phone: w.phone, trigger: "inactive_14d",
          detail: `${Math.round(daysSinceActivity)} days since last activity`, segment: w.segment,
        });
      }

      if (daysSinceActivity > 30) {
        triggers.push({
          workerId: w.worker_id, name: w.name, phone: w.phone, trigger: "inactive_30d",
          detail: `${Math.round(daysSinceActivity)} days inactive`, segment: w.segment,
        });
      }

      if ((w.churn_probability || 0) >= 50) {
        triggers.push({
          workerId: w.worker_id, name: w.name, phone: w.phone, trigger: "churn_risk",
          detail: `Churn probability: ${w.churn_probability}%`, segment: w.segment,
        });
      }
    }

    return NextResponse.json({
      total: triggers.length,
      triggers: triggers.slice(0, 50),
      byType: {
        browse_abandon: triggers.filter(t => t.trigger === "browse_abandon").length,
        inactive_14d: triggers.filter(t => t.trigger === "inactive_14d").length,
        inactive_30d: triggers.filter(t => t.trigger === "inactive_30d").length,
        churn_risk: triggers.filter(t => t.trigger === "churn_risk").length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const NOTIFICATION_TITLES: Record<string, string> = {
  browse_abandon: "Items waiting for you!",
  inactive_14d: "We miss you!",
  inactive_30d: "Come back!",
  churn_risk: "Special offer just for you",
};

const NOTIFICATION_BODIES: Record<string, string> = {
  browse_abandon: "You have items in your cart. Complete your order today!",
  inactive_14d: "It's been a while since you visited. Check out what's new!",
  inactive_30d: "We haven't seen you in a while. Here's a special welcome back!",
  churn_risk: "Enjoy exclusive discounts available only for our valued members.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { triggerType?: string; action?: string; message?: string };
    const { triggerType, action, message } = body;
    if (!triggerType || !action) {
      return NextResponse.json({ error: "triggerType and action required" }, { status: 400 });
    }

    const db = await getDB();

    const pendingTriggers = await query<any>(
      db,
      `SELECT w.worker_id, w.name, w.phone, ube.churn_probability,
              (SELECT MAX(created_at) FROM user_events WHERE worker_id = w.worker_id) as last_activity,
              (SELECT COUNT(*) FROM user_events WHERE worker_id = w.worker_id AND event_type = 'product_view') as product_views,
              (SELECT COUNT(*) FROM orders WHERE worker_id = w.worker_id AND payment_status = 'completed') as total_orders,
              (SELECT MAX(created_at) FROM orders WHERE worker_id = w.worker_id) as last_purchase
       FROM workers w
       LEFT JOIN user_behavior_scores ube ON ube.worker_id = w.worker_id
       WHERE w.membership_status = 'active'
       ORDER BY last_activity DESC`
    );

    const now = Date.now();
    let affected = 0;

    for (const w of (pendingTriggers as any[] || [])) {
      const lastAct = w.last_activity ? new Date(w.last_activity).getTime() : 0;
      const daysSinceActivity = (now - lastAct) / 86400000;
      const lastPurchase = w.last_purchase ? new Date(w.last_purchase).getTime() : 0;
      const daysSincePurchase = (now - lastPurchase) / 86400000;
      let matches = false;

      if (triggerType === "browse_abandon" && (w.product_views || 0) >= 3 && (w.total_orders || 0) === 0) matches = true;
      if (triggerType === "inactive_14d" && daysSinceActivity > 14 && daysSinceActivity <= 30) matches = true;
      if (triggerType === "inactive_30d" && daysSinceActivity > 30) matches = true;
      if (triggerType === "churn_risk" && (w.churn_probability || 0) >= 50) matches = true;

      if (!matches) continue;

      const db2 = await ensureDB();
      const title = NOTIFICATION_TITLES[triggerType] || "Update";
      const bodyMsg = message || NOTIFICATION_BODIES[triggerType] || "Check out our latest updates.";

      if (action === "notify") {
        await db2.prepare(
          "INSERT INTO notifications (worker_id, title, message, type) VALUES (?, ?, ?, 'marketing')"
        ).bind(w.worker_id, title, bodyMsg).run();
        affected++;
      } else if (action === "whatsapp") {
        await db2.prepare(
          "INSERT INTO wa_logs (phone, message, direction, status) VALUES (?, ?, 'outbound', 'pending')"
        ).bind(w.phone, `${title}\n\n${bodyMsg}`).run();
        await db2.prepare(
          "INSERT INTO communication_history (worker_id, channel, direction, message, status) VALUES (?, 'whatsapp', 'outbound', ?, 'pending')"
        ).bind(w.worker_id, `${title}\n\n${bodyMsg}`).run();
        affected++;
      }
    }

    return NextResponse.json({ success: true, affected, action, triggerType });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
