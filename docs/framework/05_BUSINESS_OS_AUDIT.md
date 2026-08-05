# Part 05 — Business Operating System Audit (AIOS)

> Canonical AIOS Part 05. The audit layer's `23_BUSINESS_OS_AUDIT.md` implements this part.

## 5.1 Mandatory Business Sub-Audits

1. **Business model** — how money is made; model validity for ৳99-per-purchase constraint (no subscription).
2. **Pricing** — ৳99 per resource; tiering, AOV, perceived value, fairness.
3. **Value proposition** — is the offer real and differentiated for 18–35 Bengali users?
4. **Conversion** — funnel from landing → purchase; friction points; honest CRO only (no dark patterns).
5. **Revenue leak** — payment forgery, unauthorized unlocks, refund abuse, resource leakage, wasted spend.
6. **Referral economics** — cost per referral vs lifetime value; reward unit economics (৳).
7. **Viral loop** — does a user action naturally invite another user? Measure/share mechanics.
8. **Network effect** — does value grow with users (leaderboards, community, shared unlocks)?
9. **WhatsApp business** — monetization + growth via WhatsApp; template approval; spam risk.
10. **Customer psychology** — trust signals (money-back guarantee, live purchase ticker), scarcity (honest), social proof (real only).
11. **Marketing psychology** — organic hooks: Bengali content, exam/job urgency, free samples, share-to-unlock.
12. **Trust** — refund policy, support, real reviews, no manipulation.
13. **Growth engine** — referral + WhatsApp automation as primary engines; KPI-dashboard linkage (Part 10).
14. **Competitive position** — why this beats free alternatives; defensibility.
15. **Founder efficiency** — single-founder viability of every proposed action (time/effort S/M/L/XL).

## 5.2 Business Scorecard

- Score each sub-audit **/100** using Part 03 scoring rules; aggregate = weighted mean.
- Business weight in master scorecard (default 10%) per Part 03 §3.5.1.
- Evidence classes per §4.3; no score without evidence.

## 5.3 Final Business Decision

| Condition | Decision |
|---|---|
| Unit economics negative or revenue leak unmitigated | Block launch |
| Model sound but leaks/trust issues remain | ⚠ Fix before scale |
| Sound model + airtight payments + positive unit economics | ✅ Proceed |

## 5.4 Founder Constraints on Recommendations

Every recommendation must be single-founder buildable; anything requiring ongoing paid headcount is flagged as a constraint (Part 01 §1.4.8).
