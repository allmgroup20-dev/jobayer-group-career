import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
import { requireWorker } from "@/lib/auth/guard";

const SITE_URL = process.env.SITE_URL || "https://career.jobayergroup.com";

async function getUnlockPrice(env: { DB: D1Database }): Promise<number> {
  const row = await queryFirst<{ setting_value: string }>(
    env, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_unlock_price'"
  );
  const price = Number(row?.setting_value);
  return Number.isFinite(price) && price > 0 ? price : 99;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      workerId: string; resourceCount: number; amount: number; cusName: string; cusPhone: string; cusEmail?: string;
    };
    if (!body.workerId || !body.resourceCount || !body.cusName || !body.cusPhone) {
      return NextResponse.json({ error: "workerId, resourceCount, cusName, cusPhone required" }, { status: 400 });
    }

    // C6: only the authenticated worker may buy resources for themselves
    const payload = await requireWorker(request, body.workerId);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = await getDB();

    // C4: server-side price — never trust the client amount
    const unlockPrice = await getUnlockPrice(db);
    const resourceCount = Math.max(1, Math.floor(Number(body.resourceCount) || 1));
    const serverAmount = unlockPrice * resourceCount;

    const orderId = `RES${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    await execute(db,
      `INSERT INTO resource_purchases (order_id, worker_id, amount, resource_count) VALUES (?, ?, ?, ?)`,
      [orderId, body.workerId, serverAmount, resourceCount]
    );

    const service = await SslcommerzService.fromDB(db);
    let gatewayUrl: string;
    try {
      gatewayUrl = await service.initPayment({
        total_amount: serverAmount,
        currency: "BDT",
        tran_id: orderId,
        success_url: `${SITE_URL}/api/resource-checkout/success`,
        fail_url: `${SITE_URL}/api/resource-checkout/success?status=failed`,
        cancel_url: `${SITE_URL}/api/resource-checkout/success?status=cancelled`,
        cus_name: body.cusName,
        cus_phone: body.cusPhone,
        cus_email: body.cusEmail || "no-email@example.com",
        cus_add1: "N/A",
        cus_city: "N/A",
        cus_country: "Bangladesh",
        product_name: `Resource Pack (${resourceCount} resources)`,
        product_category: "resources",
        product_profile: "general",
      });
    } catch (err) {
      await execute(db, "UPDATE resource_purchases SET payment_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.json({ error: err instanceof Error ? err.message : "Payment initiation failed" }, { status: 502 });
    }

    await execute(db, "UPDATE resource_purchases SET session_key = ? WHERE order_id = ?", ["", orderId]);

    return NextResponse.json({ gatewayUrl, orderId, amount: serverAmount });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}
