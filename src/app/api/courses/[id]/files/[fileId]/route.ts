import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id, fileId } = await params;
    const body = await request.json() as {
      label?: string; labelBn?: string; url?: string; fileType?: string; sortOrder?: number;
    };
    const db = await getDB();

    const existing = await queryFirst<{ id: number }>(db, "SELECT id FROM course_files WHERE id = ? AND course_id = ?", [parseInt(fileId), parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "File not found" }, { status: 404 });

    await invalidateCache("courses");
    await execute(db,
      `UPDATE course_files SET label=COALESCE(?,label), label_bn=COALESCE(?,label_bn),
       url=COALESCE(?,url), file_type=COALESCE(?,file_type), sort_order=COALESCE(?,sort_order)
       WHERE id=? AND course_id=?`,
      [body.label ?? null, body.labelBn ?? null, body.url ?? null, body.fileType ?? null, body.sortOrder ?? null, parseInt(fileId), parseInt(id)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id, fileId } = await params;
    const db = await getDB();
    await invalidateCache("courses");
    await execute(db, "DELETE FROM course_files WHERE id = ? AND course_id = ?", [parseInt(fileId), parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
