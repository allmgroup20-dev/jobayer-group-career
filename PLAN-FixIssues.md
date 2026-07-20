# A-to-Z Fix Plan — Login, Language, Color, Speed

## Overview
Four critical issues to fix: **Login "Invalid credentials"**, **Bengali font/language mixing**, **Color psychology re-evaluation**, and **Database speed**. No changes to business logic.

---

## Phase 1: Login Fix — "Invalid credentials" (1 session, ~30 min)

### Root Cause
- **Phone format mismatch**: Registration stores phone `01712345678` but login sends `+8801712345678` — no normalization on either side.
- **membership_status inconsistency**: Login filters `IN ('general', 'premium')` but some DB rows still have `'active'`.

### Changes
| File | Change |
|------|--------|
| `src/app/api/auth/worker-login/route.ts` | Normalize phone: strip all non-digits before query. Use `getJwtSecret()` consistently. |
| `src/app/api/auth/company-login/route.ts` | No phone issue (username-based), but use `getJwtSecret()` for consistency. |
| `src/lib/db/index.ts` → schema | Run `UPDATE workers SET membership_status = 'general' WHERE membership_status = 'active'` as part of schema init. |
| `src/app/api/auth/register/route.ts` | Normalize phone on registration too (strip non-digits). |

### Verification
- Login as member with both `017XXXXXXXX` and `+88017XXXXXXXX` formats — both must work.
- Login as company admin — must work.

---

## Phase 2: Bengali Font & Language Purity (2 sessions, ~60 min)

### 2A: Fix Bengali Font Rendering
**Current**: Hind Siliguri via `next/font` — looks "বেয়া" (bad).
**Root cause**: Hind Siliguri has limited glyph coverage for complex Bengali conjuncts.

**Fix**: Replace Hind Siliguri with **Noto Sans Bengali** (Google Fonts, best coverage):

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Replace `Hind_Siliguri` import with `Noto_Sans_Bengali`. Weight: 400, 500, 700. Variable font support. |
| All components using font class | Update `font-hind-siliguri` → `font-noto-sans-bengali` |

Noto Sans Bengali has:
- ✅ Best Unicode coverage for Bengali script
- ✅ Variable font support (lighter bundles)
- ✅ Google-maintained, regular updates
- ✅ Proper conjunct rendering (যুক্তাক্ষর)
- ✅ Works with next/font (zero CLS)

### 2B: Pure Language Separation — No Banglish
**Requirement**: When BN is selected → ALL text is pure Bengali. When EN is selected → ALL text is pure English. No mixing.

**Approach**: Audit and clean the largest data file + all inline conditionals.

| File | Action |
|------|--------|
| `src/data/landing-page-data.ts` | — Replace Banglish *Bn fields with pure Bengali translation (e.g., "রিয়েল মার্কেট" → "বাস্তব বাজার").<br>— Ensure *En fields contain NO Bengali words.<br>— Fix code-mixed names (e.g., "টেন মিনিট স্কুল (10MS)" → decide: BN shows only Bengali, EN shows brand name).<br>— Add missing Bengali translations. |
| All `{lang === "bn" ? "..." : "..."}` (100+ instances) | Every Bengali branch must be pure Bengali. Every English branch must be pure English. No Banglish. |
| All `data.*Bn` / `data.*En` property usage | Same audit as above. |

**Strategy for brand names/loanwords**:
- If a name is inherently English (e.g., "Google Ads Mastery"), the BN version should use the Bengali-script transliteration ("গুগল অ্যাডস মাস্টারি") and the EN version stays pure English.
- No mixing of scripts within a single string.

### Verification
- Set `lang=bn` → screenshot every page, confirm zero English words in Bengali text.
- Set `lang=en` → screenshot every page, confirm zero Bengali/transliterated words.
- Test on mobile + desktop for font rendering.

---

## Phase 3: Color Psychology Re-Evaluation (1 session, ~30 min)

### Current Palette (already applied)
| Token | Color | Use |
|-------|-------|-----|
| `--primary` | `#1E3A5A` (Deep Navy) | Headers, nav, primary bg |
| `--secondary` | `#FFD700` (Gold) | CTAs, highlights, badges |
| `--action` | `#28A745` (Green) | Buttons, success states |
| `--accent` | `#0D9488` (Teal) | Cards, sections, borders |

### User Feedback
- **Likes**: Gold ✅
- **Dislikes**: General look, not psychologically optimal

### Proposed Palette (Revised)
| Token | Old | New | Psychology |
|-------|-----|-----|------------|
| `--primary` | `#1E3A5A` | **`#0F1E36`** (Darker Navy) | Deeper trust, authority, premium feel |
| `--secondary` | `#FFD700` | **`#FFC107`** (Amber Gold) | Warmer gold, higher contrast on dark bg |
| `--action` | `#28A745` | **`#10B981`** (Emerald) | Growth, wealth, freshness — more modern |
| `--accent` | `#0D9488` | **`#7C3AED`** (Royal Purple) | Royalty, wisdom, premium — psychological trigger for "VIP"/"premium" |
| `--surface` | `#F8FAFC` | **`#FAFAFA`** | Warmer off-white, less clinical |

**Why these colors work for a Bangladeshi career/earning platform**:
- **Deep Navy (#0F1E36)**: Unconscious trust signal. Used by banks, financial institutions. Conveys stability.
- **Amber Gold (#FFC107)**: Slightly warmer than pure gold. Triggers dopamine — reward/achievement feeling. Higher contrast = better accessibility.
- **Emerald (#10B981)**: Associated with money, growth, nature. More sophisticated than default green.
- **Royal Purple (#7C3AED)**: Replaces teal. Psychologically associated with VIP, premium membership, wisdom. Creates visual hierarchy — purple sections feel "exclusive."

### Additional Visual Improvements
- Add subtle **gradient overlays** on hero sections (navy → purple gradient)
- Use gold **only for premium/achievement elements** (not for every button) — scarcity principle
- Add **micro-interactions** (hover scale, smooth transitions) for perceived speed

### Verification
- Ensure WCAG AA contrast on all text/background combinations
- User visual review of 3 key pages: Home, Dashboard, Login

---

## Phase 4: Database Speed — "Bullet Speed" (2 sessions, ~90 min)

### Root Causes
1. **Missing indexes** on 4 tables → full table scans
2. **No KV caching** on dashboard → 7 D1 queries per page load
3. **Cold start schema overhead** → ~100+ ALTER TABLE statements each time
4. **QuerySafe timeouts don't work** → AbortController is ignored by D1

### 4A: Add Missing Indexes

**File**: `src/lib/db/index.ts` (in the batch execution section, around line 1260)

Add these index creation statements:
```sql
CREATE INDEX IF NOT EXISTS idx_mlm_tree_parent_id ON mlm_tree(parent_id);
CREATE INDEX IF NOT EXISTS idx_mlm_tree_sponsor_id ON mlm_tree(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_response_cache_lookup ON ai_response_cache(query_hash, agent_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_worker_status ON withdrawals(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_to_worker_status ON commissions(to_worker_id, status);
```

**Impact**: Queries on `mlm_tree` (team count), `ai_response_cache` (AI response lookup), `withdrawals` (total withdrawn) — all go from full table scan → index seek.

### 4B: KV Cache Dashboard Summar

**File**: `src/app/api/dashboard/summar/route.ts`

- Add KV caching: `cacheKey = "dashboard:{workerId}"` with 30s TTL
- On cache hit → return immediately (zero D1 queries)
- On cache miss → run queries, store in KV
- Invalidate cache when dashboard data changes (withdrawal, commission, team join)

**Impact**: Dashboard load goes from 7 D1 roundtrips → 1 KV lookup (~2ms).

### 4C: Optimize Cold Start

**File**: `src/lib/db/index.ts`

- Group all `ALTER TABLE` statements: check if column exists first via `PRAGMA table_info` query, then only run the ALTER if the column is missing.
- This reduces cold start from ~50 ALTER round-trips to ~5-10 PRAGMA + maybe 1-2 actual ALTERs.

### 4D: Fix QuerySafe Timeout

**File**: `src/lib/db/queries.ts`

- Remove fake `AbortController` timeout (doesn't work with D1).
- Replace with a real `Promise.race` that throws a timeout error but doesn't pretend to cancel the query.

### Verification
- Measure dashboard load time before/after (DevTools Network tab)
- Confirm no data differences after KV caching (cache invalidation test)
- Run `EXPLAIN QUERY PLAN` on slow queries to confirm index usage

---

## Rollout Order

```
Phase 1: Login Fix  ───────────────── 30 min
Phase 2A: Font Fix  ───────────────── 20 min
Phase 2B: Pure Language Separation  ─ 40 min
Phase 3: Color Update  ───────────── 30 min
Phase 4A: Indexes  ───────────────── 20 min
Phase 4B: KV Cache  ──────────────── 30 min
Phase 4C: Cold Start  ────────────── 15 min
Phase 4D: Timeout Fix  ──────────── 10 min
──────────────────────────────────────────
Total: ~3 hours
```

Each phase ends with `git commit` + push to GitHub.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| KV cache serves stale data | Short TTL (30s). Invalidate on write operations. |
| New font breaks layout | Use `next/font` with `display: swap`. Preload critical text. |
| Color change breaks readability | Check WCAG AA on all combinations before deploying. |
| Index creation is slow on large tables | Run during low-traffic window. D1 allows concurrent reads during write. |
| Language changes miss some Banglish | CI script: scan for Bengali chars in `*En` fields and English chars in `*Bn` fields. |
