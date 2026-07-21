import { ensureDB } from "@/lib/db";
import { getWorkerInterestScores } from "./engine";

export interface PersonalizedInsight {
  type: "course_recommendation" | "product_recommendation" | "skill_gap" | "earning_opportunity" | "milestone" | "re_engagement" | "cross_sell" | "upgrade_path";
  title: string;
  titleBn: string;
  priority: 1 | 2 | 3;
  actionUrl: string;
  reason: string;
  expiresAt: string;
  emoji: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  web_development: "🌐",
  programming: "💻",
  android_app: "📱",
  graphics_design: "🎨",
  motion_graphics: "🎬",
  logo_design: "🖌️",
  video_editing: "🎥",
  digital_marketing: "📢",
  seo: "🔍",
  facebook_marketing: "📘",
  youtube_marketing: "▶️",
  affiliate_marketing: "🔗",
  cpa_marketing: "💰",
  email_marketing: "📧",
  content_writing: "✍️",
  fiverr: "🌍",
  outsourcing: "🤝",
  linkedin: "💼",
  data_entry: "⌨️",
  ms_office: "📊",
  spoken_english: "🗣️",
  english: "📖",
  cyber_security: "🔒",
  ethical_hacking: "🛡️",
  wifi_hacking: "📡",
  facebook_hacking: "🔓",
  android_hacking: "📲",
  blackhat: "⚫",
  wordpress: "🔌",
  game_development: "🎮",
  autocad: "📐",
  chatgpt: "🤖",
  quran: "📖",
  business: "📈",
  job_preparation: "📋",
  youtube: "🎬",
  photography: "📷",
  networking: "🔌",
  database: "🗄️",
  ui_ux: "🖥️",
  blockchain: "⛓️",
  data_science: "📊",
  cloud: "☁️",
  platform: "🔧",
};

function daysAgo(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export async function getPersonalizedInsights(workerId: string): Promise<PersonalizedInsight[]> {
  const db = await ensureDB();
  const insights: PersonalizedInsight[] = [];
  const now = new Date();
  const expiresDefault = new Date(now.getTime() + 14 * 86400000).toISOString();

  const interestScores = (await getWorkerInterestScores(workerId)) || {};
  const hasInterests = Object.keys(interestScores).length > 0;

  const behaviorScores = await db.prepare(
    "SELECT * FROM user_behavior_scores WHERE worker_id = ?"
  ).bind(workerId).first() as Record<string, unknown> | undefined;

  if (!hasInterests && !behaviorScores) {
    return [];
  }

  const completedOrders = await db.prepare(
    "SELECT COUNT(*) as count FROM orders WHERE worker_id = ? AND payment_status = 'completed'"
  ).bind(workerId).first() as { count: number } | undefined;
  const totalPurchases = completedOrders?.count ?? 0;

  const orderedCourseIds = await db.prepare(
    "SELECT DISTINCT o.product_id FROM orders o JOIN courses c ON c.id = o.product_id WHERE o.worker_id = ? AND o.payment_status = 'completed'"
  ).bind(workerId).all() as { results: { product_id: number }[] };
  const totalCourses = orderedCourseIds.results.length;

  const lastEvent = await db.prepare(
    "SELECT created_at FROM user_events WHERE worker_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(workerId).first() as { created_at: string } | undefined;

  const daysSinceLastActivity = lastEvent?.created_at ? daysAgo(lastEvent.created_at) : 999;

  const sortedCats = Object.entries(interestScores).sort(([, a], [, b]) => b - a);

  // --- Churn risk: churn_probability > 70 ---
  const churnProbability = (behaviorScores?.churn_probability as number) ?? 0;
  if (churnProbability > 70) {
    insights.push({
      type: "re_engagement",
      title: churnProbability > 90 ? "Urgent: We miss you! Come back" : "We miss you! Come back for more learning",
      titleBn: churnProbability > 90 ? "জরুরি: আমরা আপনাকে মিস করি! ফিরে আসুন" : "আমরা আপনাকে মিস করি! আরও শেখার জন্য ফিরে আসুন",
      priority: 1,
      actionUrl: "/courses",
      reason: `Churn probability: ${churnProbability}%`,
      expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
      emoji: "🔄",
    });
  }

  // --- Top interest > 50 and no purchase → course_recommendation ---
  if (sortedCats.length > 0) {
    const [topCat, topScore] = sortedCats[0];
    if (topScore > 50) {
      if (totalPurchases === 0) {
        insights.push({
          type: "course_recommendation",
          title: `Start learning ${topCat.replace(/_/g, " ")}`,
          titleBn: `${topCat.replace(/_/g, " ")} শেখা শুরু করুন`,
          priority: 1,
          actionUrl: `/courses?interest=${topCat}`,
          reason: `Strong interest (${topScore}) in ${topCat} with no purchases yet`,
          expiresAt: expiresDefault,
          emoji: CATEGORY_EMOJI[topCat] || "📚",
        });
      } else {
        insights.push({
          type: "course_recommendation",
          title: `Deepen your ${topCat.replace(/_/g, " ")} skills`,
          titleBn: `আপনার ${topCat.replace(/_/g, " ")} দক্ষতা আরও বাড়ান`,
          priority: 2,
          actionUrl: `/courses?interest=${topCat}`,
          reason: `Continuing interest (${topScore}) in ${topCat}`,
          expiresAt: expiresDefault,
          emoji: CATEGORY_EMOJI[topCat] || "📚",
        });
      }
    }
  }

  // --- Top 3 cross-sell: purchased courses but not products in related categories ---
  if (totalPurchases > 0) {
    const productCount = await db.prepare(
      "SELECT COUNT(*) as count FROM orders o JOIN products p ON p.id = o.product_id WHERE o.worker_id = ? AND o.payment_status = 'completed'"
    ).bind(workerId).first() as { count: number } | undefined;

    if ((productCount?.count ?? 0) === 0) {
      insights.push({
        type: "cross_sell",
        title: "Explore our products to complement your learning",
        titleBn: "আপনার শেখার পরিপূরক পণ্য দেখুন",
        priority: 2,
        actionUrl: "/product-list",
        reason: "Purchased courses but no products yet",
        expiresAt: expiresDefault,
        emoji: "🛍️",
      });
    }
  }

  // --- Skill gap: top interest category exists but no related orders ---
  if (sortedCats.length > 1) {
    const [, secondScore] = sortedCats[1];
    if (secondScore > 40 && totalPurchases > 0) {
      insights.push({
        type: "skill_gap",
        title: "Identify skill gaps to grow faster",
        titleBn: "দ্রুত বাড়তে দক্ষতার ঘাটতি চিহ্নিত করুন",
        priority: 2,
        actionUrl: "/courses?sort=popular",
        reason: `Secondary interest score (${secondScore}) suggests untapped potential`,
        expiresAt: expiresDefault,
        emoji: "🧩",
      });
    }
  }

  // --- Earning opportunity: strong interest + no team referrals ---
  const teamCount = await db.prepare(
    "SELECT COUNT(*) as count FROM affiliate_tree WHERE parent_id = ?"
  ).bind(workerId).first() as { count: number } | undefined;
  if ((teamCount?.count ?? 0) === 0 && totalPurchases > 0) {
    insights.push({
      type: "earning_opportunity",
      title: "Start earning by referring friends!",
      titleBn: "বন্ধুদের রেফার করে আয় শুরু করুন!",
      priority: 2,
      actionUrl: "/dashboard/tree",
      reason: "No team members yet — earning potential untapped",
      expiresAt: expiresDefault,
      emoji: "💵",
    });
  }

  // --- Milestone: 5+ courses → upgrade_path to premium ---
  if (totalCourses >= 5) {
    const isPremium = await db.prepare(
      "SELECT membership_status FROM workers WHERE worker_id = ?"
    ).bind(workerId).first() as { membership_status: string } | undefined;

    if (isPremium?.membership_status !== "premium") {
      insights.push({
        type: "upgrade_path",
        title: "You've completed 5+ courses! Upgrade to Premium",
        titleBn: "আপনি ৫+ কোর্স সম্পন্ন করেছেন! প্রিমিয়ামে আপগ্রেড করুন",
        priority: 2,
        actionUrl: "/membership",
        reason: "Milestone: 5+ courses purchased — premium unlocks more",
        expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
        emoji: "⭐",
      });
    }
  }

  // --- Milestone: 10+ purchases ---
  if (totalPurchases >= 10) {
    insights.push({
      type: "milestone",
      title: "Congratulations on 10+ purchases!",
      titleBn: "১০+ ক্রয়ে আপনাকে অভিনন্দন!",
      priority: 3,
      actionUrl: "/dashboard",
      reason: "10+ completed orders — loyal customer",
      expiresAt: expiresDefault,
      emoji: "🏆",
    });
  }

  // --- Inactive > 14 days → re_engagement ---
  if (daysSinceLastActivity > 14) {
    const recentlyPopular = await db.prepare(
      "SELECT title, id FROM courses WHERE is_new = 1 AND is_visible = 1 ORDER BY created_at DESC LIMIT 1"
    ).first() as { title: string; id: number } | undefined;

    insights.push({
      type: "re_engagement",
      title: recentlyPopular
        ? `New course "${recentlyPopular.title}" is waiting for you!`
        : "New courses are waiting for you!",
      titleBn: recentlyPopular
        ? `নতুন কোর্স "${recentlyPopular.title}" আপনার জন্য অপেক্ষা করছে!`
        : "নতুন কোর্স আপনার জন্য অপেক্ষা করছে!",
      priority: daysSinceLastActivity > 30 ? 1 : 2,
      actionUrl: recentlyPopular ? `/courses/${recentlyPopular.id}` : "/courses",
      reason: `Inactive for ${daysSinceLastActivity} days`,
      expiresAt: expiresDefault,
      emoji: "✨",
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
