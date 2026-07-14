import { getCloudflareContext } from "@opennextjs/cloudflare";

const DONE_FLAG = "__dbSchemaSetupDone";
const DONE_LOCK = "__dbSchemaSetupLock";

async function ensureSchema(env: { DB: D1Database }): Promise<void> {
  const g = globalThis as any;
  if (g[DONE_FLAG]) return;
  if (g[DONE_LOCK]) {
    while (g[DONE_FLAG] === false) await new Promise(r => setTimeout(r, 50));
    return;
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
      key_slot INTEGER UNIQUE NOT NULL,
      key_value TEXT NOT NULL,
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

    // Seed default personas
    await env.DB.prepare(`INSERT OR IGNORE INTO ai_personas (name, gender) VALUES
      ('Fatima Begum', 'female'), ('Abdullah Hasan', 'male'),
      ('Shahin Akter', 'female'), ('Rafiq Islam', 'male'),
      ('Nasima Khatun', 'female'), ('Jahangir Alam', 'male'),
      ('Parvin Sultana', 'female'), ('Kamal Hossain', 'male'),
      ('Rokeya Begum', 'female'), ('Shafiqur Rahman', 'male')
    `).run();

    g[DONE_FLAG] = true;
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
  let db: D1Database | undefined;
  try {
    const ctx = await getCloudflareContext({ async: true });
    db = (ctx.env as any).DB as D1Database | undefined;
  } catch (e) {
    console.error("getCloudflareContext failed:", (e as Error)?.message);
  }
  if (db) {
    console.log("getDB: got D1 from getCloudflareContext, running ensureSchema...");
    await ensureSchema({ DB: db });
    return { DB: db };
  }
  try {
    const local = await getLocalDB();
    if (local) return { DB: local as unknown as D1Database };
  } catch (e) {
    console.warn("Local D1 fallback failed:", (e as Error)?.message);
  }
  throw new Error("D1 Database not available");
}

export async function ensureDB(): Promise<D1Database> {
  const { DB } = await getDB();
  return DB;
}
