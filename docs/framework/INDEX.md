# 📘 AIOS — Enterprise Governance Framework (INDEX)

> **Project-agnostic, reusable.** This layer defines *how to audit & certify any repository*. It contains no project-specific evidence — see `docs/audit/` for the current project's findings.
> **Version:** 1.0 · **Status:** ✅ Ratified (founder-approved structure) · **Last reviewed:** 2026-08-04

---

## 🧭 Framework Map

| Doc | Purpose | Status |
|---|---|---|
| `01_AIOS_CONSTITUTION.md` | Principles: Truth Policy, ethics, founder constraints, value hierarchy | ✅ |
| `02_AUDIT_STANDARDS.md` | Audit process, phasing, classification rules, deliverables | ✅ |
| `03_EVIDENCE_STANDARDS.md` | Evidence classes, `file:line` rule, Confidence scoring | ✅ |
| `04_RUNTIME_VERIFICATION_STANDARDS.md` | Test-case template (steps/expected/pass-fail/evidence) | ✅ |
| `05_REPORTING_STANDARDS.md` | Report structure + finding-block template | ✅ |
| `06_DECISION_FRAMEWORK.md` | Launch-decision ladder + Governance gate | ✅ |
| `07_COVERAGE_STANDARDS.md` | 3-layer Coverage Matrix + exclusion rules | ✅ |
| `08_SCORECARD_STANDARDS.md` | Domain weighting, /100 scale, re-certification | ✅ |
| `09_VERSION_HISTORY.md` | Changelog | ✅ |

## 🔗 Cross-Links
- **Project audit** (evidence, scorecards, certification): [`docs/audit/INDEX.md`](../audit/INDEX.md)
- **Strategy/business context**: [`docs/strategy/`](../strategy/STRATEGY_REVIEW.md)

## 📜 Usage Contract
1. Every audit run **must** consult this framework before starting (Constitution + Standards).
2. Every finding **must** carry an Evidence Class (`03_EVIDENCE_STANDARDS.md`).
3. Every item of the repository **must** be classified in the Coverage Matrix (`07_COVERAGE_STANDARDS.md`).
4. No final certification is issued without the **Governance gate** (`06_DECISION_FRAMEWORK.md`).
5. Framework docs are living: update the relevant standard + `09_VERSION_HISTORY.md` when a rule changes.
