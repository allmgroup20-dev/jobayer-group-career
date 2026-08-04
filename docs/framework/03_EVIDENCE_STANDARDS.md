# 03 — Evidence Standards (Framework)

> Defines how evidence is classified, cited, and scored. Every governance register and finding uses these rules.

## 3.1 Evidence Classes
| Class | Label | Meaning | Confidence (default) |
|---|---|---|---|
| ✅ Static Evidence | `✅ static-confirmed` | Proven from repo/code/config (`file:line`) | 0.95 |
| ⏱ Runtime Required | `⏱ requires-runtime` | Needs a live deployed test to prove | 0.50 (until tested) |
| 🏭 Production Required | `🏭 requires-production-validation` | Needs real providers/load/data | 0.30 (until validated) |
| ❓ Needs Manual Verification | `❓ needs-manual-verification` | Evidence missing; must be recorded, not guessed | n/a (pending) |

## 3.2 Citation Rule
- Every claim uses a locator: `path/to/file.ts:line` (or artifact ID in `docs/audit/evidence/`).
- Quote 1–4 lines for context; never paraphrase away the evidence.
- A claim without a locator is automatically downgraded to ❓.

## 3.3 Confidence Scoring
- Each finding/register entry carries `Confidence` in [0.0, 1.0].
- Base by evidence class (3.1) then adjust ±0.1 by corroboration (multiple sources) or contradiction risk.
- **Aggregate rule:** a domain's confidence = weighted mean of its findings' confidence.
- **Gate rule:** anything with Confidence < 0.8 must be marked ❓ or downgraded, and cannot support a certification PASS.

## 3.4 Verification Status Lifecycle
`PENDING` → (evidence collected) → `VERIFIED` → (new contradictory evidence) → `REVIEWING` → resolves to `VERIFIED` or `REFUTED`.
Registers record the current status + last-reviewed date.

## 3.5 Anti-Patterns (prohibited)
- Inferred/assumed evidence (must be ❓).
- "It probably works" without a test.
- Using static proof to claim runtime behavior.
- Copying another project's verdict onto this one.
