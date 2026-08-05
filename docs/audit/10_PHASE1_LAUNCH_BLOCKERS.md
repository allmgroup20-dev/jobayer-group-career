# 10 — Phase 1: Launch-Blockers (Critical / High only)

> Rapid launch-blocker assessment. Complete list of **Critical** and **High** findings from static code analysis.
> Evidence = `file:line` + quote. Full exploitation paths are verified from code; anything requiring a live test is labeled.
> **Bottom line:** 9 Critical + 6 High. Interim decision: **🚨 DO NOT LAUNCH** → see `11_INTERIM_GO_NOGO.md`.

---

## ✅ PHASE D REMEDIATION STATUS (as of this commit)

| ID | Status | Fix location |
|----|--------|--------------|
| C1 | ✅ FIXED — SHA-512 IPN signature verify (crypto) | `src/lib/payment/sslcommerz.ts` `verifyIPNSignature` |
| C2 | ✅ FIXED — `val_id` mandatory in every payment path | `verifyWithGateway` + both IPN & success routes |
| C3 | ✅ FIXED — success GET never grants; defers to IPN | `resource-checkout/success` + `payment/success` |
| C4 | ✅ FIXED — server-side price from `products`/`company_settings` | `payment/init`, `resource-checkout`, `unlocks` |
| C5 | ✅ FIXED — idempotent grant + UNIQUE `transaction_id` | IPN routes (WHERE `payment_status != …`) + migration `019` + `db/index.ts` |
| C6 | 🟡 PARTIAL — auth on money/unlock routes (auto-payout, share-reward, unlocks, resource-checkout); read routes (GET) still open | see each route; remaining listed in "Remaining" |
| C7 | ✅ FIXED — company-admin auth required | `withdrawals/auto-payout` |
| C8 | 🟡 PARTIAL — approved-template support added; template names still require Meta business setup (H5 secrets) | `src/lib/whatsapp/sender.ts` + `otp/send` + `queue.ts` |
| C9 | ✅ FIXED — phone-ownership OTP proof required at registration | `auth/register` + `otp/verify` + `otp/login` |
| H1 | ✅ FIXED — 5-attempt OTP lockout | `otp/verify` + `otp/login` |
| H2 | ✅ FIXED — wa-relay `/qr`, `/logs`, `/`, `/health` now auth-gated | `wa-relay/index.mjs` |
| H3 | ⏳ OPEN — Baileys→official API migration (large infra; needs Meta setup) | see "Remaining" |
| H4 | ✅ FIXED — OTP TTL 5 min enforced via `getCached(key,300)` + attempt counter | `otp/send` + `otp/verify` |
| H5 | 🟡 PARTIAL — CI secret steps re-enabled (`if: false` → `if: secrets…`); actual secrets must be set in GitHub + `wrangler secret put` | `.github/workflows/deploy.yml` |
| H6 | ✅ FIXED — share-reward requires worker Bearer token (self-only) | `referrals/share-reward` + `unlocks` |

**Remaining before Level 3+:** runtime verification of the fixed paths (`RT-20..22`, `RT-32`, `RT-42`), C8 template provisioning (Meta), H3 official-API migration, H5 secret provisioning.

---

## 🔴 CRITICAL FINDINGS

### C1 — SSLCommerz IPN signature is never cryptographically verified (forgeable `VALID`)
- **PROBLEM:** IPN validation only checks that `verify_hash`/`verify_sign` are *present*, not that they are correct.
- **EVIDENCE:** `src/lib/payment/sslcommerz.ts:127-132`
  ```ts
  validateIPNResponse(data) {
    const isValidStatus = data.status === "VALID";
    const hasVerifyHash = !!data.verify_hash;
    const hasVerifySign = !!data.verify_sign;
    return isValidStatus && (hasVerifyHash || hasVerifySign);
  }
  ```
  Used by `src/app/api/payment/ipn/route.ts:18` and `src/app/api/resource-checkout/ipn/route.ts:16`. The HMAC/SHA-512 recomputed from `store_password` + `val_id` is never checked (`validateIPN` in `sslcommerz.ts:151-157` ignores `_storePasswd`).
- **IMPACT:** Attacker POSTs `status=VALID&verify_hash=anything&tran_id=<order>` and passes validation. Full payment bypass.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C2 — `val_id` server-side validation is OPTIONAL in every payment path
- **PROBLEM:** If the caller omits `val_id`, the call to SSLCommerz `/validator/api` is skipped entirely.
- **EVIDENCE:**
  - `src/app/api/payment/ipn/route.ts:34` `if (valId) { … validatePayment … }`
  - `src/app/api/payment/success/route.ts:29` `if (valId) { … }`
  - `src/app/api/resource-checkout/success/route.ts:35` `if (valId) { … }`
  - `src/app/api/resource-checkout/ipn/route.ts` — **no** `validatePayment` call at all (only presence check).
- **IMPACT:** Combine with C1 → a request with `status=VALID`, any `verify_hash`, no `val_id` passes every gate and order is marked paid + commissions distributed + premium granted.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C3 — `resource-checkout/success` (GET) defaults `status=VALID` → free premium + unlock grants
- **PROBLEM:** The browser return-URL handler trusts the query string and **defaults** to VALID when status is absent.
- **EVIDENCE:** `src/app/api/resource-checkout/success/route.ts:10`
  ```ts
  const status = params.status || params.Status || "VALID";
  ```
  Then unconditionally (when status passes) at `:44-69`:
  - marks `resource_purchases` completed,
  - increments `unlock_limits.max_unlocks` by `resource_count` (non-atomically, `:51-62`),
  - sets `workers.membership_status = 'premium'` (`:66`).
- **IMPACT:** Any anonymous user with a known `tran_id` (order id) GETs `/api/resource-checkout/success?tran_id=<id>` and gets premium + unlock quota with **no payment proof**.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C4 — No server-side price enforcement (amount & resource count fully client-controlled)
- **PROBLEM:** The server accepts the client-supplied `totalAmount` / `amount` / `resourceCount` without checking the product's real price.
- **EVIDENCE:**
  - `src/app/api/payment/init/route.ts:46` `let finalAmount = totalAmount;` — `computeAiPrice` always returns `null` (`:7-9`), so client amount always wins.
  - `src/app/api/resource-checkout/route.ts:21-22` `INSERT INTO resource_purchases … (order_id, worker_id, amount, resource_count) VALUES (?, ?, ?, ?)` using `body.amount`, `body.resourceCount`.
- **IMPACT:** Attacker creates a ৳1 order and unlocks N resources/premium, then fulfills the fake order via C1–C3. Revenue = 0, trust = destroyed.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C5 — No idempotency: replay / concurrent IPN double-grants; `transaction_id` has no UNIQUE constraint
- **PROBLEM:** Mark-as-paid is read-then-write; concurrent/replayed requests can both pass the `payment_status !== 'paid'` guard.
- **EVIDENCE:**
  - `src/app/api/resource-checkout/ipn/route.ts:51-62` reads `currentMax` then writes `currentMax + resourceCount` (race → double count).
  - `src/app/api/payment/ipn/route.ts:49-56` checks status, then unconditional `UPDATE … SET payment_status='paid'` + `distributeCommissions`.
  - Schema: `src/lib/db/schema.ts:116` & `:639` `transactionId: text("transaction_id")` — **no `.unique()`**; only `order_id` unique (`:104`).
- **IMPACT:** Replayed IPN doubles unlock quota, premium grants, and commissions. Real money/fraud exposure.
- **PRIORITY:** P0 | **EFFORT:** S | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C6 — No API authentication system-wide; client `workerId` trusted (IDOR)
- **PROBLEM:** `src/middleware.ts` **excludes all `/api`** from protection (`:52` matcher `(?!api|…)`), and the API routes read identity from query/body `workerId` without verifying any token.
- **EVIDENCE:** unauthenticated, client-controlled `workerId`:
  - `src/app/api/unlocks/route.ts:8` `workerId = searchParams.get("workerId")` → returns **any user's unlocks** (IDOR).
  - `src/app/api/unlocks/route.ts:23-66` POST decrements/grants on an arbitrary `workerId`.
  - `src/app/api/referrals/share-reward/route.ts:9` grants +1 unlock to any `workerId`.
  - `src/app/api/resource-checkout/route.ts:10-22` creates orders for arbitrary `workerId`.
  - `src/app/api/withdrawals/auto-payout/route.ts:8-40` payout for arbitrary `workerId`.
- **IMPACT:** Any user can read/act as any other user. Data breach (privacy), privilege escalation, abuse of business logic.
- **PRIORITY:** P0 | **EFFORT:** L | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C7 — `withdrawals/auto-payout` is a public unauthenticated POST that creates COMPLETED payouts
- **PROBLEM:** No auth gate; caller supplies `workerId` + `accountNumber`.
- **EVIDENCE:** `src/app/api/withdrawals/auto-payout/route.ts:5-40` — single-worker path checks `membership_status='premium'` and balance, then inserts a `status='completed'` withdrawal to the caller-supplied `account_number` (`:34-38`). Balance is computed from `commissions … status='paid'` minus completed withdrawals — which can be inflated via C1–C3 forged commissions.
- **IMPACT:** Full cash-out chain: forge payment → commissions "paid" → create payout to attacker's bkash number. **Direct money loss.**
- **PRIORITY:** P0 | **EFFORT:** S | **ROI:** High | **VERIFY:** ✅ static-confirmed

### C8 — WhatsApp OTP/messages sent as free-form text via Meta Cloud API (not approved templates) — undeliverable to new users
- **PROBLEM:** Meta Business API only delivers business-initiated messages via **approved templates** (or within 24h user session). Code sends raw `type:"text"`.
- **EVIDENCE:** `src/lib/whatsapp/sender.ts:29-34` `type: "text", text: { body: text }`; OTP flow `src/app/api/auth/otp/send/route.ts:27-28` uses `sendMessage`. (Note: wa-relay Baileys path may send free-form, but is unofficial — see H3.)
- **IMPACT:** At launch, registration OTP and all outbound notifications will be **rejected by Meta (error 131047)** → users cannot register → onboarding dead on arrival.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ⏱ requires-runtime (static likelihood: high)

### C9 — Registration without phone-ownership verification → unlimited fake-account farming
- **PROBLEM:** `register` creates an account from any phone + password; the OTP flow is separate and **never enforced** at registration.
- **EVIDENCE:** `src/app/api/auth/register/route.ts:13-45` — no OTP check; account created from `phone`+`password` only. Each registration can auto-award `resource_income` (`:76-90` from `resource_income_default_amount`).
- **IMPACT:** Bot-farming: thousands of fake accounts harvest free unlock quota (`share-reward`), resource income, and pollute the referral tree → kills viral-loop economics and trust.
- **PRIORITY:** P0 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

---

## 🟠 HIGH FINDINGS

### H1 — OTP verify has no attempt rate-limit → brute-forceable 6-digit code
- **EVIDENCE:** `src/app/api/auth/otp/verify/route.ts:14-17` — compares `record.code !== code.trim()`, only invalidates on success; no failure counter.
- **IMPACT:** Unlimited guesses per phone → account/phone takeover of registered users.
- **PRIORITY:** P1 | **EFFORT:** S | **ROI:** High | **VERIFY:** ✅ static-confirmed

### H2 — wa-relay public `/qr` and `/logs` endpoints expose session + message content
- **EVIDENCE:** `wa-relay/index.mjs:397-398` `/qr` returns QR unauthenticated; `:399-401` `/logs` returns message logs (phone numbers + text) unauthenticated. `CORS: *` everywhere (`:380`).
- **IMPACT:** Anyone can re-link/hijack the WhatsApp number (QR) and read all message logs (privacy breach).
- **PRIORITY:** P1 | **EFFORT:** S | **ROI:** High | **VERIFY:** ✅ static-confirmed

### H3 — wa-relay uses unofficial WhatsApp (Baileys) API → number-ban risk
- **EVIDENCE:** `wa-relay/index.mjs:1` `import … from "@whiskeysockets/baileys"`; connection to `web.whatsapp.com` (`:463`).
- **IMPACT:** WhatsApp number (the business identity) can be **banned**; violates WhatsApp ToS; messaging reliability = 0 guarantee. Critical for a WhatsApp-first growth engine.
- **PRIORITY:** P1 | **EFFORT:** L | **ROI:** High | **VERIFY:** ⏱ requires-runtime (static likelihood high)

### H4 — OTP lifetime mismatch: stored with ~45s TTL, message says "৫ মিনিটের জন্য বৈধ"
- **EVIDENCE:** `src/app/api/auth/otp/send/route.ts:19-25` rate-limit & store share key `otp:<phone>`; `getCached(key,45)` used for rate limit, then `setCached(key, {code…})` (TTL defaults short); verify reads `getCached(key,300)` (`otp/verify:14`).
- **IMPACT:** Codes expire much faster than promised → failed registrations; or worse if TTL longer than intended (stale-code window). Needs runtime confirmation of effective TTL.
- **PRIORITY:** P2 | **EFFORT:** S | **ROI:** Med | **VERIFY:** ⏱ requires-runtime

### H5 — Deploy secrets steps disabled (`if: false`); production secrets not provisioned by CI
- **EVIDENCE:** `.github/workflows/deploy.yml:32` and `:46` `if: false` on both "Set secrets" steps; `wrangler.jsonc:17` `SSLCOMMERZ_IS_LIVE=false`.
- **IMPACT:** Even if CI passes, prod has **no** `JWT_SECRET`/`WHATSAPP_*`/`SSLCOMMERZ_*`/`OPENROUTER_API_KEY` unless manually `wrangler secret put`. Payment/OTP/WhatsApp dead on deploy.
- **PRIORITY:** P1 | **EFFORT:** S | **ROI:** High | **VERIFY:** ✅ static-confirmed (actual prod secret presence = ⏱ runtime)

### H6 — Referral/share-reward farming via unlimited accounts (compounds C9)
- **EVIDENCE:** `src/app/api/referrals/share-reward/route.ts:22-35` grants +1 unlock/day per `workerId` keyed by KV `share_reward:<workerId>` (per-account, not per-device). With C9 (no phone verify), one person = N accounts × N daily rewards.
- **IMPACT:** Free unlock-quota harvesting, referral-tree manipulation, commission inflation (esp. combined with C1–C3).
- **PRIORITY:** P1 | **EFFORT:** M | **ROI:** High | **VERIFY:** ✅ static-confirmed

---

## 📋 Noted-but-not-blocking (for Phase 2 detail)
- `payment/success` also skips validation when `val_id` omitted (C2 variant) and grants premium based on `products.premium_membership` (`success/route.ts:55-62`).
- OTP `devCode` returned to client when WhatsApp not configured (`otp/send/route.ts:34-35`) — config risk, only in misconfigured prod.
- No refund path exists (`fail`/`cancel` only flip order status).
- Company API uses a separate `company_token` cookie (middleware `:34`) — verify all `/api/company/*` routes also enforce it (Phase 2).

*— End Phase 1 blocker report. Interim decision in `11_INTERIM_GO_NOGO.md`.*
