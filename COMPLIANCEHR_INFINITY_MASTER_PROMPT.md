# Controlling master specification — 17 November 2026

## Latest authority: Ultimate Master Build Prompt v2.0

The owner supplied ULTIMATE_MASTER_BUILD_SPECIFICATION_V2.md on 17 November 2026 as the latest governing specification and authorised completion of the outstanding build. It supersedes v1.0 where requirements differ. Its 22 operating systems, phases 0–12 and ordered 44 database migrations are requirements, not deployed capabilities. BaseEntity now explicitly includes tenantId. Complaint, Feedback, Analytics, Integration and Security OS must be reconciled with existing modules rather than duplicated. The earlier Customer/Executive and other compatible capabilities remain supporting scope.

Phases 0–12 are the new enterprise roadmap namespace; they do not renumber or mark complete the existing Phase 11 Workflow Studio release/stories. Preserve both namespaces and their evidence. Use the engineering/acceptance boundaries below with the new specification; PostgreSQL migration numbers are target planning order, not executed Base44 migrations.

## Previous authority: Ultimate Everything Prompt — Master Enterprise Specification v1.0

The owner's full current specification is preserved in [ULTIMATE_EVERYTHING_SPECIFICATION_V1.md](ULTIMATE_EVERYTHING_SPECIFICATION_V1.md). It is retained as previous scope; the v2.0 specification above now controls conflicting requirements. Earlier detailed implementation plans remain supporting backlog where compatible; preserve existing capabilities and evidence. Installing this specification is documentation work, not feature delivery or release acceptance.

### Application and migration boundary

Continue in the existing ComplianceHR Infinity main app (6ac9f91f0d82b1f80ec6a25f). Current package.json records React 18, Vite, React Router, Tailwind and the Base44 SDK. The owner specifies Next.js 15 / React 19 / NestJS / Prisma / PostgreSQL / Redis / BullMQ / OpenSearch / Azure / Keycloak plus a monorepo target. Record this as the requested target architecture; it is not deployed by adopting the specification. Prepare a separately reviewable migration with canonical-ID/route preservation, auth/session mapping, tenant policy parity, data reconciliation, staged cutover and tested rollback before replacing the working platform. Do not silently substitute that target with a claim of Base44 equivalence.

The new design tokens (background #0B1020, surfaces #131A2E/#1A2240, blue #3B82F6, purple #8B5CF6, pink #EC4899, white/secondary text, 16px radius and Fluent icons) supersede the earlier pastel-only COLOUR_RULE.md for future design work. This adoption batch does not apply a global recolour or replace icons. Reconcile actual CSS/module tokens and contrast before implementing; retain accessible responsive and iPad Quick Access behaviour.

### Required engineering interpretation

- Tenant scope is mandatory even though the owner's BaseEntity excerpt does not list tenantId. Derive effective tenant and actor from trusted server context; reject cross-tenant IDs in reads, writes, search, files, graph traversal, exports and cached results.
- UI workspace states and persisted lifecycle statuses are separate concepts. Define a validated transition matrix, maker/checker authority and exact-version approvals before enabling publish/activate/archive actions.
- The owner's action sequence is a business dependency sequence. Persist the business change, audit event, evidence relationship and version snapshot atomically where supported; otherwise keep the capability explicitly blocked until an equivalent recoverable protocol is proven. Deliver notifications, report updates and optional AI analysis after durable commit using idempotent processing. AI failure must not lose or replay a committed business action.
- Evidence links must reference real authorised evidence and exact versions. Do not invent evidence solely to populate a universal contract. Track missing/unverified evidence honestly and enforce evidence prerequisites for actions that require it.
- AI assistance must respect the same tenant, role, record and field policies as direct use. Recommendations are reviewable and cannot grant permissions, independently approve their source work or declare regulatory assurance.
- API contracts are target contracts. Document and test any adapter from current Base44 response/field conventions. Do not claim the proposed /api/v1 routes, Prisma entities, controllers or guards exist until implemented and exercised.
- Regulatory/framework names in the specification are requirements to map against current authoritative sources, not verified legal mappings or certification.
- Preserve all unresolved gates from MASTER_TODO.md and PHASE11_ACCEPTANCE_LOG.md. Earlier passing checks are historical evidence, not proof that new requirements are complete.

### Delivery queue and acceptance evidence

| Stage | Required work | Acceptance evidence |
| --- | --- | --- |
| 1 — Inventory and boundary | Map each target OS, shell element, entity, route and shared engine to current source; classify Missing, Partial, Implemented, Verified or Blocked | Exact source references, current check results and explicit gaps; no inferred completion |
| 2 — Tenant and security | Validate server-derived tenancy, permission matrix and direct API/file/search/export isolation | Authenticated tenant A/B and denied-role tests, revoked access, scoped cache checks |
| 3 — Workspace foundation | Reuse AppLayout and canonical engines for layouts, widgets, panels, versions, history and state transitions | Authorised persistence/reload, invalid/stale transition rejection, version/audit/evidence consistency |
| 4 — Shell and machine | Integrate header/sidebar/canvas/context/dock/command/AI plus graph node behaviour | Keyboard/touch/mobile journeys, valid scoped graph edges, error/loading states and exact-version links |
| 5 — Domain coverage | Reconcile all 18 requested operating systems and the 14-stage traceability chain | Real record-to-evidence-to-finding/CAPA/outcome journeys with role controls |
| 6 — Engines and contracts | Complete workflow, automation, search, reporting, AI and documented API adapters | Invalid-input, duplicate/retry, failure-injection and concurrency checks; truthful metrics |
| 7 — Architecture migration | Produce and review the target stack migration package before changing runtime | Reconciled data, permission parity, staged cutover rehearsal and successful restore |
| 8 — Release | Verify accessibility, security, performance, mobile, DR and required sign-off | Retained test/UAT evidence and explicit release decision; specification adoption alone never releases |

The following sections are supporting implementation history and compatible backlog.


## Combined OS upgrade and module finalisation pack — 17 November 2026 (Australia/Brisbane)

Owner authorised installation on main and combination of all 36 continuation prompts. This section is the execution sequence within the existing controlling specification, not a replacement app or a claim of implemented features.

### Execution instruction applying to all 36 steps

Continue in the EXISTING ComplianceHR Infinity Base44 app, main branch (app 6ac9f91f0d82b1f80ec6a25f). Preserve the remainder of this master specification, the current Phase 11 v2 requirements, existing architecture, canonical records/IDs/routes, AppLayout, ModuleShell, Universal360, Knowledge Graph, Evidence, Readiness, Executive Intelligence and iPad Quick Access.

Read current implementation and evidence before each change. Reference SQL/Prisma/Kafka/API contracts do not authorise production migration or prove deployed infrastructure. Do not create a replacement app, duplicate modules/masters or force historical catalogue counts onto real inventory. Reconcile source differences explicitly; a missing reference package is a tracked blocker, never permission to invent release scope.

Use dark blue glass surfaces with blue, purple and pink accents; avoid black backgrounds. Maintain readable contrast, keyboard/touch accessibility and responsive layouts.

For EVERY step: inspect current code/dependencies; identify implemented/missing scope; take a recoverable checkpoint; implement persistence, server permissions, validation, error handling, audit and connected navigation; run appropriate checks and affected journeys; checkpoint passing work; record changed files, evidence and blockers in MASTER_TODO.md. Continue independent work when a dependency is blocked. Follow one mutation session per app; do not edit alongside an active builder.

Reuse canonical task/approval/evidence/document/staff/participant adapters. Authorise server-side before reads, writes, aggregation, search, exports, graph expansion, files and cache population. Enforce tenant and record scope. Do not grant access from display names alone.

No fabricated records, statistics, evidence, completion, regulatory assurance or delivery states. Show empty/unavailable/failed/pending/verified honestly. Unsupported handlers stay disabled; no simulated success. Unknown/zero metric denominators are unavailable.

Run steps in dependency order with dashboards as the initial product priority after essential baseline/security/navigation work. Complete or explicitly block dependencies before executing downstream automation. Use existing verification rather than restarting proven work. Installing this pack does not execute its backlog or schedule a background build. Publication requires applicable verified gates and sign-off.

### Current acceptance boundary

PHASE11_ACCEPTANCE_LOG.md records a supervised runtime and later independent-publication/maker-checker changes. Its latest governance entry supersedes earlier weaker controls; preserve the stronger implemented controls. Transactional/CAS/outbox/inbox guarantees, scheduler/SLA events, actual file quarantine/hash/verification, board quorum/conflicts, MFA, unsupported adapters, classified/location ABAC, representative load/DR and F095 remain OPEN until independently evidenced. Preserve all current release gates.

### Combined build sequence

#### 01 — Establish the upgrade baseline

Inspect the actual modules, navigation groups, routes, entities, functions, dashboards, workflows, integrations and verification evidence. Reconcile the historical 51-module / 13-group plan against the current app; do not force historical counts onto current implementation. Record canonical ID, route, group, owner, dependencies, permissions, gaps and evidence for each module. Use Not Assessed, Missing, Partial, Implemented, Verified and Blocked; track production status separately. Save a baseline checkpoint and dependency-aware queue.

#### 02 — Repair permissions and truthful data

Inspect frontend and backend controls together. Remove date-based bypasses and permissive placeholders where present. Enforce a single server-side policy with explicit existing-role adapters. Test direct routes, raw entities, functions, search, exports, revoked membership and tenant isolation. Remove fallback master records, fixed readiness scores and unsupported verification labels. Show request failures as failures, never successful empty populations. Preserve genuine records and audit history. Critical isolation failures block publication.

#### 03 — Finalise navigation and module organisation

Use the reconciled canonical directory for navigation, search and Quick App dashboard. Preserve IDs, routes, valid deep links and iPad Quick Access visual treatment. Provide role-appropriate favourites, recent modules and active states; persist preferences by user and tenant. Repair duplicates, broken destinations, labels and wasted space. Verify mobile menus, keyboard access, refreshes and authorised/denied direct links.

#### 04 — Complete the dashboard framework

Reuse the existing dashboard framework for Director, Manager, Team Leader, Business Support, Support Worker, Participant/Guardian and Auditor. Support authorised widget selection, ordering, size, saved filters, logo, business name, slogan and approved images. Query real scoped data with freshness and reporting periods. Distinguish loading, empty, unavailable and failed states. Verify saved preferences, identity switching and tenant cache separation.

#### 05 — Finalise priority dashboards

Complete Executive, Operations, Workforce, Compliance and Communication dashboards before lower-priority presentation work. Cards must open exact filtered registers or records. Include overdue work, pending decisions, unverified evidence and exceptions. Implement previously requested Jamie/Sherelle organisation administration only after resolving verified identities and explicit grants; never infer platform-wide access. Make Staff Leaderboard fair, configurable and permission-controlled; exclude sensitive clinical, payroll and participant information.

#### 06 — Connect shared enterprise engines

Inspect and connect existing Task, Approval, Evidence, Document, Notification, Search, Audit and Reporting engines through canonical adapters. Specify commands, authorised queries, correlation IDs, exact references and failure behaviour. Prevent duplicate canonical records from one business action. Link module work to its source and authorised 360 view. Verify task-to-approval-to-evidence journeys. Keep unsupported dependencies unavailable and explicitly tracked.

#### 07 — Finalise Universal360 and traceability

Reuse the shared framework for participant, staff, organisation, supplier, incident, risk, audit, document and standard views. Connect authorised tasks, approvals, findings, evidence, actions, relationships and history through exact IDs/versions. Validate Knowledge Graph endpoints and reviewed mappings. Distinguish inaccessible, broken, expired and unverified links. Authorise before expansion, counts, previews and exports. Remove fixed readiness and unsupported assurance claims.

#### 08 — Complete Workflow Studio release 11.1

Implement WF-001–WF-019. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Complete missing foundations and link stories to real code and evidence. A schema, screen or specification alone is not delivery. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 09 — Complete Workflow Studio release 11.2

Implement WF-020–WF-039. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Verify dependencies from 11.1, exact versions, tenant scope and canonical adapters. Test success, invalid inputs, denials and stale updates. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 10 — Complete Workflow Studio release 11.3

Implement WF-040–WF-054. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Complete persistence, validation, permissions and audit behaviour. Reject unknown node settings and invalid references. Schema validity is not execution authority. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 11 — Complete Workflow Studio release 11.4

Implement WF-055–WF-079. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Test duplicate commands, concurrent changes and partial failures wherever state changes. Show persisted outcomes accurately. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 12 — Complete Workflow Studio release 11.5

Implement WF-080–WF-104. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Apply independent approval, conflict, delegation and authority checks wherever decisions occur. Exercise rejection, rework, expiry and denied actions. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 13 — Complete Workflow Studio release 11.6

Implement WF-105–WF-129. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Where evidence/documents occur, bind decisions to exact versions and file access. Distinguish uploaded, reviewed and independently verified; test expiry/replacement. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 14 — Complete Workflow Studio release 11.7

Implement WF-130–WF-159. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Prove required concurrency and durable persistence before automated execution. Keep supervised execution and block unsafe automation when atomicity or an equivalent safe protocol is unproven. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 15 — Complete Workflow Studio release 11.8

Implement WF-160–WF-184. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Where timers/SLA occur, require durable scheduling and explicit timezones. Test restart, duplicates, rescheduling and retained historical breaches. Browser timers are insufficient. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 16 — Complete Workflow Studio release 11.9

Implement WF-185–WF-214. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Verify permitted and blocked completion through canonical adapters. Escalation must retain original obligations/deadlines and never silently imply approval. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 17 — Complete Workflow Studio release 11.10

Implement WF-215–WF-244. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Every action must have real authorised persistence. Where communications occur, distinguish queued, accepted, delivered and failed; enforce classification and consent. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 18 — Complete Workflow Studio release 11.11

Implement WF-245–WF-269. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Where analytics occur, expose period, population, formula version, numerator, denominator, exclusions and freshness. Unknown/zero denominators yield unavailable rates. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 19 — Complete Workflow Studio release 11.12

Implement WF-270–WF-309. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Where AI occurs, keep outputs advisory, permission-scoped and linked to source/model/prompt versions. Require governed human review; test injection, unavailable sources and denied tool actions. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 20 — Complete Workflow Studio release 11.13 — Integrations

Implement WF-310–WF-339. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Integrations: approved connectors, server-held secret references, inbox/outbox, idempotency, bounded retry, reconciliation and restricted dead letters. Test webhook signatures, replay, destinations, duplicates, reordered/failed delivery and controlled replay. Do not claim exactly-once external delivery. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 21 — Complete Workflow Studio release 11.14 — Security

Implement WF-340–WF-369. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Security: verify tenant, role, assignment, classification, consent, delegation and independence across raw entities, commands, files, caches, search, graph, reports and exports. Include revoked access and tenant changes. Repair and retest critical failures. Security applies throughout earlier releases. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 22 — Complete Workflow Studio release 11.15

Implement WF-370–WF-400. Retrieve this release's actual title, scope, dependencies and acceptance rows from the CURRENT release-plan.md and associated v2 package; do not infer scope from numbering. If unavailable, record the missing source and reconcile the existing app backlog before claiming v2 alignment. Preserve prior story namespaces as history. Reconcile all 400 stories with evidence and accurately list verified, partial, missing and blocked scope. Exercise end-to-end paths, rejection/rework, unsupported nodes and recovery. Production acceptance remains open without required proof. Record code, checks, evidence and remaining blockers for every story. Continue independent work when dependencies are blocked.

#### 23 — Dashboard & Communication

Finalise every mapped module: applicable dashboards, inboxes, announcements, tasks, decisions, printing and communication history. Move receipting functions into Receipt Hub while preserving historical links. Verify recipients, permissions, attachments, templates, delivery failures and source links. Prevent duplicate sends and misleading delivery claims. Reconcile the actual group count.

#### 24 — People, Intake & Profiles

Finalise mapped referral, intake, consent, participant, guardian, staff and supplier journeys using canonical records. Support duplicate review, required fields, authorised contacts, documents and conversion into services. Connect profiles to 360, tasks, risks and evidence. Verify restrictions, consent changes and exports. Do not insert invented production people or sensitive demonstration data.

#### 25 — Service Delivery & Workforce

Complete mapped agreements, rosters, availability, credentials, shifts, attendance and service evidence. Validate conflicts, eligibility, assignments and authorised changes. Link exceptions to task, incident and risk processes. Verify mobile shifts and failed saves. Medication support follows approved plans, worker authority and human clinical governance; no autonomous clinical instructions.

#### 26 — Incidents, Risk & Safety

Connect mapped intake, triage, immediate safety actions, assessment, treatment, investigation, review and verified closure. Preserve awareness times, original deadlines and decisions. Use reviewed versioned risk matrices and regulatory applicability. Verify confidentiality, restricted investigations, escalation, authorised reopening and overdue visibility. Internal approval is not external regulator submission.

#### 27 — Compliance, Quality & Evidence

Connect mapped standards, obligations, controls, policies, procedures, forms, evidence, audits, findings and corrective actions. Use reviewed applicability and exact versions. Require appropriate independent verification for assurance. Repair attachments, review dates and numbering inconsistencies. Editing approved templates creates draft revisions, never automatic activation/publication. Verify controlled printing, exports and effectiveness review.

#### 28 — Training & Capability

Complete mapped requirements, learning plans, assignments, assessments, credentials and renewals. Distinguish attendance, completion, assessed competence and current verified credentials. Connect overdue requirements to workforce eligibility and manager action under approved policy. Test exemptions, expiry and evidence access. Provide scoped worker and manager dashboards.

#### 29 — Finance & Commercial

Complete mapped quotes, agreements, invoices, receipts, approvals, reconciliation and reports. Use approved effective-dated rate tables; verify applicable current rules against authoritative sources before configuration. Separate calculated, approved, issued, paid and reconciled states. Test adjustments, credits, duplicates and restricted access. Submission/payment requires supporting evidence.

#### 30 — Human Resources

Complete mapped recruitment handoffs, employment records, onboarding, leave, performance, delegations and offboarding. Verify current jurisdiction and employment-instrument requirements against authoritative sources before entitlements/payroll configuration. Restrict payroll, health, disciplinary and identity information. Link offboarding to access revocation and work transfer. Test independent approvals, effective dates, history and exports.

#### 31 — CRM, Growth & Relationships

Complete mapped enquiries, organisations, contacts, opportunities, referrals, follow-ups and history. Use canonical contacts and consent-aware communication. Convert authorised opportunities into intake/service processes without duplicates. Verify ownership, duplicate review, pipeline definitions, restricted notes and reporting periods. Label forecast assumptions and never report forecasts as earned revenue.

#### 32 — Governance & Strategy

Complete mapped board/committee records, agendas, packs, meetings, resolutions, conflicts, objectives and delegated authorities. Enforce eligible voters, quorum, abstentions, conflicts, limits and independence. Distinguish acknowledgement from approval. Link actions/decisions to risk, controls and evidence. Verify confidential access, exact pack versions, immutable approved minutes and reviewed amendments.

#### 33 — NDIS & Regulatory

Connect mapped obligations, registrations, reporting, worker checks, pricing references and evidence. Verify current rules against authoritative sources before deadlines, reportability, rates or templates. Record source, effective date, applicability and reviewer. Distinguish draft, internally approved, externally submitted and acknowledged states. Internal workflow is not regulator acceptance.

#### 34 — Community, Support & Knowledge

Finalise Community & Support Services and Help, Knowledge & Support as TWO separate groups. Complete mapped programmes, activities, bookings, attendance, accessibility and outcomes; separately complete contextual guidance, searchable articles, requests and accountable escalation. Enforce consent, safeguarding, version control and permissions. Link reviewed guidance to modules. Reconcile each inventory independently without merging canonical identities.

#### 35 — Complete the iPhone and iPad experience

Here OS means Infinity operating-system upgrade; additionally verify existing web-app usability on iPhone/iPad. Test supported Safari, orientations, safe areas, keyboard, touch targets, dialogs, tables, file selection, download/printing and accessible graph alternatives. Preserve iPad Quick Access and functional Quick App dashboard. Verify requested 30-minute inactivity lock and forgotten-PIN recovery without bypassing authentication. If installable web features exist, test updates and prevent sensitive offline caching. Do not claim native iOS/App Store delivery from web testing.

#### 36 — Finalise modules and prepare release

Run acceptance against the reconciled inventory, 13 historical scope groups and 15 v2 workflow releases. Verify navigation plus representative create/edit/submit/approve/reject/search/export/print journeys. Test tenant/role restrictions, failures, accessibility, mobile, recovery and affected regressions. Rehearse restore across records, files and workflow state; measure recovery and document rollback. Complete applicable F095 with actual evidence and distinct author/checker/approver duties. Deliver inventory, verified capabilities, defects, blockers, checks/checkpoints/recovery evidence, owners and precise release recommendation. Mark Verified only with passing evidence; critical failures block publication.

### Required execution report

For each step record: scope and canonical IDs; before/after checkpoint IDs; changed files; checks actually run and outcomes; environment/identity/data limitations; defects/blockers with owners; next executable step. Separate Installed instructions, Implemented code, Verified behaviour and Published release. Never automatically close WF tickets from this document.

---


This is the current owner-directed specification. Earlier specifications remain historical context and existing capabilities must be preserved. Requirements below are targets, not claims of delivery. Track implementation and verification in MASTER_TODO.md. Preserve the existing Base44 runtime, routes, record IDs, shared engines and approved branding. PostgreSQL/Prisma/API/warehouse deliverables are architecture contracts until separately implemented and verified; this prompt does not migrate production data.

Use this as the **single master prompt** for ComplianceHR Infinity. It consolidates everything we've built so far into one specification prompt for Base44, Claude, GPT, Lovable, Cursor, Windsurf, Replit, Bolt, Supabase, Prisma, PostgreSQL, or enterprise architecture generation.

# COMPLIANCEHR INFINITY MASTER AUDIT, COMPLIANCE, GOVERNANCE, RISK, QUALITY, EVIDENCE & ASSURANCE PLATFORM PROMPT

Act as a team consisting of:
- Enterprise Architect
- Principal Product Designer
- Chief Compliance Officer
- NDIS Lead Auditor
- Aged Care Lead Auditor
- Clinical Governance Director
- Allied Health Director
- Chief Risk Officer
- Chief Information Security Officer
- Data Governance Lead
- AI Governance Lead
- Enterprise SaaS Technical Architect
- PostgreSQL Architect
- Prisma Architect
- UX Design Lead
- ComplianceOS Architect

Build ComplianceHR Infinity, an enterprise multi-tenant SaaS platform for:
- NDIS Providers
- Aged Care Providers
- Allied Health Providers
- Community Services
- Disability Services
- Healthcare Organisations
- Enterprise Governance Teams

The platform must use an evidence-first design model where every compliance obligation can be traced from:
```
Standard
→ Indicator
→ Control
→ Audit Checkpoint
→ Evidence Requirement
→ Evidence Document
→ Finding
→ Corrective Action
→ Risk
→ Attestation
→ Executive Report
→ Board Assurance
```

# PLATFORM ARCHITECTURE
Create:
```
Compliance OS
Governance OS
Risk OS
Quality OS
Audit OS
Evidence OS
Workforce OS
Clinical Governance OS
Allied Health OS
Provider Management OS
Incident OS
Complaints OS
CAPA OS
Cyber Security OS
Data Governance OS
Vendor Governance OS
Board Assurance OS
Executive Assurance OS
AI Governance OS
Records Management OS
Enterprise Architecture OS
```

# MASTER CATALOGUES
Generate:
```
150 Compliance Indicators
IND-001 → IND-150
```
Generate:
```
50 Enterprise Controls
CTRL-001 → CTRL-050
```
Generate:
```
350 Evidence Requirements
EVD-001 → EVD-350
```
Generate:
```
356 Audit Checkpoints
AUD-001 → AUD-356
```

# AUDIT DOMAIN STRUCTURE
```
AUD-001–025
Rights & Responsibilities
AUD-026–075
Governance & Leadership
AUD-076–125
Provision of Supports
AUD-126–165
Workforce Governance
AUD-166–195
Environment & Safety
AUD-196–235
Risk, Compliance & Audit
AUD-236–275
Clinical Governance & Allied Health
AUD-276–325
Board, Executive & Finance
AUD-326–356
Vendor, Data, AI & Technology Governance
```

# INDICATORS
Create:
```
IND-001–025
Rights
IND-026–050
Governance
IND-051–065
Environment
IND-066–095
Workforce
IND-096–100
Restrictive Practices
IND-101–115
Advanced Governance
IND-116–125
Risk & Quality
IND-126–135
Clinical Governance
IND-136–145
Allied Health
IND-146–150
Outcomes
```

# CONTROLS
Create:
```
CTRL-001 Rights
CTRL-002 Consent
CTRL-003 Complaints
CTRL-004 Risk
CTRL-005 Incident
CTRL-006 Workforce
CTRL-007 Service Delivery
CTRL-008 Clinical Governance
CTRL-009 Restrictive Practices
CTRL-010 Continuous Improvement
CTRL-011–050
Governance
Risk
Audit
Clinical
Allied Health
Finance
Data Governance
Cyber Security
Vendor Governance
Board Assurance
Executive Assurance
Technology Governance
```

# EVIDENCE REQUIREMENTS
Generate:
```
EVD-001–025
Rights
EVD-026–060
Governance
EVD-061–090
Supports
EVD-091–110
Environment
EVD-111–135
Workforce
EVD-136–150
Clinical Governance
EVD-151–175
Audit
EVD-176–195
Risk
EVD-196–215
Compliance
EVD-216–230
Quality
EVD-231–240
Incident & Complaints
EVD-241–250
Cyber Security
EVD-251–265
Board Assurance
EVD-266–280
Executive Assurance
EVD-281–300
Finance
EVD-301–315
Vendor Governance
EVD-316–330
Data Governance
EVD-331–340
AI Governance
EVD-341–350
Enterprise Architecture
```

# AUDIT MATRIX
Build:
```
356 Audit Rows
```
with complete traceability:
```
AUD
→ IND
→ CTRL
→ EVD
```

# AUDIT MATRIX COLUMNS
Create a master audit matrix with:
```
audit_id
audit_code
audit_name
audit_domain
audit_subdomain
audit_category
audit_type
indicator_id
indicator_code
indicator_name
control_id
control_code
control_name
evidence_id
evidence_code
evidence_name
standard_code
standard_name
risk_id
risk_rating
criticality
inherent_risk_score
residual_risk_score
weighting
max_score
pass_score
review_frequency
evidence_frequency
owner_role
reviewer_role
approver_role
audit_status
compliance_status
audit_date
audit_period_start
audit_period_end
evidence_review_date
finding_date
corrective_action_due_date
verification_date
closure_date
next_review_date
next_audit_date
findings_count
actions_count
evidence_count
compliance_percentage
weighted_score
created_at
updated_at
```

# ROLE MODEL
Generate role workspaces for:
```
Platform Owner
Board Member
CEO
General Manager
Compliance Manager
Quality Manager
Risk Manager
Audit Manager
Clinical Governance Lead
Allied Health Manager
HR Manager
Operations Manager
Finance Manager
IT Manager
Cyber Security Officer
Service Delivery Manager
Team Leader
Support Coordinator
```
Each role must contain:
```
Dashboard
KPIs
Reports
Registers
Tasks
Approvals
AI Assistant
Widgets
Alerts
Audit Functions
Evidence Functions
Risk Functions
```

# POSTGRESQL SCHEMA
Generate complete:
```
PostgreSQL DDL
Indexes
Foreign Keys
Views
Triggers
Audit Tables
History Tables
Partitioning Strategy
```
for:
```
Indicators
Controls
Evidence
Audits
Findings
CAPA
Risks
Documents
Reviews
Attestations
Board Reports
Executive Reports
Users
Roles
Permissions
Workflows
Tasks
Notifications
```

# PRISMA SCHEMA
Generate:
```
Complete Prisma Schema
Relationships
Enums
Indexes
Soft Deletes
Versioning
Audit Columns
```

# EVIDENCE ENGINE
Build:
```
Evidence Requirement Register
Evidence Uploads
Evidence Reviews
Evidence Scoring
Evidence Freshness
Evidence Coverage
Evidence Gap Analysis
Evidence Expiry Monitoring
```

# RISK ENGINE
Build:
```
Strategic Risks
Operational Risks
Clinical Risks
Cyber Risks
Financial Risks
Vendor Risks
Risk Register
Risk Assessments
Risk Treatment Plans
KRIs
Heat Maps
Risk Reviews
Risk Dashboards
Board Risk Reporting
```

# CAPA ENGINE
Build:
```
Findings
Actions
Corrective Actions
Preventive Actions
Action Tracking
Approvals
Verification
Closure
```

# AUDIT SCORING
```
Critical = 5
High = 4
Medium = 3
Low = 2
Informational = 1
```
Compliance rating:
```
95–100 Fully Compliant
90–94 Substantially Compliant
80–89 Partially Compliant
70–79 Improvement Required
0–69 Major Non-Conformance
```
Formula:
```
Compliance Score =
(
Achieved Points
/
Available Points
)
× 100
```

# EXECUTIVE KPIs
Generate dashboards showing:
```
Enterprise Compliance %
Domain Compliance %
Open Findings
Critical Findings
Open Risks
Overdue Risks
Open Actions
Overdue Actions
Evidence Coverage %
Evidence Freshness %
Audit Completion %
Training Compliance %
Clinical Compliance %
NDIS Compliance %
Aged Care Compliance %
Cyber Security Compliance %
Governance Score %
```

# AI COPILOTS
Provide AI assistants for:
```
Compliance Copilot
Audit Copilot
Risk Copilot
Clinical Governance Copilot
Quality Copilot
Workforce Copilot
Evidence Copilot
Board Assurance Copilot
Executive Assurance Copilot
Cyber Security Copilot
```

# UI/UX REQUIREMENTS
Use:
```
Blue
Purple
Pink
```
enterprise design system.
Include:
```
Router Navigation
Role-Based Workspaces
Mobile Responsive Design
Accessibility WCAG AA
Dark Mode
Executive Dashboards
Advanced Search
Global Command Bar
Notifications
Activity Feed
Evidence Timeline
Audit Timeline
Risk Heatmaps
AI Command Centre
```

# FINAL DELIVERABLES
Generate:
```
1. Full PostgreSQL Schema
2. Full Prisma Schema
3. Full ERD
4. Full Audit Matrix
5. Full Indicator Catalogue
6. Full Control Catalogue
7. Full Evidence Catalogue
8. Full Risk Catalogue
9. Full Role Matrix
10. Full Permissions Matrix
11. OpenAPI Specifications
12. REST APIs
13. GraphQL APIs
14. AI Assistant Specifications
15. Dashboard Specifications
16. Mobile Specifications
17. Reporting Specifications
18. Data Warehouse Model
19. Power BI Model
20. Multi-Tenant SaaS Architecture
```
Build everything to enterprise production standards with complete traceability, versioning, auditability, evidence-first compliance management, NDIS alignment, Aged Care alignment, Allied Health governance, executive assurance, board assurance, and ComplianceHR Infinity architecture principles.

## Phase 11 workflow extension

The owner Phase 11 specification is preserved in `PHASE11_OWNER_SPECIFICATION.md`. The detailed design, 48 logical contracts, 22 screen contracts, permission/integration/release matrices and 336 acceptance stories are in `PHASE11_WORKFLOW_STUDIO_DESIGN.md`; the backlog is also `PHASE11_WORKFLOW_BACKLOG.csv`. These are design targets, not completed production capabilities. Track evidence and release gates in MASTER_TODO.md. Existing workflowSafety gates remain in force.

## Implementation interpretation

- Catalogue entries and generated relationships are Draft proposals until reviewed against applicable, current official sources. Numbered codes are internal identifiers, not regulator-issued requirements.
- Standard, indicator, control, checkpoint and evidence-requirement mappings require explicit reviewed relationships and exact evidence versions. A shared standard code alone never proves compliance.
- Unassessed and unknown scores remain unavailable. Do not assign invented risk records, risk scores, audit dates, signatures, approvals or board assurance.
- Use applicable available points with recorded exclusions and display assessment completeness. Never equate lack of data with either compliance or regulatory non-conformance.
- Keep existing role/tenant enforcement and approved operational access. Workspace specifications do not grant permissions.
- Do not publish until the existing release gates have evidence. Report saved source, automated tests, authenticated acceptance and publication separately.

## Ultimate Master Platform Prompt — latest owner specification (17 November 2026, Australia/Brisbane)

This section is the owner's latest product requirements, integrated into this same controlling
specification. It adds scope; it does not replace the sections above, the 36-step combined build
sequence, the Phase 11 requirements, the implemented modules, routes, record IDs, AppLayout,
ModuleShell, iPad Quick Access, or the canonical Evidence/Task/Approval/Workflow/Universal360/
Knowledge Graph engines. It does not authorise a framework migration: the deployed application
remains the existing vite_spa React 18 + Base44 runtime. Next 15 / React 19 / Nest / Prisma /
Keycloak / Azure and the referenced monorepo are reference architecture only — not deployed facts
and not permission to migrate, replace or re-platform.

### Product scope

Multi-tenant enterprise operating system for governance, compliance, risk, audit, quality,
workforce, learning, incident, NDIS, aged care, allied health, clinical, HR, reporting, evidence,
AI and automation.

Every workspace and record must be: auditable, versioned, traceable, permission controlled,
reportable, evidence linked, workflow enabled, AI assistable, searchable, and accessible on mobile.

Operating systems: Platform Shell, Workspace, Governance, Compliance, Risk, Audit, Quality,
Workforce, Learning, Incident, Clinical Governance, Allied Health, Evidence, Reporting, AI Core,
Automation, Administration.

### Shell and workspace contract

- Shell: Header, Sidebar, Workspace Canvas, Context Panel, Bottom Dock, Command Palette, Infinity AI.
- Layout: header → sidebar → KPI ribbon → canvas → context → history dock → AI → version timeline.
- View states (a way of looking, not a record status): Dashboard, Selection, Review, Investigation,
  Evidence Analysis, AI Analysis, Workflow Action, Approval, Reporting, History, Version Compare,
  Design Mode, Archived. A view state, a record lifecycle
  (Draft → Design → Review → Approved → Published → Active → Modified → Versioned → Archived) and a
  stored version snapshot are three different things and must never be conflated.
- Workspace machine: connected graph across AI Core, Governance, Compliance, Risk, Audit, Quality,
  Evidence, Policies, Controls, Training, Competency, Clinical, Allied Health, Workforce, Reporting
  and Automation, with selection, drag, connect, zoom, history, evidence, AI, permissions and audit.
- Workspace builder: drag/resize/move/configure widgets, templates, publish/compare/restore/clone,
  and personal/role/organisation layouts.
- Context sections: Properties, Metadata, Relationships, Evidence, Linked Risks, Audits, Incidents,
  Controls, Standards, Comments, Tasks, Approvals, AI Insights, Audit Trail, Version History.
- KPI ribbon: Compliance Score, Risk Score, Audit Readiness, Quality Score, Clinical Health,
  Evidence Health, Training Compliance, Workforce Compliance, Tasks Due, Incidents Open. Each figure
  must be real, scoped, and carry period, formula, source, denominator and freshness; unmeasured
  values read as unavailable. Scores are never invented.

### Data, API and traceability contracts

- Reference entities: Tenant, Organisation, Site, Department, User, Role, Permission, Workspace,
  Layout, Widget, Panel, Version, History, Template, Automation, Node, Edge, Workflow,
  WorkflowInstance, Evidence, EvidenceLink, AuditEvent, Notification, ActivityEvent, SearchIndex,
  FileStorage, AIConversation, AIInsight. Reuse the existing equivalent entities and adapters; the
  owner's base contract omits `tenant_id` and business identity, and both MUST still be enforced.
- Audit fields (id, code, status, version, createdAt, createdAtBy, updatedAt, updatedAtBy,
  deletedAt, deletedBy) are adapted to the current canonical naming; no second naming scheme is
  introduced where one already exists.
- API envelope: success, data, errors, warnings, metadata; paging as page, pageSize, totalRecords,
  totalPages; errors as errorCode, message, correlationId.
- Traceability: Framework → Standard → Requirement → Obligation → Control → Policy → Procedure →
  Training → Competency → Evidence → Audit → Finding → CAPA → Outcome, with validated exact
  references and version links. Missing, inaccessible and unverified links stay visible as such.
- Permissions: View, Create, Edit, Delete, Approve, Publish, Export, Configure, Admin mapped onto the
  canonical roles, enforced server-first, with approval/publish separation and maker-checker kept.
- Workflow: trigger → condition → rule → action → notification → audit → version. Enforcement order:
  auth → tenant → permission → business validation → workflow → audit/evidence/version → commit →
  notification/AI/reporting. Absent transactions, CAS and outbox are acknowledged, never claimed.
- AI assistants (Infinity, Compliance, Risk, Audit, Governance, Evidence, Quality, Workforce,
  Clinical, Allied Health, Reporting, Automation) are advisory only, source- and tenant-restricted,
  with governed human review.
- Documentation set: architecture, developer, API, security, module, database, workflow, permission,
  reporting, operations, deployment, DR, testing. Checks: unit, integration, E2E, accessibility,
  permission, workflow, audit, performance, security, mobile. 99.9% availability, WCAG AA,
  encryption, observability and restore/DR are acceptance targets that require evidence.
- Feature completion needs schema/migration where relevant, DTO, validator, repository, service,
  controller, permissions, audit, evidence, version, workflow, automation, reporting, AI, OpenAPI,
  tests, accessibility, security, docs and deployment evidence. A screen or a schema alone is not
  completion.

### Requirement-to-code and gap matrix (as at 17 November 2026)

| Requirement | Where it lives now | Status |
|---|---|---|
| Existing framework, routes, IDs, AppLayout, ModuleShell, iPad Quick Access preserved | `src/App.jsx`, `src/components/AppLayout.jsx`, `src/components/module/ModuleShell.jsx` | Preserved; no migration performed |
| Platform Shell (header, sidebar, canvas, bottom dock, quick access) | `src/components/AppLayout.jsx`, `WorkspaceNavigationTools.jsx`, `QuickAppBar.jsx`, `ObsidianSidebarRemote.jsx` | Implemented (pre-existing) |
| Workspace view states | `base44/shared/workspaceLayout.ts`, `src/lib/workspaceLayout.js` | 13 states stored; 4 (Dashboard, Selection, History, Version Compare) open a real view; the rest are recorded and labelled as not built |
| Workspace selection | existing module directory + `WorkspaceLayoutBar` "Switch"; layout is scoped per workspace key | Implemented for the five enabled dashboards |
| Persisted layout preferences | `WorkspacePreference` entity, `workspacePreferences` function, `useWorkspaceLayout` hook | Implemented: user + business scoped, server-authorised, optimistic version check |
| Layout version history, compare, restore | `WorkspacePreferenceVersion` entity, `WorkspaceVersionHistory.jsx` | Implemented: append-only versions, compare, restore-as-new-version |
| Context panel sections | `WorkspaceContextPanel.jsx` | Properties, layout and links implemented; Relationships/Evidence/Risks/Audits/Incidents/Controls/Comments/Tasks/Approvals/AI sections are labelled not-connected rather than populated |
| KPI ribbon with period/formula/denominator/freshness | existing executive and module dashboards | Partially implemented elsewhere; this slice adds no KPI and no fabricated score |
| Workspace machine graph (node/edge editing) | Knowledge Graph OS (`/knowledge-graph`) | Existing graph views only; workspace-level node/edge authoring not built |
| Workspace builder (drag/resize/configure, templates, publish/compare/clone) | — | Not built. Block order/visibility is the only layout editing shipped |
| Role and organisation layouts, layout approval | — | Not built. Deliberately disabled until real enforced handlers exist (no client-only success, no simulated approval) |
| Reference entity set | reused existing entities; added `WorkspacePreference`, `WorkspacePreferenceVersion` | Reused + 2 new; no duplicate canonical records created |
| `tenant_id` and business identity enforced | `perBusiness`, `createScopedClientFromRequest`, entity RLS, `workspaceAccess` | Implemented for this slice; live multi-user/tenant A/B acceptance still open |
| API envelope and paging | `base44/functions/workspacePreferences/entry.ts` | Implemented for this function only |
| Traceability chain, permissions matrix, workflow enforcement, AI assistant set | existing engines (Assurance Audit Matrix, roleMatrix, Workflow Studio, AI Intelligence OS) | Pre-existing and unchanged; this slice adds no new traceability or AI behaviour |
| Documentation and check suites | this file, `MASTER_TODO.md`, `tests/`, `npm run ci:verify` | Extended; WCAG AA, load, DR and 99.9% availability remain unverified targets |

Status words follow the existing scale (Not Assessed, Missing, Partial, Implemented, Verified,
Blocked). Nothing in this matrix is Verified without passing evidence, and no part of this section
declares the whole platform delivered.
