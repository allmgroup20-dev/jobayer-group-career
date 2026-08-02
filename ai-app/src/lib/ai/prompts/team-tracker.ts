import { query } from "@/lib/db/queries";
import { getDirectChildren } from "@/lib/affiliate/tree";

export interface TeamSummary {
  totalTeam: number;
  directCount: number;
  activeThisWeek: number;
  newLastMonth: number;
  topPerformer?: { name: string; level: number; teamSize: number };
}

export async function getTeamSummary(db: any, workerId: string): Promise<TeamSummary | null> {
  try {
    const worker = await query<any>(
      { DB: db },
      "SELECT total_team_members FROM workers WHERE worker_id = ?",
      [workerId]
    );
    if (!worker || worker.length === 0) return null;

    const directMembers = await getDirectChildren({ DB: db }, workerId);
    const directCount = directMembers.length;

    const activeThisWeek = await query<any>(
      { DB: db },
      "SELECT COUNT(*) as count FROM wa_logs WHERE phone IN (SELECT phone FROM workers WHERE sponsor_id = ?) AND created_at > datetime('now', '-7 days')",
      [workerId]
    );

    const newLastMonth = await query<any>(
      { DB: db },
      "SELECT COUNT(*) as count FROM workers WHERE sponsor_id = ? AND join_date > datetime('now', '-30 days')",
      [workerId]
    );

    const topPerformer = await query<any>(
      { DB: db },
      "SELECT name, level, total_team_members FROM workers WHERE sponsor_id = ? ORDER BY total_team_members DESC LIMIT 1",
      [workerId]
    );

    return {
      totalTeam: worker[0].total_team_members || 0,
      directCount,
      activeThisWeek: activeThisWeek[0]?.count || 0,
      newLastMonth: newLastMonth[0]?.count || 0,
      topPerformer: topPerformer[0]?.name ? {
        name: topPerformer[0].name,
        level: topPerformer[0].level,
        teamSize: topPerformer[0].total_team_members,
      } : undefined,
    };
  } catch {
    return null;
  }
}

export async function buildTeamContext(db: any, workerId: string, language: string): Promise<string> {
  try {
    const summary = await getTeamSummary(db, workerId);
    if (!summary) return "";

    return language === "bn"
      ? `## আপনার টিমের তথ্য
• মোট টিম সদস্য: ${summary.totalTeam} জন
• সরাসরি সদস্য: ${summary.directCount} জন
• এই সপ্তাহে সক্রিয়: ${summary.activeThisWeek} জন
• গত মাসে নতুন: ${summary.newLastMonth} জন
${summary.topPerformer ? `• টপ পারফর্মার: ${summary.topPerformer.name} (লেভেল ${summary.topPerformer.level}, টিম সাইজ ${summary.topPerformer.teamSize})` : ""}

পরামর্শ: সপ্তাহে অন্তত ১ বার প্রতিটি সরাসরি সদস্যের সাথে চেক-ইন করুন। তাদের সাফল্যই আপনার সাফল্য।`
      : `## Your Team Info
• Total team members: ${summary.totalTeam}
• Direct members: ${summary.directCount}
• Active this week: ${summary.activeThisWeek}
• New last month: ${summary.newLastMonth}
${summary.topPerformer ? `• Top performer: ${summary.topPerformer.name} (Level ${summary.topPerformer.level}, Team size ${summary.topPerformer.teamSize})` : ""}

Tip: Check in with each direct member at least once a week. Their success is your success.`;
  } catch {
    return "";
  }
}
