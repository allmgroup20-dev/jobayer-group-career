import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, queryFirst, execute } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { SslcommerzService } from "@/lib/sslcommerz";

async function ensureDeliveryTable(env: { DB: D1Database }) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS delivery_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      tier TEXT NOT NULL,
      delivery_mode TEXT NOT NULL,
      base_usd REAL NOT NULL,
      home_extra_usd REAL NOT NULL,
      total_usd REAL NOT NULL,
      total_bdt INTEGER NOT NULL,
      usd_rate REAL NOT NULL,
      post_office_name TEXT,
      post_office_address TEXT,
      shipping_address TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      tran_id TEXT NOT NULL UNIQUE,
      val_id TEXT,
      gateway_response TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      verified_at TEXT
    )`
  ).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_delivery_orders_worker ON delivery_orders(worker_id)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_delivery_orders_tran ON delivery_orders(tran_id)").run();
  await env.DB.prepare("INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate', '122', 'text')").run();
}

async function getRate(env: { DB: D1Database }): Promise<number> {
  const row = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate'").first<{ setting_value: string }>();
  const v = row?.setting_value ? Number(row.setting_value) : 122;
  return Number.isFinite(v) && v > 0 ? v : 122;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const workerId = payload.sub;
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensureDeliveryTable(env);

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const tier = String(body.tier || "foundation") as "foundation" | "ambassador" | "elite";
    const deliveryMode = String(body.deliveryMode || "post") as "post" | "home";
    const postOfficeName = String(body.postOfficeName || "").slice(0, 200);
    const postOfficeAddress = String(body.postOfficeAddress || "").slice(0, 500);
    const shippingAddress = String(body.shippingAddress || "").slice(0, 1000);

    if (deliveryMode === "post" && (!postOfficeName || !postOfficeAddress)) {
      return NextResponse.json({ error: "পোস্ট অফিসের নাম ও ঠিকানা দিন" }, { status: 400 });
    }

    const baseUsd = tier === "elite" ? 3 : 2;
    const homeExtraUsd = deliveryMode === "home" ? 1 : 0;
    const totalUsd = baseUsd + homeExtraUsd;
    const rate = 111; // Fixed special discount (market 124)
    const totalBdt = Math.floor(totalUsd * rate);

    const worker = await queryFirst<{ name: string; phone: string; email: string; division: string; district: string }>(
      env, "SELECT name, phone, email, division, district FROM workers WHERE worker_id = ?", [workerId]
    );
    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    const service = await SslcommerzService.fromDB(env);
    const tranId = service.generateTransactionId();
    const origin = request.nextUrl.origin;

    await execute(
      env,
      "INSERT INTO delivery_orders (worker_id, tier, delivery_mode, base_usd, home_extra_usd, total_usd, total_bdt, usd_rate, post_office_name, post_office_address, shipping_address, status, tran_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
      [workerId, tier, deliveryMode, baseUsd, homeExtraUsd, totalUsd, totalBdt, rate, postOfficeName || null, postOfficeAddress || null, shippingAddress || null, tranId]
    );

    // Dev mock if no gateway
    let storeIdCheck = "";
    try {
      const r = await queryFirst<{ setting_value: string }>(env, "SELECT setting_value FROM company_settings WHERE setting_key = ?", ["sslcommerz_test_store_id"]);
      storeIdCheck = r?.setting_value || "";
    } catch {}
    const hasStore = !!storeIdCheck || !!process.env.SSLCOMMERZ_STORE_ID;
    const isDev = process.env.NODE_ENV === "development";
    if (!hasStore && isDev) {
      await execute(env, "UPDATE delivery_orders SET status = 'VALID', verified_at = datetime('now') WHERE tran_id = ?", [tranId]);
      return NextResponse.json({ GatewayPageURL: `${origin}/certificate?delivery=success&tier=${tier}`, mock: true, tran_id: tranId, totalBdt, totalUsd, rate });
    }
    if (!hasStore) return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });

    const cusName = worker.name || "Member";
    const cusPhone = worker.phone || "01700000000";
    const cusEmail = worker.email || "member@example.com";
    const cusAdd1 = worker.district || worker.division || "Dhaka";
    const cusCity = worker.district || "Dhaka";

    const GatewayPageURL = await service.initPayment({
      total_amount: totalBdt,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${origin}/api/delivery/success`,
      fail_url: `${origin}/api/delivery/fail`,
      cancel_url: `${origin}/api/delivery/cancel`,
      cus_name: cusName,
      cus_phone: cusPhone,
      cus_email: cusEmail,
      cus_add1: cusAdd1,
      cus_city: cusCity,
      cus_country: "Bangladesh",
      product_name: `Certificate Delivery - ${tier} (${totalUsd} USD)`,
      product_category: "Certificate",
      product_profile: "general",
    });

    return NextResponse.json({ GatewayPageURL, tran_id: tranId, totalBdt, totalUsd, rate });
  } catch (e) {
    console.error("Delivery init error:", e);
    return NextResponse.json({ error: (e as Error).message || "Failed to init payment" }, { status: 500 });
  }
}
