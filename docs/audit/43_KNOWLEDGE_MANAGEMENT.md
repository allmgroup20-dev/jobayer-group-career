# 43 — Enterprise Knowledge Management (AIOS Part 12)

> Implements AIOS Part 12 · REPOSITORY DOCUMENTATION–DECISION LOG. Status of the 13 mandatory documentation categories + decision log. **Goal: no knowledge gap is silent.**

## 12.1 Documentation Category Status

| # | Category | Status | Where / Note |
|---|---|---|---|
| 1 | Repository docs (README/architecture) | partial | `README.md` exists; architecture overview = `docs/audit/20_…` §20.1 |
| 2 | Architecture documentation | partial | `20_…` §20.1 + `27_…` topology; no standalone ADR |
| 3 | Database documentation | partial | `22_DATABASE_AUDIT.md` + `30_FULL_INVENTORY`; no schema docs site |
| 4 | API documentation | partial | `30_FULL_INVENTORY` (routes catalog); no request/response specs |
| 5 | Component documentation | partial | `30_FULL_INVENTORY` (components catalog) |
| 6 | Feature documentation | partial | audit domain reports (`20_…`–`26_…`) |
| 7 | AI documentation | partial | `25_…` §25.1/§25.3 + `30_FULL_INVENTORY` §30.4 |
| 8 | WhatsApp documentation | partial | `25_…` §25.1/§25.2 + wa-relay section of `27_…` |
| 9 | Referral documentation | partial | `24_…` §24.1–24.4 |
| 10 | Deployment documentation | partial | `27_…` (wrangler/CI) |
| 11 | Runbooks (deploy/rollback/restore/relay-reconnect) | **missing** | P1 — needed pre-launch (`21_…` IR1/DR2) |
| 12 | SOPs (incident response, refunds, support) | **missing** | P1 — needed pre-launch |
| 13 | Changelog + Decision Log | partial | `docs/strategy/` + this section §12.2 |

## 12.2 Decision Log

| Date | Decision | Rationale | Alternatives | Approver |
|---|---|---|---|---|
| 2026-08-04 | Two-layer AIOS (framework + audit) adopted | reusable standards + project evidence | single-layer | Founder |
| 2026-08-05 | Canonical 13-part AIOS mirrored in `docs/framework/`; standards folded; traceability matrix introduced | explicit canonical implementation + bidirectional sync | keep old standards layout | Founder |
| 2026-08-05 | Audit docs renamed to AIOS part-aligned names; Phase-2.5 extended forensic sub-audits added | traceability + Part 04 · REPOSITORY DISCOVERY–SCALABILITY completeness | keep old names | Founder |
| 2026-08-05 | Uncommitted src WIP treated as non-production/experimental (cleanup-only diff) | per founder rule: exclude non-production WIP; certification applies to committed repo state | commit as-is | Founder |
| 2026-08-06 | WIP cleanup resolved: `leaderboard`/`automation`/`membership`/`LaunchOfferTimer` verified (tsc+build ✅, no dangling refs) and committed; automation route fixed to enqueue **and** log (relay send path preserved) | remove ambiguous working-tree state; no broken references | revert automation change | Founder |

## 12.3 Knowledge Gaps (scheduled)
1. Runbooks (deploy/rollback/D1-restore/wa-relay-reconnect) — P1, pre-launch.
2. Incident-response SOP — P1, pre-launch.
3. API request/response specs for payment + auth — P2.
4. Schema documentation generation — P2.
5. ADR for payment flow consolidation (`payment/*` vs `resource-checkout/*`) — P2.

*— Living doc. Status updates on every shipped improvement (`42_…`).*
