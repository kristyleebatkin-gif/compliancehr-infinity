# ULTIMATE ALL-IN-ONE MASTER SPECIFICATION (v1.0)

**ComplianceHR Infinity — governing build constitution**
Installed 17 November 2026. Supersedes the executive summaries in
`COMPLIANCEHR_INFINITY_MASTER_PROMPT.md`, `ULTIMATE_MASTER_BUILD_SPECIFICATION_V2.md` and
`ULTIMATE_EVERYTHING_SPECIFICATION_V1.md` where they differ. This document is the authority for
what the platform must contain, how a capability is judged complete, and what may never be claimed.

> One Platform. One Source of Truth. One Source of Evidence. One Source of Assurance.
> One Measure of Integrity.

```
EVIDENCE → ASSURANCE → TRUST → INTEGRITY → BETTER OUTCOMES
```

---

## 1. Authority and reading order

1. This file — the constitution: laws, weights, completion test.
2. `src/lib/enterpriseOS.js` — the machine-readable register of every operating system and the
   honest state of each capability (`live`, `partial`, `gap`).
3. `src/lib/integrityIndex.js` — the executable form of the Enterprise Integrity Index.
4. Module-level documents (`MODULE_EVIDENCE_MATRIX.md`, `PHASE11_*`, `ENTERPRISE_*`) — detail that
   must never contradict 1–3.

Where a document and the code disagree about what exists, **the code wins** and the document is
corrected in the same change.

## 2. Platform realisation: declared stack → what actually runs

The specification's reference stack is the architectural intent, not a second implementation. This
platform runs on the platform's own backend, and each reference technology maps to a live
equivalent. No parallel stack is introduced.

| Specification intent | Realisation in this build | Consequence |
| --- | --- | --- |
| Next.js + React + TypeScript + Tailwind + shadcn/ui | React 18 + Vite + Tailwind + shadcn/ui | Same component and token discipline |
| NestJS controllers/services | Platform backend functions (`base44/functions/*`) + `base44/shared/*` modules | One function per bounded operation; shared logic extracted, never copied |
| Prisma + PostgreSQL | Platform entities (`base44/entities/*.jsonc`), Postgres-backed, versioned schema | Schema is the migration; every entity change ships its schema |
| Row-level security | Entity `rls` blocks with tenant and role conditions | Isolation is enforced at the data layer, not in the UI |
| Redis + BullMQ job orchestration | Workflows + scheduled functions, durable waits | Long-running and scheduled work is observable in Workflows |
| Keycloak SSO / MFA | Platform authentication (SSO, MFA, session management) | Auth is never re-implemented in app code |
| OpenSearch | Platform search + server-side filters/aggregates | Lists never filter whole datasets in the browser |
| Azure Storage | Platform public/private file storage with signed URLs | Evidence files follow the same retention rules |
| Terraform / Kubernetes / GitHub Actions | Platform deployment and publish pipeline | Environment parity is the platform's responsibility |
| OpenTelemetry / App Insights | Runtime logs + audit registers | Every governed action writes an audit row |

**Non-negotiable:** the app is not re-platformed. The specification is satisfied through these
equivalents, and the mapping above is the audit trail for that decision.

## 3. The absolute platform laws

Every capability must be auditable, versioned, traceable, searchable, permission-controlled,
evidence-linked, workflow-enabled, mobile-compatible, reportable, AI-assistable, accessible and
multi-tenant safe. How each law is met, in code:

- **Auditable** — governed writes record actor, time, before/after or an append-only event.
- **Versioned** — immutable snapshots (`WorkflowVersion`, `WorkspacePreferenceVersion`, document versions).
- **Traceable** — `KnowledgeLink` typed relationships across standard → control → evidence → finding → CAPA.
- **Permission-controlled** — entity `rls` plus `RoleGate` navigation gating.
- **Evidence-linked** — evidence rows carry control and standard references; nothing is "done" on assertion.
- **Workflow-enabled** — draft → validate → publish → run, with pinned versions per run.
- **Reportable** — every register exports; executive and board reporting reads the same records.
- **Accessible** — WCAG 2.1 AA targets: visible focus, labelled controls, no colour-only meaning.
- **Tenant-safe** — `tenant_id` on every owned record; tenant predicate kept even where a proxy cannot infer a schema.

## 4. Enterprise Integrity Index (executable)

Implementing file: `src/lib/integrityIndex.js`. Surface: Executive Dashboards → Enterprise Integrity Index.

| Dimension | Weight | Measured from |
| --- | --- | --- |
| Governance | 15% | governance objects in force, reviews past due, approved board resolutions, resolution reviews past due |
| Compliance | 15% | active and draft controls, resolved and open issues, current and expired policies |
| Risk | 10% | open risks held low/medium, closed risks, open high/critical risks, risk reviews past due |
| Audit | 10% | audits complete / in progress / follow-up required, findings closed vs open |
| Evidence | 10% | evidence verified vs awaiting verification vs expired or rejected |
| Workforce | 10% | certificates current / expiring / expired or revoked, training in date vs lapsed |
| Clinical Governance | 10% | active care plans, reviews past due, consent pending, referrals completed vs follow-up overdue |
| Trust | 10% | complaints resolved vs open, feedback finalised vs awaiting action |
| Assurance | 5% | controls tested within schedule vs control tests past due |
| Strategic Outcomes | 5% | goals achieved vs open, projects complete vs past due |

**Computation law.** Each measure is a real count for the signed-in business. A dimension scores
`good ÷ (good + bad)`; the index is the weighted mean of **measured** dimensions only. Weight that
could not be measured is reported as coverage, never scored as zero and never scored as full marks.
An empty register therefore reports *not measured*, not 100.

**Bands.** Exemplary ≥ 90 · Assured 75–89 · Developing 60–74 · At risk < 60.

**Explainability.** Every dimension expands to the exact counts behind it. No score may be
displayed without its contributing measures reachable from the same screen.

## 5. Universal evidence chain

```
Framework → Standard → Requirement → Obligation → Control → Policy → Procedure
→ Training → Competency → Evidence → Assessment → Audit → Finding → CAPA → Outcome
```

Implemented through `RegulatoryStandard`, `ComplianceControl`, `AssuranceEvidence`,
`AssuranceFinding`, `KnowledgeLink` and the Assurance & Audit Matrix. A link that cannot be walked
end to end is a gap, not a completed chain.

## 6. AI governance law

Every AI action records its prompt, context, evidence sources, confidence, recommendation, approval
status and outcome (`AiInteraction`, `AiRecommendation`, `AiGovernanceRecord`).

AI may draft, detect, summarise and recommend. AI may never approve, close a finding, bypass
evidence, override a control, or act without a named human decision. Human review is the only path
to a governed outcome.

## 7. Security and tenancy

Multi-tenant isolation, approved-access gating, role and role-matrix navigation control, private
storage for end-user uploads, and admin-only configuration. Secrets are never stored in app code.
Security posture is reported by the Security scan; findings are fixed at the root cause, not muted.

## 8. Design authority

The established brand tokens in `src/index.css` govern every surface: deep navy to violet glass,
white cards, navy text (never black), Manrope typography. The specification's palette
(`#0B1020` / `#131A2E` / `#3B82F6` / `#8B5CF6` / `#EC4899`) is treated as intent, mapped onto the
existing tokens, and must not be pasted in as raw hex on new surfaces. Tables live inside tabs;
module shells stay consistent.

## 9. Completion test

A capability is complete only when all of the following exist: schema, server-side read model,
permission rules, workflow path, audit trail, evidence link, reporting/export, honest AI assist
where applicable, documentation, tests, and an entry in the operating-system register with its true
state. Anything less is recorded as `partial` or `gap`. **Nothing is described as delivered unless a
user can do the thing on screen, against real records, today.**

**Final governance law.** If a capability cannot be owned, governed, measured, evidence-linked,
verified, audited, reported, improved and trusted, it must not exist.

## 10. Change control

1. Any change that alters a weight, threshold, band, or the completion test updates this file in the
   same change, and the executable form in `src/lib/integrityIndex.js`.
2. The weights in §4 and in code must always sum to 100 and agree exactly; `tests/integrityIndex.test.mjs`
   fails the build if they diverge.
3. Register states in `src/lib/enterpriseOS.js` may only move upward (`gap → partial → live`) with
   evidence in the same change, and downward immediately when a regression is found.
