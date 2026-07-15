-- Track brain agent execution for monitoring & analytics
CREATE TABLE IF NOT EXISTS brain_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  text TEXT NOT NULL,
  intent TEXT NOT NULL,
  primary_department TEXT NOT NULL,
  departments_used TEXT DEFAULT '',
  agents_used TEXT DEFAULT '',
  chain_type TEXT DEFAULT 'single',
  model_used TEXT DEFAULT '',
  tokens_used INTEGER DEFAULT 0,
  processing_ms INTEGER DEFAULT 0,
  success INTEGER DEFAULT 1,
  error_message TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_brain_usage_phone ON brain_usage(phone);
CREATE INDEX IF NOT EXISTS idx_brain_usage_dept ON brain_usage(primary_department);
CREATE INDEX IF NOT EXISTS idx_brain_usage_created ON brain_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_brain_usage_intent ON brain_usage(intent);

-- Agent admin config: enable/disable per agent
CREATE TABLE IF NOT EXISTS brain_agent_config (
  agent_id TEXT PRIMARY KEY,
  enabled INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Senior review log for quality monitoring
CREATE TABLE IF NOT EXISTS brain_senior_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  agent_senior_score INTEGER DEFAULT 0,
  appropriateness TEXT DEFAULT 'pass',
  issues TEXT DEFAULT '',
  feedback TEXT DEFAULT '',
  rewritten INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_senior_review_created ON brain_senior_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_senior_review_score ON brain_senior_reviews(agent_senior_score);
