import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { workerId, items, currency, shippingAddress, cusName, cusPhone, cusEmail, paymentMethod } = await request.json() as {
      workerId: string;
      items: { productId: number; quantity?: number }[];
      currency?: string;
      shippingAddress?: string;
      cusName: string;
      cusPhone: string;
      cusEmail?: string;
      paymentMethod?: string;
    };

    if (!workerId || !cusName || !cusPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const env = await getDB();

    // C4: price is always resolved server-side from the products table — the client amount is never trusted
    const qtyById = new Map<number, number>();
    for (const it of items) {
      qtyById.set(it.productId, (qtyById.get(it.productId) || 0) + Math.max(1, Math.floor(Number(it.quantity) || 1)));
    }

    const ids = [...qtyById.keys()];
    const placeholders = ids.map(() => "?").join(",");
    const productRows = await query<{ id: number; name: string; price: number; enable_sslcommerz: number; enable_cod: number; premium_membership: number }>(
      env,
      `SELECT id, name, price, enable_sslcommerz, enable_cod, premium_membership FROM products WHERE id IN (${placeholders}) AND is_active = 1`,
      ids
    );
    if (productRows.length !== ids.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 404 });
    }

    const productById = new Map(productRows.map(p => [p.id, p]));
    for (const it of items) {
      const product = productById.get(it.productId);
      if (paymentMethod === "sslcommerz" && product && !product.enable_sslcommerz) {
        return NextResponse.json({ error: "SSL Commerz is disabled for this product" }, { status: 400 });
      }
      if (paymentMethod === "cod" && product && !product.enable_cod) {
        return NextResponse.json({ error: "Cash on Delivery is disabled for this product" }, { status: 400 });
      }
    }

    let finalAmount = 0;
    let premiumUpgrade = false;
    for (const [pid, qty] of qtyById) {
      const p = productById.get(pid)!;
      finalAmount += p.price * qty;
      if (p.premium_membership === 1) premiumUpgrade = true;
    }

    const pm = paymentMethod || "sslcommerz";
    const orderId = `ORD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const productName = productRows.map(p => p.name).join(", ");

    await execute(env,
      `INSERT INTO orders (order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, order_status, shipping_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
      [orderId, workerId, ids[0], productName, qtyById.get(ids[0]), finalAmount, currency || "BDT", pm, shippingAddress || null]
    );

    if (pm === "cod") {
      return NextResponse.json({ gatewayUrl: null, orderId, method: "cod" }, { status: 200 });
    }

    const service = await SslcommerzService.fromDB(env);
    const gatewayUrl = await service.initPayment({
      total_amount: finalAmount,
      currency: currency || "BDT",
      tran_id: orderId,
      success_url: `${siteUrl}/api/payment/success`,
      fail_url: `${siteUrl}/api/payment/fail`,
      cancel_url: `${siteUrl}/api/payment/cancel`,
      cus_name: cusName,
      cus_phone: cusPhone,
      cus_email: cusEmail || "",
      cus_add1: shippingAddress || "",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      product_name: productName || "Product",
      product_category: "general",
      product_profile: "general",
    });

    return NextResponse.json({ gatewayUrl, orderId, method: "sslcommerz" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment initialization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
