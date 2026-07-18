import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId is required" }, { status: 400 });
    }

    const env = (request as any).env as Env;
    if (!env?.DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Run all queries in parallel
    const [profileResult, commissionsResult, teamResult, settingsResult, accountsResult, analyticsResult] =
      await Promise.allSettled([
        env.DB.prepare(
          "SELECT worker_id, name, phone, email, avatar_url, sponsor_id, sponsor_name, level, join_date, currency, balance, total_earned, total_spent, total_team_members, membership_status, preferred_language, age_group, occupation, education_level, gender, country, city, goal, preferred_learning_time, referral_source, communication_preference, budget_range, religion, demo_bonus, demo_bonus_original FROM workers WHERE worker_id = ?"
        ).bind(workerId).first(),
        env.DB.prepare(
          "SELECT COUNT(*) as total_commissions, COALESCE(SUM(total_amount), 0) as total_earned, COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount FROM commissions WHERE to_worker_id = ?"
        ).bind(workerId).first(),
        env.DB.prepare(
          "SELECT w.worker_id, w.name, w.level, w.sponsor_id, w.total_team_members, t.parent_id FROM workers w LEFT JOIN mlm_tree t ON t.worker_id = w.worker_id WHERE w.membership_status = 'active' ORDER BY w.created_at ASC LIMIT 2000"
        ).all(),
        env.DB.prepare(
          "SELECT setting_key, setting_value FROM company_settings WHERE setting_key IN ('min_withdrawal', 'min_withdrawal_premium', 'demo_bonus_enabled', 'demo_bonus_deduction_percent', 'payment_system_active', 'nagad_recommended', 'channels_paused')"
        ).all(),
        env.DB.prepare(
          "SELECT id, account_type, account_number, account_name, is_default FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, created_at ASC"
        ).bind(workerId).all(),
        env.DB.prepare(
          "SELECT COUNT(*) as total_views, COUNT(DISTINCT session_id) as total_sessions FROM user_events WHERE worker_id = ? AND event_type = 'page_view'"
        ).bind(workerId).first(),
      ]);

    // Process settings into key-value map
    const settingsMap: Record<string, string> = {};
    if (settingsResult.status === "fulfilled" && settingsResult.value) {
      for (const row of (settingsResult.value as any).results || []) {
        settingsMap[row.setting_key as string] = row.setting_value as string;
      }
    }

    // Process MLM team stats
    let teamLevels: any[] = [];
    let actualMembers: Record<number, number> = {};
    if (teamResult.status === "fulfilled" && teamResult.value) {
      const rows = (teamResult.value as any).results || [];
      const childrenMap: Record<string, string[]> = {};
      for (const row of rows) {
        const wid = row.worker_id as string;
        const pid = (row.parent_id as string) || "";
        if (pid) {
          if (!childrenMap[pid]) childrenMap[pid] = [];
          childrenMap[pid].push(wid);
        }
      }
      function countDepth(nodeId: string, targetLevel: number, currentLevel: number): number {
        if (currentLevel === targetLevel) return 1;
        const children = childrenMap[nodeId] || [];
        return children.reduce((sum, c) => sum + countDepth(c, targetLevel, currentLevel + 1), 0);
      }
      const levelResult = await env.DB.prepare(
        "SELECT level_number, level_name, level_name_bn, percentage, fixed_amount, currency, is_active FROM commission_levels ORDER BY level_number ASC"
      ).all();
      const levels = (levelResult as any).results || [];
      teamLevels = levels.map((l: any) => {
        const ln = l.level_number as number;
        const required = Math.pow(3, ln - 1);
        const actual = countDepth(workerId, ln, 0);
        return {
          levelNumber: ln,
          levelName: l.level_name,
          levelNameBn: l.level_name_bn,
          percentage: l.percentage,
          fixedAmount: l.fixed_amount,
          requiredMembers: required,
          actualMembers: ln === 1 ? 1 : actual,
          unlocked: (ln === 1 ? 1 : actual) >= required,
          remaining: Math.max(0, required - (ln === 1 ? 1 : actual)),
        };
      });
    }

    const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
    const commissions = commissionsResult.status === "fulfilled" ? commissionsResult.value : null;
    const accounts = accountsResult.status === "fulfilled" ? (accountsResult.value as any)?.results || [] : [];
    const analytics = analyticsResult.status === "fulfilled" ? analyticsResult.value : null;

    return NextResponse.json({
      profile,
      commissions: {
        totalCommissions: (commissions as any)?.total_commissions || 0,
        totalEarned: (commissions as any)?.total_earned || 0,
        paidAmount: (commissions as any)?.paid_amount || 0,
      },
      teamStats: teamLevels,
      settings: settingsMap,
      accounts,
      analytics: {
        totalPageViews: (analytics as any)?.total_views || 0,
        totalSessions: (analytics as any)?.total_sessions || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
