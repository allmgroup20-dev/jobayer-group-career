# 20 — Technical Audit (Phase 2)

## 20.1 Architecture
- **Stack:** Next.js (App Router) + OpenNext → Cloudflare Workers; D1 (SQLite) via Drizzle; KV (CACHE); cron `*/5`; 3 workers + 1 Railway Node service (see `30_FULL_INVENTORY.md`).
- **Runtime evidence:** `wrangler.jsonc:4-8` `main: .open-next/worker.js`, `nodejs_compat` + `global_fetch_strictly_public`, smart placement.
- **Assets:** OpenNext static assets served via `ASSETS` binding (`wrangler.jsonc:9-12`).

## 20.2 Strengths
- Clean route organization; domains (auth/payment/referral/track/company) clearly separated.
- Single shared DB access layer (`src/lib/db/queries.ts`) — parameterized SQL via D1 `bind()` (static-confirmed `queries.ts:2,13`).
- Dedicated AI worker + chat worker isolation; cron keep-warm present.
- Rich feature surface (65 tables, analytics, AI, marketing tools) far beyond a typical MVP.

## 20.3 Weaknesses / Risks (evidence-based)

| ID | Finding | Evidence | Priority |
|---|---|---|---|
| T1 | **Systemic missing auth layer on APIs** — routes trust client `workerId`; middleware excludes `/api` (detail in `21_SECURITY_AUDIT` C6) | `src/middleware.ts:52` | P0 |
| T2 | **Duplicate/parallel payment flows** (`payment/*` vs `resource-checkout/*`) each with their own IPN/success handling → inconsistent behavior, more attack surface, double-maintenance | `payment/ipn`, `resource-checkout/ipn` | P1 |
| T3 | **Unused/dead helpers:** `validateIPN` export never verifies hash (`sslcommerz.ts:151-157`); `computeAiPrice` always returns null (`payment/init/route.ts:7-9`) | see evidence | P2 |
| T4 | **Error handling inconsistent:** some routes swallow errors (`payment/ipn/route.ts:72` `catch {}`), others leak internal messages (`resource-checkout/ipn/route.ts:72` returns `error.message` to client) | `payment/ipn:72`, `resource-checkout/ipn:72` | P2 |
| T5 | **Non-atomic read-modify-write** patterns in several money/limit flows (unlock limits, payment status) — race-prone | `resource-checkout/ipn:51-62`, `resource-checkout/success:52-62` | P0 (see C5) |
| T6 | Client-visible internal info: `diagnose`, `db-check`, `seed`, `system/logs`, `maintenance/*` endpoints exist — check production exposure/authorization | route inventory `30.1` | P1 |
| T7 | 18 migrations + schema drift risk: `schema.ts` (857 lines) vs `migrations/*.sql` must be reconciled; local `local-d1.ts` is an in-memory emulator | `src/lib/db/index.ts` | P2 |

## 20.4 Scale Path (100 → 1,000 → 10,000+ concurrent)
- **Positive:** D1 + KV on Workers scale automatically; static assets CDN; OpenNext ISR-friendly.
- **Risks:**
  - No queue/batching for WhatsApp outbound at scale (wa-relay poller is single-node, 5s interval, in-memory state → single point of failure + no horizontal scaling for the WhatsApp connection). `wa-relay/index.mjs:496`
  - Heavy per-request DB fan-out in `track/*` (event/phonebook/session) — unverified write amplification; needs `tracking/monitor` runtime data (⏱).
  - `getSponsorUpline` walks the tree with N sequential queries (up to 10 levels) per order → O(levels) queries per paid order (`payment/ipn:84-106`) — acceptable at small scale, profile at scale.
- **Recommendation:** before scaling, instrument (wrangler metrics + `system/perf`), add rate limits, and move messaging to a durable queue.

## 20.5 Duplication & Tech-Debt Inventory
- `waLogs` vs `whatsappLog` tables; `sender.ts` vs `whatsapp/*` lib modules — consolidation candidates (P3).
- `company/*` pages mirror `company/*` API surface 1:1 (60 pages) — fine, but verify auth on each (Phase-2 security check).
- `local-d1.ts` in-memory DB only for dev/offline; must never be reachable in prod.

## 20.6 Open Questions (⏱ runtime)
- Real bundle size, D1 read amplification, KV hit-rate, cron `*/5` cost — from Cloudflare dashboards (⏱).
- `chat-worker` behavior under load; `ai-app` cold starts (⏱).
