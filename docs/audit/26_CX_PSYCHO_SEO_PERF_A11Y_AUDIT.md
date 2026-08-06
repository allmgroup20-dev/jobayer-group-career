# 26 — UX, SEO, Performance & Accessibility Audit (Phase 2)

> Static-only for structure; real CWV/browser checks are 🏭 (production validation).

## 26.1 SEO
### Present ✅ (static)
- Full route tree with semantic paths (`courses/[id]`, `trainers`, `institutions`, `product-list`).
- Home sections (`home/*`) include `FAQSection`, `Testimonials`, `TrustSection` — FAQ/structured content helps SERP (schema markup **unverified** ⏱).
- `manifest.json`, PWA (`PwaRegister`), `locales` — PWA/SEO-friendly.

### Gaps ❌
| ID | Gap | Priority |
|---|---|---|
| S1 | **Meta/OG tags + JSON-LD structured data unverified** — check `layout.tsx`/head for dynamic title/description per page (⏱) | P2 |
| S2 | **`index` robots/sitemap** — no `sitemap.xml`/`robots.txt` found in page inventory (⏱ verify) | P2 |
| S3 | `lang` cookie sets `x-language` (`middleware:46-47`) — confirm `<html lang>` switches bn/en (⏱) | P2 |
| S4 | Canonical + breadcrumb for dynamic pages (⏱) | P3 |

## 26.2 Performance (static risk indicators)
- Workers + CDN + KV → good foundation. `assets` binding serves static.
- **Risks:** per-request DB fan-out in `track/*`, heavy `company/*` dashboards, sequential sponsor-chain queries (`payment/ipn:84-106`).
- `system/perf`, `PerfMonitor`, `maintenance/cache-workers` exist → run them (⏱).
- **Real CWV (LCP/CLS/INP) → 🏭 requires-production-validation** on `career.jobayergroup.com` (PageSpeed/CrUX).

## 26.3 Accessibility (static)
- `ui/*` components present; no ARIA/contrast/keyboard audit performed (⏱ need component pass).
- Language switcher + bilingual content (`i18n/index.ts`, `translations`) — good for bn/18–35 users.
- **Unknowns:** focus states, skip-links, form labels, color contrast → 🏭 manual QA checklist (add to `40_…`).

## 26.4 Mobile (target: smartphone users)
- `BottomNav`, PWA, offline page (`offline`) — strong mobile-first signals ✅.
- Verify install flow + offline behavior ⏱.

## 26.5 UX Psychology (ethical — no dark patterns)
- Present: `LivePurchaseTicker`, `LiveNotificationBar`, `live/sales`, scarcity/urgency copy (`LaunchOfferTimer` was deleted in WIP and the deletion is now **committed** — no fake countdown remains).
- **AIOS gate:** ensure these are truthful (no fake scarcity). `testimonials`/`stats` are static seed data (`src/data/home/*`) — must be labeled honestly or backed by real data (🏭).
- `company/impersonate`, `psychology/*`, `persuasion/apply` — **internal/admin only**, never user-facing manipulative.

## 26.6 Scorecard (interim — static only)
| Area | Score | Notes |
|---|---|---|
| SEO structure | 60/100 | paths good; markup ⏱ |
| Performance foundation | 65/100 | ⏱/🏭 needed |
| Accessibility | 40/100 | unverified |
| Mobile/PWA | 75/100 | strong |
| Ethical UX | 55/100 | seed data honesty ⏱ |
| **UX/SEO/Perf overall** | **55/100** | ⏱/🏭 gates |

---

## 26.7 AIOS Part 09 Sub-Audit Coverage (Phase-2.5)

| Part 09 area | § | Coverage | New/confirmed |
|---|---|---|---|
| Customer experience | 9.1 | §26.4 + §26.5 | mobile-first strong; journey friction ⏱ |
| Conversion & psychology | 9.2 | §26.5 | **LaunchOfferTimer deleted (committed this session)** — no fake countdown remains; **verify all live tickers real (🏭)** |
| SEO | 9.3 | §26.1 | S1–S4 pending (⏱/🏭) |
| Performance | 9.4 | §26.2 | CWV targets: LCP≤2.5s / INP≤200ms / CLS≤0.1 → 🏭 PageSpeed/CrUX on `career.jobayergroup.com` |
| Accessibility | 9.5 | §26.3 | WCAG 2.1 AA checklist → **add to `40_RUNTIME_VERIFICATION`** (RT-a11y rows) |

## 26.8 Accessibility / UX QA Checklist (to execute in `40_…`)
1. Keyboard: full tab order on checkout + unlock + nav; visible focus ring.
2. Form labels on OTP/register/login inputs (bn labels).
3. Color-contrast AA on primary CTAs (checkout ৳99 button).
4. Skip-to-content link on all app pages.
5. `aria-live` for toast (react-hot-toast) + LivePurchaseTicker (screen-reader friendly).
6. Reduced-motion handling for any animations.
7. `<html lang>` switches bn/en (S3).
8. Screen-reader check of checkout flow (🎧 manual).
9. Touch target ≥ 44px on BottomNav + primary buttons.
10. No content-only-on-hover critical info.

> Rows will be linked as RT-a11y-01..10 in `40_RUNTIME_VERIFICATION.md`.
