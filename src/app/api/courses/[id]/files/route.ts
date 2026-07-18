import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const files = await query<any>(
      await getDB(),
      `SELECT id, course_id as courseId, label, label_bn as labelBn, url,
              file_type as fileType, sort_order as sortOrder, created_at as createdAt
       FROM course_files WHERE course_id = ? ORDER BY sort_order ASC, id ASC`,
      [parseInt(id)]
    );
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      label?: string; labelBn?: string; url: string; fileType?: string; sortOrder?: number;
    };

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const db = await getDB();
    await invalidateCache("courses");
    await execute(db,
      `INSERT INTO course_files (course_id, label, label_bn, url, file_type, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parseInt(id), body.label || null, body.labelBn || null,
        body.url, body.fileType || "link", body.sortOrder ?? 0
      ]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
