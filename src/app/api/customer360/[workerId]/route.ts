import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ workerId: string }> }) {
  try {
    const { workerId } = await params;
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();

    const [worker, interests, behavior, sessions, events, searches, orders, devices, reviews, comms, attributions] = await Promise.all([
      db.prepare("SELECT id, worker_id, name, phone, email, avatar_url, sponsor_id, sponsor_name, level, join_date, currency, balance, total_earned, total_spent, total_team_members, membership_status, is_test_account, preferred_language, age_group, occupation, education_level, gender, country, city, goal, preferred_learning_time, referral_source, communication_preference, budget_range, religion, interests_updated_at, created_at, updated_at FROM workers WHERE worker_id = ?").bind(workerId).first() as Promise<any>,
      db.prepare("SELECT category_scores, top_categories, last_calculated_at FROM user_interests WHERE worker_id = ?").bind(workerId).first() as Promise<any>,
      db.prepare("SELECT id, worker_id, lead_score, churn_probability, purchase_intent, rfm_recency, rfm_frequency, rfm_monetary, segment, lifetime_value, last_updated FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).first() as Promise<any>,
      db.prepare("SELECT id, worker_id, session_start, session_end, duration_seconds, ip_address, user_agent, device_type, browser, os, screen_resolution, referrer, city, country, timezone, language, utm_source, utm_campaign, created_at FROM user_sessions WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT event_type, page_category, page_url, product_category, created_at FROM user_events WHERE worker_id = ? ORDER BY created_at DESC LIMIT 50").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT search_query, search_type, result_count, created_at FROM user_searches WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, commission_status, order_status, shipping_address, transaction_id, created_at FROM orders WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, device_type, browser, os, user_agent, screen_resolution, ip_address, city, country, timezone, language, is_active, last_seen_at, first_seen_at, created_at FROM user_devices WHERE worker_id = ? ORDER BY last_seen_at DESC LIMIT 200").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, product_id, product_type, rating, review_text, is_approved, created_at FROM product_reviews WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, channel, direction, message, status, reference_id, metadata, sent_at, created_at FROM communication_history WHERE worker_id = ? ORDER BY created_at DESC LIMIT 50").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, channel, utm_source, utm_medium, utm_campaign, referrer, landing_page, first_visit_at, converted, converted_at, created_at FROM attribution_log WHERE worker_id = ? ORDER BY created_at DESC LIMIT 200").bind(workerId).all() as Promise<any>,
    ]);

    return NextResponse.json({
      worker: worker || null,
      interests: interests ? { categoryScores: JSON.parse(interests.category_scores || "{}"), topCategories: JSON.parse(interests.top_categories || "[]"), lastCalculatedAt: interests.last_calculated_at } : null,
      behavior: behavior || null,
      sessions: (sessions.results || []).slice(0, 20),
      recentEvents: (events.results || []).slice(0, 50),
      searches: (searches.results || []).slice(0, 20),
      orders: (orders.results || []).slice(0, 20),
      devices: (devices.results || []),
      reviews: (reviews.results || []).slice(0, 20),
      communications: (comms.results || []).slice(0, 50),
      attributions: (attributions.results || []),
    });
  } catch (err) {
    console.error("Customer360 error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
