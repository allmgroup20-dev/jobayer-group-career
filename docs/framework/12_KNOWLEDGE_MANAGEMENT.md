# Part 12 — Enterprise Knowledge Management (AIOS)

> Canonical AIOS Part 12. The audit layer's `43_KNOWLEDGE_MANAGEMENT.md` implements this part.

## 12.1 Mandatory Documentation Categories

1. Repository docs (`README`, architecture overview)
2. Architecture documentation (deployment topology, data flow)
3. Database documentation (schema, tables, migrations, indexes)
4. API documentation (every route, method, auth, params)
5. Component documentation (key UI components)
6. Feature documentation (payments, unlocks, referrals, WhatsApp, AI)
7. AI documentation (ai-app, chat-worker, prompts, cost)
8. WhatsApp documentation (wa-relay, templates, queue)
9. Referral documentation (rules, rewards, anti-fraud)
10. Deployment documentation (wrangler, workers, CI/CD, secrets)
11. Runbooks (deploy, rollback, restore, wa-relay reconnect)
12. SOPs (incident response, refunds, support)
13. Changelog + Decision Log (what changed and why, with approver)

## 12.2 Rules

- Each category has a status: `complete | partial | missing | n/a` in `43_KNOWLEDGE_MANAGEMENT.md`.
- Docs are evidence-linked (Part 04 §4.3) and cross-referenced from the traceability matrix.
- Knowledge gaps are recorded and scheduled (not silently absent).

## 12.3 Decision Log

- Every significant decision: date, decision, rationale, alternatives considered, approver (founder), linked AIOS part + finding.
