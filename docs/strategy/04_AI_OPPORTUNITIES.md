# 04 — AI OPPORTUNITIES

> Part of `docs/strategy/` — read `STRATEGY_REVIEW.md` first.
> **Principle:** Reuse the existing 3-worker AI stack. Do NOT build new infrastructure. Each item = a feature on top of what already runs.

## 1. Existing AI stack (verified)

| Component | Evidence | Capability today |
|---|---|---|
| `jgcareer-ai` worker | `ai-app/`, `wrangler.jsonc` (service binding `AI` → `jgcareer-ai`) | routed AI model calls, model alias handling |
| `chat-worker` | `chat-worker/` (own `wrangler.jsonc`) | OpenRouter + DeepSeek free-model failover, web chat brain `/api/chat/web`, 50-message history, Bengali fast-lane |
| `wa-relay` | `wa-relay/` | WhatsApp outbound relay (templates + queue) |
| Automation engine | `src/app/api/company/automation/route.ts` | browse_abandon, checkout_abandon, inactive_14d/30d, churn_risk → notify + WhatsApp |
| Personalization | `src/app/api/personalize/*`, `track/score` | behavior scoring, insights |
| Content source | `extracted-texts/` | corpus for AI content generation |

## 2. Opportunity matrix (single-founder, all reuse-based)

| # | AI Opportunity | Reuses | Effort | Impact | Priority |
|---|---|---|---|---|---|
| A1 | **AI WhatsApp follow-up copy** — replace static automation messages with AI-personalized copy (based on user events) | automation route + chat-worker brain + wa-relay | 6h | High (retention + recovery) | HIGH |
| A2 | **Career AI Coach** (free tier) — chat widget already exists (`components/chat/ChatWidget.tsx`); productize as "ক্যারিয়ার AI কোচ" upsell prompt | chat-worker brain, ChatWidget | 4h | High (differentiator, authority) | HIGH |
| A3 | **AI content factory** — weekly batch of 10 Shorts scripts + 7 Telegram posts from `extracted-texts/` + course catalog | chat-worker brain | 3h | High (distribution engine) | HIGH |
| A4 | **AI recommendations** — "আপনার জন্য বাছাই" on homepage/dashboard using `track/score` + behavior | `api/recommendations`, personalize endpoints | 5h | Medium (cross-sell) | MEDIUM |
| A5 | **AI lead scoring** — score contacts from phonebook capture (`track/phonebook`) by likelihood to join/buy | behavior scores + events | 6h | Medium (seeding priority) | MEDIUM |
| A6 | **AI churn save** — when churn_risk fires, generate a personalized re-engage offer | automation + brain | 4h | Medium | MEDIUM |
| A7 | **AI upsell message** — post-purchase, suggest next pack via WhatsApp | automation + wa-relay | 4h | Medium (AOV) | MEDIUM |

**Execution order:** A3 (content, Day 7) → A1 (Day 14) → A2 (Day 21) → A4/A5/A6/A7 (Day 30–60).

## 3. Architecture note (keep it simple)

```
Next.js app ──service binding──► jgcareer-ai ──► chat-worker brain (OpenRouter/DeepSeek free)
      ▲                                 │
      └───────── API routes (personalize/automation/chat) ──► wa-relay ──► WhatsApp
```

All new AI features are just new **prompt templates + routing** in existing workers — no new deploy target.

> **Needs Manual Verification:** which exact model aliases are provisioned in the `ai_api_keys` D1 table (`bbe84bc`); whether `chat-worker` is reachable from `jgcareer-ai` in prod (worker-to-worker fetch fixed in `6d4cbfe`).

## Bangla — AI সুযোগ (Owner's summary)

**আপনার AI সিস্টেম ইতিমধ্যেই চালু আছে** — ৩টি worker: `jgcareer-ai` (মূল AI), `chat-worker` (মুক্ত মডেল DeepSeek/OpenRouter), `wa-relay` (WhatsApp পাঠানো)। তাই নতুন AI-তে টাকা নয় — **বিদ্যমান worker-এ নতুন কাজ বসানো মাত্র**।

**সবচেয়ে দামি ৩টি:** (A3) AI দিয়ে সপ্তাহে ১০টি শর্ট-স্ক্রিপ্ট + ৭টি টেলিগ্রাম পোস্ট — আপনার কনটেন্ট ফানেলের জ্বালানি; (A1) অটোমেশনের বার্তা এখন AI ব্যক্তিগত করবে — অ্যাব্যান্ডনড-কার্ট/চর্ন ইউজারকে ফেরানো; (A2) "ক্যারিয়ার AI কোচ" — চ্যাট উইজেট আছে, একে আলাদা ফিচার হিসেবে তুলে ধরলে কর্তৃত্ব + বিক্রি দুটোই।

**Priority: High** · **Effort:** ~৩২ ঘণ্টা (সবগুলো) | **প্রত্যাশিত ফলাফল:** রিকভারি ২×, কনটেন্ট কস্ট ~৫০% কম, ক্যারিয়ার-কোচ ফিচারকে বিক্রয়-পয়েন্ট।

## Cross-references
- Automation engine detail: `03_CONVERSION_FUNNEL.md`
- Feature specs: `06_NEW_FEATURE_PROPOSALS.md`
- Roadmap: `07_ROADMAP_TODAY_7_30_90_FUTURE.md`
