import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET() {
  try {
    const categories = await query<any>(
      await getDB(),
      `SELECT id, name, name_bn as nameBn, icon, is_visible as isVisible, created_at as createdAt
       FROM course_categories ORDER BY id ASC`
    );
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string; nameBn?: string; icon?: string; isVisible?: number;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await getDB();
    await invalidateCache("courses");
    await execute(db,
      `INSERT INTO course_categories (name, name_bn, icon, is_visible)
       VALUES (?, ?, ?, ?)`,
      [body.name, body.nameBn || null, body.icon || "📌", body.isVisible ?? 1]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
