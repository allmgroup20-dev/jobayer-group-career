import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import type { Agent, AgentReport, AgentSubmission, AgentLog, AgentTreeNode, AgentStats, GlobalAgentConfig } from "./types";

export async function getAllAgents(): Promise<Agent[]> {
  const db = await ensureDB();
  return query<Agent>({ DB: db },
    "SELECT * FROM ai_agents ORDER BY level DESC, agent_id ASC"
  );
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  const db = await ensureDB();
  return queryFirst<Agent>({ DB: db },
    "SELECT * FROM ai_agents WHERE agent_id = ?", [agentId]
  );
}

export async function updateAgentConfig(
  agentId: string,
  config: { model_id?: string; provider?: string; cron_interval?: number; status?: string; last_run_at?: string; next_run_at?: string }
): Promise<void> {
  const db = await ensureDB();
  const sets: string[] = [];
  const params: any[] = [];
  if (config.model_id !== undefined) { sets.push("model_id = ?"); params.push(config.model_id); }
  if (config.provider !== undefined) { sets.push("provider = ?"); params.push(config.provider); }
  if (config.cron_interval !== undefined) { sets.push("cron_interval = ?"); params.push(config.cron_interval); }
  if (config.status !== undefined) { sets.push("status = ?"); params.push(config.status); }
  if (config.last_run_at !== undefined) { sets.push("last_run_at = ?"); params.push(config.last_run_at); }
  if (config.next_run_at !== undefined) { sets.push("next_run_at = ?"); params.push(config.next_run_at); }
  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  params.push(agentId);
  await execute({ DB: db },
    `UPDATE ai_agents SET ${sets.join(", ")} WHERE agent_id = ?`, params
  );
}

export async function getAgentTree(): Promise<AgentTreeNode[]> {
  const agents = await getAllAgents();
  const senior = agents.find((a) => a.level === 3);
  const domains = agents.filter((a) => a.level === 2);
  const sectors = agents.filter((a) => a.level === 1);

  const buildNode = async (agent: Agent): Promise<AgentTreeNode> => {
    const children: AgentTreeNode[] = [];
    if (agent.level === 3) {
      for (const d of domains) {
        children.push(await buildNode(d));
      }
    } else if (agent.level === 2) {
      for (const s of sectors.filter((s) => s.parent_agent_id === agent.agent_id)) {
        const report = await getLatestReport(s.agent_id);
        children.push({
          agent: s,
          children: [],
          latestReport: report,
          pendingSubmissions: 0,
        });
      }
    }
    return { agent, children };
  };

  if (senior) {
    return [await buildNode(senior)];
  }
  return [];
}

export async function getLatestReport(agentId: string): Promise<AgentReport | null> {
  const db = await ensureDB();
  return queryFirst<AgentReport>({ DB: db },
    "SELECT * FROM ai_agent_reports WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1",
    [agentId]
  );
}

export async function getAgentReports(agentId: string, limit = 20): Promise<AgentReport[]> {
  const db = await ensureDB();
  return query<AgentReport>({ DB: db },
    "SELECT * FROM ai_agent_reports WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?",
    [agentId, limit]
  );
}

export async function getAllReports(limit = 50): Promise<AgentReport[]> {
  const db = await ensureDB();
  return query<AgentReport>({ DB: db },
    "SELECT * FROM ai_agent_reports ORDER BY created_at DESC LIMIT ?", [limit]
  );
}

export async function getAgentSubmissions(
  agentId: string,
  direction: "from" | "to" = "from",
  limit = 50
): Promise<AgentSubmission[]> {
  const db = await ensureDB();
  const col = direction === "from" ? "from_agent_id" : "to_agent_id";
  return query<AgentSubmission>({ DB: db },
    `SELECT * FROM ai_agent_submissions WHERE ${col} = ? ORDER BY created_at DESC LIMIT ?`,
    [agentId, limit]
  );
}

export async function getAllSubmissions(limit = 100): Promise<AgentSubmission[]> {
  const db = await ensureDB();
  return query<AgentSubmission>({ DB: db },
    "SELECT * FROM ai_agent_submissions ORDER BY created_at DESC LIMIT ?", [limit]
  );
}

export async function createSubmission(
  fromAgentId: string,
  toAgentId: string,
  type: string,
  titleBn: string,
  content: string
): Promise<number> {
  const db = await ensureDB();
  const result = await execute({ DB: db },
    `INSERT INTO ai_agent_submissions (from_agent_id, to_agent_id, submission_type, title_bn, content, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
    [fromAgentId, toAgentId, type, titleBn, content]
  );
  return result.meta?.last_row_id || 0;
}

export async function createReport(
  agentId: string,
  titleBn: string,
  summaryBn: string,
  findings: string,
  recommendations: string,
  metrics: string
): Promise<number> {
  const db = await ensureDB();
  const result = await execute({ DB: db },
    `INSERT INTO ai_agent_reports (agent_id, title_bn, summary_bn, findings, recommendations, metrics, submitted_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [agentId, titleBn, summaryBn, findings, recommendations, metrics]
  );
  return result.meta?.last_row_id || 0;
}

export async function logActivity(
  agentId: string,
  action: string,
  detailBn: string,
  metadata?: string
): Promise<void> {
  const db = await ensureDB();
  await execute({ DB: db },
    `INSERT INTO ai_agent_logs (agent_id, action, detail_bn, metadata, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [agentId, action, detailBn, metadata || null]
  );
}

export async function getActivityLogs(limit = 100): Promise<AgentLog[]> {
  const db = await ensureDB();
  return query<AgentLog>({ DB: db },
    "SELECT * FROM ai_agent_logs ORDER BY created_at DESC LIMIT ?", [limit]
  );
}

export async function getAgentActivityLogs(agentId: string, limit = 50): Promise<AgentLog[]> {
  const db = await ensureDB();
  return query<AgentLog>({ DB: db },
    "SELECT * FROM ai_agent_logs WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?",
    [agentId, limit]
  );
}

export async function getGlobalConfig(): Promise<GlobalAgentConfig | null> {
  const db = await ensureDB();
  return queryFirst<GlobalAgentConfig>({ DB: db },
    "SELECT * FROM ai_agent_global_config WHERE id = 1"
  );
}

export async function updateGlobalConfig(
  config: { mode?: string; provider?: string; model_id?: string }
): Promise<void> {
  const db = await ensureDB();
  const sets: string[] = [];
  const params: any[] = [];
  if (config.mode !== undefined) { sets.push("mode = ?"); params.push(config.mode); }
  if (config.provider !== undefined) { sets.push("provider = ?"); params.push(config.provider); }
  if (config.model_id !== undefined) { sets.push("model_id = ?"); params.push(config.model_id); }
  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  await execute({ DB: db },
    `UPDATE ai_agent_global_config SET ${sets.join(", ")} WHERE id = 1`, params
  );
}

export async function getAgentStats(): Promise<AgentStats> {
  const agents = await getAllAgents();
  const db = await ensureDB();
  const total = agents.length;
  const active = agents.filter((a) => a.status === "active").length;
  const idle = agents.filter((a) => a.status === "idle").length;
  const error = agents.filter((a) => a.status === "error").length;
  const disabled = agents.filter((a) => a.status === "disabled").length;

  const reportCount = await queryFirst<{ count: number }>({ DB: db },
    "SELECT COUNT(*) as count FROM ai_agent_reports"
  );
  const submissionCount = await queryFirst<{ count: number }>({ DB: db },
    "SELECT COUNT(*) as count FROM ai_agent_submissions"
  );

  return {
    total,
    active,
    idle,
    error,
    disabled,
    totalReports: reportCount?.count || 0,
    totalSubmissions: submissionCount?.count || 0,
  };
}
