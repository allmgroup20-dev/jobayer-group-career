# 27 — Operations, CI/CD & Reliability Audit (Phase 2)

## 27.1 Deployment Topology
| Service | Host | Config | Notes |
|---|---|---|---|
| Main app | Cloudflare Workers | `wrangler.jsonc` + OpenNext | cron `*/5`, D1, KV, AI binding |
| ai-app | Cloudflare Workers | `ai-app/wrangler.jsonc` | same D1/KV |
| chat-worker | Cloudflare Workers | `chat-worker/wrangler.jsonc` | D1, `BRAIN_API_URL` |
| wa-relay | Railway (Docker) | `wa-relay/{Dockerfile,railway.json,index.mjs}` | Baileys; AUTH_BASE64 backup |

## 27.2 CI/CD (`.github/workflows`)
| Workflow | Triggers | Issue |
|---|---|---|
| `deploy.yml` | push main + dispatch | **Secrets steps disabled `if:false` (`:32`,`:46`)** → prod secrets unprovisioned (H5). Also build+deploy only main — no staging/env separation. |
| `deploy-ai.yml` | push main | Verify it provisions ai secrets (OPENROUTER etc.) — ⏱ |
| `deploy-chat.yml` | push main | Verify chat secrets — ⏱ |

**Findings:**
- **O1 — Secrets not provisioned (Critical):** production will run with no `JWT_SECRET`, `WHATSAPP_*`, `SSLCOMMERZ_*`, `OPENROUTER_API_KEY` unless configured. → P0. **Resolved this session (H5):** `deploy.yml` now passes every secret via `env:` with `[ -n "$VAR" ]` shell guards (no `secrets` in `if:`, which GitHub Actions rejects — was the cause of "Invalid workflow file" on lines 32/46). Steps run only when the GitHub secret is set.
- **O5 — Workflow parse failure (was breaking all deploys):** `if: ${{ secrets.JWT_SECRET != '' }}` in `deploy.yml:32,46` → GitHub Actions rejects `secrets` inside `if:`. **Fixed this session:** removed `if:` conditions; secrets now flow via `env:` + shell guards (mirrors `deploy-ai.yml`). YAML validated locally ✅.
- **O2 — No environment separation:** single `main` → prod; risky for the "test-mode" era. Recommend a staging worker (P2).
- **O3 — Build gate:** `npm run build && opennextjs deploy` — running `tsc --noEmit` first is recommended; WIP (uncommitted sprint-A) had to compile before deploy (blocked: `tsconfig.tsbuildinfo` dirty). **Resolved this session:** tree compiles clean (tsc ✅, build ✅) with WIP cleanup committed (`22f0b6d`); `tsconfig.tsbuildinfo` remains tracked churn → recommend adding to `.gitignore`.
- **O4 — Cron `*/5`:** automation cadence on all 3 workers — verify no duplicate automation execution (main + ai-app both bound to same D1) (⏱).

## 27.3 Reliability & Monitoring
- Health: `health`, `system/health`, `diagnose`, wa-relay `/health` ✅.
- Logs: `system/logs`, `system/reports`, `wa-relay /logs` (leak risk H2) ✅/⚠.
- **Gaps:** no alerting (e.g., outage → Telegram) wiring verified; no backup/restore for D1 confirmed (⏱); no cost-monitor for AI (A4).
- Keep-warm cron exists ✅.

## 27.4 Operational Runbook Needs (P1, single-founder)
1. Secret provisioning step (enable CI or documented `wrangler secret put` runbook).
2. D1 backup schedule (wrangler d1 export / Cloudflare backup).
3. Deployment runbook: build → `tsc --noEmit` → migrate → deploy → smoke (curl health + one IPN test).
4. WhatsApp number recovery runbook (AUTH_BASE64 backup exists — good; document restore + verify `/backup-auth` gated).
5. Rollback plan (git revert + redeploy; keep previous release tag).

## 27.5 Ops Scorecard (interim)
| Area | Score | Notes |
|---|---|---|
| CI/CD | 35/100 | secrets disabled, no staging |
| Secrets/Env | 35/100 | H5 |
| Monitoring | 55/100 | health+logs; no alerts |
| Backup/DR | 30/100 | unverified |
| Runbooks | 30/100 | missing |
| **Ops overall** | **40/100** | P0/P1 |
