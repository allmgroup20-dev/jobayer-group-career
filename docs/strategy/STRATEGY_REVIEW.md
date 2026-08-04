# STRATEGY_REVIEW — Jobayer Group Career (JG Career)

> **Status:** Pre-launch (baseline: 4 users incl. founder, 0 sales campaigns, 0 external channels)
> **Owner context:** Single founder + solo builder. Community members are an optional scaling advantage, NOT a dependency.
> **Product model:** ৳99 resource-pack sales (subscription-free) + 4-level commission network (৳50/order to affiliates, company keeps ৳49).
> **Constraint:** 100% free / organic. No paid ads, no paid tools.
> **Language:** English technical + বাংলা (Bangla) business explanation after every major section.

---

## 1. Executive Summary

**Goal (stated):** Reach 10M Bengali speakers in 1–3 months, 100% organic, maximize sales of Premium Membership / Courses / Resources.

**Reality check (evidence-based):** With a pre-launch baseline of 4 users, zero external channels, and a ৳99 ticket (company keeps ৳49/order), "10M people in 1–3 months" is **not statistically achievable from this starting point** — the built-in referral loop has no cold-start engine. See the math below.

**Revised target (recommended and adopted):**

| Window | Target | Measured by |
|---|---|---|
| Pre-launch → Launch | Launch-ready (checklist zero-blockers) | `docs/strategy/01_LAUNCH_SEQUENCE.md` |
| Day 0 → 45 | **500–1,000 seeded users, 50–100 paid** | `api/company/kpi` |
| Day 45 → 90 | **5,000 users, 500–1,000 sales, K ≥ 1.15** | `api/company/kpi` |
| Day 90+ | 50k–200k users, then phase-2 10M | K > 1 sustained + UGC/Creator multipliers |

**Strategy core:** The single biggest missing layer is **distribution**. The referral engine (`api/referrals/share-reward`, leaderboard, commission) only compounds once the first ~500 people are inside. Therefore the plan is:

1. **Launch sequencing** — founder-led seeding sprint + free short-form content funnel (YouTube Shorts / Facebook Reels) → Telegram/WhatsApp channel → site → referral loop.
2. **Optimize, don't rebuild** — the viral/conversion/AI machinery from Phases 1–5 already exists. The plan closes the specific gaps (scarcity, authority, native share buttons, streaks/badges, bulk upsell, WhatsApp broadcast loops).
3. **Single-founder executability** — every action has an effort estimate and a "do this alone" path. Nothing depends on the community.

---

## 2. What We Verified (evidence, not assumptions)

| Area | Verified fact | Evidence |
|---|---|---|
| Model | Subscription removed; ৳99 resource-packs; commission ৳20 (L1) + ৳10×3 (L2–L4) | `src/lib/affiliate/commission.ts`, `src/app/api/pricing/tiers/route.ts`, migrations 016–017 |
| Min withdrawal | ৳20 (instant gratification) | migration 015/016, `src/lib/db` |
| Onboarding | 4-step: consent → WhatsApp OTP → contacts → interests; contact capture is a MUST | `src/app/onboarding/page.tsx`, `src/app/api/track/phonebook/bulk/route.ts` |
| Frictionless auth | OTP send/verify/login + guest checkout (phone+OTP) | `src/app/api/auth/otp/{send,verify,login}/route.ts`, `src/app/checkout/page.tsx` |
| Viral mechanics | share-to-unlock (+1 quota/24h via KV), leaderboard, viral share card | `src/app/api/referrals/share-reward/route.ts`, `src/app/api/affiliate/leaderboard/route.ts`, `src/app/dashboard/page.tsx` |
| Trust / social proof | Live purchase ticker, money-back guarantee, testimonial sections | `src/components/LivePurchaseTicker.tsx`, `src/app/api/live/sales/route.ts`, `src/components/home/Testimonials.tsx` |
| SEO | canonical, robots, sitemap, OG/Twitter, JSON-LD, bilingual | `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` |
| Automation | Triggers: browse_abandon, checkout_abandon, inactive_14d/30d, churn_risk → notify + WhatsApp | `src/app/api/company/automation/route.ts` |
| WhatsApp | OTP + share templates; relay worker `wa-relay`; requires prod keys | `src/lib/whatsapp.ts`, `wa-relay/*`, `wrangler.jsonc` |
| AI stack | 3 workers: `jgcareer-ai`, `chat-worker`, `wa-relay`; OpenRouter + DeepSeek free failover; web chat brain | `ai-app/`, `chat-worker/`, `wrangler.jsonc` |
| Payments | SSLCommerz init/success/ipn/fail/cancel + resource-checkout init/ipn/success | `src/app/api/payment/*`, `src/app/api/resource-checkout/*` |
| Fulfillment | Unlocks, downloads, progress, bookmarks, ratings/reviews, files | `src/app/api/unlocks/*`, `src/app/api/courses/[id]/*`, `src/app/api/reviews/*` |
| Analytics/privacy | track/event, sessions, funnel, device, marketing, phonebook; consent + export + delete (GDPR-ish) | `src/app/api/track/*`, `src/app/api/privacy/*` |
| Admin suite | Finance, analytics, members, orders, commissions, marketing, psychology, AI, KPI goal | `src/app/company/*`, `src/app/api/company/*` |
| Infra | Next.js (OpenNext/Cloudflare), D1 `jgcareer-db`, KV `CACHE`, cron `*/5`, 18 migrations | `wrangler.jsonc`, `migrations/*`, `package.json` |

---

## 3. Reality Check — the honest math

**Why "10M in 1–3 months" is not achievable from this baseline:**

| Factor | Number | Source / derivation |
|---|---|---|
| Seed users today | 4 | owner statement |
| Company revenue / order | ৳49 | ৳99 − ৳50 commission |
| Orders for ৳1 crore | ~204,082 | 10,000,000 ÷ 49 |
| Organic reach without channels | ~0/day | no FB/WA/TG/YT asset exists |
| Cold-start referral capability | ~0 | 4 users have nobody to invite |

A viral product needs **K > 1** (each user brings >1 new user). K compounds only on an existing base. With zero base and zero channels, Day-1 K = 0. This is a **cold-start problem**, not a product problem. The product funnel (verify in 01) is launch-ready; the distribution layer is not built.

**Bold recommendation (per "আমার ধারণা ভুল হলে সরাসরি বলবে"):**
> The product is not "not growing" — it has never been launched. Treat the next 45 days as a **pre-launch growth-engineering sprint** and the following 45 as the first viral loop cycle. Reframe the KPI from "reach" to **seed + K + paid conversion**.

---

## 4. Revised Targets & KPIs (single source of truth)

All KPIs are readable today via `src/app/api/company/kpi/route.ts` and `/company/goal` page.

| KPI | Pre-launch gate | Day 45 | Day 90 |
|---|---|---|---|
| Registered users (general/premium) | ≥ 200 | 1,000 | 5,000 |
| Completed orders | ≥ 20 | 100 | 500–1,000 |
| Revenue (company net ৳49/order) | ≥ ৳1k | ৳5k+ | ৳25k–50k |
| Viral K (referrers ÷ users) | — | ≥ 0.25 | ≥ 0.4 → implies K>1 loop |
| Funnel conversion (checkout_started → paid) | ≥ 5% | ≥ 10% | ≥ 15% |
| Onboarding completion | ≥ 70% | ≥ 80% | ≥ 85% |
| WhatsApp reach (unique contacts) | ≥ 300 | 2,000 | 10,000 |

**Launch gate definition (must pass before official launch):** no login wall in checkout ✔, OTP works in prod ✔/☐ (verify), payment IPN returns `VALID` ✔/☐, WhatsApp keys provisioned ✔/☐, ticker + KPI pages render ✔/☐.

> **Needs Manual Verification:** SSLCommerz live IPN signature handling, real WhatsApp outbound in production, live Core Web Vitals, real OAuth (Google/Facebook) round-trip.

---

## 5. Strategy at a glance (mapping to deliverables)

| Layer | Deliverable | Core action |
|---|---|---|
| Distribution | `01_LAUNCH_SEQUENCE.md` | Free content funnel + founder seeding sprint + launch checklist |
| Viral engine | `02_VIRAL_ENGINE.md` | Close share-loop gaps, streaks/badges, WA broadcast loops, UGC |
| Conversion | `03_CONVERSION_FUNNEL.md` | CRO + psychology audit (scarcity, authority, urgency, AOV) |
| AI | `04_AI_OPPORTUNITIES.md` | Reuse existing workers: AI coach, AI follow-up, recommendations |
| Benchmarking | `05_GAP_ANALYSIS.md` | vs world-class learning/social products |
| Build list | `06_NEW_FEATURE_PROPOSALS.md` | 100% free, single-founder, ROI-ranked |
| Timeline | `07_ROADMAP_TODAY_7_30_90_FUTURE.md` | Today / 7 / 30 / 90 / future |

---

## 6. Top 5 priorities (full detail in each file)

1. **Build the free content funnel** (Telegram/WA channel + Shorts) — the missing distribution layer. *(Critical)*
2. **Run the founder seeding sprint** (Day 0–45: personal network + student/career communities). *(Critical)*
3. **Add scarcity + authority + AOV upsell** to the funnel (launch-price timer, mentor badge, bulk-pack upsell). *(High)*
4. **Close the viral-loop gaps** (native Telegram/FB share, invite progress bar, weekly leaderboard broadcast via `wa-relay`). *(High)*
5. **Provision production keys + verify IPN/WhatsApp** before launch. *(Critical, must-pass gate)*

---

## 7. Bangla — মূল সারসংক্ষেপ (Owner's summary)

**এই ডকুমেন্টে কী আছে:** আপনার পুরো প্ল্যাটফর্মের সৎ, কোড-ভিত্তিক কৌশলগত পর্যালোচনা। লক্ষ্য সবার আগে ঠিক করা হয়েছে — আগে "১ কোটি মানুষ, ১–৩ মাস" বাস্তবসম্মত নয়, কারণ আপনার প্ল্যাটফর্ম এখনো লঞ্চই হয়নি এবং referral লুপ কাজ করতে পারে না যতক্ষণ না প্রথম কয়েকশ মানুষ ভেতরে আসে। তাই নতুন টার্গেট: **Day 45-এ ১,০০০ user + ১০০ sale, Day 90-এ ৫,০০০ user + ৫০০–১,০০০ sale, K≥1.15**। এক কোটি reach হবে পরের ধাপ (phase-2)।

**সবচেয়ে বড় সমস্যা:** প্ল্যাটফর্মের ভেতরে সবকিছু আছে — OTP login, guest checkout, share-to-unlock, leaderboard, live ticker, SEO, WhatsApp automation, AI — কিন্তু **বাইরে থেকে কেউ আসছে না**। এটাই cold-start সমস্যা। সমাধান: বিনামূল্যের কনটেন্ট (YouTube Shorts/FB Reels) + Telegram/WhatsApp চ্যানেল + আপনার নিজের নেটওয়ার্ক দিয়ে প্রথম ৫০০–১,০০০ মানুষ আনা, তারপর referral লুপ সেটাকে বাড়িয়ে দেবে।

**Priority:** ১) ফ্রি কনটেন্ট ফানেল তৈরি, ২) সিডিং স্প্রিন্ট, ৩) কনভার্শন উন্নতি (জরুরি অফার, বিশেষজ্ঞ ব্যাজ, bulk-আপসেল), ৪) ভাইরাল লুপ গ্যাপ পূরণ, ৫) লঞ্চের আগে প্রোডাকশন কী + পেমেন্ট/IPN যাচাই।

**পরবর্তী ধাপ:** `01_LAUNCH_SEQUENCE.md` থেকে শুরু করে প্রতিটি ফাইল পড়ুন। রোডম্যাপ `07_ROADMAP_TODAY_7_30_90_FUTURE.md`-এ এক জায়গায়।

---

## 8. Cross-references

- **Route map:** `docs/audit/ROUTE_INVENTORY.md` (when produced)
- **API behaviors:** `src/app/api/**`, `docs/audit/API_ANALYSIS.md` (when produced)
- **Database:** `migrations/*.sql`, `src/lib/db/*`
- **KPI data:** `src/app/api/company/kpi/route.ts`, `src/app/company/goal/page.tsx`
- **Roadmap:** `docs/strategy/07_ROADMAP_TODAY_7_30_90_FUTURE.md`
