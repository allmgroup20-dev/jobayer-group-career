-- Trainers & Institutions tables
-- Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS institutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_bn TEXT,
  logo_url TEXT,
  description_en TEXT,
  description_bn TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trainers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_bn TEXT,
  specialty_en TEXT,
  specialty_bn TEXT,
  credential_en TEXT,
  credential_bn TEXT,
  bio_en TEXT,
  bio_bn TEXT,
  image_url TEXT,
  experience_years INTEGER DEFAULT 0,
  institution_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trainers_active ON trainers(is_active);
CREATE INDEX IF NOT EXISTS idx_trainers_institution ON trainers(institution_id);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions(is_active);
