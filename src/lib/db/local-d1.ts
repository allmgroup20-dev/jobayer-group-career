const g = globalThis as any;
const GLOBAL_KEY = "__localD1State";

interface TableState {
  rows: Record<string, unknown>[];
  nextId: number;
}

if (!g[GLOBAL_KEY]) {
  g[GLOBAL_KEY] = {};
}

let state = g[GLOBAL_KEY] as Record<string, TableState>;

function load() {
  if (Object.keys(state).length > 0) return;
  console.log("[local-d1] seeding defaults");
  seedState();
  console.log(`[local-d1] ready: ${Object.keys(state).length} tables`);
}

function save() {
  // state persists via globalThis reference; no file I/O needed
}

function ensureTable(name: string) {
  if (!state[name]) state[name] = { rows: [], nextId: 1 };
}

function insertRow(table: string, cols: string[], vals: unknown[]) {
  ensureTable(table);
  const t = state[table]!;
  const row: Record<string, unknown> = { id: t.nextId };
  cols.forEach((c, i) => {
    const v = vals[i];
    row[c] = v === null || v === undefined ? null : v;
  });
  t.rows.push(row);
  t.nextId++;
}

function seedState() {
  const users = [
    { username: "admin", password: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", name: "Company Admin", role: "superadmin" },
    { username: "JOBAYER GROUP", password: "52d1d87c3b2027f3f2660015ddf6463e97430b4e60099217143ac75a45646aa1", name: "JOBAYER GROUP", role: "superadmin" },
  ];
  ensureTable("company_users");
  for (const u of users) {
    const exists = state.company_users!.rows.some((r) => r.username === u.username);
    if (!exists) {
      u as Record<string, unknown>;
      const row: Record<string, unknown> = { id: state.company_users!.nextId, ...u };
      state.company_users!.rows.push(row);
      state.company_users!.nextId++;
    }
  }

  ensureTable("commission_levels");
  const levelDefaults = [
    { level_number: 1, level_name: "Level 1", percentage: 10, fixed_amount: 0, currency: "BDT", is_active: 1, commission_type: "both", min_referral_base: 3 },
    { level_number: 2, level_name: "Level 2", percentage: 5, fixed_amount: 0, currency: "BDT", is_active: 1, commission_type: "both", min_referral_base: 3 },
    { level_number: 3, level_name: "Level 3", percentage: 3, fixed_amount: 0, currency: "BDT", is_active: 1, commission_type: "both", min_referral_base: 3 },
    { level_number: 4, level_name: "Level 4", percentage: 2, fixed_amount: 0, currency: "BDT", is_active: 1, commission_type: "both", min_referral_base: 3 },
    { level_number: 5, level_name: "Level 5", percentage: 1, fixed_amount: 0, currency: "BDT", is_active: 1, commission_type: "both", min_referral_base: 3 },
  ];
  for (const lvl of levelDefaults) {
    const exists = state.commission_levels!.rows.some((r) => r.level_number === lvl.level_number);
    if (!exists) {
      const row: Record<string, unknown> = { id: state.commission_levels!.nextId, ...lvl };
      state.commission_levels!.rows.push(row);
      state.commission_levels!.nextId++;
    }
  }

  ensureTable("company_settings");
  const settingDefaults = [
    { setting_key: "sslcommerz_test_store_id", setting_value: "" },
    { setting_key: "sslcommerz_test_store_password", setting_value: "" },
    { setting_key: "sslcommerz_live_store_id", setting_value: "" },
    { setting_key: "sslcommerz_live_store_password", setting_value: "" },
    { setting_key: "sslcommerz_mode", setting_value: "test" },
  ];
  for (const s of settingDefaults) {
    const exists = state.company_settings!.rows.some((r) => r.setting_key === s.setting_key);
    if (!exists) {
      const row: Record<string, unknown> = { id: state.company_settings!.nextId, ...s };
      state.company_settings!.rows.push(row);
      state.company_settings!.nextId++;
    }
  }

  save();
}

function parseTableRef(sql: string): string | null {
  const m = sql.match(/(?:FROM|INTO|UPDATE)\s+`?(\w+)`?/i);
  return m ? m[1] : null;
}

function evalWhere(sql: string, row: Record<string, unknown>, params: unknown[]): boolean {
  const wi = sql.toUpperCase().indexOf("WHERE");
  if (wi === -1) return true;
  const clause = sql.slice(wi + 5).trim();
  const conds = clause.split(/\s+AND\s+/i);
  let pi = 0;
  for (const c of conds) {
    const colMatch = c.match(/(?:\w+\s*\(?\s*)?`?(\w+)`?\s*\)?\s*=\s*\??/i);
    if (!colMatch) continue;
    const col = colMatch[1];
    let rowVal = row[col];
    const val = params[pi];
    const leftFn = c.match(/^(\w+)\s*\(/i);
    if (leftFn) {
      const fn = leftFn[1].toUpperCase();
      if (fn === "LOWER") rowVal = String(rowVal).toLowerCase();
      else if (fn === "UPPER") rowVal = String(rowVal).toUpperCase();
    }
    if (String(rowVal) !== String(val)) return false;
    pi++;
  }
  return true;
}

function extractCols(sql: string): string[] {
  const m = sql.match(/\(([^)]+)\)\s*(?:VALUES|SELECT|ON\s|$)/i);
  if (!m) return [];
  return m[1].split(",").map((c) => c.trim().replace(/`/g, "").split(/\s+/)[0]).filter(Boolean);
}

function parseInsertValues(sql: string): (string | null)[] {
  const startMatch = sql.match(/VALUES\s*\(/i);
  if (!startMatch) return [];
  let i = startMatch.index! + startMatch[0].length;
  let depth = 1;
  while (i < sql.length && depth > 0) {
    if (sql[i] === '(') depth++;
    if (sql[i] === ')') depth--;
    if (depth > 0) i++;
  }
  const s = sql.slice(startMatch.index! + startMatch[0].length, i);
  const r: (string | null)[] = [];
  let j = 0;
  while (j < s.length) {
    const ch = s[j];
    if (ch === ' ' || ch === ',' || ch === '\t' || ch === '\n' || ch === '\r') { j++; continue; }
    if (ch === '?') { r.push(null); j++; continue; }
    if (ch === "'") {
      let v = ''; j++;
      while (j < s.length && !(s[j] === "'" && (j + 1 >= s.length || s[j + 1] !== "'"))) {
        if (s[j] === "'" && j + 1 < s.length && s[j + 1] === "'") { v += "'"; j += 2; }
        else { v += s[j]; j++; }
      }
      j++; r.push(v); continue;
    }
    if ((ch >= '0' && ch <= '9') || ch === '-' || ch === '+') {
      let n = ''; if (ch === '-' || ch === '+') { n += s[j]; j++; }
      while (j < s.length && ((s[j] >= '0' && s[j] <= '9') || s[j] === '.')) { n += s[j]; j++; }
      r.push(n); continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let w = '';
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) { w += s[j]; j++; }
      if (w.toUpperCase() === 'NULL') { r.push('__NULL__'); continue; }
      if (j < s.length && s[j] === '(') {
        let d = 1; j++;
        while (j < s.length && d > 0) { if (s[j] === '(') d++; if (s[j] === ')') d--; j++; }
        r.push(/^datetime/i.test(w) ? '__NOW__' : '__FN__');
      } else { r.push(w); }
      continue;
    }
    j++;
  }
  return r;
}

function countSetParams(sql: string): number {
  const m = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
  if (!m) return 0;
  const s = m[1]; let c = 0, q = false;
  for (let j = 0; j < s.length; j++) {
    if (s[j] === "'") q = !q;
    if (!q && s[j] === '?') c++;
  }
  return c;
}

function resolveSetExpr(expr: string, currentVal: unknown, bindVal?: unknown): unknown {
  const normalized = (bindVal !== undefined ? expr.replace(/\?/g, () => String(bindVal ?? 0)) : expr).trim();
  if (normalized === '?') return bindVal ?? null;
  const mAdd = normalized.match(/^`?(\w+)`?\s*\+\s*(\d+(?:\.\d+)?)$/i);
  if (mAdd) return (Number(currentVal) || 0) + parseFloat(mAdd[2]);
  const mSub = normalized.match(/^`?(\w+)`?\s*-\s*(\d+(?:\.\d+)?)$/i);
  if (mSub) return (Number(currentVal) || 0) - parseFloat(mSub[2]);
  const mMul = normalized.match(/^`?(\w+)`?\s*\*\s*(\d+(?:\.\d+)?)$/i);
  if (mMul) return (Number(currentVal) || 0) * parseFloat(mMul[2]);
  const mDiv = normalized.match(/^`?(\w+)`?\s*\/\s*(\d+(?:\.\d+)?)$/i);
  if (mDiv) return (Number(currentVal) || 0) / parseFloat(mDiv[2]);
  if (normalized.startsWith("'") && normalized.endsWith("'")) return normalized.slice(1, -1);
  const n = parseFloat(normalized);
  if (!isNaN(n) && normalized !== '') return n;
  return null;
}

const statementFactory = (sql: string) => {
  const s: Record<string, unknown> = { _sql: sql, _params: [] as unknown[] };
  s.bind = function (...p: unknown[]) { (this as any)._params = p; return this; };
  s.all = function () {
    const table = parseTableRef(sql);
    if (!table) return { results: [], success: true };
    ensureTable(table);
    const rows = state[table]!.rows.filter(r => evalWhere(sql, r, (this as any)._params));
    return { results: rows, success: true };
  };
  s.first = function (col?: string) {
    const r: { results: unknown[] } = (this as any).all();
    const row = r.results[0] || null;
    if (!row) return null;
    if (col) return (row as Record<string, unknown>)[col] ?? null;
    return row;
  };
  s.run = function () {
    const table = parseTableRef(sql);
    if (!table) return { success: true, meta: { changes: 0, last_row_id: 0 } };
    ensureTable(table);
    const t = state[table]!;
    const sc = sql.trim().toUpperCase();

    if (sc.startsWith("DELETE")) {
      const toDelete = t.rows.filter(r => evalWhere(sql, r, (this as any)._params));
      t.rows = t.rows.filter(r => !toDelete.includes(r));
      save();
      return { success: true, meta: { changes: toDelete.length, last_row_id: 0 } };
    }

    if (sc.startsWith("INSERT")) {
      const cols = extractCols(sql);
      if (cols.length === 0) return { success: true, meta: { changes: 0, last_row_id: 0 } };
      const vals = (this as any)._params as unknown[];
      const parsed = parseInsertValues(sql);
      let pi = 0;
      const row: Record<string, unknown> = { id: t.nextId };
      cols.forEach((c, i) => {
        const pv = i < parsed.length ? parsed[i] : null;
        if (pv === null) {
          row[c] = pi < vals.length ? (vals[pi] === null || vals[pi] === undefined ? null : vals[pi]) : null;
          pi++;
        } else if (pv === '__NULL__') {
          row[c] = null;
        } else if (pv === '__NOW__') {
          row[c] = new Date().toISOString().replace('T', ' ').split('.')[0];
        } else if (pv === '__FN__') {
          row[c] = null;
        } else {
          row[c] = pv;
        }
      });
      const isReplace = sc.includes("REPLACE");
      if (isReplace) {
        const uniqueCol = "level_number";
        const idx = cols.indexOf(uniqueCol);
        if (idx !== -1) {
          const keyVal = String(row[uniqueCol]);
          t.rows = t.rows.filter((r) => String(r[uniqueCol]) !== keyVal);
        }
      }
      t.rows.push(row);
      t.nextId++;
      save();
      return { success: true, meta: { changes: 1, last_row_id: t.nextId - 1 } };
    }

    if (sc.startsWith("UPDATE")) {
      const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
      if (!setMatch) return { success: true, meta: { changes: 0, last_row_id: 0 } };
      const setParts = setMatch[1].split(",");
      const setCols: string[] = [];
      const setExprs: string[] = [];
      for (const part of setParts) {
        const eq = part.match(/`?(\w+)`?\s*=\s*(.+)/);
        if (eq) { setCols.push(eq[1]); setExprs.push(eq[2].trim()); }
      }
      const params = (this as any)._params as unknown[];
      const setParamCount = countSetParams(sql);
      const targets = sc.includes("WHERE") ? t.rows.filter(r => evalWhere(sql, r, params.slice(setParamCount))) : [...t.rows];
      let changes = 0;
      let bindIdx = 0;
      for (const row of targets) {
        setExprs.forEach((expr, i) => {
          const col = setCols[i];
          const needsBind = (expr.match(/\?/) || []).length;
          if (needsBind > 0) {
            const args = params.slice(bindIdx, bindIdx + needsBind);
            row[col] = resolveSetExpr(expr.replace(/\?/g, () => String(args[0] ?? 0)), row[col]);
            bindIdx += needsBind;
          } else {
            row[col] = resolveSetExpr(expr, row[col]);
          }
        });
        changes++;
      }
      save();
      return { success: true, meta: { changes, last_row_id: 0 } };
    }

    return { success: true, meta: { changes: 0, last_row_id: 0 } };
  };
  return s;
};

export function createLocalDB() {
  load();
  return {
    prepare(sql: string) { return statementFactory(sql) as any; },
    batch(stmts: any[]) { return Promise.resolve(stmts.map((s: any) => s.run())); },
    exec(_sql: string) { return Promise.resolve({ success: true }); },
  };
}
