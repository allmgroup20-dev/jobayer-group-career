# 23 — Business Model Audit (Phase 2)

> Context: ৳99/resource purchase (hard constraint — NOT subscription), referral commissions, resource income, membership tiers. Target: 18–35 Bengali smartphone users. Currency: **৳ (BDT) only.**

## 23.1 Model Map (from code evidence)
- **Purchase model:** `resource-checkout` sells "Resource Pack (N resources)" at client-provided amount (`resource-checkout:20-22`); `payment/init` sells `products` (qty-based). Unlocks add quota: `unlock_limits.max_unlocks` (`resource-checkout/success:51-63`).
- **Free unlock quota:** daily share-reward +1 (`share-reward:28-33`), free unlocks within `max_unlocks`.
- **Resource income:** registration auto-award from `resource_income_default_amount` setting (`register:76-90`); spent via `useResourceIncome` (৳99/resource) (`unlocks:34-46`).
- **Membership tiers:** `017_membership_tiers` migration; `membership_status` premium unlock on payment (`resource-checkout/success:66`).
- **Commissions:** `distributeCommissions` on paid orders up the sponsor tree (10 levels) (`payment/ipn:58-59`, `getSponsorUpline:84-106`).
- **Withdrawals:** premium-eligible, min balance ৳20, auto-payout `completed` (`auto-payout:28-38`).

## 23.2 Unit Economics (draft, needs runtime numbers 🏭)
- Revenue per resource: ৳99 (target AOV depends on resource_count per pack).
- Commission leakage: tree commissions + resource income + share rewards — **total margin per ৳99 must be modeled** (P1 business exercise; requires `company/kpi` + `company/finance` data ⏱).
- Key risk (C1–C4): forgeable payment → revenue ≈ 0 while costs (WhatsApp, AI, payouts) still accrue.

## 23.3 Strengths
- Value-led free-first funnel (free resources + income-to-unlock) is attractive for the target demographic.
- Commission tree gives affiliate-style growth (aligned with referral growth engine).
- Marketing/business tooling built-in (`marketing/*`, `company/finance`, `company/positioning`, `company/plc-dashboard`).

## 23.4 Weaknesses / Risks (evidence-based)
| ID | Risk | Evidence | Priority |
|---|---|---|---|
| B1 | **Revenue integrity dependent on P0 payment fixes** — until C1–C7 fixed, business model has zero real revenue | `10_…` C1–C7 | P0 |
| B2 | Client-controlled price breaks pricing strategy (`pricing/tiers`) | `resource-checkout:21`, `payment/init:46` | P0 |
| B3 | Unbounded free quotas (share reward daily, resource income auto-award) can exceed paid unlocks → cannibalize ৳99 revenue | `register:76-90`, `share-reward:28-33` | P1 |
| B4 | No refund/cancellation policy in code (cancel/fail only flip status) — trust + consumer-protection risk | `payment/cancel`, `payment/fail` | P2 |
| B5 | Single revenue line (resource packs) — no upsell path wired except premium membership (verify `membership` page + tiers) | `membership`, `pricing/tiers` | P2 |
| B6 | Cost per WhatsApp/AI message unbounded without limits (see `25_…`) | automation routes | P1 |
| B7 | Commission tree up to 10 levels could exceed margin if percentages high — must model payout cap | `getSponsorUpline:89`, `commissionLevels` | P1 |

## 23.5 Business Scorecard (interim)
| Area | Score | Notes |
|---|---|---|
| Revenue model clarity | 60/100 | model exists; enforcement broken |
| Pricing strategy | 55/100 | tiers exist; price bypass |
| Unit economics modeling | 40/100 | needs runtime data |
| Trust/refund/policy | 45/100 | no refund path |
| **Business overall** | **55/100** | P0 payment-gated |

> See `docs/strategy/STRATEGY_REVIEW.md` for the 90-day revenue/trust/growth targets this audit feeds.

---

## 23.6 Business OS Sub-Audit Coverage (AIOS Part 05 §5.1 — Phase-2.5)

| # | Sub-audit | Score (interim) | Key evidence / note |
|---|---|---|---|
| 1 | Business model | 60 | ৳99-per-resource purchase; hard constraint respected (no subscription) |
| 2 | Pricing | 55 | tiers exist (`pricing/tiers`) but client-controlled amount bypasses them (B2) |
| 3 | Value proposition | 70 | free-first funnel + career content = strong for 18–35 Bengali users |
| 4 | Conversion | 55 | funnel exists; payment friction + trust gaps (B4); CRO untested (⏱) |
| 5 | Revenue leak | 25 | C1–C7 make revenue ≈ 0 until fixed (B1) |
| 6 | Referral economics | 50 | commission tree (10 levels) + share reward; margin model missing (B7) |
| 7 | Viral loop | 50 | share-to-unlock + commissions; loop fraud risk (RS2, `21.9.4`) |
| 8 | Network effect | 40 | leaderboards/team stats exist; value-per-user growth unproven (⏱) |
| 9 | WhatsApp business | 45 | outbound automation built (wa-relay) but template/consent gaps (C8, WS5) |
| 10 | Customer psychology | 60 | money-back guarantee + live ticker (positive) — must be real (TR2) |
| 11 | Marketing psychology | 65 | Bengali content, free samples, share mechanics built-in (positive) |
| 12 | Trust | 45 | no refund path in code (B4); promise-real gap to verify (🏭) |
| 13 | Growth engine | 55 | referral + WhatsApp = core engines; both have security blockers (P0) |
| 14 | Competitive position | 55 | free alternatives abundant; differentiation via AI + Bengali focus |
| 15 | Founder efficiency | 70 | most gaps are single-founder fixable; heavy items flagged (wa-relay scale) |

**Business OS overall (weighted): 53/100 (interim, static)** — P0 payment-gated (B1).

### 23.6.1 Margin model (P1 business exercise — needed before scale)
Per ৳99 sale: resource cost (if any) + tree commissions (×10 levels) + share-reward quota + WhatsApp/AI message cost + platform fees. All values from `company/finance` + `company/kpi` + `system/perf` (⏱). Final decision per AIOS Part 05 §5.3.
