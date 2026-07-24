import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface TeamMemberPerf {
  phone: string;
  name: string;
  tier: string;
  directReferrals: number;
  teamSize: number;
  personalVolume: number;
  teamVolume: number;
  commission: number;
  isActive: boolean;
  joinedAt: string;
  lastPurchase: string | null;
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  totalPersonalVolume: number;
  totalTeamVolume: number;
  totalCommission: number;
  avgTeamSize: number;
  avgPersonalVolume: number;
  growthRate7d: number;
  growthRate30d: number;
  topPerformers: TeamMemberPerf[];
  atRiskMembers: TeamMemberPerf[];
}

export interface TeamHierarchyNode {
  phone: string;
  name: string;
  tier: string;
  volume: number;
  children: TeamHierarchyNode[];
}

export interface TeamTrend {
  date: string;
  newMembers: number;
  volume: number;
  commission: number;
}

export async function ensureTeamPerfTables(): Promise<void> {
  const db = await ensureDB();
  await db.prepare(`CREATE TABLE IF NOT EXISTS team_perf_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL,
    total_team_size INTEGER DEFAULT 0, active_team_size INTEGER DEFAULT 0,
    personal_volume REAL DEFAULT 0, team_volume REAL DEFAULT 0,
    total_commission REAL DEFAULT 0, new_members_7d INTEGER DEFAULT 0,
    new_members_30d INTEGER DEFAULT 0,
    snapshot_date TEXT DEFAULT (date('now'))
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS team_daily_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL,
    record_date TEXT NOT NULL, new_members INTEGER DEFAULT 0,
    volume REAL DEFAULT 0, commission REAL DEFAULT 0,
    UNIQUE(phone, record_date)
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_team_perf_phone ON team_perf_snapshots(phone)").run().catch(() => {});
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_team_trends_date ON team_daily_trends(record_date)").run().catch(() => {});
}

// Recursively count team size
async function countTeam(phone: string, visited: Set<string> = new Set()): Promise<{ total: number; active: number; volume: number }> {
  if (visited.has(phone)) return { total: 0, active: 0, volume: 0 };
  visited.add(phone);

  const db = await ensureDB();
  const direct = await query<any>(
    { DB: db },
    `SELECT w.phone, w.is_active, COALESCE(p.total_spent, 0) as volume
     FROM workers w LEFT JOIN profiles p ON p.phone = w.phone
     WHERE w.referred_by = ?`,
    [phone]
  );

  let total = direct.length;
  let active = direct.filter((d: any) => d.is_active === 1).length;
  let volume = direct.reduce((s: number, d: any) => s + d.volume, 0);

  for (const d of direct) {
    const sub = await countTeam(d.phone, visited);
    total += sub.total;
    active += sub.active;
    volume += sub.volume;
  }

  return { total, active, volume };
}

export async function getTeamMetrics(phone: string): Promise<TeamMetrics> {
  const db = await ensureDB();
  const team = await countTeam(phone);
  const profile = await db.prepare(
    "SELECT total_spent FROM profiles WHERE phone = ?"
  ).bind(phone).first() as any;
  const personalVolume = profile?.total_spent || 0;

  // Commission earned from team
  const commissions = await query<any>(
    { DB: db },
    `SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE to_worker_id = ? AND status = 'paid'`,
    [phone]
  );
  const totalCommission = commissions[0]?.total || 0;

  // Growth rates
  const growth7d = await db.prepare(
    "SELECT COUNT(*) as cnt FROM workers WHERE referred_by IN (SELECT phone FROM workers WHERE referred_by = ?) AND created_at >= datetime('now', '-7 days')"
  ).bind(phone).first() as any;
  const growth30d = await db.prepare(
    "SELECT COUNT(*) as cnt FROM workers WHERE referred_by IN (SELECT phone FROM workers WHERE referred_by = ?) AND created_at >= datetime('now', '-30 days')"
  ).bind(phone).first() as any;

  // Top performers (direct team sorted by volume)
  const topPerformers = await query<any>(
    { DB: db },
    `SELECT w.phone, w.name, w.membership_tier, w.is_active,
            COALESCE(p.total_spent, 0) as volume,
            (SELECT COUNT(*) FROM workers WHERE referred_by = w.phone) as team_size,
            (SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE to_worker_id = w.phone AND status = 'paid') as commission
     FROM workers w LEFT JOIN profiles p ON p.phone = w.phone
     WHERE w.referred_by = ? ORDER BY volume DESC LIMIT 10`,
    [phone]
  );

  // At-risk (inactive >14 days, previously active)
  const atRisk = await query<any>(
    { DB: db },
    `SELECT w.phone, w.name, w.membership_tier, w.is_active,
            COALESCE(p.total_spent, 0) as volume,
            (SELECT COUNT(*) FROM workers WHERE referred_by = w.phone) as team_size,
            CAST(julianday('now') - julianday(COALESCE(p.updated_at, p.created_at, '2024-01-01')) AS INTEGER) as days_inactive
     FROM workers w LEFT JOIN profiles p ON p.phone = w.phone
     WHERE w.referred_by = ? AND w.is_active = 0 AND p.total_spent > 0
     ORDER BY days_inactive DESC LIMIT 10`,
    [phone]
  );

  return {
    totalMembers: team.total,
    activeMembers: team.active,
    totalPersonalVolume: personalVolume,
    totalTeamVolume: team.volume,
    totalCommission,
    avgTeamSize: Math.round(team.total / Math.max(1, team.total)),
    avgPersonalVolume: team.total > 0 ? Math.round(team.volume / team.total) : 0,
    growthRate7d: growth7d?.cnt || 0,
    growthRate30d: growth30d?.cnt || 0,
    topPerformers: topPerformers.map((r: any) => ({
      phone: r.phone, name: r.name || r.phone, tier: r.membership_tier || "general",
      directReferrals: 0, teamSize: r.team_size || 0,
      personalVolume: r.volume || 0, teamVolume: 0,
      commission: r.commission || 0, isActive: r.is_active === 1,
      joinedAt: "", lastPurchase: null,
    })),
    atRiskMembers: atRisk.map((r: any) => ({
      phone: r.phone, name: r.name || r.phone, tier: r.membership_tier || "general",
      directReferrals: 0, teamSize: r.team_size || 0,
      personalVolume: r.volume || 0, teamVolume: 0,
      commission: 0, isActive: false,
      joinedAt: "", lastPurchase: null,
    })),
  };
}

export async function getTeamHierarchy(phone: string, depth: number = 3): Promise<TeamHierarchyNode> {
  const db = await ensureDB();
  const profile = await db.prepare(
    "SELECT w.name, w.membership_tier, COALESCE(p.total_spent, 0) as volume FROM workers w LEFT JOIN profiles p ON p.phone = w.phone WHERE w.phone = ?"
  ).bind(phone).first() as any;

  const root: TeamHierarchyNode = {
    phone,
    name: profile?.name || phone,
    tier: profile?.membership_tier || "general",
    volume: profile?.volume || 0,
    children: [],
  };

  async function buildLevel(parent: TeamHierarchyNode, currentDepth: number) {
    if (currentDepth >= depth) return;
    const children = await query<any>(
      { DB: db },
      `SELECT w.phone, w.name, w.membership_tier, COALESCE(p.total_spent, 0) as volume
       FROM workers w LEFT JOIN profiles p ON p.phone = w.phone
       WHERE w.referred_by = ? ORDER BY volume DESC LIMIT 20`,
      [parent.phone]
    );
    for (const c of children) {
      const node: TeamHierarchyNode = {
        phone: c.phone, name: c.name || c.phone,
        tier: c.membership_tier || "general",
        volume: c.volume || 0, children: [],
      };
      parent.children.push(node);
      await buildLevel(node, currentDepth + 1);
    }
  }

  await buildLevel(root, 1);
  return root;
}

export async function getDailyTrends(phone: string, days: number = 30): Promise<TeamTrend[]> {
  const db = await ensureDB();
  return await query<any>(
    { DB: db },
    `SELECT record_date as date, new_members, volume, commission
     FROM team_daily_trends WHERE phone = ?
     AND record_date >= date('now', ?) ORDER BY record_date ASC`,
    [phone, `-${days} days`]
  );
}

// Snapshot team perf for a user (call this daily via cron)
export async function snapshotTeamPerf(phone: string): Promise<void> {
  const db = await ensureDB();
  const metrics = await getTeamMetrics(phone);
  const directTeam = await query<any>(
    { DB: db },
    "SELECT COUNT(*) as cnt FROM workers WHERE referred_by = ? AND created_at >= datetime('now', '-7 days')",
    [phone]
  );
  const directTeam30d = await query<any>(
    { DB: db },
    "SELECT COUNT(*) as cnt FROM workers WHERE referred_by = ? AND created_at >= datetime('now', '-30 days')",
    [phone]
  );

  await db.prepare(
    `INSERT INTO team_perf_snapshots (phone, total_team_size, active_team_size, personal_volume, team_volume, total_commission, new_members_7d, new_members_30d)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(phone, metrics.totalMembers, metrics.activeMembers,
    metrics.totalPersonalVolume, metrics.totalTeamVolume,
    metrics.totalCommission, directTeam[0]?.cnt || 0,
    directTeam30d[0]?.cnt || 0
  ).run();

  // Daily trend
  await db.prepare(
    `INSERT INTO team_daily_trends (phone, record_date, new_members, volume, commission)
     VALUES (?, date('now'), ?, ?, ?)
     ON CONFLICT(phone, record_date) DO UPDATE SET
       new_members = new_members + ?, volume = volume + ?, commission = commission + ?`
  ).bind(phone,
    directTeam[0]?.cnt || 0, metrics.totalTeamVolume, metrics.totalCommission,
    directTeam[0]?.cnt || 0, metrics.totalTeamVolume, metrics.totalCommission
  ).run();
}

export async function getLeaderboard(limit: number = 20): Promise<TeamMemberPerf[]> {
  const db = await ensureDB();
  const rows = await query<any>(
    { DB: db },
    `SELECT w.phone, w.name, w.membership_tier, w.is_active, w.created_at as joined_at,
            COALESCE(p.total_spent, 0) as volume,
            (SELECT COUNT(*) FROM workers WHERE referred_by = w.phone) as team_size,
            (SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE to_worker_id = w.phone AND status = 'paid') as commission
     FROM workers w LEFT JOIN profiles p ON p.phone = w.phone
     WHERE w.is_active = 1
     ORDER BY team_size DESC, volume DESC LIMIT ?`,
    [limit]
  );
  return rows.map((r: any) => ({
    phone: r.phone, name: r.name || r.phone, tier: r.membership_tier || "general",
    directReferrals: r.team_size || 0, teamSize: r.team_size || 0,
    personalVolume: r.volume || 0, teamVolume: 0,
    commission: r.commission || 0, isActive: r.is_active === 1,
    joinedAt: r.joined_at || "", lastPurchase: null,
  }));
}

export function buildTeamPerfContext(metrics: TeamMetrics, lang: string): string {
  const lines: string[] = [lang === "bn" ? "## টিম পারফরম্যান্স\n" : "## Team Performance\n"];

  lines.push(lang === "bn"
    ? `মোট সদস্য: ${metrics.totalMembers} | সক্রিয়: ${metrics.activeMembers}`
    : `Total team: ${metrics.totalMembers} | Active: ${metrics.activeMembers}`);
  lines.push(lang === "bn"
    ? `ব্যক্তিগত ভলিউম: ৳${metrics.totalPersonalVolume} | টিম ভলিউম: ৳${metrics.totalTeamVolume}`
    : `Personal volume: ৳${metrics.totalPersonalVolume} | Team volume: ৳${metrics.totalTeamVolume}`);
  lines.push(lang === "bn"
    ? `মোট কমিশন: ৳${metrics.totalCommission} | গ্রোথ (৭ দিন): +${metrics.growthRate7d}`
    : `Total commission: ৳${metrics.totalCommission} | Growth (7d): +${metrics.growthRate7d}`);

  if (metrics.topPerformers.length > 0) {
    lines.push(lang === "bn" ? "\n### শীর্ষ পারফর্মার" : "\n### Top Performers");
    for (const p of metrics.topPerformers.slice(0, 5)) {
      lines.push(`- ${p.name}: ৳${p.personalVolume} (টিম: ${p.teamSize})`);
    }
  }

  if (metrics.atRiskMembers.length > 0) {
    lines.push(lang === "bn" ? "\n### ঝুঁকিপূর্ণ সদস্য" : "\n### At-Risk Members");
    for (const m of metrics.atRiskMembers.slice(0, 3)) {
      lines.push(`- ${m.name}`);
    }
  }

  return lines.join("\n") + "\n";
}
