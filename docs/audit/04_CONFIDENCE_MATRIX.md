# 04 — Confidence Matrix (Governance — Living Document)

> Implements AIOS Part 04 · EVIDENCE RULE (`docs/framework/04_TECHNICAL_AUDIT_ENGINE.md`). Confidence = [0,1]; evidence-class cap: ✅0.95 / ⏱0.5 / 🏭0.3 / ❓n/a.
> Gate: any finding with Confidence < 0.95 must be flagged ❓ or downgraded and cannot support a certification PASS (AIOS Part 13 · RUNTIME CONFIDENCE MATRIX).
> *Last reviewed: 2026-08-04*

## 4.1 Blockers & Key Findings (by report)

> Remediation column reflects Phase D source fixes (see `10_PHASE1_LAUNCH_BLOCKERS.md`). Runtime confirmation pending.

| ID | Finding | Evidence class | Confidence | Verification status | Remediated | Where |
|---|---|---|---|---|---|---|
| C1 | IPN signature presence-only (forgeable) | ✅ | 0.95 | VERIFIED | ✅ SHA-512 verify | `10_…` |
| C2 | `val_id` validation optional everywhere | ✅ | 0.95 | VERIFIED | ✅ mandatory | `10_…` |
| C3 | success GET defaults VALID → free premium/unlocks | ✅ | 0.95 | VERIFIED | ✅ never grants | `10_…` |
| C4 | price/amount client-controlled | ✅ | 0.9 | VERIFIED | ✅ server-side price | `10_…` |
| C5 | no idempotency / tx_id not unique | ✅ | 0.9 | VERIFIED | ✅ idempotent + UNIQUE | `10_…` |
| C6 | no API auth; client workerId trusted (IDOR) | ✅ | 0.95 | VERIFIED | 🟡 partial (write routes) | `10_…` |
| C7 | auto-payout public → fake completed payouts | ✅ | 0.9 | VERIFIED | ✅ admin auth | `10_…` |
| C8 | WhatsApp free-form text (no template) → OTP undeliverable | 🏭 | 0.3 | PENDING (RT-30) | 🟡 template support added | `10_…` |
| C9 | registration without phone verification → farming | ✅ | 0.9 | VERIFIED | ✅ OTP ownership | `10_…` |
| H1 | OTP verify no attempt limit → brute force | ✅ | 0.9 | VERIFIED | ✅ 5-attempt lock | `10_…` |
| H2 | relay public /qr + /logs | ✅ | 0.9 | VERIFIED | ✅ auth-gated | `10_…` |
| H3 | Baileys unofficial → ban risk | 🏭 | 0.3 | PENDING (RT-32) | ⏳ open | `10_…` |
| H4 | OTP TTL mismatch (message vs storage) | ⏱ | 0.4 | PENDING (RT-04) | ✅ 5-min TTL + counter | `10_…` |
| H5 | deploy secrets `if:false` — not provisioned | ✅ | 0.9 | VERIFIED (RT-70 confirms prod) | 🟡 CI steps enabled | `10_…` |
| H6 | share-reward per-account farming | ✅ | 0.85 | VERIFIED | ✅ bearer auth | `10_…` |
| W5 | `/api/whatsapp/*` + relay queue appear unauthenticated | ⏱ | 0.4 | PENDING (RT-33) | ⏳ open | `25_…` |
| A1 | AI cost/abuse control absent | ⏱ | 0.45 | PENDING (RT-51) | ⏳ open | `25_…` |
| 21.8a | `/api/whatsapp/send` unauthenticated → arbitrary/spam send | ✅ | 0.95 | VERIFIED | ⏳ open | `21_…` |
| 21.8b | `/api/whatsapp/queue` unauthenticated → queue tamper/DoS | ✅ | 0.9 | VERIFIED | ⏳ open | `21_…` |
| 21.8c | `PATCH /withdrawals` unauthenticated → set completed | ✅ | 0.95 | VERIFIED | ⏳ open | `21_…` |
| 21.8e | `/withdrawals/premium-eligible` leaks account numbers | ✅ | 0.9 | VERIFIED | ⏳ open | `21_…` |
| 21.8f | `worker-login` no rate limit → brute force | ✅ | 0.85 | VERIFIED | ⏳ open | `21_…` |

## 4.2 Domain Aggregates (weighted mean, static)

| Domain | Mean Confidence | Note |
|---|---|---|
| Security & AuthN/Z | 0.93 | static-confirmed systemic |
| Payments | 0.91 | static-confirmed |
| Database | 0.62 | mixed static + ⏱ constraints |
| WhatsApp/Messaging | 0.45 | send/queue now static-verified; delivery still 🏭 |
| AI | 0.42 | runtime-gated |
| Business/Growth | 0.55 | runtime/economic data needed |
| UX/SEO/Perf/A11y | 0.35 | ⏱/🏭 gated |
| Ops/CI-CD | 0.62 | static + ⏱ |
| **Overall** | **0.59** | below 0.95 → certification PENDING evidence |

## 4.3 Current-Gate State
- Findings with Confidence < 0.95 (C8, H3, H4, W5, A1, and domain-level UX/WhatsApp/AI) are **flagged for runtime** — they cannot yet support any PASS.
- Overall confidence 0.59 ⇒ **audit is provisional** until `40_RUNTIME_VERIFICATION.md` evidence raises these.

*— Living doc. Recompute per-domain means after each runtime batch.*