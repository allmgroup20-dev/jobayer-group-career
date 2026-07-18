import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getWorkerInterestScores, getRecommendedCourses, getRecommendedProducts } from "@/lib/recommendations/engine";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    const type = req.nextUrl.searchParams.get("type") || "all";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "6");

    const scores = workerId ? await getWorkerInterestScores(workerId) : null;
    const topCategories = scores ? Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c) : [];

    let courses: ReturnType<typeof getRecommendedCourses> = [];
    let products: ReturnType<typeof getRecommendedProducts> = [];

    if (type === "all" || type === "courses") {
      if (scores) {
        courses = getRecommendedCourses(scores, limit);
      }
    }

    if (type === "all" || type === "products") {
      if (scores) {
        const db = await getDB();
        const allProducts = await query<any>(db,
          "SELECT id, name, name_bn as nameBn, price, image_url as imageUrl, category FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT 100"
        );
        products = getRecommendedProducts(scores, allProducts, limit);
      }
    }

    return NextResponse.json({
      workerId,
      hasScores: !!scores,
      topCategories,
      courses,
      products,
    });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
