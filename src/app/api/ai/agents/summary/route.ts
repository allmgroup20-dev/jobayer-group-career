import { NextResponse } from "next/server";
import { query, queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import type { Agent, AgentTreeNode, AgentReport } from "@/lib/ai/agents";

export async function GET() {
  try {
    const db = await ensureDB();
    const env = { DB: db };

    const [agentsResult, logs, reports, config, counts] = await Promise.all([
      query<Agent>(env, "SELECT id, agent_id, name_bn, name_en, level, sector, parent_agent_id, status, model_id, provider, last_run_at FROM ai_agents ORDER BY level DESC, agent_id ASC LIMIT 100"),
      query<any>(env, "SELECT id, agent_id, action, detail_bn, metadata, created_at FROM ai_agent_logs ORDER BY created_at DESC LIMIT 50"),
      query<AgentReport>(env, "SELECT id, agent_id, title_bn, summary_bn, findings, recommendations, metrics, submitted_at, created_at FROM ai_agent_reports ORDER BY created_at DESC LIMIT 20"),
      queryFirst<any>(env, "SELECT id, mode, provider, model_id, updated_at FROM ai_agent_global_config WHERE id = 1"),
      Promise.all([
        queryFirst<any>(env, "SELECT COUNT(*) as count FROM ai_agent_reports"),
        queryFirst<any>(env, "SELECT COUNT(*) as count FROM ai_agent_submissions"),
      ]),
    ]);

    const agents = agentsResult;
    const [reportCount, submissionCount] = counts;

    const stats = {
      total: agents.length,
      active: agents.filter((a) => a.status === "active").length,
      idle: agents.filter((a) => a.status === "idle").length,
      error: agents.filter((a) => a.status === "error").length,
      disabled: agents.filter((a) => a.status === "disabled").length,
      totalReports: reportCount?.count || 0,
      totalSubmissions: submissionCount?.count || 0,
    };

    const buildNode = (agent: Agent): AgentTreeNode => {
      const children: AgentTreeNode[] = [];
      if (agent.level === 3) {
        for (const d of agents.filter((a) => a.level === 2)) {
          children.push(buildNode(d));
        }
      } else if (agent.level === 2) {
        for (const s of agents.filter((a) => a.level === 1 && a.parent_agent_id === agent.agent_id)) {
          const latestReport = reports.find((r) => r.agent_id === s.agent_id) || null;
          children.push({
            agent: s,
            children: [],
            latestReport,
            pendingSubmissions: 0,
          });
        }
      }
      return { agent, children };
    };

    const senior = agents.find((a) => a.level === 3);
    const tree: AgentTreeNode[] = senior ? [buildNode(senior)] : [];

    return NextResponse.json({ success: true, agents, tree, logs, reports, config, stats });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
