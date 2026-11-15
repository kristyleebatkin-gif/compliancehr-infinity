# ComplianceHR Infinity — Enterprise vNext Audit and Architecture

Audit date: 15 November 2026 · Scope: source inventory; production data not audited · App: 6ac9f91f0d82b1f80ec6a25f
Architecture model: `src/lib/enterpriseOS.js` · Role workspaces: `src/lib/enterpriseRoleWorkspaces.js`
Live console: `/enterprise-os`

This document records what the platform actually contains, what the fifteen operating systems cover, and
what is still missing. Nothing was removed to produce it. Source-present means a mapped module or register exists. Functional completion, live permissions, WCAG AA and compliance acceptance are NOT established by this inventory.

---

## 1. Platform audit report (Phase 1)

| Inventory | Count |
| --- | --- |
| Pages | 96 |
| Entity schemas | 181 |
| Backend functions | 114 |
| Workflows | 67 |
| Modules in the shared directory | see `/enterprise-os` audit tab |
| Email templates | 16 |
| Deno/shared test suites | 23 |
| Auth surfaces | Login, Register, Forgot password, Reset password, MFA |

### Existing systems reused by the operating layer

- Identity and access: approved-account gate, role matrix, tenant scoping, RLS and MFA source present; enforcement requires authenticated acceptance.
- Evidence and documents: document vault, universal storage, register hub, document control, acknowledgements.
- Work and approvals: tasks, shared to-do, approval inbox with server-side sign-off validation.
- Automation: 67 workflows, scheduled reminder scans, notification and push delivery logs.
- Navigation and search: module directory, grouped sidebar, global search, quick access bar, notification centre.
- Reporting: executive reports, compliance exports, PDF and Excel generation libraries.

### Findings

1. The platform is feature-rich but organised by *screen*, not by *operating system*. The same evidence,
   risk and workforce data is reachable from several hubs without one place that states what each area covers.
2. Coverage is uneven: compliance, risk, audit, workforce and executive areas are substantially built;
   clinical governance, allied health, aged care and evidence lineage are thin or absent.
3. Several capabilities exist as configured workflows and functions with no in-app surface (automation rules,
   evidence scoring, scheduled report packs).
4. Reporting exists per module but not as a catalogue of report definitions with scheduling.
5. There is no single register of enterprise gaps, so unfinished work depends on memory.

---

## 2. The operating layer now in the app

`/enterprise-os` is the authoritative view of the architecture. It shows:

- 15 operating systems in the directed priority order, each with capability-by-capability coverage.
- For each: the modules that serve it, authorised register counts when available; failed queries show Unavailable,
  the notes explaining every partial capability, and the gaps still to build.
- 30 role workspaces mapped to the page that serves each role, with honest stop-gap notes.
- The platform audit, schema plan, API plan and the full gap register.
- The roadmap and the ten final deliverables.

Coverage is calculated, never asserted: **source present** counts a mapped capability, **partial** counts half, and the
percentage on each card is a source-mapping score, not a completion or compliance percentage.

---

## 3. Gap analysis report (Phase 8 items 2, 6–8)

Priority order, highest first. Each item is also listed in the console's gap register.

| # | Operating system | Gap |
| --- | --- | --- |
| 1 | Executive OS | Board assurance register linking every board decision to its evidence. |
| 2 | Governance OS | Conflict of interest register; board resolutions register with implementation tracking; constitution change control. |
| 3 | Compliance OS | Aged Care strengthened standards mapped as a first-class standard set. |
| 4 | Audit OS | Audit programme builder generating a cycle of audits from a standard set. |
| 5 | Risk OS | Bowtie and barrier analysis for critical risks. |
| 6 | Quality OS | Consolidated quality indicator set with trend reporting. |
| 7 | Workforce OS | Visa / right-to-work tracking; multi-period workforce planning. |
| 8 | Clinical Governance OS | Restrictive practice register; clinical supervision and credentialing log; standardised outcome measures; clinical audit programme. |
| 9 | Allied Health OS | Clinical notes and treatment plans; discipline and caseload model; structured assessment instruments. |
| 10 | Aged Care OS | Strengthened standards set; quality indicator set; SIRS priority timeframe enforcement. |
| 11 | NDIS OS | Restrictive practice authorisation and reduction monitoring. |
| 12 | Evidence OS | Evidence lineage chain across records and versions; evidence scoring model. |
| 13 | AI Core OS | Domain-scoped copilots; guaranteed source citations; AI recommendation audit trail. |
| 14 | Automation OS | Self-service rule builder; automation run history inside the app. |
| 15 | Reporting OS | Scheduled report packs; published Power BI data model. |

Missing workspaces: the six allied health disciplines (occupational therapy, speech pathology,
physiotherapy, psychology, social work, exercise physiology) have no clinical workspace; regional
managers have no site-scoped dashboard; family representatives have no representative-scoped view.

---

## 4. Database expansion plan (Phase 4)

Existing schemas already cover governance, compliance, audit, risk, quality, workforce, NDIS, finance,
automation logs and reporting records — they are extended, never duplicated. Candidate additions requiring reconciliation against existing generic schemas:

| Schema | Entities to add |
| --- | --- |
| Governance | `BoardResolution`, `ConflictDeclaration` |
| Clinical | `RestrictivePractice`, `ClinicalSupervision`, `ClinicalOutcomeMeasure` |
| Allied health | `AlliedHealthEpisode`, `ClinicalNote`, `TreatmentPlan` |
| Aged care | `AgedCareAssessment`, `AgedCareIndicator` |
| Evidence | `EvidenceLink`, `EvidenceScore` |
| Workforce | `RightToWorkRecord` |
| Automation | `AutomationRule`, `AutomationRun` |
| AI | `AiCopilot`, `AiRecommendation` |
| Reporting | `ReportDefinition`, `ScheduledReport` |
| Security | `SecurityIncident`, `AccessReview` |

Every new table must carry tenant id, created/modified by and date, audit fields and soft-delete fields,
with RLS written in the same change. Schemas are only added when the screen that uses them is built, so no
empty tables are created ahead of their workspace.

---

## 5. API expansion plan (Phase 5)

Target contract domains: `/api/governance`, `/api/compliance`, `/api/risk`, `/api/audit`, `/api/workforce`,
`/api/clinical`, `/api/ai`. Today the app reads and writes through the platform SDK and validated backend
functions; a contract domain is only marked working once it is authenticated, tenant-isolated, validated
and tested.

---

## 6. Architecture report (Phase 3, 7)

Layers, bottom to top:

1. **Data** — 181 entity schemas requiring tenant and RLS acceptance; all-entity enforcement has not been verified in this batch.
2. **Server logic** — 114 backend functions, including role-gated workflow checks.
3. **Automation** — 67 workflows for scheduled scans, reminders and escalations.
4. **Operating systems** — the fifteen OS groupings, each a set of capabilities backed by modules.
5. **Role workspaces** — 30 roles mapped to the page that serves them.
6. **Presentation** — shared design system: navy/indigo/purple/magenta gradients, white cards, consistent
   tables; WCAG AA, mobile and tablet acceptance remain unverified.

---

## 7. Implementation roadmap (Phase 8 item 9)

Delivered in this batch: the operating layer itself — console, capability model, live register counts,
role workspace map, audit, gap register and roadmap.

Next, in the directed priority order:

1. Executive OS — board assurance register.
2. Governance OS — conflict declarations and resolutions registers.
3. Compliance OS — Aged Care strengthened standards set.
4. Audit OS — audit programme builder.
5. Risk OS — bowtie and barrier analysis.
6. Quality OS — consolidated indicators.
7. Workforce OS — right-to-work tracking and workforce planning.
8. Clinical Governance OS — restrictive practice, supervision, clinical audit.
9. Allied Health OS — clinical notes, treatment plans, discipline caseloads.
10. Evidence OS — lineage chain and scoring.
11. AI Core OS — domain copilots with citations.
12. Automation OS — rule builder and run history.

Each release follows the same assurance chain: legislation → standard → requirement → obligation → control →
evidence → assessment → review → audit → finding → corrective action → verification → executive assurance →
board assurance.


## Verification and implementation extension

The builder initially produced the console and source mappings only; it did not implement the full enterprise transformation. Its first verification failed because the frontend and backend permission matrices diverged. The review restored parity, explicitly scoped register-count queries by business, blocked unapproved identities and separated unavailable counts from denied access. Source-present badges replace unsupported Working claims. Role mappings do not create roles or certify nine-element workspaces.

Added a board assurance review at `/governance?tab=board-assurance` using existing GovernanceObject records. Shows missing owners, missing/overdue review dates and missing evidence references; exports only displayed metadata to CSV with the existing formula-safe exporter. Bounded to 200 records with a truncation notice. Recorded references do not prove document validity, exact versions, decisions or approval. This is a governance review surface, not a completed BoardResolution lifecycle.

The platform still requires the full database-field audit, authenticated tenant A/B acceptance, dedicated role workspaces, domain APIs, clinical workflows, report scheduling, specialist copilots and remaining OS implementations. No new entity migrations, permission grants, external sends, production schedules or publication were performed.
