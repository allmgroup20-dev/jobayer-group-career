import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { queryFirst, execute } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const env = await getDB();
    const body: { skillId: number; action: "like" | "dislike" } = await request.json();
    if (!body.skillId || !body.action) {
      return NextResponse.json({ error: "skillId and action required" }, { status: 400 });
    }

    const skill = await queryFirst<{ id: number; usage_count: number; manual_override: number }>(
      env, "SELECT id, usage_count, manual_override FROM ai_skills WHERE id = ?", [body.skillId]
    );
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (body.action === "dislike") {
      // Dislike → decrement usage_count. If it drops to 0, delete the skill
      const newCount = Math.max(0, (skill.usage_count || 1) - 2);
      if (newCount <= 0) {
        await execute(env, "DELETE FROM ai_skills WHERE id = ?", [body.skillId]);
        await execute(env,
          "INSERT INTO skill_audit_log (skill_id, action, details, created_at) VALUES (?, 'auto_deleted', 'disliked_by_user', datetime('now'))",
          [body.skillId]
        );
        return NextResponse.json({ success: true, deleted: true });
      }
      await execute(env,
        "UPDATE ai_skills SET usage_count = ?, updated_at = datetime('now') WHERE id = ?",
        [newCount, body.skillId]
      );
    } else {
      // Like → increment usage_count, auto-promote at threshold
      const newCount = (skill.usage_count || 0) + 1;
      const promoted = newCount >= 5 && !skill.manual_override;
      await execute(env,
        `UPDATE ai_skills SET usage_count = ?, ${promoted ? "manual_override = 1, " : ""}updated_at = datetime('now') WHERE id = ?`,
        [newCount, body.skillId]
      );
      if (promoted) {
        await execute(env,
          "INSERT INTO skill_audit_log (skill_id, action, details, created_at) VALUES (?, 'auto_promoted', 'reached_5_likes', datetime('now'))",
          [body.skillId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
