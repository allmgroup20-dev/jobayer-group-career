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
  preferredLanguage: text("preferred_language").default("bn"),
  ageGroup: text("age_group"),
  occupation: text("occupation"),
  educationLevel: text("education_level"),
  gender: text("gender"),
  country: text("country"),
  city: text("city"),
  goal: text("goal"),
  preferredLearningTime: text("preferred_learning_time"),
  referralSource: text("referral_source"),
  communicationPreference: text("communication_preference").default("whatsapp"),
  budgetRange: text("budget_range"),
  religion: text("religion"),
  interestsUpdatedAt: text("interests_updated_at"),
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
  levelNameBn: text("level_name_bn"),
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
  minPrice: real("min_price").default(0),
  maxPrice: real("max_price").default(0),
  aiPriceEnabled: integer("ai_price_enabled").default(1),
  currency: text("currency").default("BDT"),
  commissionPercentage: real("commission_percentage").default(0),
  commissionFixed: real("commission_fixed").default(0),
  imageUrl: text("image_url"),
  category: text("category"),
  stock: integer("stock").default(-1),
  isActive: integer("is_active").default(1),
  enableCommission: integer("enable_commission").default(1),
  enableCod: integer("enable_cod").default(1),
  enableSslcommerz: integer("enable_sslcommerz").default(1),
  images: text("images"),
  commissionOverride: text("commission_override"),
  premiumMembership: integer("premium_membership").default(0),
  productType: text("product_type").default("physical"),
  directBuy: integer("direct_buy").default(0),
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

// Agent tables (Multi-Agent Research System)
export const aiAgents = sqliteTable("ai_agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agent_id").unique().notNull(),
  nameBn: text("name_bn").notNull(),
  nameEn: text("name_en").notNull(),
  level: integer("level").default(1),
  sector: text("sector"),
  parentAgentId: text("parent_agent_id"),
  status: text("status").default("idle"),
  modelId: text("model_id"),
  provider: text("provider").default("openrouter"),
  cronInterval: integer("cron_interval").default(360),
  lastRunAt: text("last_run_at"),
  nextRunAt: text("next_run_at"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const aiAgentTasks = sqliteTable("ai_agent_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agent_id").notNull(),
  taskType: text("task_type").notNull(),
  status: text("status").default("pending"),
  inputData: text("input_data"),
  outputData: text("output_data"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at"),
});

export const aiAgentSubmissions = sqliteTable("ai_agent_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromAgentId: text("from_agent_id").notNull(),
  toAgentId: text("to_agent_id").notNull(),
  submissionType: text("submission_type").default("research"),
  titleBn: text("title_bn"),
  content: text("content"),
  status: text("status").default("pending"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at"),
});

export const aiAgentReports = sqliteTable("ai_agent_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agent_id").notNull(),
  titleBn: text("title_bn"),
  summaryBn: text("summary_bn"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  metrics: text("metrics"),
  submittedAt: text("submitted_at"),
  createdAt: text("created_at"),
});

export const aiAgentLogs = sqliteTable("ai_agent_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agent_id").notNull(),
  action: text("action").notNull(),
  detailBn: text("detail_bn"),
  metadata: text("metadata"),
  createdAt: text("created_at"),
});

export const aiAgentGlobalConfig = sqliteTable("ai_agent_global_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: text("mode").notNull().default("auto"),
  provider: text("provider"),
  modelId: text("model_id"),
  updatedAt: text("updated_at"),
});

export const waContacts = sqliteTable("wa_contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").unique().notNull(),
  name: text("name"),
  status: text("status").default("pending"),
  priorityScore: integer("priority_score").default(0),
  source: text("source").default("manual"),
  assignedAccount: text("assigned_account"),
  lastContactedAt: text("last_contacted_at"),
  lastReply: text("last_reply"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const waMessageQueue = sqliteTable("wa_message_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  to: text("to").notNull(),
  text: text("text").notNull(),
  priority: integer("priority").default(0),
  status: text("status").default("queued"),
  accountId: text("account_id"),
  campaignId: text("campaign_id"),
  messageType: text("message_type").default("outreach"),
  attempts: integer("attempts").default(0),
  error: text("error"),
  scheduledAt: text("scheduled_at"),
  sentAt: text("sent_at"),
  createdAt: text("created_at"),
});

export const waCampaigns = sqliteTable("wa_campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  status: text("status").default("draft"),
  targetFilter: text("target_filter"),
  totalTargets: integer("total_targets").default(0),
  sentCount: integer("sent_count").default(0),
  repliedCount: integer("replied_count").default(0),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdBy: text("created_by"),
  createdAt: text("created_at"),
});

export const waTemplates = sqliteTable("wa_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").unique().notNull(),
  content: text("content").notNull(),
  category: text("category").default("general"),
  variables: text("variables"),
  usageCount: integer("usage_count").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const waBlocklist = sqliteTable("wa_blocklist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").unique().notNull(),
  reason: text("reason"),
  createdBy: text("created_by"),
  createdAt: text("created_at"),
});

export const waAccounts = sqliteTable("wa_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").unique().notNull(),
  phone: text("phone"),
  provider: text("provider").default("meta"),
  status: text("status").default("disconnected"),
  dailyLimit: integer("daily_limit").default(100),
  dailySent: integer("daily_sent").default(0),
  totalSent: integer("total_sent").default(0),
  config: text("config"),
  sessionData: text("session_data"),
  lastUsedAt: text("last_used_at"),
  createdAt: text("created_at"),
});

export const waWarmup = sqliteTable("wa_warmup", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").unique().notNull(),
  dayCount: integer("day_count").default(0),
  currentLimit: integer("current_limit").default(20),
  startedAt: text("started_at"),
  lastIncrementAt: text("last_increment_at"),
});

export const waScannedNumbers = sqliteTable("wa_scanned_numbers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").unique().notNull(),
  status: text("status").default("generated"),
  source: text("source").default("generator"),
  createdAt: text("created_at"),
});

export const waLogs = sqliteTable("wa_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone"),
  message: text("message"),
  direction: text("direction").default("outbound"),
  status: text("status").default("pending"),
  messageType: text("message_type").default("text"),
  campaignId: text("campaign_id"),
  error: text("error"),
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

// ── Phase 8: User Devices ──
export const userDevices = sqliteTable("user_devices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  userAgent: text("user_agent"),
  screenResolution: text("screen_resolution"),
  ipAddress: text("ip_address"),
  city: text("city"),
  country: text("country"),
  timezone: text("timezone"),
  language: text("language"),
  isActive: integer("is_active").default(1),
  lastSeenAt: text("last_seen_at"),
  firstSeenAt: text("first_seen_at"),
  createdAt: text("created_at"),
});

// ── Phase 9: Product Reviews ──
export const productReviews = sqliteTable("product_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  productId: text("product_id"),
  productType: text("product_type").default("course"),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  isApproved: integer("is_approved").default(0),
  createdAt: text("created_at"),
});

// ── Phase 8: Communication History (unified) ──
export const communicationHistory = sqliteTable("communication_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  channel: text("channel").notNull(),
  direction: text("direction").default("outbound"),
  message: text("message"),
  status: text("status").default("sent"),
  referenceId: text("reference_id"),
  metadata: text("metadata"),
  sentAt: text("sent_at"),
  createdAt: text("created_at"),
});

// ── Phase 8: Privacy Consent ──
export const privacyConsent = sqliteTable("privacy_consent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  consentType: text("consent_type").notNull(),
  isGranted: integer("is_granted").default(1),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  grantedAt: text("granted_at"),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at"),
});

// ── Phase 8: Attribution Log ──
export const attributionLog = sqliteTable("attribution_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  channel: text("channel").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  firstVisitAt: text("first_visit_at"),
  converted: integer("converted").default(0),
  convertedAt: text("converted_at"),
  createdAt: text("created_at"),
});

// ── Phase 11: Notification Preferences ──
export const notificationPreferences = sqliteTable("notification_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  channel: text("channel").notNull(),
  category: text("category").notNull(),
  enabled: integer("enabled").default(1),
  updatedAt: text("updated_at"),
});

// ── Phase 11: On-Site Notifications ──
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").default("info"),
  link: text("link"),
  isRead: integer("is_read").default(0),
  createdAt: text("created_at"),
});

// ── Phase 1: User Tracking & Activity ──
export const userEvents = sqliteTable("user_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  eventType: text("event_type").notNull(), // page_view, click, search, add_to_cart, purchase
  pageUrl: text("page_url"),
  pageCategory: text("page_category"),
  searchKeyword: text("search_keyword"),
  productId: text("product_id"),
  productCategory: text("product_category"),
  timeSpentSeconds: integer("time_spent_seconds"),
  deviceInfo: text("device_info"), // JSON
  sessionId: text("session_id"),
  metadata: text("metadata"), // JSON — extra data
  createdAt: text("created_at"),
});

export const userSessions = sqliteTable("user_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  sessionStart: text("session_start").notNull(),
  sessionEnd: text("session_end"),
  durationSeconds: integer("duration_seconds"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"), // mobile/desktop/tablet
  browser: text("browser"),
  os: text("os"),
  screenResolution: text("screen_resolution"),
  referrer: text("referrer"),
  city: text("city"),
  country: text("country"),
  timezone: text("timezone"),
  language: text("language"),
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  createdAt: text("created_at"),
});

export const userSearches = sqliteTable("user_searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  searchQuery: text("search_query").notNull(),
  searchType: text("search_type"), // course, product, general
  resultCount: integer("result_count"),
  clickedItem: text("clicked_item"),
  createdAt: text("created_at"),
});

export const userInterests = sqliteTable("user_interests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").unique().notNull(),
  categoryScores: text("category_scores").default("{}"), // JSON: {"web_development":85,"graphics":70}
  topCategories: text("top_categories").default("[]"), // JSON array
  lastCalculatedAt: text("last_calculated_at"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const userBehaviorScores = sqliteTable("user_behavior_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").unique().notNull(),
  leadScore: integer("lead_score").default(0),
  churnProbability: integer("churn_probability").default(0),
  purchaseIntent: integer("purchase_intent").default(0),
  rfmRecency: integer("rfm_recency").default(0),
  rfmFrequency: integer("rfm_frequency").default(0),
  rfmMonetary: real("rfm_monetary").default(0),
  segment: text("segment").default("new"), // new, active, at_risk, churned, vip
  lifetimeValue: real("lifetime_value").default(0),
  lastUpdated: text("last_updated"),
});

export const userPhonebooks = sqliteTable("user_phonebooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: text("worker_id").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactName: text("contact_name"),
  hasWhatsapp: integer("has_whatsapp").default(0),
  deviceType: text("device_type"),
  canBeContacted: integer("can_be_contacted").default(1),
  canSeeProfile: integer("can_see_profile").default(1),
  lastContactedAt: text("last_contacted_at"),
  source: text("source").default("whatsapp_sync"),
  lastCheckedAt: text("last_checked_at"),
  createdAt: text("created_at"),
});

// ── Courses Module ──
export const courseCategories = sqliteTable("course_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  icon: text("icon").default("📌"),
  isVisible: integer("is_visible").default(1),
  createdAt: text("created_at"),
});

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  description: text("description"),
  descriptionBn: text("description_bn"),
  categoryId: integer("category_id"),
  isNew: integer("is_new").default(1),
  isVisible: integer("is_visible").default(1),
  icon: text("icon").default("📌"),
  price: real("price").default(0),
  isPremium: integer("is_premium").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const courseFiles = sqliteTable("course_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull(),
  label: text("label"),
  labelBn: text("label_bn"),
  url: text("url").notNull(),
  fileType: text("file_type").default("link"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at"),
});

export const aiLeads = sqliteTable("ai_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").unique().notNull(),
  name: text("name"),
  status: text("status").default("new"),
  priorityScore: integer("priority_score").default(0),
  source: text("source").default("whatsapp"),
  genderGuess: text("gender_guess"),
  ageGroupGuess: text("age_group_guess"),
  sector: text("sector"),
  language: text("language").default("bn"),
  painPoints: text("pain_points"),
  interests: text("interests"),
  totalChats: integer("total_chats").default(0),
  lastChatAt: text("last_chat_at"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});
