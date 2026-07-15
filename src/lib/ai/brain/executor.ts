import { callAI } from "../router";
import type { AgentDef, AgentOutput } from "./types";

const TIER_MODELS: Record<number, { primary: string; fallback: string[]; provider: string }> = {
  1: { primary: "gpt-4o", fallback: ["claude-3.5-sonnet", "deepseek-chat"], provider: "openrouter" },
  2: { primary: "claude-3.5-sonnet", fallback: ["deepseek-chat", "gemini-pro"], provider: "openrouter" },
  3: { primary: "gpt-4o-mini", fallback: ["claude-3-haiku", "gemini-flash"], provider: "openrouter" },
  4: { primary: "gpt-3.5-turbo", fallback: ["gemini-flash", "claude-3-haiku"], provider: "openrouter" },
};

export async function executeAgent(
  agent: AgentDef,
  systemPrompt: string,
  userMessage: string,
  preferredModel?: string
): Promise<AgentOutput> {
  const model = preferredModel || TIER_MODELS[agent.tier].primary;
  const fallbacks = TIER_MODELS[agent.tier].fallback;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userMessage },
  ];

  let lastError = "";
  const modelsToTry = [model, ...fallbacks];

  for (const m of modelsToTry) {
    try {
      const result = await callAI({ messages }, 500, m, "openrouter");
      return {
        agentId: agent.id,
        text: result.text,
        model: result.model,
        tokens: result.tokens,
      };
    } catch (e) {
      lastError = `${m} failed: ${(e as Error).message}`;
    }
  }

  throw new Error(`All models exhausted for agent ${agent.id}: ${lastError}`);
}

export function buildAgentPrompt(agent: AgentDef, ctx: Record<string, any>): string {
  let prompt = agent.promptTemplate;
  for (const [key, val] of Object.entries(ctx)) {
    prompt = prompt.replace(`{{${key}}}`, String(val ?? ""));
  }
  return prompt;
}
