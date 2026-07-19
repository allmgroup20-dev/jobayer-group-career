import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

async function computeAiPrice(env: { DB: D1Database }, productId: number, _workerId: string): Promise<number | null> {
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { workerId, productId, productName, quantity, totalAmount, currency, shippingAddress, cusName, cusPhone, cusEmail, paymentMethod } = await request.json() as {
      workerId: string;
      productId?: number;
      productName?: string;
      quantity?: number;
      totalAmount: number;
      currency?: string;
      shippingAddress?: string;
      cusName: string;
      cusPhone: string;
      cusEmail?: string;
      paymentMethod?: string;
    };

    if (!workerId || !cusName || !cusPhone || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const env = await getDB();

    if (productId) {
      const product = await queryFirst<{ enable_sslcommerz: number; enable_cod: number }>(
        env, "SELECT enable_sslcommerz, enable_cod FROM products WHERE id = ? AND is_active = 1", [productId]
      );
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      if (paymentMethod === "sslcommerz" && !product.enable_sslcommerz) {
        return NextResponse.json({ error: "SSL Commerz is disabled for this product" }, { status: 400 });
      }
      if (paymentMethod === "cod" && !product.enable_cod) {
        return NextResponse.json({ error: "Cash on Delivery is disabled for this product" }, { status: 400 });
      }
    }

    let finalAmount = totalAmount;

    if (productId) {
      const aiPrice = await computeAiPrice(env, productId, workerId);
      if (aiPrice !== null) {
        finalAmount = aiPrice;
      }
    }

    const pm = paymentMethod || "sslcommerz";
    const orderId = `ORD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await execute(env,
      `INSERT INTO orders (order_id, worker_id, product_id, product_name, quantity, total_amount, currency, payment_method, payment_status, order_status, shipping_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
      [orderId, workerId, productId || null, productName || null, quantity || 1, finalAmount, currency || "BDT", pm, shippingAddress || null]
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
