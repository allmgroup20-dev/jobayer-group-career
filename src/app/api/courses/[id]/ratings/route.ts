import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();

    const agg = await queryFirst<any>(db,
      `SELECT COUNT(*) as count, AVG(rating) as avgRating,
              SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five,
              SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four,
              SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three,
              SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two,
              SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one
       FROM course_ratings WHERE course_id = ?`,
      [parseInt(id)]
    );

    const reviews = await query<any>(db,
      `SELECT r.id, r.rating, r.review, r.created_at as createdAt, r.worker_id as workerId
       FROM course_ratings r WHERE r.course_id = ? AND r.review IS NOT NULL AND r.review != ''
       ORDER BY r.created_at DESC LIMIT 20`,
      [parseInt(id)]
    );

    return NextResponse.json({
      count: agg?.count || 0,
      avgRating: agg?.avgRating ? Math.round(agg.avgRating * 10) / 10 : 0,
      distribution: { 5: agg?.five || 0, 4: agg?.four || 0, 3: agg?.three || 0, 2: agg?.two || 0, 1: agg?.one || 0 },
      reviews,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { workerId: string; rating: number; review?: string };
    if (!body.workerId || !body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "workerId and rating (1-5) required" }, { status: 400 });
    }

    const db = await getDB();

    const existing = await queryFirst<any>(db,
      "SELECT id FROM course_ratings WHERE course_id = ? AND worker_id = ?",
      [parseInt(id), body.workerId]
    );

    if (existing) {
      await execute(db,
        "UPDATE course_ratings SET rating = ?, review = COALESCE(?, review) WHERE id = ?",
        [body.rating, body.review || null, existing.id]
      );
    } else {
      await execute(db,
        "INSERT INTO course_ratings (course_id, worker_id, rating, review) VALUES (?, ?, ?, ?)",
        [parseInt(id), body.workerId, body.rating, body.review || null]
      );
    }

    return NextResponse.json({ success: true, updated: !!existing }, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
