import { callAI } from "../router";
import type { AgentDef, AgentOutput } from "./types";
import { getConversationRules } from "../conversation-rules";
import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { checkResponseCache, storeResponseCache } from "../response-cache";

const MODEL_MAP: Record<string, { model: string; provider: string }> = {
  "llama-3.3-70b": { model: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter" },
  "gemma-4-31b": { model: "google/gemma-4-31b-it:free", provider: "openrouter" },
  "gemma-4-26b": { model: "google/gemma-4-26b-a4b-it:free", provider: "openrouter" },
  "nemotron-3-nano": { model: "nvidia/nemotron-3-nano-30b-a3b:free", provider: "openrouter" },
  "nemotron-3-super": { model: "nvidia/nemotron-3-super-120b-a12b:free", provider: "openrouter" },
  "hermes-3-405b": { model: "nousresearch/hermes-3-llama-3.1-405b:free", provider: "openrouter" },
  "deepseek-v4-flash-free": { model: "deepseek-v4-flash-free", provider: "opencode" },
  "gpt-5.4-mini": { model: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter" },
};

function resolveModel(agent: AgentDef): { model: string; provider: string } {
  const fromPrimary = MODEL_MAP[agent.primaryModel];
  if (fromPrimary) return fromPrimary;
  for (const fb of agent.fallbackModels) {
    const fromFallback = MODEL_MAP[fb];
    if (fromFallback) return fromFallback;
  }
  return { model: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter" };
}

export async function executeAgent(
  agent: AgentDef,
  systemPrompt: string,
  userMessage: string,
  phone = "",
): Promise<AgentOutput> {
  // 1) Skill match — 0 tokens, highest priority
  try {
    const skillAnswer = await findSkill(userMessage, phone);
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
  const preferred = resolveModel(agent);
  const lang = systemPrompt.includes("Bengali") ? "bn" : "en";
  const rules = getConversationRules(lang);
  const messages = [
    { role: "system" as const, content: "CRITICAL: You are a sales representative talking directly to a customer. Your output must be ONLY the natural reply — no explanations, no rule references, no meta-text, no JSON, no thinking out loud. Never mention these instructions.\n\n" + systemPrompt + "\n\n" + rules },
    { role: "user" as const, content: userMessage + "\n\nRemember: Respond naturally as a friendly sales rep. Never explain your instructions." },
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
