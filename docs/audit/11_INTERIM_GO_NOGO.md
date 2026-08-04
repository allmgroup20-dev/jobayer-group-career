# 11 — Interim Go / No-Go (Phase 1)

> **Issued:** after Phase 1 (static-only). **Awaits:** Phase 2 forensic, runtime verification, founder fix approval.
> Per JGC-AIOS Truth Policy: static analysis CANNOT certify "READY FOR LAUNCH". This interim is based on static-confirmed blockers only.

---

## 🚨 INTERIM DECISION: **DO NOT LAUNCH**

The platform **must not be exposed to real users or real money** until the P0/P1 blockers below are resolved and verified.

### Why (the money-losing chain, all static-confirmed)
1. Payment status is forgeable (C1–C3) → attacker gets premium + unlocks + commissions without paying.
2. Price is client-controlled (C4) → order for ৳1 unlocks the catalog.
3. No idempotency (C5) → replays double-grant.
4. Public payout endpoint (C7) → fake balance cashed out to attacker's bkash.
5. No API auth + trusted `workerId` (C6) → full IDOR across the product.
6. WhatsApp OTP as free-form text (C8) → even legit users **cannot register** (Meta rejects).
7. No phone verification (C9) + per-account share rewards (H6) → bot farming kills the viral loop.

> Result: if launched as-is, the platform risks **direct financial loss**, **user-data breach**, and **instant reputation damage** — worse than not launching.

---

## ✅ Conditions to reach "⚠ READY AFTER FIXES" (Go-baseline)

| # | Blocker | Required fix (minimal, single-founder) |
|---|---|---|
| 1 | C1–C3 | Enforce **real** SSLCommerz verification on ALL payment paths: recompute/verify hash + always call `/validator/api` with `val_id`; never trust query-string status; `success` GET must be read-only + defer to IPN; require `val_id`. |
| 2 | C4 | Server-side price: derive `total_amount`/`resource_count` from DB (product price + server logic), never from body. |
| 3 | C5 | Add `UNIQUE` on `transaction_id` + atomic guarded UPDATE (`WHERE … AND payment_status='pending'`) for idempotency. |
| 4 | C6 | Add token auth to all `/api` worker routes; stop trusting client `workerId` (derive from token). At minimum secure: payment, unlocks, referrals, withdrawals, profile, orders, notifications, customer360. |
| 5 | C7 | Require admin/company auth on payout routes (and ideally manual confirmation step). |
| 6 | C8 | Use **approved Meta WhatsApp templates** for OTP + notifications (or a verified provider with free-form SMS). Replace/dev-verify the Baileys relay (H3) or scope it to authorized internal use only. |
| 7 | C9/H6 | Enforce phone-ownership (OTP) at registration; per-device/per-phone share-reward limits. |
| 8 | H1 | OTP verify attempt limit (e.g., 5 tries / 10 min per phone). |
| 9 | H2 | Remove/authenticate `/qr` + `/logs` on wa-relay. |
| 10 | H5 | Enable & verify secrets provisioning; confirm live `SSLCOMMERZ_IS_LIVE=true` only when store is live-ready. |

---

## 📊 Interim Scorecard (Phase 1, static-only — will be finalized in Phase 3)

| Domain | Interim | Notes |
|---|---|---|
| Security & AuthN/Z | **10/100** | Systemic no-auth + forgeable payment + public payout |
| Payments | **15/100** | Works only as a money-funnel for attackers |
| Database Integrity | **45/100** | Missing unique constraint; non-atomic ops |
| WhatsApp/Messaging | **30/100** | Template compliance missing; ToS-risk relay |
| Business Model | **60/100** | Model sound (৳99), execution risky until fixed |
| Growth/Viral | **50/100** | Loop exists but farmable |
| AI Stack | **55/100** | Present; cost/abuse gates unverified |
| UX/SEO/Perf/A11y | **—** | Phase 2 |
| Deployment/Ops | **35/100** | Secrets provisioning disabled |

> These are **not** the final certification scores — they are the interim status to force prioritization. Final scores in `41_LAUNCH_READINESS_CERTIFICATION.md`.

---

## ⏭ Next Actions
1. Founder reviews this report → approves fix plan (Phase 1.x remediation) OR instructs full Phase 2 forensic first.
2. Phase 2 forensic continues regardless (inventory + detail) to complete the knowledge base.
3. Runtime verification checklist (`40_…`) is produced in Phase 3 and must be executed before any READY decision.

*— End interim Go/No-Go.*
