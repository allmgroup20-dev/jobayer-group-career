# 04 — Runtime Verification Standards (Framework)

> Template & rules for the runtime checklist (`40_RUNTIME_VERIFICATION.md` in the project layer). Generic — reusable for any feature.

## 4.1 Test-Case Row Template
| Column | Required content |
|---|---|
| ID | `RT-<NN>` |
| Tier | ⏱ runtime | 🏭 production |
| Test | feature + scenario |
| Preconditions | state/seed/deploy needed |
| Steps | numbered exact steps |
| Expected | precise expected result |
| Pass criteria | objectively checkable |
| Fail criteria | objectively checkable |
| Evidence | artifact to retain (screenshot, log, DB row, CLI output) |

## 4.2 Mandatory Feature Coverage
At minimum, these features MUST have tests: authentication/OTP, payments/IPN, messaging (WhatsApp/templates), AI workflows, referral/commissions, notifications, background jobs (cron), performance (CWV/load), browser compatibility, privacy/consent, secrets/ops.

## 4.3 3-Tier Evidence Separation (mandatory)
1. **Verified by static code analysis** — from repo.
2. **Requires runtime verification** — deployed test; per-feature test case above.
3. **Requires production validation** — real providers/data/load (SSLCommerz live, Meta template approval, real CWV, real traffic).

## 4.4 Rules
- Every ⏱ item must PASS before "READY AFTER FIXES".
- Every 🏭 item must PASS on the real production URL before "✅ READY FOR LAUNCH".
- A FAIL of any P0-related test immediately re-opens the DO-NOT-LAUNCH status.
- Evidence artifacts are stored in `docs/audit/evidence/` (files/screenshots/CLI dumps).
