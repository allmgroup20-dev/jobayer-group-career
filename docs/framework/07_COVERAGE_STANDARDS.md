# 07 — Coverage Standards (Framework)

> 100% scope verification. No repository item may remain unclassified.

## 7.1 Three Layers (mandatory)
### Layer 1 — Executive (percentages)
Overall repository coverage % by category:
`Pages | API Routes | Components | DB Tables | Migrations | Workers | Configs | Scripts | Documentation`
One number per category = audited items / total items.

### Layer 2 — Domain (summaries)
Coverage % per domain: `Authentication | Payments | AI | WhatsApp/Messaging | Referral/Affiliate | Security | Database | UX | SEO | Operations`
One row per domain; a domain is 100% only if every item in it is classified.

### Layer 3 — Item-Level (complete table)
For **every** page, route, API, component, table, migration, worker, config, script:
| Column | Content |
|---|---|
| Item | path/identifier |
| Category | page/route/component/table/migration/worker/config/script |
| Status | `Audited` / `Partial` / `Gap` / `Excluded` |
| Evidence | file:line or report ref |
| Verification | ✅ static | ⏱ runtime | 🏭 prod | ❓ manual |
| Priority | P0–P4 / n/a |
| Notes | justification for any non-`Audited` status |

## 7.2 Rules
- `Gap` = known but not yet audited → must be scheduled.
- `Excluded` requires a written justification (e.g., generated/vendor/minified) — no silent exclusion.
- Unknown items must be discovered (glob/scan) and classified — "unknown" is not a final state.
- Coverage % = (Audited + Excluded-with-justification) / Total. Report skipped + unknown counts explicitly.

## 7.3 Deliverable
`docs/audit/02_COVERAGE_MATRIX.md` (project layer) implements this standard.
