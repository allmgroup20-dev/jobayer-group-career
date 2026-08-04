# 01 — LAUNCH SEQUENCE

> Part of `docs/strategy/` — read `STRATEGY_REVIEW.md` first.
> **Owner context:** single founder, pre-launch, zero external channels, referral-first strategy.

The launch has three distinct stages. Each stage must be **sequenced** — you cannot start official marketing before the funnel is load-bearing.

```
Stage A: Launch-Readiness (this sprint, ~7 days)
  └── 7-blocker checklist (below)
Stage B: Seeding Sprint (Day 0 → 45)
  └── Free content funnel + founder-led personal invites
Stage C: Viral Cycle (Day 45 → 90)
  └── Referral loop compounding on the seeded base
```

---

## Stage A — Launch-Readiness Checklist (must pass before "official launch")

Each item marked ☐ must be confirmed **before** the first public campaign. Mark "Needs Manual Verification" for anything requiring a live environment.

| # | Block | Check | Evidence (code) |
|---|---|---|---|
| 1 | Checkout has no login wall | ✔ | `src/app/checkout/page.tsx` — guest OTP flow |
| 2 | OTP send/verify/login work in production | ☐ | `src/app/api/auth/otp/*`, `src/lib/whatsapp.ts`; needs `WHATSAPP_API_KEY`/META token |
| 3 | SSLCommerz IPN returns `VALID` and marks order completed | ☐ | `src/app/api/payment/ipn/route.ts`, `src/app/api/resource-checkout/ipn/route.ts` — **Needs Manual Verification** (sandbox vs live) |
| 4 | Order success → unlock granted (`membership_status='premium'`) | ☐ | `src/app/api/resource-checkout/success/route.ts`, `src/app/api/unlocks/route.ts` |
| 5 | Commission auto-credits to referrer's sponsor on completed order | ☐ | `src/lib/affiliate/commission.ts`; verify in live order flow |
| 6 | WhatsApp templates (share + OTP) approved & outbound works | ☐ | `src/lib/whatsapp.ts`, `wa-relay/*`; needs WhatsApp Business API + template approval |
| 7 | Live ticker + KPI page render with real data | ✔/☐ | `src/app/api/live/sales/route.ts`, `src/app/company/goal/page.tsx` |
| 8 | SEO (sitemap/robots/canonical/OG) indexable | ☐ | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`; submit to Search Console |

**Minimum viable launch set:** 1, 2, 3, 4, 5. (6–8 can be parallel but WhatsApp is your primary retention channel — prioritize.)

---

## Stage B — Seeding Sprint (Day 0 → 45)

**Goal:** 500–1,000 registered users + 50–100 paid orders, with ZERO paid marketing.

### B1. Free content funnel (the missing distribution layer)

```
YouTube Shorts / Facebook Reels (2–3/week, 30–60s)
  ↓  career tips, salary truths, "how I earn ৳ with my phone"
  ↓  link in bio/comments → Telegram channel
Telegram channel (1 post/day)
  ↓  free resource sample + WhatsApp invite link
WhatsApp broadcast / community (invite-only)
  ↓  → https://site/register?ref=<founder_code>
Referral loop (built-in)
  ↓  existing users invite more users → repeat
```

**Why this order:** Telegram and WhatsApp are the only channels that give you direct, free, repeatable reach. Shorts are the discovery engine (algorithmic, free). The site is the funnel's end, not its start.

**Content system (single-founder, AI-assisted):** Use the existing AI worker (OpenRouter + DeepSeek, free models) to generate 10 script outlines per week from `extracted-texts/` + course catalog. You only record/edit. Estimated effort: 3–4 hrs/week.

### B2. Founder seeding (highest ROI action in the whole plan)

1. List your top 100 personal contacts (family, friends, former classmates/colleagues, local communities).
2. Send each a personalized WhatsApp with your referral link (`/register?ref=<your_code>`) + one free sample resource.
3. Ask them to send the same to 3 of their contacts. **Purpose: start the first 500 nodes of the referral tree manually.**
4. Track progress via `src/app/api/company/kpi` (users) + `/company/members`.

**Success criteria for the sprint:** ≥ 500 registered, ≥ 20 completed orders, onboarding completion ≥ 70%, first 3 active referrers (any user who invites ≥ 3).

---

## Stage C — Viral Cycle (Day 45 → 90)

Once the base is 1,000+, the built-in mechanics take over:

- `api/referrals/share-reward` (+1 unlock quota / 24h) — incentive to share.
- Leaderboard (`api/affiliate/leaderboard`) — competition, broadcast weekly.
- Commission (৳20 + ৳10×3) — passive income story, honest framing.
- WhatsApp automation (`api/company/automation`) — follow-ups on browse/checkout abandon, inactivity, churn.

**Growth hygiene:** do not launch all of Telegram + WhatsApp + Shorts at once. Launch **Shorts first** (2 weeks, discover if hooks land), then Telegram, then WhatsApp broadcast. Measure each with the tracking events already wired (`track/event`, `track/funnel`).

---

## Bangla — লঞ্চ সিকোয়েন্স (Owner's summary)

**এখানে কী শেখানো হলো:** লঞ্চ ৩ ধাপে। প্রথমে লঞ্চ-রেডি চেকলিস্ট (৮টি ব্লকার — OTP কাজ করছে কিনা, পেমেন্ট IPN ঠিক আছে কিনা, কমিশন অটো-ক্রেডিট হচ্ছে কিনা) — এগুলো **লাইভ ওয়েবসাইটে ম্যানুয়ালি যাচাই** করতে হবে ("Needs Manual Verification")। এরপর **সিডিং স্প্রিন্ট** — ৪৫ দিনে ৫০০–১,০০০ মানুষ আনা। এর প্রধান হাতিয়ার: বিনামূল্যের কনটেন্ট (YouTube Shorts/FB Reels → Telegram → WhatsApp → আপনার সাইট) + আপনার নিজের ১০০ যোগাযোগকে ব্যক্তিগতভাবে invite করা।

**কেন এটা গুরুত্বপূর্ণ:** এখন পর্যন্ত সাইটে কেউ আসছে না কারণ কোনো চ্যানেল নেই। এই সিকোয়েন্সই সেই শূন্যতা পূরণ করে — আর বিল্ট-ইন referral লুপ (শেয়ার-রিওয়ার্ড, লিডারবোর্ড, কমিশন) তখন থেকেই নিজে থেকে বাড়তে থাকবে।

**Priority: Critical** · **Effort:** ৩–৪ ঘণ্টা/সপ্তাহ (কনটেন্ট) + স্প্রিন্টের সময় ফোন/হোয়াটসঅ্যাপ | **প্রত্যাশিত ফলাফল:** ৯০ দিনে ৫,০০০ user + ৫০০–১,০০০ sale।

---

## Cross-references

- Funnel/psychology details: `03_CONVERSION_FUNNEL.md`
- Channel playbooks: `02_VIRAL_ENGINE.md`
- Timelines: `07_ROADMAP_TODAY_7_30_90_FUTURE.md`
