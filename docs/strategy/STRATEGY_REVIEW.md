# STRATEGY_REVIEW — Jobayer Group Career
**Pre-Launch Growth Strategy | 100% Organic · Single-Founder Executable | 2026**

> **Master document.** Entry point + index for every strategy report in this folder.
> Technical matter in English; owner-facing business explanation in বাংলা.

---

## 1. Executive Summary

Jobayer Group Career is a **pre-launch** Next.js 14 (Cloudflare OpenNext) platform selling **৳99 resource-packs**, backed by a **4-level referral/commission engine**, an automation WhatsApp bridge (`wa-relay`), an AI layer (`jgcareer-ai`, `chat-worker`), PWA/offline support, bilingual BN/EN, and a recently completed viral/SEO/trust layer.

**Current state (verified from code + git):**
- 4 users (incl. the founder) — **pre-launch baseline**
- 0 external channels (no FB page/group, WA broadcast, Telegram, YouTube)
- Not officially launched; no campaigns run
- Product + referral mechanics are launch-ready

**Strategic diagnosis (one line):**
> The product is a well-built **engine** with no **first customer**. The real job is to seed the referral loop — not to keep building product.

---

## 2. Reality Check (honest, grounded in code)

A target of **1 crore users in 1–3 months, 100% organic, from a cold start of 4 users is not realistically achievable.** This is not the product's fault — it is a reach/math constraint.

| Factor (verified) | Value | Implication |
|-------------------|-------|-------------|
| Baseline | 4 users | cold start |
| Unit economics | ৳99/resource; company keeps ৳49 after ৳50 commission (`src/lib/affiliate/commission.ts`) | ৳1 crore ≈ **~2.04M orders** |
| Referral engine | 4 levels, share-reward, leaderboard, referral_share WA template | strong but needs seeded traffic |
| Organic channels | none | **cold-start is the #1 bottleneck** |
| WhatsApp delivery | personal bridge (Baileys) polling `/api/whatsapp/queue` (`wa-relay/index.mjs`) | capacity/compliance-limited — not a broadcast cannon |

**Revised 90-day target (recommended):**
- **Day 45:** 1,000 → 5,000 engaged seed users
- **Day 90:** 50k–200k users **only if** K ≥ 1.15 sustained **and** a free content funnel is created
- **Day 90–365:** 1 crore reach — only via UGC + ambassador/creator multipliers + Telegram/WhatsApp loops
- **Primary KPIs:** active users, referral coefficient **K**, paid conversion % — not raw "reach."

> **বাংলা (owner):** পোর্টফোলিও রেডি, কিন্তু ঘাটতি হলো "প্রথম মানুষ" টানা। ৪ জন থেকে ১ কোটি ১–৩ মাসে যায় না। অনুগ্রহ করে টার্গেট ৯০ দিনে ৫,০০০ engaged user + ৫০০–১,০০০ sale + K≥1.15 রাখুন; কোটি হলো পরের পর্বের সংখ্যা। এটাই একমাত্র সৎ, বাস্তবায়নযোগ্য পথ।

---

## 3. Decisions Locked

| # | Decision | Choice | Note |
|---|----------|--------|------|
| 1 | Keep ৳99 resource-only model | ✅ Yes — optimize only | Subscriptions deliberately removed; do not rebuild |
| 2 | Reintroduce Premium membership (sales) | ❌ No in 90 days | Optional AOV post-purchase upsell later, only if data supports it |
| 3 | Pre-launch or post-launch analysis | ✅ Pre-launch / launch-readiness | No performance data yet |
| 4 | External channels | ✅ Create free channels (WA/TG/YT/FB) | Referral alone cannot cold-start from 4 users |
| 5 | Build capacity | ✅ Single founder | All tasks carry solo-founder hours; community = optional advantage |

---

## 4. Deliverable Index

| Doc | Deliverable (English) | বাংলা |
|-----|-----------------------|-------|
| `01_LAUNCH_SEQUENCE.md` | Pre-launch checklist → Day 0 → Day 30/60/90 sequence | লঞ্চ সিকোয়েন্স |
| `02_VIRAL_ENGINE.md` | Referral/share loops + free-channel playbooks | ভাইরাল ইঞ্জিন |
| `03_CONVERSION_FUNNEL.md` | Onboarding → checkout → upsell + psychology audit | কনভার্শন ফানেল |
| `04_AI_OPPORTUNITIES.md` | AI sales / coach / recommendation — effort + ROI | AI সুযোগ |
| `05_GAP_ANALYSIS.md` | vs world-class learning/social platforms | গ্যাপ অ্যানালাইসিস |
| `06_NEW_FEATURE_PROPOSALS.md` | Single-founder buildable, 100% free | নতুন ফিচার প্রস্তাব |
| `07_ROADMAP_TODAY_7_30_90_FUTURE.md` | Today / 7 / 30 / 90 / Future | মাস্টার রোডম্যাপ |

---

## 5. Method & Truth Rules

- Every claim cites code (`src/**`, `wa-relay/**`, `ai-app/**`) where possible.
- Anything that requires a running/live system (real OAuth, sent payments, actual broadcast delivery) is marked **Needs Manual Verification**.
- Built specifically for a **single founder**; team/community are optional scaling factors, never dependencies.
- No paid ads / no paid tools — only free tiers (Cloudflare Workers/D1 free, OpenRouter + DeepSeek free via `chat-worker`, free social accounts, personal WhatsApp bridge).

---

**Start here:** `01_LAUNCH_SEQUENCE.md`.