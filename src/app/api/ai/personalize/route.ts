import { ensureDB } from "@/lib/db";

const BANNERS: Record<string, { en: string; bn: string; icon: string; cta: string; ctaBn: string; link: string }[]> = {
  new: [
    { en: "Start Your Learning Journey", bn: "আপনার শেখার যাত্রা শুরু করুন", icon: "🚀", cta: "Explore Courses", ctaBn: "কোর্স দেখুন", link: "/courses" },
    { en: "Earn While You Learn", bn: "শিখুন আর আয় করুন", icon: "💰", cta: "Join Free", ctaBn: "ফ্রিতে যোগ দিন", link: "/register" },
  ],
  active: [
    { en: "Level Up Your Skills", bn: "আপনার দক্ষতা বাড়ান", icon: "📈", cta: "View Courses", ctaBn: "কোর্স দেখুন", link: "/courses" },
    { en: "Exclusive Products Just for You", bn: "আপনার জন্য বিশেষ প্রোডাক্ট", icon: "🎯", cta: "Shop Now", ctaBn: "দেখুন", link: "/products" },
  ],
  at_risk: [
    { en: "We Miss You! Come Back", bn: "আমরা আপনাকে মিস করছি!", icon: "💝", cta: "See What's New", ctaBn: "নতুন কী দেখুন", link: "/courses" },
    { en: "Special Offer for You", bn: "আপনার জন্য বিশেষ অফার", icon: "🎁", cta: "Claim Offer", ctaBn: "অফার নিন", link: "/products" },
  ],
  churned: [
    { en: "Welcome Back! New Courses", bn: "ফিরে আসুন! নতুন কোর্স", icon: "🌟", cta: "Rejoin", ctaBn: "যোগ দিন", link: "/courses" },
    { en: "Your Friends Are Waiting", bn: "আপনার বন্ধুরা অপেক্ষায়", icon: "👋", cta: "See Updates", ctaBn: "আপডেট দেখুন", link: "/live-updates" },
  ],
  vip: [
    { en: "VIP Exclusive Access", bn: "ভিআইপি এক্সক্লুসিভ অ্যাক্সেস", icon: "👑", cta: "VIP Dashboard", ctaBn: "ভিআইপি প্যানেল", link: "/dashboard" },
    { en: "Premium Products for You", bn: "আপনার জন্য প্রিমিয়াম প্রোডাক্ট", icon: "💎", cta: "Browse Premium", ctaBn: "দেখুন", link: "/product-list" },
  ],
};

const COURSE_INTEREST_MAP: Record<string, string[]> = {
  web_development: ["web_development", "programming"],
  programming: ["programming", "web_development"],
  android_app: ["android_app", "programming"],
  graphics_design: ["graphics_design", "motion_graphics"],
  digital_marketing: ["digital_marketing", "seo", "facebook_marketing", "youtube_marketing"],
  freelancing: ["fiverr", "outsourcing", "affiliate_marketing"],
  english: ["spoken_english", "english"],
  cyber_security: ["cyber_security", "ethical_hacking"],
  wordpress: ["wordpress", "web_development"],
  data_science: ["data_science", "programming"],
};

async function getPopularCourses(db: D1Database, limit: number = 4) {
  const courses = await db.prepare(
    "SELECT id, name, name_bn, price, image_url FROM products WHERE category = 'course' AND is_active = 1 ORDER BY RANDOM() LIMIT ?"
  ).bind(limit).all() as { results: { id: number; name: string; name_bn: string | null; price: number; image_url: string | null }[] };
  return courses.results;
}

async function getPopularProducts(db: D1Database, limit: number = 4) {
  const products = await db.prepare(
    "SELECT id, name, name_bn, price, image_url FROM products WHERE (category IS NULL OR category != 'course') AND is_active = 1 ORDER BY RANDOM() LIMIT ?"
  ).bind(limit).all() as { results: { id: number; name: string; name_bn: string | null; price: number; image_url: string | null }[] };
  return products.results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const db = await ensureDB();

    // Default response for anonymous users
    if (!workerId) {
      return Response.json({
        success: true,
        isPersonalized: false,
        banners: BANNERS.new.slice(0, 2),
        courses: await getPopularCourses(db, 4),
        products: await getPopularProducts(db, 4),
      });
    }

    // Get user's interest scores
    const interests = await db.prepare(
      "SELECT category_scores, top_categories FROM user_interests WHERE worker_id = ?"
    ).bind(workerId).first() as { category_scores: string; top_categories: string } | null;

    const score = await db.prepare(
      "SELECT segment FROM user_behavior_scores WHERE worker_id = ?"
    ).bind(workerId).first() as { segment: string } | null;

    const segment = score?.segment || "new";
    const banners = BANNERS[segment as keyof typeof BANNERS] || BANNERS.new;

    // Map interests to course/product categories
    let suggestedCategories: string[] = [];
    if (interests) {
      const topCats: string[] = JSON.parse(interests.top_categories || "[]");
      for (const cat of topCats) {
        const mapped = COURSE_INTEREST_MAP[cat];
        if (mapped) suggestedCategories.push(...mapped);
      }
      suggestedCategories = [...new Set(suggestedCategories)];
    }

    const courses = await getPopularCourses(db, 4);
    const products = await getPopularProducts(db, 4);

    return Response.json({
      success: true,
      isPersonalized: true,
      segment,
      topInterests: interests ? JSON.parse(interests.top_categories || "[]") : [],
      interestScores: interests ? JSON.parse(interests.category_scores || "{}") : {},
      suggestedCategories: suggestedCategories.slice(0, 5),
      banners: banners.slice(0, 2),
      courses,
      products,
    });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
