-- api_cost_logs: every paid external API call (LLM, WhatsApp, SMS, email, etc.)
-- is recorded here so /company/api-costs can show real spend per provider/feature.
CREATE TABLE IF NOT EXISTS api_cost_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  feature TEXT NOT NULL DEFAULT 'general',
  operation TEXT,
  model TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost_usd REAL NOT NULL DEFAULT 0,
  est_cost_usd REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_cost_logs_created ON api_cost_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_cost_logs_provider ON api_cost_logs(provider, created_at);