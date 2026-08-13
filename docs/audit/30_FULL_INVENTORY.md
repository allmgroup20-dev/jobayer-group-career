# 30 — Full Repository Inventory (Phase 2)

> Machine-generated catalog of every route/API/component/DB object/migration/worker.
> Counts verified by filesystem scan on the current working tree.

## 30.1 App API Routes — **149** (`src/app/api/**/route.ts`)

### Auth & Identity (16)
`auth/register`, `auth/worker-login`, `auth/otp/send`, `auth/otp/verify`, `auth/otp/login`, `auth/verify-password`, `auth/me`, `auth/biometric/register`, `auth/biometric/auth`, `auth/facebook`, `auth/google`, `auth/company-login`, `auth/company-logout`, `accounts`, `workers/profile`, `bonus/award`

### Payments & Checkout (12)
`payment/init`, `payment/ipn`, `payment/success`, `payment/fail`, `payment/cancel`, `payment/validate`, `resource-checkout`, `resource-checkout/ipn`, `resource-checkout/success`, `orders`, `products`, `products/[id]`

### Referral / Affiliate / Unlocks (13)
`referrals/share-reward`, `unlocks`, `unlocks/limits`, `affiliate/tree`, `affiliate/team-stats`, `affiliate/commissions`, `affiliate/levels`, `affiliate/leaderboard`, `withdrawals`, `withdrawals/auto-payout`, `withdrawals/premium-eligible`, `downloads`, `permissions`

### Courses / Content (21)
`courses`, `courses/[id]`, `courses/categories`, `courses/categories/[id]`, `courses/count`, `courses/prewarm`, `courses/[id]/bookmarks`, `courses/[id]/files`, `courses/[id]/files/[fileId]`, `courses/[id]/progress`, `courses/[id]/ratings`, `courses/[id]/track-download`, `reviews`, `reviews/[id]`, `reviews/stats`, `trainers`, `trainers/[id]`, `institutions`, `institutions/[id]`, `bookmarks`, `pricing/tiers`

### Tracking / Analytics (16)
`track/event`, `track/events`, `track/session`, `track/session/[id]`, `track/device`, `track/funnel`, `track/marketing`, `track/phonebook`, `track/phonebook/[id]`, `track/phonebook/bulk`, `track/score`, `track/analytics`, `tracking/monitor`, `personalize/stats`, `personalize/insights`, `personalize/notify`

### WhatsApp / Notifications (10)
`whatsapp/send`, `whatsapp/queue`, `whatsapp/contacts`, `notifications`, `notifications/[id]/read`, `notifications/mark-read`, `notifications/preferences`, `notifications/sync`, `platform-prefs`, `platforms/links`

### Company (Admin) (48)
`company/automation`, `company/auto-assign-knowledge`, `company/brand-metrics`, `company/campaigns`, `company/commissions`, `company/csr`, `company/daily-habits`, `company/employee-persuasion`, `company/finance`, `company/funnel-psychology`, `company/global-markets`, `company/impersonate`, `company/kpi`, `company/loyalty`, `company/members`, `company/members/[workerId]`, `company/orders`, `company/payment-schedule`, `company/persuasion-stats`, `company/persuasion-train`, `company/plc-dashboard`, `company/positioning`, `company/pricing`, `company/psychologist-metrics`, `company/psychology-profile`, `company/psychology-reports`, `company/psychology-stats`, `company/segments`, `company/settings`, `company/training-modules`, `company/users`, `customer360/[workerId]`, `company/impersonate`, `dashboard/summar`, `maintenance/auto-cleanup`, `maintenance/cache-workers`, `maintenance/cleanup`, `maintenance/cleanup-all`, `maintenance/clear-cache`, `maintenance/history`, `maintenance/schedule`, `maintenance/stats`, `live/sales`, `system/health`, `system/logs`, `system/perf`, `diagnose`, `db-check`, `seed`, `cron/keepwarm`, `health`

### Privacy / Data Rights (5)
`privacy/consent`, `privacy/tracking`, `privacy/export-data`, `privacy/delete-data`, `chat/admin/[...path]`

### Catch-all
`[...proxy]` (route proxy for dynamic segments)

## 30.2 App Pages — **97** (`src/app/**/page.tsx`)
Public: `page`, `login`, `register`, `checkout`, `courses`, `courses/[id]`, `product-list`, `membership`, `onboarding`, `reviews`, `live-updates`, `offline`
Dashboard: `dashboard`, `dashboard/{orders,commissions,tree,profile,inbox,notifications,notification-prefs,courses,complaints,platforms,ai-predictions}`
Company: `company/login` + 60 admin pages (`company/{ai*,analytics,automation,brand-dashboard,campaigns,chat,complaints,course-stats,courses*,csr,currencies,customers,*,daily-habits,employee-persuasion,events,finance,fingerprint,funnel,funnel-psychology,global-markets,goal,institutions,knowledge,leads,levels,login,loyalty,maintenance,marketing,members,notifications,orders,payment-gateway,personalization,plc-dashboard,positioning,pricing,privacy,products,psychologist-dashboard,psychology*,reviews,segments,sentiment,sessions,settings,skills,test-mode,tracking-monitor,trainers,translations,unlocks,updates,users,whatsapp-contacts,withdrawals}`)
System: `system`, `system/health`, `system/logs`, `system/reports`

## 30.3 Components — **91** (`src/components/**`)
Listed in `INDEX.md` scope; notable: `CommandPalette`, `LivePurchaseTicker`, `PwaRegister`, `chat/ChatWidget`, `courses/CheckoutModal`, `layout/{Navbar,BottomNav,Footer,LanguageSwitcher}`, `home/{Hero,HeroSection,HowItWorks,PaymentGallery,SmartInstall,StatsCounter,Testimonials,TrustSection,FAQSection,PersonalizedSection,MenuPreviewSection,LiveNotificationBar}`, `privacy/CookieConsentBanner`, `onboarding/ContactSyncBanner`, `referral/{ReferralQRCode,InviteContacts}`, `reviews/*`, `ui/*`, `marketing/*` (16), `psychology/*` (8), `analytics/*` (5), `ai/*` (5), `finance/*` (4), `courses/*` (7), `dashboard/IncomeProgress`, `notifications/NotificationBell`, `settings/FingerprintTab`, `system/{PerfMonitor,SystemErrorBoundary}`

## 30.4 Database — **65 tables** (`src/lib/db/schema.ts`)
Core: `workers`, `products`, `orders`, `commissions`, `withdrawals`, `resourcePurchases`, `userUnlocks`, `unlockLimits`, `courseCategories`, `courses`, `courseCategoryMap`, `courseFiles`, `courseRatings`, `courseDownloads`, `courseBookmarks`, `courseProgress`, `trainers`, `institutions`, `reviews`, `bookmarks`
Affiliate: `affiliateTree`, `commissionLevels`, `savedAccounts`
Auth: `companyUsers`, `companySettings`, `testSessions`, `userDevices`
AI: `aiLog`, `aiModels`, `aiApiKeys`, `aiConversations`, `aiPhoneProfiles`, `aiSkills`, `aiPersonas`, `aiModelFailoverState`, `brainUsage`, `agentFeedback`, `agentMemory`, `agentSchedule`, `customFlows`, `dynamicEmployees`, `aiTargets`, `aiLeads`, `knowledgeAccumulation`, `knowledgeEntries`, `knowledgeRelationships`, `conversationLearnings`
Messaging: `whatsappLog`, `waLogs`, `waContacts`, `waMessageQueue`, `communicationHistory`, `notificationPreferences`, `notifications`
Analytics: `attributionLog`, `userEvents`, `userSessions`, `userSearches`, `userInterests`, `userBehaviorScores`, `userPhonebooks`, `tracking` (via `track/`), `maintenanceLog`, `updateHistory`, `translations`, `currencies`, `productReviews`, `privacyConsent`, `complaints`, `userPlatformLinks`

## 30.5 Migrations — **18** (`migrations/`)
`001_initial` → `002_company_login` → `003_fix_company_login` → `004_ai_features` → `005_free_models` → `006_brain_usage` → `007_agent_memory` → `008_custom_flows` → `009_analytics` → `010_agent_tuning` → `011_negativity_dynamic` → `012_trainers_institutions` → `013_trainer_institution_courses` → `014_drop_course_icon` → `015_demo_bonus` → `016_resource_income` → `017_membership_tiers` → `018_kotler_marketing`

## 30.6 AI Worker (`ai-app/`) — **58 API routes**
`ai/{brain,brand,campaign,chat,content,conversations,global-market,growth,knowledge,loyalty,models,persuasion/apply,plc,position,pricing,psychologist,segment,service-quality,settings,skills,skills/consolidate,skills/feedback,stats,targets,team,workflow}`, `chat/web`, `company/ai-distribution`, `knowledge/{auto-seed,entries,feedback,learnings,search,seed,summary}`, `leads`, `messenger/webhook`, `system/{analyze,reports}`, `telegram/webhook`, `whatsapp/{outreach,proactive-followup,webhook}`

## 30.7 Chat Worker (`chat-worker/`)
`src/{index,ai,d1,types,webhook}.ts` — single worker bound to D1, `BRAIN_API_URL` var.

## 30.8 WhatsApp Relay (`wa-relay/`)
`index.mjs` (505 lines) — Baileys WhatsApp-Web client; Node HTTP server; Railway/Docker host; endpoints `/`, `/health`, `/qr`, `/logs`, `/start`, `/stop`, `/reset`, `/backup-auth`, `/diag`; queue-poller every 5s.

## 30.9 Config / CI
`wrangler.jsonc` (app), `ai-app/wrangler.jsonc`, `chat-worker/wrangler.jsonc`, `.github/workflows/{deploy,deploy-ai,deploy-chat}.yml`, `wa-relay/{Dockerfile,railway.json,index.mjs}`.

*— End inventory. Detail reports: `20_…`–`27_…`.*
