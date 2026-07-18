import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const cacheKey = `income_progress_${workerId}`;
    const cached = await getCached<any>(cacheKey, 60);
    if (cached) return NextResponse.json(cached);

    const env = await getDB();

    const avgOrder = await queryFirst<{ a: number }>(
      env, "SELECT COALESCE(AVG(total_amount), 500) as a FROM orders WHERE payment_status = 'completed'"
    );
    const avgOrderAmount = avgOrder?.a || 500;

    const [levelRows, allCommissions, worker] = await Promise.all([
      query<any>(
        env,
        "SELECT level_number as levelNumber, level_name as levelName, level_name_bn as levelNameBn, percentage, fixed_amount as fixedAmount, currency, is_active as isActive, COALESCE(commission_type, 'both') as commissionType, COALESCE(min_referral_base, 3) as minReferralBase FROM commission_levels ORDER BY level_number ASC"
      ),
      query<any>(
        env,
        `SELECT level_number as levelNumber, COALESCE(SUM(total_amount), 0) as totalEarned
         FROM commissions WHERE to_worker_id = ? AND status = 'paid'
         GROUP BY level_number`,
        [workerId]
      ),
      query<any>(
        env,
        "SELECT worker_id, level, total_team_members, total_earned FROM workers WHERE worker_id = ?",
        [workerId],
      ),
    ]);

    const earnedByLevel = new Map<number, number>();
    for (const c of allCommissions) {
      earnedByLevel.set(c.levelNumber, c.totalEarned);
    }

    const base = levelRows.length > 0 ? (levelRows[0].minReferralBase || 3) : 3;

    const levels = levelRows.map((r: any) => {
      const n = r.levelNumber;
      const requiredMembers = Math.pow(base, n);
      const commissionPerPerson = (r.percentage / 100) * avgOrderAmount + (r.fixedAmount || 0);
      const targetIncome = Math.round(requiredMembers * commissionPerPerson);
      const actualIncome = earnedByLevel.get(n) || 0;
      const isUnlocked = actualIncome >= targetIncome;

      return {
        levelNumber: r.levelNumber,
        levelName: r.levelName,
        levelNameBn: r.levelNameBn || null,
        percentage: r.percentage || 0,
        fixedAmount: r.fixedAmount || 0,
        commissionType: r.commissionType || "both",
        minReferralBase: base,
        requiredMembers,
        targetIncome,
        actualIncome,
        isUnlocked,
        progressPct: Math.min(100, targetIncome > 0 ? Math.round((actualIncome / targetIncome) * 100) : 100),
      };
    });

    const totalTeam = worker.length > 0 ? worker[0].total_team_members || 0 : 0;
    const totalEarned = worker.length > 0 ? worker[0].total_earned || 0 : 0;

    const currentLevelIndex = levels.findIndex((l: any) => !l.isUnlocked);
    const currentLevel = currentLevelIndex >= 0
      ? levels[currentLevelIndex].levelNumber
      : levels.length > 0 ? levels[levels.length - 1].levelNumber : 1;

    const result = {
      levels,
      minReferralBase: base,
      totalTeamMembers: totalTeam,
      totalEarned,
      avgOrderAmount,
      currentLevel,
    };

    await setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Income progress error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
