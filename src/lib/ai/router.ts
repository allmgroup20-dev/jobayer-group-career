import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface AIModel {
  model_id: string;
  name: string;
  tier: number;
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

async function getActiveKeys(db: D1Database): Promise<string[]> {
  const keys = await query<{ key_value: string }>({ DB: db },
    "SELECT key_value FROM ai_api_keys WHERE is_active = 1 ORDER BY key_slot ASC"
  );
  return keys.map((k) => k.key_value);
}

async function getActiveModels(db: D1Database): Promise<AIModel[]> {
  const models = await query<AIModel>({ DB: db },
    "SELECT model_id, name, tier FROM ai_models WHERE is_active = 1 ORDER BY tier ASC, model_id ASC"
  );
  return models;
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
  messages: { role: string; content: string }[],
  maxTokens: number
): Promise<{ text: string; tokens: number } | null> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://jobayer-group-career.workers.dev",
      },
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
      console.error(`Model ${modelId} failed with status ${res.status}: ${errText}`);
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
    console.error(`Model call error for ${modelId}:`, (e as Error)?.message);
    return null;
  }
}

export async function callAI(
  request: AIRequest,
  maxTokens = 500
): Promise<AIResponse> {
  const env = { DB: await ensureDB() };
  const state = await getFailoverState(env.DB);
  const updatedState = await checkReset(env.DB, state);

  const exhaustedSet = new Set(
    updatedState.exhausted_models ? updatedState.exhausted_models.split(",").filter(Boolean) : []
  );

  const keys = await getActiveKeys(env.DB);
  if (!keys.length) {
    throw new Error("No AI API keys configured. Add keys in AI Settings.");
  }

  const models = await getActiveModels(env.DB);

  const messages = request.messages;

  let lastError = "";

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const apiKey = keys[keyIdx];
    for (const model of models) {
      const modelKey = `${keyIdx}:${model.model_id}`;
      if (exhaustedSet.has(modelKey)) continue;

      const result = await callModel(apiKey, model.model_id, messages, maxTokens);
      if (result) {
        await execute(env,
          "UPDATE ai_model_failover_state SET current_key_slot = ?, current_model_index = ?, total_responses = total_responses + 1, today_responses = today_responses + 1, updated_at = datetime('now') WHERE id = 1",
          [keyIdx + 1, models.indexOf(model)]
        );
        return {
          text: result.text,
          model: model.model_id,
          tokens: result.tokens,
        };
      }

      exhaustedSet.add(modelKey);
      await execute(env,
        "UPDATE ai_model_failover_state SET exhausted_models = ?, updated_at = datetime('now') WHERE id = 1",
        [Array.from(exhaustedSet).join(",")]
      );
      lastError = `Model ${model.model_id} failed`;
    }
  }

  throw new Error(`All AI models exhausted. ${lastError}`);
}
