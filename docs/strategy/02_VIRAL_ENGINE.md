# 02_VIRAL_ENGINE
**Referral / Share / Reward / Community loops + 100% free channel playbooks**

> Context: `01_LAUNCH_SEQUENCE.md`, `06_NEW_FEATURE_PROPOSALS.md`, `07_ROADMAP_TODAY_7_30_90_FUTURE.md`

---

## 1. What already exists (verified)

| Mechanism | File(s) | Status |
|-----------|---------|--------|
| Share-to-unlock (+1 unlock / 24h) | `src/app/api/referrals/share-reward/route.ts` | ✅ coded (KV rate-limited) |
| Leaderboard (top referrers + myRank) | `src/app/api/affiliate/leaderboard/route.ts` | ✅ coded |
| Viral share card in dashboard | `src/app/dashboard/page.tsx` | ✅ coded |
| `referral_share` WhatsApp template | `src/lib/whatsapp.ts:21` | ✅ coded |
| 4-level commission (৳20 + ৳10×3, min-11 gate) | `src/lib/affiliate/commission.ts` | ✅ coded |
| 3-step onboarding (WhatsApp + consent + contact capture) | `src/app/onboarding/page.tsx` | ✅ coded |
| Live purchase ticker (social proof) | `src/components/LivePurchaseTicker.tsx` | ✅ coded |
| WhatsApp delivery bridge (queue-based) | `wa-relay/index.mjs`, `src/app/api/whatsapp/{send,queue,contacts}/route.ts` | ✅ coded, **Needs Manual Verification** live |

**Verdict:** the viral *mechanisms* are present. The gaps are **distribution (cold start)** and a few **engagement hooks** (streaks, badges, progress, success stories, native TG/FB share).

---

## 2. The Viral Loop (desired steady state)

```
                    ┌────────────────────────────┐
                    │  Free content (YT Shorts,   │
                    │  FB Reels, TG channel)      │
                    └────────────┬───────────────┘
                                 ▼
              ┌──────────────────────────────────┐
              │  Landing (shareable, SEO, OG)    │
              └────────────┬─────────────────────┘
                           ▼
                   OTP / guest signup
                           ▼
              Onboarding: capture WhatsApp + contacts
                           ▼
              Referral link (ready-to-share card)
                           ▼
            Invitee signs up ←── (contact list → WA outreach)
                           ▼
                 K > 1 ? → loop grows │ K ≤ 1 → need content fuel
```

**Key law:** the loop only self-sustains when each user brings **>1 active new user**. Below 1, you must keep pumping free content — which is exactly why `01_LAUNCH_SEQUENCE` makes Week-1 content the top action.

---

## 3. Free-channel playbooks (single-founder)

### 3.1 Telegram channel (highest effort/reach in BD context)
- Purpose: daily career/resource tips + success stories + referral contest updates.
- Run: founder posts 1×/day; use `chat-worker` brain to draft 7 days of posts in one prompt (free DeepSeek).
- Growth: auto-post every share link + pin "invite contest"; use t.me/joinchat links in every WA share.
- **Cost: 0 ৳** — effort ~30 min/day.

### 3.2 YouTube Shorts + Facebook Reels (content distribution)
- Topic themes: "সিভি টিপস", "সরকারি চাকরি", "ফ্রি রিসোর্স", "এক সদস্যের গল্প" (privacy-safe).
- Batch-ideate with AI; film 1 phone-video/week; post 5 shorts/week.
- Every bio/description carries the share link. SEO already fixed (`src/app/sitemap.ts`, `robots.ts`).
- Goal: pull *curious* traffic → landing → OTP → referral.

### 3.3 WhatsApp community (retention + UGC)
- One opt-in community/group: winners, top-7 leaderboard broadcast (via `wa-relay`, capped — see risk), success stories, Q&A.
- Do **not** unsolicited-broadcast from personal bridge — that is a ban vector.
- Alternative compliant route: users who completed **contact capture** can receive a WhatsApp "invite your contacts" nudge (they send their own share link manually) — keeps consent inside user flow.

### 3.4 SEO (already done — keep indexed, then feed)
- Content pages drive long-tail: courses pages are dynamic & in sitemap. Add a **blog/guide section** (5 posts) targeting "ফ্রি রিসোর্স", "ক্যারিয়ার গাইড" — 2–4 weeks to index. See `05_GAP_ANALYSIS`.

---

## 4. Engagement hooks to add (shortlist — see `06` for specs)

| Hook | Why | Effort (founder) |
|------|-----|------------------|
| Native Telegram/FB share buttons | removes friction vs copy-link | 2–3 h |
| Referral progress bar ("আর ৩ জন → ফ্রি ৩-প্যাক") | progress + reciprocity | 4–6 h |
| Daily streak + badge system | habit loop, retention | 6–10 h |
| Weekly top-7 broadcast (WA, opt-in) | FOMO + leadership | 2–3 h |
| Success-story card generator (UGC) | social proof engine | 6–8 h |

---

## 5. Risk table

| Risk | Level | Mitigation |
|------|-------|------------|
| WhatsApp ban via personal bridge | High | opt-in only; rate-limit; never scrape; use TG as broadcast channel first |
| Loop dies below K=1 | High | keep content fuel running; measure K weekly |
| Fake invites / farming | Medium | 24h share cap; onboarding completion gate; manual review for rewards |
| Brand as "MLM" hurts trust | Medium | position as "AI-driven affiliate learning ecosystem" (see `05_GAP_ANALYSIS`) |

---

## 6. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** ভাইরাল গ্রোথের ইঞ্জিন: রেফারেল লুপ, শেয়ার, কমিউনিটি।
- **কেন জরুরি:** কে>১ না হলে লুপ নিজে বাড়বে না — তাই কনটেন্ট ফানেল + হুক প্রয়োজন।
- **সমস্যা:** ইঞ্জিন আছে, কিন্তু "cold-start fuel" (বাইরের ট্রাফিক) নেই; WhatsApp-এর ব্যক্তিগত bridge দিয়ে বাল্ক সেন্ড বিপজ্জনক।
- **Business impact:** সঠিক লুপ + ফ্রি চ্যানেল = প্রতি invite-এ খরচ ৳০। **Impact: High**
- **Priority:** High — টেলিগ্রাম চ্যানেল + ৫ শর্ট/সপ্তাহ সপ্তাহ-১ থেকেই।
- **Effort:** ~২-৩ ঘণ্টা/সপ্তাহ কনটেন্ট + ~২০-৩০ ঘণ্টা হুক বিল্ড (৬০ দিনে)।
- **Expected benefit:** প্রথম ৯০ দিনে ৫০k–২০০k reach সম্ভব শুধু এই ইঞ্জিন দিয়ে।