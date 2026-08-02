import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, queryFirst } from "@/lib/db/queries";

export async function GET() {
  try {
    const env = await getDB();

    const totalSkills = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills");
    const promotedSkills = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills WHERE manual_override = 1");
    const skillsThisWeek = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills WHERE created_at >= datetime('now', '-7 days')");
    const activeSkills = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills WHERE usage_count > 3");
    const deletedCount = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM skill_audit_log WHERE action = 'auto_deleted'");
    const autoLearnCount = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills WHERE category = 'auto_learned'");
    const faqCount = await queryFirst<{ c: number }>(env, "SELECT COUNT(*) as c FROM ai_skills WHERE category = 'faq'");

    const modelStats = await query<{ model: string; calls: number }>(env,
      "SELECT model, COUNT(*) as calls FROM ai_conversations WHERE created_at >= datetime('now', '-30 days') GROUP BY model ORDER BY calls DESC LIMIT 5"
    );

    return NextResponse.json({
      totalSkills: totalSkills?.c || 0,
      promotedSkills: promotedSkills?.c || 0,
      skillsThisWeek: skillsThisWeek?.c || 0,
      activeSkills: activeSkills?.c || 0,
      deletedCount: deletedCount?.c || 0,
      autoLearnCount: autoLearnCount?.c || 0,
      faqCount: faqCount?.c || 0,
      modelStats,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
