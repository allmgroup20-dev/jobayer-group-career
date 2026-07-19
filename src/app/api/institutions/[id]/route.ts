import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const inst = await queryFirst<any>(await getDB(), "SELECT * FROM institutions WHERE id = ?", [parseInt(id)]);
    if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(inst);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json() as Record<string, any>;
    const db = await getDB();
    const existing = await queryFirst<any>(db, "SELECT id FROM institutions WHERE id = ?", [parseInt(id)]);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updates: string[] = [];
    const vals: unknown[] = [];
    const fields = ["name", "name_bn", "logo_url", "description_en", "description_bn", "website_url", "sort_order", "is_active"];
    for (const f of fields) {
      if (body[f] !== undefined) { updates.push(`${f} = ?`); vals.push(body[f]); }
    }
    if (updates.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    updates.push("updated_at = datetime('now')");
    vals.push(parseInt(id));
    await invalidateCache("institutions");
    await execute(db, `UPDATE institutions SET ${updates.join(", ")} WHERE id = ?`, vals);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDB();
    await invalidateCache("institutions");
    await execute(db, "UPDATE trainers SET institution_id = NULL WHERE institution_id = ?", [parseInt(id)]);
    await execute(db, "DELETE FROM institutions WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
