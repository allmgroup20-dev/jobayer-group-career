import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    const { isApproved } = body;

    if (typeof isApproved !== "number") {
      return NextResponse.json({ error: "isApproved (0/1) required" }, { status: 400 });
    }

    const db = await ensureDB();
    await db.prepare("UPDATE product_reviews SET is_approved = ? WHERE id = ?").bind(isApproved, id).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await ensureDB();
    await db.prepare("DELETE FROM product_reviews WHERE id = ?").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
