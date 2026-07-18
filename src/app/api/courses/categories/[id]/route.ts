import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      name?: string; nameBn?: string; icon?: string; isVisible?: number;
    };
    const db = await getDB();

    const existing = await queryFirst<{ id: number }>(db, "SELECT id FROM course_categories WHERE id = ?", [parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await invalidateCache("courses");
    await execute(db,
      `UPDATE course_categories SET name=COALESCE(?,name), name_bn=COALESCE(?,name_bn),
       icon=COALESCE(?,icon), is_visible=COALESCE(?,is_visible) WHERE id=?`,
      [body.name ?? null, body.nameBn ?? null, body.icon ?? null, body.isVisible ?? null, parseInt(id)]
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
    await invalidateCache("courses");
    await execute(db, "UPDATE courses SET category_id = NULL WHERE category_id = ?", [parseInt(id)]);
    await execute(db, "DELETE FROM course_categories WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
