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
