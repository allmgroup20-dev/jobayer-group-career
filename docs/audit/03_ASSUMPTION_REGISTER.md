# 03 — Assumption Register (Governance — Living Document)

> Implements AIOS Part 04 · EVIDENCE RULE (`docs/framework/04_TECHNICAL_AUDIT_ENGINE.md` evidence rule) / Part 13 · QUALITY GATE. **No guess entries.** Each record carries evidence, evidence class, confidence, verification status, last-reviewed.
> Evidence classes: ✅ static-confirmed · ⏱ requires-runtime · 🏭 requires-production-validation · ❓ needs-manual-verification.
> *Last reviewed: 2026-08-04*

| ID | Assumption | Basis / Evidence (file:line) | Evidence Class | Confidence | Status | Impact if wrong | Re-verify point |
|---|---|---|---|---|---|---|---|
| AR-01 | `INSERT OR IGNORE` deduplicates `user_unlocks` (no duplicate unlock for (worker,course)) | `src/app/api/unlocks/route.ts:62-65` (relies on a UNIQUE constraint defined in DB, not visible in grep of schema) | ⏱ | 0.5 | PENDING | duplicate unlocks / quota bypass | Create (worker_id,course_id) duplicate POST RT-43 |
| AR-02 | `workers.phone` is unique — prevents duplicate phone accounts | `register:21-26` checks existence; schema not confirmed unique in grep | ⏱ | 0.55 | PENDING | phone reuse spam | Register same phone 2× (RT-05/42) |
| AR-03 | Meta Cloud API rejects business-initiated free-form text (needs approved template) | `sender.ts:29-34` sends `type:"text"`; platform behavior external | 🏭 | 0.3 | PENDING | OTP dead at launch (C8) | RT-30 real delivery |
| AR-04 | Baileys (unofficial) violates WhatsApp ToS → number-ban risk | `wa-relay/index.mjs:1` users Baileys; ToS external | 🏭 | 0.3 | PENDING | number banned | RT-32 24h stability |
| AR-05 | The system treats client-supplied `workerId` as the authenticated identity | observed across `unlocks:8`, `share-reward:9`, `resource-checkout:10`, `auto-payout:8` | ✅ | 0.95 | VERIFIED (vulnerability C6) | full IDOR | Fix + RT-20..22 |
| AR-06 | `member`/premium grant is valid after any "VALID" payment | `resource-checkout/success:10,66`; `payment/success:55-62` | ✅ | 0.95 | VERIFIED (C3) | free premium | RT-12/13 |
| AR-07 | `SITE_URL` = `career.jobayergroup.com` | `wrangler.jsonc:16`; `resource-checkout:6`; `wa-relay/index.mjs:15` | ✅ | 0.9 | VERIFIED | wrong redirect targets | curl prod |
| AR-08 | Business constraint: ৳99/resource, NOT subscription; currency ৳ only | founder directive (AIOS context); `unlocks:36` uses 99 | ✅ | 0.9 | VERIFIED | — | — |
| AR-09 | Target market: 18–35 Bengali smartphone users, free-first | founder directive (AIOS context) | ❓ | — | PENDING (context, not measurable in code) | product-market mismatch | adoption data (🏭) |
| AR-10 | D1 schema (`schema.ts`) is the source of truth and matches applied migrations | `schema.ts` (857 L) vs `migrations/001..018` | ⏱ | 0.45 | PENDING | schema/migration drift | diff applied DB vs schema (RT-…) |
| AR-11 | `transaction_id` uniqueness relies on app-logic, not DB constraint | `schema.ts:116,639` no `.unique()`; no unique index found | ✅ | 0.9 | VERIFIED (gap C5) | replay double-grant | RT-14 |
| AR-12 | OTP validity ~5 min as the message states | `otp/send:27` text "৫ মিনিট"; storage TTL logic contradicting | ⏱ | 0.4 | PENDING (see CR-01) | early/late expiry | RT-04 |
| AR-13 | AI automation (cron `*/5`) runs exactly once across workers | `wrangler.jsonc:8`; main + ai-app share D1 | ⏱ | 0.5 | PENDING | double execution (O4) | RT-50 |
| AR-14 | `deploy.yml` "Set secrets" steps are intended to run | steps present but `if:false` (`deploy.yml:32,46`) | ✅ | 0.9 | VERIFIED (H5) | prod runs with no secrets | RT-70 |
| AR-15 | OTP re-send is limited 45s/phone | `otp/send:18-22` KV check | ✅ | 0.85 | VERIFIED | — | RT-02 |
| AR-16 | `wa-relay` ↔ app messaging endpoints require no auth header from relay | `wa-relay/index.mjs:195,259,272`; confirmed app-side unauthenticated `whatsapp/send`, `whatsapp/queue` | ✅ | 0.9 | VERIFIED (W5/21.8a,b) | open spam/DoS | RT-33 |
| AR-17 | `PATCH /withdrawals` status transition is authority-gated | `withdrawals/route.ts:94-114` shows no auth | ✅ | 0.95 | VERIFIED (21.8c) | treasury manipulation | RT (deny patch) |

**Register rules (see AIOS Part 04 · EVIDENCE RULE):** no entry above 0.95 Confidence may remain PENDING at certification time; new assumptions surfaced in later phases are appended here before use.