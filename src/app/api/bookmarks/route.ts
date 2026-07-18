import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const bookmarks = await query<any>(await getDB(),
      `SELECT b.id, b.course_id as courseId, b.created_at as createdAt,
              c.title, c.title_bn as titleBn, c.icon, c.is_premium as isPremium, c.price
       FROM course_bookmarks b JOIN courses c ON c.id = b.course_id
       WHERE b.worker_id = ? ORDER BY b.created_at DESC LIMIT 200`,
      [workerId]
    );
    return NextResponse.json({ bookmarks });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
