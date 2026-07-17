import { getCloudflareContext } from "@opennextjs/cloudflare";

const DONE_FLAG = "__dbSchemaSetupDone";
const DONE_LOCK = "__dbSchemaSetupLock";

let dbCache: { DB: D1Database } | null = null;
let dbError: Error | null = null;

async function ensureSchema(env: { DB: D1Database }): Promise<void> {
  const g = globalThis as any;
  if (g[DONE_FLAG]) return;
  if (g[DONE_LOCK]) {
    let waited = 0;
    while (g[DONE_FLAG] === false && g[DONE_LOCK] && waited < 100) {
      await new Promise(r => setTimeout(r, 100));
      waited++;
    }
    if (g[DONE_FLAG]) return;
  }
  g[DONE_LOCK] = true;
  try {
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
      membership_status TEXT DEFAULT 'active',
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
    // Migrate: add social login columns (idempotent)
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN google_id TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN facebook_id TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN preferred_language TEXT DEFAULT 'bn'`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN age_group TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN occupation TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN education_level TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN interests_updated_at TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN gender TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN country TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN city TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN goal TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN preferred_learning_time TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN referral_source TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN communication_preference TEXT DEFAULT 'whatsapp'`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN budget_range TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE workers ADD COLUMN religion TEXT`).run().catch(() => {});

    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_tracking_prefs (
      worker_id TEXT PRIMARY KEY,
      tracking_enabled INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`ALTER TABLE commission_levels ADD COLUMN commission_type TEXT DEFAULT 'both'`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE commission_levels ADD COLUMN min_referral_base INTEGER DEFAULT 3`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE commission_levels ADD COLUMN level_name_bn TEXT`).run().catch(() => {});
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
      currency TEXT DEFAULT 'BDT',
      payment_method TEXT,
      account_number TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS saved_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
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
      ('min_withdrawal_premium', '200', 'number')
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
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

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

    // Agent module tables (Multi-Agent Research System)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT UNIQUE NOT NULL,
      name_bn TEXT NOT NULL,
      name_en TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      sector TEXT,
      parent_agent_id TEXT,
      status TEXT DEFAULT 'idle',
      model_id TEXT,
      provider TEXT DEFAULT 'openrouter',
      cron_interval INTEGER DEFAULT 360,
      last_run_at TEXT,
      next_run_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agent_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      input_data TEXT,
      output_data TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agent_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_agent_id TEXT NOT NULL,
      to_agent_id TEXT NOT NULL,
      submission_type TEXT DEFAULT 'research',
      title_bn TEXT,
      content TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agent_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      title_bn TEXT,
      summary_bn TEXT,
      findings TEXT,
      recommendations TEXT,
      metrics TEXT,
      submitted_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      detail_bn TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_agent_global_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      mode TEXT NOT NULL DEFAULT 'auto',
      provider TEXT,
      model_id TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_agent_global_config (id, mode) VALUES (1, 'auto')`).run();

    // Seed default agents (8 sector + 4 domain + 1 senior)
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_agents (agent_id, name_bn, name_en, level, sector, parent_agent_id, cron_interval) VALUES
      -- Level 3: Senior Agent
      ('agent_senior', 'প্রধান এজেন্ট', 'Senior Agent', 3, NULL, NULL, 1440),
      -- Level 2: Domain Agents
      ('agent_sales', 'সেলস এজেন্ট', 'Sales Agent', 2, NULL, 'agent_senior', 720),
      ('agent_product', 'পণ্য এজেন্ট', 'Product Agent', 2, NULL, 'agent_senior', 720),
      ('agent_operations', 'অপারেশন এজেন্ট', 'Operations Agent', 2, NULL, 'agent_senior', 720),
      ('agent_analytics', 'বিশ্লেষণ এজেন্ট', 'Analytics Agent', 2, NULL, 'agent_senior', 720),
      -- Level 1: Sector Agents (report to Sales Agent)
      ('agent_student', 'শিক্ষার্থী এজেন্ট', 'Student Agent', 1, 'student', 'agent_sales', 360),
      ('agent_homemaker', 'গৃহিণী এজেন্ট', 'Homemaker Agent', 1, 'homemaker', 'agent_sales', 360),
      ('agent_job_holder', 'চাকরিজীবী এজেন্ট', 'Job Holder Agent', 1, 'job_holder', 'agent_sales', 360),
      ('agent_business', 'ব্যবসায়ী এজেন্ট', 'Business Agent', 1, 'business_owner', 'agent_sales', 360),
      ('agent_freelancer', 'ফ্রিল্যান্সার এজেন্ট', 'Freelancer Agent', 1, 'freelancer', 'agent_sales', 360),
      ('agent_unemployed', 'বেকার এজেন্ট', 'Unemployed Agent', 1, 'unemployed', 'agent_sales', 360),
      ('agent_rural', 'গ্রামীণ এজেন্ট', 'Rural Agent', 1, 'rural', 'agent_sales', 360),
      ('agent_urban', 'শহুরে এজেন্ট', 'Urban Agent', 1, 'urban_educated', 'agent_sales', 360)
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
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      target_filter TEXT,
      total_targets INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      replied_count INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      variables TEXT,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_blocklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      reason TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT UNIQUE NOT NULL,
      phone TEXT,
      provider TEXT DEFAULT 'meta',
      status TEXT DEFAULT 'disconnected',
      daily_limit INTEGER DEFAULT 100,
      daily_sent INTEGER DEFAULT 0,
      total_sent INTEGER DEFAULT 0,
      config TEXT,
      session_data TEXT,
      last_used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    try { await env.DB.prepare("ALTER TABLE wa_accounts ADD COLUMN session_data TEXT").run(); } catch {}
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_warmup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT UNIQUE NOT NULL,
      day_count INTEGER DEFAULT 0,
      current_limit INTEGER DEFAULT 20,
      started_at TEXT,
      last_increment_at TEXT
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wa_scanned_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'generated',
      source TEXT DEFAULT 'generator',
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

    // Telegram module tables
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS tg_bots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      username TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS tg_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      message TEXT,
      direction TEXT DEFAULT 'inbound',
      status TEXT DEFAULT 'received',
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();

    // Facebook Messenger module tables
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS fb_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      page_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS fb_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      message TEXT,
      direction TEXT DEFAULT 'inbound',
      status TEXT DEFAULT 'received',
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

    // Seed default templates
    await env.DB.prepare(`INSERT OR IGNORE INTO wa_templates (name, content, category) VALUES
      ('welcome', 'Assalamu Alaikum! Jobayer Group Career-এ আপনাকে স্বাগতম।', 'onboarding'),
      ('follow_up', 'Assalamu Alaikum! আগের কথোপকথনের ধারাবাহিকতায় আজ আবার যোগাযোগ করছি।', 'followup'),
      ('promo_basic', 'Assalamu Alaikum! Jobayer Group Career-এর একটি বিশেষ অফার সম্পর্কে জানতে চান?', 'promotion'),
      ('reminder', 'Assalamu Alaikum! মনে করিয়ে দিচ্ছি, আগামীকাল আমাদের অনলাইন মিটিং আছে।', 'reminder')
    `).run();

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
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN city TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN country TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN timezone TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN language TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN utm_source TEXT`).run().catch(() => {});
    await env.DB.prepare(`ALTER TABLE user_sessions ADD COLUMN utm_campaign TEXT`).run().catch(() => {});

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

    g[DONE_FLAG] = true;
    g[DONE_LOCK] = false;

    // Run indexes and data migrations asynchronously (don't block first request)
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_worker ON orders(worker_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_commissions_worker ON commissions(worker_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_commissions_order ON commissions(order_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_events_worker ON user_events(worker_id, created_at)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_notifications_worker ON notifications(worker_id)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`).run().catch(() => {});
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`).run().catch(() => {});

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
  if (dbError) throw dbError;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as any).DB as D1Database | undefined;
    if (!db) {
      throw new Error("D1 binding 'DB' is undefined in Cloudflare environment");
    }
    await ensureSchema({ DB: db });
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
    dbError = e instanceof Error ? e : new Error("Database connection failed");
    throw dbError;
  }
}

export async function ensureDB(): Promise<D1Database> {
  const { DB } = await getDB();
  return DB;
}
