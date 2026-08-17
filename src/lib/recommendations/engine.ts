import { ensureDB, getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";

const SCORE_TO_COURSE_CAT: Record<string, string[]> = {
  web_development: ["Web Development", "Programming"],
  programming: ["Programming", "Web Development"],
  android_app: ["Android App"],
  graphics_design: ["Graphics Design", "Logo Design"],
  motion_graphics: ["Motion Graphics"],
  logo_design: ["Logo Design", "Graphics Design"],
  video_editing: ["Video Editing"],
  digital_marketing: ["Digital Marketing"],
  seo: ["SEO"],
  facebook_marketing: ["Facebook Marketing"],
  youtube_marketing: ["YouTube Marketing"],
  affiliate_marketing: ["Affiliate Marketing"],
  cpa_marketing: ["CPA Marketing"],
  email_marketing: ["Email Marketing"],
  content_writing: ["Content Writing"],
  fiverr: ["Fiverr", "Outsourcing"],
  outsourcing: ["Outsourcing", "Fiverr"],
  linkedin: ["LinkedIn"],
  data_entry: ["Data Entry"],
  ms_office: ["MS Office"],
  spoken_english: ["Spoken English", "English"],
  english: ["English", "Spoken English"],
  cyber_security: ["Cyber Security", "Ethical Hacking"],
  ethical_hacking: ["Ethical Hacking", "Cyber Security"],
  wifi_hacking: ["WiFi Hacking", "Hacking"],
  facebook_hacking: ["Facebook Hacking", "Hacking"],
  android_hacking: ["Android Hacking", "Hacking"],
  blackhat: ["Blackhat"],
  wordpress: ["WordPress", "Web Development"],
  game_development: ["Game Development"],
  autocad: ["AutoCAD"],
  chatgpt: ["ChatGPT"],
  quran: ["Quran"],
  business: ["Business", "Digital Marketing"],
  job_preparation: ["Job Preparation"],
  youtube: ["YouTube", "YouTube Marketing"],
  photography: ["Graphics Design"],
  networking: ["Programming"],
  database: ["Web Development", "Programming"],
  ui_ux: ["Graphics Design", "Web Development"],
  blockchain: ["Programming"],
  data_science: ["Programming"],
  cloud: ["Web Development", "Programming"],
  platform: ["Platform"],
  content_creation: ["YouTube Marketing", "Facebook Marketing"],
  instagram: ["Facebook Marketing", "Digital Marketing"],
  tiktok: ["YouTube Marketing"],
  podcast: ["YouTube Marketing"],
  social_media: ["Facebook Marketing", "Digital Marketing"],
  ecommerce: ["Business", "Digital Marketing"],
  study_abroad: ["Spoken English", "English"],
};

const SCORE_TO_PRODUCT_CAT: Record<string, string[]> = {
  business: ["business"],
  digital_marketing: ["business"],
  web_development: ["education", "career"],
  programming: ["education", "career"],
  graphics_design: ["education"],
  video_editing: ["education"],
  wordpress: ["education", "career"],
  seo: ["business"],
  spoken_english: ["education"],
  job_preparation: ["career"],
  data_entry: ["business"],
  ms_office: ["education"],
  facebook_marketing: ["business"],
  chatgpt: ["education", "career"],
  english: ["education"],
  affiliate_marketing: ["business"],
  fiverr: ["career"],
  outsourcing: ["career"],
  linkedin: ["career"],
  content_creation: ["education", "business"],
  instagram: ["business"],
  ecommerce: ["business"],
  social_media: ["business"],
};

export interface CourseRecommendation {
  title: string;
  description: string;
  url: string;
  category: string;
  score: number;
}

export interface ProductRecommendation {
  id: number;
  name: string;
  nameBn: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  score: number;
}

export async function getRecommendedCourses(interestScores: Record<string, number>, limit = 6): Promise<CourseRecommendation[]> {
  const db = await getDB();
  const allCourses = await query<any>(db,
    `SELECT c.id, c.title as title, c.title_bn as titleBn, c.description, c.description_bn as descriptionBn,
            c.price, c.is_premium as isPremium,
            COALESCE((SELECT json_group_array(cat.name) FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id), '[]') as categoryNames
     FROM courses c WHERE c.is_visible = 1 ORDER BY c.is_new DESC, c.created_at DESC`
  );

  const courseItems = allCourses.map((r: any) => ({
    id: r.id,
    title: r.titleBn || r.title,
    desc: r.descriptionBn || r.description || "",
    url: `/courses/${r.id}`,
    cat: JSON.parse(r.categoryNames || "[]")[0] || "",
  }));

  const scored: Map<string, { item: typeof courseItems[0]; score: number }> = new Map();

  for (const [scoreCat, score] of Object.entries(interestScores)) {
    if (score < 10) continue;
    const courseCats = SCORE_TO_COURSE_CAT[scoreCat];
    if (!courseCats) continue;

    for (const courseCat of courseCats) {
      const matches = courseItems.filter(c => c.cat === courseCat);
      for (const item of matches) {
        const key = item.url;
        const existing = scored.get(key);
        const weight = score / 100;
        if (existing) {
          existing.score = Math.min(100, existing.score + weight * 30);
        } else {
          scored.set(key, { item, score: Math.round(weight * 50 + 20) });
        }
      }
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({
      title: s.item.title,
      description: s.item.desc,
      url: s.item.url,
      category: s.item.cat,
      score: s.score,
    }));
}

export function getRecommendedProducts(
  interestScores: Record<string, number>,
  products: { id: number; name: string; nameBn: string | null; price: number; imageUrl: string | null; category: string | null }[],
  limit = 4
): ProductRecommendation[] {
  const scored: Map<number, ProductRecommendation> = new Map();

  for (const [scoreCat, score] of Object.entries(interestScores)) {
    if (score < 10) continue;
    const prodCats = SCORE_TO_PRODUCT_CAT[scoreCat];
    if (!prodCats) continue;

    for (const prodCat of prodCats) {
      const matches = products.filter(p => p.category === prodCat && !scored.has(p.id));
      for (const p of matches) {
        const weight = score / 100;
        scored.set(p.id, {
          id: p.id,
          name: p.name,
          nameBn: p.nameBn,
          price: p.price,
          imageUrl: p.imageUrl,
          category: p.category,
          score: Math.round(weight * 60 + 10),
        });
      }
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getInterestScoresFromWorker(workerId: string): Promise<Record<string, number>> {
  try {
    const scores = await getWorkerInterestScores(workerId);
    return scores || {};
  } catch (err) {
    console.error(`Failed to get interest scores for ${workerId}:`, err);
    return {};
  }
}

export async function getWorkerInterestScores(workerId: string): Promise<Record<string, number> | null> {
  const db = await ensureDB();
  const row = await db.prepare(
    "SELECT category_scores FROM user_interests WHERE worker_id = ?"
  ).bind(workerId).first() as { category_scores: string } | undefined;

  if (!row?.category_scores) return null;
  try {
    return JSON.parse(row.category_scores) as Record<string, number>;
  } catch {
    return null;
  }
}

export async function getPopularCourses(limit = 6): Promise<{ title: string; url: string; category: string }[]> {
  const db = await getDB();
  const rows = await query<any>(db,
    `SELECT c.id, c.title as title, c.title_bn as titleBn,
            COALESCE((SELECT cat.name FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id LIMIT 1), '') as cat
     FROM courses c WHERE c.is_visible = 1 ORDER BY c.is_new DESC, c.created_at DESC LIMIT ?`,
    [limit * 3]
  );
  const grouped: Record<string, typeof rows> = {};
  for (const r of rows) {
    const cat = r.cat || "General";
    if (!grouped[cat]) grouped[cat] = [];
    if (grouped[cat].length < 2) grouped[cat].push(r);
  }
  const result: { title: string; url: string; category: string }[] = [];
  for (const cat of Object.keys(grouped)) {
    for (const item of grouped[cat]) {
      if (result.length < limit) {
        result.push({ title: item.titleBn || item.title, url: `/courses/${item.id}`, category: cat });
      }
    }
  }
  return result;
}
