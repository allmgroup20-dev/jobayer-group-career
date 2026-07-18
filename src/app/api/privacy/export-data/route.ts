import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();

    const [worker, events, sessions, searches, interests, behavior, orders, reviews, devices, comms, consents] = await Promise.all([
      db.prepare("SELECT id, worker_id, name, phone, email, avatar_url, sponsor_id, sponsor_name, level, join_date, currency, balance, total_earned, total_spent, total_team_members, membership_status, is_test_account, preferred_language, age_group, occupation, education_level, gender, country, city, goal, preferred_learning_time, referral_source, communication_preference, budget_range, religion, interests_updated_at, created_at, updated_at FROM workers WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT id, worker_id, event_type, page_url, page_category, search_keyword, product_id, product_category, time_spent_seconds, device_info, session_id, metadata, created_at FROM user_events WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, session_start, session_end, duration_seconds, ip_address, user_agent, device_type, browser, os, screen_resolution, referrer, city, country, timezone, language, utm_source, utm_campaign, created_at FROM user_sessions WHERE worker_id = ? ORDER BY created_at DESC LIMIT 100").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, search_query, search_type, result_count, clicked_item, created_at FROM user_searches WHERE worker_id = ? ORDER BY created_at DESC LIMIT 100").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, category_scores, top_categories, last_calculated_at, created_at, updated_at FROM user_interests WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT id, worker_id, lead_score, churn_probability, purchase_intent, rfm_recency, rfm_frequency, rfm_monetary, segment, lifetime_value, last_updated FROM user_behavior_scores WHERE worker_id = ?").bind(workerId).first(),
      db.prepare("SELECT id, order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, commission_status, order_status, shipping_address, transaction_id, created_at FROM orders WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, product_id, product_type, rating, review_text, is_approved, created_at FROM product_reviews WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, device_type, browser, os, user_agent, screen_resolution, ip_address, city, country, timezone, language, is_active, last_seen_at, first_seen_at, created_at FROM user_devices WHERE worker_id = ? ORDER BY last_seen_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, channel, direction, message, status, reference_id, metadata, sent_at, created_at FROM communication_history WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1000").bind(workerId).all() as Promise<any>,
      db.prepare("SELECT id, worker_id, consent_type, is_granted, ip_address, user_agent, granted_at, revoked_at, created_at FROM privacy_consent WHERE worker_id = ?").bind(workerId).all() as Promise<any>,
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      worker,
      events: events?.results || [],
      sessions: sessions?.results || [],
      searches: searches?.results || [],
      interests,
      behavior,
      orders: orders?.results || [],
      reviews: reviews?.results || [],
      devices: devices?.results || [],
      communications: comms?.results || [],
      consents: consents?.results || [],
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error("Data export error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
