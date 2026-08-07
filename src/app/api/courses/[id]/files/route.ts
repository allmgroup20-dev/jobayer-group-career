import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";
import { verifyWorkerFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();
    const courseId = parseInt(id);

    const course = await queryFirst<{ is_premium: number }>(
      db, "SELECT is_premium FROM courses WHERE id = ?", [courseId]
    );
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // Free courses are public; premium course files require an entitled worker.
    if (course.is_premium === 1) {
      const session = await verifyWorkerFromCookies(request);
      if (!session || session.type !== "worker") {
        return NextResponse.json({ error: "Please login and buy this resource to access files" }, { status: 403 });
      }
      const entitled = await queryFirst<{ id: number }>(db,
        `SELECT u.id FROM user_unlocks u WHERE u.worker_id = ? AND u.course_id = ? LIMIT 1`,
        [session.sub, courseId]
      ) ?? await queryFirst<{ id: number }>(db,
        `SELECT id FROM resource_purchases WHERE worker_id = ? AND course_id = ? AND payment_status = 'completed' LIMIT 1`,
        [session.sub, courseId]
      );
      if (!entitled) {
        return NextResponse.json({ error: "Please buy this resource to access files" }, { status: 403 });
      }
    }

    const cacheKey = `course_files:${id}`;
    const cached = await getCached<any[]>(cacheKey, 60);
    if (cached) return NextResponse.json({ files: cached });

    const files = await query<any>(
      db,
      `SELECT id, course_id as courseId, label, label_bn as labelBn, url,
              file_type as fileType, sort_order as sortOrder, created_at as createdAt
       FROM course_files WHERE course_id = ? ORDER BY sort_order ASC, id ASC`,
      [courseId]
    );
    await setCached(cacheKey, files);
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
    await invalidateCache("courses:*");
    await invalidateCache(`course:${id}`);
    await invalidateCache(`course_files:${id}`);
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
