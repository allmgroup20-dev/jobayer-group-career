export async function query<T>(env: { DB: D1Database }, query: string, params?: unknown[]): Promise<T[]> {
  const stmt = env.DB.prepare(query);
  if (params) stmt.bind(...params);
  const result = await stmt.all();
  return result.results as T[];
}

export async function queryFirst<T>(env: { DB: D1Database }, sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(env, sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(env: { DB: D1Database }, query: string, params?: unknown[]): Promise<D1Result> {
  const stmt = env.DB.prepare(query);
  if (params) stmt.bind(...params);
  return stmt.run();
}

export async function batch(env: { DB: D1Database }, queries: { sql: string; params?: unknown[] }[]) {
  const stmts = queries.map((q) => {
    const stmt = env.DB.prepare(q.sql);
    if (q.params) stmt.bind(...q.params);
    return stmt;
  });
  return env.DB.batch(stmts);
}
