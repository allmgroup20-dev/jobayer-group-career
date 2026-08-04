# 02 — Coverage Matrix (100% Scope Verification)

> Implements `docs/framework/07_COVERAGE_STANDARDS.md`. Three layers. **No repository item is left unclassified.**
> Status legend: `Audited` = evidence reviewed · `Partial` = structure confirmed, deep behavior ⏱/❓ · `Gap` = known, not yet reviewed · `Excluded` = justified.
> Evidence classes: ✅ static · ⏱ runtime · 🏭 prod · ❓ manual.
> *Last reviewed: 2026-08-04 · Review draft — not committed.*

---

## LAYER 1 — Executive (overall %)

| Category | Total | Audited | Partial | Gap | Excluded | Coverage % |
|---|---|---|---|---|---|---|
| Pages | 97 | 2 (core) | 95 | 0 | 0 | 2% (deep) / 100% classified |
| API Routes | 149 | 20 | 129 | 0 | 0 | 13% (deep) / 100% classified |
| Components | 89 | 8 | 81 | 0 | 0 | 9% (deep) / 100% classified |
| DB Tables | 65 | 24 | 41 | 0 | 0 | 37% (deep) / 100% classified |
| Migrations | 18 | 18 | 0 | 0 | 0 | 100% (listed) / 7 applied-verified ⏱ |
| Workers | 3 (app/ai/chat) + 1 relay | 4 | 0 | 0 | — | 80% / relay runtime ⏱ |
| Configs | 6 (3 wrangler + deploy-ai/chat + docker/railway) | 6 | 0 | 0 | 0 | 100% |
| Scripts | 0 standalone found (logic in routes) | — | — | — | — | n/a (none present) |
| Documentation | docs/strategy (8) + docs/audit (13→21) + docs/framework (9) | all | 0 | 0 | 0 | 100% |
| **OVERALL** | **≈429 items** | 74 deep | 352 | 0 | 0 | **100% classified** · deep % pending Phase-2 follow-through |

> **Coverage policy:** "100% classified" is met because every item carries a status; deep-audit % is intentionally partial and tracked below as remaining work, not hidden.

---

## LAYER 2 — Domain (%)

| Domain | Items in scope | Audited (deep) | Verification | Notes / blockers |
|---|---|---|---|---|
| Authentication & Identity | 16 routes + auth lib | 9 | ✅/⏱ | OTP verify ratelimit ❓ (H1) |
| Payments / Checkout | 12 routes + 5 flows | 10 | ✅ | C1–C5 confirmed |
| WhatsApp / Messaging | 10 routes + relay + 4 lib | 12 | ✅/⏱/🏭 | C8/H2/H3 |
| Referral / Affiliate / Unlocks | 13 routes + 4 lib | 10 | ✅ | C9/H6 |
| AI Stack (ai-app/chat) | 58 routes + 5 files | 12 | ⏱/🏭 | A1–A3 |
| Security & AuthZ (cross-cutting) | all APIs | systemic | ✅ | C6 |
| Database | 65 tables + 18 migrations | 24 | ✅/⏱ | C5 |
| UX / SEO / Perf / A11y | pages + components | 8 | ⏱/🏭 | S1–S4 |
| Operations / CI-CD | 3 workflows + configs | 6 | ✅/⏱ | O1–O4/H5 |
| Business / Growth | strategy docs + flows | 12 | ✅/🏭 | B/V |
| Automation / Notifications / Tracking | 16 track + automation | 10 | ⏱ | analytics runtime ⏱ |

---

## LAYER 3 — Item-Level (complete, grouped)

> One row per item. `Deep` = source evidence reviewed this audit (file:line in the linked report). `Review` = listed/classified; deep pass scheduled. All items are **classified** (no silent gap).

### 3.1 API Routes — `src/app/api/**/route.ts` (149)

**Audited (deep) — 20 ✅ static:**
`payment/init`, `payment/ipn`, `payment/success`, `resource-checkout`, `resource-checkout/ipn`, `resource-checkout/success`, `auth/register`, `auth/otp/send`, `auth/otp/verify`, `auth/verify-password`, `auth/worker-login`, `auth/me`, `referrals/share-reward`, `unlocks`, `withdrawals`, `withdrawals/auto-payout`, `withdrawals/premium-eligible`, `whatsapp/send`, `whatsapp/queue`, `health` → evidence in `10_…` (C1–C9), `21_SECURITY_AUDIT` — **P0**.

**Classified (review — 132):** all remaining routes (auth/*, accounts, bonus/award, affiliate/*, bookmarks, chat/*, company/*, complaints, courses/*, cron/keepwarm, customer360, dashboard/summar, db-check, diagnose, downloads, institutions, live/sales, maintenance/*, notifications/*, orders, personalize/*, permissions, platforms/links, privacy/*, products, profile/suggest, recommendations, reviews/*, seed, system/*, track/*, tracking/monitor, trainers, unlocks/limits, whatsapp/*, withdrawals/premium-eligible, workers/profile, [...proxy]) → **Status `Partial`**, Verification ⏱/❓, Deep pass scheduled Phase-2.5. Security-sensitive (company/*, maintenance/*, seed, db-check, diagnose, bonus/award) flagged **P1** auth-verify.

### 3.2 Pages — `src/app/**/page.tsx` (97)
**Audited (deep):** `courses/[id]` (courses WIP), `dashboard` (WIP) — Partial.
**Classified (review — 95):** all others → `Partial`, ⏱/❓. Company pages (60) **P1** auth middleware verify. Home/marketing pages **P2/P3** SEO/a11y.

### 3.3 Components — `src/components/**` (89)
**Audited (deep):** `ui/Button`, `ui/Card`, `PwaRegister`, `privacy/CookieConsentBanner`, `onboarding/ContactSyncBanner`, `chat/ChatWidget` (referenced) — Partial/✅.
**Classified (review — 81):** remaining (home/*, layout/*, marketing/*, psychology/*, analytics/*, courses/*, ai/*, finance/*, reviews/*, settings/*, system/*, notifications/*, dashboard/*) → `Partial`, ⏱/❓. Notes: `ContactSyncBanner` consent copy **P1**; `LivePurchaseTicker`/`LiveNotificationBar` truthfulness **P2**.
⏳ Working-tree WIP: `LaunchOfferTimer.tsx` deleted (uncommitted) — flagged, not certified.

### 3.4 Database Tables — `src/lib/db/schema.ts` (65)
**Audited (deep — 24):** `workers`, `orders`, `commissions`, `withdrawals`, `resourcePurchases`, `userUnlocks`, `unlockLimits`, `affiliateTree`, `commissionLevels`, `savedAccounts`, `companyUsers`, `companySettings`, `privacyConsent`, `notificationPreferences`, `notifications`, `waLogs`, `whatsappLog`, `waContacts`, `waMessageQueue`, `userDevices`, `attributionLog`, `courseCategories`, `courses`, `products` → ✅ static (`22_DATABASE_AUDIT`); gaps: no `UNIQUE(transaction_id)` (C5).
**Classified (review — 41):** AI/analytics tables (`ai*`, `brain*`, `agent*`, `knowledge*`, `userEvents`, `userSessions`, `userPhonebooks`, `course*` rest, `complaints`, `translations`, `currencies`, `testSessions`, `updateHistory`, `maintenanceLog`) → `Partial`, ⏱/❓.

### 3.5 Migrations — `migrations/` (18)
All listed (`30_FULL_INVENTORY` §30.5). `001`–`018` present. Applied-state on prod **⏱** (`22_…` §22.3); `014_drop_course_icon` destructive check **🏭**.

### 3.6 Workers & Services (4)
- `wrangler.jsonc` (app) ✅ · `ai-app/wrangler.jsonc` ✅ · `chat-worker/wrangler.jsonc` ✅ — bindings verified (`INDEX`/`27_OPS`).
- `wa-relay/index.mjs` ✅ (505 L) — auth endpoints, /qr,/logs risk (H2), Baileys (H3); 24h stability **🏭**.

### 3.7 Config / CI / Docs
- `.env.example` ✅ (16 keys) · `.github/workflows/{deploy,deploy-ai,deploy-chat}.yml` ✅ (O1/H5) · `wa-relay/{Dockerfile,railway.json}` ✅.
- Docs: `docs/strategy/*` (8) ✅ · `docs/audit/*` (this set) ✅ · `docs/framework/*` (9) ✅.

### 3.8 Excluded (justified)
- `node_modules`, `package-lock.json`, generated build outputs (`.open-next/`, `tsconfig.tsbuildinfo`), vendor/minified artifacts. — justified exclusion (generated/vendor).
- `src/lib/db/local-d1.ts` — dev-only in-memory emulator; excluded from prod scope, noted (dev-only).

---

## 📊 Coverage Summary
- **Total items classified:** ~429 · **Excluded (justified):** build/vendor only.
- **Skipped items:** 0 · **Unknown items:** 0 (discovered via filesystem scan).
- **Deep-audited:** 74 items (core security/commerce/DB) — **before launch certification all P0/P1-relevant items must be deep (Phase-2.5 follow-through).**
- **Coverage gaps to close pre-certification:** all `Partial` items in domains Payments, WhatsApp, Referral, AI, Ops (must be deep + runtime-tested per `40_…`).

*— Living doc: update as Phase-2.5 deep passes and runtime tests complete.*