import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const trainer = await queryFirst<any>(await getDB(),
      `SELECT t.*, i.name as institution_name, i.name_bn as institution_name_bn, i.logo_url as institution_logo
       FROM trainers t LEFT JOIN institutions i ON i.id = t.institution_id WHERE t.id = ?`,
      [parseInt(id)]
    );
    if (!trainer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...trainer,
      coursesEn: trainer.courses_en ? JSON.parse(trainer.courses_en) : [],
      coursesBn: trainer.courses_bn ? JSON.parse(trainer.courses_bn) : [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json() as Record<string, any>;
    const db = await getDB();
    const existing = await queryFirst<any>(db, "SELECT id FROM trainers WHERE id = ?", [parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updates: string[] = [];
    const vals: unknown[] = [];
    const fields = ["name", "name_bn", "specialty_en", "specialty_bn", "credential_en", "credential_bn",
      "bio_en", "bio_bn", "image_url", "experience_years", "institution_id", "sort_order", "is_active",
      "courses_en", "courses_bn"];
    for (const f of fields) {
      if (body[f] !== undefined) {
        if (f === "courses_en" || f === "courses_bn") {
          updates.push(`${f} = ?`);
          vals.push(JSON.stringify(body[f]));
        } else {
          updates.push(`${f} = ?`);
          vals.push(body[f]);
        }
      }
    }
    if (updates.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    updates.push("updated_at = datetime('now')");
    vals.push(parseInt(id));
    await invalidateCache("trainers");
    await execute(db, `UPDATE trainers SET ${updates.join(", ")} WHERE id = ?`, vals);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDB();
    await invalidateCache("trainers");
    await execute(db, "DELETE FROM trainers WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
