-- Migration 017: Membership Tiers (General + Premium)
-- Rename 'active' → 'general' for the new 3-tier system
UPDATE workers SET membership_status = 'general' WHERE membership_status = 'active';

-- Add general member withdrawal tax (admin-configurable %)
INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES
  ('general_member_withdrawal_tax_percent', '5', 'text');

-- Add tax columns to withdrawals table
ALTER TABLE withdrawals ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE withdrawals ADD COLUMN final_amount REAL;
