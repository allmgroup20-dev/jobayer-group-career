# Part 10 — Executive Decision Engine (AIOS)

> Canonical AIOS Part 10. The audit layer's `00_EXECUTIVE_SUMMARY.md`, `40_MASTER_SCORECARD.md`, `41_FINAL_CERTIFICATION.md` implement this part.
> Folds the former `05_REPORTING_STANDARDS` and the decision content of `06_DECISION_FRAMEWORK`.

## 10.1 Master Scorecard — 16 Domains

| # | Domain | Default weight |
|---|---|---|
| 1 | Technical | 5% |
| 2 | Security | 20% |
| 3 | Payments | 15% |
| 4 | Database Integrity | 10% |
| 5 | WhatsApp/Messaging | 10% |
| 6 | Business Model | 10% |
| 7 | Growth/Viral | 10% |
| 8 | AI Ecosystem | 10% |
| 9 | UX | 5% |
| 10 | SEO | 3% |
| 11 | Performance | 2% |
| 12 | Accessibility | 2% |
| 13 | Ops/CI-CD | 5% |
| 14 | Privacy | 3% |
| 15 | Trust | 2% |
| 16 | Compliance | 3% |

Overall = weighted mean; every domain /100 with supporting finding IDs (Part 03 §3.5).

## 10.2 Final Certification Output

- Final executive summary (1 page): verdict, top strengths/risks, score, next steps.
- Final scorecard (16 domains + overall).
- Final launch decision (Part 03 §3.6) with certification level (Part 03 §3.1).
- Priority-fix checklist (P0 → P1 → P2).
- Governance gate result (Part 13 §13.3).

## 10.3 KPI Framework

- Business KPIs: revenue (৳), purchases, refund rate, conversion, CAC (referral cost), LTV, K-factor, activation, retention (D1/D7/D30), WA deliverability, refund/chargeback rate.
- Product/tech KPIs: CWV, error rate, API latency, uptime, unlock success rate.
- All KPIs tied to source routes/artifacts (e.g., `src/app/api/company/kpi/route.ts`) and to the founder dashboard.

## 10.4 Founder Dashboard

- One-page operational view: scorecard, KPI trends, P0/P1 open count, governance gate status, next 3 actions.
- Single founder — dashboard must be low-maintenance and readable in < 5 minutes.

## 10.5 Reporting Standards (folded from former `05_REPORTING_STANDARDS`)

- Report types: Executive Summary · Domain Audit Report · Blocker Report · Go/No-Go Interim · Certification · Governance Registers.
- Writing rules: findings first; evidence under claim; every report carries status line, scope, tier legend, cross-links, and "review draft / not committed" until approved.
- Cross-linking: every ⏱/🏭 item links to its `RT-<NN>`; every P0/P1 links to its fix; every register entry links to its source finding; `INDEX.md` is the single navigation entry point.
- Bengali + English mixing allowed for founder readability; technical terms in English.
