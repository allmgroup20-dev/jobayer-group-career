import { NextRequest, NextResponse } from "next/server";
import { querySafe, execute, batch } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isNew = searchParams.get("isNew");
    const visibleOnly = searchParams.get("visibleOnly");

    const cacheKey = `courses:c:${categoryId || ""}:n:${isNew ?? ""}:v:${visibleOnly || ""}`;
    const cached = await getCached<any[]>(cacheKey, 300);
    if (cached) {
      const resp = NextResponse.json({ courses: cached });
      resp.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return resp;
    }

    let sql = `SELECT c.id, c.title, c.title_bn as titleBn, c.description, c.description_bn as descriptionBn,
              c.category_id as categoryId, c.is_new as isNew, c.is_visible as isVisible,
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
              LEFT JOIN (
                SELECT m.course_id,
                       json_group_array(DISTINCT m.category_id) as category_ids,
                       json_group_array(DISTINCT cat.name) as category_names,
                       json_group_array(DISTINCT cat.name_bn) as category_names_bn
                FROM course_category_map m
                LEFT JOIN course_categories cat ON m.category_id = cat.id
                GROUP BY m.course_id
              ) cat_agg ON cat_agg.course_id = c.id
              LEFT JOIN (
                SELECT course_id,
                       MIN(url) as file_url,
                       COUNT(*) as file_count
                FROM course_files
                GROUP BY course_id
              ) files ON files.course_id = c.id
              LEFT JOIN (
                SELECT course_id,
                       ROUND(AVG(rating), 1) as avg_rating,
                       COUNT(*) as rating_count
                FROM course_ratings
                GROUP BY course_id
              ) ratings ON ratings.course_id = c.id
              WHERE 1=1`;
    const params: unknown[] = [];

    if (categoryId) {
      sql += " AND EXISTS (SELECT 1 FROM course_category_map m2 WHERE m2.course_id = c.id AND m2.category_id = ?)";
      params.push(parseInt(categoryId));
    }
    if (isNew === "0" || isNew === "1") { sql += " AND c.is_new = ?"; params.push(parseInt(isNew)); }
    if (visibleOnly === "1") { sql += " AND c.is_visible = 1"; }

    sql += " ORDER BY c.is_new DESC, c.created_at DESC LIMIT 500";

    const rows = await querySafe<any>(await getDB(), sql, params, 10000);
    const courses = rows.map((r: any) => ({
      ...r,
      categoryIds: JSON.parse(r.categoryIds),
      categoryNames: JSON.parse(r.categoryNames),
      categoryNamesBn: JSON.parse(r.categoryNamesBn),
    }));
    await setCached(cacheKey, courses);
    const resp = NextResponse.json({ courses });
    resp.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return resp;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      title: string; titleBn?: string; description?: string; descriptionBn?: string;
      categoryIds?: number[]; isNew?: number; isVisible?: number;
      price?: number; isPremium?: number;
      trainerId?: number | null; institutionId?: number | null;
    };

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDB();
    await invalidateCache("courses:*");
    const result = await execute(db,
      `INSERT INTO courses (title, title_bn, description, description_bn,
        is_new, is_visible, price, is_premium, trainer_id, institution_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title, body.titleBn || null, body.description || null, body.descriptionBn || null,
        body.isNew ?? 1, body.isVisible ?? 1,
        body.price || 0, body.isPremium ?? 1,
        body.trainerId ?? null, body.institutionId ?? null,
      ]
    );

    const courseId = result.meta?.last_row_id;
    if (courseId && body.categoryIds?.length) {
      const catStmts = body.categoryIds.map((catId: number) => ({
        sql: "INSERT OR IGNORE INTO course_category_map (course_id, category_id) VALUES (?, ?)",
        params: [courseId, catId],
      }));
      await batch(db, catStmts);
    }

    return NextResponse.json({ success: true, id: courseId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
