# 06_NEW_FEATURE_PROPOSALS
**Single-founder buildable, 100% free, high business value**

> Context: `02_VIRAL_ENGINE.md`, `03_CONVERSION_FUNNEL.md`, `05_GAP_ANALYSIS.md`

> All items below reuse existing infra (unlocks, referrals, automation, wa-relay). Nothing requires paid tools.

---

## 1. Free-sample / trial unlock (curiosity gate)
- **Purpose:** let a visitor/lead unlock one resource free → taste → push to ৳99.
- **Wiring:** existing `api/unlocks` + `api/unlocks/limits`; add a `try_free` status.
- **Effort:** 4–6 h. **Impact:** High — converts wait-listed "not sure" visitors.
- **Dependency:** onboarding completion (to capture WhatsApp for follow-up).

## 2. Referral progress + reward preview
- **Purpose:** show "আর ৩ জন invite করলে ফ্রি ৩-প্যাক" — progress + loss-aversion.
- **Wiring:** reuse leaderboard + commission data; add a progress bar on share card.
- **Effort:** 4–6 h. **Impact:** High — lifts share frequency & count.
- **Dependency:** `dashboard/page.tsx` share card; commission schema.

## 3. Native Telegram + Facebook share buttons
- **Purpose:** one-tap share (0 friction) where BD users live.
- **Wiring:** `invoke shareUrl` on the share card; OG already set (`layout.tsx`).
- **Effort:** 2–3 h. **Impact:** High — removes copy-link friction.
- **Note:** WhatsApp share stays a deep link (personal bridge), not a broadcast.

## 4. Daily streak + badge system
- **Purpose:** habit loop → daily login → daily refer → compounding K.
- **Wiring:** `user_events` (track), KV counter, small badge UI in dashboard.
- **Effort:** 8–12 h. **Impact:** High — retention + referral frequency.
- **Caution:** keep it simple (no full XP system in v1).

## 5. UGC success-story engine
- **Purpose:** build a social-proof library at scale ("আমি ৳X কমিশন পেয়েছি").
- **Wiring:** reuse testimonials/reviews + share card; admin-approved posts.
- **Effort:** 6–8 h. **Impact:** High — trust + further sharing.
- **Caution:** require consent; no promise of income unless verified.

## 6. Post-purchase bulk-pack upsell
- **Purpose:** raise AOV (৳99 → ৳220 3-pack) right after first payment.
- **Wiring:** `api/resource*` success path; optional non-blocking offer.
- **Effort:** 4–6 h. **Impact:** High — direct revenue lift.
- **Caution:** only post-purchase, honest, one-click accept.

## 7. WhatsApp abandoned-cart recovery (AI copy)
- **Purpose:** recover drop-offs at checkout; reuse automation + wa-relay.
- **Wiring:** `api/company/automation` checkout_abandon + `wa-relay` send.
- **Effort:** 3–5 h. **Impact:** High.
- **Caution:** opt-in only; STOP keyword; rate-limit (ban risk).

## 8. Public community layer (Telegram/WhatsApp group + feed)
- **Purpose:** retention, success stories, ambassador program home.
- **Effort:** uses free external channel (Telegram) → low (in-app feed = Med).
- **Impact:** Med-High.

---

## Prioritized order for a solo founder

```
Sprint A (days 1–14):  #7  (AI abandoned recovery)  →  #3 (native share)  →  #1 (free sample)
Sprint B (days 15–45): #6  (upsell)  →  #2 (referral progress)  →  #8 (TG community)
Sprint C (days 45–90): #4  (streaks/badges)  →  #5 (UGC engine)
```

---

## 6. Risk table

| Risk | Level | Mitigation |
|------|-------|------------|
| Feature creep | High | roadmap gates; only listed items |
| WhatsApp ban | High | opt-in + rate-limit + STOP |
| Gamification feels gimmicky | Med | keep simple, real rewards |
| UGC credibility | Med | admin approval + consent |

---

## 7. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** নতুন ফিচার যা ১০০% ফ্রি ও একজনে বানানো যায়।
- **কেন জরুরি:** এগুলাই retention, referral frequency এবং AOV বাড়ায় — সবচেয়ে কম effort-এ।
- **সমস্যা:** নেটিভ শেয়ার, streak, free-sample, upsell, recovery — এগুলোই বড় ঘাটতি।
- **Business impact:** K (ভাইরাল) + retention + AOV একসাথে বাড়ে। **Impact: High**।
- **Priority:** High — Tier A items আগে।
- **Effort:** ~৩৫–৪৫ ঘণ্টা মোট ৯০ দিনে। **Difficulty:** Low–Med (reuse)।
- **Expected benefit:** ৯০ দিনে রেফারেল ২–৩×, AOV +৫০%, abandoned→sale +১০–২০%।