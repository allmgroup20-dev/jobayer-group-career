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
    for (const col of ["division", "district", "upazila", "city_corporation", "ward", "area", "union_name", "pourashava"]) {
      if (!names.includes(col)) {
        try { await env.DB.prepare(`ALTER TABLE workers ADD COLUMN ${col} TEXT`).run(); } catch {}
      }
    }
    // Share-task / certificate progress columns (share-to-25 feature).
    for (const col of ["share_task_completed_at", "certificate_progress", "certificate_id"]) {
      if (!names.includes(col)) {
        try { await env.DB.prepare(`ALTER TABLE workers ADD COLUMN ${col} TEXT`).run(); } catch {}
      }
    }
    // Certificate name on the certificate + last-edit time (30-day lock).
    for (const col of ["certificate_name", "certificate_name_edited_at"]) {
      if (!names.includes(col)) {
        try { await env.DB.prepare(`ALTER TABLE workers ADD COLUMN ${col} TEXT`).run(); } catch {}
      }
    }
    _workerColsEnsured = true;
  } catch { /* ignore */ }
}

let _phonebookColsEnsured = false;

// Ensures the user_phonebooks table has the share-task tracking columns.
export async function ensurePhonebookColumns(env: { DB: D1Database }): Promise<void> {
  if (_phonebookColsEnsured) return;
  try {
    const info = await env.DB.prepare("PRAGMA table_info(user_phonebooks)").all<{ name: string }>();
    const names = info.results?.map((r) => r.name) || [];
    for (const col of ["status", "sent_at", "share_token", "wa_exists", "group_id"]) {
      if (!names.includes(col)) {
        try { await env.DB.prepare(`ALTER TABLE user_phonebooks ADD COLUMN ${col} TEXT`).run(); } catch {}
      }
    }
    _phonebookColsEnsured = true;
  } catch { /* ignore */ }
}

// Normalizes a phone number to a canonical digit string for dedup matching.
// Strips everything except digits; maps leading 01… to 8801…; keeps last 10-13 digits.
export function normalizePhone(input: string | undefined | null): string {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length === 0) return "";
  let d = digits.startsWith("00") ? digits.slice(2) : digits;
  if (d.startsWith("880")) d = d.slice(3);
  if (d.startsWith("1") && d.length === 10) d = "880" + d;
  if (d.length >= 10 && d.length <= 13 && d.startsWith("880")) return d;
  if (d.length === 10) return "880" + d;
  if (d.length === 11 && d.startsWith("1")) return "880" + d.slice(1);
  return d.length >= 10 ? "880" + d.slice(d.length - 10) : "";
}
