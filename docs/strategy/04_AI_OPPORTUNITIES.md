# 04_AI_OPPORTUNITIES
**AI capabilities to add — effort vs ROI (single-founder)**

> Context: `02_VIRAL_ENGINE.md`, `03_CONVERSION_FUNNEL.md`, `05_GAP_ANALYSIS.md`

---

## 1. What the AI stack already does (verified)

| Capability | Where | Status |
|------------|-------|--------|
| Multi-model brain (OpenRouter + DeepSeek free failover) | `ai-app` worker + `chat-worker` | ✅ coded |
| Web chat brain (cross-channel continuity) | `api/chat/web` | ✅ coded |
| Sentiment / segments / psychology profiles | `ai-app` | ✅ coded |
| Automation triggers (browse_abandon, checkout_abandon, inactive_14d/30d, churn_risk) | `src/app/api/company/automation/route.ts` | ✅ coded |
| Contact capture + bulk phonebook sync | `api/track/phonebook/*` | ✅ coded |
| Recommendation / personalization | `api/recommendations`, `PersonalizedSection` | ✅ coded |

**Verdict:** a real AI foundation already exists. The AI opportunities below are mostly **reuse + wiring**, not new infrastructure.

---

## 2. Opportunity shortlist (ranked by ROI ÷ effort for a solo founder)

| # | Opportunity | Reuses | Effort | ROI |
|---|-------------|--------|--------|-----|
| 1 | **AI Sales follow-up** — auto WhatsApp reply to checkout_abandon / browse_abandon with a personalized pitch | `automation` + `wa-relay` | 3–5 h | ★★★★★ |
| 2 | **AI Career Coach (chat)** — publicize the existing chat brain as "Career AI Coach", free tier → upsell | `api/chat/web` | 2–4 h | ★★★★ |
| 3 | **AI content ideation** — one prompt → 7 days of TG/YT post ideas (viral fuel) | `chat-worker` | 2–3 h | ★★★★ |
| 4 | **AI recommendation** on landing — personalize "for you" packs | `api/recommendations` | 3–5 h | ★★★ |
| 5 | **AI upsell / cross-sell** — after purchase, suggest the 3-pack or next course | `resource*` success | 3–4 h | ★★★ |
| 6 | **AI churn outreach** — notify + WA for inactive_30d | `automation` | 2–3 h | ★★★ |
| 7 | **AI community manager** — auto-reply in TG group (careful: needs moderation guard) | `chat-worker` | 6–10 h | ★★☆ (risk) |
| 8 | **AI lead scoring** — score leads by intent (clicks, checkout) | `user_events` | 4–6 h | ★★☆ |

---

## 3. Guardrails

- **Cost control:** use free-model failover (already in `chat-worker`); set daily token budgets via model alias router. **Needs Manual Verification** for live spend.
- **Personalization privacy:** contact data from onboarding should only feed automated recovery to that same user — no cold spamming.
- **Community AI:** an auto-reply bot in public Telegram can harm brand if it hallucinates — add approval queue / guardrails first.
- Every AI message should carry a **human opt-out** (reply "STOP") — builds trust, lowers ban-risk.

---

## 4. Priority call (solo founder)

**Do first:** #1 (sales follow-up) and #3 (content ideation). They directly feed revenue and the viral fuel from `02`.
**Do second:** #2 (Career AI Coach) — it is the differentiating product story ("AI-driven learning ecosystem").
**Defer:** #7 (public auto-reply) until scale + moderation.

---

## 5. Risk table

| Risk | Level | Mitigation |
|------|-------|------------|
| AI hallucination in user-facing chat | Med | free-tier guardrails, "this is AI" disclaimer, fallback |
| Token cost blows up | Med | model alias caps, daily quotas |
| WhatsApp spam bans | High | opt-in flows only, rate limits, STOP keyword |
| Privacy / consent misuse | Med | reuse only user's own consent/contact |

---

## 6. বাংলা (owner) — কী, কেন, করণীয়

- **এই সেকশনটি** AI কীভাবে sale, retention ও growth-এ ব্যবহার হবে।
- **কেন জরুরি:** AI ইতিমধ্যে আছে (চ্যাট, সেন্টিমেন্ট, অটোমেশন) — শুধু sale-ফোকাস ও কনটেন্ট ফোকাসে লাগান লাগবে।
- **সমস্যা:** AI ফিচার আছে কিন্তু সরাসরি money/reach-এর সাথে সংযুক্ত নয়।
- **Business impact:** AI সেলস-ফলোআপ = জরুরী ভোক্তা ফিরে আসা; AI কনটেন্ট = সপ্তাহে ঘণ্টা বাঁচায়। **Impact: High**।
- **Priority:** High — প্রথম ৩০ দিনে #1 + #3; ৯০ দিনে #2 পণ্য-স্টোরি।
- **Effort:** ~৮–১২ ঘণ্টা মোট (reuse-ভিত্তিক)।
- **Expected benefit:** বেশি abandoned→sale, কনটেন্ট মিল ২×, "AI coach" ব্র্যান্ড ডিফারেন্সিয়েশন।