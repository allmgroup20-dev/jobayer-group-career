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
