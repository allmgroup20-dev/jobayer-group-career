# Part 02 — Project Knowledge Base (AIOS)

> Canonical AIOS Part 02 — the knowledge base every audit run MUST consult before starting.

## 2.1 Project Overview

- **Platform:** Jobayer Group Career Platform — an online career/course business.
- **Stack:** Node + Vite + React + TypeScript + Next.js, deployed via **Cloudflare Workers (OpenNext) + D1 (SQLite)**; PostgreSQL-compatible via Drizzle ORM; 18 D1 migrations; 65 tables; `sslcommerz` payments; `wa-relay` WhatsApp (Baileys) service on Railway/Docker; 3 Cloudflare workers (app, ai-app, chat-worker).
- **Repository layout:** `src/` (Next app), `ai-app/` (AI worker), `chat-worker/`, `wa-relay/`, `.github/workflows/`, `docs/` (framework + audit + strategy).

## 2.2 Business Context

- **Monetization model:** users purchase resources individually at **৳99 per purchase** — this is a **hard business constraint**, NOT a subscription. Resource-leakage risk means access control must be airtight.
- **Target market:** **18–35 year-old Bengali smartphone users**; mobile-first; Bengali content; payments via **bKash/Nagad (BDT)**.
- **Growth engines:** **referral program + WhatsApp automation** (approved templates only) are the core organic growth levers.
- **Trust requirement:** real-money platform — payment verification, refunds, account security, and honest UX are business-critical.

## 2.3 Goals

| Horizon | Goal |
|---|---|
| Short | Fix all P0/P1 audit blockers; ship a safe, working launch |
| Medium | Organic growth via referral + WhatsApp; reach a defensible viral loop; establish KPI dashboard |
| Long | Become a leading Bengali career-growth platform via AI-assisted learning + automation |

## 2.4 Constraints

1. **Single solo founder** — everything must be single-founder buildable.
2. **Free-first** — no paid tools or paid marketing; organic-only.
3. **Security-first** — money + user data involved; never compromise.
4. **৳ only** — never use another currency.
5. **Ethics** — real consent; no dark patterns; no spam (WhatsApp templates must be approved).
6. **Business-first** — Revenue / Trust / Growth / Automation are the highest-priority domains.

## 2.5 Operational Environment

| Concern | Detail |
|---|---|
| Runtime | Cloudflare Workers (OpenNext build) + D1 database + KV (CACHE) + cron (`*/5 * * * *`) |
| Payments | SSLCommerz (sandbox: `SSLCOMMERZ_IS_LIVE=false`) — IPN + validation must be server-side |
| Messaging | wa-relay (Baileys, Node, Docker on Railway) — template-based OTP/marketing only |
| AI | ai-app worker (57 routes) + chat-worker — user-facing AI features |
| CI/CD | 3 GitHub Actions workflows (deploy / deploy-ai / deploy-chat) + 3 wrangler configs |
| Secrets | `.dev.vars` / wrangler secrets / GitHub Actions secrets — never committed |
