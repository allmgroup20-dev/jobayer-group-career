import { query, queryFirst, execute } from "@/lib/db/queries";

export function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

export function hashQuery(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export async function checkResponseCache(
  db: D1Database,
  userMessage: string,
  agentId: string
): Promise<string | null> {
  const normalized = normalizeQuery(userMessage);
  const hash = hashQuery(normalized);

  const cached = await queryFirst<{ response: string }>(
    { DB: db },
    "SELECT response FROM ai_response_cache WHERE query_hash = ? AND agent_id = ?",
    [hash, agentId]
  );

  if (cached) {
    await execute(
      { DB: db },
      "UPDATE ai_response_cache SET hit_count = hit_count + 1, last_accessed_at = datetime('now') WHERE query_hash = ? AND agent_id = ?",
      [hash, agentId]
    );
    return cached.response;
  }

  return null;
}

export async function storeResponseCache(
  db: D1Database,
  userMessage: string,
  response: string,
  agentId: string,
  phone = ""
): Promise<void> {
  const normalized = normalizeQuery(userMessage);
  const hash = hashQuery(normalized);

  await execute(
    { DB: db },
    `INSERT OR IGNORE INTO ai_response_cache (query_hash, normalized_query, response, agent_id, phone, created_at, last_accessed_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [hash, normalized, response, agentId, phone]
  );
}
