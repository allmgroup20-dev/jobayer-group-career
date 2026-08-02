import { NextRequest, NextResponse } from "next/server";
import { addKnowledgeEntry, searchKnowledge, getKnowledgeByCategory } from "@/lib/ai/knowledge-brain";
import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const id = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (id) {
      const db = await ensureDB();
      const rows = await query(
        { DB: db },
        "SELECT id, category, subcategory, title, content, source_type, source_name, source_url, confidence, tags, version, created_at, updated_at FROM knowledge_entries WHERE id = ? AND is_active = 1",
        [id]
      );
      return NextResponse.json({ entry: rows[0] || null });
    }

    if (q) {
      const results = await searchKnowledge(q, { category: category || undefined, limit });
      return NextResponse.json({ entries: results });
    }

    if (category) {
      const results = await getKnowledgeByCategory(category, limit);
      return NextResponse.json({ entries: results });
    }

    const db = await ensureDB();
    const all = await query(
      { DB: db },
      "SELECT id, category, subcategory, title, content, source_type, source_name, source_url, confidence, tags, version, created_at, updated_at FROM knowledge_entries WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    return NextResponse.json({ entries: all });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    if (!body.category || !body.title || !body.content) {
      return NextResponse.json({ error: "category, title, content are required" }, { status: 400 });
    }
    const id = await addKnowledgeEntry({
      category: body.category,
      subcategory: body.subcategory,
      title: body.title,
      content: body.content,
      sourceType: body.sourceType,
      sourceName: body.sourceName,
      sourceUrl: body.sourceUrl,
      confidence: body.confidence,
      tags: body.tags,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: any = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = await ensureDB();
    const sets: string[] = [];
    const params: any[] = [];
    for (const field of ["category", "subcategory", "title", "content", "source_type", "source_name", "source_url", "tags", "confidence"]) {
      if (body[field] !== undefined) {
        sets.push(`${field} = ?`);
        params.push(field === "tags" && Array.isArray(body[field]) ? JSON.stringify(body[field]) : body[field]);
      }
    }
    if (body.isActive !== undefined) {
      sets.push("is_active = ?");
      params.push(body.isActive ? 1 : 0);
    }
    if (sets.length === 0) return NextResponse.json({ error: "no fields to update" }, { status: 400 });
    sets.push("version = version + 1", "updated_at = datetime('now')");
    params.push(id);
    await execute({ DB: db }, `UPDATE knowledge_entries SET ${sets.join(", ")} WHERE id = ?`, params);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = await ensureDB();
    await execute({ DB: db }, "UPDATE knowledge_entries SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
