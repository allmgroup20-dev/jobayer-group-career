import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await ensureDB();
    const [keys, models, failover] = await Promise.all([
      query<{ id: number; key_value: string; provider: string; is_active: number }>(
        { DB: db },
        "SELECT id, key_value, provider, is_active FROM ai_api_keys ORDER BY id ASC"
      ),
      query<{ id: number; model_id: string; name: string; tier: number; provider: string; is_active: number }>(
        { DB: db },
        "SELECT id, model_id, name, tier, provider, is_active FROM ai_models ORDER BY tier ASC, name ASC"
      ),
      query(
        { DB: db },
        "SELECT id, current_key_slot, current_model_index, exhausted_models, total_responses, today_responses, last_reset_date, updated_at FROM ai_model_failover_state WHERE id = 1"
      ),
    ]);

    let aiSystemActive = true;
    try {
      const g = await query<{ setting_value: string }>(
        { DB: db },
        "SELECT setting_value FROM company_settings WHERE setting_key = 'ai_system_active'"
      );
      if (g.length > 0) aiSystemActive = g[0].setting_value !== "0";
    } catch {}

    let disabledAgents: Record<string, boolean> = {};
    try {
      const configs = await query<{ agent_id: string; enabled: number }>(
        { DB: db },
        "SELECT agent_id, enabled FROM brain_agent_config"
      );
      for (const c of configs) disabledAgents[c.agent_id] = !c.enabled;
    } catch {}

    const failoverState = failover[0] || null;

    return NextResponse.json({
      keys: keys.map(k => ({ ...k, key_value: k.key_value ? k.key_value.substring(0, 8) + "..." : "" })),
      models, failover: failoverState, failoverState,
      aiSystemActive, disabledAgents,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      key_value?: string;
      provider?: string;
      key_id?: number;
      model_id?: string;
      is_active?: number;
    };
    const db = await ensureDB();

    switch (body.action) {
      case "add_key":
        if (!body.key_value) return NextResponse.json({ error: "key_value required" }, { status: 400 });
        await execute({ DB: db },
          "INSERT INTO ai_api_keys (key_value, provider, is_active) VALUES (?, ?, 1)",
          [body.key_value, body.provider || "openrouter"]
        );
        return NextResponse.json({ ok: true });

      case "toggle_key":
        if (!body.key_id) return NextResponse.json({ error: "key_id required" }, { status: 400 });
        await execute({ DB: db },
          "UPDATE ai_api_keys SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?",
          [body.key_id]
        );
        return NextResponse.json({ ok: true });

      case "delete_key":
        if (!body.key_id) return NextResponse.json({ error: "key_id required" }, { status: 400 });
        await execute({ DB: db }, "DELETE FROM ai_api_keys WHERE id = ?", [body.key_id]);
        return NextResponse.json({ ok: true });

      case "toggle_model":
        if (!body.model_id) return NextResponse.json({ error: "model_id required" }, { status: 400 });
        await execute({ DB: db },
          "UPDATE ai_models SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE model_id = ?",
          [body.model_id]
        );
        return NextResponse.json({ ok: true });

      case "reset_failover":
        await execute({ DB: db },
          "UPDATE ai_model_failover_state SET exhausted_models = '', current_key_slot = 1, current_model_index = 0, today_responses = 0, last_reset_date = datetime('now'), updated_at = datetime('now') WHERE id = 1"
        );
        return NextResponse.json({ ok: true });

      case "global_toggle":
        if (body.is_active === undefined) return NextResponse.json({ error: "is_active required" }, { status: 400 });
        const existing = await query(
          { DB: db },
          "SELECT id FROM company_settings WHERE setting_key = 'ai_system_active'"
        );
        if (existing.length > 0) {
          await execute({ DB: db },
            "UPDATE company_settings SET setting_value = ? WHERE setting_key = 'ai_system_active'",
            [body.is_active ? "1" : "0"]
          );
        } else {
          await execute({ DB: db },
            "INSERT INTO company_settings (setting_key, setting_value) VALUES ('ai_system_active', ?)",
            [body.is_active ? "1" : "0"]
          );
        }
        return NextResponse.json({ ok: true });

      case "toggle_provider":
        if (!body.provider) return NextResponse.json({ error: "provider required" }, { status: 400 });
        await execute({ DB: db },
          "UPDATE ai_models SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE provider = ?",
          [body.provider]
        );
        return NextResponse.json({ ok: true });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
