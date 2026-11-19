# ULTIMATE ALL-IN-ONE MASTER SPECIFICATION (v1.0)

**ComplianceHR Infinity — governing build constitution**
Installed 17 November 2026. Supersedes the executive summaries in
`docs/specifications/COMPLIANCEHR_INFINITY_MASTER_PROMPT.md`, `docs/specifications/ULTIMATE_MASTER_BUILD_SPECIFICATION_V2.md` and
`docs/specifications/ULTIMATE_EVERYTHING_SPECIFICATION_V1.md` where they differ. This document is the authority for
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
4. Module-level documents (`docs/history/MODULE_EVIDENCE_MATRIX.md`, `PHASE11_*`, `ENTERPRISE_*`) — detail that
   must never contradict 1–3.

The owner specification governs required outcomes. Current source and test evidence govern observed implementation status; correct status documentation without weakening unmet owner requirements.

## 2. Current implementation and requested target architecture

The current app is React 18, Vite, React Router, Tailwind and Base44 SDK with entity schemas and backend functions. Preserve its existing IDs, routes, AppLayout, ModuleShell, Universal360, Knowledge Graph, Evidence, Readiness and iPad Quick Access.

The owner's Next.js, NestJS, Prisma, PostgreSQL, Redis, BullMQ, OpenSearch, Azure Storage, Keycloak, Docker, Kubernetes, Terraform, GitHub Actions, Application Insights and OpenTelemetry stack remains requested target architecture. No stack migration or infrastructure equivalence is established by this batch. A separate implementation/cutover/rollback package and verified acceptance are required. Vendor internals, durable scheduling, universal audit atomicity, MFA, disaster recovery and environment parity have not been verified here.

## 3. The absolute platform laws

Every capability must be auditable, versioned, traceable, searchable, permission-controlled,
evidence-linked, workflow-enabled, mobile-compatible, reportable, AI-assistable, accessible and
multi-tenant safe. The following are intended controls; source presence does not establish full acceptance:

- **Auditable** — governed writes record actor, time, before/after or an append-only event.
- **Versioned** — immutable snapshots (`WorkflowVersion`, `WorkspacePreferenceVersion`, document versions).
- **Traceable** — `KnowledgeLink` typed relationships across standard → control → evidence → finding → CAPA.
- **Permission-controlled** — entity `rls` plus `RoleGate` navigation gating.
- **Evidence-linked** — evidence rows carry control and standard references; nothing is "done" on assertion.
- **Workflow-enabled** — draft → validate → publish → run, with pinned versions per run.
- **Reportable** — per-register reporting and export require acceptance against authorised records.
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

**Computation law.** Each measure is a real count for the signed-in business. A proposed operational dimension scores `positive indicator occurrences ÷ total indicator occurrences` only after every required read succeeds and at least one countable occurrence exists. Missing, denied, malformed or failed reads withhold that dimension. The overall index uses the fixed owner weights divided by 100 only when all ten dimensions are measurable; otherwise the overall score is withheld. Coverage is shown separately and weights are never renormalised. Counts may overlap and status counts are not independently verified evidence. The indicator definitions require governance review and authenticated validation before use as enterprise assurance.

**Bands.** Neutral indicator ranges: 90–100, 75–89, 60–74 and below 60. These are proposed presentation thresholds, not assurance classifications.

**Explainability.** Every dimension expands to the exact counts behind it. No score may be
displayed without its contributing measures reachable from the same screen.

## 5. Universal evidence chain

```
Framework → Standard → Requirement → Obligation → Control → Policy → Procedure
→ Training → Competency → Evidence → Assessment → Audit → Finding → CAPA → Outcome
```

Existing supporting sources include `RegulatoryStandard`, `ComplianceControl`, `AssuranceEvidence`,
`AssuranceFinding`, `KnowledgeLink` and the Assurance & Audit Matrix. A link that cannot be walked
end to end is a gap, not a completed chain.

## 6. AI governance law

Every AI action must record prompt, context, evidence sources, confidence score, risk score, recommendation, approval status, decision outcome and audit trail. Existing AI source entities require per-path verification; this batch does not establish universal enforcement.

AI may draft, detect, summarise and recommend. AI may never approve, close a finding, bypass
evidence, override a control, or act without a named human decision. Human review is the only path
to a governed outcome.

## 7. Security and tenancy

Required: multi-tenant isolation, approved-access gating, RBAC/ABAC, SSO/MFA, encryption, secret/session management, audit logging, monitoring/threat detection, private storage and authorised configuration. Authenticated tenant/role/file/API tests remain open; this batch adds scoped read requests and role gates only. Secrets are never stored in app code.
Security posture is reported by the Security scan; findings are fixed at the root cause, not muted.

## 8. Design authority

The owner's palette is authoritative: background #0B1020; surfaces #131A2E/#1A2240; blue #3B82F6; purple #8B5CF6; pink #EC4899; success #10B981; warning #F59E0B; critical #EF4444; text #FFFFFF/#B8C0D4. Apply through shared tokens with contrast and responsive checks. Microsoft Fabric/Azure Portal/Power BI style and WCAG 2.1 AA are targets. No global recolour or accessibility certification is claimed in this batch.

## 9. Completion test

A capability is complete only when all of the following exist: schema, migration, entity, DTO, validation, controller, service, repository, workflow, permissions, audit trail, evidence integration, reporting, AI integration, documentation, tests, monitoring and deployment. Platform adapters require explicit contract mapping and acceptance; current equivalents are not automatically accepted. An entry in the operating-system register must show the true state. Anything less is recorded as `partial` or `gap`. **Nothing is described as delivered unless a
user can do the thing on screen, against real records, today.**

**Final governance law.** If a capability cannot be owned, governed, measured, evidence-linked,
verified, audited, reported, improved and trusted, it must not exist.

## 9a. V8000 foundation — implementation status (pass 1, 17 November 2026)

Realised in this app at `/v8000` (V8000 Evidence Fabric), using existing entities only:

- **Evidence Fabric** — framework → standard → obligation → requirement → control → evidence → finding → outcome, per
  standard, with node detail for every control and the evidence state of each record. Engine: `src/lib/v8000Engine.js`.
- **Calculations** — trust, coverage, gap, review, evidence-state and readiness from stored records. Unmeasured parts are
  excluded from the score and reported as coverage; an empty business reads *not measured*, never 100.
- **Validation** — ten traceability and validation checks, each with a count and the register to act in. No checks means
  nothing was detected in the loaded records, not that the business is compliant.
- **Entry points** — Executive, Board, Trust, NDIS, Aged Care, Clinical Governance, Workforce, Audit and Risk, each showing
  live counts from its own registers and an explicit empty state.
- **Copilot** — persistent dock on every page for AI OS roles, offering evidence gaps, readiness review, audit summary,
  executive report and corrective actions through the governed `aiCopilot` function. Output is labelled an AI draft with
  cited sources; it cannot approve, close or alter a record.

**Deferred, and why:** the specification's Next.js/NestJS/PostgreSQL/Redis/Keycloak stack is not adopted (§2). Per-framework
executive dashboards are entry points onto existing modules rather than nine new dashboards. Weighted readiness is a
management indicator, not an audit opinion. SLA automation, notification fan-out and external integrations are outside this
pass.

## 10. Change control

1. Any change that alters a weight, threshold, band, or the completion test updates this file in the
   same change, and the executable form in `src/lib/integrityIndex.js`.
2. The weights in §4 and in code must always sum to 100 and agree exactly; `tests/integrityIndex.test.mjs`
   fails the build if they diverge.
3. Register states in `src/lib/enterpriseOS.js` may only move upward (`gap → partial → live`) with
   evidence in the same change, and downward immediately when a regression is found.

## 11. Complete owner scope retained as requirements

The exact owner prompt is also retained in this app's builder conversation dated 17 November 2026. These catalogues are requirements, not delivered capabilities.

- Purpose: governance, compliance, risk, audit, quality, workforce, learning, incidents, complaints, feedback, NDIS, aged care, clinical governance, allied health, evidence, reporting/BI, audit readiness, AI, automation, enterprise assurance, trust through evidence and organisational integrity.
- Philosophy: People → Responsibility → Activity → Evidence → Assurance → Trust → Decision → Outcome → Improvement → Integrity.
- Industries: NDIS, aged care, allied health, healthcare, community services, disability support, home care, corporate enterprises, professional services, not for profit and government.
- Framework mapping targets: NDIS Practice Standards/Quality Indicators, Aged Care Quality Standards/Strengthened Standards, Fair Work, Privacy Act/APPs, WHS, clinical governance, NSQHS, ISO 9001/27001/31000, corporate and internal governance. Current authoritative sources/effective dates must be verified before regulatory mappings are claimed.
- Operating systems (25): Platform Shell, Workspace, Governance, Compliance, Risk, Audit, Quality, Workforce, Learning, Incident, Complaint, Feedback, Evidence, Clinical Governance, Allied Health, NDIS, Aged Care, Reporting, Analytics, AI Core, Automation, Security, Administration, Trust and Assurance. Preserve prior compatible Integration/Executive scope.
- Workspaces (18): Board, CEO, General Manager, Compliance, Quality, Risk, Audit, Clinical Governance, Workforce, Learning, NDIS, Aged Care, Allied Health, Evidence, Incident, Complaints, Reporting and Administration.
- Allied health: occupational therapy, speech pathology, physiotherapy, psychology, social work, exercise physiology; clients, assessments, goals, interventions, session notes, outcome measures, care plans, clinical reviews, supervision and competencies.
- NDIS: participants, service agreements, support delivery, progress notes, incidents, restrictive practices, complaints, worker screening, evidence mapping, practice standards and audit readiness.
- Aged care: residents, care plans, quality standards, clinical governance, medication, workforce compliance, consumer outcomes, quality reviews and accreditation readiness.
- Universal entity contract: id, tenantId, code, name, description, status, version, ownerId, createdBy/createdAt, updatedBy/updatedAt, deletedAt, permissions, evidenceLinks, workflowState, auditTrail, trustScore, assuranceScore and healthScore. Map existing snake_case fields explicitly; unknown scores stay unknown. No blanket schema rewrite performed.
- Database domains: tenants, organisations, sites, departments, users, roles, permissions, workspaces; evidence/links/verification; policies/procedures/controls/requirements/obligations/standards/frameworks; risks/assessments/treatments; audits/findings/CAPAs; incidents/complaints; training/competencies/credentials/employees; participants/residents/clients/assessments/goals/interventions/clinical reviews; reports/dashboards/notifications/workflows/approvals/tasks; AI conversations/insights; trust and assurance scores. Reconcile existing schemas before creating anything.
- Reports: executive, board, compliance, risk, audit, workforce, clinical, NDIS, aged care, allied health, trust, assurance and integrity.
- Executive Command Centre: Enterprise Integrity Index, governance, compliance, risk exposure, audit readiness, clinical governance, NDIS readiness, aged care readiness, workforce capability, evidence health, trust, assurance and strategic readiness. Proposed index source is present; full command-centre acceptance remains open.
- Workflow: Create → Review → Approve → Execute → Evidence Collection → Verification → Audit Event → Reporting → Improvement.
- Test targets: unit, integration, E2E, accessibility, security, performance, workflow, audit, permission and mobile. Simulated tests do not replace authenticated tenant/device UAT.
- Guides: architecture, security, developer, deployment, database, API, module, user, governance, risk, audit, clinical governance, NDIS, aged care and allied health.
- Environments/operations: development, test, UAT, production, disaster recovery, backup strategy, monitoring, alerting, logging and audit monitoring. Source save/checkpoint, deployment and verified recovery are separate statuses.

All historical release gates in MASTER_TODO.md and docs/history/PHASE11_ACCEPTANCE_LOG.md remain open unless closed with current evidence. This batch does not complete the full platform.
