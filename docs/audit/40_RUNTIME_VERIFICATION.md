# 40 — Runtime Verification Checklist (Phase 3)

> **Purpose:** The final launch certification (`41_…`) may only be issued after **both** static and runtime verification pass.
> This file is the executor's (founder/dev) checklist. Each item: ID, area, tier, precondition, steps, expected result, pass/fail criteria, evidence required.
>
> **Tier legend:** ⏱ = requires-runtime (deployed test) · 🏭 = requires-production-validation (real providers/data/load).
>
> **Prerequisite to run:** deploy to a non-prod Worker + a prod Worker once P0/P1 static fixes are merged. Execute `npm run build && npx tsc --noEmit` first — tree verified clean (tsc ✅, build ✅) as of commit `22f0b6d`; no uncommitted WIP remains.

---

## A. Authentication & OTP
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-01 | ⏱ | OTP send | POST `/api/auth/otp/send` `{phone}` | 200, WhatsApp delivers 6-digit code | message received ≤30s; `configured:true` | 429 spam-lock or no delivery / devCode returned | screenshot of received message + API response |
| RT-02 | ⏱ | OTP rate limit | 3 sends same phone in 30s | 429 after 45s window | ≤2 delivers, 3rd = 429 | multiple delivers within 45s | server logs |
| RT-03 | ⏱ | OTP brute-force | Wrong code ×10 then correct | verify must fail at try 6 (5-attempt cap) | locked after 5 fails | unlimited guesses | response codes |
| RT-04 | ⏱ | OTP expiry | Wait 5 min after send, verify | error "expired" | fails after declared TTL | succeeds after TTL | timestamps |
| RT-05 | ⏱ | Register w/ unverified phone | Register phone B without OTP | blocked | register requires verified phone | account created | response + DB `workers` row |

## B. Payments — SSLCommerz (all paths)
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-10 | 🏭 | IPN real | Pay test txn in sandbox, let IPN arrive | order → paid once; commissions ×1; unlock +N exactly once | status paid, single commission row, no double unlock | double rows / double unlock | DB `orders`,`commissions`,`unlock_limits` |
| RT-11 | ⏱ | IPN forged | POST `status=VALID&verify_hash=abc&tran_id=<pending>` (no val_id) | **rejected 400** | rejected | marks paid (vulnerability C1/C2 confirmed) | response |
| RT-12 | ⏱ | success GET default | GET `/api/resource-checkout/success?tran_id=<pending>` no status | **no grant**; redirect error | not premium, unlock unchanged | premium/unlock granted (C3 confirmed) | DB state |
| RT-13 | ⏱ | price tamper | POST checkout with amount=1 for a ৳99 product | server computes ৳99 | order amount = 99 | order amount = 1 (C4 confirmed) | DB `resource_purchases` |
| RT-14 | 🏭 | Replay IPN | Re-deliver same IPN twice | second = already processed | idempotent | double grant (C5 confirmed) | DB rows |
| RT-15 | 🏭 | validatePayment | Call `/validator/api` with real val_id | VALID/VALIDATED | matches | — | log |

## C. Authorization / IDOR
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-20 | ⏱ | IDOR unlocks | Token A calls `/api/unlocks?workerId=B` | 403/empty | A cannot read B | B's data returned (C6 confirmed) | response |
| RT-21 | ⏱ | share-reward to other | POST share-reward workerId=B with A's token | 403 | cannot grant to B | granted (C6 confirmed) | DB |
| RT-22 | ⏱ | payout to other | POST auto-payout workerId=B | 401/403 | admin-only | payout created (C7 confirmed) | DB `withdrawals` |
| RT-23 | ⏱ | company routes | Unauthenticated call to `/api/company/*` | 401/redirect | protected | data returned | response |

## D. WhatsApp / Messaging
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-30 | 🏭 | Template delivery | Send OTP + order notification to a number that never messaged (outside 24h) | delivered via approved template | delivered (msg id) | Meta 131047 (C8 confirmed) | Meta error + delivery status |
| RT-31 | ⏱ | relay auth | GET wa-relay `/qr`,`/logs` without token | 401 | gated | QR/logs exposed (H2 confirmed) | response |
| RT-32 | 🏭 | relay stability | Run wa-relay 24h, send 50 messages | no disconnect loop, ≥95% delivered | stable | ban/disconnect spam (H3) | relay logs |
| RT-33 | ⏱ | queue auth | Direct POST to `/api/whatsapp/send` and `/api/whatsapp/queue` unauthenticated | 401 | gated | sends enqueued (W5 confirmed) | DB `wa_message_queue` |

## E. Referral / Commissions / Unlocks
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-40 | 🏭 | Referral commission | User A→B→C purchase; verify chain payout | commission for A (lvl1) and B (lvl2) exactly once | correct amounts, single rows | double/missing commission | DB `commissions` |
| RT-41 | ⏱ | Self-referral | B registers with B's own code | rejected | no self-link | self-referral accepted | DB tree |
| RT-42 | ⏱ | Farm resistance | Same device/IP registers 20 accounts | throttled/blocked | limit enforced | 20 accounts live (C9/H6 confirmed) | DB `workers` |
| RT-43 | ⏱ | Unlock quota | Use resource income unlock; verify decrement | −৳99, +1 unlock | exact | race/double | DB `workers`,`user_unlocks` |

## F. AI / Automation / Background
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-50 | 🏭 | Cron automation | Wait one `*/5` cycle; verify automation ran once | runs ≤1, no duplicate across workers | single execution | double execution (O4) | logs, DB |
| RT-51 | ⏱ | AI abuse | Unauthenticated flood to AI endpoint | throttled/401 | gated | unlimited cost (A1 confirmed) | response |
| RT-52 | 🏭 | AI failover | Block primary model key; send chat | failover to free model works | success via backup | error/no fallback | ai_log |
| RT-53 | 🏭 | Cost monitor | 24h AI usage | dashboard shows spend | visible | no tracking | Cloudflare/aiLog |

## G. Performance / Browser Compatibility
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-60 | 🏭 | CWV | PageSpeed/CrUX on live URL | LCP<2.5s, CLS<0.1, INP<200ms | green | red | screenshot/report |
| RT-61 | 🏭 | Browser matrix | Chrome, Safari, Firefox, 2 low-end Android, iOS | no console errors, layout OK | all pass | breakage | device screenshots |
| RT-62 | 🏭 | PWA/offline | Install PWA, toggle offline | app opens cached | works | fails | video |
| RT-63 | ⏱ | Concurrent checkout | 50 parallel IPN for same order | exactly one grant | atomic | double-grant (C5) | DB |
| RT-64 | ⏱ | Load spike | 200 concurrent sessions on `track/*` | <1s p95, no 5xx | passes | errors/timeouts | wrangler metrics |

## H. Ops / Security Hardening
| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-70 | ⏱ | Secrets present | `wrangler secret list` on all workers | JWT/WA/SSL/OpenRouter present | all listed | missing (H5) | CLI output |
| RT-71 | 🏭 | Payment live-mode | SSLCommerz live test ৳1 | IPN validates live | VALID | sandbox/live mismatch | payment receipt |
| RT-72 | ⏱ | Headers | curl -I prod | CSP, HSTS, no-cors issues | headers set | missing | header dump |
| RT-73 | ⏱ | GDPR-export | Privacy export + delete | CSV export, then delete row | works | fails/leak | output |

## I. Accessibility / UX QA (WCAG 2.1 AA — AIOS Part 09 · ACCESSIBILITY)

| ID | Tier | Test | Steps | Expected | Pass | Fail | Evidence |
|---|---|---|---|---|---|---|---|
| RT-a11y-01 | ⏱ | Keyboard nav | Tab through checkout + unlock + nav | full order, visible focus ring | pass | traps/focus lost | video |
| RT-a11y-02 | ⏱ | Form labels | Inspect OTP/register/login inputs | every input has bn label | pass | missing labels | screenshot |
| RT-a11y-03 | ⏱ | Color contrast | Contrast check on primary CTAs (৳99 button) | AA ≥4.5:1 | pass | fail | tool output |
| RT-a11y-04 | ⏱ | Skip link | Home + dashboard | skip-to-content link present | pass | absent | code/screenshot |
| RT-a11y-05 | ⏱ | Live regions | Trigger toast + LivePurchaseTicker | `aria-live` announced | pass | silent | NVDA/WAVES |
| RT-a11y-06 | ⏱ | Reduced motion | Toggle prefers-reduced-motion | animations off | pass | on | video |
| RT-a11y-07 | ⏱ | `lang` switch | Toggle bn/en | `<html lang>` switches | pass | static | DOM dump |
| RT-a11y-08 | 🎧 | Screen reader flow | SR user completes checkout | guided, no dead ends | pass | blocker | SR recording |
| RT-a11y-09 | ⏱ | Touch targets | BottomNav + primary buttons | ≥44px hit area | pass | too small | inspect |
| RT-a11y-10 | ⏱ | No hover-only info | Hover-critical info on mobile | none | pass | present | manual |

---

## ✅ Completion Rule
- **Every ⏱ item must PASS** before "READY AFTER FIXES".
- **Every 🏭 item must PASS** on the real production URL before "✅ READY FOR LAUNCH".
- Each PASS requires the listed **evidence artifact** retained in `docs/audit/evidence/` (files/screenshots).
- Any FAIL of a P0-related test (RT-11/12/13/20/22/30) immediately re-opens the interim **DO NOT LAUNCH** status.
