-- Migration 021: Premium membership payment (99 BDT) for Elite
-- Two ways to become premium: 99 BDT SSLCommerz payment OR admin sets membership_status='premium'

CREATE TABLE IF NOT EXISTS membership_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'elite',
  amount REAL NOT NULL DEFAULT 99,
  currency TEXT NOT NULL DEFAULT 'BDT',
  tran_id TEXT NOT NULL UNIQUE,
  val_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_response TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  verified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_membership_payments_worker ON membership_payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_tran ON membership_payments(tran_id);
