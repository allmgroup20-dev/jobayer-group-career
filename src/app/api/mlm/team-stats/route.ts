import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const cacheKey = `team_stats_${workerId}`;
    const cached = await getCached<any>(cacheKey, 60);
    if (cached) return NextResponse.json(cached);

    const env = await getDB();

    const [levelRows, members, worker, commissionByLevel, totalEarnedRow] = await Promise.all([
      query<any>(
        env,
        "SELECT level_number as levelNumber, level_name as levelName, level_name_bn as levelNameBn, percentage, fixed_amount as fixedAmount, currency, is_active as isActive, COALESCE(commission_type, 'both') as commissionType, COALESCE(min_referral_base, 3) as minReferralBase FROM commission_levels ORDER BY level_number ASC"
      ),
      query<any>(
        env,
        `WITH RECURSIVE subtree AS (
           SELECT worker_id, parent_id FROM mlm_tree WHERE worker_id = ?
           UNION ALL
           SELECT t.worker_id, t.parent_id
           FROM mlm_tree t
           INNER JOIN subtree s ON t.parent_id = s.worker_id
         )
         SELECT w.worker_id, w.level, w.name, w.sponsor_id, w.total_team_members,
                t.parent_id
         FROM workers w
         INNER JOIN mlm_tree t ON t.worker_id = w.worker_id
         WHERE w.membership_status = 'active'
         AND w.worker_id IN (SELECT worker_id FROM subtree)
          ORDER BY w.created_at ASC
          LIMIT 1000`,
         [workerId]
      ),
      query<any>(
        env,
        "SELECT worker_id, level, total_team_members FROM workers WHERE worker_id = ?",
        [workerId],
      ),
      query<any>(
        env,
        "SELECT level_number as levelNumber, COALESCE(SUM(total_amount), 0) as actualIncome FROM commissions WHERE to_worker_id = ? AND status IN ('pending', 'paid') GROUP BY level_number",
        [workerId]
      ),
      query<any>(
        env,
        "SELECT COALESCE(SUM(total_amount), 0) as totalEarned FROM commissions WHERE to_worker_id = ? AND status IN ('pending', 'paid')",
        [workerId]
      ),
    ]);

    const base = levelRows.length > 0 ? (levelRows[0].minReferralBase || 3) : 3;

    const memberMap = new Map<string, any>();
    for (const m of members) {
      memberMap.set(m.worker_id, m);
    }

    const childrenMap = new Map<string, string[]>();
    for (const m of members) {
      if (m.parent_id) {
        if (!childrenMap.has(m.parent_id)) childrenMap.set(m.parent_id, []);
        childrenMap.get(m.parent_id)!.push(m.worker_id);
      }
    }

    function countAtDepth(nodeId: string, targetDepth: number, currentDepth: number): number {
      if (currentDepth > targetDepth) return 0;
      let count = 0;
      if (currentDepth === targetDepth && nodeId !== workerId) count++;
      const children = childrenMap.get(nodeId) || [];
      for (const childId of children) {
        count += countAtDepth(childId, targetDepth, currentDepth + 1);
      }
      return count;
    }

    function countUpToDepth(nodeId: string, maxDepth: number, currentDepth: number): number {
      if (currentDepth > maxDepth) return 0;
      let count = 0;
      if (nodeId !== workerId && currentDepth <= maxDepth) count++;
      const children = childrenMap.get(nodeId) || [];
      for (const childId of children) {
        count += countUpToDepth(childId, maxDepth, currentDepth + 1);
      }
      return count;
    }

    const incomeByLevel = new Map<number, number>();
    for (const row of commissionByLevel) {
      incomeByLevel.set(row.levelNumber, row.actualIncome);
    }
    const totalEarned = totalEarnedRow.length > 0 ? (totalEarnedRow[0].totalEarned || 0) : 0;

    let currentLevel = 0;
    const levels = levelRows.map((r: any) => {
      const n = r.levelNumber;
      const requiredMembers = Math.pow(base, n);
      const actualMembers = countUpToDepth(workerId, n, 0);
      const isUnlocked = actualMembers >= requiredMembers;
      const targetIncome = r.fixedAmount * requiredMembers;
      const actualIncome = incomeByLevel.get(n) || 0;
      if (isUnlocked) currentLevel = n;
      return {
        levelNumber: r.levelNumber,
        levelName: r.levelName,
        levelNameBn: r.levelNameBn || null,
        percentage: r.percentage || 0,
        fixedAmount: r.fixedAmount || 0,
        commissionType: r.commissionType || "both",
        minReferralBase: base,
        requiredMembers,
        actualMembers,
        targetIncome,
        actualIncome,
        isUnlocked,
        progressPct: Math.min(100, Math.round((actualMembers / requiredMembers) * 100)),
      };
    });

    const totalTeam = worker.length > 0 ? worker[0].total_team_members || 0 : 0;

    const result = { levels, minReferralBase: base, totalTeamMembers: totalTeam, totalEarned, currentLevel };
    await setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Team stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
