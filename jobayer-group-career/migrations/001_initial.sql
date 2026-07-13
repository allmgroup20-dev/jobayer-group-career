-- Jobayer Group Career - Initial Database Schema
-- Cloudflare D1 (SQLite)

-- Users / Workers table
CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  avatar_url TEXT,
  sponsor_id TEXT,
  sponsor_name TEXT,
  level INTEGER DEFAULT 1,
  join_date TEXT DEFAULT (datetime('now')),
  currency TEXT DEFAULT 'BDT',
  balance REAL DEFAULT 0,
  total_earned REAL DEFAULT 0,
  total_spent REAL DEFAULT 0,
  total_team_members INTEGER DEFAULT 0,
  membership_status TEXT DEFAULT 'active',
  is_test_account INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Company / Admin users
CREATE TABLE IF NOT EXISTS company_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  permissions TEXT DEFAULT 'all',
  created_at TEXT DEFAULT (datetime('now'))
);

-- MLM Tree structure
CREATE TABLE IF NOT EXISTS mlm_tree (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id TEXT NOT NULL,
  parent_id TEXT,
  sponsor_id TEXT,
  level_number INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  placement_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id),
  FOREIGN KEY (parent_id) REFERENCES workers(worker_id),
  FOREIGN KEY (sponsor_id) REFERENCES workers(worker_id)
);

-- Commission level settings
CREATE TABLE IF NOT EXISTS commission_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_number INTEGER NOT NULL UNIQUE,
  level_name TEXT NOT NULL,
  percentage REAL DEFAULT 0,
  fixed_amount REAL DEFAULT 0,
  currency TEXT DEFAULT 'BDT',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_bn TEXT,
  description TEXT,
  description_bn TEXT,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  commission_percentage REAL DEFAULT 0,
  commission_fixed REAL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT -1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  worker_id TEXT NOT NULL,
  product_id INTEGER,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  commission_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  transaction_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

-- Commission records
CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commission_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  from_worker_id TEXT NOT NULL,
  to_worker_id TEXT NOT NULL,
  level_number INTEGER NOT NULL,
  percentage REAL,
  fixed_amount REAL,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (from_worker_id) REFERENCES workers(worker_id),
  FOREIGN KEY (to_worker_id) REFERENCES workers(worker_id)
);

-- Withdraw requests
CREATE TABLE IF NOT EXISTS withdrawals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  withdrawal_id TEXT UNIQUE NOT NULL,
  worker_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  account_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  processed_at TEXT,
  FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

-- Currencies
CREATE TABLE IF NOT EXISTS currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  name_bn TEXT,
  exchange_rate REAL DEFAULT 1,
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Language translations
CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  translation_key TEXT UNIQUE NOT NULL,
  en_text TEXT NOT NULL,
  bn_text TEXT,
  category TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Company settings
CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Test mode sessions
CREATE TABLE IF NOT EXISTS test_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  created_by INTEGER NOT NULL,
  is_active INTEGER DEFAULT 0,
  mock_workers_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES company_users(id)
);

-- WhatsApp message log
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  message_type TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TEXT DEFAULT (datetime('now'))
);

-- AI activity log
CREATE TABLE IF NOT EXISTS ai_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id TEXT,
  prompt TEXT,
  response TEXT,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Update history
CREATE TABLE IF NOT EXISTS update_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL,
  description TEXT,
  released_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'active'
);

-- Insert default currencies
INSERT OR IGNORE INTO currencies (code, symbol, name, name_bn, exchange_rate, is_default, is_active) VALUES
  ('BDT', '৳', 'Bangladeshi Taka', 'বাংলাদেশী টাকা', 1, 1, 1),
  ('USD', '$', 'US Dollar', 'মার্কিন ডলার', 120, 0, 1),
  ('INR', '₹', 'Indian Rupee', 'ভারতীয় রুপি', 1.44, 0, 1),
  ('EUR', '€', 'Euro', 'ইউরো', 130, 0, 0),
  ('GBP', '£', 'British Pound', 'ব্রিটিশ পাউন্ড', 152, 0, 0),
  ('MYR', 'RM', 'Malaysian Ringgit', 'মালয়েশিয়ান রিংগিট', 25.5, 0, 0),
  ('SAR', '﷼', 'Saudi Riyal', 'সৌদি রিয়াল', 32, 0, 0),
  ('AED', 'د.إ', 'UAE Dirham', 'ইউএই দিরহাম', 32.7, 0, 0);

-- Insert default commission levels (Unilevel)
INSERT OR IGNORE INTO commission_levels (level_number, level_name, percentage, fixed_amount, currency, is_active) VALUES
  (1, 'Level 1', 10, 0, 'BDT', 1),
  (2, 'Level 2', 5, 0, 'BDT', 1),
  (3, 'Level 3', 3, 0, 'BDT', 1),
  (4, 'Level 4', 2, 0, 'BDT', 1),
  (5, 'Level 5', 1, 0, 'BDT', 1);

-- Insert default company settings
INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES
  ('company_name', 'Jobayer Group Career', 'text'),
  ('company_tagline', 'Build Your Career With Us', 'text'),
  ('company_tagline_bn', 'আমাদের সাথে আপনার ক্যারিয়ার গড়ুন', 'text'),
  ('company_email', 'info@jobayergroup.com', 'text'),
  ('company_phone', '+8801XXXXXXXXX', 'text'),
  ('company_address', 'Dhaka, Bangladesh', 'text'),
  ('company_address_bn', 'ঢাকা, বাংলাদেশ', 'text'),
  ('primary_color', '#1E3A5A', 'color'),
  ('secondary_color', '#FFD700', 'color'),
  ('action_color', '#28A745', 'color'),
  ('default_currency', 'BDT', 'text'),
  ('min_withdrawal', '500', 'number'),
  ('max_levels', '10', 'number'),
  ('registration_bonus', '0', 'number'),
  ('terms_version', '1.0', 'text'),
  ('site_description', 'A premium MLM and e-commerce platform for career growth', 'text'),
  ('site_description_bn', 'ক্যারিয়ার বৃদ্ধির জন্য একটি প্রিমিয়াম এমএলএম এবং ই-কমার্স প্ল্যাটফর্ম', 'text');

-- Insert default admin (password: admin123) - SHA-256 hash
INSERT OR IGNORE INTO company_users (username, password, name, role) VALUES
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Company Admin', 'superadmin');

-- Insert some default translations
INSERT OR IGNORE INTO translations (translation_key, en_text, bn_text, category) VALUES
  ('nav_home', 'Home', 'হোম', 'navbar'),
  ('nav_products', 'Products', 'পণ্য', 'navbar'),
  ('nav_dashboard', 'Dashboard', 'ড্যাশবোর্ড', 'navbar'),
  ('nav_login', 'Login', 'লগইন', 'navbar'),
  ('nav_register', 'Register', 'নিবন্ধন', 'navbar'),
  ('nav_app', 'Get App', 'অ্যাপ', 'navbar'),
  ('nav_language', 'Language', 'ভাষা', 'navbar'),
  ('home_hero_title', 'Build Your Career With Jobayer Group', 'জোবায়ের গ্রুপের সাথে আপনার ক্যারিয়ার গড়ুন', 'home'),
  ('home_hero_subtitle', 'Join the most rewarding affiliate marketing platform designed for your success', 'আপনার সাফল্যের জন্য ডিজাইন করা সবচেয়ে পুরস্কৃত অ্যাফিলিয়েট মার্কেটিং প্ল্যাটফর্মে যোগ দিন', 'home'),
  ('home_hero_cta', 'Start Your Journey', 'আপনার যাত্রা শুরু করুন', 'home'),
  ('home_hero_app', 'Get Mobile App', 'মোবাইল অ্যাপ নিন', 'home'),
  ('home_features_title', 'Why Choose Us', 'কেন আমাদের বেছে নেবেন', 'home'),
  ('home_features_subtitle', 'Everything you need to build a successful career', 'একটি সফল ক্যারিয়ার গড়তে আপনার যা কিছু দরকার', 'home'),
  ('home_how_title', 'How It Works', 'এটি কিভাবে কাজ করে', 'home'),
  ('home_how_step1', 'Sign Up Free', 'বিনামূল্যে নিবন্ধন করুন', 'home'),
  ('home_how_step1_desc', 'Create your account and join our growing community', 'আপনার অ্যাকাউন্ট তৈরি করুন এবং আমাদের ক্রমবর্ধমান সম্প্রদায়ে যোগ দিন', 'home'),
  ('home_how_step2', 'Invite Your Team', 'আপনার টিমকে আমন্ত্রণ জানান', 'home'),
  ('home_how_step2_desc', 'Share your unique referral link with friends and family', 'বন্ধু এবং পরিবারের সাথে আপনার অনন্য রেফারেল লিঙ্ক শেয়ার করুন', 'home'),
  ('home_how_step3', 'Earn Rewards', 'পুরস্কার অর্জন করুন', 'home'),
  ('home_how_step3_desc', 'Get commissions from your team purchases', 'আপনার টিমের কেনাকাটা থেকে কমিশন পান', 'home'),
  ('home_stats_members', 'Active Members', 'সক্রিয় সদস্য', 'home'),
  ('home_stats_orders', 'Orders Completed', 'অর্ডার সম্পন্ন', 'home'),
  ('home_stats_earnings', 'Total Payout', 'মোট পেআউট', 'home'),
  ('home_testimonials_title', 'Success Stories', 'সাফল্যের গল্প', 'home'),
  ('auth_worker_login', 'Member Login', 'সদস্য লগইন', 'auth'),
  ('auth_company_login', 'Company Login', 'কোম্পানি লগইন', 'auth'),
  ('auth_phone', 'Phone Number', 'মোবাইল নম্বর', 'auth'),
  ('auth_password', 'Password', 'পাসওয়ার্ড', 'auth'),
  ('auth_remember', 'Remember Me', 'মনে রাখুন', 'auth'),
  ('auth_forgot', 'Forgot Password?', 'পাসওয়ার্ড ভুলে গেছেন?', 'auth'),
  ('auth_no_account', "Don't have an account?", 'একাউন্ট নেই?', 'auth'),
  ('auth_register_now', 'Register Now', 'এখন নিবন্ধন করুন', 'auth'),
  ('dashboard_title', 'Dashboard', 'ড্যাশবোর্ড', 'dashboard'),
  ('dashboard_balance', 'Balance', 'ব্যালেন্স', 'dashboard'),
  ('dashboard_team', 'My Team', 'আমার টিম', 'dashboard'),
  ('dashboard_earnings', 'Total Earnings', 'মোট আয়', 'dashboard'),
  ('dashboard_orders', 'My Orders', 'আমার অর্ডার', 'dashboard'),
  ('dashboard_tree', 'Team Tree', 'টিম ট্রি', 'dashboard'),
  ('dashboard_commissions', 'Commissions', 'কমিশন', 'dashboard'),
  ('dashboard_profile', 'Profile', 'প্রোফাইল', 'dashboard'),
  ('dashboard_withdraw', 'Withdraw', 'উইথড্র', 'dashboard'),
  ('company_dashboard', 'Company Dashboard', 'কোম্পানি ড্যাশবোর্ড', 'company'),
  ('company_members', 'All Members', 'সকল সদস্য', 'company'),
  ('company_products', 'Manage Products', 'পণ্য ব্যবস্থাপনা', 'company'),
  ('company_levels', 'Commission Levels', 'কমিশন লেভেল', 'company'),
  ('company_currencies', 'Currencies', 'কারেন্সি', 'company'),
  ('company_settings', 'Settings', 'সেটিংস', 'company'),
  ('company_translations', 'Translations', 'অনুবাদ', 'company'),
  ('company_test_mode', 'Test Mode', 'টেস্ট মোড', 'company'),
  ('company_updates', 'Updates', 'আপডেট', 'company'),
  ('test_mode_title', 'Test Mode Control', 'টেস্ট মোড নিয়ন্ত্রণ', 'test'),
  ('test_mode_on', 'Test Mode Active', 'টেস্ট মোড সক্রিয়', 'test'),
  ('test_mode_off', 'Test Mode Inactive', 'টেস্ট মোড নিষ্ক্রিয়', 'test'),
  ('test_mode_desc', 'Test your entire system with mock data before going live', 'লাইভ যাওয়ার আগে মক ডাটা দিয়ে আপনার পুরো সিস্টেম টেস্ট করুন', 'test'),
  ('test_generate', 'Generate Test Data', 'টেস্ট ডাটা তৈরি করুন', 'test'),
  ('test_stop', 'Stop Test Mode', 'টেস্ট মোড বন্ধ করুন', 'test'),
  ('product_buy', 'Buy Now', 'এখন কিনুন', 'shop'),
  ('product_add_cart', 'Add to Cart', 'কার্টে যোগ করুন', 'shop'),
  ('checkout_title', 'Checkout', 'চেকআউট', 'shop'),
  ('checkout_place_order', 'Place Order', 'অর্ডার করুন', 'shop');
