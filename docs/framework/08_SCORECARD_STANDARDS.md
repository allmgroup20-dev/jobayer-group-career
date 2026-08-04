# 08 — Scorecard Standards (Framework)

> Consistent, comparable, evidence-tied scoring.

## 8.1 Scale
- Every domain scored **/100**.
- Each domain score must be derivable from its findings (list the supporting finding IDs).
- Evidence class cap: a domain whose critical items are ⏱/🏭 unverified cannot exceed the evidence-adjusted ceiling.

## 8.2 Domain Set (default)
`Security & AuthN/Z | Payments | Database Integrity | WhatsApp/Messaging | Business Model | Growth/Viral | AI Stack | UX/SEO/Perf/A11y | Operations/CI-CD`
(optional additional: Privacy, Governance completeness)

## 8.3 Weighting
- Overall = weighted mean. Default weights (business-first): Security 20% · Payments 15% · DB 10% · WhatsApp 10% · Business 10% · Growth 10% · AI 10% · UX/SEO/Perf 10% · Ops 5%.
- Weights configurable per project; record the chosen weights in the certification.

## 8.4 Thresholds (tie to Decision Framework §6.4)
| Score | Meaning |
|---|---|
| ≥ 85 | Launch-ready (with runtime evidence) |
| 70–84 | Launch-ready after minor fixes |
| < 70 | Not ready |

## 8.5 Rules
- Interim scorecards are labeled "interim (static)" and finalized only after runtime PASS.
- A re-certification must show the previous score, new score, and the evidence delta.
- Governance completeness (the 5 components) is scored and reported alongside the domains.
