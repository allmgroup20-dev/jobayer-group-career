import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const env = await getDB();
    const templates = await query(env,
      "SELECT id, name, content, category, variables, usage_count, created_at, updated_at FROM wa_templates ORDER BY usage_count DESC, category ASC LIMIT 200"
    );
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load templates"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, content, category, variables, action, templateId } = await request.json() as {
      name?: string; content?: string; category?: string; variables?: string; action?: string; templateId?: number;
    };

    const env = await getDB();

    if (action === "delete" && templateId) {
      await execute(env, "DELETE FROM wa_templates WHERE id = ?", [templateId]);
      return NextResponse.json({ deleted: true });
    }

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content required" }, { status: 400 });
    }

    await execute(env,
      `INSERT INTO wa_templates (name, content, category, variables, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(name) DO UPDATE SET content=excluded.content, category=COALESCE(excluded.category,category), variables=COALESCE(excluded.variables,variables), updated_at=datetime('now')`,
      [name, content, category || "general", variables || null]
    );

    return NextResponse.json({ created: true, name });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Template action failed"
    }, { status: 500 });
  }
}
