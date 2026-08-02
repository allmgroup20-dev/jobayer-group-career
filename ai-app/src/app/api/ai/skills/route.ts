import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute, queryFirst } from "@/lib/db/queries";

interface SkillRow {
  id: number;
  keywords: string;
  question: string;
  answer: string;
  usage_count: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "200");
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = "SELECT * FROM ai_skills WHERE 1=1";
    const params: any[] = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (keywords LIKE ? OR question LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
    const countResult = await query<{ total: number }>(env, countSql, params);
    const total = countResult[0]?.total || 0;

    sql += " ORDER BY usage_count DESC, created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const skills = await query<SkillRow>(env, sql, params);

    const categories = await query<{ category: string }>(env,
      "SELECT DISTINCT category FROM ai_skills ORDER BY category"
    );

    return NextResponse.json({
      skills: skills.map(s => ({
        ...s,
        answerPreview: s.answer.length > 200 ? s.answer.slice(0, 200) + "..." : s.answer,
      })),
      total,
      categories: categories.map(c => c.category),
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const env = await getDB();
    const body = await request.json() as {
      id: number;
      keywords?: string;
      question?: string;
      answer?: string;
      category?: string;
    };
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const existing = await queryFirst<SkillRow>(
      env,
      "SELECT * FROM ai_skills WHERE id = ?",
      [body.id]
    );
    if (!existing) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    if (body.keywords !== undefined) { setClauses.push("keywords = ?"); params.push(body.keywords); }
    if (body.question !== undefined) { setClauses.push("question = ?"); params.push(body.question); }
    if (body.answer !== undefined) { setClauses.push("answer = ?"); params.push(body.answer); }
    if (body.category !== undefined) { setClauses.push("category = ?"); params.push(body.category); }
    setClauses.push("updated_at = datetime('now')");

    if (setClauses.length > 0) {
      params.push(body.id);
      await execute(env, `UPDATE ai_skills SET ${setClauses.join(", ")} WHERE id = ?`, params);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const env = await getDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await execute(env, "DELETE FROM ai_skills WHERE id = ?", [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
