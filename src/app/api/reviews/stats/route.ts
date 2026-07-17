import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    const productType = req.nextUrl.searchParams.get("productType") || "course";

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const db = await ensureDB();

    const stats = await db.prepare(
      "SELECT COUNT(*) as count, AVG(rating) as avg_rating, SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fives, SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fours, SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threes, SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twos, SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as ones FROM product_reviews WHERE product_id = ? AND product_type = ? AND is_approved = 1"
    ).bind(productId, productType).first() as any;

    return NextResponse.json({
      totalReviews: stats?.count || 0,
      avgRating: stats?.avg_rating ? Math.round(Number(stats.avg_rating) * 10) / 10 : 0,
      distribution: {
        5: stats?.fives || 0, 4: stats?.fours || 0, 3: stats?.threes || 0,
        2: stats?.twos || 0, 1: stats?.ones || 0,
      },
    });
  } catch (err) {
    console.error("Review stats error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
