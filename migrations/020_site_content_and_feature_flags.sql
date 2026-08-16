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
-- Real live features (whatsapp, payments, registrations, etc.) seed ENABLED to
-- preserve current production behaviour; every one can be turned off from
-- /company/features.
INSERT OR IGNORE INTO feature_flags (feature_key, enabled, label, feature_group) VALUES
  ('ai_system', 1, 'AI System (master)', 'ai'),
  ('ai_personalize', 1, 'AI Personalization (homepage)', 'ai'),
  ('ai_pricing', 1, 'AI Pricing', 'ai'),
  ('ai_chat', 1, 'AI Chat (WhatsApp/web chatbot)', 'ai'),
  ('proactive_followup', 1, 'Proactive WhatsApp follow-up', 'ai'),
  ('campaign_engine', 1, 'Campaign engine', 'ai'),
  ('retention_engine', 1, 'Retention engine', 'ai'),
  ('ai_knowledge', 1, 'AI knowledge auto-seed', 'ai'),
  ('ai_profiler', 1, 'AI profiler', 'ai'),
  ('whatsapp', 1, 'WhatsApp Cloud API', 'messaging'),
  ('whatsapp_otp_verify', 0, 'WhatsApp OTP verification', 'messaging'),
  ('telegram', 1, 'Telegram bot', 'messaging'),
  ('messenger', 1, 'Messenger bot', 'messaging'),
  ('email_sendgrid', 1, 'Email (SendGrid)', 'messaging'),
  ('sms_gateway', 1, 'SMS gateway', 'messaging'),
  ('payments', 1, 'Payments / checkout', 'business'),
  ('resource_income', 1, 'Resource income', 'business'),
  ('referral', 1, 'Referral commissions', 'business'),
  ('demo_bonus', 1, 'Demo bonus', 'business'),
  ('registrations', 1, 'New registrations', 'business'),
  ('withdrawals', 1, 'Withdrawals', 'business'),
  ('testimonials_feed', 1, 'Home testimonials & reviews page (curated content)', 'content'),
  ('live_salary_feed', 1, 'Live salary / bonus feed', 'content'),
  ('payment_gallery', 1, 'Payment proof gallery', 'content'),
  ('contact_sync', 1, 'Contact sync (phonebook)', 'content'),
  ('maintenance_auto', 1, 'Auto maintenance cleanup', 'system'),
  ('keepwarm_cron', 1, 'Keepwarm cron (proactive WhatsApp)', 'system'),
  ('api_costs_logging', 1, 'API cost logging', 'system');