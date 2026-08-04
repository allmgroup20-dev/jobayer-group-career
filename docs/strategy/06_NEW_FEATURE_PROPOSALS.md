# 06 — NEW FEATURE PROPOSALS

> Part of `docs/strategy/` — read `STRATEGY_REVIEW.md` first.
> Constraint: 100% free, single-founder buildable, high business impact. Each proposal = Problem → Why → Fix → Effort → Expected impact → Reuse.

## Proposal matrix

| # | Feature | Reuses | Effort | Impact | Phase |
|---|---|---|---|---|---|
| F1 | Launch-price countdown (scarcity) | KV `CACHE`, ticker pattern | 3h | High (AOV+urgency) | Day 7 |
| F2 | Free sample unlock (curiosity gap) | `api/unlocks/*`, `api/downloads` | 4h | High (lead capture) | Day 7 |
| F3 | Invite progress bar | `api/affiliate/leaderboard` | 3h | High (gamification) | Day 14 |
| F4 | Daily streaks + badges | `track/event`, KV | 6–8h | High (retention) | Day 14 |
| F5 | Telegram/FB native share buttons | dashboard share card | 2h | High (distribution) | Day 7 |
| F6 | Success-story UGC page + auto-ticker | `api/reviews` | 4h | High (social proof) | Day 21 |
| F7 | Post-purchase bulk upsell | cart + `api/pricing/tiers` | 4h | High (AOV) | Day 14 |
| F8 | Mentor/expert badge on course page | trainers table (migration 012/013) | 2–3h | Medium (authority) | Day 21 |
| F9 | Weekly leaderboard WhatsApp broadcast | `wa-relay`, cron `*/5` | 4h | Medium (FOMO) | Day 30 |
| F10 | WhatsApp subscription digest (optional) | automation + wa-relay | 4h | Medium (retention) | Day 30 |

## Detailed specs for the top 4

### F1 — Launch-price countdown
- **Problem:** no urgency; users postpone purchase.
- **Fix:** `launch_end` timestamp in KV; countdown component on `/membership`, `/courses`, `/checkout` ("লঞ্চ অফার ৳৯৯ — বাকি ৩ দিন").
- **Truth rule:** must be a real, expiring offer; after end, price reverts (code in `api/pricing/tiers` reads a flag).
- **Effort:** 3h. **Expected:** conversion +20–30% during window.

### F2 — Free sample unlock
- **Problem:** first-time users don't see value before paying.
- **Fix:** "ফ্রি স্যাম্পল ডাউনলোড" button → requires phone (reuses OTP) → grants 1 unlock via `api/unlocks` → triggers `checkout_abandon`-style WhatsApp follow-up.
- **Effort:** 4h. **Expected:** +phone capture → +WhatsApp retention loop.

### F3 — Invite progress bar
- **Problem:** users don't know their next action.
- **Fix:** on dashboard, "আর ২ জন invite করলে ২-প্যাক ফ্রি" progress bar using leaderboard/count data.
- **Effort:** 3h. **Expected:** +30% shares.

### F4 — Daily streaks + badges
- **Problem:** no daily habit → weak retention.
- **Fix:** track daily login via `track/event`; KV streak counter; badges (first invite, 3 invites, first sale, 7-day streak) shown on dashboard + shareable card.
- **Effort:** 6–8h. **Expected:** D7/D30 retention +15–25%.

## What we deliberately do NOT build now (single-founder constraint)

- Creator marketplace, certificates engine, full search, AI marketplace, multi-agent systems — all defer to phase-2/3. Rationale: they don't move the Day-90 KPI needle and consume disproportionate time.

## Bangla — নতুন ফিচার প্রস্তাব (Owner's summary)

**শীর্ষ ৪টি ফিচার (সব ১০০% ফ্রি, আপনি একা করতে পারবেন):**

1. **F1 লঞ্চ-প্রাইস কাউন্টডাউন** (৩ ঘণ্টা) — "৳৯৯ শেষ → ৳১৯৯", সত্যিকারের অফার। জরুরি ভাব তৈরি করে, বিক্রি ২০–৩০% বাড়াতে পারে।
2. **F2 ফ্রি স্যাম্পল** (৪ ঘণ্টা) — পে-ওয়ালের আগে ১টি ফ্রি ফাইল; ফোন নম্বর নেবে, তারপর WhatsApp ফলো-আপ।
3. **F3 ইনভাইট প্রগ্রেস বার** (৩ ঘণ্টা) — "আর ২ জন invite → ফ্রি প্যাক" — শেয়ার বাড়ায়।
4. **F4 ডেইলি স্ট্রিক + ব্যাজ** (৬–৮ ঘণ্টা) — প্রতিদিন লগইন করলে স্ট্রিক, ব্যাজ + শেয়ারযোগ্য কার্ড — রিটেনশন বাড়ায়।

**ইচ্ছাকৃতভাবে এখন বানানো হচ্ছে না:** ক্রিয়েটর মার্কেটপ্লেস, সার্টিফিকেট ইঞ্জিন, সার্চ, মাল্টি-এজেন্ট AI — কারণ এগুলো ৯০ দিনের টার্গেটে নয়, সময় বেশি খায়।

**Priority: High** · **মোট Effort:** ~৩০ ঘণ্টা | **প্রত্যাশিত ফলাফল:** AOV, রিটেনশন ও শেয়ার — তিনটিতেই উল্লেখযোগ্য বৃদ্ধি।

## Cross-references
- `02_VIRAL_ENGINE.md` (G-items map to F3/F4/F5/F9)
- `03_CONVERSION_FUNNEL.md` (C-items map to F1/F2/F7/F8)
- `07_ROADMAP_TODAY_7_30_90_FUTURE.md`
