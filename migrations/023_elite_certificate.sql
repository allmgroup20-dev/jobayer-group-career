-- Migration 023: Elite certificate for premium members (any amount 99-10000)
ALTER TABLE workers ADD COLUMN elite_certificate_id TEXT;
ALTER TABLE workers ADD COLUMN elite_certificate_issued_at TEXT;
CREATE INDEX IF NOT EXISTS idx_workers_elite_cert ON workers(elite_certificate_id);
