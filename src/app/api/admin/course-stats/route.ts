import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();

    const [totalCourses, totalUnlocks, totalComplaints, totalDownloads, totalRatings] = await Promise.all([
      queryFirst<any>(db, "SELECT COUNT(*) as cnt FROM courses"),
      queryFirst<any>(db, "SELECT COUNT(*) as cnt FROM user_unlocks"),
      queryFirst<any>(db, "SELECT COUNT(*) as cnt FROM complaints"),
      queryFirst<any>(db, "SELECT COUNT(*) as cnt FROM course_downloads"),
      queryFirst<any>(db, "SELECT COUNT(*) as cnt, AVG(rating) as avg FROM course_ratings"),
    ]);

    const pendingComplaints = await queryFirst<any>(db,
      "SELECT COUNT(*) as cnt FROM complaints WHERE status = 'pending'"
    );

    const topUnlocked = await query<any>(db,
      `SELECT c.id, c.title, c.title_bn as titleBn, COUNT(u.id) as unlockCount
       FROM courses c JOIN user_unlocks u ON u.course_id = c.id
       GROUP BY c.id ORDER BY unlockCount DESC LIMIT 5`
    );

    const topDownloaded = await query<any>(db,
      `SELECT c.id, c.title, c.title_bn as titleBn, COUNT(d.id) as downloadCount
       FROM courses c JOIN course_downloads d ON d.course_id = c.id
       GROUP BY c.id ORDER BY downloadCount DESC LIMIT 5`
    );

    const topRated = await query<any>(db,
      `SELECT c.id, c.title, c.title_bn as titleBn, AVG(r.rating) as avgRating, COUNT(r.id) as ratingCount
       FROM courses c JOIN course_ratings r ON r.course_id = c.id
       GROUP BY c.id HAVING ratingCount >= 1 ORDER BY avgRating DESC LIMIT 5`
    );

    const unlocksOverTime = await query<any>(db,
      `SELECT date(unlocked_at) as date, COUNT(*) as count
       FROM user_unlocks WHERE unlocked_at >= datetime('now', '-30 days')
       GROUP BY date(unlocked_at) ORDER BY date ASC`
    );

    return NextResponse.json({
      totalCourses: totalCourses?.cnt || 0,
      totalUnlocks: totalUnlocks?.cnt || 0,
      totalComplaints: totalComplaints?.cnt || 0,
      pendingComplaints: pendingComplaints?.cnt || 0,
      totalDownloads: totalDownloads?.cnt || 0,
      totalRatings: totalRatings?.cnt || 0,
      avgRating: totalRatings?.avg ? Math.round(totalRatings.avg * 10) / 10 : 0,
      topUnlocked,
      topDownloaded,
      topRated,
      unlocksOverTime,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
