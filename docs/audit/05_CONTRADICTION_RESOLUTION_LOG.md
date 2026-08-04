# 05 — Contradiction Resolution Log (Governance — Living Document)

> Implements audit standard §2.4(4). Every internal inconsistency found in code/config/docs is logged, given a resolution, and tracked. Open contradictions block certification.
> *Last reviewed: 2026-08-04*

| ID | Conflicting sources (file:line) | Contradiction | Resolution (decision + why) | Status |
|---|---|---|---|---|
| CR-01 | `otp/send:27` "৫ মিনিটের জন্য বৈধ" vs `otp/send:19-25` KV TTL tied to 45s rate-check (`getCached(key,45)` then `setCached(key,…)`) — effective TTL unverified | OTP promised lifetime ≠ storage lifetime | Resolved-by-action: treat effective TTL as **unverified (⏱)**; fix message or storage to match in P1 (#13); flagged RT-04 | 🔴 OPEN → P1 |
| CR-02 | `deploy.yml:28-35,37-46` "Set secrets" steps exist vs `if: false` on both | Secrets steps defined but disabled | Resolved-by-decision: CI will NOT provision secrets; secrets must be set via manual `wrangler secret put` (O1/H5). Verification: RT-70 | 🔴 OPEN → P1 |
| CR-03 | `payment/init/route.ts:48-53` pricing path (`computeAiPrice`) exists vs `:7-9` returns `null` → `finalAmount = totalAmount` (`:46`) | Pricing logic intended but always bypassed to client amount | Resolved-by-evidence: system accepts client amount (C4); the pricing branch is dead. Fix = server-side price (P0 #3) | 🔴 OPEN → P0 |
| CR-04 | `resource-checkout/success` has a `validatePayment` branch (`:35-42`) vs a separate default-VALID status (`:10`) used when val_id absent | Validation path exists but is optional and a default grants access | Resolved-by-evidence: default-VALID short-circuits validation (C3). Fix = remove default, require real verification (P0 #2) | 🔴 OPEN → P0 |
| CR-05 | `wrangler.jsonc:17` `SSLCOMMERZ_IS_LIVE=false` vs launch expectation of live payments | Test-mode by default in vars | Resolved-by-decision: flip to live only when store is live-ready (P1 #9); verify live RT-71 | 🟠 OPEN → P1 |
| CR-06 | `docs/strategy` earlier target (~10M users in 1–3 mo) vs `STRATEGY_REVIEW.md` re-target (Day45 1k / Day90 5k) | Strategy ambition vs realistic capacity/method | Resolved-by-decision: adopt re-targeted numbers; documented in strategy docs | ✅ RESOLVED |
| CR-07 | `schema.ts:102-118` orders.marked unique on `order_id` (`:104`) but `transaction_id` (`:116`) not unique — payment flows assume single handling | Uniqueness expectation vs schema gap | Resolved-by-evidence: replay protection missing (C5). Fix = UNIQUE(transaction_id) + guarded update (P0 #4) | 🔴 OPEN → P0 |
| CR-08 | `middleware.ts:33-43` protects `/company` pages via cookie, but `:52` excludes all `/api`; company API routes assume protection | Page-auth exists; API-auth absent | Resolved-by-evidence: `/api/*` unprotected (C6). Fix = enforce token on APIs (P0 #5) | 🔴 OPEN → P0 |
| CR-09 | `resource-checkout/ipn` performs no `validatePayment` at all vs `resource-checkout/success` performs it conditionally | Inconsistent IPN harden-hoot | Resolved-by-evidence: IPN weaker than intended; unify both to real verification (P0 #1/#2) | 🔴 OPEN → P0 |
| CR-10 | Inventory list vs migration count: strategy/earlier notes "18 migrations" and `migrations/` shows 001–018 (18) — consistent | — | Cross-verified ✅ (`30_FULL_INVENTORY §30.5`) | ✅ RESOLVED |

| CR-11 | Bulk auto-payout gated to `payment_system_active=0` (`auto-payout:43-45`) vs `PATCH /withdrawals` allows arbitrary completion regardless of mode (`withdrawals/route.ts:94-114`) | Inconsistent financial-state authority | Resolved-by-evidence: completion is NOT mode-gated; security bug (21.8c). Fix = gate PATCH behind admin auth (P0) | 🔴 OPEN → P0 |

**Rule:** OPEN (🔴/🟠) contradictions with P0/P1 impact must be closed **before** final certification. Update this log as fixes land.