import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const members = await query(
      await getDB(),
      `SELECT w.worker_id, w.name, w.phone, w.level, w.join_date, 
              w.total_team_members, t.parent_id
       FROM workers w 
       INNER JOIN mlm_tree t ON w.worker_id = t.worker_id 
       WHERE w.membership_status = 'active'
        ORDER BY t.level_number ASC
        LIMIT 1000`,
      []
    );

    return NextResponse.json({ members, total: members.length });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
