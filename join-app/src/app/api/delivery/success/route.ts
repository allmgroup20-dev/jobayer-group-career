import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst, execute } from "@/lib/queries";
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
      verified_at TEXT,
      bundle_count INTEGER DEFAULT 1,
      discount_percent INTEGER DEFAULT 0,
      delivery_fee_usd REAL DEFAULT 0
    )`
  ).run();
  try { await env.DB.prepare("ALTER TABLE delivery_orders ADD COLUMN bundle_count INTEGER DEFAULT 1").run(); } catch {}
  try { await env.DB.prepare("ALTER TABLE delivery_orders ADD COLUMN discount_percent INTEGER DEFAULT 0").run(); } catch {}
  try { await env.DB.prepare("ALTER TABLE delivery_orders ADD COLUMN delivery_fee_usd REAL DEFAULT 0").run(); } catch {}
}

async function handleCallback(request: NextRequest) {
  const ct = request.headers.get("content-type") || "";
  let data: Record<string, string> = {};
  if (ct.includes("application/json")) {
    const j = await request.json().catch(() => ({}));
    for (const [k, v] of Object.entries(j as Record<string, unknown>)) data[k] = String(v);
  } else {
    const form = await request.formData().catch(() => null);
    if (form) for (const [k, v] of form.entries()) data[k] = String(v);
    else {
      const t = await request.text().catch(() => "");
      if (t) { const p = new URLSearchParams(t); for (const [k, v] of p.entries()) data[k] = v; }
      for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;
    }
  }
  for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;

  const env = await getDB();
  await ensureDeliveryTable(env);
  const tranId = data.tran_id || data.tranId || "";
  const valId = data.val_id || data.valId || "";
  const amount = data.amount || "";
  if (!tranId) return NextResponse.redirect(new URL("/certificate?delivery=error", request.nextUrl.origin));

  const row = await queryFirst<{ worker_id: string; status: string; total_bdt: number }>(
    env, "SELECT worker_id, status, total_bdt FROM delivery_orders WHERE tran_id = ?", [tranId]
  );

  let verified = false;
  try {
    const service = await SslcommerzService.fromDB(env);
    if (valId) verified = await service.validateIPNResponse({ ...data, amount, tran_id: tranId, val_id: valId });
    else if (process.env.NODE_ENV === "development" && row) verified = true;
  } catch (e) {
    console.error("Delivery success validation:", e);
    if (process.env.NODE_ENV === "development" && row) verified = true;
  }

  if (verified && row) {
    const amt = Number(amount);
    if (Number.isFinite(amt) && row.total_bdt && Math.abs(amt - row.total_bdt) > 1) {
      await execute(env, "UPDATE delivery_orders SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
      return NextResponse.redirect(new URL("/certificate?delivery=amount_mismatch", request.nextUrl.origin));
    }
    await execute(env, "UPDATE delivery_orders SET status = 'VALID', val_id = ?, gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [valId || null, JSON.stringify(data), tranId]);
    return NextResponse.redirect(new URL("/certificate?delivery=success", request.nextUrl.origin));
  } else if (row) {
    await execute(env, "UPDATE delivery_orders SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
  }
  return NextResponse.redirect(new URL("/certificate?delivery=failed", request.nextUrl.origin));
}

export async function POST(request: NextRequest) { return handleCallback(request); }
export async function GET(request: NextRequest) { return handleCallback(request); }
