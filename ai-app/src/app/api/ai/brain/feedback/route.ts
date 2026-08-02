import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string;
      rating: number;
      feedback_text?: string;
      intent?: string;
      department?: string;
      model_used?: string;
      processing_ms?: number;
      message_id?: string;
    };

    if (!body.phone || body.rating === undefined) {
      return NextResponse.json({ error: "phone and rating required" }, { status: 400 });
    }
    if (body.rating < 0 || body.rating > 5) {
      return NextResponse.json({ error: "rating must be 0-5" }, { status: 400 });
    }

    const db = await getDB();
    await execute(
      db,
      `INSERT INTO agent_feedback (phone, rating, feedback_text, intent, department, model_used, processing_ms, message_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.phone, body.rating, body.feedback_text || "",
        body.intent || "", body.department || "",
        body.model_used || "", body.processing_ms || 0, body.message_id || "",
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDB();

    const stats = await query<Record<string, number>>(db, `SELECT
      COUNT(*) as total,
      AVG(rating) as avg_rating,
      SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as neutral
    FROM agent_feedback`);

    const byDept = await query<Record<string, any>>(db, `SELECT department, COUNT(*) as count, AVG(rating) as avg_rating FROM agent_feedback WHERE department != '' GROUP BY department ORDER BY count DESC`);

    const byRating = await query<Record<string, any>>(db, `SELECT rating, COUNT(*) as count FROM agent_feedback GROUP BY rating ORDER BY rating DESC`);

    const recent = await query<Record<string, any>>(db, `SELECT phone, rating, feedback_text, intent, department, created_at FROM agent_feedback ORDER BY created_at DESC LIMIT 10`);

    return NextResponse.json({
      stats: stats[0] || { total: 0, avg_rating: 0, positive: 0, negative: 0, neutral: 0 },
      byDepartment: byDept,
      byRating: byRating,
      recent,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load feedback stats" }, { status: 500 });
  }
}
