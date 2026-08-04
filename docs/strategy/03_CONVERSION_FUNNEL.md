# 03 — CONVERSION FUNNEL

> Part of `docs/strategy/` — read `STRATEGY_REVIEW.md` first.

## 1. Current funnel (verified code path)

```
Channel (Short/Telegram/WA/ref)
  └─► /register?ref=<code>            (register/page.tsx; referral auto-attach)
  └─► onboarding (4 steps: consent → OTP → contacts → interests)   (onboarding/page.tsx)
  └─► /courses (browse; product_view event)                        (courses/page.tsx)
  └─► cart / CheckoutModal (haggle)                                (components/courses/CheckoutModal.tsx)
  └─► /checkout (guest OTP or login)                               (checkout/page.tsx)
  └─► SSLCommerz init/success/ipn → order completed → unlock       (api/payment/*, resource-checkout/*)
  └─► dashboard: premium badge, unlocks, commission preview        (dashboard/page.tsx)
```

Tracked events (already wired): `product_view`, `cart_add`, `checkout_started`, purchases — readable in `/company/analytics` Funnel tab + `api/company/kpi`.

## 2. Psychology audit — what exists vs what's missing

| Principle | Status | Where |
|---|---|---|
| Reciprocity | ✅ Built | share-to-unlock reward (`api/referrals/share-reward`) |
| Social proof | ✅ Built | live ticker (`LivePurchaseTicker`), testimonials (`home/Testimonials`), reviews (`api/reviews`) |
| Commitment | ✅ Built | 4-step onboarding (progressive commitment), contact capture |
| Anchoring | ✅ Built | tier ladder 99/198/220/350/650/1200/2800/5200 (`api/pricing/tiers`) |
| Loss aversion / instant gratification | ✅ Built | min withdrawal ৳20 |
| **Scarcity / urgency** | ❌ Missing | no launch-price timer, no stock counter, no "offer ends" |
| **Authority** | ❌ Missing | no expert/mentor badge; trainers exist in data but not surfaced as authority on buy pages |
| **Curiosity gap** | ❌ Missing | no free sample download / teaser before paywall |
| **Upsell / cross-sell** | ⚠️ Weak | post-purchase bulk-pack upsell not implemented |
| CTA clarity | ⚠️ Mixed | many CTAs; need single primary action per screen |

## 3. Conversion upgrades (ranked by ROI for single founder)

### C1 — Launch-price urgency (HIGH)
Add a countdown to the first 500 buyers: "লঞ্চ অফার ৳৯৯ → পরে ৳১৯৯" with a visible timer on `/membership`, `/courses`, `/checkout`.
- Implementation: KV-stored `launch_end` date; small client component (reuse ticker pattern). **Effort: 3–4h.**
- Note: only truthful scarcity — a real, expiring offer. Do not fake.

### C2 — Authority: "Mentor/Expert" badge (MEDIUM-HIGH)
Course detail (`courses/[id]`) already pulls trainer/institution (`api/courses/[id]`, trainers table, migration 012/013). Surface trainer credentials as an "কারিকুলাম মেন্টর" card on the buy panel. **Effort: 2–3h.**

### C3 — Curiosity gap: free sample unlock (HIGH)
Allow 1 free sample file per user (already have downloads/unlocks infra `api/unlocks/*`, `api/downloads`). Add "ফ্রি স্যাম্পল ডাউনলোড" button → collects phone → WhatsApp follow-up (automation). **Effort: 4h.**

### C4 — Post-purchase bulk upsell (HIGH, AOV)
On success page (`/checkout` ssl-success + `resource-checkout/success`): "আর ২টি নিলে ২২০ (২-প্যাক)" — reuse cart + `api/pricing/tiers`. **Effort: 4h.** Lifts AOV from ~৳99 toward ৳200+.

### C5 — Checkout trust density (LOW-MED)
Already added money-back line under pay CTA; add SSL/bKash logos row + "আজীবন অ্যাক্সেস" repeated. **Effort: 1h.**

### C6 — Abandoned recovery copy (MEDIUM)
Automation `checkout_abandon` trigger exists (Phase 4). Add 2-message sequence: t+2h value reminder, t+24h offer. **Effort: 3h.**

## 4. Onboarding optimization (drop point #1)

Current 4 steps: consent → OTP → contacts → interests. **Risk:** contact capture (step 3) is a known friction point. Mitigation:
- Keep it mandatory for launch (it powers WhatsApp reach), but add a **progress indicator** + "৩টি স্টেপ মাত্র" reassurance.
- If onboarding completion < 70% in data, A/B a 3-step variant (interests optional).
- Measure via `track/event` + `/company/analytics` (Events tab).

## Bangla — কনভার্শন ফানেল (Owner's summary)

**ফানেল কীভাবে কাজ করে:** শর্ট/টেলিগ্রাম/রেফারেল → রেজিস্ট্রেশন → ৪-স্টেপ ওনবোর্ডিং → রিসোর্স ব্রাউজ → চেকআউট (গেস্ট OTP) → SSLCommerz পেমেন্ট → আনলক। প্রতিটি স্টেপের ইভেন্ট ইতিমধ্যেই ট্র্যাক হচ্ছে — `/company/analytics`-এ দেখতে পাবেন কোথায় ইউজার ড্রপ হচ্ছে।

**সাইকোলজি অডিটের ফলাফল:** যা আছে — reciprocity (শেয়ার-রিওয়ার্ড), social proof (টিকার + টেস্টিমোনিয়াল + রিভিউ), commitment (ওনবোর্ডিং), anchoring (টিয়ার ৯৯→৫২০০), loss-aversion (৳২০ উইথড্র)। **যা নেই:** scarcity/urgency (লঞ্চ-প্রাইস টাইমার), authority (মেন্টর ব্যাজ), curiosity gap (ফ্রি স্যাম্পল), post-purchase আপসেল।

**সবচেয়ে গুরুত্বপূর্ণ ৩টি কাজ (C1, C3, C4):**
1. **C1** — সত্যিকারের লঞ্চ-অফার কাউন্টডাউন (৳৯৯ শেষ → ৳১৯৯) → জরুরি ভাব।
2. **C3** — ফ্রি স্যাম্পল ডাউনলোড → ফোন নম্বর ক্যাপচার → WhatsApp ফলো-আপ।
3. **C4** — কেনার পর "আর ২টি নিন ২২০" আপসেল → AOV বাড়বে।

প্রতিটি ২–৪ ঘণ্টার কাজ। **Priority: High** · **Effort:** ~২০ ঘণ্টা | **প্রত্যাশিত ফলাফল:** ফানেল কনভার্শন ৫%→১০-১৫%, AOV ৳৯৯→৳২০০।

## Cross-references
- Automation triggers: `04_AI_OPPORTUNITIES.md`
- Feature specs: `06_NEW_FEATURE_PROPOSALS.md`
- Roadmap: `07_ROADMAP_TODAY_7_30_90_FUTURE.md`
