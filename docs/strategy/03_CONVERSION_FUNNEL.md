# 03_CONVERSION_FUNNEL
**Onboarding → Checkout → Payment + Marketing Psychology Audit**

> Context: `04_AI_OPPORTUNITIES.md`, `06_NEW_FEATURE_PROPOSALS.md`, `07_ROADMAP_TODAY_7_30_90_FUTURE.md`

---

## 1. Current funnel (verified)

```
Landing (SEO + OG + live ticker)
  ↓
Signup: register OR OTP guest login     [src/app/api/auth/{register,otp/*}]
  ↓
3-step onboarding (consent → WhatsApp OTP → contacts; optional interests)
                                      [src/app/onboarding/page.tsx]
  ↓
Courses / Membership landing (tier ladder 99/220/350/650/5200)
                                      [src/app/membership/page.tsx, courses/page.tsx]
  ↓
Cart → Checkout (form + SSLCommerz/COD + money-back note)
                                      [src/app/checkout/page.tsx]
  ↓
Payment success → unlock + auto-account   [src/app/api/payment/*, resource-check*]
```

**Verified strengths:** OTP/guest checkout (low friction), live purchase ticker (social proof), money-back note, tier price ladder (anchoring), abandoned-checkout automation.

---

## 2. Psychology audit — present vs missing

| Principle | Status | Evidence / gap |
|-----------|--------|----------------|
| Anchoring / price ladder | present | ৳99→220→350→650→5200 ladder |
| Social proof | present | ticker + testimonials + leaderboard |
| Reciprocity | present | share-reward (+1 unlock) |
| Commitment | present | 3-step onboarding |
| Scarcity | missing | no launch timer / limited "৳99" window |
| Urgency | missing | no countdown |
| Authority | weak | teacher/mentor badges not surfaced at checkout |
| Curiosity gap | missing | no "free sample" unlock gate |
| FOMO | partial | ticker; no leaderboard FOMO push |

---

## 3. Conversion wins (single-founder, cheapest first)

| # | Action | File(s) | Effort | Impact |
|---|--------|---------|--------|--------|
| 1 | Launch-price timer (৳99 for X time, then ৳220) | `membership/page.tsx` | 3–4 h | High |
| 2 | Strikethrough "was" → "now" on tiers | membership + CheckoutModal | 2 h | Med |
| 3 | Authority trust badges at checkout | `checkout/page.tsx` | 1–2 h | Med |
| 4 | Social-proof line ("৩০০+ সদস্য কিনেছেন") | courses + membership | 1 h | Med |
| 5 | Free-sample unlock (curiosity gate) | `api/unlocks`, course detail | 4–6 h | High |
| 6 | Post-purchase bulk-pack upsell → raises AOV | `api/resource*` | 4–6 h | High |
| 7 | Wire abandoned-cart recovery WA send | `api/company/automation/route.ts` | 3–4 h | High |
| 8 | Cart-exit urgency popup | cart/checkout | 2–3 h | Med |

---

## 4. Success metrics

- Visitor → signup rate
- Onboarding → active %
- View → cart → checkout → paid %
- **AOV** — lift from ~৳99 toward ~৳160 via upsell
- Abandoned-cart recovery (target ≥ 10%)
- Track via `/api/company/kpi` and `/company/goal`

---

## 5. Risk table

| Risk | Level | Mitigation |
|------|-------|------------|
| Fake urgency hurts trust | Med | honest timers + real limits |
| Upsell feels aggressive | Med | post-purchase only, optional, non-blocking |
| Missed payment step adds drop | Med | keep upsell out of the pay path |

---

## 6. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** ভিজিট→সেলের রূপান্তর ফানেল ও মার্কেটিং মনোবিজ্ঞান (Buyer Psychology)।
- **কেন জরুরি:** ট্রাফিক কনটেন্ট/রেফারেল থেকে আসবে, কিন্তু sale হয় এখানে। ছোট পরিবর্তনেই রূপান্তর ২–৩× বাড়তে পারে।
- **সমস্যা:** scarcity/urgency/curiosity-gap নেই; AOV কম (~৳৯৯); CTA খুব একটোন।
- **Business impact:** ৫–১০% conversion লিফট + AOV ~৫০% বাড়ি = revenue ~১.৫×। **Impact: High**।
- **Priority:** Critical — প্রথম ৩ সপ্তাহে #1, #5, #6, #7।
- **Effort:** মোট ~২০–২৫ solo-founder ঘণ্টা।
- **Expected benefit:** একই ট্রাফিকে বেশি sale → সবচেয়ে কম effort-এ সবচেয়ে বেশি ROI।