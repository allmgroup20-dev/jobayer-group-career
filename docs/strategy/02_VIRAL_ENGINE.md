# 02 — VIRAL ENGINE

> Part of `docs/strategy/` — read `STRATEGY_REVIEW.md` first.
> **Design principle:** Optimize what exists (Phases 1–5 built the machinery), close the specific gaps, and only build net-new items that pay for themselves.

## 1. What exists today (verified)

| Mechanism | Where | Purpose |
|---|---|---|
| Share-to-unlock | `src/app/api/referrals/share-reward/route.ts` | +1 unlock quota / 24h via KV when a user shares a link |
| Leaderboard | `src/app/api/affiliate/leaderboard/route.ts` | top referrers + my rank |
| Viral share card | `src/app/dashboard/page.tsx` | ৳20 commission preview, WhatsApp/Telegram share, share-bonus button, top-referrers widget |
| Commission (4-level) | `src/lib/affiliate/commission.ts` | ৳20 (L1) + ৳10×3 (L2–L4); depth-capped 4; min-team gate for L2+ |
| Referral attribution | `src/app/api/auth/otp/login/route.ts`, `register` | `referral_code` in localStorage → sponsor auto-attached |
| Onboarding capture | `src/app/onboarding/page.tsx` | mandatory WhatsApp + contact list (`track/phonebook/bulk`) |
| Live social proof | `src/components/LivePurchaseTicker.tsx` | recent real purchases on courses/checkout/membership |
| WhatsApp templates | `src/lib/whatsapp.ts` | share + OTP templates |
| Automation | `src/app/api/company/automation/route.ts` | browse/checkout abandon, inactivity, churn → notify/WhatsApp |

## 2. Loop map (current state)

```
User registers via ref link ──► sponsor credited
   │
   ├── shares link (share-reward) ──► +1 unlock ──► posts to WhatsApp/Telegram
   ├── invites contacts (onboarding contact sync) ──► WA broadcast path
   ├── buys ৳99 ──► L1 sponsor gets ৳20 ──► story shared ──► more invites
   └── leaderboard rank ──► weekly broadcast ──► status → more sharing
```

## 3. Gaps & targeted upgrades (single-founder buildable)

| # | Gap | Fix | Effort | Impact |
|---|---|---|---|---|
| G1 | No **native** Telegram/Facebook share buttons (only WhatsApp + generic) | Add Telegram share URL + FB messenger share button on share card (`src/app/dashboard/page.tsx`) | 2h | High — Telegram is a top BD distribution channel |
| G2 | No invite **progress bar** ("3 invites away from free pack") | Reuse `api/affiliate/leaderboard` data; add progress UI on dashboard | 3h | High — gamification, clear next action |
| G3 | No **streaks/badges** (daily login, first invite, 3 invites, first sale) | Add a `user_events`-based streak + badges table (KV for streak); display on dashboard | 6–8h | High — retention + daily return visits |
| G4 | Leaderboard has no **weekly broadcast** | cron already runs every 5 min (`wrangler.jsonc`); add a weekly `leaderboard_winner` WhatsApp via `wa-relay` to top 3 | 4h | Medium — FOMO + status |
| G5 | Share-reward gives +1 unlock, but no **proof of share** (honor-based) | Acceptable for v1; document as known limitation | — | — |
| G6 | No **success-story UGC** capture | Add "Share your story" form → posts to a public page + auto-ticker; reuse reviews infra (`api/reviews`, `src/app/reviews/page.tsx`) | 4h | High — authority + social proof |
| G7 | Referral link has OG/redirect polish | Confirm `/register?ref=` renders proper OG (Phase 3 did layout-level OG; per-page verification needed) | 1h | Medium |

**Order of execution:** G1+G2 (Day 7) → G3 (Day 14) → G6 (Day 21) → G4 (Day 30).

## 4. Channel playbooks (100% free)

### WhatsApp (primary)
- Personal + broadcast list to registered users weekly: leaderboard winners, new packs, success story.
- Automation triggers already wired (`api/company/automation`) — ensure WhatsApp action enabled in prod.
- Template cadence: 1 OTP/txn, 1 weekly digest, 1 trigger follow-up. Keep below 2/day/user to avoid spam + Meta limits.

### Telegram
- Channel: daily career tip + free sample resource → link to `register?ref=<code>`.
- Group (community): run weekly "ask me anything" — founder-only, 1–2 hrs/week.
- Share buttons: `https://t.me/share/url?url=<site>/register?ref=<user_code>`.

### Facebook (zero-ad)
- Personal profile (founder) is the #1 asset at this stage: post 3×/week, join 5–10 job/career/freelance groups, contribute value first.
- Facebook **Pages** scale only after a following exists; skip paid boost entirely.

### YouTube Shorts
- 2–3 Shorts/week: "৩টি টিপস", "আমি কীভাবে ফোন দিয়ে ইনকাম করি", "CV/ক্যারিয়ার" — hooks first 2 seconds.
- CTA in video: Telegram channel. Funnel: Shorts → Telegram → site → referral.

### SEO (passive, compounding)
- Already shipped (`sitemap.ts`, `robots.ts`, canonical, OG, JSON-LD). Focus: Google Search Console submission + 10 cornerstone Bengali pages from course catalog.

## 5. Viral math guardrail

A viral loop needs **K > 1**. Practical target: K = 0.4 committed-referrer ratio (users who actively refer ÷ users). Combined with retention (streaks, G3) and WhatsApp reach, this compounds to the Day-90 targets. **Do not** invest in paid growth even if tempted — the constraint is explicit.

## Bangla — ভাইরাল ইঞ্জিন (Owner's summary)

**কী আছে:** শেয়ার-টু-আনলক, লিডারবোর্ড, ৪-স্তর কমিশন, রেফারেল অ্যাট্রিবিউশন, ওনবোর্ডিং-এ কন্টাক্ট ক্যাপচার, লাইভ সেল টিকার, WhatsApp অটোমেশন — এই ৫টি Phase-এর মেশিনারি রেডি।

**কী দরকার (গ্যাপ):** Telegram/Facebook-এ নেটিভ শেয়ার বাটন (G1), "আর ৩ জন invite → ফ্রি প্যাক" প্রগ্রেস বার (G2), ডেইলি স্ট্রিক + ব্যাজ (G3), সাপ্তাহিক লিডারবোর্ড WhatsApp ব্রডকাস্ট (G4), ইউজার সাকসেস-স্টোরি সেকশন (G6)। প্রতিটা ২–৮ ঘণ্টার কাজ, আপনি একাই করতে পারবেন।

**চ্যানেল প্লেবুক:** WhatsApp = মূল (অটোমেশন রেডি), Telegram = চ্যানেল + গ্রুপ, Facebook = আপনার ব্যক্তিগত প্রোফাইল দিয়ে (পেইড নয়), YouTube Shorts = ডিসকভারি ইঞ্জিন, SEO = নিষ্ক্রিয় ট্রাফিক।

**Priority: High** · **Effort:** ~২৫ ঘণ্টা মোট (৭ দিনের স্প্রিন্টে) | **প্রত্যাশিত ফলাফল:** শেয়ার/রেফারেল ৩–৫× বৃদ্ধি।

## Cross-references
- Launch order: `01_LAUNCH_SEQUENCE.md`
- Feature specs: `06_NEW_FEATURE_PROPOSALS.md`
- Roadmap: `07_ROADMAP_TODAY_7_30_90_FUTURE.md`
