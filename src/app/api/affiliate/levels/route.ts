import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

interface LevelRow {
  levelNumber: number;
  levelName: string;
  percentage: number;
  fixedAmount: number;
  currency: string;
  isActive: number;
  commissionType?: string;
  minReferralBase?: number;
}

export async function GET() {
  const cached = await getCached<{ levels: any[]; minReferralBase: number }>("affiliate_levels", 60);
  if (cached) return NextResponse.json(cached);

  try {
    const db = await getDB();

    const rows = await query<any>(
      db,
      "SELECT level_number as levelNumber, level_name as levelName, level_name_bn as levelNameBn, percentage, fixed_amount as fixedAmount, currency, is_active as isActive, COALESCE(commission_type, 'both') as commissionType, COALESCE(min_referral_base, 3) as minReferralBase FROM commission_levels ORDER BY level_number ASC"
    );

    const base = rows.length > 0 ? (rows[0].minReferralBase || 3) : 3;

    const levels = rows.map((r: any) => {
      const n = r.levelNumber;
      const referrals = Math.pow(base, n);
      const ct = r.commissionType || "both";
      const perPersonFixed = (ct === "fixed" || ct === "both") ? (r.fixedAmount || 0) : 0;
      const potentialIncome = referrals * perPersonFixed;
      return {
        levelNumber: r.levelNumber,
        levelName: r.levelName,
        levelNameBn: r.levelNameBn || null,
        percentage: r.percentage || 0,
        fixedAmount: r.fixedAmount || 0,
        commissionType: ct,
        minReferralBase: base,
        referrals,
        potentialIncome,
      };
    });

    const result = { levels, minReferralBase: base };
    await setCached("affiliate_levels", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      levels: {
        levelNumber: number;
        levelName: string;
        levelNameBn?: string | null;
        percentage: number;
        fixedAmount: number;
        commissionType: string;
      }[];
      minReferralBase?: number;
    };

    await invalidateCache("affiliate_levels");
    const { levels, minReferralBase } = body;

    if (!levels || !Array.isArray(levels)) {
      return NextResponse.json({ error: "Invalid levels data" }, { status: 400 });
    }

    const base = typeof minReferralBase === "number" && minReferralBase > 0 ? minReferralBase : 3;
    const db = await getDB();

    await execute(db, "DELETE FROM commission_levels");

    for (const l of levels) {
      const ct = l.commissionType || "both";
      await execute(
        db,
        `INSERT INTO commission_levels (level_number, level_name, level_name_bn, percentage, fixed_amount, currency, is_active, commission_type, min_referral_base)
         VALUES (?, ?, ?, ?, ?, 'BDT', 1, ?, ?)`,
        [l.levelNumber, l.levelName, l.levelNameBn || null, l.percentage || 0, l.fixedAmount || 0, ct, base]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
