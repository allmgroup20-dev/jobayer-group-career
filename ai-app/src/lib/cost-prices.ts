// Static price table used to estimate API spend. USD amounts are per 1,000,000
// tokens (input / output) for common OpenRouter-hosted models. Unknown models
// fall back to conservative defaults. ":free" models are always $0.

export const MODEL_INPUT_USD_PER_1M: Record<string, number> = {
  "gpt-4o": 2.5,
  "gpt-4o-mini": 0.15,
  "gpt-4.1-mini": 0.4,
  "gpt-4.1": 2,
  "gpt-4-turbo": 10,
  "gpt-3.5-turbo": 0.5,
  "deepseek-chat": 0.27,
  "deepseek-r1": 0.55,
  "deepseek-v3": 0.27,
  "deepseek-v4": 0.27,
  "gemini-2.0-flash": 0.1,
  "gemini-2.5-flash": 0.3,
  "gemini-1.5-flash": 0.075,
  "gemini-1.5-pro": 1.25,
  "claude-3.5-sonnet": 3,
  "claude-3.5-haiku": 0.8,
  "claude-3-haiku": 0.25,
  "claude-sonnet-4": 3,
  "llama-3.3-70b-instruct": 0.2,
  "llama-3.1-8b-instruct": 0.03,
  "llama-3.1-70b-instruct": 0.24,
  "llama-3.1-405b": 1.8,
  "llama-3.2-3b-instruct": 0.04,
  "qwen2.5-coder": 0.18,
  "qwen3-coder": 0.18,
  "nemotron-3-ultra": 0.25,
  "hermes-3-llama-3.1-405b": 0.25,
};

export const MODEL_OUTPUT_USD_PER_1M: Record<string, number> = {
  "gpt-4o": 10,
  "gpt-4o-mini": 0.6,
  "gpt-4.1-mini": 1.6,
  "gpt-4.1": 8,
  "gpt-4-turbo": 30,
  "gpt-3.5-turbo": 1.5,
  "deepseek-chat": 1.1,
  "deepseek-r1": 2.19,
  "deepseek-v3": 1.1,
  "deepseek-v4": 1.1,
  "gemini-2.0-flash": 0.4,
  "gemini-2.5-flash": 2.5,
  "gemini-1.5-flash": 0.3,
  "gemini-1.5-pro": 5,
  "claude-3.5-sonnet": 15,
  "claude-3.5-haiku": 4,
  "claude-3-haiku": 1.25,
  "claude-sonnet-4": 15,
  "llama-3.3-70b-instruct": 0.2,
  "llama-3.1-8b-instruct": 0.06,
  "llama-3.1-70b-instruct": 0.24,
  "llama-3.1-405b": 1.8,
  "llama-3.2-3b-instruct": 0.04,
  "qwen2.5-coder": 0.18,
  "qwen3-coder": 0.18,
  "nemotron-3-ultra": 0.25,
  "hermes-3-llama-3.1-405b": 0.25,
};

export const DEFAULT_INPUT_USD_PER_1M = 0.25;
export const DEFAULT_OUTPUT_USD_PER_1M = 0.75;

// Per-message/unit costs (USD). Adjust from /company/api-costs.
export const WHATSAPP_MSG_USD = 0.0052; // Meta Cloud API, Bangladesh (marketing/utility avg)
export const SMS_MSG_USD = 0.03;        // typical gateway rate
export const EMAIL_USD = 0.0001;        // SendGrid (free tier covers most)

export function isFreeModel(model: string): boolean {
  return /:free$|free$/i.test(model);
}

function baseModelName(model: string): string {
  let m = model.toLowerCase();
  if (m.startsWith("openrouter:")) m = m.slice("openrouter:".length);
  if (m.startsWith("opencode:")) m = m.slice("opencode:".length);
  if (m.endsWith(":free")) m = m.slice(0, -":free".length);
  // strip vendor prefix like "meta-llama/llama-..." → keep after "/"
  const slash = m.indexOf("/");
  if (slash !== -1) m = m.slice(slash + 1);
  return m;
}

export function estimateTokenCost(model: string, inTokens: number, outTokens: number): number {
  if (!model || isFreeModel(model)) return 0;
  const base = baseModelName(model);
  const inP = MODEL_INPUT_USD_PER_1M[base] ?? DEFAULT_INPUT_USD_PER_1M;
  const outP = MODEL_OUTPUT_USD_PER_1M[base] ?? DEFAULT_OUTPUT_USD_PER_1M;
  return (inTokens / 1_000_000) * inP + (outTokens / 1_000_000) * outP;
}