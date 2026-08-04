# 05_GAP_ANALYSIS
**Where we stand vs world-class learning + social platforms**

> Context: `02_VIRAL_ENGINE.md`, `03_CONVERSION_FUNNEL.md`, `06_NEW_FEATURE_PROPOSALS.md`

---

## 1. Benchmark areas (what "world-class" does)

| Area | Industry standard | Jobayer Group Career | Gap |
|------|-------------------|----------------------|-----|
| Identity & onboarding | social-signup + phone, <30s | OTP + guest checkout ✅ | small |
| Learning product | lessons, progress, certificates, streaks | resources + unlock + progress + ratings ✅ (partial) | certificates? |
| Community | public profiles, groups, feeds | referral tree, leaderboard | no public feed/groups |
| Gamification | streaks, badges, XP, challenges | share-reward + leaderboard | no streaks/badges/XP |
| Distribution | built-in share, UGC, SEO, referrals | share card + referral ✅ | no native TG/FB share; no UGC engine |
| Trust | verified reviews, guarantees, money-back | ticker + reviews + money-back ✅ | sample gate, verified-buyer badge |
| Monetization | free-tier → upsell → subscription | ৳99 entry ✅ | no free tier with paid upgrade; low AOV |
| Retention | daily content, notifications, streaks | automation triggers ✅ | no daily habit loop |

---

## 2. Gaps ranked by business impact (solo-founder buildable)

| # | Gap | Why it matters | Effort | Impact |
|---|-----|----------------|--------|--------|
| 1 | **No free content/distribution funnel** | cold start impossible | 2 h/week | Critical |
| 2 | **No native TG/FB share** | BD audience lives there; copy-link is friction | 2–3 h | High |
| 3 | **No gamification (streaks/badges/XP)** | retention + habit → referral frequency | 8–12 h | High |
| 4 | **No UGC success-story engine** | social proof at scale | 6–8 h | High |
| 5 | **No public community layer (groups/feed)** | retention + ambassador program | 8–12 h | Med |
| 6 | **No free sample / trial tier** | curiosity→paid; low-risk entry | 4–6 h | High |
| 7 | **Low AOV** (single ৳99) | revenue per traffic is thin | 4–6 h | High |
| 8 | **No blog/guide content pages** | SEO long-tail reach | 4–6 h | Med |

---

## 3. What NOT to do (be honest)

- Do not rebuild the referral/commission system — it is complete (`commission.ts`, `share-reward`).
- Do not add a full subscription layer in 90 days (was deliberately removed).
- Do not build a complex "social network" — a lightweight community + UGC engine is enough for phase 1.
- Do not add paid ad tooling — goal is 100% organic.

---

## 4. Positioning note

`AI_EXPANSION_PLAN.md` already recommends positioning the brand as an **"AI-driven affiliate learning ecosystem"** rather than an "MLM income" platform. That single reframe:
- reduces compliance/trust risk,
- differentiates from typical MLM pitches,
- unlocks B2B/B2C upsell and creator programs.

---

## 5. Risk table

| Risk | Level | Mitigation |
|------|-------|------------|
| Feature creep kills focus | High | roadmap gates (see `07`); only the listed gaps |
| Community moderation cost | Med | small groups first; founder-moderated |
| AOV upsell hurts conversion | Med | non-blocking, post-purchase |

---

## 6. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** বিশ্বমানের প্ল্যাটফর্মের সঙ্গে আমাদের পার্থক্য (gap)।
- **কেন জরুরি:** শুধু নিজের খেলা দেখলে উন্নতি হয় না; বেঞ্চমার্কে দেখলে বিনিয়োগ কোথায় দরকার।
- **সমস্যা:** মূল ঘাটতি হলো ডিস্ট্রিবিউশন (ফ্রি কনটেন্ট), নেটিভ শেয়ার, গেমিফিকেশন, UGC, ফ্রি-স্যাম্পল — এগুলোই growth/sale-এর মূল।
- **Business impact:** gap বন্ধ হলে retention + referral + sale একসাথে বাড়ে। **Impact: High**।
- **Priority:** High — top ৫ gap-এর সমাধান ৬০ দিনে।
- **Effort:** ~২৫–৩৫ ঘণ্টা মোট।
- **Expected benefit:** রেফারেল ফ্রিকোয়েন্সি ২–৩×, AOV +৫০%, SEO reach ৩–৬ মাসে।