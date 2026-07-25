import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface ReferralNode {
  phone: string;
  name: string | null;
  tier: string | null;
  directReferrals: number;
  totalTeamSize: number;
  personalVolume: number;
  teamVolume: number;
  isActive: boolean;
}

export interface ReferralStats {
  totalMembers: number;
  activeMembers: number;
  averageDepth: number;
  topRecruiters: { phone: string; name: string; count: number }[];
  networkGrowth7d: number;
  networkGrowth30d: number;
  atRiskMembers: { phone: string; name: string; daysSinceLastPurchase: number }[];
}

// Simple tree structure computed from referral codes
export async function getReferralTree(phone: string): Promise<ReferralNode[]> {
  const db = await ensureDB();
  try {
    const rows = await query<any>(
      { DB: db },
      `SELECT w.id, w.referred_by, w.name, w.membership_tier, w.is_active,
              p.total_spent,
              (SELECT COUNT(*) FROM workers WHERE referred_by = w.phone) as direct_count
       FROM workers w
       LEFT JOIN profiles p ON p.phone = w.phone
       WHERE w.referred_by = ? OR w.phone = ?
       ORDER BY direct_count DESC`,
      [phone, phone]
    );
    return rows.map((r: any) => ({
      phone: r.phone || r.id,
      name: r.name || null,
      tier: r.membership_tier || null,
      directReferrals: r.direct_count || 0,
      totalTeamSize: 0, // computed recursively if needed
      personalVolume: r.total_spent || 0,
      teamVolume: 0,
      isActive: r.is_active === 1,
    }));
  } catch { return []; }
}

export async function getReferralStats(): Promise<ReferralStats> {
  const db = await ensureDB();
  try {
    const agg = await db.prepare(
      `SELECT
         COUNT(*) as totalMembers,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeMembers,
         AVG(CASE WHEN referred_by IS NOT NULL AND referred_by != '' THEN 1 ELSE 0 END) as avgDepth,
         (SELECT COUNT(*) FROM workers WHERE created_at >= datetime('now', '-7 days')) as growth7d,
         (SELECT COUNT(*) FROM workers WHERE created_at >= datetime('now', '-30 days')) as growth30d
       FROM workers`
    ).first() as any;

    const topRecruiters = await query<any>(
      { DB: db },
      `SELECT w.phone, w.name, COUNT(*) as count
       FROM workers w
       JOIN workers r ON r.referred_by = w.phone
       WHERE w.is_active = 1
       GROUP BY w.phone ORDER BY count DESC LIMIT 10`
    );

    const atRisk = await query<any>(
      { DB: db },
      `SELECT p.phone, w.name,
              CAST(julianday('now') - julianday(COALESCE(
                (SELECT MAX(created_at) FROM resource_purchases WHERE worker_id = p.phone), p.updated_at, p.created_at
              )) AS INTEGER) as daysSinceLastPurchase
       FROM profiles p
       JOIN workers w ON w.phone = p.phone
       WHERE p.total_spent > 0
       HAVING daysSinceLastPurchase > 30
       ORDER BY daysSinceLastPurchase DESC LIMIT 10`
    );

    return {
      totalMembers: agg?.totalMembers || 0,
      activeMembers: agg?.activeMembers || 0,
      averageDepth: agg?.avgDepth || 0,
      topRecruiters: (topRecruiters || []).map((r: any) => ({ phone: r.phone, name: r.name, count: r.count })),
      networkGrowth7d: agg?.growth7d || 0,
      networkGrowth30d: agg?.growth30d || 0,
      atRiskMembers: (atRisk || []).map((r: any) => ({ phone: r.phone, name: r.name, daysSinceLastPurchase: r.daysSinceLastPurchase })),
    };
  } catch {
    return { totalMembers: 0, activeMembers: 0, averageDepth: 0, topRecruiters: [], networkGrowth7d: 0, networkGrowth30d: 0, atRiskMembers: [] };
  }
}

// Find members who joined through this user's network (2+ levels deep)
export async function getNetworkDepth(phone: string, maxDepth: number = 5): Promise<number> {
  const db = await ensureDB();
  const visited = new Set<string>();
  const queue: { phone: string; depth: number }[] = [{ phone, depth: 0 }];
  visited.add(phone);
  let totalNodes = 1;

  while (queue.length > 0) {
    const { phone: current, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;

    try {
      const children = await query<any>(
        { DB: db },
        "SELECT phone FROM workers WHERE referred_by = ?",
        [current]
      );
      for (const child of children) {
        if (!visited.has(child.phone)) {
          visited.add(child.phone);
          totalNodes++;
          queue.push({ phone: child.phone, depth: depth + 1 });
        }
      }
    } catch {}
  }

  return totalNodes;
}

export async function findNetworkGaps(phone: string): Promise<string[]> {
  const db = await ensureDB();
  try {
    const directTeam = await query<any>(
      { DB: db },
      `SELECT w.phone, w.name,
              (SELECT COUNT(*) FROM workers WHERE referred_by = w.phone) as sub_count,
              w.is_active
       FROM workers w
       WHERE w.referred_by = ?
       ORDER BY w.is_active DESC, sub_count DESC`,
      [phone]
    );

    const gaps: string[] = [];
    for (const member of directTeam) {
      // Active member with no referrals — suggest they start building
      if (member.is_active && member.sub_count === 0) {
        gaps.push(`${member.name || member.phone} is active but hasn't started building a team`);
      }
      // Inactive member with high potential
      if (!member.is_active && member.sub_count > 0) {
        gaps.push(`${member.name || member.phone} was building a team but went inactive — needs re-engagement`);
      }
    }
    return gaps;
  } catch { return []; }
}

export function buildReferralIntelligenceContext(
  tree: ReferralNode[],
  stats: ReferralStats,
  gaps: string[],
  networkSize: number,
  lang: string
): string {
  const header = lang === "bn"
    ? "## রেফারেল ইন্টেলিজেন্স\n"
    : "## Referral Intelligence\n";

  const lines: string[] = [header];

  if (stats.totalMembers === 0) {
    lines.push(lang === "bn"
      ? "এখনো কোনো রেফারেল তথ্য নেই।"
      : "No referral data available yet.");
    return lines.join("\n") + "\n";
  }

  lines.push(lang === "bn"
    ? `মোট নেটওয়ার্ক: ${networkSize} জন | সক্রিয়: ${stats.activeMembers} জন`
    : `Total network: ${networkSize} members | Active: ${stats.activeMembers}`);
  lines.push(lang === "bn"
    ? `গত ৭ দিনে গ্রোথ: +${stats.networkGrowth7d} | গত ৩০ দিনে: +${stats.networkGrowth30d}`
    : `Growth: +${stats.networkGrowth7d} (7d) | +${stats.networkGrowth30d} (30d)`);

  // Direct team
  if (tree.length > 1) {
    const direct = tree.filter((n) => n.phone !== phonePlaceholder);
    if (direct.length > 0) {
      lines.push(lang === "bn" ? "\n### সরাসরি টিম" : "\n### Direct Team");
      for (const n of direct) {
        const name = n.name || n.phone;
        const status = lang === "bn" ? (n.isActive ? "সক্রিয়" : "নিষ্ক্রিয়") : (n.isActive ? "Active" : "Inactive");
        const tier = n.tier ? ` (${n.tier})` : "";
        lines.push(`- ${name}${tier} — ${n.directReferrals} refs — ${status}`);
      }
    }
  }

  // Gaps
  if (gaps.length > 0) {
    lines.push(lang === "bn" ? "\n### উন্নতির সুযোগ" : "\n### Opportunities");
    lines.push(...gaps.map((g) => `- ${g}`));
  }

  // At risk
  if (stats.atRiskMembers.length > 0) {
    lines.push(lang === "bn" ? "\n### রিস্কি সদস্য" : "\n### At-Risk Members");
    for (const m of stats.atRiskMembers.slice(0, 3)) {
      const name = m.name || m.phone;
      lines.push(lang === "bn"
        ? `- ${name} — ${m.daysSinceLastPurchase} দিন ধরে নিষ্ক্রিয়`
        : `- ${name} — inactive for ${m.daysSinceLastPurchase} days`);
    }
  }

  return lines.join("\n") + "\n";
}

// Helper to check if we already have the root phone in the tree
const phonePlaceholder = "root";
