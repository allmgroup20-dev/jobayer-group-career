import { NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await ensureDB();

    const state = await queryFirst<{ total_responses: number; today_responses: number }>(
      { DB: db },
      "SELECT total_responses, today_responses FROM ai_model_failover_state WHERE id = 1"
    );

    const activeModels = await query<{ count: number }>(
      { DB: db },
      "SELECT COUNT(*) as count FROM ai_models WHERE is_active = 1"
    );

    const activeKeys = await query<{ count: number }>(
      { DB: db },
      "SELECT COUNT(*) as count FROM ai_api_keys WHERE is_active = 1"
    );

    const totalConversations = await query<{ count: number }>(
      { DB: db },
      "SELECT COUNT(*) as count FROM ai_conversations"
    );

    const totalProfiles = await query<{ count: number }>(
      { DB: db },
      "SELECT COUNT(*) as count FROM ai_phone_profiles"
    );

    const skillCount = await query<{ count: number }>(
      { DB: db },
      "SELECT COUNT(*) as count FROM ai_skills"
    );

    const topPainPoints = await query<{ pain_points: string }>(
      { DB: db },
      "SELECT pain_points FROM ai_phone_profiles WHERE pain_points IS NOT NULL AND pain_points != '' ORDER BY priority_score DESC LIMIT 20"
    );

    const painPointFrequency: Record<string, number> = {};
    for (const row of topPainPoints) {
      try {
        const points = JSON.parse(row.pain_points) as string[];
        for (const p of points) {
          painPointFrequency[p] = (painPointFrequency[p] || 0) + 1;
        }
      } catch {}
    }

    return NextResponse.json({
      responses: {
        total: state?.total_responses || 0,
        today: state?.today_responses || 0,
      },
      models: {
        active: activeModels[0]?.count || 0,
        total: 26,
      },
      keys: {
        active: activeKeys[0]?.count || 0,
      },
      conversations: totalConversations[0]?.count || 0,
      profiles: totalProfiles[0]?.count || 0,
      skills: skillCount[0]?.count || 0,
      painPointFrequency,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load stats",
    }, { status: 500 });
  }
}
