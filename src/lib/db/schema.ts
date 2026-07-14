import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").unique().notNull(),
  name: text("name").notNull(),
  phone: text("phone").unique().notNull(),
  email: text("email"),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  sponsorId: text("sponsor_id"),
  sponsorName: text("sponsor_name"),
  level: integer("level").default(1),
  joinDate: text("join_date"),
  currency: text("currency").default("BDT"),
  balance: real("balance").default(0),
  totalEarned: real("total_earned").default(0),
  totalSpent: real("total_spent").default(0),
  totalTeamMembers: integer("total_team_members").default(0),
  membershipStatus: text("membership_status").default("active"),
  isTestAccount: integer("is_test_account").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const companyUsers = sqliteTable("company_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin"),
  permissions: text("permissions").default("all"),
  createdAt: text("created_at"),
});

export const mlmTree = sqliteTable("mlm_tree", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  parentId: text("parent_id"),
  sponsorId: text("sponsor_id"),
  levelNumber: integer("level_number").notNull(),
  position: integer("position").default(0),
  placementDate: text("placement_date"),
});

export const commissionLevels = sqliteTable("commission_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  levelNumber: integer("level_number").unique().notNull(),
  levelName: text("level_name").notNull(),
  percentage: real("percentage").default(0),
  fixedAmount: real("fixed_amount").default(0),
  currency: text("currency").default("BDT"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  description: text("description"),
  descriptionBn: text("description_bn"),
  price: real("price").notNull(),
  currency: text("currency").default("BDT"),
  commissionPercentage: real("commission_percentage").default(0),
  commissionFixed: real("commission_fixed").default(0),
  imageUrl: text("image_url"),
  category: text("category"),
  stock: integer("stock").default(-1),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").unique().notNull(),
  workerId: text("worker_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name"),
  quantity: integer("quantity").default(1),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").default("BDT"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  commissionStatus: text("commission_status").default("pending"),
  orderStatus: text("order_status").default("pending"),
  shippingAddress: text("shipping_address"),
  transactionId: text("transaction_id"),
  createdAt: text("created_at"),
});

export const commissions = sqliteTable("commissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  commissionId: text("commission_id").unique().notNull(),
  orderId: text("order_id").notNull(),
  fromWorkerId: text("from_worker_id").notNull(),
  toWorkerId: text("to_worker_id").notNull(),
  levelNumber: integer("level_number").notNull(),
  percentage: real("percentage"),
  fixedAmount: real("fixed_amount"),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").default("BDT"),
  status: text("status").default("pending"),
  createdAt: text("created_at"),
});

export const withdrawals = sqliteTable("withdrawals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  withdrawalId: text("withdrawal_id").unique().notNull(),
  workerId: text("worker_id").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").default("BDT"),
  paymentMethod: text("payment_method"),
  accountNumber: text("account_number"),
  status: text("status").default("pending"),
  createdAt: text("created_at"),
  processedAt: text("processed_at"),
});

export const currencies = sqliteTable("currencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  exchangeRate: real("exchange_rate").default(1),
  isDefault: integer("is_default").default(0),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

export const translations = sqliteTable("translations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  translationKey: text("translation_key").unique().notNull(),
  enText: text("en_text").notNull(),
  bnText: text("bn_text"),
  category: text("category").default("general"),
  updatedAt: text("updated_at"),
});

export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settingKey: text("setting_key").unique().notNull(),
  settingValue: text("setting_value"),
  settingType: text("setting_type").default("text"),
  updatedAt: text("updated_at"),
});

export const testSessions = sqliteTable("test_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").unique().notNull(),
  createdBy: integer("created_by").notNull(),
  isActive: integer("is_active").default(0),
  mockWorkersCount: integer("mock_workers_count").default(0),
  createdAt: text("created_at"),
});

export const whatsappLog = sqliteTable("whatsapp_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id"),
  phone: text("phone").notNull(),
  message: text("message"),
  messageType: text("message_type"),
  status: text("status").default("pending"),
  sentAt: text("sent_at"),
});

export const aiLog = sqliteTable("ai_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id"),
  prompt: text("prompt"),
  response: text("response"),
  model: text("model"),
  tokensUsed: integer("tokens_used").default(0),
  createdAt: text("created_at"),
});

export const updateHistory = sqliteTable("update_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  version: text("version").notNull(),
  description: text("description"),
  releasedAt: text("released_at"),
  status: text("status").default("active"),
});

export const aiModels = sqliteTable("ai_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: text("model_id").unique().notNull(),
  name: text("name").notNull(),
  tier: integer("tier").default(5),
  provider: text("provider").default("openrouter"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

export const aiApiKeys = sqliteTable("ai_api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keySlot: integer("key_slot").unique().notNull(),
  keyValue: text("key_value").notNull(),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

export const aiConversations = sqliteTable("ai_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull(),
  role: text("role").default("customer"),
  messages: text("messages"),
  personaName: text("persona_name"),
  personaGender: text("persona_gender"),
  language: text("language").default("bn"),
  painPoints: text("pain_points"),
  interests: text("interests"),
  source: text("source").default("whatsapp"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const aiPhoneProfiles = sqliteTable("ai_phone_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").unique().notNull(),
  nameGuess: text("name_guess"),
  genderGuess: text("gender_guess"),
  ageGroupGuess: text("age_group_guess"),
  sector: text("sector"),
  language: text("language").default("bn"),
  painPoints: text("pain_points"),
  interests: text("interests"),
  priorityScore: integer("priority_score").default(0),
  totalChats: integer("total_chats").default(0),
  lastChatAt: text("last_chat_at"),
  status: text("status").default("new"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const aiSkills = sqliteTable("ai_skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keywords: text("keywords").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  usageCount: integer("usage_count").default(0),
  category: text("category").default("general"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const aiPersonas = sqliteTable("ai_personas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  isActive: integer("is_active").default(1),
  usageCount: integer("usage_count").default(0),
  createdAt: text("created_at"),
});

export const aiKnowledgePages = sqliteTable("ai_knowledge_pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").default("general"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const aiModelFailoverState = sqliteTable("ai_model_failover_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  currentKeySlot: integer("current_key_slot").default(1),
  currentModelIndex: integer("current_model_index").default(0),
  exhaustedModels: text("exhausted_models"),
  totalResponses: integer("total_responses").default(0),
  todayResponses: integer("today_responses").default(0),
  lastResetDate: text("last_reset_date"),
  updatedAt: text("updated_at"),
});
