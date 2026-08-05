# Part 13 — AI Constitution (AIOS)

> Canonical AIOS Part 13 — governance, quality control, and the decision framework.
> Folds the former `01_AIOS_CONSTITUTION` amendment process + `06_DECISION_FRAMEWORK` + `09_VERSION_HISTORY`.

## 13.1 Constitutional Supremacy

- This constitution is the **highest-order authority** in the AIOS. Nothing below it may violate it.
- On any conflict between implementation (`docs/audit/`) and canonical framework (`docs/framework/`), the **canonical AIOS takes precedence**.

## 13.2 Quality Control (QC) Gates

1. **Truth gate:** no hallucinated claims; every claim evidence-classed (Part 04 §4.3); unprovable ⇒ "Needs Manual Verification".
2. **Governance gate:** certification valid only when ALL of:
   - Coverage Matrix present and 100% (exclusions justified)
   - Assumption Register current (evidence-classed; none guessed)
   - Confidence Matrix current (no finding < 0.8 unflagged)
   - Contradiction Resolution Log current (no open contradictions)
   - Self-Review completed + PASS; Opportunity log updated
   - Runtime & production evidence present for all P0/P1 features
3. **Business-first priority:** Revenue / Trust / Growth / Automation dominate triage.
4. **Security-first:** any security regression re-opens certification review.

## 13.3 Decision Framework (folded from former `06_DECISION_FRAMEWORK`)

| Condition | Decision |
|---|---|
| Any Critical unfixed | 🚨 DO NOT LAUNCH |
| All Critical fixed; any High unfixed | ❌ NOT READY |
| All Critical+High fixed; runtime ⏱/🏭 pending | ⚠ READY AFTER FIXES (conditional) |
| All Critical+High fixed AND every ⏱/🏭 test PASSES | ✅ READY FOR LAUNCH |

Re-certification trigger: all P0+P1 merged & deployed AND every ⏱/🏭 row PASSES with retained evidence → stamp ✅ with scorecard ≥ 70.

## 13.4 Amendment Process & Version History

1. Propose change with rationale + impact on existing parts.
2. Bump minor version (breaking = major).
3. Record in the table below with date + approver (founder).
4. Cross-link updated parts in `INDEX.md` and refresh the traceability matrix.

| Version | Date | Change | Rationale / Approver |
|---|---|---|---|
| 1.0 | 2026-08-04 | Initial AIOS Enterprise Governance Framework ratified (Constitution + 8 standards + decision/coverage/scorecard; 5 mandatory governance components) | Founder-approved |
| 2.0 | 2026-08-05 | Two-layer realignment: canonical 13-part AIOS mirrored verbatim in `docs/framework/` (Parts 01–13); standards folded into governing parts; traceability matrix introduced; implementation moved to `docs/audit/` | Founder-approved (Phase A directive) |

## 13.5 Living-Document Rule

This constitution changes only via §13.4. No audit report, implementation doc, or automated action may override it without an amendment.
