import fs from "fs";
import path from "path";

const STATE_FILE = path.join(process.cwd(), ".open-next", ".local-d1-state.json");

interface TableState {
  rows: Record<string, unknown>[];
  nextId: number;
}

let state: Record<string, TableState> = {};
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {}
  if (!state || Object.keys(state).length === 0) {
    seedState();
  }
}

function save() {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {}
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
    { username: "JOBAYER GROUP", password: "f29286e1bb397108fd4eb194fc8a06929455543360ea87dac092eee24c546fa5", name: "JOBAYER GROUP", role: "superadmin" },
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
    const eq = c.match(/`?(\w+)`?\s*=\s*\??/);
    if (!eq) continue;
    const col = eq[1];
    const val = params[pi];
    if (String(row[col]) !== String(val)) return false;
    pi++;
  }
  return true;
}

const statementFactory = (sql: string) => {
  const s: Record<string, unknown> = { _sql: sql, _params: [] as unknown[] };
  s.bind = function (...p: unknown[]) { (this as any)._params = p; return this; };
  s.all = function () {
    const table = parseTableRef(sql);
    if (!table || !state[table]) return { results: [], success: true };
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
    if (!table || !state[table]) return { success: true, meta: { changes: 0, last_row_id: 0 } };
    const t = state[table]!;
    const sc = sql.trim().toUpperCase();
    if (sc.startsWith("DELETE")) {
      const toDelete = t.rows.filter(r => evalWhere(sql, r, (this as any)._params));
      t.rows = t.rows.filter(r => !toDelete.includes(r));
      save();
      return { success: true, meta: { changes: toDelete.length, last_row_id: 0 } };
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
