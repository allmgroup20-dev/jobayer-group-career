import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const progress = await query<any>(await getDB(),
      `SELECT id, course_id as courseId, worker_id as workerId, file_id as fileId,
              completed, completed_at as completedAt
       FROM course_progress WHERE course_id = ? AND worker_id = ?`,
      [parseInt(id), workerId]
    );
    const totalFiles = await queryFirst<any>(await getDB(),
      "SELECT COUNT(*) as cnt FROM course_files WHERE course_id = ?", [parseInt(id)]);
    const completedCount = progress.filter(p => p.completed).length;

    return NextResponse.json({
      progress,
      totalFiles: totalFiles?.cnt || 0,
      completedCount,
      percent: totalFiles?.cnt > 0 ? Math.round((completedCount / totalFiles.cnt) * 100) : 0,
    });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { workerId: string; fileId?: number; completed: boolean };
    if (!body.workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await getDB();
    const existing = await queryFirst<any>(db,
      "SELECT id FROM course_progress WHERE course_id = ? AND worker_id = ? AND file_id = ?",
      [parseInt(id), body.workerId, body.fileId || 0]
    );

    if (existing) {
      await execute(db,
        "UPDATE course_progress SET completed = ?, completed_at = CASE WHEN ? THEN datetime('now') ELSE NULL END WHERE id = ?",
        [body.completed ? 1 : 0, body.completed ? 1 : 0, existing.id]
      );
    } else {
      await execute(db,
        "INSERT INTO course_progress (course_id, worker_id, file_id, completed, completed_at) VALUES (?, ?, ?, ?, CASE WHEN ? THEN datetime('now') ELSE NULL END)",
        [parseInt(id), body.workerId, body.fileId || 0, body.completed ? 1 : 0, body.completed ? 1 : 0]
      );
    }

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
