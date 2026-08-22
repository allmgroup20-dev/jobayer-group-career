import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst, execute } from "@/lib/queries";
import { SslcommerzService } from "@/lib/sslcommerz";

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
}

async function handleCallback(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let data: Record<string, string> = {};
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    for (const [k, v] of Object.entries(json as Record<string, unknown>)) data[k] = String(v);
  } else {
    const form = await request.formData().catch(() => null);
    if (form) {
      for (const [k, v] of form.entries()) data[k] = String(v);
    } else {
      const text = await request.text().catch(() => "");
      if (text) {
        const params = new URLSearchParams(text);
        for (const [k, v] of params.entries()) data[k] = v;
      }
      // also try query params
      for (const [k, v] of request.nextUrl.searchParams.entries()) data[k] = v;
    }
  }
  // Also merge query params for GET
  for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;

  const env = await getDB();
  await ensureMembershipTable(env);

  const tranId = data.tran_id || data.tranId || "";
  const valId = data.val_id || data.valId || "";
  const amount = data.amount || "99";

  if (!tranId) {
    return NextResponse.redirect(new URL("/complete?membership=error", request.nextUrl.origin));
  }

  // Fallback: if gateway validation not possible (missing val_id, dev), accept if tran exists
  const payRow = await queryFirst<{ worker_id: string; status: string }>(
    env, "SELECT worker_id, status FROM membership_payments WHERE tran_id = ?", [tranId]
  );

  let verified = false;
  try {
    const service = await SslcommerzService.fromDB(env);
    if (valId) {
      verified = await service.validateIPNResponse({ ...data, amount, tran_id: tranId, val_id: valId });
    } else if (process.env.NODE_ENV === "development") {
      // Dev without val_id: trust transaction if it exists
      verified = !!payRow;
    }
  } catch (e) {
    console.error("Success validation error:", e);
    // In dev, still allow
    if (process.env.NODE_ENV === "development" && payRow) verified = true;
  }

  if (verified && payRow) {
    // Amount check for flexible premium (99 - 10000 BDT)
    const amt = Number(amount);
    const payAmtRow = await queryFirst<{ amount: number }>(env, "SELECT amount FROM membership_payments WHERE tran_id = ?", [tranId]);
    const expected = payAmtRow?.amount ?? 99;
    if (Number.isFinite(amt) && amt !== 0 && (amt < 99 - 0.01 || amt > 10000 + 0.01) && Math.abs(amt - expected) > 0.01) {
      await execute(env, "UPDATE membership_payments SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
      return NextResponse.redirect(new URL("/complete?membership=amount_mismatch", request.nextUrl.origin));
    }
    await execute(env, "UPDATE membership_payments SET status = 'VALID', val_id = ?, gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [valId || null, JSON.stringify(data), tranId]);
    await execute(env, "UPDATE workers SET membership_status = 'premium' WHERE worker_id = ?", [payRow.worker_id]);
    // Elite certificate immediately on premium (any amount)
    try {
      const w = await queryFirst<{ elite_certificate_id: string | null }>(env, "SELECT elite_certificate_id FROM workers WHERE worker_id = ?", [payRow.worker_id]);
      if (!w?.elite_certificate_id) {
        const { generateEliteCertificateId } = await import("@/lib/share");
        let eliteId = "";
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = generateEliteCertificateId();
          const clash = await queryFirst<{ worker_id: string }>(env, "SELECT worker_id FROM workers WHERE elite_certificate_id = ? OR certificate_id = ?", [candidate, candidate]);
          if (!clash) { eliteId = candidate; break; }
        }
        if (eliteId) {
          await execute(env, "UPDATE workers SET elite_certificate_id = ?, elite_certificate_issued_at = datetime('now') WHERE worker_id = ?", [eliteId, payRow.worker_id]);
        }
      }
    } catch {}
    return NextResponse.redirect(new URL("/complete?membership=success", request.nextUrl.origin));
  } else if (payRow) {
    await execute(env, "UPDATE membership_payments SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
  }

  return NextResponse.redirect(new URL("/complete?membership=failed", request.nextUrl.origin));
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}

export async function GET(request: NextRequest) {
  // SSLCommerz may redirect via GET with query params
  return handleCallback(request);
}
