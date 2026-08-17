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

let _workerColsEnsured = false;

// Ensures the workers table has the location columns before any query that
// references them. Old databases created before the location feature won't have
// division/district/upazila; without this, /api/me SELECT fails with
// "no such column" and the onboarding page redirects back to login.
export async function ensureWorkerProfileColumns(env: { DB: D1Database }): Promise<void> {
  if (_workerColsEnsured) return;
  try {
    const info = await env.DB.prepare("PRAGMA table_info(workers)").all<{ name: string }>();
    const names = info.results?.map((r) => r.name) || [];
    for (const col of ["division", "district", "upazila", "city_corporation", "ward", "area", "union", "pourashava"]) {
      if (!names.includes(col)) {
        try { await env.DB.prepare(`ALTER TABLE workers ADD COLUMN ${col} TEXT`).run(); } catch {}
      }
    }
    _workerColsEnsured = true;
  } catch { /* ignore */ }
}
