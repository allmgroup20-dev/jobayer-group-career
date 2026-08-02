import { query, queryFirst, execute, batch } from "@/lib/db/queries";
import { findAgent, getAllDepartments } from "./registry/index";
import { callAI } from "../router";
import type { AgentDef } from "./types";

interface TuningDashboard {
  agentsNeedingImprovement: AgentSummary[];
  versionHistory: PromptVersion[];
  abTests: ABTest[];
  improvementLog: TuningLog[];
}

interface AgentSummary {
  agentId: string;
  agentName: string;
  department: string;
  team: string;
  totalFeedback: number;
  avgRating: number;
  positive: number;
  negative: number;
  lastRating: number;
  currentVersion: number;
}

interface PromptVersion {
  id: number;
  agentId: string;
  version: number;
  prompt: string;
  source: string;
  active: number;
  avgRatingBefore: number;
  avgRatingAfter: number;
  totalFeedbackBefore: number;
  totalFeedbackAfter: number;
  createdAt: string;
}

interface ABTest {
  id: number;
  agentId: string;
  versionA: number;
  versionB: number;
  aAvgRating: number;
  bAvgRating: number;
  aCount: number;
  bCount: number;
  winner: string | null;
  status: string;
  startedAt: string;
  endedAt: string | null;
}

interface TuningLog {
  id: number;
  agentId: string;
  action: string;
  details: string;
  ratingBefore: number;
  ratingAfter: number;
  createdAt: string;
}

export async function getTuningDashboard(env: { DB: D1Database }): Promise<TuningDashboard> {
  const now = new Date().toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const lowRated = await query<Record<string, any>>(
    env,
    `SELECT
      af.department as agent_id,
      COUNT(*) as total_feedback,
      AVG(rating) as avg_rating,
      SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative
    FROM agent_feedback af
    WHERE af.created_at >= ? AND af.department != ''
    GROUP BY af.department
    HAVING avg_rating < 3.5 AND total_feedback >= 3
    ORDER BY avg_rating ASC
    LIMIT 20`,
    [thirtyDaysAgo],
  );

  const versions = await query<Record<string, any>>(
    env,
    `SELECT id, agent_id, version, prompt, source, active, avg_rating_before, avg_rating_after, total_feedback_before, total_feedback_after, created_at FROM agent_prompt_versions ORDER BY created_at DESC LIMIT 50`,
  );

  const abTests = await query<Record<string, any>>(
    env,
    `SELECT id, agent_id, version_a, version_b, a_avg_rating, b_avg_rating, a_count, b_count, winner, status, started_at, ended_at FROM agent_ab_tests ORDER BY started_at DESC LIMIT 20`,
  );

  const logs = await query<Record<string, any>>(
    env,
    `SELECT id, agent_id, action, details, rating_before, rating_after, created_at FROM agent_tuning_log ORDER BY created_at DESC LIMIT 50`,
  );

  return {
    agentsNeedingImprovement: lowRated.map((r: any) => ({
      agentId: r.agent_id,
      agentName: r.agent_id,
      department: r.agent_id,
      team: "",
      totalFeedback: r.total_feedback,
      avgRating: r.avg_rating,
      positive: r.positive,
      negative: r.negative,
      lastRating: 0,
      currentVersion: 0,
    })),
    versionHistory: versions.map((v: any) => ({
      id: v.id,
      agentId: v.agent_id,
      version: v.version,
      prompt: v.prompt,
      source: v.source,
      active: v.active,
      avgRatingBefore: v.avg_rating_before,
      avgRatingAfter: v.avg_rating_after,
      totalFeedbackBefore: v.total_feedback_before,
      totalFeedbackAfter: v.total_feedback_after,
      createdAt: v.created_at,
    })),
    abTests: abTests.map((t: any) => ({
      id: t.id,
      agentId: t.agent_id,
      versionA: t.version_a,
      versionB: t.version_b,
      aAvgRating: t.a_avg_rating,
      bAvgRating: t.b_avg_rating,
      aCount: t.a_count,
      bCount: t.b_count,
      winner: t.winner,
      status: t.status,
      startedAt: t.started_at,
      endedAt: t.ended_at,
    })),
    improvementLog: logs.map((l: any) => ({
      id: l.id,
      agentId: l.agent_id,
      action: l.action,
      details: l.details,
      ratingBefore: l.rating_before,
      ratingAfter: l.rating_after,
      createdAt: l.created_at,
    })),
  };
}

export async function analyzeAgentFeedback(
  env: { DB: D1Database },
  agentId: string,
): Promise<{ issues: string[]; praise: string[]; suggestion: string }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const feedbacks = await query<Record<string, any>>(
    env,
    `SELECT rating, feedback_text, intent FROM agent_feedback
     WHERE department = ? AND created_at >= ? AND feedback_text != ''
     ORDER BY created_at DESC LIMIT 50`,
    [agentId, thirtyDaysAgo],
  );

  const lowRated = feedbacks.filter((f: any) => f.rating <= 2);
  const highRated = feedbacks.filter((f: any) => f.rating >= 4);
  const issues = lowRated.map((f: any) => f.feedback_text).filter(Boolean);
  const praise = highRated.map((f: any) => f.feedback_text).filter(Boolean);

  let suggestion = "";
  if (issues.length > 0) {
    try {
      const agent = findAgent(agentId);
      const prompt = `Analyze these low-rated feedback comments for agent "${agent?.agent.name || agentId}" and suggest a concrete prompt improvement.

Low-rated feedback comments (rating 1-2):
${issues.map((i: string) => `- "${i}"`).join("\n")}

High-rated feedback (for reference):
${praise.map((p: string) => `- "${p}"`).join("\n")}

Current agent prompt template:
${agent?.agent.promptTemplate || "N/A"}

Provide:
1. 3-5 common issues identified
2. A revised prompt template that addresses these issues
3. Specific instructions to add to the prompt

Format as JSON: { "issues": ["..."], "promptSuggestion": "..." }`;

      const result = await callAI(
        {
          messages: [
            { role: "system", content: "You are an expert prompt engineer. Analyze feedback and suggest improvements." },
            { role: "user", content: prompt },
          ],
        },
        500,
        "meta-llama/llama-3.3-70b-instruct:free",
        "openrouter",
      );

      try {
        const parsed = JSON.parse(result.text);
        suggestion = parsed.promptSuggestion || result.text;
      } catch {
        suggestion = result.text;
      }
    } catch {
      suggestion = "Unable to generate suggestion automatically.";
    }
  }

  return { issues, praise, suggestion };
}

export async function applyPromptVersion(
  env: { DB: D1Database },
  agentId: string,
  newPrompt: string,
  source: string,
  feedbackTriggered: boolean,
): Promise<{ version: number }> {
  const currentVersion = await queryFirst<Record<string, any>>(
    env,
    `SELECT MAX(version) as max_ver FROM agent_prompt_versions WHERE agent_id = ?`,
    [agentId],
  );

  const nextVersion = (currentVersion?.max_ver || 0) + 1;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const feedbackBefore = await queryFirst<Record<string, any>>(
    env,
    `SELECT AVG(rating) as avg_rating, COUNT(*) as total
     FROM agent_feedback WHERE department = ? AND created_at >= ?`,
    [agentId, thirtyDaysAgo],
  );

  await execute(
    env,
    `INSERT INTO agent_prompt_versions (agent_id, version, prompt, source, feedback_triggered, active, avg_rating_before, total_feedback_before)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      agentId, nextVersion, newPrompt, source,
      feedbackTriggered ? 1 : 0,
      feedbackBefore?.avg_rating || 0,
      feedbackBefore?.total || 0,
    ],
  );

  await execute(
    env,
    `UPDATE agent_prompt_versions SET active = 0 WHERE agent_id = ? AND version != ?`,
    [agentId, nextVersion],
  );

  return { version: nextVersion };
}

export async function completeABTest(
  env: { DB: D1Database },
  testId: number,
): Promise<{ winner: string }> {
  const test = await queryFirst<Record<string, any>>(
    env,
    `SELECT id, a_count, b_count, a_avg_rating, b_avg_rating FROM agent_ab_tests WHERE id = ?`,
    [testId],
  );

  if (!test) throw new Error("AB test not found");

  let winner = "inconclusive";
  if (test.a_count >= 5 && test.b_count >= 5) {
    if (test.b_avg_rating > test.a_avg_rating + 0.3) winner = "b";
    else if (test.a_avg_rating > test.b_avg_rating + 0.3) winner = "a";
  }

  await execute(
    env,
    `UPDATE agent_ab_tests SET winner = ?, status = 'completed', ended_at = datetime('now') WHERE id = ?`,
    [winner, testId],
  );

  return { winner };
}

export async function startABTest(
  env: { DB: D1Database },
  agentId: string,
  versionB: number,
): Promise<{ testId: number }> {
  const versionA = versionB - 1;

  const res = await execute(
    env,
    `INSERT INTO agent_ab_tests (agent_id, version_a, version_b, status) VALUES (?, ?, ?, 'running')`,
    [agentId, versionA, versionB],
  );

  return { testId: res.meta?.last_row_id || 0 };
}

export async function getActivePromptOverride(
  env: { DB: D1Database },
  agentId: string,
): Promise<string | null> {
  const row = await queryFirst<Record<string, any>>(
    env,
    `SELECT prompt FROM agent_prompt_versions WHERE agent_id = ? AND active = 1 ORDER BY version DESC LIMIT 1`,
    [agentId],
  );
  return row?.prompt || null;
}
