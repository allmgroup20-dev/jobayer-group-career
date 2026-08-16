-- site_content: admin-editable marketing/homepage content (JSON per section)
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- feature_flags: per-feature kill switches (default OFF so nothing unexpected runs)
CREATE TABLE IF NOT EXISTS feature_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_key TEXT UNIQUE NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  label TEXT,
  feature_group TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Content (fake) feeds are admin-editable but DISABLED by default for honesty.
INSERT OR IGNORE INTO feature_flags (feature_key, enabled, label, feature_group) VALUES
  ('testimonials_feed', 0, 'Home testimonials & reviews page (curated content)', 'content'),
  ('live_salary_feed', 0, 'Live salary / bonus feed', 'content'),
  ('payment_gallery', 0, 'Payment proof gallery', 'content');