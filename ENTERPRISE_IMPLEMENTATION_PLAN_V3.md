# ComplianceHR Infinity — Enterprise Implementation Plan V3.0

Owner direction received: 15 November 2026 (Australia/Brisbane).
Existing application: 6ac9f91f0d82b1f80ec6a25f. Framework: Vite React SPA.
This is the master sequence for the next major evolution. It extends the existing platform and earlier approved module scope; it does not authorise replacing working modules or removing unfinished requirements.

## Delivery rules

- Evidence first; every action, document, decision, incident, risk, audit and improvement must be traceable.
- Reuse AppLayout, ModuleShell, module directory, existing routes/IDs, Universal360, approvals, tasks, registers, evidence and current tenant/role enforcement.
- Preserve the blue, dark blue, purple and pink branding, glass surfaces and iPad Quick Access.
- Checkpoint before and after tested batches. Update MASTER_TODO.md with dated implementation evidence.
- Saved source, synthetic tests, authenticated runtime acceptance and production publication are separate statuses.
- No production publication in this program batch. Existing disabled workflow gates remain disabled until their acceptance blockers close.
- Schema counts are planning estimates, not instructions to create duplicate entities. Inventory and reconcile existing schemas before extending them.
- REST, GraphQL and webhook contracts are targets; no endpoint is considered implemented until authenticated, tenant-isolated, validated and tested.

## Master release sequence

| Release | Purpose and deliverables | Dependencies / acceptance |
|---|---|---|
| 1 — Platform Foundation | Universal navigation: AI Core, My Workspace, Operating Systems (Governance, Compliance, Risk, Audit, Workforce, Allied Health), Enterprise Registers, Reports & Analytics, Administration. Universal permissions: roles, hierarchy, delegations, temporary and auditor access, approval authority matrix. Global search: participants, employees, incidents, risks, audits, evidence, policies, board papers, training and projects. Tenant architecture, API gateway and audit logging. | Reconcile current matrix, membership and tenant enforcement. Denied access must fail on the server. Temporary access expires and revokes. Navigation and search must not reveal unauthorised records. Release 1 remains partial. |
| 2 — Enterprise Evidence Engine (critical) | Upload evidence once and reuse everywhere. Register: evidence number, title, category, source, owner, organisation, review date, approval status and version. Relationships to standards, obligations, controls, risks, audits, incidents, participants, employees and board papers. Lifecycle Draft → Submitted → Reviewed → Approved → Archived. Review workflow, version control, search and Evidence API. | Reuse AuditEvidenceFile/document control where appropriate. Resolve exact-version acceptance and private-file access. Preserve historical evidence and relationship integrity. |
| 3 — Governance OS | Board dashboard, calendar, papers, resolutions, actions and minutes. Strategic goals, projects, KPIs, outcomes and performance reviews. Board, committee, decision, delegation, policy and conflict registers. Board Pack, CEO Pack, risk and compliance reporting. Board and CEO workspaces. | Reuse governance, meetings and projects. Decisions link to authority, source evidence, owners and actions. Reports distinguish missing and unassessed information. |
| 4 — Compliance OS | NDIS, aged care, ISO and internal standards library; obligations linked to requirements with owner, review date and status; controls, testing, reviews and effectiveness; compliance calendar; regulatory change for NDIS, aged care, Fair Work, WHS and privacy; attestations. | Reuse existing standards and compliance sources. Preserve source/effective dates, obligations and evidence versions. No unsupported compliance claims. |
| 5 — Risk OS | Enterprise risk register with inherent/residual risk, control effectiveness, treatment plans and owners. Control–evidence–risk–audit links. Quarterly, annual and high-risk reviews. Heatmaps, trends, emerging/top risks, treatment register and scorecards. | Ratings require defined scales and recorded rationale. Review automation needs owner, schedule and escalation acceptance. |
| 6 — Audit OS | Audit universe for functions, sites, programs and services. Planning, scheduling, execution, findings and verification. Finding → root cause → action → owner → due date → verification. CAPA and assurance reporting. | Requirement → Control → Evidence → Audit → Finding → Action → Verification. Reuse existing Audit, InternalAudit, AuditAction and quality workflows. |
| 7 — Workforce OS | Recruitment vacancies/candidates/interviews/offers. Onboarding induction/training/documents/checks. Performance goals/reviews/development. Learning, competency and credential matrices. Establishment, FTE, vacancies and succession planning. | Preserve restricted HR matters. Existing onboarding, screening and qualification workflows require authoritative sources and eligibility evidence. |
| 8 — Clinical Governance & Allied Health OS | Clinical risk, incidents, audits, reviews and supervision. Discipline workspaces: occupational therapy, speech pathology, physiotherapy, psychology, social work and exercise physiology. Goals, assessments, outcome measures and intervention results. | Existing allied health catalogue is not proof of completed clinical workflows. Consent, clinical scopes, sensitive record boundaries and assessment provenance required. |
| 9 — Role-Based Workspaces | 15+ dedicated workspaces with role-based navigation, dashboards and permissions. Board: strategic KPIs/actions/compliance/risk. CEO: organisation/workforce/financial/risk/compliance health. Compliance manager: assessments/reviews/evidence/obligations/actions. Risk manager: risks/treatments/reviews/heatmaps. Auditor: audits/samples/findings/evidence verification. | Extend current workspaces and actual role matrix. No role is granted or promoted merely to make its dashboard accessible. |
| 10 — AI Core | Compliance, Risk, Audit, Governance, Workforce, Clinical, Executive and Reporting agents. Permission-filtered retrieval, enterprise knowledge base/RAG, evidence queries, gap summaries, audit plans, evidence review, findings summaries, Board/CEO reports and organisation health summaries. Predictive analytics and automated reporting. | Every answer references authorised sources and freshness. Human review before consequential actions. Verified app-level provider ownership before external transfer. No fabricated predictions/readiness. |

## Database stages

1. Core platform: users, roles, permissions, organisations, sites and teams — approximately 50 tables in the owner's planning model.
2. Enterprise engines: evidence, workflow, approvals, notifications, automation and search — approximately 75.
3. Operating systems: governance, compliance, risk, audit, workforce and clinical — approximately 250+.
4. Enterprise registers: target 80 master registers.

These are future estimates, not verified current totals or migration instructions. Existing entity inventory, RLS and data contracts take precedence over blind table creation.

## API targets

All modules target authenticated REST, GraphQL and webhook events. Proposed domains:
`/api/governance`, `/api/compliance`, `/api/risk`, `/api/audit`, `/api/workforce`, `/api/clinical`, `/api/ai`.
These are desired contracts, not claims that those endpoints currently exist.

## Sprint order

| Sprints | Scope |
|---|---|
| 1–4 | Foundation, permissions, navigation and search |
| 5–8 | Evidence, workflow and notification engines |
| 9–12 | Governance and compliance |
| 13–16 | Risk and audit |
| 17–20 | Workforce and executive workspaces |
| 21–24 | Clinical governance and allied health |
| 25–28 | AI Core, predictive analytics and enterprise reporting |

## Final assurance chain

Legislation → Standard → Requirement → Obligation → Control → Evidence → Assessment → Review → Audit → Finding → Corrective Action → Verification → Executive Assurance → Board Assurance.

## Current batch

Navigation and search implementation evidence is in the newest V3 section of MASTER_TODO.md. The full ten-release transformation is not complete. Unverified existing features must not be relabelled complete by this document.
