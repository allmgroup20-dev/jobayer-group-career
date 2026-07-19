import { NextRequest, NextResponse } from "next/server";
import { query, execute, batch } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isNew = searchParams.get("isNew");
    const visibleOnly = searchParams.get("visibleOnly");

    const cacheKey = `courses:c:${categoryId || ""}:n:${isNew ?? ""}:v:${visibleOnly || ""}`;
    const cached = await getCached<any[]>(cacheKey, 30);
    if (cached) {
      const resp = NextResponse.json({ courses: cached });
      resp.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
      return resp;
    }

    let sql = `SELECT c.id, c.title, c.title_bn as titleBn, c.description, c.description_bn as descriptionBn,
              c.category_id as categoryId, c.is_new as isNew, c.is_visible as isVisible,
              c.icon, c.price, c.is_premium as isPremium, c.created_at as createdAt, c.updated_at as updatedAt,
              COALESCE(json_group_array(DISTINCT m.category_id) FILTER (WHERE m.category_id IS NOT NULL), '[]') as categoryIds,
              COALESCE(json_group_array(DISTINCT cat.name) FILTER (WHERE cat.name IS NOT NULL), '[]') as categoryNames,
              COALESCE(json_group_array(DISTINCT cat.name_bn) FILTER (WHERE cat.name_bn IS NOT NULL), '[]') as categoryNamesBn,
              (SELECT cf.url FROM course_files cf WHERE cf.course_id = c.id ORDER BY cf.sort_order ASC, cf.id ASC LIMIT 1) as fileUrl,
              (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = c.id) as fileCount,
              COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM course_ratings r WHERE r.course_id = c.id), 0) as avgRating,
              (SELECT COUNT(*) FROM course_ratings r WHERE r.course_id = c.id) as ratingCount
              FROM courses c
              LEFT JOIN course_category_map m ON c.id = m.course_id
              LEFT JOIN course_categories cat ON m.category_id = cat.id
              WHERE 1=1`;
    const params: unknown[] = [];

    if (categoryId) {
      sql += " AND EXISTS (SELECT 1 FROM course_category_map m2 WHERE m2.course_id = c.id AND m2.category_id = ?)";
      params.push(parseInt(categoryId));
    }
    if (isNew === "0" || isNew === "1") { sql += " AND c.is_new = ?"; params.push(parseInt(isNew)); }
    if (visibleOnly === "1") { sql += " AND c.is_visible = 1"; }

    sql += " GROUP BY c.id ORDER BY c.is_new DESC, c.created_at DESC";

    const rows = await query<any>(await getDB(), sql, params);
    const courses = rows.map((r: any) => ({
      ...r,
      categoryIds: JSON.parse(r.categoryIds),
      categoryNames: JSON.parse(r.categoryNames),
      categoryNamesBn: JSON.parse(r.categoryNamesBn),
    }));
    await setCached(cacheKey, courses);
    const resp = NextResponse.json({ courses });
    resp.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return resp;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      title: string; titleBn?: string; description?: string; descriptionBn?: string;
      categoryIds?: number[]; isNew?: number; isVisible?: number; icon?: string;
      price?: number; isPremium?: number;
    };

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDB();
    await invalidateCache("courses");
    const result = await execute(db,
      `INSERT INTO courses (title, title_bn, description, description_bn,
        is_new, is_visible, icon, price, is_premium)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title, body.titleBn || null, body.description || null, body.descriptionBn || null,
        body.isNew ?? 1, body.isVisible ?? 1,
        body.icon || "📌", body.price || 0, body.isPremium ?? 1,
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
