import { NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await ensureDB();
    const models = await query<{ model_id: string; name: string; tier: number; is_active: number }>(
      { DB: db },
      "SELECT model_id, name, tier, is_active FROM ai_models ORDER BY tier ASC, model_id ASC"
    );
    const state = await queryFirst<{ exhausted_models: string; total_responses: number; today_responses: number }>(
      { DB: db },
      "SELECT exhausted_models, total_responses, today_responses FROM ai_model_failover_state WHERE id = 1"
    );
    const keys = await query<{ key_slot: number; is_active: number }>(
      { DB: db },
      "SELECT key_slot, is_active FROM ai_api_keys ORDER BY key_slot ASC"
    );

    const exhaustedSet = new Set(
      state?.exhausted_models ? state.exhausted_models.split(",").filter(Boolean) : []
    );

    return NextResponse.json({
      models: models.map((m) => ({
        ...m,
        exhausted: exhaustedSet.has(m.model_id),
      })),
      failoverState: state || { exhausted_models: "", total_responses: 0, today_responses: 0 },
      keyCount: keys.length,
      activeKeyCount: keys.filter((k) => k.is_active).length,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load models",
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action: string; modelId?: string; keySlot?: number; keyValue?: string };
    const db = await ensureDB();

    if (body.action === "toggle_model") {
      const model = await queryFirst<{ is_active: number }>(
        { DB: db },
        "SELECT is_active FROM ai_models WHERE model_id = ?",
        [body.modelId]
      );
      if (model) {
        const { execute } = await import("@/lib/db/queries");
        await execute(
          { DB: db },
          "UPDATE ai_models SET is_active = ? WHERE model_id = ?",
          [model.is_active ? 0 : 1, body.modelId]
        );
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === "add_key") {
      const { execute } = await import("@/lib/db/queries");
      await execute(
        { DB: db },
        "INSERT OR REPLACE INTO ai_api_keys (key_slot, key_value, is_active, created_at) VALUES (?, ?, 1, datetime('now'))",
        [body.keySlot, body.keyValue]
      );
      return NextResponse.json({ success: true });
    }

    if (body.action === "reset_failover") {
      const { execute } = await import("@/lib/db/queries");
      await execute(
        { DB: db },
        "UPDATE ai_model_failover_state SET exhausted_models = '', updated_at = datetime('now') WHERE id = 1"
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Action failed",
    }, { status: 500 });
  }
}
