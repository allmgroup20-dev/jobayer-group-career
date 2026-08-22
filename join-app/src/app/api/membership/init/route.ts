import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, queryFirst, execute } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { SslcommerzService } from "@/lib/sslcommerz";

const MEMBERSHIP_MIN = 99;
const MEMBERSHIP_MAX = 10000;
const MEMBERSHIP_CURRENCY = "BDT";

async function ensureMembershipTable(env: { DB: D1Database }) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS membership_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'elite',
      amount REAL NOT NULL DEFAULT 99,
      currency TEXT NOT NULL DEFAULT 'BDT',
      tran_id TEXT NOT NULL UNIQUE,
      val_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      gateway_response TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      verified_at TEXT
    )`
  ).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_membership_payments_worker ON membership_payments(worker_id)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_membership_payments_tran ON membership_payments(tran_id)").run();
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensureMembershipTable(env);

    const worker = await queryFirst<{ membership_status: string; name: string; phone: string; email: string; division: string; district: string }>(
      env,
      "SELECT membership_status, name, phone, email, division, district FROM workers WHERE worker_id = ?",
      [workerId]
    );
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    if (worker.membership_status === "premium") {
      return NextResponse.json({ error: "Already premium member", isPremium: true }, { status: 400 });
    }

    const rawBody = await request.json().catch(() => ({} as Record<string, unknown>));
    const body = rawBody as Record<string, unknown>;
    const tier = (body.tier as string) || "elite";
    let amount = Number(body.amount ?? MEMBERSHIP_MIN);
    if (!Number.isFinite(amount)) amount = MEMBERSHIP_MIN;
    amount = Math.round(amount);
    if (amount < MEMBERSHIP_MIN) amount = MEMBERSHIP_MIN;
    if (amount > MEMBERSHIP_MAX) amount = MEMBERSHIP_MAX;
    const budgetNote = typeof body.budgetNote === "string" ? String(body.budgetNote).slice(0, 500) : null;
    const interestNote = typeof body.interestNote === "string" ? String(body.interestNote).slice(0, 1000) : null;

    const service = await SslcommerzService.fromDB(env);
    // If credentials not configured, allow dev mock for local testing
    const hasCredentials = (service as unknown as { storeId: string })["storeId"] || process.env.SSLCOMMERZ_STORE_ID;
    // We check via private field access fallback: try to init, if fails due to missing store, return mock
    const tranId = service.generateTransactionId();
    const origin = request.nextUrl.origin;

    await execute(
      env,
      "INSERT INTO membership_payments (worker_id, tier, amount, currency, tran_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [workerId, tier, amount, MEMBERSHIP_CURRENCY, tranId]
    );
    // Save budget/interest privately for admin
    if (budgetNote || interestNote) {
      try {
        await execute(env, "UPDATE workers SET budget_range = ? WHERE worker_id = ?", [budgetNote ? `${amount} BDT - ${budgetNote}` : `${amount} BDT`, workerId]);
      } catch {}
    }

    // If no credentials in dev, simulate premium for testing (local-d1)
    const isDev = process.env.NODE_ENV === "development";
    let storeIdCheck = "";
    try {
      const testRow = await queryFirst<{ setting_value: string }>(env, "SELECT setting_value FROM company_settings WHERE setting_key = ?", ["sslcommerz_test_store_id"]);
      storeIdCheck = testRow?.setting_value || "";
    } catch {}
    const hasStore = !!storeIdCheck || !!process.env.SSLCOMMERZ_STORE_ID;

    if (!hasStore && isDev) {
      // Dev mock: directly mark premium and return mock URL
      await execute(env, "UPDATE workers SET membership_status = 'premium' WHERE worker_id = ?", [workerId]);
      await execute(env, "UPDATE membership_payments SET status = 'VALID', verified_at = datetime('now') WHERE tran_id = ?", [tranId]);
      return NextResponse.json({ GatewayPageURL: `${origin}/complete?membership=success`, mock: true, tran_id: tranId });
    }

    if (!hasStore) {
      return NextResponse.json({ error: "Payment gateway not configured. Please contact admin." }, { status: 500 });
    }

    const cusName = worker.name || "Member";
    const cusPhone = worker.phone || "01700000000";
    const cusEmail = worker.email || "member@example.com";
    const cusAdd1 = worker.district || worker.division || "Dhaka";
    const cusCity = worker.district || "Dhaka";
    const cusCountry = "Bangladesh";

    const GatewayPageURL = await service.initPayment({
      total_amount: amount,
      currency: MEMBERSHIP_CURRENCY,
      tran_id: tranId,
      success_url: `${origin}/api/membership/success`,
      fail_url: `${origin}/api/membership/fail`,
      cancel_url: `${origin}/api/membership/cancel`,
      cus_name: cusName,
      cus_phone: cusPhone,
      cus_email: cusEmail,
      cus_add1: cusAdd1,
      cus_city: cusCity,
      cus_country: cusCountry,
      product_name: `Premium Membership - Elite (${amount} BDT)`,
      product_category: "Membership",
      product_profile: "general",
    });

    return NextResponse.json({ GatewayPageURL, tran_id: tranId });
  } catch (error) {
    console.error("Membership init error:", error);
    return NextResponse.json({ error: (error as Error)?.message || "Failed to init payment" }, { status: 500 });
  }
}
