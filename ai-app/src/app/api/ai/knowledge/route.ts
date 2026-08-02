import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

interface KnowledgeEntry {
  id: number;
  source: string;
  category: string;
  title: string | null;
  content: string;
  context_data: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "new";
    const category = searchParams.get("category");

    let sql = "SELECT * FROM knowledge_accumulation WHERE status = ?";
    const params: any[] = [status];
    if (category) { sql += " AND category = ?"; params.push(category); }
    sql += " ORDER BY created_at DESC LIMIT 50";

    const entries = await query<KnowledgeEntry>(env, sql, params);
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as { source: string; category?: string; title?: string; content: string; contextData?: any };
    if (!body.source || !body.content) {
      return NextResponse.json({ error: "source and content required" }, { status: 400 });
    }
    const result = await execute(env,
      `INSERT INTO knowledge_accumulation (source, category, title, content, context_data, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [body.source, body.category || "insight", body.title || null, body.content, body.contextData ? JSON.stringify(body.contextData) : null]
    );
    return NextResponse.json({ success: true, id: result?.meta?.last_row_id || 0 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as { id: number; status: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    if (!["new", "kept", "deleted"].includes(body.status)) {
      return NextResponse.json({ error: "status must be new/kept/deleted" }, { status: 400 });
    }
    await execute(env,
      "UPDATE knowledge_accumulation SET status = ?, reviewed_at = datetime('now') WHERE id = ?",
      [body.status, body.id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
