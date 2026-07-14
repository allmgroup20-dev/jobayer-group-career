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
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
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
      ('site_description', 'A premium MLM and e-commerce platform for career growth', 'text')
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
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

    // Seed default AI models (26 free OpenRouter models)
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_models (model_id, name, tier) VALUES
      ('tencent/hunyuan-turbo-s', 'Tencent Hunyuan Turbo S', 1),
      ('google/gemini-2.0-flash-001', 'Gemini 2.0 Flash', 1),
      ('meta-llama/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 1),
      ('deepseek/deepseek-chat-v3-0324', 'DeepSeek V3', 1),
      ('openai/gpt-4o-mini', 'GPT-4o Mini', 1),
      ('cohere/command-r7b-12-2024', 'Command R7B', 1),
      ('qwen/qwen2.5-vl-72b-instruct', 'Qwen 2.5 VL 72B', 2),
      ('deepseek/deepseek-r1-distill-llama-8b', 'DeepSeek R1 8B', 2),
      ('mistralai/mistral-7b-instruct-v0.3', 'Mistral 7B', 2),
      ('google/gemini-2.0-flash-lite-001', 'Gemini Flash Lite', 2),
      ('amazon/nova-micro-v1.0', 'Amazon Nova Micro', 2),
      ('cohere/command-r-08-2024', 'Command R', 3),
      ('qwen/qwen-2.5-72b-instruct', 'Qwen 2.5 72B', 3),
      ('meta-llama/llama-3.3-70b-instruct', 'Llama 3.3 70B', 3),
      ('mistralai/mistral-small-24b-instruct-2501', 'Mistral Small 24B', 3),
      ('google/gemini-1.5-flash-002', 'Gemini 1.5 Flash', 3),
      ('nousresearch/deephermes-3-llama-3-8b-preview', 'DeepHermes 3 8B', 3),
      ('gryphe/mythomax-l2-13b', 'MythoMax 13B', 4),
      ('openchat/openchat-7b', 'OpenChat 7B', 4),
      ('intel/neural-chat-7b-v3-1', 'Intel Neural Chat 7B', 4),
      ('sophosympatheia/rogue-rose-103b-v0.2', 'Rogue Rose 103B', 4),
      ('nousresearch/hermes-2-pro-mistral-7b', 'Hermes 2 Pro Mistral 7B', 4),
      ('huggingfaceh4/zephyr-7b-beta', 'Zephyr 7B Beta', 5),
      ('microsoft/phi-3-mini-4k-instruct', 'Phi-3 Mini 4K', 5),
      ('tinyllama/tinyllama-1.1b-chat-v1.0', 'TinyLlama 1.1B', 5),
      ('openrouter/free', 'Free Router (Auto)', 5)
    `).run();

    // Seed OpenCode Go models
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_models (model_id, name, tier, provider) VALUES
      ('opencode/deepseek-v4-flash', 'DeepSeek V4 Flash (OpenCode)', 1, 'opencode'),
      ('opencode/deepseek-v4-pro', 'DeepSeek V4 Pro (OpenCode)', 2, 'opencode'),
      ('opencode/qwen3.7-max', 'Qwen 3.7 Max (OpenCode)', 1, 'opencode'),
      ('opencode/qwen3.7-plus', 'Qwen 3.7 Plus (OpenCode)', 2, 'opencode'),
      ('opencode/kimi-k2.7-code', 'Kimi K2.7 Code (OpenCode)', 1, 'opencode'),
      ('opencode/kimi-k2.6', 'Kimi K2.6 (OpenCode)', 2, 'opencode'),
      ('opencode/glm-5.2', 'GLM 5.2 (OpenCode)', 1, 'opencode'),
      ('opencode/glm-5.1', 'GLM 5.1 (OpenCode)', 2, 'opencode'),
      ('opencode/mimo-v2.5', 'MiMo V2.5 (OpenCode)', 2, 'opencode'),
      ('opencode/mimo-v2.5-pro', 'MiMo V2.5 Pro (OpenCode)', 3, 'opencode'),
      ('opencode/minimax-m3', 'MiniMax M3 (OpenCode)', 2, 'opencode'),
      ('opencode/minimax-m2.7', 'MiniMax M2.7 (OpenCode)', 3, 'opencode')
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
      last_used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
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

    // Seed default templates
    await env.DB.prepare(`INSERT OR IGNORE INTO wa_templates (name, content, category) VALUES
      ('welcome', 'Assalamu Alaikum! Jobayer Group Career-এ আপনাকে স্বাগতম।', 'onboarding'),
      ('follow_up', 'Assalamu Alaikum! আগের কথোপকথনের ধারাবাহিকতায় আজ আবার যোগাযোগ করছি।', 'followup'),
      ('promo_basic', 'Assalamu Alaikum! Jobayer Group Career-এর একটি বিশেষ অফার সম্পর্কে জানতে চান?', 'promotion'),
      ('reminder', 'Assalamu Alaikum! মনে করিয়ে দিচ্ছি, আগামীকাল আমাদের অনলাইন মিটিং আছে।', 'reminder')
    `).run();

    g[DONE_FLAG] = true;
  } catch (e) {
    g[DONE_FLAG] = false;
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
