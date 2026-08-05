# Part 04 — Enterprise Technical Audit Engine (AIOS)

> Canonical AIOS Part 04. The audit layer's `20_…`–`30_…` documents implement this part.
> Folds the former `02_AUDIT_STANDARDS`, `03_EVIDENCE_STANDARDS`, `04_RUNTIME_VERIFICATION_STANDARDS`, `07_COVERAGE_STANDARDS`.

## 4.1 Audit Phasing (priority-first)

| Phase | Scope | Output |
|---|---|---|
| 0 — Recon | Repo state, git, configs, CI, deployment topology | Inventory + baseline |
| 1 — Rapid Blockers | Critical/High only | Interim Go/No-Go immediately (`10_…`, `11_…`) |
| 2 — Forensic | Every route/API/component/DB object/worker/flow | Domain reports + full inventory (`20_…`–`30_…`) |
| 3 — Certification | Runtime verification + final certification | `40_…`, `41_…` |

## 4.2 The Complete Repository Forensic (18 sub-audits)

Every run MUST cover each sub-audit; each sub-audit produces an evidence-backed section.

1. **File inventory** — every file classified; nothing unknown (glob/scan).
2. **Folder audit** — directory structure, orphaned folders, misplacement.
3. **Route audit** — every page route vs actual `src/app/**/page.tsx`.
4. **Component audit** — every component; unused/dead components flagged.
5. **API audit** — every `route.ts` (method, auth, validation, idempotency, error handling).
6. **Database audit** — schema, tables, constraints, indexes, migrations.
7. **Query audit** — SQL in code; N+1, missing indexes, unbounded scans, hot rows (D1).
8. **Cloudflare audit** — wrangler configs, KV, D1, cron, cache, R2.
9. **GitHub Actions audit** — workflows, secrets steps (`if: false`), env, triggers.
10. **Environment audit** — `.env`/`.dev.vars`/wrangler secrets; what is provisioned vs committed.
11. **Dependency audit** — package.json deps, versions, bloat, known vulnerabilities.
12. **Code quality audit** — TypeScript strictness, dead code, duplication, consistency.
13. **Error handling audit** — unhandled rejections, silent fails, user-visible errors.
14. **Logging audit** — what is logged (and what sensitive data must NOT be).
15. **Monitoring audit** — CWV, errors, uptime, alerting (present/absent).
16. **Technical debt audit** — TODOs, workarounds, legacy patterns.
17. **Scalability audit** — rate limits, concurrency, D1 limits, WhatsApp abuse surface.
18. **Documentation audit** — docs completeness against Part 12.

## 4.3 Evidence Rule (mandatory — from the former Evidence Standards)

### 4.3.1 Evidence Classes
| Class | Label | Meaning | Default confidence |
|---|---|---|---|
| Static | `✅ static-confirmed` | Proven from repo/code/config (`file:line`) | 0.95 |
| Runtime | `⏱ requires-runtime` | Needs a live deployed test | 0.50 (until tested) |
| Production | `🏭 requires-production-validation` | Needs real providers/load/data | 0.30 (until validated) |
| Manual | `❓ needs-manual-verification` | Evidence missing; must be recorded, never guessed | n/a (pending) |

### 4.3.2 Citation Rule
- Every claim uses a locator `path/to/file.ts:line` (or artifact in `docs/audit/evidence/`).
- Quote 1–4 lines of context; never paraphrase away the evidence.
- A claim without a locator is automatically ❓.

### 4.3.3 Confidence Scoring
- Each finding carries `Confidence ∈ [0.0, 1.0]`, based on class then ±0.1 for corroboration/contradiction risk.
- Domain confidence = weighted mean of its findings.
- **Gate:** anything with confidence < 0.8 must be flagged ❓ and cannot support a certification PASS.

### 4.3.4 Verification Lifecycle
`PENDING → VERIFIED → REVIEWING → VERIFIED | REFUTED`. Registers record status + last-reviewed date.

### 4.3.5 Prohibited Anti-Patterns
Inferred/assumed evidence; "probably works" without a test; using static proof for runtime claims; copying another project's verdict.

## 4.4 Classification & Finding-Block (mandatory — from the former Audit Standards)

Severity table is defined in Part 03 §3.3. Every finding uses this block:

```
SEVERITY / PRIORITY:  Critical|High|Medium|Low|Info   /   P0|P1|P2|P3|P4
TITLE:
PROBLEM:      (what is claimed vs what should be)
EVIDENCE:     file:line + short quote (or artifact)
ROOT_CAUSE:
IMPACT:       (business/security/user impact)
EFFORT / ROI: S|M|L|XL   /   High|Med|Low
VERIFY:       ✅ static-confirmed | ⏱ requires-runtime | 🏭 requires-production-validation | ❓ needs-manual-verification
FIX_SUGGESTION:
```

## 4.5 Runtime Verification Standards (from the former Runtime Standards)

### 4.5.1 Test-Case Row Template
`ID (RT-<NN>) | Tier (⏱/🏭) | Test | Preconditions | Steps | Expected | Pass criteria | Fail criteria | Evidence`

### 4.5.2 Mandatory Feature Coverage
Authentication/OTP · payments/IPN · WhatsApp templates · AI workflows · referral/commissions · notifications · background jobs (cron) · performance (CWV/load) · browser compatibility · privacy/consent · secrets/ops.

### 4.5.3 Rules
- Every ⏱ item must PASS before "READY AFTER FIXES"; every 🏭 item must PASS on the real production URL before "✅ READY FOR LAUNCH".
- A FAIL of any P0-related test immediately re-opens DO-NOT-LAUNCH.
- Evidence artifacts stored in `docs/audit/evidence/`.

## 4.6 Coverage Standards — 3-Layer 100% Scope (from the former Coverage Standards)

- **Layer 1 Executive:** coverage % per category (`Pages | API Routes | Components | DB Tables | Migrations | Workers | Configs | Scripts | Documentation`).
- **Layer 2 Domain:** coverage % per domain (`Authentication | Payments | AI | WhatsApp/Messaging | Referral/Affiliate | Security | Database | UX | SEO | Operations`).
- **Layer 3 Item-level:** every item classified with `Item | Category | Status (Audited/Partial/Gap/Excluded) | Evidence | Verification | Priority | Notes`.

Rules: `Gap` must be scheduled; `Excluded` requires written justification; unknown items must be discovered; coverage % = (Audited + Excluded-with-justification) / Total.

## 4.7 The 5 Mandatory Governance Components (every audit run)

1. **Coverage Matrix** (100% scope, §4.6) → `docs/audit/02_COVERAGE_MATRIX.md`
2. **Assumption Register** (every assumption evidence-classed; no guesses) → `docs/audit/03_ASSUMPTION_REGISTER.md`
3. **Confidence Matrix** (confidence + evidence class per finding) → `docs/audit/04_CONFIDENCE_MATRIX.md`
4. **Contradiction Resolution Log** (every internal inconsistency logged + resolved) → `docs/audit/05_CONTRADICTION_RESOLUTION_LOG.md`
5. **Self-Review + Opportunity Discovery** (mandatory closing review + living opportunity log) → `docs/audit/06_SELF_REVIEW_OPPORTUNITY_DISCOVERY.md`

## 4.8 Output Format & Final Technical Score

- Per-domain reports per Part 05–12 structure, each using the finding block §4.4.
- Full inventory catalog (every route/API/component/DB object/migration) → `docs/audit/30_FULL_INVENTORY.md`.
- **Final technical score** = weighted mean of technical sub-audits (per Part 03 scorecard rules), labeled interim until runtime PASS, reported in `docs/audit/41_…`.
