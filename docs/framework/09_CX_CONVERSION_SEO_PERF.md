# Part 09 — Customer Experience / Conversion / Psychology / SEO / Performance / Accessibility (AIOS)

> Canonical AIOS Part 09. The audit layer's `26_CX_PSYCHO_SEO_PERF_A11Y.md` implements this part.

## 9.1 Customer Experience

- End-to-end journey: landing → explore → buy → unlock → learn → share. Friction measured; mobile-first (18–35 Bengali smartphone users).
- Honest UX only — no dark patterns (Part 01 §1.4.6).

## 9.2 Conversion & Psychology

- Trust signals (money-back guarantee, real reviews, live purchase ticker) must be real, never fabricated.
- Honest urgency/scarcity only; no fake social proof.
- CRO experiments feed Part 06/11; each measured with a metric.

## 9.3 SEO

- Semantic HTML headings, meta/OG/Twitter cards, structured data (schema), Bengali keywords, sitemap, robots, canonical URLs, SSR/SSG where valuable, fast LCP.

## 9.4 Performance

- Core Web Vitals targets (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1); bundle-size budget; image optimization; caching (KV/CDN); worker cold-start awareness.

## 9.5 Accessibility (WCAG 2.1 AA)

- Keyboard operability, focus management, ARIA, color contrast, form labels, reduced-motion, screen-reader text (Bengali).

## 9.6 Scoring

- UX, SEO, Performance, Accessibility each **/100**; UX/SEO/Perf/A11y combined weight **10%** in master scorecard; CWV/SEO validated at 🏭 tier (real production) before Level 6/7.
