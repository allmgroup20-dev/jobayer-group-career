import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "courses:categories";
    const cached = await getCached<any[]>(cacheKey, 600);
    if (cached) {
      const resp = NextResponse.json({ categories: cached });
      resp.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
      return resp;
    }

    const categories = await query<any>(
      await getDB(),
      `SELECT id, name, name_bn as nameBn, icon, is_visible as isVisible, sort_order as sortOrder, parent_id as parentId, created_at as createdAt
       FROM course_categories ORDER BY sort_order ASC, id ASC`
    );

    await setCached(cacheKey, categories);
    const resp = NextResponse.json({ categories });
    resp.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return resp;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string; nameBn?: string; icon?: string; isVisible?: number; sortOrder?: number; parentId?: number | null;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await getDB();
    await invalidateCache("courses");
    await execute(db,
      `INSERT INTO course_categories (name, name_bn, icon, is_visible, sort_order, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [body.name, body.nameBn || null, body.icon || "📌", body.isVisible ?? 1, body.sortOrder ?? 0, body.parentId ?? null]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
