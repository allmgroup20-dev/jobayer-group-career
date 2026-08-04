import { queryFirst, query, execute } from "../db/queries";
import { generateId } from "../utils";

interface CommissionLevel {
  levelNumber: number;
  percentage: number;
  fixedAmount: number;
  currency: string;
  isActive?: number;
  minReferralBase?: number;
}

interface CommissionResult {
  levelNumber: number;
  workerId: string;
  percentage: number;
  fixedAmount: number;
  totalAmount: number;
  currency: string;
}

export function calculateCommissions(
  orderAmount: number,
  currency: string,
  sponsorChain: { workerId: string; level: number }[],
  levelSettings: CommissionLevel[]
): CommissionResult[] {
  const results: CommissionResult[] = [];

  for (const sponsor of sponsorChain) {
    const levelSetting = levelSettings.find((l) => l.levelNumber === sponsor.level);
    if (!levelSetting || !levelSetting.percentage) continue;

    const percentageAmount = (orderAmount * levelSetting.percentage) / 100;
    const fixedAmount = levelSetting.fixedAmount || 0;
    const totalAmount = percentageAmount + fixedAmount;
    if (totalAmount <= 0) continue;

    results.push({
      levelNumber: sponsor.level,
      workerId: sponsor.workerId,
      percentage: levelSetting.percentage,
      fixedAmount: levelSetting.fixedAmount,
      totalAmount,
      currency,
    });
  }

  return results;
}

export function calculateLevelCommission(
  orderAmount: number,
  levelNumber: number,
  levelSettings: CommissionLevel[]
): { percentage: number; fixedAmount: number; totalAmount: number } {
  const levelSetting = levelSettings.find((l) => l.levelNumber === levelNumber);
  if (!levelSetting) {
    return { percentage: 0, fixedAmount: 0, totalAmount: 0 };
  }

  const percentageAmount = (orderAmount * (levelSetting.percentage || 0)) / 100;
  const fixedAmount = levelSetting.fixedAmount || 0;

  return {
    percentage: levelSetting.percentage || 0,
    fixedAmount,
    totalAmount: percentageAmount + fixedAmount,
  };
}

export async function distributeCommissions(
  env: { DB: D1Database },
  orderId: string,
  fromWorkerId: string,
  orderAmount: number,
  currency: string,
  sponsorUpline: { workerId: string; level: number }[],
  productId?: number
): Promise<{ success: boolean; distributed: number }> {
  let commissions: CommissionResult[] = [];

  if (productId) {
    const product = await queryFirst<{ enable_commission: number; commission_override: string | null }>(
      env, "SELECT enable_commission, commission_override FROM products WHERE id = ?", [productId]
    );
    if (product) {
      if (!product.enable_commission) return { success: false, distributed: 0 };
      if (product.commission_override) {
        try {
          const override = JSON.parse(product.commission_override) as CommissionLevel[];
          if (override.length > 0) {
            commissions = calculateCommissions(orderAmount, currency, sponsorUpline, override);
          }
        } catch { /* fall through to global levels */ }
      }
    }
  }

  if (commissions.length === 0) {
    const levelSettings = await query<CommissionLevel>(
      env,
      "SELECT level_number as levelNumber, percentage, fixed_amount as fixedAmount, currency, is_active as isActive, min_referral_base as minReferralBase FROM commission_levels WHERE is_active = 1 AND level_number <= 4 ORDER BY level_number ASC"
    );
    if (!levelSettings || levelSettings.length === 0) return { success: false, distributed: 0 };
    commissions = calculateCommissions(orderAmount, currency, sponsorUpline, levelSettings);
  }

  let distributed = 0;
  for (const comm of commissions) {
    if (comm.levelNumber > 4) continue;
    const levelSetting = await queryFirst<CommissionLevel>(
      env, "SELECT min_referral_base as minReferralBase FROM commission_levels WHERE level_number = ? AND is_active = 1", [comm.levelNumber]
    );
    const minBase = levelSetting?.minReferralBase || 0;
    if (minBase > 0) {
      const worker = await queryFirst<{ total_team_members: number }>(
        env, "SELECT total_team_members FROM workers WHERE worker_id = ?", [comm.workerId]
      );
      if (!worker || (worker.total_team_members || 0) < minBase) continue;
    }

    const commissionId = generateId("COM");
    await execute(env,
      `INSERT INTO commissions (commission_id, order_id, from_worker_id, to_worker_id, level_number, percentage, fixed_amount, total_amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [commissionId, orderId, fromWorkerId, comm.workerId, comm.levelNumber, comm.percentage, comm.fixedAmount, comm.totalAmount, currency]
    );
    distributed++;
  }

  return { success: true, distributed };
}
