import { callAI } from "../router";
import type { AgentDef, AgentOutput } from "./types";
import { getConversationRules } from "../conversation-rules";
import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { findSkill } from "../skills";
import { checkResponseCache, storeResponseCache } from "../response-cache";

const TIER_MODELS: Record<number, { model: string; provider: string }> = {
  1: { model: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter" },
  2: { model: "google/gemma-4-31b-it:free", provider: "openrouter" },
  3: { model: "google/gemma-4-26b-a4b-it:free", provider: "openrouter" },
  4: { model: "nvidia/nemotron-3-nano-30b-a3b:free", provider: "openrouter" },
};

export async function executeAgent(
  agent: AgentDef,
  systemPrompt: string,
  userMessage: string,
): Promise<AgentOutput> {
  // 1) Skill match — 0 tokens, highest priority
  try {
    const skillAnswer = await findSkill(userMessage);
    if (skillAnswer) {
      return { agentId: agent.id, text: skillAnswer, model: "skill-cache", tokens: 0 };
    }
  } catch {}

  const db = await ensureDB();

  // 2) Response cache — 0 tokens, identical queries
  try {
    const cached = await checkResponseCache(db, userMessage, agent.id);
    if (cached) {
      return { agentId: agent.id, text: cached, model: "response-cache", tokens: 0 };
    }
  } catch {}

  // 3) AI call — tokens consumed
  const preferred = TIER_MODELS[agent.tier] || TIER_MODELS[3];
  const rules = getConversationRules("en") + "\n\n" + getConversationRules("bn");
  const messages = [
    { role: "system" as const, content: systemPrompt + "\n\n" + rules },
    { role: "user" as const, content: userMessage },
  ];

  try {
    const result = await callAI({ messages, temperature: 0.3 }, 300, preferred.model, preferred.provider);
    // 4) Store in cache for future reuse
    try {
      await storeResponseCache(db, userMessage, result.text, agent.id);
    } catch {}
    return {
      agentId: agent.id,
      text: result.text,
      model: result.model,
      tokens: result.tokens,
    };
  } catch (e) {
    try {
      await execute({ DB: db },
        `INSERT INTO psychologist_feedback (agent_id, issue_type, context, resolved, created_at)
         VALUES (?, 'model_exhausted', ?, 0, datetime('now'))`,
        [agent.id, JSON.stringify({ userMessage: userMessage.slice(0, 500), error: (e as Error)?.message || "" })]
      );
    } catch {}
    return {
      agentId: agent.id,
      text: `[Service temporarily unavailable for ${agent.name}. Please try again later.]`,
      model: "fallback",
      tokens: 0,
    };
  }
}

export function buildAgentPrompt(agent: AgentDef, ctx: Record<string, any>, promptOverride?: string): string {
  let prompt = promptOverride || agent.promptTemplate;
  for (const [key, val] of Object.entries(ctx)) {
    prompt = prompt.replace(`{{${key}}}`, String(val ?? ""));
  }
  return prompt;
}
