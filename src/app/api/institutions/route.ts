import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "1";
    const sql = `SELECT * FROM institutions WHERE ${includeInactive ? "1" : "is_active = 1"} ORDER BY sort_order ASC, id DESC`;
    const institutions = await query<any>(await getDB(), sql);
    return NextResponse.json({ institutions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string; nameBn?: string; logoUrl?: string;
      descriptionEn?: string; descriptionBn?: string;
      websiteUrl?: string; sortOrder?: number;
    };
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const db = await getDB();
    await invalidateCache("institutions");
    await execute(db,
      `INSERT INTO institutions (name, name_bn, logo_url, description_en, description_bn, website_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body.name, body.nameBn || null, body.logoUrl || null,
        body.descriptionEn || null, body.descriptionBn || null,
        body.websiteUrl || null, body.sortOrder ?? 0]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
