import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const downloads = await query<any>(await getDB(),
      `SELECT d.id, d.course_id as courseId, d.file_id as fileId, d.downloaded_at as downloadedAt,
              c.title, c.title_bn as titleBn
       FROM course_downloads d LEFT JOIN courses c ON c.id = d.course_id
       WHERE d.worker_id = ? ORDER BY d.downloaded_at DESC LIMIT 50`,
      [workerId]
    );
    return NextResponse.json({ downloads });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
