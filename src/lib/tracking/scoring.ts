import { ensureDB } from "@/lib/db";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  web_development: ["web", "website", "html", "css", "javascript", "react", "next.js", "node", "php", "laravel", "full stack", "frontend", "backend", "wordpress theme", "web dev"],
  programming: ["programming", "python", "java", "c++", "c#", "coding", "algorithm", "data structure", "software dev", "app dev"],
  android_app: ["android", "kotlin", "flutter", "dart", "mobile app", "app development"],
  graphics_design: ["graphics", "design", "photoshop", "illustrator", "canva", "poster", "banner", "thumbnail", "gfx"],
  motion_graphics: ["motion", "animation", "after effects", "2d", "3d", "animate"],
  logo_design: ["logo", "branding", "identity"],
  video_editing: ["video", "edit", "premiere", "filmora", "capcut", "kinemaster", "video editing"],
  digital_marketing: ["digital marketing", "online marketing", "marketing"],
  seo: ["seo", "search engine", "rank", "keyword research", "backlink", "on-page", "off-page"],
  facebook_marketing: ["facebook", "fb", "meta", "facebook ads", "facebook page"],
  youtube_marketing: ["youtube", "yt", "youtube channel", "youtube seo", "video marketing"],
  affiliate_marketing: ["affiliate", "commission", "referral"],
  cpa_marketing: ["cpa", "cost per action", "offer"],
  email_marketing: ["email", "mail", "newsletter", "mailchimp"],
  content_writing: ["content", "writing", "article", "blog", "copywriting", "copy write"],
  fiverr: ["fiverr", "freelance", "gig", "freelancing"],
  outsourcing: ["outsource", "upwork", "freelancer", "fiverr"],
  linkedin: ["linkedin", "professional network", "linkedin profile"],
  data_entry: ["data entry", "typing", "data", "excel"],
  ms_office: ["word", "excel", "powerpoint", "office", "microsoft"],
  spoken_english: ["spoken", "english", "ielts", "toefl", "grammar", "vocabulary"],
  english: ["english language", "english course"],
  cyber_security: ["cyber", "security", "hacking", "hack", "ethical", "penetration", "bug bounty"],
  ethical_hacking: ["ethical hack", "white hat", "pen testing", "security"],
  wifi_hacking: ["wifi", "wireless", "network hack"],
  facebook_hacking: ["facebook hack", "fb hack", "account hack", "social hack"],
  android_hacking: ["android hack", "mobile hack", "termux"],
  blackhat: ["blackhat", "black hat", "money method", "earn quick"],
  wordpress: ["wordpress", "woocommerce", "elementor", "divi", "wp"],
  game_development: ["game", "unity", "unreal", "gamedev"],
  autocad: ["autocad", "cad", "drafting", "architecture", "engineering drawing"],
  chatgpt: ["chatgpt", "ai", "gpt", "chat bot", "artificial intelligence", "openai", "bard", "gemini", "copilot", "machine learning"],
  quran: ["quran", "islamic", "arabic", "tajweed", "surah"],
  business: ["business", "startup", "entrepreneur", "ecommerce", "shopify", "amazon"],
  job_preparation: ["job", "career", "interview", "resume", "cv", "bcs", "bank"],
  youtube: ["youtube channel", "youtube video", "content creator", "vlog"],
  photography: ["photography", "camera", "photo"],
  networking: ["networking", "ccna", "network", "cisco", "server"],
  database: ["database", "sql", "mysql", "mongodb", "firebase"],
  ui_ux: ["ui", "ux", "figma", "wireframe", "prototype", "user experience"],
  blockchain: ["blockchain", "crypto", "bitcoin", "nft", "web3", "solidity"],
  data_science: ["data science", "data analysis", "machine learning", "ai", "deep learning", "tensorflow"],
  cloud: ["cloud", "aws", "azure", "google cloud", "devops", "docker", "kubernetes"],
  platform: ["10 minute school", "ghoori", "creative it", "udemy", "skilluper", "eshikhon", "e-shikhon"],
};

export function classifySearchQuery(query: string): string[] {
  const q = query.toLowerCase();
  const matched: string[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        matched.push(category);
        break;
      }
    }
  }
  return matched;
}

export function classifyPageCategory(pageCategory: string | null): string[] {
  if (!pageCategory) return [];
  const map: Record<string, string[]> = {
    courses: ["course_platform", "education"],
    products: ["product_browsing"],
    "product-list": ["product_browsing"],
    dashboard: ["platform_usage"],
    company: ["platform_usage"],
  };
  return map[pageCategory] || [pageCategory];
}

export async function computeWorkerInterests(workerId: string): Promise<void> {
  const db = await ensureDB();
  const categories: Record<string, number> = {};
  const now = new Date().toISOString();

  const events = await db.prepare(
    "SELECT event_type, page_category, search_keyword, product_category, created_at FROM user_events WHERE worker_id = ? AND created_at IS NOT NULL ORDER BY created_at DESC"
  ).bind(workerId).all() as { results: { event_type: string; page_category: string | null; search_keyword: string | null; product_category: string | null; created_at: string }[] };

  for (const ev of events.results) {
    const daysAgo = (Date.now() - new Date(ev.created_at).getTime()) / 86400000;
    const recencyWeight = Math.max(0.1, 1 - daysAgo / 90);
    let eventWeight = 1;

    switch (ev.event_type) {
      case "search": eventWeight = 3; break;
      case "product_view": eventWeight = 2.5; break;
      case "page_view": eventWeight = 1; break;
      case "click": eventWeight = 1.5; break;
      default: eventWeight = 1;
    }

    if (ev.search_keyword) {
      const matched = classifySearchQuery(ev.search_keyword);
      for (const cat of matched) {
        categories[cat] = (categories[cat] || 0) + (eventWeight * recencyWeight * 10);
      }
    }

    if (ev.product_category) {
      const key = ev.product_category.toLowerCase().replace(/\s+/g, "_");
      categories[key] = (categories[key] || 0) + (eventWeight * recencyWeight * 15);
    }

    if (ev.page_category) {
      const matched = classifyPageCategory(ev.page_category);
      for (const cat of matched) {
        categories[cat] = (categories[cat] || 0) + (eventWeight * recencyWeight * 5);
      }
    }
  }

  const maxScore = Math.max(...Object.values(categories), 1);
  const normalized: Record<string, number> = {};
  for (const [cat, score] of Object.entries(categories)) {
    normalized[cat] = Math.round((score / maxScore) * 100);
  }

  const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  const topCategories = sorted.slice(0, 5).map(([cat]) => cat);
  const topScores = Object.fromEntries(sorted.slice(0, 10));

  await db.prepare(
    "INSERT INTO user_interests (worker_id, category_scores, top_categories, last_calculated_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(worker_id) DO UPDATE SET category_scores = excluded.category_scores, top_categories = excluded.top_categories, last_calculated_at = excluded.last_calculated_at, updated_at = excluded.updated_at"
  ).bind(
    workerId,
    JSON.stringify(topScores),
    JSON.stringify(topCategories),
    now, now, now
  ).run();
}

export async function computeWorkerBehaviorScore(workerId: string): Promise<void> {
  const db = await ensureDB();
  const now = new Date().toISOString();

  const eventStats = await db.prepare(
    "SELECT event_type, created_at FROM user_events WHERE worker_id = ? AND created_at IS NOT NULL ORDER BY created_at DESC"
  ).bind(workerId).all() as { results: { event_type: string; created_at: string }[] };

  const events = eventStats.results;
  const totalEvents = events.length;
  if (totalEvents === 0) return;

  const latestEvent = new Date(events[0].created_at);
  const daysSinceLastActivity = Math.round((Date.now() - latestEvent.getTime()) / 86400000);

  const searchEvents = events.filter(e => e.event_type === "search").length;
  const productViews = events.filter(e => e.event_type === "product_view").length;
  const pageViews = events.filter(e => e.event_type === "page_view").length;

  const totalTime = await db.prepare(
    "SELECT COALESCE(SUM(time_spent_seconds), 0) as t FROM user_events WHERE worker_id = ? AND time_spent_seconds IS NOT NULL"
  ).bind(workerId).first() as { t: number } | undefined;

  const totalOrders = await db.prepare(
    "SELECT COUNT(*) as c FROM orders WHERE worker_id = ? AND payment_status = 'completed'"
  ).bind(workerId).first() as { c: number } | undefined;

  const totalSpent = await db.prepare(
    "SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE worker_id = ? AND payment_status = 'completed'"
  ).bind(workerId).first() as { s: number } | undefined;

  const recencyScore = Math.max(0, 100 - daysSinceLastActivity * 5);
  const frequencyScore = Math.min(100, totalEvents);
  const monetaryScore = Math.min(100, (totalSpent?.s || 0) / 100);

  const leadScore = Math.round(
    (recencyScore * 0.3) + (frequencyScore * 0.2) + (searchEvents * 2) + (productViews * 3)
  );

  const churnProbability = daysSinceLastActivity > 60 ? 80 : daysSinceLastActivity > 30 ? 50 : daysSinceLastActivity > 14 ? 20 : 5;

  const purchaseIntent = Math.min(100, Math.round(
    (productViews * 5) + (searchEvents * 2) + ((totalOrders?.c || 0) * 10)
  ));

  let segment = "new";
  if (totalOrders && totalOrders.c >= 5 && monetaryScore > 50) segment = "vip";
  else if (daysSinceLastActivity <= 14 && totalEvents > 10) segment = "active";
  else if (daysSinceLastActivity > 60) segment = "churned";
  else if (daysSinceLastActivity > 30 && totalEvents < 10) segment = "at_risk";

  await db.prepare(
    `INSERT INTO user_behavior_scores (worker_id, lead_score, churn_probability, purchase_intent, rfm_recency, rfm_frequency, rfm_monetary, segment, lifetime_value, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(worker_id) DO UPDATE SET
       lead_score = excluded.lead_score,
       churn_probability = excluded.churn_probability,
       purchase_intent = excluded.purchase_intent,
       rfm_recency = excluded.rfm_recency,
       rfm_frequency = excluded.rfm_frequency,
       rfm_monetary = excluded.rfm_monetary,
       segment = excluded.segment,
       lifetime_value = excluded.lifetime_value,
       last_updated = excluded.last_updated`
  ).bind(
    workerId,
    leadScore,
    churnProbability,
    purchaseIntent,
    daysSinceLastActivity,
    totalEvents,
    totalSpent?.s || 0,
    segment,
    totalSpent?.s || 0,
    now
  ).run();
}

export async function scoreAllWorkers(): Promise<{ scored: number; errors: number }> {
  const db = await ensureDB();
  const workers = await db.prepare(
    "SELECT DISTINCT worker_id FROM user_events UNION SELECT worker_id FROM workers WHERE membership_status = 'active'"
  ).bind().all() as { results: { worker_id: string }[] };

  let scored = 0;
  let errors = 0;

  for (const w of workers.results) {
    try {
      await computeWorkerInterests(w.worker_id);
      await computeWorkerBehaviorScore(w.worker_id);
      scored++;
    } catch (err) {
      console.error(`Score error for ${w.worker_id}:`, err);
      errors++;
    }
  }

  return { scored, errors };
}
