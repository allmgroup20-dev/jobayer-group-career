import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";

const SITE_URL = process.env.SITE_URL || "https://jobayer-group-career.allmgroup20.workers.dev";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      workerId: string; resourceCount: number; amount: number; cusName: string; cusPhone: string; cusEmail?: string;
    };
    if (!body.workerId || !body.resourceCount || !body.amount || !body.cusName || !body.cusPhone) {
      return NextResponse.json({ error: "workerId, resourceCount, amount, cusName, cusPhone required" }, { status: 400 });
    }

    const db = await getDB();
    const orderId = `RES${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    await execute(db,
      `INSERT INTO resource_purchases (order_id, worker_id, amount, resource_count) VALUES (?, ?, ?, ?)`,
      [orderId, body.workerId, body.amount, body.resourceCount]
    );

    const service = await SslcommerzService.fromDB(db);
    let gatewayUrl: string;
    try {
      gatewayUrl = await service.initPayment({
        total_amount: body.amount,
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
        product_name: `Resource Pack (${body.resourceCount} resources)`,
        product_category: "resources",
        product_profile: "general",
      });
    } catch (err) {
      await execute(db, "UPDATE resource_purchases SET payment_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.json({ error: err instanceof Error ? err.message : "Payment initiation failed" }, { status: 502 });
    }

    await execute(db, "UPDATE resource_purchases SET session_key = ? WHERE order_id = ?", ["", orderId]);

    return NextResponse.json({ gatewayUrl, orderId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}
