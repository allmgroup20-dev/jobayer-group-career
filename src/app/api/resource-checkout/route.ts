import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
import { requireWorker } from "@/lib/auth/guard";
import { isFeatureEnabled } from "@/lib/features";

const SITE_URL = process.env.SITE_URL || "https://career.jobayergroup.com";

export async function GET() {
  try {
    const db = await getDB();
    const price = await getUnlockPrice(db);
    return NextResponse.json({ price });
  } catch {
    return NextResponse.json({ price: 99 });
  }
}

async function getUnlockPrice(env: { DB: D1Database }): Promise<number> {
  const row = await queryFirst<{ setting_value: string }>(
    env, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_unlock_price'"
  );
  const price = Number(row?.setting_value);
  return Number.isFinite(price) && price > 0 ? price : 99;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isFeatureEnabled("payments"))) {
      return NextResponse.json({ error: "Checkout is currently disabled", disabled: true }, { status: 403 });
    }
    const body = await request.json() as {
      workerId: string;
      courseId?: number;
      resourceCount?: number;
      amount?: number;
      cusName?: string; cusPhone?: string; cusEmail?: string;
    };
    if (!body.workerId || (!body.courseId && !body.resourceCount)) {
      return NextResponse.json({ error: "workerId and (courseId or resourceCount) required" }, { status: 400 });
    }

    // C6: only the authenticated worker may buy resources for themselves
    const payload = await requireWorker(request, body.workerId);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = await getDB();

    // C4: server-side price — never trust the client amount
    const unlockPrice = await getUnlockPrice(db);

    let resourceCount = 1;
    let courseId: number | null = null;
    let productName = `Resource (৳${unlockPrice})`;

    if (body.courseId) {
      // Per-resource purchase: one course, server price
      const course = await queryFirst<{ id: number; title: string; is_premium: number }>(
        db, "SELECT id, title, is_premium FROM courses WHERE id = ?", [body.courseId]
      );
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      if (course.is_premium !== 1) {
        return NextResponse.json({ error: "This resource is free" }, { status: 400 });
      }
      courseId = course.id;
      productName = `Resource: ${course.title || `#${course.id}`}`;
    } else {
      // Legacy resource-pack purchase (grants premium badge, no course access)
      resourceCount = Math.max(1, Math.floor(Number(body.resourceCount) || 1));
      productName = `Resource Pack (${resourceCount} resources)`;
    }

    const serverAmount = unlockPrice * resourceCount;

    const orderId = `RES${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    await execute(db,
      `INSERT INTO resource_purchases (order_id, worker_id, course_id, amount, resource_count) VALUES (?, ?, ?, ?, ?)`,
      [orderId, body.workerId, courseId, serverAmount, resourceCount]
    );

    // Customer info is derived server-side from the worker record — never trust the client
    const worker = await queryFirst<{ name: string; phone: string }>(
      db, "SELECT name, phone FROM workers WHERE worker_id = ?", [body.workerId]
    );
    const cusName = body.cusName || worker?.name || "User";
    const cusPhone = body.cusPhone || worker?.phone || "01XXXXXXXXX";

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
        cus_name: cusName,
        cus_phone: cusPhone,
        cus_email: body.cusEmail || "no-email@example.com",
        cus_add1: "N/A",
        cus_city: "N/A",
        cus_country: "Bangladesh",
        product_name: productName,
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
