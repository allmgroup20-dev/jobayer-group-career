import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await ensureDB();
    const rows = await query<{ agent_id: string; enabled: number }>(
      { DB: db },
      "SELECT agent_id, enabled FROM brain_agent_config ORDER BY agent_id ASC"
    );
    const map: Record<string, boolean> = {};
    for (const r of rows) map[r.agent_id] = !!r.enabled;
    return NextResponse.json({ configs: map });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load agent configs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, enabled, action } = await request.json() as {
      agentId?: string; enabled?: boolean; action?: string;
    };
    const db = await ensureDB();

    if (action === "toggle") {
      if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });
      const existing = await query<{ enabled: number }>(
        { DB: db },
        "SELECT enabled FROM brain_agent_config WHERE agent_id = ?", [agentId]
      );
      if (existing.length > 0) {
        await execute(
          { DB: db },
          "UPDATE brain_agent_config SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE agent_id = ?",
          [agentId]
        );
      } else {
        await execute(
          { DB: db },
          "INSERT INTO brain_agent_config (agent_id, enabled, updated_at) VALUES (?, 0, datetime('now'))",
          [agentId]
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "toggle_all") {
      const val = enabled ? 1 : 0;
      await execute(
        { DB: db },
        "DELETE FROM brain_agent_config"
      );
      const allIds = await query<{ agent_id: string }>(
        { DB: db },
        "SELECT agent_id FROM brain_agent_config_tmp"
      ).catch(() => [] as any[]);
      return NextResponse.json({ success: true, toggledTo: val });
    }

    if (action === "enable_all") {
      await execute({ DB: db }, "DELETE FROM brain_agent_config");
      return NextResponse.json({ success: true, enabled: true });
    }

    if (action === "disable_all") {
      await execute(
        { DB: db },
        "DELETE FROM brain_agent_config"
      );
      return NextResponse.json({ success: true, enabled: false });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
