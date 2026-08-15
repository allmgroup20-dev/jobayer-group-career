export async function query<T>(env: { DB: D1Database }, sql: string, params?: unknown[]): Promise<T[]> {
  const stmt = params ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
  const result = await stmt.all();
  return result.results as T[];
}

export async function queryFirst<T>(env: { DB: D1Database }, sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(env, sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(env: { DB: D1Database }, sql: string, params?: unknown[]): Promise<D1Result> {
  const stmt = params ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
  return stmt.run();
}

export async function batch(env: { DB: D1Database }, queries: { sql: string; params?: unknown[] }[]) {
  const stmts = queries.map((q) =>
    q.params ? env.DB.prepare(q.sql).bind(...q.params) : env.DB.prepare(q.sql)
  );
  return env.DB.batch(stmts);
}
