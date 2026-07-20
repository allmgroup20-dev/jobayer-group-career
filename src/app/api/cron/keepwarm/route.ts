import { NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { querySafe } from "@/lib/db/queries";
import { setCached } from "@/lib/cache";

export const runtime = "edge";

async function warmCourses(db: { DB: D1Database }): Promise<string> {
  const sql = `SELECT c.id, c.title, c.title_bn as titleBn, c.is_new as isNew, c.is_visible as isVisible,
            c.price, c.is_premium as isPremium, c.created_at as createdAt, c.updated_at as updatedAt,
            c.trainer_id as trainerId, c.institution_id as institutionId,
            t.name as trainerName, t.name_bn as trainerNameBn, t.image_url as trainerImageUrl,
            i.name as institutionName, i.name_bn as institutionNameBn, i.logo_url as institutionLogoUrl,
            COALESCE(cat_agg.category_ids, '[]') as categoryIds,
            COALESCE(cat_agg.category_names, '[]') as categoryNames,
            COALESCE(cat_agg.category_names_bn, '[]') as categoryNamesBn,
            COALESCE(files.file_url, '') as fileUrl,
            COALESCE(files.file_count, 0) as fileCount,
            COALESCE(ratings.avg_rating, 0) as avgRating,
            COALESCE(ratings.rating_count, 0) as ratingCount
            FROM courses c
            LEFT JOIN trainers t ON t.id = c.trainer_id
            LEFT JOIN institutions i ON i.id = c.institution_id
            LEFT JOIN (SELECT m.course_id, json_group_array(DISTINCT m.category_id) as category_ids,
                       json_group_array(DISTINCT cat.name) as category_names,
                       json_group_array(DISTINCT cat.name_bn) as category_names_bn
                       FROM course_category_map m LEFT JOIN course_categories cat ON m.category_id = cat.id
                       GROUP BY m.course_id) cat_agg ON cat_agg.course_id = c.id
            LEFT JOIN (SELECT course_id, MIN(url) as file_url, COUNT(*) as file_count
                       FROM course_files GROUP BY course_id) files ON files.course_id = c.id
            LEFT JOIN (SELECT course_id, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as rating_count
                       FROM course_ratings GROUP BY course_id) ratings ON ratings.course_id = c.id
            ORDER BY c.is_new DESC, c.created_at DESC LIMIT 500`;
  const rows = await querySafe<any>(db, sql, [], 15000);
  const courses = rows.map((r: any) => ({
    ...r, categoryIds: JSON.parse(r.categoryIds), categoryNames: JSON.parse(r.categoryNames), categoryNamesBn: JSON.parse(r.categoryNamesBn),
  }));
  await setCached("courses:c::n::v:", courses);
  return `courses: ${courses.length}`;
}

export async function GET() {
  try {
    const d1 = await ensureDB();
    await d1.prepare("SELECT 1").run();
    const warm = await warmCourses({ DB: d1 });
    return NextResponse.json({ ok: true, warm, ts: Date.now() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
