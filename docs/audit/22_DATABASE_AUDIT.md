# 22 — Database Audit (Phase 2)

> Source of truth: `src/lib/db/schema.ts` (857 lines, 65 tables) + `migrations/` (18 files) + `src/lib/db/index.ts` (DDL bootstrap).

## 22.1 Schema Health
### Unique / constraints ✅ present
- `workers.phone` unique (enforced in code + schema) — `register:21-26`.
- `orders.order_id` unique — `schema.ts:104`.
- `commissions.commission_id`, `withdrawals.withdrawal_id`, `currencies.code` unique.
- `user_unlocks` uses `INSERT OR IGNORE` (`unlocks:62-65`) implying a unique constraint on (worker_id, course_id) — ✅ dedupe.

### ❌ Missing (security/business-critical)
| Gap | Evidence | Impact |
|---|---|---|
| `orders.transaction_id` / `resource_purchases.transaction_id` **no UNIQUE** | `schema.ts:116`, `schema.ts:639` | IPN replay double-grant (C5) |
| **No composite unique** on referral share rewards per day/device | KV key `share_reward:<workerId>` (`share-reward:22`) | per-account farming (H6) |
| No CHECK on `amount > 0`, `resource_count > 0` | `resource-checkout:21` | zero/negative abuse (C4) |
| No FK enforcement visible (D1/sqlite FK pragma status unverified) | `index.ts` DDL | orphan rows possible |

## 22.2 Transaction / Atomicity
- **No explicit transactions** observed for critical mutations:
  - Unlock-limit increment: read-then-write (`resource-checkout/ipn:51-62`, `resource-checkout/success:52-62`, `share-reward:28-33`) → races double-count.
  - Payment mark-paid: read-status then `UPDATE` (`payment/ipn:49-56`) → no `WHERE payment_status='pending'` guard.
  - Commission distribution on orders without transactional dedupe (`payment/ipn:58-59`).
- **Recommendation (P0):** use atomic SQL (`SET max_unlocks = max_unlocks + ?`), guarded updates (`… WHERE order_id=? AND payment_status='pending'`), and D1 `batch()` for multi-statement atomicity.

## 22.3 Migrations (18)
- Ordered `001`→`018`; include company login fix, AI features, free models, brain usage, agent memory, custom flows, analytics, agent tuning, negativity dynamic, trainers/institutions, trainer courses, drop icon, demo bonus, resource income, membership tiers, kotler marketing.
- **Risk:** `schema.ts` and `migrations/` must not diverge — migration strategy (drizzle-kit push vs migrate) unverified (⏱). Destructive ops (e.g., `014_drop_course_icon`) — confirm applied safely on prod (🏭).
- **No seed data strategy beyond `seed` route** (dev-only; must be gated in prod).

## 22.4 Indexing / Performance
- No explicit secondary-index definitions found in schema greps (D1 auto-indexes PKs only). High-volume lookups (`track/*`, phonebook, notifications, customer360) rely on full scans at scale → **needs index review** (⏱ measure, P2).
- KV usage: OTP, share-reward, auth cache, client-cache — KV TTL semantics for `setCached` need verification (H4).

## 22.5 Data Integrity Scorecard
| Area | Score | Notes |
|---|---|---|
| Constraint coverage | 45/100 | missing unique on tx_id |
| Atomicity | 30/100 | read-modify-write races |
| Migrations | 70/100 | 18 tracked, drift risk |
| Indexing | 40/100 | PK-only assumed |
| Privacy/PII handling | 55/100 | tables exist, rights endpoints exist |
| **Database overall** | **45/100** | P0 fixes needed |

> Final score in `41_…`.
