import { NextRequest, NextResponse } from "next/server";
import { execute, query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { analyzeInterests } from "@/lib/ai/analyzer";

const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  freelancing: ["Fiverr", "Outsourcing", "Data Entry"],
  digital_marketing: ["Digital Marketing", "Facebook Marketing", "YouTube Marketing", "Email Marketing", "CPA Marketing", "Affiliate Marketing", "SEO"],
  web_design: ["Web Development", "WordPress", "Graphics Design", "Logo Design", "Motion Graphics", "UI UX"],
  video_editing: ["Video Editing", "YouTube", "Motion Graphics"],
  programming: ["Programming", "Android App", "Software", "Game Development", "ChatGPT"],
  spoken_english: ["English", "Spoken English"],
};

const MAX_AUTO_UNLOCK = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { workerId: string };
    if (!body.workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const db = await getDB();
    const workerId = body.workerId;

    const interests = await queryFirst<{ category_scores: string; top_categories: string }>(
      db, "SELECT category_scores, top_categories FROM user_interests WHERE worker_id = ?", [workerId]
    );

    const recentMessages = await query<{ message: string }>(
      db, `SELECT message FROM ai_conversations WHERE worker_id = ? ORDER BY created_at DESC LIMIT 20`,
      [workerId]
    );

    let matchedCategories: Set<string> = new Set();

    const rawScores = interests?.category_scores ? JSON.parse(interests.category_scores) : {};
    const rawTopics = interests?.top_categories ? JSON.parse(interests.top_categories) : [];

    if (Array.isArray(rawTopics)) {
      for (const topic of rawTopics) {
        const key = typeof topic === "string" ? topic.toLowerCase() : "";
        for (const [, cats] of Object.entries(INTEREST_CATEGORY_MAP)) {
          for (const cat of cats) {
            if (cat.toLowerCase().includes(key) || key.includes(cat.toLowerCase())) {
              matchedCategories.add(cat);
            }
          }
        }
      }
    }

    for (const [key, score] of Object.entries(rawScores)) {
      if (typeof score === "number" && score >= 50) {
        const keyLower = key.toLowerCase().replace(/_/g, " ");
        for (const [, cats] of Object.entries(INTEREST_CATEGORY_MAP)) {
          for (const cat of cats) {
            if (cat.toLowerCase().includes(keyLower) || keyLower.includes(cat.toLowerCase())) {
              matchedCategories.add(cat);
            }
          }
        }
      }
    }

    const allText = recentMessages.map(m => m.message || "").join(" ");
    if (allText.length > 20) {
      const detected = analyzeInterests(allText);
      for (const interest of detected) {
        const cats = INTEREST_CATEGORY_MAP[interest];
        if (cats) cats.forEach(c => matchedCategories.add(c));
      }
    }

    if (matchedCategories.size === 0) {
      return NextResponse.json({ unlocked: [], message: "No matching interests found", matchedCategories: [] });
    }

    const placeholders = Array.from(matchedCategories).map(() => "?").join(",");
    const catValues = Array.from(matchedCategories);

    const existingUnlocks = await query<{ course_id: number }>(
      db, "SELECT course_id FROM user_unlocks WHERE worker_id = ?", [workerId]
    );
    const existingIds = new Set(existingUnlocks.map(u => u.course_id));

    const courses = await query<any>(
      db, `SELECT DISTINCT c.id, c.title, c.title_bn
       FROM courses c
       JOIN course_category_map ccm ON c.id = ccm.course_id
       JOIN course_categories cc ON ccm.category_id = cc.id
       WHERE cc.name IN (${placeholders}) AND c.is_visible = 1
       ORDER BY c.id ASC LIMIT ${MAX_AUTO_UNLOCK}`,
      catValues
    );

    const toUnlock = courses.filter(c => !existingIds.has(c.id));
    if (toUnlock.length === 0) {
      return NextResponse.json({ unlocked: [], message: "All matching courses already unlocked", matchedCategories: Array.from(matchedCategories) });
    }

    const insertStmts = toUnlock.map(c =>
      db.DB.prepare(
        `INSERT OR IGNORE INTO user_unlocks (course_id, worker_id, unlocked_by, unlocked_at) VALUES (?, ?, 'interest', datetime('now'))`
      ).bind(c.id, workerId)
    );
    if (insertStmts.length > 0) await db.DB.batch(insertStmts);

    return NextResponse.json({
      unlocked: toUnlock.map(c => ({ id: c.id, title: c.title, titleBn: c.title_bn })),
      message: `${toUnlock.length}টি রিসোর্স আপনার আগ্রহ অনুযায়ী আনলক করা হয়েছে`,
      matchedCategories: Array.from(matchedCategories),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}
