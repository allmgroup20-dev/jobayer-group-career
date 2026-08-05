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
| T1 | **Systemic missing auth layer on APIs** — routes trust client `workerId`; middleware excludes `/api` (detail in `21_SECURITY_PRIVACY_TRUST_AUDIT` C6) | `src/middleware.ts:52` | P0 |
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

---

## 20.7 Extended Forensic Sub-Audits (AIOS Part 04 · REPOSITORY DISCOVERY–SCALABILITY — Phase 2.5)

> The 18-sub-audit engine (AIOS Part 04 · REPOSITORY DISCOVERY–SCALABILITY) requires the following additional deep dives. Items 1–6 of the engine are covered by `20.1–20.5` + `22_DATABASE_AUDIT` + `27_OPS_CICD_AUDIT`; the 8 below are newly added with static evidence. All unmeasured items are explicitly ⏱/🏭, never guessed.

### 20.7.1 Sub-Audit #7 — Query Audit (`db.prepare` SQL)
- **Evidence:** 428 `db.prepare(` call sites across `src/` (static scan); 125 `LIMIT` usages, 145 `ORDER BY` usages.
- **Findings:**
  - Q1 🟠 High: `getSponsorUpline` performs up to N sequential queries (one per tree level, ≤10) per paid order → O(depth) D1 reads per order (`src/app/api/payment/ipn/route.ts:84-106`). Acceptable at MVP, **must profile at scale** (⏱).
  - Q2 🟠 High: `track/*` event/phonebook/session fan-out — 40 track-related write call sites; **write amplification unmeasured** (⏱ needs dashboard data). Potential D1 write-limit risk at 10× users.
  - Q3 🟡 Medium: raw SQL string assembly present in shared query layer; parameterized via D1 `bind()` at call sites (positive), but some dynamic `ORDER BY`/`LIMIT` string interpolation risks SQL-injection surface — audit each (see `21_…` injection section).
  - Q4 🔵 Low: no query plan/monitoring instrumentation (`EXPLAIN QUERY PLAN`) — D1 index-usage unverified (⏱).
- **Score (interim, static):** **60/100** — parameterized core (positive) but unbounded tree walk + unmeasured write fan-out.

### 20.7.2 Sub-Audit #11 — Dependency Audit
- **Evidence:** `package.json` — deps: `next 16.2.6`, `react/react-dom 19`, `drizzle-orm 0.38`, `zustand 5`, `clsx`, `tailwind-merge`, `react-hot-toast`; dev: `wrangler 4.118`, `drizzle-kit 0.30`, `typescript 5.7`, `opennextjs/cloudflare 1.0`, `tailwindcss 4`. `wa-relay`: `@whiskeysockets/baileys 7.0.0-rc13`, `pino 8`, `ws 8.16`. `chat-worker`: no deps.
- **Findings:**
  - D1 🟡 Medium: **Baileys `7.0.0-rc13` is a release candidate** on a WhatsApp-scraping library — high churn/ban-risk; pin exact version + monitor upstream breaking changes (verified `wa-relay/package.json`).
  - D2 🔵 Low: minimal dependency footprint (good) — small attack surface; keep `npm audit` in CI (not currently present — see `27_…`).
  - D3 🔵 Low: no lockfile checksum/`osv-scanner` gate in CI; manual verification of CVE status (⏱ run `npm audit` before launch).
- **Score (interim, static):** **80/100**.

### 20.7.3 Sub-Audit #12 — Code Quality
- **Evidence:** 406 TS/TSX files; TypeScript `^5.7`; 25 `TODO|FIXME|HACK` markers; `tsconfig.tsbuildinfo` tracked in git (build artifact — should be gitignored).
- **Findings:**
  - CQ1 🔵 Low: 25 TODO/FIXME markers scattered (list in `30_FULL_INVENTORY` extension) — schedule P3.
  - CQ2 🟡 Medium: `tsconfig.tsbuildinfo` is committed (currently modified in working tree) — noise in PRs; add to `.gitignore`.
  - CQ3 🟠 High: **duplicate parallel payment flows** (`payment/*` vs `resource-checkout/*`) → divergent behavior + double attack surface (T2, `20.3`). Consolidation = P1.
  - CQ4 🔵 Low: good strict typing surface overall; single shared DB layer (positive).
- **Score (interim, static):** **72/100**.

### 20.7.4 Sub-Audit #13 — Error Handling
- **Evidence:** **197 empty `catch {}` blocks** across `src/` (static scan) — e.g. `src/app/api/auth/me/route.ts:21`, `src/app/api/payment/ipn/route.ts:72`, `src/app/api/track/analytics/route.ts:101`, `src/app/api/withdrawals/route.ts:86`, `src/app/api/maintenance/auto-cleanup/route.ts:28`.
- **Findings:**
  - EH1 🔴 Critical (part of C5/C2): silent swallow in money paths hides forged/failed payment outcomes → leads to wrong grant/refund state (`payment/ipn/route.ts:72`).
  - EH2 🟠 High: inconsistent leak — `resource-checkout/ipn/route.ts:72` returns `error.message` to client (info disclosure) while others swallow silently.
  - EH3 🟡 Medium: no global error boundary / typed error envelope for API routes; every route handles errors ad hoc.
- **Score (interim, static):** **45/100** — swallow-heavy, leaky, inconsistent.

### 20.7.5 Sub-Audit #14 — Logging
- **Evidence:** 85 `console.*` call sites; examples: `src/middleware.ts:37` (JWT_SECRET not configured), `src/app/api/auth/register/route.ts:100`, `src/app/api/cron/keepwarm/route.ts:67`. No structured logger in app (wa-relay uses `pino`).
- **Findings:**
  - LG1 🟠 High: **no structured/centralized logging** in app — `console.error` only; production debuggability weak; no log retention strategy.
  - LG2 🟡 Medium: PII risk — ensure account numbers, phone numbers, payment payloads are never logged (currently unverified; audit before launch, ❓).
  - LG3 🔵 Low: `wa-relay` uses `pino` (positive) but logs to stdout only (container ephemeral).
- **Score (interim, static):** **50/100**.

### 20.7.6 Sub-Audit #15 — Monitoring
- **Evidence:** `wrangler.jsonc` contains **no `observability`/logpush/metrics config** (grep found none). Endpoints `system/perf`, `system/logs`, `tracking/monitor`, `diagnose`, `health` exist (`30.1`).
- **Findings:**
  - MN1 🔴 Critical (part of H5/ops): **no monitoring/alerting configured** in wrangler or CI — launch would be blind to errors/CWV/uptime. See `27_OPS_CICD_AUDIT` O-category.
  - MN2 🟠 High: `system/logs` + `diagnose` endpoints present with **no visible auth/allowlist** (`system/logs/route.ts:73` only reads user-agent) — production exposure must be closed (P1, also `20.3` T6).
  - MN3 🟡 Medium: no error-tracking service (free-first: Cloudflare analytics / wrangler tail acceptable).
- **Score (interim, static):** **30/100**.

### 20.7.7 Sub-Audit #16 — Technical Debt
- **Findings (from 20.5 + new):**
  - TD1 🟡 Medium: `waLogs` vs `whatsappLog` duplication; `sender.ts` vs `whatsapp/*` overlap (P3).
  - TD2 🟠 High: parallel payment flows + dead `validateIPN` (never verifies) + dead `computeAiPrice` (returns null) (T3).
  - TD3 🟡 Medium: 18 migrations + 857-line `schema.ts` drift risk (T7).
  - TD4 🟡 Medium: in-memory `local-d1.ts` dev DB — must never ship.
- **Score (interim, static):** **58/100**.

### 20.7.8 Sub-Audit #17 — Scalability
- Covered in depth at `20.4`; additional static evidence:
  - SC1 🟠 High: wa-relay is single-node, in-memory WhatsApp session, 5s poller (`wa-relay/index.mjs:496`) → **single point of failure + no horizontal scaling**; needs durable queue + session persistence (P1/P2).
  - SC2 🟡 Medium: D1 per-request fan-out in `track/*` (Q2) — D1 write limits at scale (⏱).
  - SC3 🔵 Low: Workers scale horizontally automatically; static assets on CDN (positive).
- **Score (interim, static):** **55/100**.

### 20.7.9 Forensic Technical Score (interim — static only)
Sub-audits with scores: Query 60 · Dependencies 80 · Code Quality 72 · Error Handling 45 · Logging 50 · Monitoring 30 · Tech Debt 58 · Scalability 55. Weighted (query 20%, deps 10%, code quality 15%, error handling 15%, logging 10%, monitoring 15%, tech debt 5%, scalability 10%): **52.7/100 (interim, static)** — final value requires runtime/production tiers (⏱/🏭) per AIOS Part 03 · FINAL CERTIFICATION.
