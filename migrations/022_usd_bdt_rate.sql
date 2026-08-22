-- Migration 022: USD->BDT daily rate for certificate delivery (floor, no paisa)
INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES
  ('usd_bdt_rate', '122', 'text'),
  ('usd_bdt_rate_updated_at', '', 'text');
