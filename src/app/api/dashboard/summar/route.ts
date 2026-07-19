import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId is required" }, { status: 400 });
    }

    const db = await getDB();

    const profile = await queryFirst<any>(db,
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
       FROM workers WHERE worker_id = ?`, [workerId]
    );
    if (profile) {
      (profile as any).profileCompleted = !!(profile.name && !profile.name.startsWith("User") &&
        profile.ageGroup && profile.occupation && profile.educationLevel &&
        profile.gender && profile.country && profile.city && profile.goal &&
        profile.preferredLearningTime && profile.referralSource &&
        profile.communicationPreference && profile.budgetRange && profile.religion);
    }

    const [commissions, accounts, analytics, settingsRows] = await Promise.all([
      queryFirst<any>(db, "SELECT COUNT(*) as totalCommissions, COALESCE(SUM(total_amount), 0) as totalEarned, COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paidAmount FROM commissions WHERE to_worker_id = ?", [workerId]),
      query<any>(db, "SELECT id, account_type as accountType, account_number as accountNumber, account_name as accountName, is_default as isDefault FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, created_at ASC", [workerId]),
      queryFirst<any>(db, "SELECT COUNT(*) as totalViews, COUNT(DISTINCT session_id) as totalSessions FROM user_events WHERE worker_id = ? AND event_type = 'page_view'", [workerId]),
      query<{ setting_key: string; setting_value: string }>(db, "SELECT setting_key, setting_value FROM company_settings"),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows) {
      settingsMap[row.setting_key] = row.setting_value;
    }

    return NextResponse.json({
      profile,
      commissions: {
        totalCommissions: commissions?.totalCommissions || 0,
        totalEarned: commissions?.totalEarned || 0,
        paidAmount: commissions?.paidAmount || 0,
      },
      accounts: accounts || [],
      analytics: {
        totalPageViews: analytics?.totalViews || 0,
        totalSessions: analytics?.totalSessions || 0,
      },
      settings: settingsMap,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
