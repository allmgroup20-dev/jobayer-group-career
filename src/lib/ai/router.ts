import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface AIRequest {
  messages: { role: string; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse {
  text: string;
  model: string;
  tokens: number;
}

interface ApiKey {
  id: number;
  key_value: string;
  provider: string;
}

interface FailoverState {
  total_responses: number;
  today_responses: number;
  exhausted_models: string;
  last_reset_date: string;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  opencode: "https://opencode.ai/zen/v1/chat/completions",
};

const COOLDOWN_MS = 300_000;

const RETRY_BACKOFF = [200, 800, 2_000];

const TIMEOUT_MS: Record<string, number> = {
  "openrouter/free": 30_000,
  default: 15_000,
};

const FREE_MODEL_ORDER: Record<string, string[]> = {
  openrouter: [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
    "qwen/qwen3-coder:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "cohere/north-mini-code:free",
    "openai/gpt-oss-20b:free",
    "poolside/laguna-m.1:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "nvidia/nemotron-3.5-content-safety:free",
    "poolside/laguna-xs-2.1:free",
    "tencent/hy3:free",
  ],
  opencode: [
    "deepseek-v4-flash-free",
    "nemotron-3-ultra-free",
    "mimo-v2.5-free",
    "north-mini-code-free",
    "hy3-free",
    "big-pickle",
  ],
};

// ─── Cooldown Helpers ───────────────────────────────────

function parseCooldowns(raw: string): Record<string, number> {
  if (!raw) return {};
  if (raw.startsWith("{")) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return {};
}

function isOnCooldown(cooldowns: Record<string, number>, modelKey: string): boolean {
  const until = cooldowns[modelKey];
  if (!until) return false;
  if (Date.now() >= until) {
    delete cooldowns[modelKey];
    return false;
  }
  return true;
}

async function purgeExpiredCooldowns(db: D1Database, cooldowns: Record<string, number>): Promise<void> {
  const now = Date.now();
  let changed = false;
  for (const key of Object.keys(cooldowns)) {
    if (now >= cooldowns[key]) {
      delete cooldowns[key];
      changed = true;
    }
  }
  if (changed) {
    await execute({ DB: db },
      "UPDATE ai_model_failover_state SET exhausted_models = ? WHERE id = 1",
      [JSON.stringify(cooldowns)]
    );
  }
}

async function recordCooldown(db: D1Database, modelKey: string, cooldowns: Record<string, number>): Promise<void> {
  cooldowns[modelKey] = Date.now() + COOLDOWN_MS;
  await execute({ DB: db },
    "UPDATE ai_model_failover_state SET exhausted_models = ? WHERE id = 1",
    [JSON.stringify(cooldowns)]
  );
}

// ─── DB Helpers ─────────────────────────────────────────

async function getState(db: D1Database): Promise<FailoverState> {
  let s = await queryFirst<FailoverState>({ DB: db },
    "SELECT * FROM ai_model_failover_state WHERE id = 1"
  );
  if (!s) {
    await execute({ DB: db },
      "INSERT INTO ai_model_failover_state (id, total_responses, today_responses, exhausted_models, last_reset_date) VALUES (1, 0, 0, '{}', datetime('now'))"
    );
    s = { total_responses: 0, today_responses: 0, exhausted_models: "{}", last_reset_date: "" };
  }
  return s;
}

async function dailyReset(db: D1Database, state: FailoverState): Promise<FailoverState> {
  const today = new Date().toISOString().split("T")[0];
  if (state.last_reset_date !== today) {
    await execute({ DB: db },
      "UPDATE ai_model_failover_state SET exhausted_models = '{}', today_responses = 0, last_reset_date = ? WHERE id = 1",
      [today]
    );
    return { ...state, exhausted_models: "{}", today_responses: 0, last_reset_date: today };
  }
  return state;
}

async function getAllKeys(db: D1Database): Promise<ApiKey[]> {
  return query<ApiKey>({ DB: db },
    "SELECT id, key_value, provider FROM ai_api_keys WHERE is_active = 1 ORDER BY id ASC"
  );
}

async function recordSuccess(db: D1Database): Promise<void> {
  await execute({ DB: db },
    "UPDATE ai_model_failover_state SET total_responses = total_responses + 1, today_responses = today_responses + 1 WHERE id = 1"
  );
}

// ─── Model Caller with Retry + Backoff + Timeout ────────

async function tryModel(
  apiKey: string,
  provider: string,
  modelId: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature?: number
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

  const timeoutMs = TIMEOUT_MS[modelId] || TIMEOUT_MS.default;
  const maxRetries = modelId === "openrouter/free" ? 3 : 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BACKOFF[Math.min(attempt - 1, RETRY_BACKOFF.length - 1)];
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), timeoutMs);

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: modelId, messages, max_tokens: maxTokens, ...(temperature !== undefined && { temperature }) }),
        signal: ac.signal,
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status === 500 || res.status === 503) continue;
      if (!res.ok) return null;

      const data = await res.json() as {
        choices?: { message: { content: string | null } }[];
        usage?: { total_tokens: number };
      };
      const text = data?.choices?.[0]?.message?.content || "";
      if (!text && attempt < maxRetries) continue;
      if (!text) return null;
      return { text, tokens: data?.usage?.total_tokens || 0 };
    } catch (e) {
      const msg = (e as Error)?.message || "";
      const isTransient = msg.includes("abort") || msg.includes("timed out") || msg.includes("network") || msg.includes("econnrefused") || msg.includes("enotfound");
      if (!isTransient) return null;
      if (attempt >= maxRetries) return null;
    }
  }

  return null;
}

// ─── DB-Driven Model List ──────────────────────────────

async function getDBModelList(db: D1Database, provider: string): Promise<string[] | null> {
  const rows = await query<{ model_id: string }>(
    { DB: db },
    "SELECT model_id FROM ai_models WHERE provider = ? AND is_active = 1 ORDER BY tier ASC, model_id ASC",
    [provider]
  );
  if (rows.length > 0) return rows.map((r) => r.model_id);
  return null;
}

async function resolveModelList(db: D1Database, provider: string): Promise<string[]> {
  const dbModels = await getDBModelList(db, provider);
  if (dbModels) return dbModels;
  return FREE_MODEL_ORDER[provider] || [];
}

// ─── Core Failover Logic ────────────────────────────────

export async function callAI(
  request: AIRequest,
  maxTokens = 500,
  preferredModel?: string,
  preferredProvider?: string
): Promise<AIResponse> {
  const db = await ensureDB();
  const env = { DB: db };

  const state = await getState(db);
  const resetState = await dailyReset(db, state);
  const cooldowns = parseCooldowns(resetState.exhausted_models || "");
  await purgeExpiredCooldowns(db, cooldowns);

  const allKeys = await getAllKeys(db);
  if (allKeys.length === 0) {
    throw new Error("No API keys configured. Add at least one key in AI Settings.");
  }

  const messages = request.messages;

  const providerOrder = preferredProvider
    ? [preferredProvider, ...["openrouter", "opencode"].filter((p) => p !== preferredProvider)]
    : ["openrouter", "opencode"];

  for (const key of allKeys) {
    const { id: keyId, key_value: apiKey, provider } = key;
    if (!providerOrder.includes(provider)) continue;

    const modelList = await resolveModelList(db, provider);
    if (modelList.length === 0) continue;

    const modelsToTry = preferredModel && providerOrder.indexOf(provider) === 0
      ? [preferredModel, ...modelList.filter((m) => m !== preferredModel)]
      : modelList;

    const isFreeRouterProvider = provider === "openrouter";
    const hasFreeRouter = isFreeRouterProvider && modelsToTry.includes("openrouter/free");
    const staticModels = modelsToTry.filter(m => m !== "openrouter/free");

    for (const modelId of staticModels) {
      const modelKey = `k${keyId}|${provider}|${modelId}`;
      if (isOnCooldown(cooldowns, modelKey)) continue;

      const result = await tryModel(apiKey, provider, modelId, messages, maxTokens, request.temperature);
      if (result) {
        await recordSuccess(db);
        return { text: result.text, model: `${provider}:${modelId}`, tokens: result.tokens };
      }

      await recordCooldown(db, modelKey, cooldowns);
      console.warn(`[FAILOVER] ${provider} key#${keyId} model ${modelId} — cooling down 5min`);
    }

    if (hasFreeRouter) {
      for (let i = 0; i < 2; i++) {
        if (i === 1) await new Promise(r => setTimeout(r, 1_000));

        const result = await tryModel(apiKey, provider, "openrouter/free", messages, maxTokens, request.temperature);
        if (result) {
          await recordSuccess(db);
          return { text: result.text, model: `${provider}:openrouter/free`, tokens: result.tokens };
        }
        console.warn(`[FAILOVER] openrouter/free attempt ${i + 1} — transient, retrying...`);
      }
    }

    console.warn(`[FAILOVER] ${provider} key#${keyId} — all models failed, moving to next key`);
  }

  const onCooldown = Object.entries(cooldowns)
    .filter(([, until]) => Date.now() < until)
    .map(([key]) => key)
    .join(", ");

  throw new Error(
    `All models temporarily unavailable across ${allKeys.length} API key(s). ` +
    `On cooldown: ${onCooldown || "none"}. ` +
    `Retry after cooldown (5 min) expires.`
  );
}
