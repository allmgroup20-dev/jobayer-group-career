import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const bookmark = await queryFirst<any>(await getDB(),
      "SELECT id FROM course_bookmarks WHERE course_id = ? AND worker_id = ?",
      [parseInt(id), workerId]
    );
    return NextResponse.json({ bookmarked: !!bookmark });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { workerId: string; action: "add" | "remove" };
    if (!body.workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await getDB();
    if (body.action === "remove") {
      await execute(db, "DELETE FROM course_bookmarks WHERE course_id = ? AND worker_id = ?",
        [parseInt(id), body.workerId]);
    } else {
      await execute(db, "INSERT OR IGNORE INTO course_bookmarks (course_id, worker_id) VALUES (?, ?)",
        [parseInt(id), body.workerId]);
    }
    return NextResponse.json({ success: true, bookmarked: body.action !== "remove" });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
