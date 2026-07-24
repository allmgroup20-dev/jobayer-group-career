import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      name?: string; nameBn?: string; icon?: string; isVisible?: number; sortOrder?: number; parentId?: number | null;
    };
    const db = await getDB();

    const existing = await queryFirst<{ id: number }>(db, "SELECT id FROM course_categories WHERE id = ?", [parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // Validate parentId: can't set self as parent, can't create circular ref
    if (body.parentId !== undefined && body.parentId !== null) {
      if (body.parentId === parseInt(id)) {
        return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
      }
      // Check that parentId actually exists
      const parent = await queryFirst<{ id: number }>(db, "SELECT id FROM course_categories WHERE id = ?", [body.parentId]);
      if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
    }

    await invalidateCache("courses:*");
    await execute(db,
      `UPDATE course_categories SET name=COALESCE(?,name), name_bn=COALESCE(?,name_bn),
       icon=COALESCE(?,icon), is_visible=COALESCE(?,is_visible), sort_order=COALESCE(?,sort_order),
       parent_id=? WHERE id=?`,
      [body.name ?? null, body.nameBn ?? null, body.icon ?? null, body.isVisible ?? null, body.sortOrder ?? null, body.parentId ?? null, parseInt(id)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();

    await invalidateCache("courses:*");
    // Uncouple courses from this category
    await execute(db, "UPDATE courses SET category_id = NULL WHERE category_id = ?", [parseInt(id)]);
    // Move child categories to root
    await execute(db, "UPDATE course_categories SET parent_id = NULL WHERE parent_id = ?", [parseInt(id)]);
    // Delete the category
    await execute(db, "DELETE FROM course_categories WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
