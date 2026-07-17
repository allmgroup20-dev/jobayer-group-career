import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getPriceForCustomer, type ProductPricing, type CustomerProfile } from "@/lib/ai/pricing-engine";

interface CategoryScores {
  [category: string]: number;
}

const CATEGORY_TO_SCORE_KEYS: Record<string, string[]> = {
  business: ["business", "entrepreneurship", "ecommerce", "marketing", "sales", "lead_generation"],
  career: ["career", "skill_development", "interview", "resume", "job"],
  elite: ["leadership", "management", "investment", "finance"],
  education: ["education", "online_learning", "course", "training", "skill_development"],
};

function matchCategoryInterest(categoryScores: CategoryScores, productCategory: string): number {
  const keys = CATEGORY_TO_SCORE_KEYS[productCategory] || [productCategory];
  let maxScore = 0;
  for (const key of keys) {
    for (const [k, v] of Object.entries(categoryScores)) {
      if (k.toLowerCase().includes(key) || key.includes(k.toLowerCase())) {
        maxScore = Math.max(maxScore, v);
      }
    }
  }
  return maxScore;
}

async function buildCustomerProfile(env: { DB: D1Database }, workerId: string, productCategory: string): Promise<CustomerProfile> {
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

  const behavior = await queryFirst<{ purchase_intent: number; segment: string; churn_probability: number }>(
    env, "SELECT purchase_intent, segment, churn_probability FROM user_behavior_scores WHERE worker_id = ?", [workerId],
  );

  const interests = await queryFirst<{ category_scores: string }>(
    env, "SELECT category_scores FROM user_interests WHERE worker_id = ?", [workerId],
  );

  const pageViews = await queryFirst<{ count: number }>(
    env,
    "SELECT COUNT(*) as count FROM user_events WHERE worker_id = ? AND event_type = 'page_view' AND page_category = ?",
    [workerId, productCategory],
  );

  const orderRow = orders[0] || { total: 0, spent: 0, lastDate: null };
  const totalOrders = orderRow.total;
  const totalSpent = orderRow.spent;
  const lastDate = orderRow.lastDate;
  const referralCount = worker?.referral_source ? 1 : 0;
  const lastPurchaseDays = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined;
  const isReturningCustomer = totalOrders > 0;
  const purchaseIntent = behavior?.purchase_intent ?? 0;
  const churnProbability = behavior?.churn_probability ?? 0;
  const segment = behavior?.segment ?? "new";
  const categoryScores: CategoryScores = interests?.category_scores ? JSON.parse(interests.category_scores) : {};
  const categoryInterest = matchCategoryInterest(categoryScores, productCategory);
  const categoryPageViews = pageViews?.count ?? 0;

  let sentiment: CustomerProfile["sentiment"];

  const highIntent = purchaseIntent >= 50 || categoryInterest >= 70 || categoryPageViews >= 5 || segment === "vip";
  const mediumIntent = purchaseIntent >= 20 || categoryInterest >= 30 || categoryPageViews >= 2 || (segment !== "churned" && totalOrders > 0);
  const lowIntent = churnProbability >= 50 || segment === "churned" || (totalOrders === 0 && categoryPageViews === 0);

  if (highIntent) {
    sentiment = "high_interest";
  } else if (mediumIntent || totalOrders > 0) {
    sentiment = "interested";
  } else if (lowIntent) {
    sentiment = "cold";
  } else {
    sentiment = "neutral";
  }

  return {
    totalOrders,
    totalSpent,
    referralCount,
    avgResponseTimeMs: 0,
    previousBargainRounds: 0,
    sentiment,
    isReturningCustomer,
    lastPurchaseDays,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { workerId, productIds } = await req.json() as { workerId?: string; productIds?: number[] };

    if (!workerId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "workerId and productIds required" }, { status: 400 });
    }

    const env = await getDB();

    const placeholders = productIds.map(() => "?").join(",");
    const dbProducts = await query<any>(
      env,
      `SELECT id, name, price, min_price as minPrice, max_price as maxPrice,
              ai_price_enabled as aiPriceEnabled, currency, category
       FROM products WHERE id IN (${placeholders}) AND is_active = 1`,
      productIds,
    );

    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

    const prices: Record<number, { aiPrice: number; basePrice: number; message: string }> = {};

    for (const pid of productIds) {
      const product = productMap.get(pid);
      if (!product) {
        prices[pid] = { aiPrice: 0, basePrice: 0, message: "Product not found" };
        continue;
      }

      const pricing: ProductPricing = {
        price: product.price,
        minPrice: product.minPrice ?? 0,
        maxPrice: product.maxPrice ?? 0,
        aiPriceEnabled: product.aiPriceEnabled === 1,
      };

      if (!pricing.aiPriceEnabled || pricing.minPrice <= 0) {
        prices[pid] = { aiPrice: product.price, basePrice: product.price, message: "" };
        continue;
      }

      const profile = await buildCustomerProfile(env, workerId, product.category || "");
      const result = getPriceForCustomer(pricing, profile);

      prices[pid] = {
        aiPrice: result.offeredPrice,
        basePrice: product.price,
        message: result.message,
      };
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("AI price error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
