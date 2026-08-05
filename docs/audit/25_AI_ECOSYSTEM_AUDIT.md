# 25 — AI & WhatsApp Audit (Phase 2)

## 25.1 Architecture (3 runtimes + relay)
- **ai-app** (`jgcareer-ai`): ~58 routes (`ai/*`, `knowledge/*`, `whatsapp/*`, `telegram/webhook`, `messenger/webhook`) — D1 + KV, OpenRouter/DeepSeek free-model failover (`aiModelFailoverState`).
- **chat-worker** (`jgcareer-chat`): `src/{index,ai,d1,types,webhook}.ts`, D1-bound, `BRAIN_API_URL` var — web chat brain.
- **main app → AI**: service binding `AI` → `jgcareer-ai` (`wrangler.jsonc:34-38`); cron `*/5` automation.
- **wa-relay**: Baileys (unofficial) WhatsApp-Web client on Railway — **primary OTP + messaging path risk** (H3).

## 25.2 WhatsApp Findings (evidence-based)
| ID | Finding | Evidence | Severity |
|---|---|---|---|
| W1 | **Free-form text via Meta Cloud API** — business-initiated messages without approved template → Meta rejects (131047); OTP to new users fails | `sender.ts:29-34`, `otp/send:27-28` | 🔴 C8 |
| W2 | **wa-relay unofficial (Baileys)** → ToS violation, number-ban risk; single-node, in-memory queue | `wa-relay/index.mjs:1`, `:496` | 🟠 H3 |
| W3 | **No explicit opt-in/consent record** before outbound (only implicit registration) | no consent-write in send paths; `privacyConsent` table unused for messaging | 🟠 High |
| W4 | Public `/qr` + `/logs` on relay → number hijack + message-log leak | `wa-relay/index.mjs:397-401` | 🟠 H2 |
| W5 | wa-relay ↔ app queue/webhook appear unauthenticated | `wa-relay/index.mjs:195,259,272`; **app-side confirmed unauthenticated** `whatsapp/send` (`send/route.ts:6-43`) and `whatsapp/queue` (`queue/route.ts:36-67`) | 🔴 Critical (upgraded, static-confirmed) |
| W6 | Automation targets (browse_abandon / checkout_abandon / inactive / churn) send WhatsApp + notifications — every send depends on W1/W2 compliance | `src/app/api/company/automation` (WIP), `ai-app/whatsapp/*` | 🔴 C8-dependent |

## 25.3 AI Findings
| ID | Finding | Evidence | Severity |
|---|---|---|---|
| A1 | **Cost/abuse control:** no visible per-user rate limit / token budget on AI endpoints; cron automation every 5 min could rack costs | `wrangler.jsonc:8`; `ai-app/ai/*` | 🟠 High (⏱ confirm limits) |
| A2 | **Prompt-injection surface:** user text flows into chat/brain (`chat/web`, `knowledge/entries`, `agentMemory`, `conversationLearnings`); need system-prompt hygiene + output sanitization review (⏱ deep) | `chat-worker/src/*`, `ai-app` | 🟠 Med–High |
| A3 | **Model/key management:** `aiModels`, `aiApiKeys`, `aiModelFailoverState` present — verify failover actually used and API keys are server-only secrets (H5 CI disabled) | `ai-app/wrangler.jsonc` (no secrets listed), `deploy-ai.yml` | 🟠 Med |
| A4 | **Observability:** `aiLog`, `brainUsage`, `system/logs` exist — no runtime cost dashboards confirmed (⏱) | `30.4`, `30.6` | 🟡 Med |
| A5 | **Knowledge/AI ethics:** `persuasion/apply`, `psychology/*` features — ensure no manipulative dark-pattern usage (AIOS ethics) | `ai/persuasion/apply`, `company/employee-persuasion` | 🟡 Med (policy) |

## 25.4 Recommended Architecture (single-founder, free-first)
1. **Phase-A (blockers):** switch outbound messaging to **Meta approved templates** (OTP template + notification templates) via `sender.ts`; keep Baileys relay **disabled/removed** from any user-facing flow until ToS risk is accepted by founder. Authenticate `/api/whatsapp/*` and relay endpoints; remove public `/qr`,`/logs`.
2. **Phase-B (cost):** per-account AI quota + budget cap; consolidate failover; add KV rate-limit on AI endpoints.
3. **Phase-C (scale):** durable queue for WhatsApp; horizontal relay; consent table wiring.

## 25.5 Scorecard (interim)
| Area | Score | Notes |
|---|---|---|
| WhatsApp delivery compliance | 25/100 | C8/W1–W4 |
| Messaging auth | 35/100 | W5 |
| AI capability | 70/100 | rich surface |
| AI cost/abuse control | 35/100 | A1/A3 |
| Consent/ethics | 40/100 | W3/A5 |
| **AI/WhatsApp overall** | **40/100** | P0-gated |

---

## 25.6 Automation Engine — 25 Automations (AIOS Part 07 · AI AUTOMATION ENGINE)

> Each: purpose → status (done/partial/planned/blocked) → priority → single-founder effort → note.

| ID | Automation | Status | Priority | Effort | Note |
|---|---|---|---|---|---|
| AU-01 | OTP via WhatsApp template | 🔴 blocked (C8) | P0 | M | template-based only (W1) |
| AU-02 | Order confirmation + receipt (WA) | partial | P1 | S | template + consent (W3) |
| AU-03 | Refund flow on failed validation | 🔴 blocked (C1–C5) | P0 | M | idempotent |
| AU-04 | Referral notification (both sides) | partial | P1 | S | post-payment-verify |
| AU-05 | Share-reward daily quota grant | done | P2 | S | per-phone (V2) |
| AU-06 | Payment reconciliation (IPN→grant) | 🔴 blocked (C1) | P0 | M | server-side verify |
| AU-07 | Cron keep-warm (`*/5`) | done | P2 | S | `wrangler.jsonc:8` |
| AU-08 | Browse-abandon retarget (WA) | partial | P1 | S | template + consent (W6) |
| AU-09 | Checkout-abandon retarget (WA) | partial | P1 | S | template + consent |
| AU-10 | Inactive-user reactivation (WA) | partial | P1 | S | template + consent |
| AU-11 | Churn-risk alert to founder | partial | P1 | S | Telegram/KPI |
| AU-12 | KPI digest (weekly) | planned | P2 | S | from `company/kpi` |
| AU-13 | Auto-payout of withdrawals | 🔴 blocked (C7/21.8c) | P0 | M | auth + reservation |
| AU-14 | Commission distribution (tree) | 🔴 blocked (C1) | P0 | M | post-verified payment |
| AU-15 | Member expiry/premium downgrade | planned | P2 | M | membership tiers |
| AU-16 | Resource-unlock enforcement | 🔴 blocked (C3/C4) | P0 | M | server-side |
| AU-17 | Daily free tip push (WA template) | planned | P3 | S | consent + template |
| AU-18 | Phonebook-sync consent flow | partial | P1 | M | privacy (21.7) |
| AU-19 | Wa-relay session auto-reconnect | done | P2 | M | Baileys AUTH_BASE64 |
| AU-20 | AI-model failover | partial | P2 | M | free-model fallback |
| AU-21 | Auto-cleanup maintenance job | done | P2 | S | `maintenance/auto-cleanup` |
| AU-22 | User data export (privacy) | done | P2 | S | `privacy/export-data` |
| AU-23 | User data deletion (privacy) | done | P2 | S | `privacy/delete-data` |
| AU-24 | Support auto-responder (FAQ, AI) | planned | P2 | M | safe-guarded AI |
| AU-25 | Monthly experiment review report | planned | P2 | S | Part 11 cadence |

## 25.7 AI Features — 25 (AIOS Part 07 · AI SCORECARD / AI AUTOMATION ENGINE)

| ID | Feature | Status | Priority | Effort | Note |
|---|---|---|---|---|---|
| AI-01 | Chat-worker web Q&A brain | done | P1 | M | `chat-worker` |
| AI-02 | AI career/resume assistant | planned | P2 | M | Bengali-first |
| AI-03 | Personalized learning-path generator | planned | P2 | M | from progress |
| AI-04 | Quiz/assessment generator | planned | P2 | M | content AI |
| AI-05 | Resource recommendation engine | planned | P2 | M | history-based (EXP-27) |
| AI-06 | Bengali study planner (streaks) | planned | P2 | M | retention |
| AI-07 | AI tutor (topic deep-dive) | planned | P2 | L | cost-capped |
| AI-08 | Exam-mock auto-scorer | planned | P2 | M | answer parsing |
| AI-09 | Voice-to-text note (Bengali) | planned | P3 | L | free-first constraint |
| AI-10 | Skill-gap analysis (profile) | planned | P2 | M | honest output |
| AI-11 | Mock interview (WA chat) | planned | P2 | M | template chat |
| AI-12 | Daily vocab/flashcard AI | planned | P3 | S | retention |
| AI-13 | Career-psychology profiling | done | P3 | M | ethics-gated (A5) |
| AI-14 | Persuasion-analysis (marketing) | done | P3 | M | **no manipulation** (A5) |
| AI-15 | Funnel psychology scoring | done | P3 | M | company tool |
| AI-16 | AI content tagger/metadata | planned | P3 | M | SEO |
| AI-17 | AI translation (EN↔BN) of resources | planned | P2 | M | content value |
| AI-18 | AI summary of course material | planned | P2 | S | extraction |
| AI-19 | Lead scoring from WA chat | planned | P2 | M | conversion |
| AI-20 | Smart FAQ from knowledge base | done | P2 | M | `knowledge/entries` |
| AI-21 | AI note summarizer | planned | P3 | S | — |
| AI-22 | AI-generated practice papers | planned | P3 | L | cost-capped |
| AI-23 | WhatsApp AI career line | partial | P2 | M | template + consent |
| AI-24 | Teacher/admin AI copilot | planned | P3 | M | internal |
| AI-25 | AI observability/cost dashboard | planned | P2 | M | A4 closure |

### Inventory status
- Automations: **25/25 defined** (7 🔴 blocked by P0) · AI features: **25/25 defined** (majority planned).
- Every AI feature maps to a business outcome (Revenue/Trust/Growth/Automation/Retention) per AIOS Part 07 · AI BUSINESS VALUE; none relied on to ship launch.
