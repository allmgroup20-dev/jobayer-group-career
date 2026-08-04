# 02 — Audit Standards (Framework)

> Defines the repeatable audit process. Project-agnostic; apply to any repository.

## 2.1 Phasing (priority-first)
1. **Phase 0 — Recon:** scope inventory, repo state (git), configs, CI, deployment topology. Output: inventory + baseline.
2. **Phase 1 — Rapid Blockers:** only Critical/High. Issue interim Go/No-Go **immediately**; never delay blockers to the end.
3. **Phase 2 — Forensic:** document every route/API/component/DB object/worker/flow with evidence. Output: domain reports + full inventory.
4. **Phase 3 — Certification:** runtime verification checklist + final certification. Final decision ONLY after static AND runtime pass.

## 2.2 Classification (Severity)
| Severity | Meaning | Timing |
|---|---|---|
| Critical | Direct financial loss / breach / total feature failure | Must fix pre-launch |
| High | Significant abuse, fraud, or major functional risk | Fix pre-scale |
| Medium | Correctness, robustness, minor abuse | Fix within 90d |
| Low | Polish / debt | Backlog |
| Informational | Observations, no action required | Log |

## 2.3 Finding-Block Template (mandatory)
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

## 2.4 Mandatory Governance Components (5) — every audit run
1. **Coverage Matrix** (`07_COVERAGE_STANDARDS.md`) — 100% scope verification, 3 layers.
2. **Assumption Register** — every assumption evidence-classed; no guesses.
3. **Confidence Matrix** — confidence score + evidence class per finding.
4. **Contradiction Resolution Log** — every internal inconsistency logged + resolved.
5. **Self-Review + Opportunity Discovery** — mandatory closing review + living opportunity log.

## 2.5 Deliverables (project layer)
`INDEX` (master nav) + `EXEC_SUMMARY` + scope/method + Phase-1 blockers + interim Go/No-Go + Phase-2 domain reports + full inventory + runtime verification + certification + the 5 governance docs.
