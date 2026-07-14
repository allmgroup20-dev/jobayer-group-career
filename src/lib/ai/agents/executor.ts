import { ensureDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";
import { callAI } from "@/lib/ai/router";
import { getAgent, updateAgentConfig, createSubmission, createReport, logActivity, getGlobalConfig } from "./registry";
import { buildResearchPrompt, parseResearchResponse } from "./prompts";
import { SECTOR_KEYWORDS } from "./types";
import type { Agent, ResearchResult, RunResult } from "./types";

const DEFAULT_RESEARCH_MODEL = "google/gemini-2.0-flash-001:free";
const DEFAULT_RESEARCH_PROVIDER = "openrouter";

export async function runAgent(agentId: string): Promise<RunResult> {
  const agent = await getAgent(agentId);
  if (!agent) return { success: false, agent_id: agentId, error: "Agent not found" };

  try {
    await updateAgentConfig(agentId, { status: "active" });
    await logActivity(agentId, "started", "গবেষণা শুরু হয়েছে");

    const data = await collectSectorData(agent);

    const prompt = buildResearchPrompt({
      agentName: agent.name_bn,
      sector: agent.sector || agent.name_bn,
      conversationCount: data.conversationCount,
      painPoints: data.painPoints,
      interests: data.interests,
      whatWorked: data.whatWorked,
      recentMessages: data.recentMessages,
    });

    // Determine model/provider: agent config > global config > default
    const globalConfig = await getGlobalConfig();
    const preferredModel = agent.model_id || (globalConfig?.mode === "model" ? globalConfig.modelId : undefined) || undefined;
    const preferredProvider = agent.provider || (globalConfig?.mode === "provider" ? globalConfig.provider : undefined) || undefined;

    const response = await callAI(
      { messages: [{ role: "user", content: prompt }] },
      800,
      preferredModel,
      preferredProvider
    );

    const result = parseResearchResponse(response.text);
    if (!result) {
      await logActivity(agentId, "error", "এআই রেসপন্স পার্স করা যায়নি");
      await updateAgentConfig(agentId, { status: "idle" });
      return { success: false, agent_id: agentId, error: "Failed to parse AI response" };
    }

    const content = JSON.stringify(result);
    const reportId = await createReport(
      agentId,
      `${agent.name_bn} — রিসার্চ রিপোর্ট`,
      result.summary,
      JSON.stringify({ challenges: result.challenges, whats_working: result.whats_working }),
      JSON.stringify(result.recommendations),
      JSON.stringify(result.metrics)
    );

    if (agent.parent_agent_id) {
      await createSubmission(
        agentId,
        agent.parent_agent_id,
        agent.level === 1 ? "research" : "analysis",
        `${agent.name_bn} — রিপোর্ট`,
        content
      );
    }

    await logActivity(agentId, "completed", `গবেষণা সম্পন্ন। ${result.recommendations.length}টি সুপারিশ`);
    await updateAgentConfig(agentId, { status: "idle", last_run_at: new Date().toISOString() });

    return { success: true, agent_id: agentId, report_id: reportId };
  } catch (e) {
    const errMsg = (e as Error)?.message || "Unknown error";
    await logActivity(agentId, "error", `গবেষণা ব্যর্থ: ${errMsg}`);
    await updateAgentConfig(agentId, { status: "error" });
    return { success: false, agent_id: agentId, error: errMsg };
  }
}

async function collectSectorData(agent: Agent) {
  const db = await ensureDB();
  const keywords = agent.sector ? (SECTOR_KEYWORDS[agent.sector] || []) : [];
  let conversations: { role: string; content: string; pain_points?: string; interests?: string }[] = [];

  if (keywords.length > 0) {
    const likeClauses = keywords.map(() => "messages LIKE ?");
    const likeParams = keywords.map((k) => `%${k}%`);
    const rows = await query<{ role: string; messages: string; pain_points?: string; interests?: string }>(
      { DB: db },
      `SELECT role, messages, pain_points, interests FROM ai_conversations WHERE ${likeClauses.join(" OR ")} ORDER BY created_at DESC LIMIT 100`,
      likeParams
    );
    conversations = rows.map((r) => ({ role: r.role, content: r.messages, pain_points: r.pain_points, interests: r.interests }));
  } else {
    const rows = await query<{ role: string; messages: string; pain_points?: string; interests?: string }>(
      { DB: db },
      "SELECT role, messages, pain_points, interests FROM ai_conversations ORDER BY created_at DESC LIMIT 100"
    );
    conversations = rows.map((r) => ({ role: r.role, content: r.messages, pain_points: r.pain_points, interests: r.interests }));
  }

  const painPointSet = new Set<string>();
  const interestSet = new Set<string>();
  const whatWorkedWords = ["ধন্যবাদ", "thank", "বুঝলাম", "করব", "ok", "done", "ঠিক আছে", "start", "শুরু"];
  let whatWorkedCount = 0;

  for (const c of conversations) {
    if (c.pain_points) {
      try {
        const pp = JSON.parse(c.pain_points) as string[];
        pp.forEach((p) => painPointSet.add(p));
      } catch {}
    }
    if (c.interests) {
      try {
        const ints = JSON.parse(c.interests) as string[];
        ints.forEach((i) => interestSet.add(i));
      } catch {}
    }
    if (c.content) {
      const lower = c.content.toLowerCase();
      if (whatWorkedWords.some((w) => lower.includes(w))) {
        whatWorkedCount++;
      }
    }
  }

  return {
    conversationCount: conversations.length || 0,
    painPoints: Array.from(painPointSet),
    interests: Array.from(interestSet),
    whatWorked: whatWorkedCount > 0 ? ["positive_response"] : [],
    recentMessages: conversations.slice(0, 10).map((c) => ({
      role: c.role || "user",
      content: c.content || "",
    })),
  };
}
