import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";
import { initEnv } from "@/lib/env";
import { ensureSchema } from "@/lib/db";

const MEMO_DASH = "__dashboardMemo";
const MEMO_TTL = 120_000;
const QUERY_TIMEOUT = 8000;

function getMemo(): Map<string, { data: unknown; ts: number }> {
  const g = globalThis as any;
  if (!g[MEMO_DASH]) g[MEMO_DASH] = new Map();
  return g[MEMO_DASH];
}

async function q<T>(db: D1Database, sql: string, ...params: unknown[]): Promise<T | null> {
  return Promise.race<T | null>([
    db.prepare(sql).bind(...params).first<T>(),
    new Promise<T | null>((_, reject) => setTimeout(() => reject(new Error("Query timeout")), QUERY_TIMEOUT)),
  ]).catch(() => null);
}

async function qAll<T>(db: D1Database, sql: string, ...params: unknown[]): Promise<T[]> {
  return Promise.race<T[]>([
    db.prepare(sql).bind(...params).all<T>().then(r => r.results || []),
    new Promise<T[]>((_, reject) => setTimeout(() => reject(new Error("Query timeout")), QUERY_TIMEOUT)),
  ]).catch(() => []);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId is required" }, { status: 400 });
    }

    const cacheKey = `dashboard:${workerId}`;
    const memo = getMemo();
    const memod = memo.get(cacheKey);
    if (memod && Date.now() - memod.ts < MEMO_TTL) {
      return NextResponse.json(memod.data);
    }

    const cached = await getCached<any>(cacheKey, 120);
    if (cached) {
      memo.set(cacheKey, { data: cached, ts: Date.now() });
      return NextResponse.json(cached);
    }

    const ctx = await initEnv();
    if (!ctx?.DB) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    const db = ctx.DB;

    // Ensure schema with 3s timeout — tables must exist for queries
    await Promise.race([
      ensureSchema({ DB: db }),
      new Promise(r => setTimeout(r, 3000)),
    ]).catch(() => {});

    const profile = await q<any>(db,
      `SELECT worker_id as workerId, name, phone, email, balance,
              total_earned as totalEarned, total_spent as totalSpent,
              total_team_members as totalTeamMembers,
              membership_status as membershipStatus,
              join_date as joinDate, avatar_url as avatarUrl,
              sponsor_id as sponsorId, sponsor_name as sponsorName,
              level, currency, preferred_language as preferredLanguage,
              age_group as ageGroup, occupation, education_level as educationLevel,
              gender, country, city, goal,
              preferred_learning_time as preferredLearningTime,
              referral_source as referralSource,
              communication_preference as communicationPreference,
              budget_range as budgetRange, religion,
              resource_income as resourceIncome, resource_income_original as resourceIncomeOriginal
       FROM workers WHERE worker_id = ?`, workerId
    );
    if (profile) {
      (profile as any).profileCompleted = !!(profile.name && !profile.name.startsWith("User") &&
        profile.ageGroup && profile.occupation && profile.educationLevel &&
        profile.gender && profile.country && profile.city && profile.goal &&
        profile.preferredLearningTime && profile.referralSource &&
        profile.communicationPreference && profile.budgetRange && profile.religion);
    }

    const fallback = <T>(v: T | null | undefined, def: T) => v ?? def;
    const commissions = await q<any>(db, "SELECT COUNT(*) as totalCommissions, COALESCE(SUM(total_amount), 0) as totalEarned, COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paidAmount FROM commissions WHERE to_worker_id = ?", workerId);
    const accounts = await qAll<any>(db, "SELECT id, account_type, account_number, account_name, is_default FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, created_at ASC", workerId);
    const analytics = await q<any>(db, "SELECT COUNT(*) as totalViews, COUNT(DISTINCT session_id) as totalSessions FROM user_events WHERE worker_id = ? AND event_type = 'page_view'", workerId);
    const settingsRows = await qAll<{ setting_key: string; setting_value: string }>(db, "SELECT setting_key, setting_value FROM company_settings");
    const levelRow = await q<any>(db, "SELECT level_name as levelName, level_name_bn as levelNameBn FROM commission_levels WHERE level_number = ?", profile?.level || 1);
    const teamCount = await q<any>(db, "SELECT COUNT(*) as cnt FROM affiliate_tree WHERE parent_id = ? OR sponsor_id = ?", workerId, workerId);
    const withdrawalSum = await q<any>(db, "SELECT COALESCE(SUM(final_amount), 0) as withdrawn FROM withdrawals WHERE worker_id = ? AND status = 'completed'", workerId);

    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows) {
      settingsMap[row.setting_key] = row.setting_value;
    }

    const totalEarned = commissions?.totalEarned || 0;
    const balance = Math.max(0, (commissions?.paidAmount || 0) - (withdrawalSum?.withdrawn || 0));
    const totalTeamMembers = teamCount?.cnt || 0;

    if (profile) {
      profile.totalEarned = totalEarned;
      profile.balance = balance;
      profile.totalTeamMembers = totalTeamMembers;
      if (levelRow) {
        profile.levelName = levelRow.levelName;
        profile.levelNameBn = levelRow.levelNameBn;
      }
    }

    const responseData = {
      profile,
      commissions: {
        totalCommissions: commissions?.totalCommissions || 0,
        totalEarned,
        paidAmount: commissions?.paidAmount || 0,
      },
      accounts: accounts || [],
      analytics: {
        totalPageViews: analytics?.totalViews || 0,
        totalSessions: analytics?.totalSessions || 0,
      },
      settings: settingsMap,
    };

    setCached(cacheKey, responseData).catch(() => {});
    memo.set(cacheKey, { data: responseData, ts: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
