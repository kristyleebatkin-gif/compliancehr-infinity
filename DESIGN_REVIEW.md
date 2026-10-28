# ComplianceHR Infinity — mandatory design and UX review
Owner-provided standard, adopted 29 October 2026.

## Operating principle
Preserve → Simplify → Standardise → Validate → Optimise.

Reuse AppLayout, ModuleShell, Dashboard, Operations Centre, Quick Access, Universal360, evidence, register and readiness frameworks. Preserve branding, colours, frozen headers, route declarations, record IDs and operational capabilities. No competing navigation, dashboards, workflow engines, readiness systems, 360 frameworks or duplicate modules. Replacement/rebuild/restructure requires explicit executive approval.

## Status and evidence
Use Pass, Needs Improvement, Fail or Not Applicable for each review question. Not Applicable requires a reason. Missing runtime evidence is Needs Improvement, never Pass. Every result records scope, source version, environment, procedure, expected/actual result, evidence, reviewer identity and date.

Delivery gates additionally retain PASS / NEEDS REVIEW / BLOCKED for build, regression, permissions, evidence relationships, routes, rollback and capability retention. These do not replace design review.

## Required review areas
1. Architecture: reuse existing frameworks, preserve architecture/capabilities, avoid competing systems, duplication and unnecessary restructuring.
2. Truth and trust: actual operational data, evidence-based readiness/KPIs/recommendations/compliance; confirmed automation outcomes. Test accurate success, error, unknown, permission denial and empty states. Never display synthetic records as operational truth.
3. Navigation: one Module Directory; consistent sidebar/Quick Access/search, labels, permissions and active states. Validate discoverability, location, next step and exact deep links.
4. UX: preserve capability while reducing effort, complexity and clutter. Measure whether users identify location, screen purpose and primary action within three seconds. Measure representative common-task click counts against approximately three clicks.
5. Progressive disclosure: essential information first; secondary and advanced tools accessible without overwhelming first-time users.
6. Quick Access: preserve iPad card style and branding; predictable expansion, stable descriptions, clear labels and destinations. Child modules discoverable; navigation supports search.
7. Dashboards: explain what, why, priorities, next action and supporting evidence. Reliable/traceable/nonduplicated KPIs, clear hierarchy and controlled information density.
8. Universal360: overview, related records, intelligence and history, backed by real relationships and evidence. Exact-record links and permissions; no fabricated readiness or fake fallback records.
9. Relationships: link relevant evidence, tasks, risks, incidents, audits and compliance. Trace Record → Evidence → Compliance → Readiness → Dashboard → Recommendation with permission-aware, auditable links.
10. Readiness: visible formula, known denominator/exclusions, sources, freshness and unknown state. Scores explainable, reproducible, auditable and evidence-backed.
11. Intelligence: explain recommendations, supporting records/evidence and business logic; allow challenge and review.
12. Design system: shared layouts/cards/forms/tables/buttons/modals. Consistent spacing, hierarchy, readability, colour identity and meaningful state colours.
13. Mobile: execute checks at 360, 390, 768, 1024, 1366 and 1440px. Verify wrapping, touch targets, forms, tables, dashboards and navigation.
14. Accessibility: execute keyboard, visible-focus, contrast, zoom, touch and accessible-error checks.
15. Capability protection: preserve routes, data, permissions, workflows, integrations and reports; verify before/after retention.

## Approval
Decision: Approved / Approved with Conditions / Needs Rework / Rejected.

Do not approve changes introducing competing architecture, reducing capability, duplicating frameworks, displaying unsupported intelligence or synthetic operational truth, breaking navigation/evidence lineage, reducing accessibility, or failing mobile validation. Unexecuted mobile validation prevents approval. Conditions cannot waive these prohibitions.

## Current work review — 29 October 2026
Scope: Universal360ProfileFramework.jsx, QuickAppBar.jsx and GlobalSearch.jsx.

| Area | Status | Evidence / outstanding work |
| --- | --- | --- |
| Architecture | Pass (source scope) | Existing components and registry reused; no replacement framework introduced. |
| Truth and trust | Needs Improvement | Universal360 false success/readiness labels reduced; remaining static relationship descriptions and legacy header claims need review. Search still converts query errors to empty results. |
| Navigation | Needs Improvement | Quick Access uses MODULE_DIRECTORY/NAV_GROUPS; timer removed. Registry checks preserve all 55 module keys and 13 groups; frontend visibility parity checked for declared roles. Exact-route/runtime/alias validation pending. |
| UX | Needs Improvement | Subject-specific next action and larger controls implemented. Three-second and task-time/click-count tests pending. |
| Progressive disclosure | Needs Improvement | Category children expand on demand; remaining Universal360 framework content still dense. |
| Quick Access | Needs Improvement | Existing gradient/card grid retained in source; stable descriptions, category expansion and child links implemented. Visual/device and interaction acceptance pending. |
| Dashboards | Not Applicable (this change) | Dashboard behaviour not modified; broader programme review remains open. |
| Universal360 | Needs Improvement | Five mocked action outcomes checked in prior work; real related records and exact links remain incomplete. |
| Relationships | Needs Improvement | End-to-end lineage not established or runtime-tested. |
| Readiness | Needs Improvement | Unmeasured scores marked unassessed in edited component; calculation transparency remains open platform-wide. |
| Intelligence | Needs Improvement | Guidance is generic by record type, not an evidence-derived recommendation. Remaining unsupported claims need review. |
| Design system | Needs Improvement | Existing components/colours reused; rendered consistency not yet verified. |
| Mobile | Needs Improvement | All six required viewport validations outstanding. |
| Accessibility | Needs Improvement | Native buttons, aria-pressed/expanded/current and focus rings added; actual keyboard/contrast/zoom/screen-reader checks outstanding. |
| Capability protection | Needs Improvement | Registry/source preservation checked; operational regression and backend permission tests outstanding. |

Technical evidence: build command passed; targeted ESLint passed for the edited files. Registry test confirmed 55 modules, 13 groups and no missing/duplicate group keys. Quick Access visibility matched sidebar predicate for declared roles. Existing frontend open-access bypass remains unresolved: parity does not establish secure server authorisation.

Review decision: Needs Rework. No production approval or publication. No live records, automation, messages or notifications were exercised during these checks. Named human acceptance reviewer remains unassigned.

Latest code checkpoint before this review document: 6ae26d652206ac9a73a1759c; commit ea0ed77284b7dae19edfdd88992f9916cea10245. Code checkpoint is not a database/document backup.
