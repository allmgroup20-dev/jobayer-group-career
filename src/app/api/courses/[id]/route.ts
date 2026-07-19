import { NextRequest, NextResponse } from "next/server";
import { execute, query, queryFirst, batch } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache, getCached, setCached } from "@/lib/cache";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();

    const cached = await getCached(`course:${id}`);
    if (cached) return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, max-age=30" }
    });

    const course = await queryFirst<any>(db,
      `SELECT c.id, c.title, c.title_bn as titleBn, c.description, c.description_bn as descriptionBn,
              c.is_new as isNew, c.is_visible as isVisible, c.price, c.is_premium as isPremium,
              c.created_at as createdAt, c.updated_at as updatedAt,
              c.trainer_id as trainerId, c.institution_id as institutionId,
              t.name as trainerName, t.name_bn as trainerNameBn, t.image_url as trainerImageUrl,
              i.name as institutionName, i.name_bn as institutionNameBn, i.logo_url as institutionLogoUrl,
              COALESCE((SELECT json_group_array(m.category_id) FROM course_category_map m WHERE m.course_id = c.id), '[]') as categoryIds,
              COALESCE((SELECT json_group_array(cat.name) FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id), '[]') as categoryNames,
              COALESCE((SELECT json_group_array(cat.name_bn) FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id), '[]') as categoryNamesBn
       FROM courses c
       LEFT JOIN trainers t ON t.id = c.trainer_id
       LEFT JOIN institutions i ON i.id = c.institution_id
       WHERE c.id = ?`,
      [parseInt(id)]
    );
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const files = await query<any>(db,
      `SELECT id, course_id as courseId, label, label_bn as labelBn, url, file_type as fileType, sort_order as sortOrder, created_at as createdAt
       FROM course_files WHERE course_id = ? ORDER BY sort_order ASC, id ASC`,
      [parseInt(id)]
    );

    const result = {
      course: {
        ...course,
        categoryIds: JSON.parse(course.categoryIds),
        categoryNames: JSON.parse(course.categoryNames),
        categoryNamesBn: JSON.parse(course.categoryNamesBn),
      },
      files,
    };
    await setCached(`course:${id}`, result);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=30" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      title?: string; titleBn?: string; description?: string; descriptionBn?: string;
      categoryIds?: number[]; isNew?: number; isVisible?: number;
      price?: number; isPremium?: number;
      trainerId?: number | null; institutionId?: number | null;
    };
    const db = await getDB();

    const existing = await queryFirst<{ id: number }>(db, "SELECT id FROM courses WHERE id = ?", [parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    await invalidateCache("courses");
    await execute(db,
      `UPDATE courses SET title=COALESCE(?,title), title_bn=COALESCE(?,title_bn),
       description=COALESCE(?,description), description_bn=COALESCE(?,description_bn),
       is_new=COALESCE(?,is_new),
       is_visible=COALESCE(?,is_visible),
       price=COALESCE(?,price), is_premium=COALESCE(?,is_premium),
       trainer_id=COALESCE(?,trainer_id), institution_id=COALESCE(?,institution_id),
       updated_at=datetime('now')
       WHERE id=?`,
      [
        body.title ?? null, body.titleBn ?? null, body.description ?? null, body.descriptionBn ?? null,
        body.isNew ?? null, body.isVisible ?? null,
        body.price ?? null, body.isPremium ?? null,
        body.trainerId ?? null, body.institutionId ?? null, parseInt(id)
      ]
    );

    if (body.categoryIds !== undefined) {
      await execute(db, "DELETE FROM course_category_map WHERE course_id = ?", [parseInt(id)]);
      if (body.categoryIds.length > 0) {
        const catStmts = body.categoryIds.map((catId: number) => ({
          sql: "INSERT INTO course_category_map (course_id, category_id) VALUES (?, ?)",
          params: [parseInt(id), catId],
        }));
        await batch(db, catStmts);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();
    await invalidateCache("courses");
    await execute(db, "DELETE FROM course_category_map WHERE course_id = ?", [parseInt(id)]);
    await execute(db, "DELETE FROM course_files WHERE course_id = ?", [parseInt(id)]);
    await execute(db, "DELETE FROM courses WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
