# Part 03 — Final Production & Launch Readiness Certification Engine (AIOS)

> Canonical AIOS Part 03. The audit layer's `10_…`, `11_…`, `40_…`, `41_…` documents implement this part.

## 3.1 Certification Levels (1–7)

| Level | Name | Meaning |
|---|---|---|
| 1 | Baseline | Static inventory captured; scope classified |
| 2 | Static Audit Complete | Every route/API/component/DB object classified with evidence |
| 3 | Blockers Closed | All Critical (P0) resolved + verified |
| 4 | High Risks Closed | All High (P1) resolved + verified |
| 5 | Runtime Verified | Every ⏱ test PASSES with retained evidence |
| 6 | Production Verified | Every 🏭 test PASSES on the real production URL |
| 7 | ✅ READY FOR LAUNCH | Levels 1–6 complete + governance gate green + master scorecard ≥ 70 |

## 3.2 Global Launch Checklist (applies to every launch)

- [ ] All Critical & High findings fixed and re-verified
- [ ] Payments: server-side IPN signature + `val_id` validation, price enforcement, idempotency
- [ ] Authentication: phone-ownership verification, rate-limited OTP, session security
- [ ] Authorization: every API route authenticated; no client-trusted IDs
- [ ] WhatsApp: approved templates only; consent recorded; no spam
- [ ] Secrets: all prod secrets provisioned (no `if: false` steps); nothing committed
- [ ] Database: constraints + uniqueness (transaction_id), indexes, transactional grants
- [ ] Runtime + production test evidence retained
- [ ] Governance gate (Part 13 §13.3) green
- [ ] Founder explicit approval recorded

## 3.3 Risk Classification

| Severity | Definition | Timing |
|---|---|---|
| Critical | Direct financial loss / breach / total feature failure | Must fix pre-launch (P0) |
| High | Significant abuse, fraud, or major functional risk | Fix pre-scale (P1) |
| Medium | Correctness, robustness, minor abuse | Fix within 90d (P2) |
| Low | Polish / debt | Backlog (P3/P4) |
| Informational | Observation, no action required | Log |

## 3.4 Failure Modes (stress thinking — always ask)

1. **"What happens if this is forged / bypassed?"** — payment IPN, status parameters, client amounts, worker IDs.
2. **"What happens under replay / double-click / race?"** — grants, unlocks, withdrawals.
3. **"What happens to the business if a user acts maliciously?"** — referral fraud, farming, chargeback abuse.
4. **"What happens at scale (10× users)?"** — rate limits, bot abuse, D1 hot rows, WhatsApp bans.
5. **"What happens if a provider fails?"** — SSLCommerz outage, WhatsApp disconnect, Worker crash.
6. **"What happens on multi-tab / two devices?"** — idempotency + locking.

## 3.5 13-Domain Scorecard (default; implemented in `docs/audit/40_MASTER_SCORECARD.md`)

`Technical · Security · Database Integrity · Business Model · Growth/Viral · AI Ecosystem · UX · SEO · Performance · Accessibility · Ops/CI-CD · Privacy/Trust · Compliance`

### 3.5.1 Scoring Rules (folded from former `08_SCORECARD_STANDARDS`)
- Every domain scored **/100**, derivable from its findings (list supporting finding IDs).
- Evidence-class cap: a domain with unverified ⏱/🏭 critical items cannot exceed the evidence-adjusted ceiling.
- Weights (default, business-first): Security 20% · Payments 15% · Database 10% · WhatsApp 10% · Business 10% · Growth 10% · AI 10% · UX/SEO/Perf/A11y 10% · Ops 5%. Weights configurable per project; record chosen weights in the certification.
- Thresholds: **≥ 85** Launch-ready (with runtime evidence) · **70–84** Launch-ready after minor fixes · **< 70** Not ready.

### 3.5.2 Interim vs Final
- Interim scorecards are labeled **"interim (static)"** and finalized only after runtime PASS.
- Re-certification must show previous score, new score, and the evidence delta.
- Governance completeness (5 components, Part 04 §4.7) is scored and reported alongside domains.

## 3.6 Final Launch Decision

| Condition | Decision |
|---|---|
| Any Critical unfixed | 🚨 DO NOT LAUNCH |
| All Critical fixed; any High unfixed | ❌ NOT READY |
| All Critical+High fixed; runtime ⏱/🏭 pending | ⚠ READY AFTER FIXES (conditional) |
| All Critical+High fixed AND every ⏱/🏭 test PASSES | ✅ READY FOR LAUNCH |

## 3.7 Pre-Launch Checklist (executed at Level 7)

- [ ] Production URL live; SSL enforced
- [ ] Real provider checks pass (SSLCommerz live, Meta template approval)
- [ ] Real CWV targets met on production
- [ ] Monitoring + logging + alerting active
- [ ] Backup/restore drill passed
- [ ] Incident response runbook available (Part 12)
- [ ] Founder final sign-off recorded in certification doc
