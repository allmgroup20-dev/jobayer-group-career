# 06 — Decision Framework (Framework)

> How a final launch certification decision is produced and gated. Applies to any project.

## 6.1 Decision Ladder
| Condition | Decision |
|---|---|
| Any Critical unfixed | **🚨 DO NOT LAUNCH** |
| All Critical fixed; any High unfixed | **❌ NOT READY** |
| All Critical+High fixed; runtime ⏱/🏭 pending | **⚠ READY AFTER FIXES (conditional)** |
| All Critical+High fixed AND every ⏱/🏭 test PASSES | **✅ READY FOR LAUNCH** |

## 6.2 Governance Gate (mandatory pre-certification)
A certification is only valid when **ALL** are true:
1. Coverage Matrix present and **100%** (no unclassified item; exclusions justified).
2. Assumption Register current (every entry evidence-classed; none guessed).
3. Confidence Matrix current (no finding below 0.8 without ❓ flag).
4. Contradiction Resolution Log current (open contradictions ≠ certified).
5. Self-Review completed + PASS; Opportunity Discovery log updated.
6. Runtime & production test evidence present for all P0/P1 features.

## 6.3 Re-Certification Trigger
Re-run certification when: all P0+P1 checklist items merged & deployed, AND every ⏱/🏭 row PASSES with retained evidence. Only then stamp ✅ with a scorecard ≥ 70/100.

## 6.4 Score Thresholds
| Score | Meaning |
|---|---|
| ≥ 85 | Launch-ready (with runtime evidence) |
| 70–84 | Launch-ready after minor fixes |
| < 70 | Not ready |
