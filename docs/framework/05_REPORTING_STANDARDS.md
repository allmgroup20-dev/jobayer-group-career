# 05 — Reporting Standards (Framework)

> Structure and rules for all audit reports and registers. Project-agnostic templates.

## 5.1 Report Types
1. **Executive Summary** (1 page) — verdict, top strengths/risks, score, next steps.
2. **Domain Audit Report** — findings per domain using `02_AUDIT_STANDARDS` finding-block; scorecard table; cross-links.
3. **Blocker Report** (Phase 1) — Critical/High only, evidence-first, immediately actionable.
4. **Go/No-Go Interim** — decision + conditions + evidence.
5. **Certification** — final exec summary, final scorecard, final decision, priority-fix checklist, governance gate.
6. **Governance Registers** — Coverage Matrix, Assumption Register, Confidence Matrix, Contradiction Log, Self-Review/Opportunity.

## 5.2 Writing Rules
- Findings first, commentary second. Evidence (file:line) directly under the claim.
- Every report carries: status line, scope, tier legend, cross-links, and "review draft / not committed" note until approved.
- Bengali + English mixing allowed for founder readability; technical terms in English.
- No claim is "Verified" unless an evidence class says so.

## 5.3 Cross-Linking (mandatory)
- Every `⏱/🏭` item links to the runtime test (ID `RT-<NN>`).
- Every P0/P1 links to its fix in the certification checklist.
- Every governance register entry links to its source finding.
- `INDEX.md` is the single navigation entry point for both layers.
