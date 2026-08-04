import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

// Top referrers by team size (excludes test accounts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    const env = await getDB();

    const top = await query<{ worker_id: string; name: string; total_team_members: number }>(
      env,
      "SELECT worker_id, name, total_team_members FROM workers WHERE COALESCE(is_test_account, 0) != 1 ORDER BY total_team_members DESC, name ASC LIMIT 20"
    );

    let myRank: number | null = null;
    let myTeamSize = 0;
    if (workerId) {
      const me = await queryFirst<{ total_team_members: number }>(
        env, "SELECT total_team_members FROM workers WHERE worker_id = ?", [workerId]
      );
      if (me) {
        myTeamSize = me.total_team_members || 0;
        const ahead = await queryFirst<{ c: number }>(
          env,
          "SELECT COUNT(*) AS c FROM workers WHERE COALESCE(is_test_account, 0) != 1 AND total_team_members > ?",
          [myTeamSize]
        );
        myRank = (ahead?.c || 0) + 1;
      }
    }

    return NextResponse.json({
      leaderboard: top.map((t, i) => ({
        rank: i + 1,
        workerId: t.worker_id,
        name: t.name,
        teamSize: t.total_team_members || 0,
      })),
      myRank,
      myTeamSize,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}