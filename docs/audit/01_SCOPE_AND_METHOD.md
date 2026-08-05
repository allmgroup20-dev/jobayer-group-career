# 01 — Scope & Method (AIOS Audit Engine)

## 1.1 Mission
Produce a single, unified, evidence-based **Production & Launch Readiness Certification** for the Jobayer Group Career platform, following the JGC-AIOS 13-part operating framework. Output lives entirely under `docs/audit/` as one knowledge base (see `INDEX.md`).

## 1.2 In-Scope Inventory (verified present in repo)

| Category | Count | Location |
|---|---|---|
| App API routes | 146 (main) | `src/app/api/**/route.ts` |
| App pages | 97 (est.) | `src/app/**/page.tsx` |
| Components | 89+ | `src/components/**` |
| AI worker | 57 routes (ai-app) | `ai-app/` |
| Chat worker | 1 worker | `chat-worker/src/index.ts` |
| WhatsApp relay | 1 Node service | `wa-relay/` (Railway/Docker, Baileys) |
| D1 migrations | 18 | `drizzle/` + `src/lib/db/index.ts` |
| DB tables | 30+ | `src/lib/db/schema.ts` |
| CI/CD workflows | 3 | `.github/workflows/{deploy,deploy-ai,deploy-chat}.yml` |
| KV namespaces | 1 (CACHE) | `wrangler.jsonc:28` |
| Cron triggers | 1 (`*/5 * * * *`) | `wrangler.jsonc:8` |
| KPI/analytics routes | 12+ | `src/app/api/{track,kpi,personalize,maintenance}/*` |

> **WIP exclusion (per founder rule, AIOS Part 13 §13.1):** the uncommitted working-tree WIP (`src/app/api/affiliate/leaderboard/route.ts`, `src/app/api/company/automation/route.ts`, `src/app/api/unlocks/route.ts`, `src/app/courses/[id]/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/membership/page.tsx`, deleted `src/components/LaunchOfferTimer.tsx`, `tsconfig.tsbuildinfo`) is **experimental/cleanup-only** (diff = deletions/trimming, no production features). It is therefore **explicitly EXCLUDED from the audit scope**, and **this certification applies only to the committed repository state** (HEAD `2702ef9`). No ambiguous state is certified. See `43_…` §12.2 decision log.

## 1.3 Phasing (hybrid priority-first — per founder decision)

- **Phase 1 (DONE):** Rapid launch-blocker sweep. Only **Critical/High**. Interim Go/No-Go issued immediately. → `10_…`, `11_…`
- **Phase 2 (NEXT):** Repository-wide forensic. Every route/API/component/DB object/flow documented. → `20_…`–`30_…`
- **Phase 3 (FINAL):** Runtime verification checklist + final certification. Final Launch Decision **only after static AND runtime pass**. → `40_…`, `41_…`

## 1.4 Classification Rules (JGC-AIOS)

Each finding block:
```
SEVERITY:  Critical | High | Medium | Low | Informational
TITLE:
PROBLEM:   (আমাদের কী বলা হয়/কী আশা করা হয়)
EVIDENCE:  file:line + code quote
ROOT_CAUSE:
IMPACT:    (ব্যবহারকারী/ব্যবসায়/নিরাপত্তায় কী ক্ষতি)
PRIORITY:  P0 (blocker) | P1 (fix pre-launch) | P2 (30-day) | P3 (90-day) | P4 (later)
EFFORT:    S | M | L | XL
ROI:       High | Med | Low
VERIFY:    ✅ static-confirmed | ⏱ requires-runtime | 🏭 requires-production-validation
FIX_SUGGESTION: (প্রস্তাবিত সমাধান — single-founder buildable)
```

## 1.5 Truth & Ethics Policy
- No hallucinated claims. Unproven ⇒ "Needs Manual Verification" / "Runtime Verification Required".
- Business-first: anything that risks Revenue / Trust / Growth / Automation is High priority.
- Free-first & no manipulation: bot prevention, consent, honest UX. Any finding involving dark-pattern or spam is flagged.
- Currency: always **৳ (BDT)**.
- Every severity/score must be traceable to evidence in this folder.

## 1.6 Verification Tier Rules (3-way split)
1. **Verified by static code analysis** — proof from repo contents.
2. **Requires runtime verification** — exact test case in `40_RUNTIME_VERIFICATION.md` (steps, expected result, pass/fail criteria, evidence).
3. **Requires production validation** — needs live providers (SSLCommerz live, Meta template approval, real CWV, real traffic).

## 1.7 Delivery & Commit Policy
- All files under `docs/audit/` are **review drafts**. **No automatic commit/push.**
- After founder approves the full audit, exactly **one clean commit** will be prepared with a concise message + summary of all generated documents.
- **App source code will NOT be modified** unless the founder explicitly requests it.

## 1.8 Two-Layer Architecture & Mandatory Governance Components
This audit is built on the **canonical 13-part JGC-AIOS** (`docs/framework/INDEX.md`) — the immutable source of truth. The framework layer (Layer 1) defines *how to audit & certify*; this `docs/audit/` layer (Layer 2) holds *what was found* in THIS repository and explicitly references its governing AIOS part. Synchronization is maintained via [`docs/AIOS_TRACEABILITY_MATRIX.md`](../AIOS_TRACEABILITY_MATRIX.md) (bidirectional: every AIOS Part ↔ ≥1 audit document; every audit doc ↔ governing part). **On conflict, the canonical AIOS takes precedence** (Part 13 §13.1).

**Five mandatory governance components (per AIOS Part 04 §4.7) are implemented here as living documents:**
| # | Component config | Framework standard | Project implementation |
|---|---|---|---|
| 1 | Coverage Matrix (100% scope) | AIOS Part 04 §4.6 | `02_COVERAGE_MATRIX.md` |
| 2 | Assumption Register | AIOS Part 04 §4.3 | `03_ASSUMPTION_REGISTER.md` |
| 3 | Confidence Matrix | AIOS Part 04 §4.3 | `04_CONFIDENCE_MATRIX.md` |
| 4 | Contradiction Resolution Log | AIOS Part 13 §13.2 | `05_CONTRADICTION_RESOLUTION_LOG.md` |
| 5 | Self-Review + Opportunity Discovery | AIOS Part 13 §13.2 | `06_SELF_REVIEW_OPPORTUNITY_DISCOVERY.md` |

**Rule:** any new finding/assumption/contradiction/opportunity discovered during this or later phases must be registered in the relevant doc with evidence class (✅ static / ⏱ runtime / 🏭 prod / ❓ manual) + confidence + status before use. No assumption is ever recorded as fact — a guessed item is recorded as ❓.
- **Evidence classes:** AIOS Part 04 §4.3.
- **Decision & governance gate:** AIOS Part 13 §13.3 / §13.2.
