# 21 — Security Audit (Phase 2)

> **Status:** P0 findings from Phase 1 confirmed below; additional areas checked. **Security score is the primary launch blocker.**
> Rules: claims are `✅ static-confirmed` or `⏱ needs-runtime`. No claim is inferred.

## 21.1 Confirmed Critical (from Phase 1 — full detail in `10_…`)
| ID | Summary | Evidence |
|---|---|---|
| C1 | IPN signature presence-only check → forgeable `VALID` | `sslcommerz.ts:127-132` |
| C2 | `val_id` verification optional everywhere | `payment/ipn:34`, `payment/success:29`, `resource-checkout/success:35`, `resource-checkout/ipn` (absent) |
| C3 | success GET defaults `status=VALID` → free premium/unlocks | `resource-checkout/success:10` |
| C4 | price/amount client-controlled | `payment/init:46`, `resource-checkout:21` |
| C6 | no API auth; client `workerId` trusted (IDOR) | `middleware.ts:52`, `unlocks:8`, `share-reward:9`, `resource-checkout:10`, `auto-payout:8` |
| C7 | public payout endpoint | `withdrawals/auto-payout:5-40` |
| C9 | registration w/o phone verification | `auth/register:13-45` |

## 21.2 Authentication & Authorization (worker-facing)
- **Token exists but optional.** `register` returns a JWT (`auth/register:97-98`) via `generateToken`. `auth/me` presumably reads it. But the majority of business routes never validate it.
- `middleware.ts` protects only `/company` pages via `company_token` cookie (`:33-43`); **all `/api` excluded** (`:52`).
- **IDOR examples (static-confirmed):**
  - `GET /api/unlocks?workerId=X` → anyone's unlock list. `unlocks/route.ts:5-17`
  - `POST /api/referrals/share-reward {workerId}` → grant quota to anyone. `share-reward/route.ts:7-37`
  - `POST /api/resource-checkout {workerId}` → create order for anyone. `resource-checkout/route.ts:8-22`
  - `POST /api/withdrawals/auto-payout {workerId}` → payout anyone. `auto-payout/route.ts:19-40`
- **Admin routes (`/api/company/*`, `/api/customer360`, `/api/company/impersonate`):** need verification that each enforces company auth (Phase 2 follow-up — ⏱ check each handler; middleware alone insufficient since `/api` is excluded).
- **`bonus/award`, `seed`, `db-check`, `diagnose`, `maintenance/*`:** sensitive endpoints — **must** be admin-only; static: no visible auth in several → high risk if reachable in prod (⏱ verify exposure).

## 21.3 Rate-Limiting (OTP/Auth abuse)
- OTP send: 45s per phone via KV (`otp/send:18-22`) ✅.
- OTP verify: **no attempt limit** → brute-force (H1) ✅.
- No global login/register rate limit, no per-IP limits, no captcha (turnstile absent) — ⏱ (verify CF WAF config).

## 21.4 Injection
- SQL: all observed queries parameterized via `.bind()` (`queries.ts:2,13`) ✅ — no raw-string interpolation found in audited routes.
- XSS: `wa-relay` dashboard uses inline HTML with **unescaped** log lines (`index.mjs:328` `l.msg.substring(...)` injected into HTML) — self-XSS only, internal page, but flags pattern. App React escapes by default; check `dangerouslySetInnerHTML` usage in Phase-2 component pass (⏱).
- Command injection / arbitrary write: none found in audited paths.

## 21.5 CSRF
- State-changing endpoints are POST/GET-with-side-effects (payment success is **GET with side effects** — C3). No Origin/CSRF check in any audited route; Cloudflare may mitigate, but **GET-with-side-effect is a CSRF vector** (e.g., `<img src="…/api/resource-checkout/success?tran_id=…">`). → P0 alongside C3.
- Recommend: all state-changing APIs require POST + token; verify `Origin`/`Sec-Fetch-Site`.

## 21.6 Secrets & Env Hygiene
- No hardcoded secrets found in repo (`.env.example` placeholders only) ✅.
- **Risk:** `wa-relay` `AUTH_BASE64` restores the WhatsApp session; exposed `/backup-auth` is auth-gated (`requireAuth`) ✅, but `/qr` public (H2).
- Deploy secrets **not provisioned by CI** (`deploy.yml:32,46` `if:false`) — H5.
- `SSLCOMMERZ_IS_LIVE=false` var (`wrangler.jsonc:17`) — ensure flipped only when live store ready.
- OTP `devCode` returned when WhatsApp unconfigured (`otp/send:34-35`) — remove in prod.

## 21.7 Privacy / Data Rights
- Present: `privacy/consent`, `privacy/tracking`, `privacy/export-data`, `privacy/delete-data`, `privacyConsent` table, `CookieConsentBanner`, `notificationPreferences` — good foundation.
- **Gap:** no explicit consent record before outbound WhatsApp (implied by registration) — legal risk for BD/PDPA-style compliance and Meta policy (see `25_…`).
- **Phonebook sync** (`track/phonebook/bulk`, `ContactSyncBanner`) uploads user contacts — must be gated by explicit consent + notice; verify UI copy and that data is used only for the stated purpose (⏱ runtime UI check).

## 21.8 Phase-2.5 Deep-pass — newly confirmed (this audit)
| ID | Finding | Evidence | Severity |
|---|---|---|---|
| 21.8a | `/api/whatsapp/send` **unauthenticated** — anyone POSTs `{to,text,immediate:true}` → arbitrary SMS via `sendMessage` at founder's cost, or bulk-blaster to `workerIds` | `whatsapp/send/route.ts:6-43` | 🔴 Critical |
| 21.8b | `/api/whatsapp/queue` **unauthenticated** — `flush`, `clear_failed`, `retry_failed`, `mark_sent` allow queue tampering/DoS | `whatsapp/queue/route.ts:36-67` | 🟠 High |
| 21.8c | `PATCH /api/withdrawals` **unauthenticated** — anyone sets ANY `withdrawal_id` to `completed`/`rejected`/`processing` → treasury state manipulation | `withdrawals/route.ts:94-114` | 🔴 Critical (extends C7) |
| 21.8d | `POST /api/withdrawals` allows multiple `pending` withdrawals; balance not reserved until `completed` → over-payout risk if multiple completed | `withdrawals/route.ts:33-76` | 🟠 High |
| 21.8e | `GET /api/withdrawals/premium-eligible` returns premium members + **bank/bkash account numbers** → PII leak, unauthenticated | `withdrawals/premium-eligible/route.ts:8-16` | 🟠 High |
| 21.8f | `auth/worker-login` no attempt limit/lockout → password brute-force | `auth/worker-login/route.ts:16-96` | 🟠 High |
| 21.8g | `GET /api/withdrawals?workerId=X` returns any user's withdrawal records (IDOR, C6) | `withdrawals/route.ts:118-133` | 🟠 High |

## 21.8 Security Scorecard (Phase-2.5 interim)
| Area | Score | Notes |
|---|---|---|
| AuthN/AuthZ | 8/100 | C6 + 21.8c (PATCH) |
| Payments | 15/100 | C1–C5 |
| Rate-limiting | 25/100 | OTP send only; login/withdraw unlimited |
| Injection | 80/100 | parameterized |
| CSRF | 20/100 | GET-with-side-effects |
| Secrets | 45/100 | clean repo, CI disabled |
| Privacy/Consent | 45/100 | 21.8e account-number leak |
| **Overall Security** | **20/100** | P0-gated (worse than Phase-1 est.) |

> Final security score incorporated into `41_LAUNCH_READINESS_CERTIFICATION.md`.

---

## 21.9 The 17 Mandatory Security Sub-Audits (AIOS Part 08 · AUTHENTICATION AUDIT–INCIDENT RESPONSE — Phase-2.5 mapping)

| # | Sub-audit | Covered where | New findings |
|---|---|---|---|
| 1 | Authentication | §21.2, 21.3, C9, 21.8f | H1 brute-force; no phone-ownership at register |
| 2 | Authorization | §21.2, C6, 21.8c/g | systemic IDOR; admin routes unverified |
| 3 | API security | §21.4, 21.5, C1–C4, 21.8a/b | unauth send/queue; GET-with-side-effect |
| 4 | Database security | `22_DATABASE_AUDIT` | see 22 (uniqueness/constraints) |
| 5 | **File security** | §21.9.1 | new |
| 6 | **AI security** | §21.9.2 | new |
| 7 | **WhatsApp security** | §21.9.3 (+ C8, 21.8a/b) | new |
| 8 | **Referral security** | §21.9.4 (+ C9) | new |
| 9 | Payment security | §21.1 C1–C5 | see 10_ |
| 10 | **Business fraud** | §21.9.5 | new |
| 11 | **Bot abuse** | §21.9.6 | new |
| 12 | Privacy | §21.7, 21.8e | account-number leak |
| 13 | **Legal** | §21.9.7 | new |
| 14 | **Trust** | §21.9.8 | new |
| 15 | **Business risk** | §21.9.9 | new |
| 16 | Disaster recovery | §21.9.10 | new |
| 17 | **Incident response** | §21.9.11 | new |

### 21.9.1 Sub-Audit #5 — File Security
- F1 🟡 Medium: resource/premium **unlock access control relies on client-side success-status default** (C3 `resource-checkout/success:10` default `VALID`) → premium files can be granted without payment. Part of P0 #1–#3.
- F2 🔵 Low: no upload endpoints found in audited surface (no path-traversal surface) — **verify** (❓ full inventory check).
- F3 🟡 Medium: `dangerouslySetInnerHTML` at `src/app/layout.tsx:88` — verify no user-controlled content flows through it (⏱).

### 21.9.2 Sub-Audit #6 — AI Security
- AIS1 🟠 High: **prompt-injection surface** on `chat-worker` / `ai-app` (57 routes) — user input treated as instructions; **no injection-hardening / output schema validation confirmed** (⏱ deep-pass on `chat-worker/src/index.ts` + `ai-app` — pending).
- AIS2 🟡 Medium: AI cost = business risk (open-ended prompts) — token budgets/caching unverified (`25_AI_ECOSYSTEM_AUDIT` A-category).
- AIS3 🟡 Medium: PII into prompts — ensure phone/name not sent to AI models (❓ verify prompt templates).

### 21.9.3 Sub-Audit #7 — WhatsApp Security
- WS1 🔴 Critical: `/api/whatsapp/send` unauthenticated arbitrary message at founder's cost (21.8a).
- WS2 🟠 High: `/api/whatsapp/queue` unauth queue tampering/DoS (21.8b).
- WS3 🟠 High: wa-relay `/qr` public (H2) — anyone can hijack the WhatsApp session pairing.
- WS4 🟠 High: free-form text (not approved template) → deliverability + Meta ban-risk (C8, ⏱).
- WS5 🟡 Medium: consent record before outbound missing (21.7).

### 21.9.4 Sub-Audit #8 — Referral Security
- RS1 🟠 High: `share-reward` grants quota to arbitrary `workerId` (IDOR, §21.2).
- RS2 🟠 High: registration w/o phone-ownership verification → **self-referral farming** feasible (C9).
- RS3 🟡 Medium: no anti-self-referral/anti-fraud rules confirmed on reward claiming (⏱).

### 21.9.5 Sub-Audit #10 — Business Fraud
- BF1 🔴 Critical: forged IPN → free unlocks at scale (C1/C2).
- BF2 🔴 Critical: public `auto-payout` + unauth PATCH withdrawal → treasury manipulation (C7, 21.8c).
- BF3 🟠 High: multiple `pending` withdrawals, balance not reserved → over-payout (21.8d).
- BF4 🟠 High: refund abuse / double-grant race (C5 idempotency).

### 21.9.6 Sub-Audit #11 — Bot Abuse
- BA1 🟠 High: **no Turnstile/captcha anywhere** (grep count 0) — OTP/register/login bots unmitigated.
- BA2 🟠 High: no per-IP/global rate limits; OTP verify unlimited (H1, §21.3).
- BA3 🟡 Medium: referral farming via bots (see RS2).

### 21.9.7 Sub-Audit #13 — Legal
- LG1 🟡 Medium: only `company/privacy/page.tsx` found; **no `terms`, `refund-policy`, `pricing` legal pages confirmed** (❓ verify full page inventory) — needed pre-launch for money platform.
- LG2 🟠 High: WhatsApp/Meta policy compliance — template approval + opt-in required (C8); phonebook upload consent (21.7).
- LG3 🟡 Medium: BDT payment/refund compliance (SSLCommerz terms) — ❓.

### 21.9.8 Sub-Audit #14 — Trust
- TR1 ✅ Positive: money-back guarantee + live purchase ticker + KPI tracker exist (per `docs/strategy/` sprint work) — strong trust foundation **if real** (🏭 verify ticker not fabricated).
- TR2 🟠 High: any fabricated social proof / fake scarcity would violate AIOS Part 01 · GOLDEN RULES — audit honesty of all social-proof widgets (🏭).

### 21.9.9 Sub-Audit #15 — Business Risk
- BR1 🟠 High: **single-founder + single wa-relay node** = key-person/availability risk (also SC1, `20.7.8`).
- BR2 🟡 Medium: dependency on WhatsApp-scraping lib (Baileys RC, D1 in `20.7.2`) — platform-policy risk.
- BR3 🟡 Medium: SSLCommerz sandbox flag (`wrangler.jsonc:17`) — live flip is a launch gate (🏭).

### 21.9.10 Sub-Audit #16 — Disaster Recovery
- DR1 🟠 High: **no D1 backup/restore confirmed** (`27_…` Backup/DR 30/100, unverified) — `wrangler d1 export` schedule required pre-launch (P1).
- DR2 🟡 Medium: wa-relay `AUTH_BASE64` backup exists (positive) but restore/`/backup-auth` verification pending (⏱).
- DR3 🟡 Medium: re-deploy path documented? (see `43_KNOWLEDGE_MANAGEMENT` runbooks).

### 21.9.11 Sub-Audit #17 — Incident Response
- IR1 🟠 High: **no incident-response runbook** (detect → contain → fix → verify → communicate) — required by AIOS Part 12; create before launch (P1).
- IR2 🟡 Medium: no alerting wiring confirmed (Telegram/email) on failures (MN1, `20.7.6`).
- IR3 🔵 Low: logging insufficient for post-incident forensics (LG1).

### 21.9.12 Security Sub-Audit Coverage Score (interim)
17/17 sub-audits mapped; new sub-audits add no further P0 beyond the confirmed set but confirm **Bot abuse (0 captcha), DR (no backup), IR (no runbook)** as P1 gaps. Overall Security remains **20/100 (P0-gated)** per §21.8.
