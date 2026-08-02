export interface RecommendItem {
  id: number;
  title: string;
  titleBn: string;
  description: string;
  price: number;
  category: string;
  type: "course" | "product";
  score: number;
  reason: string;
  actionUrl?: string;
}

export async function getRecommendations(
  db: any,
  workerId: string,
  phone: string,
  limit: number = 5,
  lang: string = "bn"
): Promise<RecommendItem[]> {
  const items: RecommendItem[] = [];

  try {
    // 1. Get user interests (category scores)
    const interestsRow = await db.prepare(
      "SELECT category_scores, top_categories FROM user_interests WHERE worker_id = ?"
    ).bind(workerId).first();

    const categoryScores: Record<string, number> = interestsRow
      ? JSON.parse(interestsRow.category_scores || "{}")
      : {};

    const topCategories = interestsRow
      ? JSON.parse(interestsRow.top_categories || "[]")
      : [];

    // 2. Get user's past purchases to exclude from recommendations
    const purchasedCourseIds = await db.prepare(
      "SELECT DISTINCT course_id FROM resource_purchases WHERE worker_id = ? AND course_id IS NOT NULL"
    ).bind(workerId).all();

    const purchasedCourses = new Set((purchasedCourseIds?.results || []).map((r: any) => r.course_id));

    const purchasedProductIds = await db.prepare(
      "SELECT DISTINCT product_id FROM orders WHERE worker_id = ? AND product_id IS NOT NULL"
    ).bind(workerId).all();

    const purchasedProducts = new Set((purchasedProductIds?.results || []).map((r: any) => r.product_id));

    // 3. If we have interest categories, match courses by category
    if (topCategories.length > 0) {
      for (const cat of topCategories.slice(0, 3)) {
        const courses = await db.prepare(
          "SELECT id, title, title_bn, description, description_bn, price, category_id, icon FROM courses WHERE is_visible = 1 AND id NOT IN (SELECT course_id FROM resource_purchases WHERE worker_id = ? AND course_id IS NOT NULL) ORDER BY is_new DESC LIMIT 2"
        ).bind(workerId).all();

        for (const c of (courses?.results || [])) {
          const catScore = categoryScores[cat] || 50;
          items.push({
            id: c.id,
            title: c.title,
            titleBn: c.title_bn || c.title,
            description: c.description_bn || c.description || "",
            price: c.price || 0,
            category: cat,
            type: "course",
            score: Math.round(catScore * (c.is_new ? 1.1 : 1.0)),
            reason: lang === "bn" ? `আপনার আগ্রহের "${cat}" ক্যাটাগরির কোর্স` : `Course matching your interest in "${cat}"`,
          });
        }

        const products = await db.prepare(
          "SELECT id, name, name_bn, description, description_bn, price, category FROM products WHERE is_active = 1 AND id NOT IN (SELECT product_id FROM orders WHERE worker_id = ? AND product_id IS NOT NULL) AND (category = ? OR category LIKE ?) LIMIT 2"
        ).bind(workerId, cat, `%${cat}%`).all();

        for (const p of (products?.results || [])) {
          items.push({
            id: p.id,
            title: p.name,
            titleBn: p.name_bn || p.name,
            description: p.description_bn || p.description || "",
            price: p.price,
            category: cat,
            type: "product",
            score: Math.round(categoryScores[cat] || 50),
            reason: lang === "bn" ? `আপনার পছন্দের "${cat}" বিভাগের পণ্য` : `Product in your preferred category "${cat}"`,
          });
        }
      }
    }

    // 4. If no interests data or too few results, show newest items
    if (items.length < 3) {
      const courses = await db.prepare(
        "SELECT id, title, title_bn, description, description_bn, price, icon FROM courses WHERE is_visible = 1 ORDER BY is_new DESC, created_at DESC LIMIT 3"
      ).all();

      for (const c of (courses?.results || [])) {
        if (purchasedCourses.has(c.id)) continue;
        items.push({
          id: c.id,
          title: c.title,
          titleBn: c.title_bn || c.title,
          description: c.description_bn || c.description || "",
          price: c.price || 0,
          category: "new",
          type: "course",
          score: 70,
          reason: lang === "bn" ? "নতুন কোর্স" : "New course available",
        });
      }
    }
  } catch (e) {
    console.error("Recommendation error:", e);
  }

  // Sort by score descending, deduplicate by id
  const seen = new Set<number>();
  return items
    .filter((i) => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildRecommendationContext(
  items: RecommendItem[],
  lang: string
): string {
  if (items.length === 0) return "";
  const header = lang === "bn"
    ? "## সুপারিশকৃত আইটেম\nনিচের আইটেমগুলো আপনার জন্য নির্বাচন করা হয়েছে:\n"
    : "## Recommended Items\nBased on your interests, here are personalized recommendations:\n";

  const lines = items.map((item, i) => {
    const name = lang === "bn" ? item.titleBn : item.title;
    const desc = lang === "bn" ? item.description : item.description;
    const priceText = item.price > 0 ? `৳${item.price}` : (lang === "bn" ? "ফ্রি" : "Free");
    const typeLabel = item.type === "course" ? (lang === "bn" ? "📚 কোর্স" : "📚 Course") : (lang === "bn" ? "🛒 পণ্য" : "🛒 Product");
    return `${i + 1}. ${typeLabel}: ${name} — ${priceText}\n   ${item.reason}`;
  });

  return `${header}\n${lines.join("\n")}\n`;
}
