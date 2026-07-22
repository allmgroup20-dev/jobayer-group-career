import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";

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

    // Total count
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
    const countResult = await query<{ total: number }>(env, countSql, params);
    const total = countResult[0]?.total || 0;

    sql += " ORDER BY usage_count DESC, created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const skills = await query<SkillRow>(env, sql, params);

    // Get all categories for filter
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
