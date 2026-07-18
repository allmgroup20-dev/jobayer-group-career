import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const workerId = searchParams.get("workerId");

    let sql = `SELECT c.id, c.worker_id as workerId, c.course_ids as courseIds, c.description,
               c.status, c.admin_note as adminNote, c.created_at as createdAt, c.resolved_at as resolvedAt
               FROM complaints c WHERE 1=1`;
    const params: unknown[] = [];

    if (status) { sql += " AND c.status = ?"; params.push(status); }
    if (workerId) { sql += " AND c.worker_id = ?"; params.push(workerId); }

    sql += " ORDER BY c.created_at DESC LIMIT 200";

    const complaints = await query<any>(await getDB(), sql, params);
    return NextResponse.json({ complaints });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      workerId: string; courseIds: number[]; description: string;
    };

    if (!body.workerId || !body.courseIds?.length || !body.description) {
      return NextResponse.json({ error: "workerId, courseIds, and description are required" }, { status: 400 });
    }

    const db = await getDB();
    await execute(db,
      `INSERT INTO complaints (worker_id, course_ids, description) VALUES (?, ?, ?)`,
      [body.workerId, JSON.stringify(body.courseIds), body.description]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
