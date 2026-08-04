# 01_LAUNCH_SEQUENCE
**Pre-Launch → Launch Day 0 → Day 30 / 60 / 90**

> Context: `02_VIRAL_ENGINE.md`, `03_CONVERSION_FUNNEL.md`, `07_ROADMAP_TODAY_7_30_90_FUTURE.md`

---

## 1. Goal

Get the first **500–1,000 engaged users into the built-in referral loop**, validate the ৳99 funnel, and reach launch-readiness — all by one founder. The referral engine already exists; this doc is the **sequence to seed and run it**.

---

## 2. Launch-Readiness Checklist (verify, fix, mark)

| # | Item | File(s) | Status |
|---|------|---------|--------|
| 1 | OTP send/verify/login | `src/app/api/auth/otp/{send,verify,login}/route.ts` | ✅ coded |
| 2 | Guest checkout (phone → pay → auto-account) | `src/app/checkout/page.tsx` | ✅ coded |
| 3 | Live purchase ticker | `src/components/LivePurchaseTicker.tsx`, `src/app/api/live/sales/route.ts` | ✅ coded |
| 4 | SEO (sitemap/robots/canonical/OG) | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts` | ✅ coded |
| 5 | Referral share links + share-reward | `src/app/api/referrals/share-reward/route.ts` | ✅ coded |
| 6 | Leaderboard | `src/app/api/affiliate/leaderboard/route.ts` | ✅ coded |
| 7 | Commission engine (4-level gate) | `src/lib/affiliate/commission.ts` | ✅ coded |
| 8 | Onboarding contact capture (fuels WhatsApp) | `src/app/onboarding/page.tsx` | ✅ coded |
| 9 | Automation triggers | `src/app/api/company/automation/route.ts` | ✅ coded |
| 10 | WhatsApp queue/relay wiring | `wa-relay/index.mjs`, `src/app/api/whatsapp/queue/route.ts` | **Needs Manual Verification** (live QR/auth + message send) |
| 11 | SSLPayments live (SSLCommerz init/ipn) | `src/app/api/payment/{init,ipn,success,fail,cancel}/route.ts` | **Needs Manual Verification** (live sandbox → live) |
| 12 | Prod env keys (WHATSAPP / payment) | `.env.example`, wrangler secrets | **Needs Manual Verification** |
| 13 | Deploy pipeline working | `scripts/*`, `.github/workflows/ci.yml` | **Needs Manual Verification** |

**Activity:** run the 4-actor pass — register → onboard (contact) → share → buy (test) → check commission. Confirm WA queue round-trip once.

---

## 3. Launch Day 0 — Founder-led Seeding Sprint (30 days)

Cold start has no channel. The **only** free multiplier a founder owns is their **personal + professional network** and **free short-form content**. The referral loop needs the first several hundred to begin compounding.

### Sequence (Week 1–4)

```
Week 1  Build free content funnel (see 02_VIRAL_ENGINE.md)
         ├─ Telegram channel + WhatsApp "Jobayer Group Community" (free)
         ├─ 5 YouTube Shorts / FB Reels (career + "how a member earns")
         └─ Auto-published daily summary (AI-generated ideas)
Week 2  Personal seeding: invite + individually-onboard first 100 (family/friends/classmates/colleagues)
         └─ Every onboarded gets a ready WhatsApp share-link (referral_share template)
Week 3  Double-opt referral contest beta (see 06_NEW_FEATURE_PROPOSALS)
         └─ Top-7 leaderboard broadcast on WhatsApp (wa-relay)
Week 4  Measure: K (invites/user), active %, first ৳99 sale flows
         └─ Decide KPI vs target
```

### Day 0 rules for founder
- Onboard each early member **personally** (WhatsApp), not just share a link. Attention beats link.
- Every member must complete **contact capture** (onboarding step) — this fills the WA loop you can eventually notify.
- Do **not** yet mass-broadcast via the personal bridge (`wa-relay`) — WhatsApp quotas / bans. Broadcast to **opt-in** group / channel only.

---

## 4. Day 30 — Validate the Funnel

| Metric | Health target | Where to see |
|--------|---------------|--------------|
| Signups → active | ≥ 30% | Company segments |
| Onboarding completion | ≥ 70% (OTP → contacts → interests) | onboarding tracking |
| Share → new member (K) | ≥ 0.15 (before compounding) | leaderboard + referrals |
| Visitor → sale | ≥ 1.5% | `/api/company/kpi` |
| Abandoned checkout | recover ≥ 10% via automation | `automation GET triggers` |

Reality-check via `/company/goal` (10-crore tracker) — see `03_CONVERSION_FUNNEL.md`.

---

## 5. Day 60 / 90 — Scale

- Day 60: pick the **best** content channel by data (TG vs YT vs FB); double there. Launch "Creator / Ambassador" program (see `05_GAP_ANALYSIS`).
- Day 90: if K ≥ 1.15 sustained for 2 weeks → increase group size + broadcast cadence (with cap). Else slow growth (document).
- Open Telegram/WhatsApp community as the **retention + success-story** layer (UGC engine), linking predicted start of the 1-crore phase-2.

---

## 6. Risk table (launch)

| Risk | Level | Mitigation |
|------|-------|------------|
| WhatsApp personal-bridge ban (Baileys) | High | never brute-force; add delay/rate-limit; keep only opt-in broadcasts; back up via `AUTH_BASE64` |
| Payment failure loses trust | High | IPN test flow; manual verification |
| Referral spam / fake invites | Medium | gate unlock per-day (`share_reward` 24h KV); require real onboarding |
| Content funnel absent (zero distribution) | Medium | Week 1: build the free content channel first — it is the top priority |
| SSLCommerz refund/chargeback handling | Medium | manual policy; later |

---

## 7. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** লঞ্চের আগে কী ঠিক আছে, কী যাচাই করা লাগবে এবং কীভাবে প্রথম মানুষ আনা হয় তা বোঝায়।
- **কেন জরুরি:** সঠিক লঞ্চ-সিকোয়েন্সেই referral loop জীবিত হয়। ভুল হলে টাকা+সময় নষ্ট।
- **সমস্যা:** সব ফিচার "লোকাল ঠিক" আছে কিন্তু লাইভ (WhatsApp সেন্ড, পেমেন্ট, ডিপ্লয়) যাচাই হয়নি — চিহ্নিত `Manual Verification`।
- **Business impact:** লঞ্চ-রেডি হলে পো-লঞ্চের খরচ কমে, প্রথম sale দ্রুত আসে, আত্মবিশ্বাস তৈরি হয়। **Impact: High**
- **Priority:** Critical (launch-blocker verification within 1 week)
- **Effort:** ~20–30 solo-founder hours (mostly manual connective).
- **দরকারি পদক্ষেপ:** ১) লাইভ চেকলিস্ট রান করুন; ২) সপ্তাহ-১ এ ফ্রি কনটেন্ট + টেলিগ্রাম চ্যানেল নিন; ৩) সপ্তাহ-২ এ ব্যক্তিগতভাবে ১০০ জনকে onboard করুন।