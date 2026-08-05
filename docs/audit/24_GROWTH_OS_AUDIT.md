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

---

## 24.6 The 50-Experiment Engine (AIOS Part 06 · GROWTH EXPERIMENTS — living backlog)

> Rules: each experiment has hypothesis → mechanics → effort (single-founder S/M/L) → expected impact → metric → anti-abuse. Order = priority. Feed Part 11 cadence (20 per 30 days). No dark patterns (AIOS Part 01 · GOLDEN RULES).

### Acquisition (referral / WhatsApp / SEO) — EXP-01..15
| ID | Hypothesis & mechanics | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-01 | Share-to-unlock WhatsApp button on unlock screen → +30% referrals | S | High | referral signups/wk | rate-limit + fraud check (V4) |
| EXP-02 | Daily share reward boosted to +2 on day streak | S | Med | DAU, shares | per-phone, not per-account (V2) |
| EXP-03 | Telegram share card (image + link) | S | Med | referral clicks | UTM tag each |
| EXP-04 | Facebook share story/link on paid order | S | Med | FB-sourced signups | honest caption (no fake claims) |
| EXP-05 | 2-step referral: invite → referee's first purchase credits referrer instantly | M | High | paid conversion | payout after payment verify only |
| EXP-06 | WhatsApp weekly broadcast via approved template (tips/career) | M | High | reactivation | template-approved only (C8) |
| EXP-07 | College-group seeding kit (poster + landing) | M | Med | organic signups | manual, no paid ads |
| EXP-08 | Bengali SEO landing per top career query | M | High | organic sessions | honest content, no keyword-stuffing |
| EXP-09 | Free sample resource gated by phone-share | M | Med | signups | 1 per phone (C9 fix) |
| EXP-10 | "Invite 3 friends → free pack" ladder | M | High | multi-referral | verified phones only |
| EXP-11 | Leaderboard prize (weekly) for top referrers | M | Med | engagement | fraud-screened (V5) |
| EXP-12 | WhatsApp number → auto-career-quiz mini-flow | M | Med | WA engagement | template-based |
| EXP-13 | Referral link shortener with per-channel tracking | S | Med | attribution | — |
| EXP-14 | Bengali YouTube short → landing funnel | M | Med | traffic | organic only |
| EXP-15 | Exit-intent offer on free-tier page | S | Low | conversion | honest offer |

### Activation — EXP-16..22
| ID | Experiment | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-16 | 3-step onboarding with immediate first unlock | S | High | activation % | — |
| EXP-17 | Personalized career quiz → tailored resource pack | M | High | first purchase | honest scoring |
| EXP-18 | One-tap OTP login (template) on landing | M | High | signup→login | rate-limited |
| EXP-19 | Free resource income auto-spend hint (tooltip) | S | Med | unlocks | — |
| EXP-20 | Membership preview: show premium benefits before pay | S | Med | premium signup | — |
| EXP-21 | Push-style WA reminder after signup (template) | S | Med | D1 retention | consent-based |
| EXP-22 | Bundle "starter pack" upsell at checkout | S | Med | AOV | price server-side (C4) |

### Retention — EXP-23..30
| ID | Experiment | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-23 | Streak + badge system (3/7/30-day) | M | High | D7/D30 | honest progress |
| EXP-24 | Learning-progress bar on dashboard | S | Med | return visits | — |
| EXP-25 | Weekly recap WA message (template) | S | Med | D7 | template + consent |
| EXP-26 | Unlock-completion celebration + next-goal prompt | S | Med | retention | — |
| EXP-27 | Resource recommender (AI) based on history | M | Med | repeat unlocks | no data leak |
| EXP-28 | Referral-tree "team progress" widget (WIP) | S | Med | engagement | — |
| EXP-29 | Email-less re-engage: WA nudge after 7 days idle | S | Med | reactivation | consent + template |
| EXP-30 | "Today's free tip" daily card | S | Low | DAU | — |

### Virality & Network Effects — EXP-31..38
| ID | Experiment | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-31 | K-factor dashboard to measure loop | M | High | K-factor | — |
| EXP-32 | "You unlocked X" shareable badge | S | Med | shares | — |
| EXP-33 | Public progress leaderboard (opt-in) | M | Med | engagement | privacy-gated |
| EXP-34 | Group-learning rooms (same course) | L | Med | network effect | content moderation |
| EXP-35 | Cohort referral: class-code share to batchmates | M | Med | virality | — |
| EXP-36 | Referral unlock "both get bonus" on referee first order | M | High | conversion | payout post-verify |
| EXP-37 | Time-boxed referral double-points weekend | S | Med | spikes | fraud-screened |
| EXP-38 | Social proof: show real recent purchases (existing ticker) → expand widget | S | Med | trust | real only (TR2) |

### Monetization & Economics — EXP-39..44
| ID | Experiment | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-39 | Tiered pack pricing (৳99 / ৳249 / ৳499) | S | Med | AOV | server-side price (C4) |
| EXP-40 | Premium membership with exclusive AI features | M | High | MRR-like | — |
| EXP-41 | Resource income → paid upgrade prompt at threshold | S | Med | conversions | — |
| EXP-42 | Discount codes (first-purchase ৳10 off) | S | Low | first order | one per phone |
| EXP-43 | Margin model: cap commission levels to sustainable % | M | High | margin | payout cap (B7) |
| EXP-44 | Cost-monitor per AI/WA message → cap spend | M | High | margin | — |

### Trust, Automation & Ops — EXP-45..50
| ID | Experiment | Effort | Impact | Metric | Anti-abuse |
|---|---|---|---|---|---|
| EXP-45 | Money-back guarantee A/B (visible vs subtle) | S | Med | conversion | honor claims (TR1) |
| EXP-46 | Auto-refund on failed validation (idempotent) | M | High | trust | after C1–C5 |
| EXP-47 | WA order confirmation + receipt (template) | S | Med | trust | template-based |
| EXP-48 | Support auto-responder (FAQs) via AI | M | Med | CSAT | safe-guarded AI |
| EXP-49 | KPI alert to founder (Telegram) on anomalies | S | Med | ops | — |
| EXP-50 | Monthly experiment review + Part 11 rollover | S | High | process | — |

### Engine status
- **50/50 defined** · ordered by priority · **0 running** (pre-launch) · first 20 → Part 11 `42_CONTINUOUS_IMPROVEMENT.md` 30-day cycle post-launch.
- Growth scorecard (interim): **45/100** (unchanged — §24.5).
