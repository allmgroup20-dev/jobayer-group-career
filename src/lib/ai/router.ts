import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface AIModel {
  model_id: string;
  name: string;
  tier: number;
  provider: string;
}

interface FailoverState {
  current_key_slot: number;
  current_model_index: number;
  exhausted_models: string;
  total_responses: number;
  today_responses: number;
  last_reset_date: string;
}

interface AIRequest {
  messages: { role: string; content: string }[];
  maxTokens?: number;
}

interface AIResponse {
  text: string;
  model: string;
  tokens: number;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  opencode: "https://opencode.ai/zen/v1/chat/completions",
};

async function getFailoverState(db: D1Database): Promise<FailoverState> {
  let state = await queryFirst<FailoverState>({ DB: db },
    "SELECT * FROM ai_model_failover_state WHERE id = 1"
  );
  if (!state) {
    await execute({ DB: db },
      "INSERT INTO ai_model_failover_state (id, current_key_slot, current_model_index, exhausted_models, total_responses, today_responses, last_reset_date) VALUES (1, 1, 0, '', 0, 0, datetime('now'))"
    );
    state = { current_key_slot: 1, current_model_index: 0, exhausted_models: "", total_responses: 0, today_responses: 0, last_reset_date: "" };
  }
  return state;
}

async function getActiveKeys(db: D1Database, provider?: string): Promise<string[]> {
  const sql = provider
    ? "SELECT key_value FROM ai_api_keys WHERE is_active = 1 AND provider = ? ORDER BY id ASC"
    : "SELECT key_value FROM ai_api_keys WHERE is_active = 1 ORDER BY id ASC";
  const params = provider ? [provider] : [];
  const keys = await query<{ key_value: string }>({ DB: db }, sql, params);
  return keys.map((k) => k.key_value);
}

async function getActiveModels(db: D1Database, provider?: string): Promise<AIModel[]> {
  const sql = provider
    ? "SELECT model_id, name, tier, provider FROM ai_models WHERE is_active = 1 AND provider = ? ORDER BY tier ASC, model_id ASC"
    : "SELECT model_id, name, tier, provider FROM ai_models WHERE is_active = 1 ORDER BY tier ASC, model_id ASC";
  const params = provider ? [provider] : [];
  return query<AIModel>({ DB: db }, sql, params);
}

async function checkReset(db: D1Database, state: FailoverState): Promise<FailoverState> {
  const today = new Date().toISOString().split("T")[0];
  if (state.last_reset_date !== today) {
    await execute({ DB: db },
      "UPDATE ai_model_failover_state SET exhausted_models = '', today_responses = 0, last_reset_date = ?, updated_at = datetime('now') WHERE id = 1",
      [today]
    );
    return { ...state, exhausted_models: "", today_responses: 0, last_reset_date: today };
  }
  return state;
}

async function callModel(
  apiKey: string,
  modelId: string,
  provider: string,
  messages: { role: string; content: string }[],
  maxTokens: number
): Promise<{ text: string; tokens: number } | null> {
  const endpoint = PROVIDER_ENDPOINTS[provider];
  if (!endpoint) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://jobayer-group-career.workers.dev";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: maxTokens,
      }),
    });

    if (res.status === 429 || res.status === 500 || res.status === 503) {
      return null;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[${provider}] Model ${modelId} failed with status ${res.status}: ${errText}`);
      return null;
    }

    const data = await res.json() as {
      choices?: { message: { content: string } }[];
      usage?: { total_tokens: number };
    };

    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    return {
      text,
      tokens: data.usage?.total_tokens || 0,
    };
  } catch (e) {
    console.error(`[${provider}] Model call error for ${modelId}:`, (e as Error)?.message);
    return null;
  }
}

async function tryProviderStage(
  env: { DB: D1Database },
  provider: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  exhaustedSet: Set<string>
): Promise<AIResponse | null> {
  const keys = await getActiveKeys(env.DB, provider);
  if (!keys.length) return null;

  const models = await getActiveModels(env.DB, provider);
  if (!models.length) return null;

  let lastError = "";

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const apiKey = keys[keyIdx];
    for (const model of models) {
      const modelKey = `${provider}|${keyIdx}|${model.model_id}`;
      if (exhaustedSet.has(modelKey)) continue;

      const result = await callModel(apiKey, model.model_id, provider, messages, maxTokens);
      if (result) {
        await execute(env,
          "UPDATE ai_model_failover_state SET total_responses = total_responses + 1, today_responses = today_responses + 1, updated_at = datetime('now') WHERE id = 1"
        );
        return {
          text: result.text,
          model: `${provider}:${model.model_id}`,
          tokens: result.tokens,
        };
      }

      exhaustedSet.add(modelKey);
      await execute(env,
        "UPDATE ai_model_failover_state SET exhausted_models = ?, updated_at = datetime('now') WHERE id = 1",
        [Array.from(exhaustedSet).join(",")]
      );
      lastError = `[${provider}] Model ${model.model_id} failed`;
    }
  }

  console.error(lastError);
  return null;
}

export async function callAI(
  request: AIRequest,
  maxTokens = 500,
  preferredModel?: string,
  preferredProvider?: string
): Promise<AIResponse> {
  const env = { DB: await ensureDB() };

  const state = await getFailoverState(env.DB);
  const updatedState = await checkReset(env.DB, state);

  const exhaustedSet = new Set(
    updatedState.exhausted_models ? updatedState.exhausted_models.split(",").filter(Boolean) : []
  );

  const messages = request.messages;

  const openrouterKeys = await getActiveKeys(env.DB, "openrouter");
  const opencodeKeys = await getActiveKeys(env.DB, "opencode");
  if (!openrouterKeys.length && !opencodeKeys.length) {
    throw new Error("No AI API keys configured. Add OpenRouter or OpenCode keys in AI Settings.");
  }

  // If preferredProvider is given, try that provider first
  const providers = preferredProvider
    ? [preferredProvider, ...["openrouter", "opencode"].filter((p) => p !== preferredProvider)]
    : ["openrouter", "opencode"];

  for (const provider of providers) {
    const providerKeys = provider === "openrouter" ? openrouterKeys : opencodeKeys;
    if (!providerKeys.length) continue;

    // Try preferred model first within this provider, then all models
    let result: AIResponse | null = null;
    if (preferredModel) {
      result = await tryPreferredModel(env, provider, preferredModel, messages, maxTokens, exhaustedSet);
      if (result) return result;
    }
    result = await tryProviderStage(env, provider, messages, maxTokens, exhaustedSet);
    if (result) return result;
  }

  throw new Error("All AI models exhausted across all providers.");
}

async function tryPreferredModel(
  env: { DB: D1Database },
  provider: string,
  modelId: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  exhaustedSet: Set<string>
): Promise<AIResponse | null> {
  const keys = await getActiveKeys(env.DB, provider);
  if (!keys.length) return null;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const apiKey = keys[keyIdx];
    const modelKey = `${provider}|${keyIdx}|${modelId}`;
    if (exhaustedSet.has(modelKey)) continue;

    const result = await callModel(apiKey, modelId, provider, messages, maxTokens);
    if (result) {
      await execute(env,
        "UPDATE ai_model_failover_state SET total_responses = total_responses + 1, today_responses = today_responses + 1, updated_at = datetime('now') WHERE id = 1"
      );
      return {
        text: result.text,
        model: `${provider}:${modelId}`,
        tokens: result.tokens,
      };
    }

    exhaustedSet.add(modelKey);
    await execute(env,
      "UPDATE ai_model_failover_state SET exhausted_models = ?, updated_at = datetime('now') WHERE id = 1",
      [Array.from(exhaustedSet).join(",")]
    );
  }

  return null;
}
