import { getCloudflareContext } from "@opennextjs/cloudflare";

const DONE_FLAG = "__dbSchemaSetupDone";
const DONE_LOCK = "__dbSchemaSetupLock";
const PENDING_FLAG = "__dbSchemaSetupPending";

let dbCache: { DB: D1Database } | null = null;

async function ensureSchema(env: { DB: D1Database }): Promise<void> {
  const g = globalThis as any;
  if (g[DONE_FLAG]) return;
  if (g[DONE_LOCK]) {
    let waited = 0;
    while (g[DONE_FLAG] === false && g[DONE_LOCK] && waited < 300) {
      await new Promise(r => setTimeout(r, 100));
      waited++;
    }
    if (g[DONE_FLAG]) return;
  }
  g[DONE_LOCK] = true;

  try { await env.DB.prepare("SELECT 1").all(); } catch {}
  try {
    const addCol = async (table: string, col: string, type: string) => {
      try {
        const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
        if (!info.results?.some(r => r.name === col)) {
          await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
        }
      } catch {}
    };
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS company_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      permissions TEXT DEFAULT 'all',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS workers (
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
      membership_status TEXT DEFAULT 'general',
      is_test_account INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS commission_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_number INTEGER NOT NULL UNIQUE,
      level_name TEXT NOT NULL,
      percentage REAL DEFAULT 0,
      fixed_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'BDT',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    // Conditional ALTER TABLE — PRAGMA check first avoids unnecessary roundtrips
    await addCol("workers", "google_id", "TEXT");
    await addCol("workers", "facebook_id", "TEXT");
    await addCol("workers", "preferred_language", "TEXT DEFAULT 'bn'");
    await addCol("workers", "age_group", "TEXT");
    await addCol("workers", "occupation", "TEXT");
    await addCol("workers", "education_level", "TEXT");
    await addCol("workers", "interests_updated_at", "TEXT");
    await addCol("workers", "gender", "TEXT");
    await addCol("workers", "country", "TEXT");
    await addCol("workers", "city", "TEXT");
    await addCol("workers", "goal", "TEXT");
    await addCol("workers", "preferred_learning_time", "TEXT");
    await addCol("workers", "referral_source", "TEXT");
    await addCol("workers", "communication_preference", "TEXT DEFAULT 'whatsapp'");
    await addCol("workers", "budget_range", "TEXT");
    await addCol("workers", "religion", "TEXT");
    await addCol("workers", "resource_income", "REAL DEFAULT 0");
    await addCol("workers", "resource_income_original", "REAL DEFAULT 0");
    await addCol("commission_levels", "commission_type", "TEXT DEFAULT 'both'");
    await addCol("commission_levels", "min_referral_base", "INTEGER DEFAULT 3");
    await addCol("commission_levels", "level_name_bn", "TEXT");

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_tracking_prefs (
      worker_id TEXT PRIMARY KEY,
      tracking_enabled INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (
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
      enable_commission INTEGER DEFAULT 1,
      enable_cod INTEGER DEFAULT 1,
      enable_sslcommerz INTEGER DEFAULT 1,
      images TEXT,
      commission_override TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN enable_commission INTEGER DEFAULT 1`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN enable_cod INTEGER DEFAULT 1`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN enable_sslcommerz INTEGER DEFAULT 1`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN images TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN commission_override TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN min_price REAL DEFAULT 0`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN max_price REAL DEFAULT 0`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN ai_price_enabled INTEGER DEFAULT 1`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'physical'`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN premium_membership INTEGER DEFAULT 0`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE products ADD COLUMN direct_buy INTEGER DEFAULT 0`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS orders (
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
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS commissions (
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
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      withdrawal_id TEXT UNIQUE NOT NULL,
      worker_id TEXT NOT NULL,
      amount REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      final_amount REAL,
      currency TEXT DEFAULT 'BDT',
      payment_method TEXT,
      account_number TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT
    )`).run();
    env.DB.prepare(`ALTER TABLE withdrawals ADD COLUMN tax_amount REAL DEFAULT 0`).run().catch(() => {});
    env.DB.prepare(`ALTER TABLE withdrawals ADD COLUMN final_amount REAL`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      name_bn TEXT,
      exchange_rate REAL DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      translation_key TEXT UNIQUE NOT NULL,
      en_text TEXT NOT NULL,
      bn_text TEXT,
      category TEXT DEFAULT 'general',
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type TEXT DEFAULT 'text',
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO currencies (code, symbol, name, name_bn, exchange_rate, is_default, is_active) VALUES
      ('BDT', '৳', 'Bangladeshi Taka', 'বাংলাদেশী টাকা', 1, 1, 1),
      ('USD', '$', 'US Dollar', 'মার্কিন ডলার', 120, 0, 1),
      ('INR', '₹', 'Indian Rupee', 'ভারতীয় রুপি', 1.44, 0, 1)
    `).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES
      ('company_name', 'Jobayer Group Career', 'text'),
      ('site_description', 'A premium JG Career and e-commerce platform for career growth', 'text'),
      ('payment_system_active', '1', 'boolean'),
      ('min_withdrawal', '500', 'number'),
      ('min_withdrawal_premium', '20', 'number'),
      ('general_member_withdrawal_tax_percent', '5', 'number')
    `).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO commission_levels (level_number, level_name, level_name_bn, percentage, fixed_amount, commission_type, min_referral_base) VALUES
      (1, 'Associate', 'সহযোগী', 10, 20, 'both', 0),
      (2, 'Executive Officer', 'কার্যনির্বাহী কর্মকর্তা', 0, 10, 'fixed', 3),
      (3, 'Senior Manager', 'জ্যেষ্ঠ ব্যবস্থাপক', 0, 10, 'fixed', 9),
      (4, 'Director', 'পরিচালক', 0, 10, 'fixed', 27)
    `).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO company_users (username, password, name, role) VALUES
      ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Company Admin', 'superadmin')
    `).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO company_users (username, password, name, role) VALUES
      ('Jobayer Group', '52d1d87c3b2027f3f2660015ddf6463e97430b4e60099217143ac75a45646aa1', 'Jobayer Group', 'superadmin')
    `).run();

    // Migrate ai_api_keys to remove UNIQUE on key_slot (unlimited keys)
    try {
      const existing = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_api_keys_v2'").all();
      if (!existing.results || !existing.results.length) {
        await env.DB.prepare(`CREATE TABLE ai_api_keys_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key_value TEXT NOT NULL,
          provider TEXT DEFAULT 'openrouter',
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.DB.prepare("INSERT INTO ai_api_keys_v2 (key_value, provider, is_active, created_at) SELECT COALESCE(key_value, ''), COALESCE(provider, 'openrouter'), COALESCE(is_active, 1), COALESCE(created_at, datetime('now')) FROM ai_api_keys").run();
        await env.DB.prepare("ALTER TABLE ai_api_keys RENAME TO ai_api_keys_old").run();
        await env.DB.prepare("ALTER TABLE ai_api_keys_v2 RENAME TO ai_api_keys").run();
        await env.DB.prepare("DROP TABLE IF EXISTS ai_api_keys_old").run();
      }
    } catch {
      // migration already done or no old table
    }

    // AI module tables
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tier INTEGER DEFAULT 5,
      provider TEXT DEFAULT 'openrouter',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_value TEXT NOT NULL,
      provider TEXT DEFAULT 'openrouter',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      messages TEXT,
      persona_name TEXT,
      persona_gender TEXT,
      language TEXT DEFAULT 'bn',
      pain_points TEXT,
      interests TEXT,
      source TEXT DEFAULT 'whatsapp',
      summary TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    try { await env.DB.prepare("ALTER TABLE ai_conversations ADD COLUMN summary TEXT DEFAULT ''").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_conversations ADD COLUMN key_points TEXT DEFAULT '{}'").run(); } catch {}
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_phone_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name_guess TEXT,
      gender_guess TEXT,
      age_group_guess TEXT,
      sector TEXT,
      language TEXT DEFAULT 'bn',
      pain_points TEXT,
      interests TEXT,
      priority_score INTEGER DEFAULT 0,
      total_chats INTEGER DEFAULT 0,
      last_chat_at TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      category TEXT DEFAULT 'general',
      updated_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    try { await env.DB.prepare("ALTER TABLE ai_skills ADD COLUMN updated_by TEXT DEFAULT ''").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_skills ADD COLUMN manual_override INTEGER DEFAULT 0").run(); } catch {}
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS skill_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      field_name TEXT,
      old_value TEXT,
      new_value TEXT,
      updated_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_knowledge_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_model_failover_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      current_key_slot INTEGER DEFAULT 1,
      current_model_index INTEGER DEFAULT 0,
      exhausted_models TEXT,
      total_responses INTEGER DEFAULT 0,
      today_responses INTEGER DEFAULT 0,
      last_reset_date TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS worker_agent_links (
      phone TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      linked_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (phone, agent_id)
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS worker_agent_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT DEFAULT '',
      knowledge TEXT NOT NULL,
      source TEXT DEFAULT 'brain',
      version INTEGER DEFAULT 1,
      updated_by TEXT DEFAULT '',
      psychologist_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Employee roles (psychologist = highest priority)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS employee_roles (
      phone TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'employee',
      priority INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Psychologist feedback — auto-logged when AI fails
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS psychologist_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      target_phone TEXT DEFAULT '',
      issue_type TEXT NOT NULL,
      context TEXT DEFAULT '',
      ai_draft TEXT DEFAULT '',
      suggested_fix TEXT DEFAULT '',
      resolved INTEGER DEFAULT 0,
      listening_score REAL DEFAULT 0,
      language_matching_score REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    try { await env.DB.prepare("ALTER TABLE psychologist_feedback ADD COLUMN listening_score REAL DEFAULT 0").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE psychologist_feedback ADD COLUMN language_matching_score REAL DEFAULT 0").run(); } catch {}

    // Psychologist persuasion metrics (4 Bob Berg metrics)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS psychologist_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      score REAL DEFAULT 0,
      total_samples INTEGER DEFAULT 0,
      period TEXT DEFAULT 'daily',
      recorded_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Employee persuasion skill scores (Bob Berg metrics per employee)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS employee_persuasion_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      employee_name TEXT DEFAULT '',
      metric_type TEXT NOT NULL,
      score REAL DEFAULT 0,
      recorded_by TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      recorded_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Member communication style tracking
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_communication_profiles (
      worker_id TEXT PRIMARY KEY,
      comm_style TEXT DEFAULT 'standard',
      trust_readiness TEXT DEFAULT 'needs_time',
      sector TEXT DEFAULT '',
      last_interaction TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ── Courses Module Tables ──
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_bn TEXT,
      icon TEXT DEFAULT '📌',
      is_visible INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`ALTER TABLE course_categories ADD COLUMN sort_order INTEGER DEFAULT 0`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE course_categories ADD COLUMN parent_id INTEGER DEFAULT NULL`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_unlocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      unlocked_at TEXT DEFAULT (datetime('now')),
      unlocked_by TEXT DEFAULT 'user',
      UNIQUE(worker_id, course_id)
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS unlock_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT UNIQUE NOT NULL,
      max_unlocks INTEGER DEFAULT 0,
      set_by TEXT DEFAULT 'system',
      set_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      course_ids TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_unlocks_worker ON user_unlocks(worker_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE complaints ADD COLUMN category TEXT DEFAULT 'other'`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE complaints ADD COLUMN priority TEXT DEFAULT 'medium'`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      worker_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(course_id, worker_id)
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ratings_course ON course_ratings(course_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      worker_id TEXT,
      file_id INTEGER,
      downloaded_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_downloads_course ON course_downloads(course_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      worker_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique ON course_bookmarks(course_id, worker_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      worker_id TEXT NOT NULL,
      file_id INTEGER,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_progress_course_worker ON course_progress(course_id, worker_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS resource_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      worker_id TEXT NOT NULL,
      amount REAL NOT NULL,
      resource_count INTEGER NOT NULL,
      currency TEXT DEFAULT 'BDT',
      payment_method TEXT DEFAULT 'sslcommerz',
      payment_status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      session_key TEXT,
      premium_upgraded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_resource_purchases_worker ON resource_purchases(worker_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_platform_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      linked_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_platform_links_worker ON user_platform_links(worker_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_links_unique ON user_platform_links(platform, platform_id)`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_category_map (
      course_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (course_id, category_id)
    )`).run();
    // Migrate existing category_id from courses to junction table (idempotent)
    await env.DB.prepare(`INSERT OR IGNORE INTO course_category_map (course_id, category_id)
      SELECT id, category_id FROM courses WHERE category_id IS NOT NULL
    `).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_bn TEXT,
      description TEXT,
      description_bn TEXT,
      category_id INTEGER,
      is_new INTEGER DEFAULT 1,
      is_visible INTEGER DEFAULT 1,
      icon TEXT DEFAULT '📌',
      price REAL DEFAULT 0,
      is_premium INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`UPDATE courses SET is_premium = 1 WHERE is_premium = 0`).run().catch(() => {});
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS course_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      label TEXT,
      label_bn TEXT,
      url TEXT NOT NULL,
      file_type TEXT DEFAULT 'link',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Missing tables (trainers, institutions, affiliate_tree)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS institutions (
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
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS trainers (
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
      courses_en TEXT,
      courses_bn TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS affiliate_tree (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL UNIQUE,
      parent_id TEXT,
      sponsor_id TEXT,
      level_number INTEGER DEFAULT 1,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    env.DB.prepare(`INSERT OR IGNORE INTO affiliate_tree SELECT * FROM mlm_tree`).run().catch(() => {});
    env.DB.prepare(`ALTER TABLE courses ADD COLUMN trainer_id INTEGER`).run().catch(() => {});
    env.DB.prepare(`ALTER TABLE courses ADD COLUMN institution_id INTEGER`).run().catch(() => {});

    // AI response cache — same query → same answer (0 tokens on repeat)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_response_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_hash TEXT NOT NULL,
      normalized_query TEXT NOT NULL,
      response TEXT NOT NULL,
      agent_id TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      hit_count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      last_accessed_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Seed 100% free AI models — OpenRouter (verified pricing=0) + OpenCode
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_models (model_id, name, provider, tier) VALUES
      -- OpenRouter free models (verified 100% free via API)
      ('openrouter/free',                                'Free Models Router (Auto)',        'openrouter', 1),
      ('meta-llama/llama-3.3-70b-instruct:free',         'Llama 3.3 70B Instruct Free',      'openrouter', 1),
      ('nousresearch/hermes-3-llama-3.1-405b:free',      'Hermes 3 405B Instruct Free',      'openrouter', 1),
      ('nvidia/nemotron-3-ultra-550b-a55b:free',          'Nemotron 3 Ultra 550B Free',       'openrouter', 1),
      ('google/gemma-4-31b-it:free',                      'Gemma 4 31B Free',                 'openrouter', 2),
      ('qwen/qwen3-coder:free',                           'Qwen3 Coder 480B A35B Free',       'openrouter', 2),
      ('qwen/qwen3-next-80b-a3b-instruct:free',           'Qwen3 Next 80B A3B Free',          'openrouter', 2),
      ('nvidia/nemotron-3-super-120b-a12b:free',          'Nemotron 3 Super 120B Free',       'openrouter', 2),
      ('google/gemma-4-26b-a4b-it:free',                  'Gemma 4 26B A4B Free',             'openrouter', 3),
      ('nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', 'Nemotron 3 Nano Omni Free',    'openrouter', 3),
      ('nvidia/nemotron-3-nano-30b-a3b:free',             'Nemotron 3 Nano 30B Free',         'openrouter', 3),
      ('cognitivecomputations/dolphin-mistral-24b-venice-edition:free', 'Dolphin Mistral 24B Free', 'openrouter', 3),
      ('cohere/north-mini-code:free',                     'North Mini Code Free',             'openrouter', 3),
      ('openai/gpt-oss-20b:free',                         'GPT-OSS 20B Free',                 'openrouter', 3),
      ('poolside/laguna-m.1:free',                        'Laguna M.1 Free',                  'openrouter', 3),
      ('meta-llama/llama-3.2-3b-instruct:free',           'Llama 3.2 3B Instruct Free',       'openrouter', 4),
      ('nvidia/nemotron-nano-12b-v2-vl:free',             'Nemotron Nano 12B VL Free',        'openrouter', 4),
      ('nvidia/nemotron-nano-9b-v2:free',                 'Nemotron Nano 9B Free',            'openrouter', 4),
      ('nvidia/nemotron-3.5-content-safety:free',         'Nemotron 3.5 Content Safety Free', 'openrouter', 4),
      ('poolside/laguna-xs-2.1:free',                     'Laguna XS 2.1 Free',               'openrouter', 4),
      ('tencent/hy3:free',                                'Tencent Hy3 Free',                 'openrouter', 5)
    `).run();
    // OpenCode free models
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_models (model_id, name, provider, tier) VALUES
      ('deepseek-v4-flash-free',   'DeepSeek V4 Flash Free (OpenCode)',  'opencode', 1),
      ('nemotron-3-ultra-free',    'Nemotron 3 Ultra Free (OpenCode)',   'opencode', 2),
      ('mimo-v2.5-free',           'MiMo V2.5 Free (OpenCode)',          'opencode', 3),
      ('north-mini-code-free',     'North Mini Code Free (OpenCode)',    'opencode', 3),
      ('hy3-free',                 'Hy3 Free (OpenCode)',                'opencode', 4),
      ('big-pickle',               'Big Pickle Free (OpenCode)',         'opencode', 4)
    `).run();

    // Seed default personas
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_personas (name, gender) VALUES
      ('Fatima Begum', 'female'), ('Abdullah Hasan', 'male'),
      ('Shahin Akter', 'female'), ('Rafiq Islam', 'male'),
      ('Nasima Khatun', 'female'), ('Jahangir Alam', 'male'),
      ('Parvin Sultana', 'female'), ('Kamal Hossain', 'male'),
      ('Rokeya Begum', 'female'), ('Shafiqur Rahman', 'male')
    `).run();

    // WhatsApp module tables
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      status TEXT DEFAULT 'pending',
      priority_score INTEGER DEFAULT 0,
      source TEXT DEFAULT 'manual',
      assigned_account TEXT,
      last_contacted_at TEXT,
      last_reply TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_message_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_phone TEXT NOT NULL,
      text_content TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'queued',
      account_id TEXT,
      campaign_id TEXT,
      message_type TEXT DEFAULT 'outreach',
      attempts INTEGER DEFAULT 0,
      error TEXT,
      scheduled_at TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      message TEXT,
      direction TEXT DEFAULT 'outbound',
      status TEXT DEFAULT 'pending',
      message_type TEXT DEFAULT 'text',
      campaign_id TEXT,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Cross-platform user preference table
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_platform_preferences (
      phone TEXT PRIMARY KEY,
      preferred_platform TEXT NOT NULL DEFAULT 'whatsapp',
      last_active_platform TEXT,
      platforms_tried TEXT DEFAULT '[]',
      last_active_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // AI Leads table
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      status TEXT DEFAULT 'new',
      priority_score INTEGER DEFAULT 0,
      source TEXT DEFAULT 'whatsapp',
      gender_guess TEXT,
      age_group_guess TEXT,
      sector TEXT,
      language TEXT DEFAULT 'bn',
      pain_points TEXT,
      interests TEXT,
      total_chats INTEGER DEFAULT 0,
      last_chat_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Biometric (fingerprint) credentials
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS biometric_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      user_type TEXT DEFAULT 'worker',
      credential_id TEXT UNIQUE NOT NULL,
      public_key TEXT NOT NULL,
      device_name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    // Migrate: add user_type column if missing (idempotent)
    await env.DB.prepare(`ALTER TABLE biometric_credentials ADD COLUMN user_type TEXT DEFAULT 'worker'`).run().catch(() => {});

    // ── Phase 1: User Tracking & Activity Tables ──
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      page_url TEXT,
      page_category TEXT,
      search_keyword TEXT,
      product_id TEXT,
      product_category TEXT,
      time_spent_seconds INTEGER,
      device_info TEXT,
      session_id TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      session_start TEXT NOT NULL,
      session_end TEXT,
      duration_seconds INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      screen_resolution TEXT,
      referrer TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      search_query TEXT NOT NULL,
      search_type TEXT,
      result_count INTEGER,
      clicked_item TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT UNIQUE NOT NULL,
      category_scores TEXT DEFAULT '{}',
      top_categories TEXT DEFAULT '[]',
      last_calculated_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_behavior_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT UNIQUE NOT NULL,
      lead_score INTEGER DEFAULT 0,
      churn_probability INTEGER DEFAULT 0,
      purchase_intent INTEGER DEFAULT 0,
      rfm_recency INTEGER DEFAULT 0,
      rfm_frequency INTEGER DEFAULT 0,
      rfm_monetary REAL DEFAULT 0,
      segment TEXT DEFAULT 'new',
      lifetime_value REAL DEFAULT 0,
      last_updated TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_phonebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_name TEXT,
      has_whatsapp INTEGER DEFAULT 0,
      device_type TEXT,
      can_be_contacted INTEGER DEFAULT 1,
      can_see_profile INTEGER DEFAULT 1,
      last_contacted_at TEXT,
      source TEXT DEFAULT 'whatsapp_sync',
      last_checked_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Phase 8 migrations
    await addCol("user_sessions", "city", "TEXT");
    await addCol("user_sessions", "country", "TEXT");
    await addCol("user_sessions", "timezone", "TEXT");
    await addCol("user_sessions", "language", "TEXT");
    await addCol("user_sessions", "utm_source", "TEXT");
    await addCol("user_sessions", "utm_campaign", "TEXT");

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      user_agent TEXT,
      screen_resolution TEXT,
      ip_address TEXT,
      city TEXT,
      country TEXT,
      timezone TEXT,
      language TEXT,
      is_active INTEGER DEFAULT 1,
      last_seen_at TEXT,
      first_seen_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      product_id TEXT,
      product_type TEXT DEFAULT 'course',
      rating INTEGER NOT NULL,
      review_text TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS communication_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      direction TEXT DEFAULT 'outbound',
      message TEXT,
      status TEXT DEFAULT 'sent',
      reference_id TEXT,
      metadata TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS privacy_consent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      is_granted INTEGER DEFAULT 1,
      ip_address TEXT,
      user_agent TEXT,
      granted_at TEXT,
      revoked_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS attribution_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referrer TEXT,
      landing_page TEXT,
      first_visit_at TEXT,
      converted INTEGER DEFAULT 0,
      converted_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      category TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Orphan tables (referenced by API routes but missing)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS saved_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS custom_flows (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT,
      steps TEXT, department_ids TEXT, created_by TEXT, is_active INTEGER DEFAULT 1,
      run_count INTEGER DEFAULT 0, last_run_at TEXT, created_at TEXT, updated_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS brain_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, text TEXT, intent TEXT,
      primary_department TEXT, departments_used TEXT, agents_used TEXT, chain_type TEXT,
      model_used TEXT, tokens_used INTEGER, processing_ms INTEGER, success INTEGER DEFAULT 1,
      error_message TEXT, created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS agent_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, rating INTEGER,
      feedback_text TEXT, intent TEXT, department TEXT, model_used TEXT,
      processing_ms INTEGER, message_id TEXT, created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS agent_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, agent_id TEXT,
      key TEXT NOT NULL, value TEXT, category TEXT, priority INTEGER DEFAULT 0,
      expires_at TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS agent_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, agent_id TEXT,
      task_type TEXT NOT NULL, cron_expression TEXT, params TEXT, enabled INTEGER DEFAULT 1,
      last_run_at TEXT, next_run_at TEXT, created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS dynamic_employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT, parent_employee_id TEXT, employee_id TEXT NOT NULL,
      name TEXT, name_bn TEXT, description TEXT, expertise TEXT, prompt_template TEXT,
      primary_model TEXT, status TEXT DEFAULT 'active', deleted_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS maintenance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, table_name TEXT,
      rows_deleted INTEGER DEFAULT 0, status TEXT DEFAULT 'success', details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── Target System ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL,
      target_sales INTEGER NOT NULL,
      target_revenue REAL DEFAULT 0,
      current_sales INTEGER DEFAULT 0,
      current_revenue REAL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      report_generated INTEGER DEFAULT 0,
      report_content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    )`).run();

    // ─── Seed Talking with Psychopaths book knowledge ───
    const psychopathsSeed = [
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Vulnerability Mirroring", kc: "Reflect unspoken fears gently. When customer shows hesitation or doubt, validate their caution and frame it as wisdom. 'I sense you've been hurt before. That's why you're cautious — and that's wise.' This builds trust by acknowledging their reality without judgment.", cat: "psychology", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Trust Calibration", kc: "Measure trust by the type of questions asked. 'How' questions = building trust. 'Why' questions = still skeptical. Adapt pacing accordingly. Never push when trust is low — provide proof and transparency instead.", cat: "psychology", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Autonomy Preservation", kc: "Never make customers feel controlled. Psychopaths control; ethical agents empower. Use phrases like 'you decide', 'your choice', 'only if it feels right'. Give complete autonomy in decision-making.", cat: "safety", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Fear Transformation", kc: "Transform fear of loss into desire for gain. When customer fears losing money, reframe: 'You're not risking anything — you're investing in a future where you wake up without that worry.' Turn negative fear into positive motivation.", cat: "psychology", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Mask Lowering Protocol", kc: "When customers give perfect answers ('everything is fine', 'no problem'), they may be wearing a mask. Create safe space: 'It's ok to not be ok. What's really going on?' Gentle permission to be vulnerable builds deeper trust.", cat: "psychology", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Pattern Interrupt", kc: "When customer is stuck in a negative loop (scam fear, doubt, hesitation), interrupt with an unexpected question that shifts perspective: 'If money weren't a factor, what would your ideal life look like?' Breaks the negative pattern.", cat: "communication", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Deep Listening", kc: "Listen to what is NOT said. Pauses, hesitations, vague answers reveal more than words. Acknowledge silence: 'I can see you're thinking deeply about this.' This validates their thought process and deepens rapport.", cat: "communication", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Identity Affirmation", kc: "Connect the offer to who they ARE, not who they could be. 'You're someone who values security for your family. This aligns with that.' Identity-based persuasion is more powerful than aspiration-based.", cat: "sales", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "Doctor Shipman Warning — Trust Exploitation", kc: "Never exploit trust for gain. The most dangerous predators weaponize the trust others place in them. Always be worthy of the trust customers give you. Transparency and honesty are non-negotiable.", cat: "safety", org: "book" },
      { st: "book", si: "talking_with_psychopaths", sn: "Talking with Psychopaths and Savages by Christopher Berry-Dee", tt: "all", ti: "all", tn: "All AI Agents", kt: "The Mask of Normality", kc: "Most dangerous people appear perfectly normal, charming, and trustworthy. Teach agents to look beyond surface charm to detect genuine vs. performed emotions. Sincere care vs. calculated charm: the difference is consistency over time.", cat: "safety", org: "book" },
    ];
    for (const k of psychopathsSeed) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(k.st, k.si, k.sn, k.tt, k.ti, k.tn, k.kt, k.kc, k.cat, k.org).run();
      } catch {}
    }

    // ─── Knowledge Accumulation Center ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS knowledge_accumulation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      category TEXT DEFAULT 'insight',
      title TEXT,
      content TEXT NOT NULL,
      context_data TEXT,
      status TEXT DEFAULT 'new',
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── AI Phone Profile new columns ───
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN trust_score REAL DEFAULT 0").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN control_sensitivity TEXT DEFAULT 'medium'").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN manipulation_risk TEXT DEFAULT 'medium'").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN communication_style TEXT DEFAULT 'standard'").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN trust_readiness TEXT DEFAULT 'needs_time'").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN value_sensitivity TEXT DEFAULT 'balanced'").run(); } catch {}
    try { await env.DB.prepare("ALTER TABLE ai_phone_profiles ADD COLUMN listening_need TEXT DEFAULT 'medium'").run(); } catch {}
    // Update communication_styles on every profile interaction via triggers — handled in profiler.ts

    // ─── AI Knowledge Distribution ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_knowledge_distribution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_name TEXT,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT,
      knowledge_title TEXT NOT NULL,
      knowledge_content TEXT NOT NULL,
      knowledge_category TEXT DEFAULT 'general',
      origin TEXT DEFAULT 'system',
      confidence REAL DEFAULT 1.0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    )`).run();

    // ─── System monitoring tables (Phase 1: Error Tracking) ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_type TEXT NOT NULL DEFAULT 'info',
      source TEXT NOT NULL DEFAULT 'unknown',
      message TEXT NOT NULL DEFAULT '',
      details TEXT,
      stack_trace TEXT,
      duration_ms REAL,
      status_code INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      worker_id TEXT,
      session_id TEXT,
      route TEXT,
      method TEXT,
      is_ai_analyzed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS perf_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route TEXT,
      method TEXT,
      avg_duration_ms REAL,
      max_duration_ms REAL,
      min_duration_ms REAL,
      request_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      total_db_queries INTEGER DEFAULT 0,
      period_start TEXT,
      period_end TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_analysis_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      summary TEXT,
      details TEXT,
      affected_routes TEXT,
      severity TEXT DEFAULT 'medium',
      suggested_fixes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS health_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT 'unknown',
      db_ok INTEGER DEFAULT 1,
      cache_ok INTEGER DEFAULT 1,
      memory_mb REAL,
      uptime_seconds REAL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── Psychology Reports Snapshots ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS psychology_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_date TEXT NOT NULL UNIQUE,
      total_profiles INTEGER DEFAULT 0,
      avg_trust REAL DEFAULT 0,
      trust_high INTEGER DEFAULT 0,
      trust_medium INTEGER DEFAULT 0,
      trust_low INTEGER DEFAULT 0,
      trust_critical INTEGER DEFAULT 0,
      fear_financial INTEGER DEFAULT 0,
      fear_social INTEGER DEFAULT 0,
      fear_deceived INTEGER DEFAULT 0,
      fear_autonomy INTEGER DEFAULT 0,
      fear_unknown INTEGER DEFAULT 0,
      control_low INTEGER DEFAULT 0,
      control_medium INTEGER DEFAULT 0,
      control_high INTEGER DEFAULT 0,
      manip_low INTEGER DEFAULT 0,
      manip_medium INTEGER DEFAULT 0,
      manip_high INTEGER DEFAULT 0,
      high_lead_count INTEGER DEFAULT 0,
      churn_risk_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── Communication Styles & Persuasion Tracking ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS communication_styles (
      phone TEXT PRIMARY KEY,
      style TEXT DEFAULT 'standard',
      trust_readiness TEXT DEFAULT 'needs_time',
      value_sensitivity TEXT DEFAULT 'balanced',
      listening_need TEXT DEFAULT 'medium',
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS persuasion_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      technique_used TEXT NOT NULL,
      context TEXT,
      effectiveness_score REAL DEFAULT 0.5,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── Seed The Art of Persuasion book knowledge ───
    const persuasionSeed = [
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Golden Rule of Influence", kc: "People do business with those they know, like, and trust. Trust is your strongest currency. Before any ask, invest in trust first. Every interaction is a chance to build trust currency.", cat: "trust", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Persuader's Mindset — Give First", kc: "Influence = Service. Shift from 'what can I get' to 'what can I give'. Give free value — tips, insights, encouragement — before asking for anything. People are drawn to those who give without expectation.", cat: "psychology", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Active Listening — 3 Techniques", kc: "1) Reference their previous messages to show you remember, 2) Let them finish completely before responding, 3) Recap their words: 'So you're saying that...'. Silence is powerful. Let them fill the pause.", cat: "communication", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Speak Their Language — Framing", kc: "Frame everything from their perspective, not yours. Match their communication style: analytical (data), emotional (feelings), direct (action), warm (relationship). 'This is best' → 'This will make your life easier.'", cat: "communication", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Law of Value", kc: "Your worth = how much value you add to their life. People don't buy products, they buy better versions of themselves. Show the transformation, not just the features.", cat: "sales", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Law of Influence — You Before Me", kc: "Focus on 'you', 'we', 'us' — never 'me' or 'I'. The more you help others grow, the more your influence grows. Influence is what people feel when you're done speaking.", cat: "psychology", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Handling Resistance — We're Together", kc: "Don't fight resistance, understand it. Turn 'me vs you' into 'we're on the same team'. 'You're right to be careful — let's find the best solution together.' Resistance drops when they feel you're on their side.", cat: "sales", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Power of Subtlety — Guide Not Pusher", kc: "Be the guide, not the pusher. Instead of 'You should buy this', say 'Others in your situation found this helpful.' Let them feel the decision is theirs. No push, no pressure.", cat: "communication", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Influence as a Daily Habit", kc: "Influence is not a one-time tactic, it's a daily habit. 1) Who can I help today? 2) Listen before answering. 3) Speak their language. 4) Create an environment where people feel heard and inspired.", cat: "psychology", org: "book" },
      { st: "book", si: "the_art_of_persuasion", sn: "The Art of Persuasion by Bob Berg", tt: "all", ti: "all", tn: "All AI Agents", kt: "Trust is Your Strongest Currency", kc: "Money can be earned and lost, but trust once gained is the most valuable asset. Every honest word, every good deed, every empathetic interaction grows this currency without interest.", cat: "trust", org: "book" },
    ];
    for (const k of persuasionSeed) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(k.st, k.si, k.sn, k.tt, k.ti, k.tn, k.kt, k.kc, k.cat, k.org).run();
      } catch {}
    }

    // ─── Seed Member Onboarding & Motivation training modules ───
    const onboardingSeed = [
      { st: "training", si: "member_onboarding", sn: "Member Onboarding Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Personal Connection First", kc: "When a new member registers, do NOT start with offers or commissions. First 24 hours: build personal connection. Ask about their family, goals, dreams. Understand WHY they joined. Show them they are part of a family, not a sales machine.", cat: "psychology", org: "onboarding" },
      { st: "training", si: "member_onboarding", sn: "Member Onboarding Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Value First — Give Before Asking", kc: "New members should receive value before being asked to produce. Give them free training, tips, encouragement. Show them how the platform can change their life. Only after they experience value, introduce income opportunities.", cat: "sales", org: "onboarding" },
      { st: "training", si: "member_onboarding", sn: "Member Onboarding Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Income is a Tool, Not a Goal", kc: "When showing income/earnings, always frame it as a tool for life transformation. 'You're not just earning 500 TK — you're earning a tool that can help your child's education, your family's health, your future.' Connect money to meaning.", cat: "trust", org: "onboarding" },
      { st: "training", si: "member_motivation", sn: "Member Motivation Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Celebrate Every Win", kc: "When a member achieves something — first sale, first team member, rank up — celebrate genuinely. Connect achievement to their personal story. 'Remember when you joined with this dream? Today you took a step closer.' Make them feel seen.", cat: "psychology", org: "motivation" },
      { st: "training", si: "member_motivation", sn: "Member Motivation Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Team Building is Family Building", kc: "Frame team building as helping others grow, not recruiting downlines. 'You're not building a downline, you're building a family of successful people.' Every person you bring is someone whose life you can change.", cat: "trust", org: "motivation" },
      { st: "training", si: "member_affiliate", sn: "Affiliate Communication Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Speak Their Language — Sponsor Tips", kc: "When communicating with team members, adapt to their world. Students: talk education & future. Homemakers: talk family & security. Business owners: talk ROI & growth. Never use one-size-fits-all pitch. Match their language, their fears, their dreams.", cat: "communication", org: "affiliate" },
      { st: "training", si: "member_affiliate", sn: "Affiliate Communication Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Handle Resistance — We're Together", kc: "When a team member resists or doubts, do NOT argue. Use 'We're Together' framing. 'I understand your doubt. Let's figure this out together.' Turn resistance into collaboration. Never push. Guide them to their own conclusion.", cat: "sales", org: "affiliate" },
    ];
    for (const k of onboardingSeed) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(k.st, k.si, k.sn, k.tt, k.ti, k.tn, k.kt, k.kc, k.cat, k.org).run();
      } catch {}
    }

    // ─── Seed Premium Member training modules ───
    const premiumSeed = [
      { st: "training", si: "premium_experience", sn: "Premium Experience Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Premium is Family, Not Status", kc: "Premium members are not just customers — they are family. Use Golden Rule: make them feel known, valued, and seen. 'You're not just a premium member — you're a partner in our journey.' Never refer to premium as just benefits. Connect benefits to their personal story.", cat: "trust", org: "premium" },
      { st: "training", si: "premium_experience", sn: "Premium Experience Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "We Together — Premium Partnership", kc: "Use 'We' framing: 'We are building your business together.' Premium members should feel they have a dedicated partner, not just a service. Ask about their goals. Celebrate their wins. Make their success your success.", cat: "psychology", org: "premium" },
      { st: "training", si: "premium_upgrade", sn: "Premium Upgrade Funnel", tt: "agent", ti: "all", tn: "All Agents", kt: "Value First, Then Upgrade", kc: "Before offering premium upgrade: 1) Show value — calculate how much they save with premium benefits. 2) Social proof — share stories of other members who upgraded. 3) Let them decide — use subtle influence, never pressure. 'Only if it feels right for your goals.'", cat: "sales", org: "premium" },
      { st: "training", si: "premium_upgrade", sn: "Premium Upgrade Funnel", tt: "agent", ti: "all", tn: "All Agents", kt: "Speak Their Language — Premium Benefits", kc: "Different members value different benefits. Students: 'Unlimited course access means you never stop learning.' Earners: 'Zero withdrawal tax means more money in your pocket.' Builders: 'Priority support means your team never waits.' Match the benefit to their world.", cat: "communication", org: "premium" },
    ];
    for (const k of premiumSeed) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(k.st, k.si, k.sn, k.tt, k.ti, k.tn, k.kt, k.kc, k.cat, k.org).run();
      } catch {}
    }

    // ─── Blue Ocean Strategy — Knowledge Distribution ───
    const blueOceanSeed = [
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Value Innovation", tt: "agent", ti: "all", tn: "All Agents", kt: "Core Principle — Value Innovation", kc: "Value Innovation is the cornerstone of Blue Ocean Strategy. It means pursuing differentiation AND low cost simultaneously, not trade-off. When selling: do NOT just compete on price OR quality. Find the unique combination that creates leap in value for both company AND customer. Ask: 'What can we eliminate that competitors fight over? What can we reduce below standard? What can we raise above standard? What can we create that no one offers?' This creates uncontested market space.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — ERRC Grid", tt: "agent", ti: "all", tn: "All Agents", kt: "ERRC Grid — Eliminate-Reduce-Raise-Create", kc: "The ERRC Grid is a 4-quadrant tool for value innovation. ELIMINATE: factors the industry takes for granted but no longer add value (remove complexity, hidden fees, unnecessary steps). REDUCE: factors below industry standard to simplify (reduce jargon, reduce pressure, reduce wait time). RAISE: factors above industry standard (raise trust, raise support quality, raise transparency). CREATE: factors never offered before (create AI psychology agents, create personal strategy coach, create Blue Ocean guided learning path). Always apply ALL four simultaneously.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Six Paths Framework", tt: "agent", ti: "all", tn: "All Agents", kt: "Six Paths to Create Blue Oceans", kc: "Path 1: Look across alternative industries — not just competitors but different ways customers achieve the same goal. Path 2: Look across strategic groups — can you make customers from a higher/lower tier choose you? Path 3: Look across the chain of buyers — who else influences the purchase decision (family, friends, community)? Path 4: Look across complementary offerings — what related products/services can you bundle? Path 5: Look across functional-emotional orientation — can you add emotional appeal to a functional product or vice versa? Path 6: Look across time — what trends will shape customer value tomorrow?", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Three Tiers of Noncustomers", tt: "agent", ti: "all", tn: "All Agents", kt: "Three Tiers of Noncustomers", kc: "Most companies focus on existing customers — Blue Ocean Strategy says focus on noncustomers. Tier 1: 'Soon-to-leave' — customers on the edge of your market who will leave soon. Ask: why are they leaving? Fix that. Tier 2: 'Refusing' — people who consciously choose NOT to use your industry. Ask: what's their reason? Address it. Tier 3: 'Unexplored' — people in markets you've never considered. Ask: how can we serve them? This opens entirely new demand.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Strategy Canvas", tt: "agent", ti: "all", tn: "All Agents", kt: "Strategy Canvas — Visualizing Your Blue Ocean", kc: "The Strategy Canvas is a diagnostic and action framework. Horizontal axis: factors the industry competes on (price, support, features, trust, speed). Vertical axis: offering level (low to high). Plot your company's current profile AND competitors' profiles. Where are they all the same? That's the red ocean. Where is the gap? That's your blue ocean opportunity. A strong blue ocean strategy has a distinctive, focused, compelling value curve that diverges from competitors.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Buyer Utility Map", tt: "agent", ti: "all", tn: "All Agents", kt: "Buyer Utility Map — Six Stages", kc: "The Buyer Utility Map has 6 stages of the buyer experience cycle: 1) Purchase (how easy to buy?), 2) Delivery (how fast?), 3) Use (how convenient?), 4) Supplements (what extras needed?), 5) Maintenance (how to maintain?), 6) Disposal (how to stop/replace?). For each stage, ask: is there a utility blocker? Remove it. Then ask: can we create extraordinary utility here? The goal is to remove the biggest obstacles in the customer's experience journey.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Price Corridor of the Mass", tt: "agent", ti: "all", tn: "All Agents", kt: "Price Corridor of the Mass", kc: "Don't set price based on competitors. Instead: 1) Identify the 'mass' of target buyers you want to attract. 2) Find what price they would consider irresistible. 3) Check three reference points: substitute products (alternative ways to solve the problem), competitor products (similar offerings), and 'look-alike' products (different industries serving similar customer groups). 4) Set price within the corridor that attracts the mass while ensuring profit. The goal is strategic pricing — high enough for profit, low enough for mass appeal.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Business Model Guide", tt: "agent", ti: "all", tn: "All Agents", kt: "Business Model Guide — Profit from Your Blue Ocean", kc: "A blue ocean strategy only succeeds if the business model supports it. Four questions: 1) Is the price easily accessible to the mass of target buyers? (Price) 2) Can we produce/deliver at this price and still profit? (Cost) 3) What partnerships, channels, and innovations help us deliver value at low cost? (Partners) 4) What volume do we need to break even, and is it realistic? (Volume). Use: target costing (set price first, then design cost structure to meet it), partnering (share costs with strategic allies), and platform models.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Tipping Point Leadership", tt: "agent", ti: "all", tn: "All Agents", kt: "Tipping Point Leadership", kc: "Overcome 4 organizational hurdles: COGNITIVE (people don't see the need for change) — make them experience the worst reality directly, don't just tell them. RESOURCE (limited budget/staff) — concentrate resources on high-impact activities, trade resources from low-impact areas, partner for mutual gain. MOTIVATIONAL (people resist change) — identify kingpin influencers and win them first, their conversion pulls others. POLITICAL (powerful opponents block change) — find and neutralize key opposition, build a coalition of angels. Focus on disproportionate influence factors — the 20% that drives 80% of results.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Fair Process", tt: "agent", ti: "all", tn: "All Agents", kt: "Fair Process — The 3E Principle", kc: "Fair Process is about how decisions are made and executed. Three principles: ENGAGEMENT (involve people in decisions that affect them — listen to their input, let them challenge ideas), EXPLANATION (explain the reasoning behind every decision — people accept outcomes they don't like if they understand why), EXPECTATION CLARITY (make rules and expectations clear from the start — no hidden agendas). Fair Process builds TRUST and VOLUNTARY COOPERATION. People who feel heard will support strategy even when it's difficult. Apply to members, team members, and customers alike.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — PMS Map", tt: "agent", ti: "all", tn: "All Agents", kt: "Pioneer-Migrator-Settler (PMS) Map", kc: "Map your offerings on 3 categories: SETTLERS (me-too businesses that compete on price in red oceans) — minimize investment, consider phasing out. MIGRATORS (offerings better than average but not truly unique) — invest to upgrade to pioneer. PIONEERS (offerings with unprecedented value creating blue oceans) — invest heavily, protect, and scale. The goal: balance the portfolio. Too many settlers = trapped in red ocean. Too many pioneers with no migrators = unsustainable. Aim for 20% pioneers, 60% migrators, 20% settlers as ideal balance.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Strategic Sequencing", tt: "agent", ti: "all", tn: "All Agents", kt: "Strategic Sequencing — Right Order", kc: "Validate your blue ocean in this sequence: Step 1 — BUYER UTILITY: Does the offering unlock extraordinary utility? Is there a compelling reason for customers to buy? Step 2 — PRICE: Is the price easily accessible to the mass of target buyers? Use Price Corridor. Step 3 — COST: Can we deliver at this price and still profit? Use target costing. Step 4 — ADOPTION: Are there adoption barriers? Partners, channels, education needed? Address in this order. Skip any step and risk failure. Only proceed to next step when current step is confirmed.", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Red Ocean Traps", tt: "agent", ti: "all", tn: "All Agents", kt: "Red Ocean Traps to Avoid", kc: "Common traps that keep companies in red oceans: Trap 1 — 'We must be the best in our industry' (instead: change the definition of the industry). Trap 2 — 'Differentiation costs more' (instead: value innovation achieves both). Trap 3 — 'Customers define the market' (instead: lead customers to new value). Trap 4 — 'Focus only on existing demand' (instead: create new demand from noncustomers). Trap 5 — 'Strategy is either differentiation OR low cost' (instead: pursue both simultaneously). Trap 6 — 'Execution is separate from strategy' (instead: build execution INTO strategy from day one via Fair Process).", cat: "strategy", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Sales Application", tt: "agent", ti: "agent_sales", tn: "Sales Agents", kt: "Blue Ocean Selling — Don't Compete, Create", kc: "When selling, do NOT compare with competitors (that's red ocean thinking). Instead: 1) Frame the product as creating NEW value, not beating alternatives. 2) Use ERRC thinking: 'What does this product ELIMINATE that others force you to deal with? What does it REDUCE that others overcomplicate? What does it RAISE that others ignore? What does it CREATE that no one else offers?' 3) Price using Price Corridor — position price as accessible to the mass, not cheap or premium. 4) Use Buyer Utility Map stages to show value at EVERY step of the customer journey, not just purchase.", cat: "sales", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Psychology Application", tt: "agent", ti: "agent_psychology", tn: "Psychology Agents", kt: "Blue Ocean Psychology — Reframe Competition", kc: "When a member compares us to competitors: do NOT defend or attack. Instead, use Blue Ocean Reframe: 'We're not trying to be better than X — we're creating something entirely different. Let me show you what makes our approach unique.' Use Fair Process psychology: members resist because they don't understand WHY. Explain reasoning behind every policy, price, and process. Use Three Tiers psychology: a member thinking of leaving (Tier 1) needs to see value they haven't experienced yet, not a better deal. Use Tipping Point psychology: find the ONE thing that would make a member champion our platform — that's their kingpin.", cat: "psychology", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Six Paths Sales Application", tt: "agent", ti: "agent_sales", tn: "Sales Agents", kt: "Six Paths — Sales Exploration Guide", kc: "When a lead says 'I'm comparing options,' use Six Paths to differentiate: 1) Alternative industries — maybe they're choosing between education AND investment. Show how your platform combines both. 2) Strategic groups — maybe they only know high-price / low-quality options. Show your new value curve. 3) Buyer chain — who else in their family needs to approve? Address that person too. 4) Complementary — what else do they need after joining? Training? Support? Show total solution. 5) Emotional — most competitors sell features. You sell transformation, community, hope. 6) Time — where will they be in 3 years with your platform vs without? Paint the future.", cat: "sales", org: "blue_ocean" },
      { st: "book", si: "blue_ocean_strategy", sn: "Blue Ocean Strategy — Three Tiers Sales Application", tt: "agent", ti: "agent_sales", tn: "Sales Agents", kt: "Three Tiers — Convert Noncustomers", kc: "Three types of noncustomers you face daily: Tier 1 (Soon-to-leave): members who are inactive, not earning, thinking of quitting. Don't sell them more — find the ONE thing that disappointed them and fix it. Use Tipping Point: what's their kingpin? Tier 2 (Refusing): people who said no to joining. Not because of price — because of trust, confusion, or fear. Remove the barrier, don't discount the price. Use Fair Process: explain WHY the platform works. Tier 3 (Unexplored): rural women, students, retirees who never considered online earning. Create completely new value proposition for them — simpler, more guided, more community-focused.", cat: "sales", org: "blue_ocean" },
    ];
    for (const k of blueOceanSeed) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO ai_knowledge_distribution (source_type, source_id, source_name, target_type, target_id, target_name, knowledge_title, knowledge_content, knowledge_category, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(k.st, k.si, k.sn, k.tt, k.ti, k.tn, k.kt, k.kc, k.cat, k.org).run();
      } catch {}
    }

    // ─── Daily Habits Log ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_habits_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_type TEXT NOT NULL,
      phone TEXT DEFAULT '',
      worker_id TEXT DEFAULT '',
      message_preview TEXT DEFAULT '',
      trust_currency REAL DEFAULT 0,
      status TEXT DEFAULT 'sent',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // ─── Strategy Canvas table ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS strategy_canvas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factor_name TEXT NOT NULL,
      factor_name_bn TEXT,
      our_score INTEGER NOT NULL DEFAULT 5,
      competitor_score INTEGER DEFAULT 5,
      competitor_name TEXT DEFAULT 'Competitor',
      category TEXT DEFAULT 'core',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    const existingCanvas = await env.DB.prepare("SELECT COUNT(*) as cnt FROM strategy_canvas").first();
    if (existingCanvas && (existingCanvas as any).cnt === 0) {
      const canvasSeed = [
        { fn: "Price (Affordability)", fbn: "মূল্য (সাশ্রয়ী)", os: 8, cs: 7, cn: "Competitors", cat: "core", so: 1 },
        { fn: "Trust & Transparency", fbn: "বিশ্বাস ও স্বচ্ছতা", os: 9, cs: 5, cn: "Competitors", cat: "core", so: 2 },
        { fn: "AI Personalization", fbn: "AI ব্যক্তিগতকরণ", os: 9, cs: 2, cn: "Competitors", cat: "create", so: 3 },
        { fn: "Community Support", fbn: "কমিউনিটি সাপোর্ট", os: 8, cs: 4, cn: "Competitors", cat: "core", so: 4 },
        { fn: "Income Potential", fbn: "আয়ের সম্ভাবনা", os: 9, cs: 6, cn: "Competitors", cat: "core", so: 5 },
        { fn: "Course Quality", fbn: "কোর্সের মান", os: 7, cs: 7, cn: "Competitors", cat: "core", so: 6 },
        { fn: "WhatsApp Integration", fbn: "WhatsApp ইন্টিগ্রেশন", os: 9, cs: 3, cn: "Competitors", cat: "create", so: 7 },
        { fn: "Easy Registration", fbn: "সহজ রেজিস্ট্রেশন", os: 9, cs: 6, cn: "Competitors", cat: "core", so: 8 },
        { fn: "Premium Benefits", fbn: "প্রিমিয়াম সুবিধা", os: 8, cs: 4, cn: "Competitors", cat: "core", so: 9 },
        { fn: "Psychology Agents", fbn: "সাইকোলজি এজেন্ট", os: 10, cs: 1, cn: "Competitors", cat: "create", so: 10 },
      ];
      for (const row of canvasSeed) {
        await env.DB.prepare(
          "INSERT OR IGNORE INTO strategy_canvas (factor_name, factor_name_bn, our_score, competitor_score, competitor_name, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(row.fn, row.fbn, row.os, row.cs, row.cn, row.cat, row.so).run().catch(() => {});
      }
    }

    // ─── ERRC Saved quadrants table ───
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS errc_saved (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quadrant TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      category TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    const existingErrc = await env.DB.prepare("SELECT COUNT(*) as cnt FROM errc_saved").first();
    if (existingErrc && (existingErrc as any).cnt === 0) {
      const errcSeed = [
        { q: "eliminate", c: "Hidden fees, complex registration, manual approvals" },
        { q: "reduce", c: "Marketing jargon, pressure selling, email frequency" },
        { q: "raise", c: "Trust policies, AI support quality, income tools" },
        { q: "create", c: "AI Psychology Agents, WhatsApp learning, zero-tax premium" },
      ];
      for (const row of errcSeed) {
        await env.DB.prepare("INSERT OR IGNORE INTO errc_saved (quadrant, content, category) VALUES (?, ?, 'platform')")
          .bind(row.q, row.c).run().catch(() => {});
      }
    }

    g[DONE_FLAG] = true;
    g[DONE_LOCK] = false;

    // Batch all index creation asynchronously (single round-trip instead of 50+)
    const indexStmts = [
      `CREATE INDEX IF NOT EXISTS idx_orders_worker ON orders(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_commissions_worker ON commissions(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_commissions_order ON commissions(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_events_worker ON user_events(worker_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_worker ON notifications(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_behavior_scores_segment ON user_behavior_scores(segment)`,
      `CREATE INDEX IF NOT EXISTS idx_events_type ON user_events(event_type)`,
      `CREATE INDEX IF NOT EXISTS idx_events_created ON user_events(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_workers_membership ON workers(membership_status)`,
      `CREATE INDEX IF NOT EXISTS idx_workers_created ON workers(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status)`,
      `CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_worker ON user_sessions(worker_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_searches_worker ON user_searches(worker_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_communication_worker ON communication_history(worker_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_withdrawals_worker ON withdrawals(worker_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read, worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_queue_status ON wa_message_queue(status, priority, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_wa_logs_phone ON wa_logs(phone, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_ai_conv_phone ON ai_conversations(phone)`,
      `CREATE INDEX IF NOT EXISTS idx_ai_leads_status ON ai_leads(status, priority_score)`,
      `CREATE INDEX IF NOT EXISTS idx_phonebooks_worker ON user_phonebooks(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_affiliate_tree_level ON affiliate_tree(level_number)`,
      `CREATE INDEX IF NOT EXISTS idx_complaints_worker ON complaints(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_attribution_channel ON attribution_log(channel)`,
      `CREATE INDEX IF NOT EXISTS idx_devices_worker ON user_devices(worker_id, last_seen_at)`,
      `CREATE INDEX IF NOT EXISTS idx_saved_accounts_worker ON saved_accounts(worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_brain_usage_created ON brain_usage(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_agent_feedback_created ON agent_feedback(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_commissions_to_worker ON commissions(to_worker_id)`,
      `CREATE INDEX IF NOT EXISTS idx_workers_google_id ON workers(google_id)`,
      `CREATE INDEX IF NOT EXISTS idx_workers_facebook_id ON workers(facebook_id)`,
      `CREATE INDEX IF NOT EXISTS idx_biometric_worker ON biometric_credentials(worker_id, user_type)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_worker_payment ON orders(worker_id, payment_status)`,
      `CREATE INDEX IF NOT EXISTS idx_events_worker_type ON user_events(worker_id, event_type)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_created ON user_sessions(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_communication_created ON communication_history(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_affiliate_tree_parent_id ON affiliate_tree(parent_id)`,
      `CREATE INDEX IF NOT EXISTS idx_affiliate_tree_sponsor_id ON affiliate_tree(sponsor_id)`,
      `CREATE INDEX IF NOT EXISTS idx_response_cache_lookup ON ai_response_cache(query_hash, agent_id)`,
      `CREATE INDEX IF NOT EXISTS idx_withdrawals_worker_status ON withdrawals(worker_id, status)`,
      `CREATE INDEX IF NOT EXISTS idx_commissions_to_worker_status ON commissions(to_worker_id, status)`,
    ].map(sql => env.DB.prepare(sql));
    env.DB.batch(indexStmts).catch(() => {});

    // Migrate legacy membership_status values
    env.DB.prepare(`UPDATE workers SET membership_status = 'general' WHERE membership_status = 'active'`).run().catch(() => {});
    env.DB.prepare(`UPDATE workers SET membership_status = 'premium' WHERE membership_status = 'vip'`).run().catch(() => {});

    // Course performance indexes
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_course_files_course ON course_files(course_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_courses_is_new ON courses(is_new)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_course_category_map_course ON course_category_map(course_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_course_category_map_cat ON course_category_map(category_id)`).run().catch(() => {});

    // System monitoring indexes
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(log_type, created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(source, created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_perf_snapshots_route ON perf_snapshots(route, created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ai_reports_type ON ai_analysis_reports(report_type, created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_health_history_created ON health_history(created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_health_history_status ON health_history(status, created_at)`).run().catch(() => {});

    env.DB.prepare(`INSERT OR IGNORE INTO notification_preferences (worker_id, channel, category, enabled)
      SELECT w.worker_id, 'whatsapp', 'promotional', 1 FROM workers w
    `).run().catch(() => {});
    env.DB.prepare(`INSERT OR IGNORE INTO notification_preferences (worker_id, channel, category, enabled)
      SELECT w.worker_id, 'whatsapp', 'transactional', 1 FROM workers w
    `).run().catch(() => {});
    env.DB.prepare(`INSERT OR IGNORE INTO notification_preferences (worker_id, channel, category, enabled)
      SELECT w.worker_id, 'push', 'reminder', 1 FROM workers w
    `).run().catch(() => {});
  } catch (e) {
    g[DONE_FLAG] = false;
    g[DONE_LOCK] = false;
    throw e;
  } finally {
    g[DONE_LOCK] = false;
  }
}

async function getLocalDB() {
  const g = globalThis as any;
  if (!g.__localD1Instance) {
    try {
      const mod = await import("./local-d1");
      g.__localD1Instance = mod.createLocalDB();
    } catch (e) {
      console.warn("Local D1 not available:", (e as Error)?.message);
    }
  }
  return g.__localD1Instance || null;
}

export async function getDB(): Promise<{ DB: D1Database }> {
  if (dbCache) return dbCache;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as any).DB as D1Database | undefined;
    if (!db) {
      throw new Error("D1 binding 'DB' is undefined in Cloudflare environment");
    }

    const g = globalThis as any;
    if (!g[DONE_FLAG] && !g[PENDING_FLAG]) {
      g[PENDING_FLAG] = true;
      ensureSchema({ DB: db }).then(() => {
        g[DONE_FLAG] = true;
        g[PENDING_FLAG] = false;
      }).catch((e) => {
        console.error("Background schema init failed:", e);
        g[PENDING_FLAG] = false;
      });
    }

    dbCache = { DB: db };
    return dbCache;
  } catch (e) {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (isDev) {
      try {
        const local = await getLocalDB();
        if (local) {
          const env = { DB: local as unknown as D1Database };
          await ensureSchema(env);
          dbCache = env;
          return env;
        }
      } catch (localErr) {
        console.warn("Local D1 fallback failed:", (localErr as Error)?.message);
      }
    }
    throw e instanceof Error ? e : new Error("Database connection failed");
  }
}

export async function ensureDB(): Promise<D1Database> {
  const { DB } = await getDB();
  return DB;
}
