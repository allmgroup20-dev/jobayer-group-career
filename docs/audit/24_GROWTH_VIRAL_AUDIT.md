# 24 — Growth & Viral Audit (Phase 2)

> Growth engine per strategy: referral + WhatsApp + viral loop. Baseline: pre-launch 4 users, 0 external channels.

## 24.1 Existing Viral Elements (static-confirmed)
1. **Referral/sponsor tree:** register with `referralCode` links sponsor (`register:31-36`), tree table + levels (1–10) (`payment/ipn:84-106`).
2. **Share reward:** +1 unlock/day per user (`share-reward:28-33`).
3. **Attribution:** UTM/source logging (`register:47-61`), `attribution_log`, `track/marketing`, `track/funnel`.
4. **Dashboard tree view** (`dashboard/tree`), leaderboard (`affiliate/leaderboard` — WIP), team stats (`affiliate/team-stats`).
5. **Live social proof:** `LivePurchaseTicker`, `LiveNotificationBar`, `live/sales` (see `26_…`).
6. **Platform links sharing** (`platforms/links`, `LinkedPlatformsSection`).

## 24.2 Loop Analysis (K-factor)
- **Incentive:** referrer earns commission on paid orders (needs distribution confirmation); referee gets free unlock quota + resource income.
- **Viral channel:** WhatsApp (outbound + share-to-whatsapp), platform links, leaderboard competition.
- **Honest assessment:** loop is *designed*, but **breaks at:**
  - WhatsApp delivery (C8/H3) → shares/messages may not deliver.
  - Account farming (C9/H6) → fake nodes inflate tree, dilute genuine virality, and can trigger payout fraud (C7).
  - No measurement: `company/kpi` + `track/funnel` exist but no runtime KPI baselines (⏱) — K-factor unverifiable until analytics run live.

## 24.3 Growth Opportunities (from strategy docs, aligned)
- **G1** Telegram/Facebook share buttons missing (was planned) → add (P2).
- **G2** Progress bar / unlock-progress visibility → increases referral engagement (P2).
- **G3** Streaks/badges (habit loops) → retention (P2).
- **G4** Weekly broadcast via approved template (P1 — blocked by C8/H3).
- **G6** UGC (testimonials/reviews existing — `reviews/*`, `Testimonials` section) → amplify on socials (P2).
- **Influencer/college seeding** (Day 45–90 per strategy) — operational, not code.

## 24.4 Fraud & Integrity Gates (must be fixed to protect growth)
| ID | Risk | Evidence | Priority |
|---|---|---|---|
| V1 | Farming via unlimited accounts (no phone verify) | `register:13-45` | P0 (C9) |
| V2 | Per-account (not per-device/phone) share rewards | `share-reward:22-35` | P1 (H6) |
| V3 | Commission/payout inflation via forged payment | `10_…` C1–C7 | P0 |
| V4 | Self-referral check not visible | `register:31-36` (only verifies sponsor exists) | P1 |
| V5 | No fraud signals (device/ip tie, velocity limits) | `track/device`, `userDevices` exist but unused for gating | P2 |

## 24.5 Growth Scorecard (interim)
| Area | Score | Notes |
|---|---|---|
| Referral mechanics | 55/100 | exists; fraud-prone |
| Viral channel readiness | 35/100 | WhatsApp blocked (C8/H3) |
| Funnel instrumentation | 65/100 | strong track/* surface |
| Farming resistance | 20/100 | C9/H6 |
| Retention mechanics | 45/100 | streaks/badges pending |
| **Growth overall** | **45/100** | P0/P1-gated |

> Reconcile with `docs/strategy/02_VIRAL_ENGINE.md` gaps (G1–G6) after launch-blockers resolve.
