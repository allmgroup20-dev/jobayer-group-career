import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json() as { ids: number[] };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    const db = await getDB();
    const placeholders = ids.map(() => "?").join(",");
    await execute(db,
      `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`,
      ids
    );
    return NextResponse.json({ success: true, marked: ids.length });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
