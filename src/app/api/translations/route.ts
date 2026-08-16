import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { requireCompany } from "@/lib/auth/guard";

export async function GET() {
  try {
    const db = await getDB();
    const rows = await query<{
      translation_key: string;
      en_text: string;
      bn_text: string | null;
      category: string;
      updated_at: string;
    }>(db, "SELECT translation_key, en_text, bn_text, category, updated_at FROM translations ORDER BY translation_key ASC");
    return NextResponse.json({ translations: rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as {
      translationKey: string;
      enText: string;
      bnText?: string;
      category?: string;
    };
    if (!body.translationKey || !body.enText) {
      return NextResponse.json({ error: "translationKey and enText required" }, { status: 400 });
    }

    const db = await getDB();
    const existing = await queryFirst<{ id: number }>(
      db,
      "SELECT id FROM translations WHERE translation_key = ?",
      [body.translationKey]
    );

    if (existing) {
      await execute(
        db,
        "UPDATE translations SET en_text = ?, bn_text = ?, category = ?, updated_at = datetime('now') WHERE id = ?",
        [body.enText, body.bnText ?? null, body.category ?? "general", existing.id]
      );
    } else {
      await execute(
        db,
        "INSERT INTO translations (translation_key, en_text, bn_text, category, updated_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [body.translationKey, body.enText, body.bnText ?? null, body.category ?? "general"]
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { translationKey: string };
    if (!body.translationKey) {
      return NextResponse.json({ error: "translationKey required" }, { status: 400 });
    }
    const db = await getDB();
    await execute(db, "DELETE FROM translations WHERE translation_key = ?", [body.translationKey]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}