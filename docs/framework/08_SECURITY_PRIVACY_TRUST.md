# Part 08 — Security / Privacy / Trust / Compliance (AIOS)

> Canonical AIOS Part 08. The audit layer's `21_SECURITY_PRIVACY_TRUST_AUDIT.md` implements this part.

## 8.1 The 17 Mandatory Security Sub-Audits

1. **Authentication** — phone-ownership verification, OTP (template, rate-limited), session handling, password hashing.
2. **Authorization** — every API route authenticated; never trust client `workerId`/IDs; server-side checks.
3. **API security** — method checks, validation, rate limits, CSRF, CORS, no client-controlled amounts/status.
4. **Database security** — least privilege, secrets (no hard-coded credentials), sensitive columns.
5. **File security** — upload/download paths, MIME, path traversal, access control on resources/unlocks.
6. **AI security** — prompt injection, PII leakage, tool-abuse (Part 07 §7.7).
7. **WhatsApp security** — relay auth, queue auth, consent records, template compliance, ban-risk.
8. **Referral security** — self-referral/farming detection, reward abuse, share-reward integrity.
9. **Payment security** — IPN signature verification, `val_id` validation, price enforcement, idempotency, refunds.
10. **Business fraud** — chargeback abuse, forged success, unauthorized unlocks, account farming.
11. **Bot abuse** — rate limits, CAPTCHA/proof-of-work where needed, anti-automation on OTP/register.
12. **Privacy** — minimal data collection, clear consent, data retention, PII protection (accounts, withdrawals).
13. **Legal** — terms, privacy policy, BDT payment compliance, WhatsApp/Meta policy, template approval.
14. **Trust** — refund promise kept, honest social proof, transparent pricing.
15. **Business risk** — single founder key-person risk, dependency on one relay/providers.
16. **Disaster recovery** — D1 backups, restore drill, session recovery for wa-relay, re-deploy path.
17. **Incident response** — runbook (detect → contain → fix → verify → communicate), roles, log retention.

## 8.2 Severity Mapping

- Any sub-audit exposing direct financial loss / breach = **Critical/P0**.
- Significant abuse/fraud surface = **High/P1**.
- Follow Part 03 §3.3 severity + §4.4 finding block; every finding evidence-classed.

## 8.3 Security Score & Decision

- Security weighted **20%** of master scorecard (Part 03 §3.5.1).
- Security score must be ≥ 70 and no open Critical/High before launch can proceed.
