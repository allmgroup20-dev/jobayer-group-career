import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { workerId?: string; fileId?: number };

    const db = await getDB();
    await execute(db,
      "INSERT INTO course_downloads (course_id, worker_id, file_id) VALUES (?, ?, ?)",
      [parseInt(id), body.workerId || null, body.fileId || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
