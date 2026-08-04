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
- Present: `LivePurchaseTicker`, `LiveNotificationBar`, `live/sales`, scarcity/urgency copy (`LaunchOfferTimer` was deleted in WIP — WIP note).
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
