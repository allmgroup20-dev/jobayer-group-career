import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "1";
    const sql = `SELECT t.*, i.name as institution_name, i.name_bn as institution_name_bn, i.logo_url as institution_logo
       FROM trainers t LEFT JOIN institutions i ON i.id = t.institution_id
       WHERE ${includeInactive ? "1" : "t.is_active = 1"}
       ORDER BY t.sort_order ASC, t.id DESC`;
    const rows = await query<any>(await getDB(), sql);
    const trainers = rows.map(r => ({
      ...r,
      coursesEn: r.courses_en ? JSON.parse(r.courses_en) : [],
      coursesBn: r.courses_bn ? JSON.parse(r.courses_bn) : [],
    }));
    return NextResponse.json({ trainers });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string; nameBn?: string;
      specialtyEn?: string; specialtyBn?: string;
      credentialEn?: string; credentialBn?: string;
      bioEn?: string; bioBn?: string;
      imageUrl?: string; experienceYears?: number;
      institutionId?: number | null; sortOrder?: number;
      coursesEn?: string[]; coursesBn?: string[];
    };
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const db = await getDB();
    await invalidateCache("trainers");
    const result = await execute(db,
      `INSERT INTO trainers (name, name_bn, specialty_en, specialty_bn, credential_en, credential_bn,
        bio_en, bio_bn, image_url, experience_years, institution_id, sort_order, courses_en, courses_bn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name, body.nameBn || null,
        body.specialtyEn || null, body.specialtyBn || null,
        body.credentialEn || null, body.credentialBn || null,
        body.bioEn || null, body.bioBn || null,
        body.imageUrl || null, body.experienceYears ?? 0,
        body.institutionId || null, body.sortOrder ?? 0,
        body.coursesEn ? JSON.stringify(body.coursesEn) : null,
        body.coursesBn ? JSON.stringify(body.coursesBn) : null,
      ]
    );
    return NextResponse.json({ success: true, id: result.meta?.last_row_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
