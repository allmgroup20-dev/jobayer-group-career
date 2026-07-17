import { NextRequest, NextResponse } from "next/server";
import { execute, query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
import { getPriceForCustomer, type ProductPricing, type CustomerProfile } from "@/lib/ai/pricing-engine";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

async function computeAiPrice(env: { DB: D1Database }, productId: number, workerId: string): Promise<number | null> {
  const product = await queryFirst<any>(
    env,
    `SELECT id, price, min_price as minPrice, max_price as maxPrice,
            ai_price_enabled as aiPriceEnabled, category
     FROM products WHERE id = ? AND is_active = 1`,
    [productId],
  );
  if (!product || product.aiPriceEnabled !== 1 || !product.minPrice || product.minPrice <= 0) return null;

  const orders = await query<{ total: number; spent: number; lastDate: string | null }>(
    env,
    `SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as spent,
            MAX(created_at) as lastDate
     FROM orders WHERE worker_id = ? AND payment_status IN ('paid','completed')`,
    [workerId],
  );

  const worker = await queryFirst<{ referral_source: string | null }>(
    env, "SELECT referral_source FROM workers WHERE worker_id = ?", [workerId],
  );

  const behavior = await queryFirst<{ purchase_intent: number; segment: string }>(
    env, "SELECT purchase_intent, segment FROM user_behavior_scores WHERE worker_id = ?", [workerId],
  );

  const interests = await queryFirst<{ category_scores: string }>(
    env, "SELECT category_scores FROM user_interests WHERE worker_id = ?", [workerId],
  );

  const orderRow = orders[0] || { total: 0, spent: 0, lastDate: null };
  const categoryScores = interests?.category_scores ? JSON.parse(interests.category_scores) : {};
  const purchaseIntent = behavior?.purchase_intent ?? 0;
  const productCategory = product.category || "";
  const categoryInterest = Object.entries(categoryScores).reduce((max, [k, v]) => {
    if (k.toLowerCase().includes(productCategory) || productCategory.includes(k.toLowerCase())) {
      return Math.max(max, v as number);
    }
    return max;
  }, 0);

  const highIntent = purchaseIntent >= 50 || categoryInterest >= 70 || behavior?.segment === "vip";
  const mediumIntent = purchaseIntent >= 20 || categoryInterest >= 30 || orderRow.total > 0;

  let sentiment: CustomerProfile["sentiment"];
  if (highIntent) sentiment = "high_interest";
  else if (mediumIntent) sentiment = "interested";
  else if (orderRow.total === 0) sentiment = "cold";
  else sentiment = "neutral";

  const profile: CustomerProfile = {
    totalOrders: orderRow.total,
    totalSpent: orderRow.spent,
    referralCount: worker?.referral_source ? 1 : 0,
    avgResponseTimeMs: 0,
    previousBargainRounds: 0,
    sentiment,
    isReturningCustomer: orderRow.total > 0,
    lastPurchaseDays: orderRow.lastDate
      ? Math.floor((Date.now() - new Date(orderRow.lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : undefined,
  };

  const pricing: ProductPricing = {
    price: product.price,
    minPrice: product.minPrice,
    maxPrice: product.maxPrice,
    aiPriceEnabled: true,
  };

  return getPriceForCustomer(pricing, profile).offeredPrice;
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
