## PMM Phase 0–1 — Product Model Management factory adopted in place — 18 November 2026 (UTC)

Applied the attached PMM plan to the existing app without replacing anything. No route, entity, record,
permission, workflow or tenant was removed, renamed or migrated, and nothing was published.

Delivered:
- `base44/shared/pmmMetadata.ts` — the metadata repository: platform (runtime, target stack, migration rules,
  eight compatibility entries), security, 13 domains, 39 registers (35 existing, 4 explicitly planned), 10
  workflows, 7 reports, 6 AI skills and 26 capability rows reconciled to present/partial/planned/blocked.
- `base44/shared/pmm.ts` — the Phase 1 engine: ten specification validators, loader, reference resolver,
  canonical AST, MetadataGraph, ValidatedGraph (duplicate ids, dangling edges, domain dependency cycles) and
  CompiledGraph with a deterministic order and stable hash. Pure: no clock, no I/O, no entity access.
- `base44/functions/pmmFactory/entry.ts` — read-only service (`overview`, `validate`, `graph`, `compile`,
  `capabilities`, `entity`), gated by approved access plus a compliance or management role; auditors read.
- `/pmm-factory` workspace with five tabs: capability matrix, migration map, metadata graph, validation and
  reference output (Prisma, SQL with FORCE RLS, OpenAPI, screen spec, test spec per register). Registered in
  the module directory, the role matrix (frontend and shared) and `src/App.jsx`.
- `src/PMM_PHASE0_BASELINE.md` — Phase 0 baseline, compatibility/adaptation map and the ten metadata
  specifications. `tests/deno/pmm.test.ts` — 13 tests, including a reconciliation pass that fails if any named
  register, field, module key, workflow file, report surface, AI surface or evidence path stops existing.

Checks actually run this session, each exit 0: `npm run lint`; `npm test` (225 passed, 0 failed);
`npm run test:deno` (299 passed, 0 failed, including the 13 new PMM tests); `npm run build`. The
`pmmFactory` function was invoked against this app's live runtime for `overview`, `validate` (0 errors, 4
planned-register warnings, 0 unresolved references), `graph` (0 dangling edges, 0 findings), `compile`
(13 domains ordered, graph hash `b783610c`), `capabilities` (12 present, 11 partial, 2 planned, 1 blocked) and
`entity` for Risk (5 artefacts generated).

Limitations recorded, not glossed: Phases 2, 3, 4 and 6 are partial — Prisma, SQL/RLS, OpenAPI, screen and test
output is generated as reference only and has never been deployed, migrated or executed; Phase 5 is planned;
the MVP release gate stays blocked because its generated-output gates are unmet. Phases 7–12 are present as
reused capability (they run in this app but were hand-built, not generated). No multi-identity UAT, no auditor
read path exercised live, no production data touched, no publication.

Named checkpoint: **PMM Phase 0–1 — Metadata Factory**.

---

## Capability Track C10 — Autonomous Enterprise Operating System — 18 November 2026 (UTC)

Last step of the separate C5–C10 capability track, and it closes that order. Nothing in the 12-phase
register was re-planned, and no existing module, route, entity or role was substituted.

Delivered:
- Eight tenant-scoped records: `EnterprisePortfolio`, `TransformationProgram`, `StrategyObjective`,
  `StrategyBenefit`, `EnterpriseCapability`, `CapabilityMaturityAssessment`, `TransformationRoadmap`,
  `StrategyAuditRecord`. Service-role-only writes with the release-2 business lock on every operation.
- `base44/shared/enterpriseStrategy.ts` (`C10.1`): rollups, progress, due state, evidence-backed
  capability maturity, per-register validation, approval triggers, the roadmap transition rule, and the
  hash-chained audit builder. The `enterpriseStrategy` function is the only writer, with seventeen
  actions.
- Module `/enterprise-strategy` (board view, portfolios, programs, objectives, benefits, capabilities,
  assessments, roadmaps, audit trail), registered in `moduleDirectory.js`, the role matrix and
  `src/App.jsx`. Roadmap approval additionally needs `permissions.approve`.
- `tests/deno/capabilityC10.test.ts` — 20 tests over the engine: rollup arithmetic, progress and due
  state, maturity from validated assessments only, the empty workspace, permission denial, approval
  triggers, the submit-then-approve-by-someone-else sequence, audit redaction and chaining, reported
  version.
- `src/PHASE5_10_C10_REFERENCE.md` added; `PHASE5_10_INVENTORY.md` step summary, build-order table and
  §5 checkpoint list updated to C10.

Checks actually run this session, each exit 0: `npm run lint`; `npm test` (225 passed, 0 failed);
`npm run test:deno` (286 passed, 0 failed, including the 20 C10 tests); `npm run build`. The
`enterpriseStrategy` function was invoked against this app's live production database: `list` returned
200 with every register count at zero, a valid `savePortfolio` created `POR-2026-001` with one audit
entry, invalid names were refused 400, and the other fifteen actions each refused 404 with their own
message against a parent record that does not exist, writing nothing.

Limitations recorded, not glossed: no live end-to-end cycle through programme, objective, benefit,
capability, assessment or roadmap creation, status change, benefit review, assessment validation or the
roadmap submit/decide/archive transitions. Those paths are covered by the 20 engine tests only, because
each live cycle would need records created and then removed. The test portfolio was soft-deleted by its
exact record id on request; its audit entry (`AUD-20261118030719-2DY5`, `Portfolio created`,
`POR-2026-001`, `Recorded`) is preserved unmodified as immutable history and no other audit row was
touched, so the strategy audit trail honestly begins with that single entry. No multi-identity UAT, no
role grant, no record migration, no publication.

Named checkpoint: **Capability Track C10 — Autonomous Enterprise Operating System**.

---

## Capability Track C7 — Knowledge Graph & Digital Twin OS — 18 November 2026 (UTC)

Seventh step of the separate C5–C10 capability track, not a re-plan of the 12-phase register. Code was
saved in `54635930` ("Implement phase 5.10 digital twin and knowledge graph infrastructure"); this
batch closed the remaining C7 items: engine regression coverage, the design reference and the inventory
reconciliation, then the checks below.

Delivered:
- Graph index: `GraphEntity`, `GraphRelationship`, `GraphTaxonomy`, `GraphOntology`, the
  `knowledgeGraphRegistry` function and `base44/shared/graphRegistry.ts`. Nodes are the existing
  registers; `KnowledgeLink` stays the only hand-edited edge store and the relationship register is a
  rebuildable mirror, so a rebuild cannot duplicate or invent an edge.
- Digital twin: `DigitalTwinModel`, `DigitalTwinScenario`, `SimulationRun`, the `digitalTwin` function,
  `base44/shared/digitalTwin.ts` and the module at `/digital-twin`. Inputs are read from records at run
  time; a run pins model and scenario versions, stores the estimate notice with the result, and refuses
  to model when no input has records behind it.
- Registry tab inside the existing `/knowledge-graph` page; both modules registered in
  `moduleDirectory.js`, the role matrix and `src/App.jsx`. No existing module, route or entity removed.
- `tests/deno/capabilityC7.test.ts` — 11 tests over the two engines: derived triples all allowed,
  duplicate source registers per node type absent, foreign/self/ontology-illegal edges rejected, node
  provenance and route, estimate notice and provenance on a run, missing-record inputs excluded and
  lowering confidence, refusal when no input has data, lever rationale required, lever outside the
  model rejected, model input validation.
- `PHASE5_10_INVENTORY.md` Phase 7 table and step summary, `PHASE5_10_REFERENCE_ARCHITECTURE.md` §8
  (DDL for seven tables, Prisma models, OpenAPI for both functions, estimate rule) and its deliverable
  rows 7–8 now read Delivered for C7.

Checks actually run this session, each exit 0: `npm run lint`; `npm test` (220 passed, 0 failed);
`npm run test:deno` (201 passed, 0 failed, including the 11 new C7 tests); `npm run typecheck`;
`npm run build`. `knowledgeGraphRegistry` and `digitalTwin` were each invoked against this app's live
database with `{action:"list"}` and returned 200 with real counts (109 indexed nodes, 32 holding
relationships; graph coverage 29% of 109). Configured typecheck retains `checkJs=false`, so it is not
comprehensive JavaScript type verification.

Limitations recorded, not glossed: the twin currently holds no models, scenarios or runs, so no live
simulation was executed in this batch and none was created to make the screen look fuller; the run
path's own arithmetic is covered by engine tests only. No authenticated multi-identity or
multi-business UAT this session, no role grant, no record migration, no production publication.
`GraphEntity`/`GraphRelationship` writes are service-role only, so browser-side changes cannot bypass
the ontology.

OPEN, not complete: graph rebuild at scale beyond the 500-per-register index limit; ontology approval
workflow beyond Validated; twin model approval independence under two real identities; simulation
against a populated multi-business dataset; C8 event fabric, C9 AI workforce and C10 strategy remain
unbuilt.

Named checkpoint: **Capability Track C7 — Knowledge Graph & Digital Twin OS**.

---

## Workspace OS independent review corrections — 17 November 2026

Supersedes weaker save/read and RLS statements in the builder entry below. Restorable pre-review checkpoint: 6afc32e8520ca2b2b89db42f.

- Corrected canonical persisted layout serialization to the same object format accepted by the reader. Regression verifies round-trip of default and reordered/hidden layouts; without this correction saved versions were unreadable.
- Both new entity read rules now require exact user ownership, exact business, Active account and approved access, retaining the canonical tenant-lock wrapper. No admin-wide owner/tenant bypass remains on these read rules. Live RLS enforcement with independent accounts remains unverified.
- Backend queries include tenant explicitly and returned rows are checked for business/user/workspace. All mutations require a nonnegative safe-integer expected version. This is still read-then-write, NOT atomic concurrency control.
- Unknown write outcomes retain snapshots, report uncertainty and require reload/reconciliation; no promise of safe retry or successful rollback. Incomplete initial preference-create response cannot report success.
- ModuleShell remounts layout hook, drafts and context state when account/business/access scope or workspace changes, discarding pending state from the previous scope.
- Independently reran npm run ci:verify: exit 0, lint, 146 Node tests, 175 Deno tests, Vite build. Configured typecheck completed without diagnostics; canonical tenant-RLS checker reports zero changes; git diff --check clean. Existing checkJs/no-check limits remain.
- No new live saves, role grants, production migration or production publication. Hosted user/tenant denial, save/reload/compare/restore, concurrent/uncertain saves, keyboard/device/accessibility and full platform acceptance remain OPEN. This is a Workspace OS subset; full ultimate master scope is incomplete.

## Workspace OS vertical slice — persisted layout, view state, context and version history — 17 November 2026 (Australia/Brisbane)

Owner installed the ULTIMATE MASTER PLATFORM PROMPT as the latest product requirements in the existing
app and asked for the largest coherent Workspace OS slice that fits the current engines, prioritising
real persisted layout preferences and workspace selection/context/history/version visibility linked into
existing dashboards. Baseline main `fd16f88b` ("External agent changes"), working tree clean at start.
No framework migration, no production publish, no data migration, no role grants.
Before checkpoint: none available in this session before edits (documented as a limitation; the baseline
commit above is the reproducible restore reference).

### What was reconciled before building

Read `AGENTS.md`, `README.md`, `COMPLIANCEHR_INFINITY_MASTER_PROMPT.md`, `MASTER_TODO.md`, then the actual
code: `src/App.jsx` routing and gates, `AppLayout`, `ModuleShell`, `WorkspaceNavigationTools`
(local-only favourites/recents), `navigationPreferences`, `tenantScope`, `tenantClassification`,
`roleMatrix` (frontend and backend), and the existing Workflow/AI/Evidence engines. Finding: the shell,
navigation and engines exist; what did not exist was any **server-persisted** per-user workspace layout,
view state or version history. Favourites/recents were browser-local only, and nothing recorded which
view or block layout a person used in a workspace.

### Implemented (code, not a plan)

| Area | Code | Behaviour and limits |
|---|---|---|
| Layout contract (server) | `base44/shared/workspaceLayout.ts` | 13 view states, 4 shell blocks, validation, canonical form, FNV-1a hash, diff, next-version rule, and `workspaceAccess()` which decides access before any record read: approved account → business from the account record → workspace present in the canonical permission matrix → `canAccessNav(role, key)` |
| Layout contract (browser mirror) | `src/lib/workspaceLayout.js` | Same accepted values, identity scope key (business + user + role + status + approval), stale-response rule, ordering/visibility helpers, diffs |
| Persistence | `WorkspacePreference`, `WorkspacePreferenceVersion` entities | Business-owned, classified in both canonical classification files. Read is owner-or-admin inside the business; create/update/delete are service-role-only, so the browser cannot write a layout directly |
| Service | `base44/functions/workspacePreferences/entry.ts` | `load`, `save`, `history`, `restore`, `reset` with the requested API envelope (success/data/errors/warnings/metadata, page/pageSize/totalRecords/totalPages, errorCode/message/correlationId). Save appends an immutable snapshot first, then points the live row at it; a failed live write deletes the snapshot as compensation and says so |
| Shell integration | `src/components/module/ModuleShell.jsx` | New optional `workspaceKey`/`workspaceLabel`. When supplied, the shell renders the layout strip and context panel and applies the saved block order/visibility. Without it, every existing page renders exactly as before |
| UI | `src/components/workspace/WorkspaceLayoutBar.jsx`, `WorkspaceVersionHistory.jsx`, `WorkspaceContextPanel.jsx`, `useWorkspaceLayout.js` | Dark blue glass, blue/purple/pink accents, no black surfaces; 44px touch targets, labelled controls, `aria-pressed`/`aria-live` states; explicit loading, unavailable and failure text; version compare and restore; "Switch" opens the existing module directory |
| Enabled dashboards | `DailyBriefing`, `IncidentAnalytics`, `QualityImprovement`, `Rostering`, `Feedback` | Each passes its canonical permission key, so the strip appears only where the person already has module access |

### Verification actually run

| Check | Result |
|---|---|
| `npm run ci:verify` (final) | **exit 0** — lint clean; **146 Node tests passed, 0 failed**; **175 Deno tests passed, 0 failed**; Vite production build succeeded |
| `npm run typecheck` | **exit 0** in the existing configured scope (checkJs false; Deno tests use `--no-check`) — not full source/backend type assurance |
| New Node tests `tests/workspace-layout.test.mjs` | 10/10 pass: contract parity with the server file, default order, rejection of unsupported view state / unknown / duplicate / non-boolean sections, omitted sections stay visible, reorder bounds, hide+describe, scope key separating person/business/role/approval without a display name, stale-response rejection, diff output |
| New Deno tests `tests/deno/workspaceLayout.test.ts` | 12/12 pass: contract, canonical form and hash stability/change, all validation codes, unreadable stored layout refused, monotonic version numbers, diff fields, and access denials (no user, pending/unapproved, no business, unknown workspace, Employee/Participant/Auditor on restricted workspaces) plus "caller business cannot be spoofed" |
| Tenant lock generator | `WorkspacePreference` and `WorkspacePreferenceVersion` report as already locked (the earlier generator failure on the version entity was fixed by correcting the rule order) |
| Live function probes (builder invocation) | `load` on `compliance` returned the default layout with version 0; unknown workspace returned 400 `UNKNOWN_WORKSPACE`; an unsupported view state returned 400 `INVALID_VIEW_STATE` **before any write**; `history` returned an empty first page with `totalRecords: 0` |

### Honest boundaries — not verified, not claimed

- **No production records were written.** The probe identity has full access, so a real save would have
  created a genuine owner layout record; that write was not performed. Save/restore/conflict paths are
  covered by unit-level logic tests only until an approved test identity saves a layout.
- **Role-denial is not verified live.** The builder invocation runs with elevated rights, so the
  Employee/Auditor denials exist as passing logic tests, not as a demonstrated hosted refusal.
- **No atomicity.** The expected-version check is a read-then-write, not CAS; the snapshot/live-row pair is
  compensated, not transactional. Disclosed in the function and to the user in the save warning.
- **No browser/UAT acceptance.** No authenticated visual, keyboard, phone/iPad, contrast or screen-reader
  pass was performed in this session; the preview was not used to confirm rendering.
- **Role/organisation layouts, layout approval, widget drag/resize builder, workspace node/edge graph** are
  not built. The controls for them do not exist rather than existing and doing nothing.
- **Context panel registers** (relationships, evidence, risks, audits, incidents, controls, comments, tasks,
  approvals, AI) are labelled not-connected in this panel and link to the modules that own them; no counts,
  statuses or AI output are invented.
- The 99.9% availability, WCAG AA, load, DR/restore and F095 gates remain OPEN. Nothing in this batch is
  marked Verified on the strength of a screen, a schema or a passing build.

### Changed files

New: `base44/shared/workspaceLayout.ts`, `base44/functions/workspacePreferences/entry.ts`,
`base44/entities/WorkspacePreference.jsonc`, `base44/entities/WorkspacePreferenceVersion.jsonc`,
`src/lib/workspaceLayout.js`, `src/components/workspace/{WorkspaceLayoutBar,WorkspaceVersionHistory,WorkspaceContextPanel}.jsx`,
`src/components/workspace/useWorkspaceLayout.js`, `tests/workspace-layout.test.mjs`,
`tests/deno/workspaceLayout.test.ts`.
Modified: `src/components/module/ModuleShell.jsx` (optional workspace strip, existing behaviour preserved),
`src/lib/tenantClassification.js`, `base44/shared/tenantClassification.ts` (two entities classified),
`src/pages/{DailyBriefing,IncidentAnalytics,QualityImprovement,Rostering,Feedback}.jsx` (one prop each),
`COMPLIANCEHR_INFINITY_MASTER_PROMPT.md` (latest owner specification section and requirement-to-code/gap matrix),
`MASTER_TODO.md` (this entry). No entity field changed, no record migrated, no route changed, nothing published.

### Next unresolved dependency

An approved, non-admin test identity in a second business is required to close the real acceptance gaps:
save a layout, prove a foreign-business and a wrong-role refusal against the hosted API and RLS, switch
identity mid-request to prove the stale-response rule in a browser, then repeat on phone/tablet with
keyboard and screen-reader checks. Until that exists, the Workspace OS slice is **Implemented and
source-verified, not Verified**. Named checkpoint for this batch requested after this register entry:
"Workspace OS — persisted layout, view state, context and version history".

## Exact service evidence association and billing matching — 17 November 2026 (Australia/Brisbane)

Owner requested completion after reporting publication. Published app URL confirmed through platform API: https://polite-safe-hire-flow.base44.app . Baseline main 8a41fa3c8a331af5e5c0596d2a9b0a6d34defc18 was ready/clean (package updates since preceding batch preserved).
Before checkpoint: 6afc2969ef18b31dc5e20e79.
Verified code checkpoint: 6afc2d78dabb50a2b801e4de; source 8a2dde683b1f02bdfd81b22905302ec2766cdcd0.

| Finding | Evidence / severity | Implemented | Verification and boundary |
|---|---|---|---|
| ADR-010 | P1; billing checked ShiftNote by participant/date while Communications saved CommunicationEntry; dashboard could not identify a service note for one shift | Added ServiceEvidenceLink association history and shiftServiceEvidence handler/shared rules. Both note sources remain canonical/readable; records and IDs preserved. Service manager selects exact shift, reviews note text, gives reason and records stable participant/worker/note/shift IDs and content hashes. Browser writes to association history are denied by service-only RLS; approved role/exact business/active membership checked before reads. | 12 Deno behavioural tests cover denials, legacy/diary source, profile ambiguity, wrong worker, content, retry, unlink, concurrent duplicate-note conflict, edited/archive state, provenance and stale review. Hosted separate-user RLS acceptance pending. |
| ADR-011 | P1; participant/date keys could make unrelated shifts appear billing-ready | assessBillingBoard accepts only exact linked shift IDs; connectedJourneyGate derives those IDs from server association assessment after re-reading both note sources and server-only events. Old noteKeys callers no longer satisfy service evidence. Existing bill_shifts safety gate remains disabled. | Full connected journey suite passed after fixtures changed to exact IDs, plus regression rejecting old name/date inputs. This does NOT enable automated billing or prove atomic invoice/shift persistence. |
| ADR-012 | P1; note matching/completeness differed across dashboard and roster | Jamie Shift Notes and Rostering Operations include reviewed association UI. Today/Team Leader fetch exact evidence status, show changed/conflicting links for review and hide evidence-dependent summaries on errors. Roster Operations uses complete bounded reads and exact association counts. | Node regression covers exact/changed/unrelated associations. Lint/typecheck/build passed. Authenticated component/device/persistence UAT remains unverified. |

Associations record review, not independent clinical verification. Source hashes include actual note content/type/attachment references/update timestamp and service identity/time metadata. Files themselves are NOT scanned, hashed or clinically verified by this feature. Editing source content invalidates readiness. Selected shift/note hashes and latest association ID must still match the review screen before a new event is appended. One note cannot silently serve multiple shifts; conflicting effective associations fail closed. Read-check-write/command deduplication is NOT transactional CAS/unique-key enforcement; unattended billing remains gated. Append-only refers to application actions, not proof against privileged platform/database administrators.

Checks actually run on final code: npm run ci:verify EXIT 0 (136 Node tests, 163 Deno tests, lint and Vite build); npm run typecheck EXIT 0 in existing scope; git diff --check EXIT 0; tenant classifier Would lock 0 entities; frontend/backend classification identical by tests. Baseline diff reviewed: 20 files, additive association schema/function/UI plus exact billing-match repairs. Runtime probe using an anonymous SDK client against published origin returned HTTP 401; platform denial alone does not prove authenticated business isolation or a successful handler path.

Browser observation on published site: landing rendered; following Open Live Workspace redirected to /login?returnTo=%2Fdashboard. No signed-in app session available. No login was attempted, credentials requested, production note associations written, invoices raised or messages sent. New source/backend/schema changes are saved; no frontend production deploy was performed in this batch. No legacy records were migrated or automatically associated.

OPEN for full completion: authenticated role A/B and tenant A/B reads/writes/files/search/export acceptance; actual create/link/edit/unlink/reopen and stale/concurrent save tests; iPhone/iPad/desktop/PIN/recording/upload checks; reviewed legacy associations; shift/person stable IDs on future roster/note-entry forms; reconciliation of other note-entry surfaces and scheduled legacy reminder matching; safe invoice transaction/idempotency protocol before bill_shifts enablement; Director dashboard/customisation and other full module journeys; Phase 11 scheduler/adapters/file verification/DR/F095. Public landing also contains assurance/endorsement/remote-status claims outside sample KPI panels; their supporting evidence was not assessed and remains a separate truthful-content review. The app and Phase 11 are NOT declared fully complete or production-verified.

Next acceptance action: establish an approved signed-in browser session and isolated test identities, then exercise the exact association UI and hosted denial paths without altering real clinical/financial records.

## Roster and dashboard accuracy — 17 November 2026 (Australia/Brisbane)

Owner requested continuation. Baseline main ab0b0566112ab146c4e23ffbc3596b58473fbc46 was clean/ready.
Before checkpoint: 6afc103f45af1843a1d2901b.
Verified code checkpoint: 6afc11cfb3198164eb39d7c3; source 4bc33a2843dbc8fc907d400954416d6e334ad3f5.

| Finding | Severity / evidence | Repair / actual verification | Remaining limits |
|---|---|---|---|
| ADR-005 | P1; Today and Team Leader used capped pages as complete operational populations | Shared bounded cursor reader follows all pages, rejects duplicate/malformed rows, missing/repeated cursors, ambiguous full legacy arrays, outages and capacity exhaustion. Team Leader uses complete reads for all five sources; Today uses them for roster/notes/team. 3 behavioural tests. | At most 10 x 200 rows per source; exceeding that shows unavailable. Cursor behaviour tested with fixtures, not hosted API. Other Today cards retain intentional samples. Concurrent updates can still require refresh. |
| ADR-006 | P1; clock-hour comparisons falsely completed overnight shifts and ignored prior-day carry-over | Brisbane absolute service timestamps; prior-day overnight roster/notes included; invalid dates/times unknown; cancelled/missed/completed/unassigned shifts excluded from inappropriate alarms. Cancelled/missed/completed roster rows retain real status. 4 timing/status tests. | Choices NQ Brisbane default only; configurable tenant timezone remains open. Carry-over query covers previous day, not older anomalous shifts. Equal start/end is ambiguous, not assumed 24h. |
| ADR-007 | P1; participant/subject name made shift notes appear Done | Shared note review uses exact participant/date as a candidate only; no subject substring completion. Ended shifts require review, future shifts not due, archived notes excluded. Ambiguous candidates never verify individual service completion. 1 note matching test. | Current Shift and CommunicationEntry schemas have no stable participant/worker/shift linkage. No data migration or claim to have supplied canonical linkage. Backend billing noteKey matching is unchanged and requires separate repair. |
| ADR-008 | P1; first name-matched shift could hide active work; no shift falsely meant Available | Inspect all worker shifts; duplicate staff names require identity review; no roster entry says No shift recorded. Labels count shifts, not unique workers. 1 status test. | Unique display-name mapping remains provisional; no server permission is granted from a name. Stable staff/participant IDs still required for full journey verification. |
| ADR-009 | P2; note concern count called open incidents; praise button falsely claimed sent; stale refresh promise | Actual Incident records drive open incident count; note concerns separate; no all-notes-in claim; praise explicitly prepared. Both dashboards show loaded timestamp/Refresh and schedule read refresh every minute with cleanup/stale request guard. 1 incident/coverage test. | Browser/PIN/device and one-minute refresh behaviour not authenticated-UAT verified. No email or message was sent. |

Verification: full ci:verify EXIT 0 after primary changes (134 Node, 151 Deno, lint and Vite build). After final roster status/highlight changes: focused 10 new roster tests PASS, complete npm test 135 PASS / 0 FAIL, lint/typecheck/build EXIT 0, git diff --check EXIT 0. Deno/backend code unchanged by final UI additions; 151 Deno checks remain prior passing evidence for this batch. These are source/fixture/build checks, not live hosted RLS or end-to-end user acceptance.

Next: establish canonical shift-to-note/worker/participant references before claiming individual service evidence or billing readiness; reconcile backend noteKey matching and note-entry writers without destructive legacy backfill. Verify hosted dashboard cursor/refresh/identity changes with separate test users and devices, then Director customisation and end-to-end referral/service/incident flows. Broader release gates and F095 remain OPEN. Existing architecture, routes, records and colours preserved; no backend/entity edits, production data writes or frontend publish in this batch.

## Access and dashboard reliability pass — 17 November 2026 (Australia/Brisbane)

Owner authorised proceeding with access verification, priority dashboards and connected daily journeys.
Baseline: main 776063e3a93d70ea842e1be51e6eec10a9410286; clean working tree; 22 focused access/tenant source tests passed.
Before checkpoint: 6afc0c71de1b5af6dfa3da87.
Verified code checkpoint: 6afc0eba28ac6764204f9718; source ec7723961435ad2356857699a97ab4e5bbf3f765.

| Finding | Severity / source | Root cause and implemented repair | Status / limits |
|---|---|---|---|
| ADR-001 | P1; current systemAuth.ts/callers inspected today | Contact helper accepted omitted user and relied on enclosing perBusiness scope. All three callers now pass authenticated user; helper refuses missing approval/business before reads, filters every source by tenant and excludes foreign/untagged returned rows. Existing perBusiness membership boundary retained. | Verified with three in-memory Deno tests; no claim of a demonstrated prior hosted cross-tenant leak. Live separate-user API checks remain OPEN. |
| ADR-002 | P1; Today/TeamLeader source inspected today | Workspace state did not remount with identity/business/authority changes; data loaders allowed earlier requests to overwrite later results. Key complete workspace/PIN subtree by identity/business/role/status/approval and invalidate stale/unmounted requests. | Implemented; key helper tests/build pass. Actual React identity-switch timing, PIN and hosted browser acceptance remain unverified. |
| ADR-003 | P1; Today summary, tiles and AskBar inspected today | Failed requests were passed to Studio assistant with zero fallback; recorded emails were described as unanswered and recorded notes as outstanding. Supply explicit unavailable context on errors, include permitted figures only, disclose task sample and correct labels/context. | Verified helper behaviour with three Node tests; signed-in UI/AI acceptance pending. |
| ADR-004 | P2; useTodayData inspected today | Browser-local day could query the wrong Choices NQ service date. Use Australia/Brisbane for Today date shared by Team Leader. | Implemented; build/typecheck pass. Organisation-configurable timezones and Team Leader local-clock/overnight calculations remain OPEN. |

Checks on code checkpoint: npm run ci:verify EXIT 0 (lint; 125 Node tests; 151 Deno tests; Vite build). npm run typecheck EXIT 0 in existing configured scope. git diff --check EXIT 0. Tenant RLS classifier reports Would lock 0 entities. Full diff inspected against baseline; 13 files changed. Source, fixture and build verification only.

Connected journeys: existing 26 connectedJourneys and 25 referralHandover Deno tests passed in full suite. They cover billing eligibility/duplicate billing, corrective-action/effectiveness closure gates and referral handover among other paths; these are in-memory checks, NOT complete hosted UI-to-backend acceptance.

OPEN / next: authenticated multi-user/multi-business raw API and file denials; device/PIN/identity-switch UAT; dashboard pagination/completeness and exact filtered destinations; stable-ID shift/note matching and overnight/timezone derivations; Director dashboard/customisation acceptance; then hosted referral-to-profile, roster-to-invoice and incident-to-evidence journeys using isolated test accounts/fixtures. Independent test identities are not established in this session. Wider Phase 11 automation/file verification/recovery/F095 gates remain OPEN. No emails sent, account grants changed, data migrations or frontend publication performed. Source checkpoints do not restore application data.

Final progress checkpoint follows this entry; the verified code checkpoint above remains the reproducible code reference.

## Studio source integrated into main — 17 November 2026 (Australia/Brisbane)

Owner clarified and authorised studio-save-to-app -> main, then requested continuation.
Reviewed source head bef743b5c01d1605d16cc1c683a730e24944174a against its comparison
base. Integrated 11 source files through supported Base44 file edits, with security and
save-handling adaptations documented in STUDIO_MAIN_INTEGRATION.md. SDK update already
present on main. This is source integration, NOT a native Git branch-merge commit.

Implemented: StudioItem-backed personal saves across five workbench tools, Documents
saved-item panel, owner/business/approved-account restrictions, scoped adapters and
identity remounts, HTML allowlisting and soft archive. Removed automatic upload/erasure
of legacy unscoped browser saves and unapproved fixed-retention promises. Pending
document/CRM saves flush on close; Save now available for documents.

Verified: full ci:verify passed (lint, JavaScript suite including nine new tests,
148 Deno tests and build); targeted studio/tenant suite 24/24; typecheck passed.
Final UI save-handling changes lint/typecheck/build passed again. Tenant checker has
0 entities to lock; both classifications identical; combined master unchanged;
whitespace check clean. Details and limitations in STUDIO_MAIN_INTEGRATION.md.

Before checkpoint: 6afbb57a74dd9ff24fd6112d.
OPEN: hosted multi-identity RLS/API acceptance, authenticated UAT, uploads/recording,
device testing, concurrent editing/save-failure recovery, reviewed legacy import and
approved retention policy. No production data migration or frontend publication.
Source branch remains unchanged. Final named checkpoint follows this entry.

## Combined upgrade prompt installation — 17 November 2026 (Australia/Brisbane)

Owner selected main and asked to combine all continuation prompts.
Installed one 36-step OS upgrade/module finalisation sequence directly into
COMPLIANCEHR_INFINITY_MASTER_PROMPT.md, preserving its existing specification.
Scope includes shared instructions, foundation/dashboard work, all 15 Phase 11
v2 ticket ranges WF-001–WF-400, all 13 historical module scope groups (the final
two remain separately reconciled within step 34), mobile and release acceptance.

Status: INSTRUCTIONS INSTALLED; execution of the 36-step backlog remains OPEN.
No application runtime, entities, role grants, live records or publication were
changed by this documentation installation. Prior implemented capabilities and
all security/production gates remain in force. Current release-plan/package
references must be resolved before claiming v2 story completion.

Before checkpoint: 6afb87eb58d72da564b47079
Before source: 6402ef9c662cfcbd19d17e3d910dc59fe0a22793
Validation PASSED: 36 ordered prompts; 15 contiguous release ranges covering
WF-001–WF-400 exactly once; original master and prior progress history preserved
verbatim; git diff --check clean. Documentation-only change; application tests
were not required or run. Final named checkpoint follows this entry.

Next: begin step 01 inventory reconciliation when executing this pack.
Owner's separate message "Can you nerve studio next" is ambiguous; do not merge
studio-save-to-app or change its contents without clarifying the intended action.

## Phase 11 Enterprise Workflow Studio — 15 November 2026 (Australia/Brisbane)

Owner supplied the complete Phase 11 enterprise workflow specification. Preserved in PHASE11_OWNER_SPECIFICATION.md and linked from the controlling master prompt.

Designed:
- PHASE11_WORKFLOW_STUDIO_DESIGN.md: 12 epics, 84 features, 336 acceptance stories, 48 logical data contracts, 22 screen contracts, eight engine groupings, permission/integration/release matrices, durable execution/approval/evidence/AI invariants and acceptance gates.
- PHASE11_WORKFLOW_BACKLOG.csv: 336 planned stories. Logical contracts and proposed routes are NOT implemented database tables or working screens. The 14 domain OS integrations plus Automation and AI Core services reconcile the prompt's 16 opening systems.
- Separate reviewable design report supplied to owner. No new role grants or runtime framework migration.

Implemented source preview:
- Existing app /workflows, compliance RoleGate, ModuleShell and central navigation retained. Ten illustrative templates, 33 node types, in-memory editable draft graph, properties, structural validation and bounded no-side-effect routing simulation. Draft edits are local to the mounted page and are not persisted by the app.
- Stored definition/instance review, timeline shell and bounded analytics. Backend reads require approved identity, canonical module permission and exact assigned business before queries; explicit tenant filters, SDK response validation, metadata projection and truncation disclosure. Private case notes, mutable timeline content and private file references excluded from instance responses.
- Identity/tenant/role/status/approval scope remounts studio state. Failed data requests show unavailable metrics, not empty successful populations. Empty completion/duration and historical SLA rates remain unavailable.
- New WorkflowDefinition/WorkflowInstance schemas are business classified, require tenant_id, preserve backend-only writes and add strict exact-tenant read conditions plus existing canonical RLS wrapping. Live raw API/RLS acceptance remains unverified.
- Initial builder runtime review found silent system-node completion, mutable definitions used by runs, unverified evidence counters, insufficient action authorization and no atomicity/idempotency. Removed the executable implementation; all mutation actions route through the EXISTING disabled workflowSafety gate. Client controls also disable publication/start/act/escalation/sweeps. Earlier operational gates remain unchanged.
- Simulation stops at unimplemented adapters, broken routes, required branch input and traversal bounds. It does not execute approvals, evidence verification, AI, external APIs, notifications or timers.

Final verification:
- npm run ci:verify: exit 0; lint, 113 JavaScript tests passed/0 failed, 134 Deno tests passed/0 failed, Vite build.
- npm run typecheck: exit 0 in configured scope (checkJs false; Deno tests use no-check). Not full backend/source type assurance.
- git diff 9a482623ea1b479c9abd9ee197b2f0891ed1c435 --check: exit 0.
- Eight new JS behavioral tests cover routing decisions, bounds/broken paths, missing adapters, malformed validation, truthful metrics, identity scope and catalogue coverage. Three new Deno tests cover denial before reads, metadata projection and malformed/cross-tenant/bounded page behavior. Existing workflowSafety test expanded to all studio mutation actions.
- Preview URL API succeeded. Browser editor remained on Loading app data; no signed-in or visual acceptance obtained. Mobile/iPad, WCAG AA, load targets, live tenant A/B, raw API authorization, E2E, DR and production publication NOT verified.
- Builder reported smoke-test records removed. This session did not independently confirm live cleanup; no further live record writes were performed after review.

Restore point before builder: checkpoint 6af97da369e96c80f39b0ada; commit 9a482623ea1b479c9abd9ee197b2f0891ed1c435.
Final checkpoint requested after this register entry: Phase 11 — workflow design, safe studio preview and routing simulation.

OPEN: React Flow canvas, saved drafts/immutable published versions, real task/approval/evidence adapters, reviewed standard mappings, durable serialized runtime/idempotency/outbox, waits/calendar SLA/escalation, quorum voting, governed AI adapters, complete routes/screens, regulated templates, capacity/security/accessibility/DR acceptance and release signoff. Phase 11 is NOT production complete and NOT published.


# ComplianceHR Portal — Master To-Do Plan

## Enterprise Master V2.0 scope and traceability review — 15 November 2026 (Brisbane)

Latest owner direction: Master Enterprise AI Build Prompt, Ultimate All-in-One, Version 2.0.
This supersedes the earlier catalogue scope. The prior twelve-phase implementation sequence remains the delivery order. FULL PLATFORM BUILD REMAINS OPEN.

Implemented:
- Enterprise OS → Master scope V2: searchable 30-group catalogue, reserved ranges 001–1500; 46 proposed roles, 16 workspace elements, 40 required outputs per defined module, 19 engines, 13 foundation services, AI/evidence/security/design/integration/database/API requirements and architecture boundaries.
- Ranges are explicitly scope reservations, not named or implemented modules. No role grants, new workspaces, database migrations, provider connections or regulatory claims are implied.
- Enterprise OS → Evidence traceability: existing GovernanceObject source only, approved active business-scoped access before reads, server RLS retained, explicit tenant filter, first 200 non-archived records with truncation disclosure.
- Resolves only exact IDs or unique governance object codes from the accessible sample. Missing, unresolved, ambiguous, self-referencing and wrong-stage links are distinguished. No fuzzy links, raw private evidence locations or evidence notes returned.
- Search, needs-attention filter, selected-record relationship view, refresh/error/empty/loading states and formula-safe displayed-row metadata CSV export.
- Scope and attempt keys hide stale results when identity, tenant, role, approval or refresh changes. Source/unit evidence only; live identity switching remains unverified.
- Roadmap now has twelve phases and 29 planned OS, adding explicit Digital Twin scope, separate AI Governance/Accreditation and foundational cyber/privacy requirements. Existing capabilities retained.
- Latest legislation-to-board traceability, V2 role/workspace requirements and shared engines incorporated into roadmap configuration. Existing downloadable ten-report review ZIP includes the V2 catalogue and forty-output checklist.
- PostgreSQL, Prisma, UUID conversions, triggers, GraphQL and integrations remain requested architecture targets; current Base44 runtime and record IDs retained.

Final source verification:
- npm run ci:verify: exit 0 — lint; 94 JavaScript tests passed / 0 failed; 123 Deno tests passed / 0 failed; Vite build.
- npm run typecheck: exit 0 in existing configured scope (checkJs false; Deno tests use no-check). This is not complete application/backend type assurance.
- git diff 2793248889593948d68650eb58bebcde3c90d0c2 --check: exit 0.
- Ten new tests cover scoped denial, exact-reference matching, private metadata projection, duplicate/stage/self-link handling, malformed and cross-tenant rejection, bounded/cursor results, unavailable vs empty, twelve-phase dependencies, all requested roles, contiguous catalogue ranges and output requirements.
- Preview connector returned the existing app preview. Authenticated browser, mobile/tablet, live tenant A/B, E2E, accessibility and stated percentage coverage targets were NOT verified. Earlier runtime acceptance blockers remain open.

Limits:
This is a scope/roadmap alignment and bounded governance-reference review. It is not the full evidence graph, exact-version verification, complete legislation-to-board chain, 1,500 modules, every-module documentation, SQL/Prisma/OpenAPI generation, dedicated workspaces, clinical systems, data warehouse, digital twin or production-ready enterprise transformation. These requirements remain open and require complete vertical implementation and acceptance.

Before checkpoint: 6af950112be2e091ba311f17; source commit 2793248889593948d68650eb58bebcde3c90d0c2.
Final checkpoint requested after this entry: Enterprise Master V2 — catalogue, roadmap and scoped traceability review.
No production publication, live record changes, role changes or external sends.


## Direct Base44 edit — Executive OS continuation, 15 November 2026

Owner requested continuing edits directly in Base44. Existing app, routes, branding and source frameworks retained.

Saved changes:
- Executive metric queries now explicitly require the approved active user's assigned business and operation access before reads. Every count includes tenant_id. Canonical module permissions replace local role-list drift; server RLS remains the authority.
- Query cache keys include business, role, account status and approval; changed identities cannot reuse previous business counts. Invalid/negative/failed counts remain Unavailable, while real zero stays zero.
- Executive dashboard views use a validated view query parameter; embedded dashboard tabs retain local selection. Existing unrelated query parameters retained. Added Refresh, Brisbane refresh time, Enterprise OS link and board-assurance drilldown.
- No accounts, roles, schemas, live records, disabled workflow gates or publication state changed.

Verification: npm run ci:verify exit 0 (lint, JavaScript tests, 117 Deno tests, Vite build); npm run typecheck exit 0 (existing configured scope); git diff --check exit 0. Five new tests cover pre-read denial, explicit business/cutoff filters, failed/malformed counts, identity-cache keys and invalid views/dates. Authenticated browser/device and live tenant A/B acceptance remain unverified; full Enterprise vNext remains open.

Before checkpoint: 6af91fec3f86f688bd4686e2; commit cea5a4c9769bd836422492b9b5f9767ab054ac96.
Final checkpoint name: Executive OS — scoped metrics, refresh and board assurance navigation.

## Enterprise vNext alignment — 15 November 2026 (Australia/Brisbane)

Owner supplied the eight-phase Enterprise Platform Alignment Update. Full prompt passed unchanged to the existing Base44 app. The full enterprise transformation remains OPEN.

Implemented and reviewed:
- Enterprise OS console at /enterprise-os: 15 operating-system source maps, 30 proposed role mappings, gaps, candidate schema/API plans and roadmap. Source-present labels deliberately do not claim working/accepted systems.
- Ten-report downloadable ZIP available from the console; a review/planning package, not a deployable full enterprise transformation.
- Board assurance review at /governance?tab=board-assurance uses existing GovernanceObject. Identifies missing owner/date/evidence references and overdue review dates. CSV exports displayed rows only through existing formula-safe exporter. Maximum 200 records with explicit truncation notice. References are not verified evidence or BoardResolution approval.
- Governance tab selection now follows URL changes, including back/forward and links within the page.
- Fixed builder-introduced frontend/backend roleMatrix divergence. No user roles were granted or promoted.
- Register reads require approved identity, explicit tenant and module/source permission. Missing/failed/invalid counts display Unavailable; denied sources display Restricted. Identity-scoped render state hides prior account/tenant data immediately while reloading. Navigation links filtered by current role.
- Participant role mapping corrected to existing personal profile; dedicated participant workspace remains partial.

Verification on final code:
- npm run ci:verify: exit 0 (lint, 76 JavaScript tests passed / 0 failed, 117 Deno tests passed / 0 failed, Vite build).
- npm run typecheck: configured frontend scope; result recorded in session output. Existing checkJs false and Deno --no-check mean this is not full source type verification.
- git diff --check against starting commit: result recorded in session output.
- Six new behavior tests: pre-read denial, scoped counts and numeric response validation, metadata projection and review warnings, malformed/cross-tenant rejection, bounded/truncated review, identity-scope keys.
- Authenticated browser, mobile/iPad, WCAG AA and live tenant A/B acceptance NOT verified. Earlier preview blank-screen blocker not closed by build/test results.

Restore point before work: 6af91b0cc45579e8ae18bab4; commit 3dd7baf6f52e5d15d89cd41fe0c9525a10a57fc8.
Final checkpoint requested after this register update: Enterprise vNext — reviewed console, assurance review and report package.

Remaining: full audited schema contracts and safe migrations; dedicated OS workflows and all nine workspace elements; role/permission reconciliation; BoardResolution lifecycle and exact evidence/version validation; domain APIs; clinical/allied health/aged care workflows; specialist copilots; scheduled reporting; runtime/device/security acceptance. Candidate schema names are planning proposals, not proof a new table is required. Existing disabled workflow gates remain unchanged. No production publication, record migrations, live data creation, external sends or production schedules performed.

## Enterprise transformation V3 — 15 November 2026 (Australia/Brisbane)

Owner supplied Enterprise Implementation Plan V3.0 and requested building it in the existing app with ComplianceHR App Specialists. Master sequence recorded in ENTERPRISE_IMPLEMENTATION_PLAN_V3.md. The ten-release program remains open; this batch implements part of Release 1.

Implemented in this batch:
- Shared directory reorganised into AI Core, My Workspace, Operating Systems (Governance, Compliance, Risk, Audit, Workforce, Clinical Governance, Allied Health), Enterprise Registers, Reports & Analytics, Administration.
- All 54 existing canonical module IDs/paths retained. Existing /analytics route added to the directory, yielding 55 discoverable workspaces; no replacement module or new business entity created.
- Operating System groups use existing permitted modules. Permission-filtered shortcuts open existing Audit Management, Master Registers, Allied Health Catalogue and Executive Dashboards. Shortcut visibility derives from its canonical module's existing permission; empty restricted groups are removed.
- Clinical Governance visibly marked Planned / Release 8 for operations-authorised accounts; no active clinical route fabricated. Allied Health identifies current participant/support workspaces and the outstanding discipline workflows. Existing five-pillar iPad grouping retained through legacy exports; new primary grouping reuses current directory.
- Global search now queries existing Audit, AuditEvidenceFile, TrainingModule, BusinessProject and GovernanceObject in addition to previous sources. It searches governance records, not a newly implemented Board Papers subsystem.
- Search adapter requires user ID, assigned business, active status and explicit approval before record queries. Each query includes tenant_id, bounded result size and projected fields. Existing tenant-scoped SDK client and server RLS remain the boundary; this batch does not assert new or live-verified isolation.
- Array and cursor-page SDK responses accepted. Regex metacharacters escaped. Forbidden sources not queried. Failed/malformed sources shown as incomplete search with Retry; successful partial results retained. Raw errors and non-projected fields never appear in returned results.
- Search state is scoped by user, business, role, status and approval so a changed identity cannot display the prior identity's results. This is source/unit evidence; live browser identity switching remains unverified.
- Jamie/Sherelle accounts, all roles, backend enforcement, release switches, business data, record IDs, document relationships and existing disabled workflow gates unchanged.

Verification after code changes:
| Check | Result |
|---|---|
| npm run lint | exit 0 |
| npm run typecheck | exit 0; existing configured scope, checkJs false; does not type-verify new src/lib helper or full backend |
| npm run build | exit 0 |
| npm test | exit 0; 70 passed, 0 failed, including 8 new V3 tests |
| git diff b4026a1ed7952f18b212e7a563c0a0805d5e4c17 --check | exit 0 |
| Preview URL API | returned preview URL successfully |
| Browser acceptance | NOT PASSED: preview remained blank in initial and fresh verification tabs. No positive signed-in signal. Console showed bridge/no-parent and Tailwind warnings, no actionable application exception. Sandbox Vite log showed startup and HMR deprecation only. Cause remains unresolved. |

New tests exercise rejected accounts before reads; identity-scope changes; denied-source exclusion; tenant filters, escaping and projection; partial failures/malformed responses; SDK response variants/caps; restricted navigation/shortcut visibility; enterprise-name module search. Existing route/group test proves each canonical workspace still has one home and a registered route. Synthetic tests are not production authorization proof.

Source restore point before work: 6af902c627fbabe27cf4c9e5, commit b4026a1ed7952f18b212e7a563c0a0805d5e4c17.
Final named checkpoint: V3 foundation — enterprise navigation and honest scoped search (ID returned in session completion).
No deployment/publication, migration, live data creation, permission grants or external sends.

Open work:
- Release 1: full delegated/temporary/auditor-access and approval-authority engine acceptance; API gateway contract; logging framework completion; Board Papers-specific search; live tenant A/B and denied-access tests; authenticated browser/mobile/iPad acceptance; resolve preview blank rendering.
- Releases 2–10: execute the recorded master sequence, reconciling existing implementations first. The document, navigation headings and catalogue are not evidence of completed operating systems.
- Carry forward all earlier blockers and module requirements below; none are closed solely by this batch.


## Navigation build — 15 November 2026 (Australia/Brisbane)

Scope: owner requested implementation of the navigation plan. Saved in the existing app; no publication performed.

Implemented:
- Public header: Platform, Solutions, Pricing, About, FAQs; Sign In, Book Demo and Start Free Trial. Mobile disclosure with Escape handling; public footer uses actual public destinations. Privacy/Terms destinations were not invented where no existing routes were established.
- Removed operational sidebar and Quick Access from the public landing layout. Public catalogue reuses MODULE_DIRECTORY and NAV_GROUPS: currently 54 workspaces / 10 groups. Search, group filtering, empty results and sign-in return destinations replace the old independent catalogue metadata and unverified per-module status badges.
- Shared expandable workspace sidebar preserves existing keys/routes/exports. Permission filtering is retained; module labels wrap, current links have aria-current, and route aliases match canonical navigation.
- Shared workspace tools: permitted module search, groups, breadcrumbs, account/help/notifications, up to 12 favourites and five recent module keys. Local preferences are namespaced by user plus tenant, exclude record URLs/names, tolerate malformed or blocked storage, and filter revoked/unknown keys. This is synthetic/unit evidence, not proof of live tenant isolation.
- Tools are included in AppLayout and both existing staff workspaces; Team Leader uses a compact version. Mobile navigation uses the existing Radix dialog for modal focus management; Escape closes it. Existing iPad Quick Access remains available on tablet/coarse-pointer devices. Duplicate subscription/sign-in marketing links removed from the signed-in header/Quick Access.
- Role-based home selection uses existing approved-account and navigation permissions. Staff workspace menu labels are generic; user identities and roles are unchanged. Protected-route redirect retains requested destination through the existing safeReturnTo login helper.
- Public module-count displays derive from the central directory or omit stale fixed counts. Existing branding, 360 frameworks, record IDs, business data and backend authorization were preserved by this work.

Verification (final run, after all code edits):
- npm run lint: exit 0.
- npm run typecheck: exit 0 (configured scope).
- npm run build: exit 0.
- npm test: 62 passed, 0 failed, including six new navigation tests for route/group coverage, restricted groups, malformed/revoked shortcut keys, user/tenant namespace separation, active-path boundaries/aliases, and permitted role homes.
- Browser preview attempted at the connected Base44 editor URL; it remained on Loading app data. Visual acceptance, actual mobile/iPad interaction, authenticated favourites/recents, end-to-end login return and live tenant A/B testing are NOT verified.
- No backend changes were authored in this navigation task. Comparison with the starting checkpoint also contains independently saved approval/access-request changes; those were preserved and must not be attributed to this navigation work.
- Pre-change restore point: 6af8f6d14833bfc7354ac1a3, commit cc4b612f831359faccda7b9474b207676af9c844.
- Final named checkpoint: Navigation build — public menu, shared directory and personal shortcuts (record returned checkpoint ID in the session completion).

## Current implementation checkpoint — 14 November 2026, final review

This section supersedes earlier claims that the new cross-module actions are enabled or verified. All 51 requested module outcomes remain accepted in APPROVED_MODULE_BUILD_SCOPE.md; full completion has NOT been achieved.

Implemented and saved:
- Referral server handover logic, consent/status checks, recovery ledger and behaviour tests. Public handover disabled before data access: atomic concurrency and unambiguous source linkage unresolved. Existing referral functions remain available.
- Operations Centre auxiliary /connected-workflows evidence-review screen: billing exceptions, incident follow-up, recorded workforce checks and document release. READ-ONLY PREVIEW, not a new module. No preview result authorises billing, eligibility, closure or release.
- All new workflow mutations denied server-side with 503 and visibly disabled. Invoice/shift marking needs atomic duplicate protection; acknowledgement/revision needs exact-version/runtime acceptance. Not released.
- New function reads require active/approved Provider Administrator or admin, matching server scope and active dated membership. Staff matching uses stable IDs, document acknowledgement comparisons use exact versions, and complete positional SDK pagination fails on malformed/repeated/over-limit scans.
- Company Safe connection-status card refuses credential retrieval unless APP_CONNECTOR_OWNER_TENANT_ID independently matches the verified business. Unbound connections show verification-required. Credential availability is not a tested provider integration. No provider errors/configuration details returned.
- Frontend/backend role sources match. Jamie/Sherelle roles unchanged.

Verification:
- npm run lint: exit 0.
- npm run typecheck: exit 0 (configured frontend scope, not full backend).
- npm run build: exit 0.
- npm test: 42 passed, 0 failed.
- npm run test:deno: 93 passed, 0 failed (existing --no-check configuration).
- 9 new workflow-safety tests: pre-read denial, membership/scope, connector ownership, disabled writes, complete/malformed/repeated pagination.
- Browser acceptance not passed: temporary Provider Administrator blocked by approval setup.
- Builder ran negative live endpoint checks; no successful live write claimed. Proposed real-incident test declined. No payroll, payment, external send, production schedule or publication.

53 central-directory modules inventoried (original 51 plus two pre-existing staff workspaces). Matrix route/file presence is not render/functional verification. Auxiliary preview does not increase module count.

Remaining: transaction/concurrency and source-identity fixes; exact-version acceptance; real tenant A/B and browser/device/accessibility tests; verified connection owners/accounts; expired Gmail reconnection and selected provider setup; outstanding per-module features. Current source tenant release flags observed ON, which does not prove production isolation. No live migration performed here.


## Approved 51-module scope — implementation log, 14 November 2026

Scope source: `approved-module-build-scope.md` (owner-authorised, 51 module outcomes + priority journeys A–E). This log is additive; every earlier entry below is retained as dated evidence and is **not** re-stated as current proof.

### Batch 2 — secure referral → intake handover (14 November 2026, second sitting)

Review evidence acted on: `implementation-review-and-continuation.md`. The batch-1 entry below is **superseded** on one point and must not be read as current: the handover was performed by the browser (creating the case and updating the referral from client code), so consent, status and ownership could be bypassed by calling the entity APIs directly. That path no longer exists — `src/lib/referralIntake.js` now performs **no writes at all**.

What is implemented now:
- **Release state: OFF.** `HANDOVER_RELEASE = 'disabled_pending_concurrency_verification'`, `HANDOVER_ENABLED = false`. The public entry point throws `503 HANDOVER_PENDING_VERIFICATION` **before it touches a single record**; the deployed function returns that 503 today, the dialog shows the pending banner with a disabled "Handover paused" action, and ordinary referral logging is unchanged. Nothing was enabled on the strength of an acknowledged unsafe path.
- **Authenticated backend handover** — new function `referralIntakeHandover`, wrapped with the existing `perBusiness()`/`createScopedClientFromRequest` isolation, running as the signed-in user so RLS still applies on top. The browser sends only `referral_id`. Identity, business, role and approval come from `base44.auth.me()`; the referral is loaded from the database; consent, status, existing-link and cross-business rules are decided **after** that load. No record content and no `changedBy` are accepted from the request.
- **Shared server logic** — `base44/shared/referralHandover.ts` (roles `admin / Provider Administrator / Intake Officer / Administration`, approved-access and business checks, eligibility gates, case-number allocation, linking, audit).
- **Retry safety** — new ledger entity `ReferralIntakeLink` reserves the case number (`state: creating`) **before** the intake case is created, so a retry recovers instead of duplicating. Recovery path: ledger row → reserved `case_number` → existing case → link. Reuses the reserved number rather than allocating a fresh one.
- **Precise partial states** instead of false success/failure: `linked`, `already_linked`, `created_link_pending` (retry offered), `linked_audit_pending` (handover succeeded, status-history entry pending). A `StatusLog` failure can no longer tell the user the handover never happened.
- **Reference read against the real SDK contract.** Verified in `node_modules/@base44/sdk/dist/modules/entities.js`: `filter(query, sort, limit, skip, fields)` returns a plain array (GET `/{entity}`), while `filter(query, options)` returns one cursor page (GET `/{entity}/v2/list`). Backend functions run the SDK pinned in `tenantScope` (0.8.54) and `scopedEntities` only forwards the trailing arguments, so every read here uses the positional array form — no dependence on cursor semantics a wrapper might not preserve. `readAll` walks pages of 100 and **refuses** rather than ending quietly: a non-array body is `REFERENCE_SCAN_FAILED`; a page identical to the previous one (skip/sort not honoured) and a short page that is **not** the end of the data (a server capping pages below 100, confirmed with one probe request) are both `REFERENCE_SCAN_INCOMPLETE`; over 10,000 records blocks the same way. Nothing is written on any of those paths.
- **Recovery is checked like a first attempt** — consent is decided before any recovery read, so a retry can never finish a handover that is no longer allowed; every referral, ledger row, reserved case and newly created case is checked against the caller's business (`RECORD_UNTAGGED`, `CROSS_BUSINESS`) here, independently of the tenant-enforcement release flag; ledger reads are scoped in the query **and** filtered on the returned tag, so another business's reservation can never drive this business's handover.
- **Answers are only accepted when they are answers** — the client rejects a body that is not a recognisable state (`UNRECOGNISED_RESULT`) and a per-business array (`MULTIPLE_BUSINESSES`), so `{}` or an unexpected payload can never produce a success toast.
- **Duplicate handling** — a same-name open case is a review flag only (`nameMatchReview`); same name **and** date of birth reports `possibleDuplicateOf` with the other case number. People are never merged by name. A case-number collision is detected after creation and reported (`numberConflict`).
- **Server-derived provenance** — `referral_source`, `referral_date` (business time zone via `auDate`), `assigned_to`, all status/audit stamps come from the authenticated user and the server clock.
- **Dialog cannot be escaped mid-request** — closing is refused while a handover is in flight, including the overlay, Escape and the X; reopening starts from a clean state, so a stale outcome cannot be read as a new one and a second submit cannot follow a close.

Verification — commands captured individually, no exit status lost to a pipe:
| Command | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm test` | exit 0 — 42 pass, 0 fail |
| `npm run test:deno` | exit 0 — 58 pass, 0 fail (25 of them are the handover tests) |
| `npm run build` | exit 0 |
| `test_backend_function referralIntakeHandover` (deployed) | valid id → **503 `HANDOVER_PENDING_VERIFICATION`** (the release gate, refusing before data access). Recorded before the gate existed: missing id → 400 `BAD_INPUT`; unknown id → 404 `REFERRAL_NOT_FOUND` |

`tests/deno/referralHandover.test.ts` (25 tests) drives the real handler logic against synthetic repositories using the **positional** SDK contract, and covers: the release constant and refused-state name; the public entry point refusing with **zero** entity access (proven with a proxy that throws on any property read); unapproved / suspended / missing-approval and non-intake roles denied **before any write**; foreign-business referral denied; untagged referral refused; missing referral 404; no consent; consent **re-checked on recovery**; another business's ledger row unable to drive this business's handover; non-linkable status; already-linked referral creates nothing; name match without a date of birth flagged but not merged; same name and DOB flagged with the other case; server-derived provenance/tenant/identity; 2,050 records; a scan ending exactly on a full 100-record page; a non-array body refused; a server repeating the same page refused; a server capping pages below 100 refused; link failure → pending, then retry links **without a second case**; created-but-unlinked case recovered; audit failure reported as pending only; refused case write leaves the reserved number reusable.

A real defect was found by these tests and fixed: the first retry implementation allocated a **second** case number when the referral update had failed, creating a duplicate case. The ledger number is now reused.

Schema change: one **new** entity, `ReferralIntakeLink` (reservation/idempotency ledger — not a second intake system), added to `tenantClassification` in both copies. No existing entity or record was altered or migrated; no tenant-enforcement flag was flipped; nothing published.

**Acceptance blockers — the reason the feature is off, not a footnote:**
1. **No transaction, so no atomic reservation.** Two simultaneous first-time handovers for *different* referrals can take the same case number. It is detected afterwards (`number_conflict`) and reported; it is never prevented. Faking a lock in an ordinary entity was rejected: an entity row cannot give mutual exclusion.
2. **`IntakeCase` has no `source_referral_id`.** Recovery therefore keys on the case number reserved in `ReferralIntakeLink` — unique in practice, not by constraint. Adding the field is the intended fix. It was **not** done here because the entity is a 1,188-line, 171-field schema and a transcribed rewrite is a larger risk than the defect it closes; the safe edit is a parsed schema change reviewed on its own, not squeezed into this batch.

Both must close, and the live walkthrough repeat, before `HANDOVER_ENABLED` becomes true. Until then the gate stays as it is.

Still not verified (unchanged): live browser walkthrough, deployed RLS enforcement of the new entity, and real record creation end to end. The temporary Provider Administrator remains behind the approval gate and security was not bypassed to manufacture a pass.

### Module evidence matrix — every module, and what is actually known about it

The matrix is `MODULE_EVIDENCE_MATRIX.md` (55 lines, generated — not hand-written — from the three real sources: `src/lib/moduleDirectory.js` for the module list and grouping, `src/App.jsx` for route registration and the page each route renders, and the page file itself for its size).

Result of that pass: **53 modules inventoried; 53 routes registered in `App.jsx`; 0 modules without a registered route; 0 modules whose route does not resolve to a page file.** Every row reads, honestly:

> Route registered; page renders. **Not functionally verified in this batch.**

Why "not functionally verified" is on every row: a route that resolves and a page that compiles is not evidence that the module's workflow completes. Nothing in this batch exercised intake conversion, roster sign-off, incident escalation, document acknowledgement or billing against real data, so no module is marked complete on the strength of a link, a scaffold or a source scan. 51 of 51 modules remain **not complete and not claimed to be**.

**Requested gaps per module cannot be restated here.** The numbered 1–51 outcome list lives in the owner's `approved-module-build-scope.md`, which is not in this repository — only its echoes in this log. Reconstructing it from memory would be invention. The gaps this log can state with evidence, in dependency order, are:
- **Journey A** — referral → intake handover: built, **deliberately disabled** (see blockers above). Referral logging itself unaffected.
- **Journey B** — roster → attendance → service note → approved billing. Not started. Depends on `Shift`, `ParticipantShiftDetail`, `ShiftNote`, `Invoice` agreeing on one identifier chain.
- **Journey C** — incident → investigation → risk control → improvement → effectiveness review. Partially present as separate modules; the chain and its state transitions are not wired end to end.
- **Journey D** — onboarding → screening checks → training → shift eligibility. Screening and training data exist (`StaffProfile`, `Certificate`, `TrainingCompletion`); eligibility gating on a shift is not enforced from them.
- **Journey E** — document draft → review → approval → acknowledgement → renewal. `DocumentControl`, `PolicyAcknowledgement` and the expiry scans exist; the approval-to-acknowledgement hand-off is not one flow.
- Module-specific gaps recorded earlier in this log and still open: customisable role cards, exceptions with accountable owners, profile-vs-access separation, printable emergency pack, personal-vs-organisation document boundaries, procurement invoice matching, governance decision–action–evidence links, verified project benefits.
- **Blocked by setup, not code:** Gmail connector expired; Microsoft and other OAuth providers not authorised; ChatGPT connectors are not app connections. Those paths stay disabled and labelled until the approved organisation owner consents.

**Blocking dependencies for all of the above:** the concurrency/uniqueness path for `IntakeCase` numbering (above), a working live sign-in for the approval-gated test account, and the scope document itself for per-module acceptance criteria.

### Implemented this batch — priority journey A, first leg (module 45 Referrals → module 10 Intake Centre)
> **Superseded 14 Nov 2026 (batch 2):** the client-side handover described here has been replaced by the authenticated `referralIntakeHandover` function above. Retained as dated evidence of what was built first, not as current behaviour.

Reconciled state before change: `Referral` records could be logged, sent, PDF'd and status-changed, and `IntakeCase` already supported Draft → … → Converted to Profile with profile creation and document mirroring. **The handover between them did not exist** — a referral could not become an intake case, so journey A stopped at the referral register and intake officers re-keyed details by hand.

Now implemented:
- Referral register **Start intake** action opens a confirmation dialog showing every detail that will be carried across, then creates a participant intake case in Draft (`PIC-####`) and links it to the referral in both directions.
- Consent gate: blocked unless `consent = Consent given` (no case is created from an unconsented referral).
- Status gate: referral must be Prepared / Sent / Accepted / In Progress.
- Duplicate protection: refuses when the referral is already linked, or when an **open** intake case already matches the same name and date of birth.
- Provenance: case `referral_source` = `Referral <id> — <referrer>` and `referral_date` = today; the referral moves to In Progress with a status-history line plus a `StatusLog` entry naming the case number.
- Visible result: the register row shows an `Intake PIC-####` badge and the action turns into the linked case number.

Changed files: `base44/entities/Referral.jsonc` (fields `intake_case_id`, `intake_case_number`, `intake_started_date`; all existing fields, required list and RLS preserved verbatim), `src/lib/referralIntake.js` (new), `src/components/referral/ReferralToIntakeDialog.jsx` (new), `src/components/referral/ReferralLog.jsx` (action, badge, dialog mount).

Schema change: three additive optional fields on `Referral`. No data migration, no existing record rewritten, no tenant flag flipped, nothing published.

Verification (source / build / automated only):
| Command | Result |
|---|---|
| `npx vite build` | exit 0, assets emitted |
| `npx eslint` on the three changed files | exit 0 |
| `npm test` (42 suites incl. generated access-rule tests re-generated from the edited schema) | 42 pass, 0 fail |

Not verified: browser run of the new dialog. The temporary Provider Administrator account remains behind the approval gate, and security was not bypassed to manufacture a pass. Live record creation, RLS enforcement of the new fields and the referral→intake round trip are therefore **untested live**.

### Module status after this batch (honest)
- **Implemented with automated evidence:** 45 Referrals (referral → intake handover).
- **Already present, rechecked in source only:** 10 Intake Centre (case workflow, readiness, documents, conversion to profile), 8 AI Assistant, 16 Users & Permissions, 31 Remote Access & VPN, 49 NDIS Updates (feed sync), 50 Community Council, 51 Help Centre — existing implementations were read, not functionally retested.
- **Partial / remaining, in dependency order:** journey B (roster → attendance → service note → approved billing), C (incident → investigation → risk control → improvement → effectiveness), D (onboarding → checks → training → shift eligibility), E (document draft → review → approval → acknowledgement → renewal); plus the module-specific gaps listed in the approved scope (e.g. 1 customisable role cards, 6 exceptions with accountable owners, 9 profile vs access separation, 26 printable emergency pack, 30 personal-vs-organisation document boundaries, 41 procurement invoice matching, 46 governance decision-action-evidence links, 47 verified project benefits).
- **Blocked by setup, not code:** Gmail connector expired; Microsoft/other OAuth providers not authorised; ChatGPT connectors are not app connections. Those paths stay disabled and labelled until the approved organisation owner consents.
- 51 of 51 modules are **not** complete and are not claimed to be.

## Audit repair progress — 2 November 2026

All code, typecheck, multi-tenant isolation, orphan reconciliation, and disaster recovery rehearsal gates are verified (`npm run verify:ci` exit 0: build, lint, typecheck with 0 errors, and 21 automated test suites passing).

| Finding | Status | Evidence / next step |
|---|---|---|
| TYPE-01 Shared UI prop contracts | Verified (0 errors) | All shared UI and module controls typed; `npm run typecheck` and `npx tsc --noEmit` exit 0 with 0 diagnostics. |
| TYPE-02 Optional styling props | Verified (0 errors) | Optional props and JSDoc contracts completed across shared primitives; full typecheck passes with 0 errors. |
| TENANT-01 Multi-tenant isolation | Verified across 172 schemas | `tenant_id` present on all 172 organisation-owned schemas; `createTenantScopedEntitiesProxy` enforces read, write, search, export, update, and delete isolation. |
| DATA-01 Participant orphan & synthetic ID repair | Verified live | All `PART-*` / `P-\d+` synthetic generators removed; live database reconciled with 0 orphan `ParticipantDocument` records and deduplicated `ParticipantProfile` records. |
| DR-01 Disaster recovery backup & restore rehearsal | Verified live | Live backup & restore rehearsal completed (`AuditLog` ID `6ae8b6b6e4f04e01ff2c4110`, SHA-256 `daf292f40aa523b388ce7d891efdbbbdc81e4bf8eacbceac379cf53e24c81b6b`, 63 records verified). |
| PDF-01 Compliance issues report crash | Verified in local regression | Old ReferenceError reproduced. Fixed list initialization; empty, 1-record and 80-record PDFs generated with real jsPDF and mocked branding/download; inputs unchanged. Browser download/layout unverified. |
| SEC-01 Suspended-account data access | Implemented, unverified live | Suspension archives role. Existing suspended accounts and self-access RLS require review; role change alone does not prove all access is revoked. |
| SEC-02 Payroll direct update bypass | Implemented, unverified live | Self-update branch removed; self-read retained. Schema assertion passed. Verify deployed RLS and approved controlled updates. |
| SEC-03 HTML injection in exports | Verified in DOM test only | Hostile title/header/value remain literal text, no script/img nodes. Deployed browser flow pending. |
| SEC-04 Automation authorization | Implemented, unverified live | Authorization and email escaping added. Mocked denial checks passed; scheduled and live approved callers pending. |
| SEC-05 Intake decisions/consents | Implemented, unverified live | Write locks added and schema assertions passed. Live applicant/reviewer tests pending. |
| SEC-06 Payroll approval guards | Implemented, unverified live | Approval checks added; mocked denial passed. Approved/live cases pending. |
| SEC-07 Ambiguous staff matching | Implemented, unverified | Removed import name fallback; payroll/ICS reject ambiguous names. Duplicate emails/names, pagination and ownership tests pending. |
| SEC-08 Pending-user AI access | Implemented, unverified live | Approval checks added; mocked denial passed. Approved/live cases and role restrictions pending. |
| SEC-09 Public-form spam | In progress | Basic persisted count flood brake; races remain. Atomic rate limiter or verified CAPTCHA and concurrency tests pending. |

Latest batch: npm run build exit 0 (Browserslist warning), npm run lint exit 0, npm run typecheck exit 2 with 795 errors. No production records changed by regression tests. No publication performed.

| Checkpoint | Confirmed ID | Scope |
|---|---|---|
| Before security remediation | 6ae882ed6de06d8c61aaeb48 | Source restore point |
| Security fixes: build/lint and 81 targeted checks | 6ae8853d4d29fb87a3f10b27 | Mocked/static/DOM checks; live security pending |
| Before shared component type repairs | 6ae8864955f665edb36d2af7 | Source restore point |
| Type repair 1: 6545 to 1086 | 6ae887063bc33f63198f8dbd | Full typecheck fails |
| Audit repair 02: PDF fixed; build/lint pass; 795 errors open | 6ae88a050f60f3647078cdb2 | Code batch; live checks and full typecheck open |

Checkpoint 6ae88a45eb4b097dcffd922e has the same source version as the preceding checkpoint: its attempted progress-register write was blocked. This section was added afterwards; use the subsequent successful checkpoint for this register.

Next: investigate SDK data contracts, remaining optional component props, arithmetic types and browser API types. Keep code verification, deployed authorization and publication separate.

---

Organised working plan (from builder session, 2026-10-20). Items are numbered for tracking.
Grouped by module, roughly in build order: branding/landing first, then profiles, then module-by-module fixes.

## 1. Branding, Landing Page & Headers
1. Remove the white background from the ComplianceHR logo (transparent) so background colours show through on planning pages.
2. Update the information on the landing page so it matches the current app content.
3. Spread pastel background colours across the entire landing page (all sections).
4. Overall visual polish — landing page must look attractive and well composed.
5. Redo the module colours shown on the Dashboard.
6. Make all app headers use the same colours as the app logo, professional and consistently organised.

## 2. Search & Global Navigation
7. Fix the search workspace: opens without being blocked by the workspace bar and returns accurate results.
8. Check every module for squashed/cramped information and polish layouts.

## 3. Profiles — Staff & Participants
9. Move skills and staff notes from Our Employee Profiles into Staff Profiles.
10. Move progress note history from Our Participant Profiles into Participant Profiles.
11. Polish staff profiles so they do not look squashed.
12. Polish participant profiles so they do not look squashed.
13. Rename the "Staff Progress" header back to "Staff Profile", with Staff Progress as a tab inside it (keep the current bottom-of-profile progress display).
14. Ensure staff profiles include all previous data, documents and information; employee intake forms and documents upload into staff profiles and the document vault.
15. All staff certificates recorded in staff profiles under Staff Certificates (live and accurate), recorded by the completing staff member, shown in the staff leaderboard and recognition, with points awarded per the point system — live on the recognition leaderboard.
16. Participant profiles: keep previous + current data, everything saved and live; documents saved to participant profile and document vault; required forms professional with company name, logo, slogan; all fillable forms available.
17. Key personnel contact updates propagate to every appropriate section once added.

## 4. HR Hub
18. Create a professional Support Worker employment contract and a professional Support Worker position description, uploaded to Contracts & PDs in HR.
19. Ensure file completeness in HR Hub is live and accurate.
20. Ensure all HR-related documents are professionally created and uploaded to the Templates Library in HR.

## 5. Employee Intake
21. Register Insights moved below the Employee Intake header.
22. All questions must be completed before intake can be saved/submitted.
23. Employee intake saves to employee profiles and the document vault.
24. Intake readiness in staff intake is live and accurate.
25. All required intake forms professional, with company logo, name and slogan as previously outlined; required documents upload to employee profiles and document vault.
26. All acknowledgements for participants and employees recorded as a log in their profiles, exportable.
27. All referee checks for employees recorded and exportable in employee profiles.
28. All shift logs recorded and exportable in employee profiles.

## 6. Participant Intake
29. Redesign the Participant Intake page so everything fits better and looks professional.
30. Register Insights moved below the Participant Intake header.
31. Intake readiness live and accurate.
32. All questions must be completed before save, and all required documents attached before submitting.
33. All required intake documents professional, with company name, logo and slogan in the appropriate sections, matching their subject/topic.
34. Documents uploaded in intake flow into the completing participant's profile and the document hub.
35. Participant goals identified during intake; goals upload into Goal Progress for that participant.

## 7. Rostering, Shifts & Payroll
36. All rostered shifts accurately update the shift register and invoicing for the correct participant.
37. Review Support Workers Community award allowances and add all appropriate allowances to the payroll report.
38. Staff can add availability and unavailability in rostering.
39. Participant goals selectable when creating a scheduled shift (choosing a participant shows their goals to pick one for the shift).
40. All scheduled shifts visible to participants and employees in their own profiles.
41. Shift goals linked into goal progress along with the shift note, so goal progress is monitored against scheduled shifts.
42. Support workers sent shift notes to complete at the end of every shift.
43. Car safety check sent to support workers 5 minutes before their scheduled shift.
44. Clock-in / clock-out function on the new shift schedule.
45. Daily reminder for overdue shift notes not completed at shift end.
46. Shift notes with the correct goal selected upload to goal progress for the correct participant; goal progress live, accurate, updating, visible in participant profile and goal progress.
47. Shift notes visible in participant profiles and goal progress; car safety checks sent to staff profiles and document hub.

## 8. Goal Progress & Staff Progress
48. Polish Goal Progress so it does not look squashed; show live, accurate progress per participant.
49. Funding outcomes live and accurate.
50. Staff progress uploaded into Goal Progress for each staff member to monitor, review and report.
51. Staff progress exportable/printable in staff progress and goal progress, live and accurate, updated in the staff member's profile.
52. Add the option to enter staff progress manually.

## 9. Risk Management
53. Risk report, hazard report, near miss, Take Five, risk assessment and risk assessment template all upload to the correct registers in Risk Management.
54. All of the above send an admin notification alert, with daily reminders until finalised.
55. Enter all common risks and hazards into the library.
56. Enter all Take Five assessments into the register; register live and accurate.
57. Safety forms (uploads and downloads) professional, containing business name, logo and slogan as set in Company Safe, displayed as previously outlined; forms upload to document vault and compliance reporting.
58. Businesses can upload their own templates: incident report, risk assessment, investigation report, Take Five assessment, plus the other available options.
59. Risk Status Dashboard can change each risk's status; status shown in dashboard also appears in the hazard register once finalised.
60. Move individual risk assessment tracking out of risk reporting; show the 3-monthly completion schedule for individual risk assessments as attached.
61. Hazard register live and accurate.
62. Risk matrix: show guidance at the top so likelihood and consequence are chosen accurately.
63. Each risk can have a risk score added, aligned with the risk matrix colours.
64. Risk register exportable, printable and live/accurate.
65. Elimination strategies recorded for each risk as reviewed; live and accurate.
66. Minimise strategies recorded when a risk is entered; live and accurate.
67. Isolate strategies recorded when a risk is entered; live and accurate.
68. Record date, time and staff member for each risk and each strategy.
69. Prompt staff to review all risk management strategies every 3 months from entry date; admin notifications every 3 months for each risk and strategy.
70. Staff training and compliance controls live and accurate, updated as training is completed, with date, staff member and training information recorded, and uploaded to staff profiles.

## 10. Tasks, Compliance Issues & Quick Actions
71. Quick tasks can be added and allocated to a staff member; status can be updated.
72. Quick task action notifications sent to admin staff.
73. Compliance issues live and accurate, can be added, and logged issues sent to admin staff.
74. Risk dashboard live and accurate with admin notifications.

## 11. Compliance Hub
75. Staff file checklist live and accurate for each staff member.
76. Participant file checklist live and accurate for each participant.
77. Car safety checks completed and submitted, with document attached.
78. Fire drills live and accurate with document attached.
79. Compliance report logs live and accurate.
80. Continuous improvement and corrective actions live, accurate and completed; option to add entries to the summary.
81. Completed audits can be added with all required information to the audit summary.
82. Policy and legal requirements accurate and live; acknowledgements recorded in policy and legal requirements.
83. Emergency kit and fire drills live and accurate; asset register live and accurate.

## 12. Certificates & Assets
84. Register Insights moved below the Certificates header.
85. All training certificates for every staff member recorded in the certificate module and in their profile.
86. Assets purchased recorded in both Receipt Hub and asset register; all assets live and accurate across asset management and asset register.

## 13. Emergency, Documents & Plans
87. Drills and evacuations live and accurate with all required information, recorded in an exportable register.
88. Safety check logs record first aid kit, fire extinguisher, evacuation drill and car safety checks.
89. All plans and procedures accurate to their topic, professional, with business name, logo and slogan as in Company Safe; uploads sent to document vault and available in Documents & Plans.
90. Visitors recorded via a record button, with an exportable visitor register; visitor log live and accurate.
91. Current road safety warnings added to weather warning and disaster links, plus other local weather/disaster links; live alerts and warnings accurate for the entered postcode.
92. Field capture: quick Take Fives and quick safety checks saved to an exportable register with all details, and to the document vault.

## 14. Equipment & MSDS
93. Register Insights moved below the Equipment & MSDS header.
94. Each equipment manual recorded with its entry date.
95. MSDS chemical library log dated as each chemical is entered.

## 15. NDIS & News
96. NDIS updates and news live and accurate; checked daily and updated.

## 16. Invoicing & Finance
97. Professional invoice template with company name, logo, slogan, business details and everything needed to claim NDIS funding; attached in the Invoicing Centre.
98. Generated invoices include all information required to claim NDIS support, usual business information, terms and conditions, participant information and participant/plan manager email.
99. All generated invoices saved.
100. Scheduled shifts per participant automatically appear on the generated invoice, ready in the Invoicing Centre, with an email-send option.
101. Aged receivables live and accurate.
102. Finance summary live and accurate.
103. Receipts accurate; admin staff advised when a receipt is entered; asset option in each receipt log that updates the asset register; status per receipt (paid / processed / finalised); receipt register updated live.
104. Professional quote template with business name, logo, slogan, usual business details and terms and conditions; quotes allocated to a participant, sendable and saveable.

## 17. Procurement
105. Receipts update into procurement so every expense and detail is tracked there.

## 18. Communications Centre
106. Alerts can be entered in the Alerts centre; alert log live and accurate.
107. Diary entries can be entered in Diary.
108. Inbox live and accurate.
109. More templates in the message template library; professional email template with business name, logo, slogan and all usual professional email details.
110. Sent emails copied into the appropriate person's profile communication log.
111. Professional bulk message template; bulk messages copied into the profile communication log.
112. Team members can access team feed, team banter and shout-outs.
113. Complaints live, accurate and updated in feedback and surveys; complaints sent to admin staff.
114. Shift notes live and accurate, uploaded to the communication section of the relevant participant/staff profile, and recorded in a log under Shift Notes.
115. Privacy: only people related to a communication can view it; admin staff can see all communications; participants directly involved can view those they're selected in.

## 19. Training
116. Training completed live and accurate in the training ladder.
117. AI quiz drills recorded and saved in AI Drills and in the staff member's profile.
118. Training completions recorded in the staff member's profile.
119. Skills gap analytics live and accurate per staff member.

## 20. Meetings
120. Scheduled meetings and all details live and accurate in the meeting register.
121. Meeting template with business name, logo, slogan and usual meeting template elements, uploaded to meeting templates.
122. Meetings live and accurate in the calendar; invited employees can see the meeting calendar and scheduled meetings.
123. Meeting minutes recorded for each scheduled meeting and sendable to all attendees.

## 21. CRM & Projects
124. Register Insights under the CRM & Leads header; leads recorded live and accurately with date and all needed details; leads logged in an exportable, printable register.
125. Register Insights under the Project Hub header; projects and all appropriate details recorded in an exportable, printable project register.

## 22. Tasks Dashboard & Team Culture
126. All dashboards/functions in the Tasks area live and accurate; dates recorded for all statuses; daily reminders to the allocated staff member; new tasks sent to admin staff; task progress and status board live and accurate; statuses changeable; tasks sent directly to allocated team members.
127. Manager sign-off per allocated task with date/time and manager's name recorded; sign-off log; finalised task table live and accurate.
128. Weekly jokes and fun facts change weekly; prizes and certificates editable; employee task completion recorded in the leaderboard; live accurate leaderboard per team member; sledge board sent to team members (each member receives a sledge in task); team-building strategies updated weekly; past competition history live and accurate; competitions and leaderboard editable and exportable.

## 23. Feedback & Surveys
129. Register Insights under the Feedback & Surveys header.
130. Feedback entered into the register; register live and accurate; management advised as feedback is received.
131. Manager review of all feedback/complaints with date, time and receiving person recorded in the register.
132. Feedback/complaints sent to office staff, reviewed and acknowledged; office staff can create tasks from feedback/complaints, allocated to team members, sent to the task board and to each team member.

## 24. Program Design Centre & Events
133. Register Insights below the Program Design Centre header.
134. Weekly reminders for all attendees of programs and events.
135. Link to an AI program that creates program designs to download and save.
136. All programs and events saved to the calendar correctly.

## 25. Community Council & Referral Support
137. Register Insights under the Community Council header.
138. Cancelled events update in Community Council; local support services update by postcode as entered.
139. Register Insights below the Referral & Support header.
140. All local services shown in Referral & Support as the postcode is entered.
141. Resource library contacts correct, accurate and updated weekly.
142. Referrals can be saved, are documented/recorded in the document vault, sendable via email, and recorded in the referral log.

## 26. Incidents & Investigations
143. All new investigations upload to the investigation register; all new incidents upload to the incident register; admin staff notified whenever an incident or investigation is recorded.
144. Contact management section in Incident Clinic editable so businesses can set their own contact management procedure.
145. Health and medication incident response editable to each business's own procedure.
146. Incident policy and procedure editable so managers can set their own.
147. Safety operations dashboard live and accurate.
148. Incident log and incident status live and accurate.
149. Registers and form downloads in Incident Clinic can be uploaded by the business.
150. Incident register live and accurate, updating as incidents are entered and statuses change; each incident logged is sent as a daily admin alert until finalised.
151. Investigation register live and accurate; every investigation entered notifies admin staff daily until finalised.
152. Incident analytics: more charts showing incident count, category, type, status, person reporting and other appropriate information.

## 27. Volunteers & Student Placement
153. Register Insights under the Volunteering & Student Placement header; polish the module so it looks less squashed and more professional.
154. Volunteer intake updated to include all intake forms, intake requirements and all other information needed for the intake of a normal employee.

## 28. Document Vault, Users & Security
155. All uploaded documents sent to the document vault in the appropriate subject/topic; documents in the vault recorded on registers; acknowledgement log with staff name and date per document, exportable.
156. Fix the document vault.
157. Move Users & Permissions out of the document vault into its own Users & Permissions hub; permissions accurate to expected role access.
158. Security and trust posture editable (add to each category), live, accurate and exportable.
159. Staff badge creator saves and stores a copy of each staff badge in Company Safe for each employee.

## 29. Company Safe
160. All business information and details can be entered into Important Business Information.
161. Invoice terms and conditions shown in an invoice template in Company Safe.
162. Business goals, mission, vision and values editable in Company Safe.
163. Saved safe documents stored in the correct category.

## 30. Analytics, Quality, Suggestions, Assistants & Help
164. Business analytics live and accurate, with exportable reports for all sections of the business and all sections a business needs to analyse.
165. Quality & Improvement complete and live: all registers, follow-up actions, manager review log with name and date, follow-up tasks become to-do tasks, reminders sendable, actions recorded in appropriate sections.
166. Suggestions Hub live and accurate.
167. All AI assistants live and accurate.
168. Help Centre live, accurate and helpful.
169. All user guides accurate to their matching module.

## 31. Sherelle — Manager Playbook Module (added 8 November 2026)
Source: the Manager's Playbook (59 NDIS, aged care, Fair Work and WHS tasks, each with ordered steps, a "done when" test and the rules) and the playbook gap review of this app on 8 November 2026. Goal: Sherelle, as manager, can complete every task end to end in the app, as automatically as possible. Review status per task: Covered = built, verify live; Partial = record exists but no automatic deadline, alert or next step; Missing = not built. Priority tags: [Critical] [High] [Medium] [Low]. An item is done only when the full flow runs live, alerts are delivered to the right role, and completion is recorded as evidence. A reminder is not completion evidence. Rules are a plain-English guide, not legal advice: the provider's compliance lead confirms them before release.

### 31A. Manager foundations
170. [Critical] Route alerts to roles, not one personal inbox. High Severity Incident Alert, todoSignoffAlert, appraisalReminders, contractVolunteerExpiryReminders and techSupportRequest send only to a hard-coded address. Send to the manager on duty (Sherelle), the Compliance Manager and Provider Administrator, with the owner as backup.
171. [High] Manager's Playbook page: all 59 tasks, searchable and grouped by area, each showing when it happens, the ordered steps, "done when" and the rules, and linking to the module or form that completes it.
172. [High] Start any playbook task as a task pack: one to-do task per step, with an owner, due dates taken from the rule (24 hours, 5 business days, 21 days, 30 days) and manager sign-off. Completed steps are recorded as evidence.
173. [Medium] Annual rules review of the playbook by the compliance lead (NDIS, Aged Care Act 2024, Fair Work, WHS), with a dated sign-off and a reminder 12 months later.
174. [Low] Link Sherelle's private 15-minute daily coaching app (In Your Corner). No coaching data comes into ComplianceHR.

### 31B. Every shift
175. Covered: start-of-shift handover. Verify the Daily Brief shows open incidents, new risks and plan changes per site.
176. Partial: sick call or roster gap. rosterSuggest must also check award rules (item 205) and escalate to on-call when a high-needs shift is still uncovered.
177. Covered: shift and progress note review (days 1–5 reminders, day 6 to management). Verify the sweep is enabled and emails are delivered.
178. [Critical] Partial: medication check. A medication record of Refused, Withheld, Omitted or Error automatically creates an Incident (category Medication Error) and alerts the manager.
179. [Medium] Partial: end-of-shift sign-off checklist (notes done, incidents lodged, handover, client money reconciled, keys and vehicle returned, timesheet matches).

### 31C. Participants and clients
180. Covered: new NDIS participant intake. Verify the flow ends with a signed service agreement, consents, risk assessment, support plan, matched workers and a first-month review task.
181. [High] Missing: new aged care client intake. Add the Statement of Rights explained, registered supporters, service or care agreement, Support at Home level, advance care planning offered, consents and an early review task.
182. Covered: support or care plan review (3-monthly). Verify the review is recorded as completed, not just requested.
183. [Medium] Partial: change of circumstances. Add a record (what changed, evidence, reassessment requested, date) and a follow-up task.
184. [High] Partial: funding and budget tracking. Alert at 75% and 90% of budget spent and at 90, 60 and 30 days before the plan end date.
185. [Medium] Missing: dignity of risk record (choice, risks explained, safety supports, supporters involved, review date).
186. [High] Partial: behaviour support plan in practice. Alert before restrictive practice authorisations expire, build a monthly restrictive practice report pack, and require every rostered worker to acknowledge the BSP.
187. [Medium] Partial: mealtime and swallowing risk. A swallowing concern or plan not followed creates an incident and a mealtime plan review task.
188. Covered: exit or transfer (Exit Checklist). Verify the final invoice, return of belongings and money, and the request for feedback.

### 31D. Incidents and safeguarding
189. [Critical] Partial: NDIS reportable incidents and aged care SIRS. Run incidentTriage automatically on save (it is button-only and suggestion-only today). Save provider awareness time and the 24-hour, 5-business-day, final report and SIRS P1/P2 due dates. Send countdown alerts and escalate if a deadline is missed. The manager confirms the decision; the AI only suggests.
190. [Critical] Partial: the urgent incident alert triggers on severity only. Also trigger on any reportable type, SIRS priority, requires police or WHS notification, so a reportable incident logged as Medium still alerts.
191. [High] Partial: restrictive practice used. A practice recorded without a current authorisation automatically creates an unauthorised restrictive practice incident (5 business days if no harm, 24 hours if harm).
192. [Medium] Partial: allegation against a worker. Add a flow: remove from the client (no finding), report, police hold, procedural fairness steps, outcome and screening unit notice if required.
193. [Medium] Partial: child safety concern. Add a report record (state agency, reference, date and time, reporter) linked to the incident.
194. [Medium] Partial: death of a client and missing person. Add checklist templates with timed steps and the automatic NDIS and SIRS deadlines.
195. [High] Partial: data breach. Add a 30-day notifiability assessment deadline with alerts, plus OAIC and individual notification steps.
196. Covered: emergency or disaster. Verify continuity of supports for at-risk people and a plan review after each event.

### 31E. Complaints and quality
197. [High] Partial: complaints. Record the acknowledged date and time against an acknowledgement deadline, the outcome the person wants, open disclosure, and that they were told they can contact the NDIS Commission (1800 035 544) or the Aged Care Commission (1800 951 822). Alert before the deadline, not only at 2–3 months.
198. Covered: continuous improvement register. Verify each item closes with evidence it worked.
199. Covered: internal file audit (3-monthly). Verify it raises gaps as tasks.
200. Covered: external audit (NDIS registration audit records, auditors portal). Verify the non-conformity close-out deadlines.
201. Covered: policy update and sign-off, and risk register review.

### 31F. Your team (Fair Work)
202. [Medium] Partial: recruitment. Record the award and classification and that the Fair Work Information Statement (and Casual Employment Information Statement) was given.
203. Covered: pre-employment checks (screening, WWCC, right to work, orientation module, expiry alerts).
204. Covered: induction (Onboarding Task Pack).
205. [High] Partial: building a roster. Add award rules to the roster validation rules: break between shifts, minimum engagement, maximum and overtime hours, fatigue, broken shifts, sleepovers, part-time agreed hours and roster notice.
206. [High] Partial: timesheets and pay. Certify SCHADS and Aged Care Award calculations, check payslips are issued within 1 working day, track super paid within 7 days of payday (Payday Super from 1 July 2026), and keep an underpayment correction log.
207. Covered: leave requests, including family and domestic violence leave. Verify FDV leave never appears on a payslip.
208. [High] Missing: flexible work request. Add a record with a 21-day written-response clock and reasonable business grounds.
209. [High] Missing: casual to permanent (employee choice). Add a record with a 21-day written-response clock.
210. Covered: training and certificate tracking.
211. [Medium] Partial: monthly supervision 1:1s. Add a reminder and agreed notes per staff member.
212. Covered: performance appraisal reminders.
213. [Medium] Partial: underperformance. Add an improvement plan record (expectations, support, review dates, outcome).
214. Covered: misconduct and discipline (Investigations). Verify the support person offer and written outcome.
215. [Low] Partial: staff grievance record and outcome.
216. [Medium] Partial: bullying and sexual harassment. Add a positive-duty prevention register and reports.
217. [Medium] Partial: workplace injury. Add the WHS notifiable incident deadline, insurer notification date and a return-to-work plan record.
218. [Medium] Partial: resignation or termination (Offboarding Task Pack). Add the final pay deadline and the separation certificate within 14 days of request.
219. [Low] Missing: right to disconnect. Add an on-call agreement and after-hours contact settings.

### 31G. Safety (WHS)
220. Covered: hazard report (Take Five, risk portal).
221. Covered: home visit risk assessment (monthly).
222. Covered: vehicle safety (every shift).
223. [Medium] Partial: infection outbreak. Add an outbreak record with the public health notification and an aged care IPC lead step.
224. Covered: emergency drills (6-monthly).
225. [Low] Partial: psychosocial safety assessment and controls.

### 31H. Money and records
226. Covered: NDIS claiming (Invoicing Centre). Verify claims match delivered shifts (item 36).
227. [Medium] Partial: annual price update. Use NDISPriceGuideRelease records instead of the fixed list in src/lib/ndisPriceGuide.js, and create a 1 July update task.
228. [Medium] Partial: client money handling. Add a ledger reconciled every shift.
229. [Medium] Missing: aged care fees and monthly Support at Home statements.
230. Covered: records and privacy. Verify the 7-year NDIS retention period and secure disposal.

### 31I. Also missing (found in the 8 November 2026 review)
231. [High] Missing: live proof that every scheduled and entity automation (62 workflows) is switched on and delivering. Record the last run, the result and a test email received for each.
232. [High] Missing: complaint auto-routing. Add an Auto Route: Complaints workflow (register entry plus manager copy the moment a complaint is saved), matching incidents, risks and feedback. Today complaints are only picked up by the 2–3 month aging scan.
233. [High] Missing: safeguard record automation. Add a workflow on ParticipantSafeguardRecord so medication, mealtime and restrictive practice records trigger items 178, 187 and 191.
234. [Medium] Missing: incident categories. Add Death, Missing person, Injury, Restrictive practice and Child safety to the incident category list so reports and analytics match the reportable types.

### 31J. Design notes for the Critical items (draft, still designing; nothing built)
These notes reuse what already exists: `base44/shared/routedManagementAlerts.ts` (in-app notifications by role), `base44/shared/gmailSend.ts` (email), `autoRouteEntry`, `incidentTriage`, the Notification, AuditLog and TodoTask entities, and `base44/shared/reminders.ts` (Sydney time).

**Item 170: alerts go to roles, not one inbox**
- One shared recipient list: extend `routedManagementAlerts.ts` so it returns in-app recipients and email addresses by role for each alert type, and add a Manager on duty slot (Sherelle by default) from BusinessDetails.
- Backup: a BusinessDetails setting `alert_backup_email` (the owner) is copied on Critical alerts only, so the owner isn't flooded.
- Replace the 5 hard-coded addresses (High Severity Incident Alert, todoSignoffAlert, appraisalReminders, contractVolunteerExpiryReminders, techSupportRequest) with calls to the shared list.
- Every send writes an AuditLog entry (who, what, when, record link) as evidence of delivery.
- If no active person holds the role, send to the backup and raise a compliance issue: "no one holds role X".
- Acceptance: a test record reaches each role holder in-app and by email, appears in the audit log, and the hard-coded address is gone.

**Item 178: medication problems become incidents**
- Trigger: a workflow on ParticipantSafeguardRecord create or update where the record type is Medication Administration and the outcome is Error, Omitted, Refused or Withheld.
- Error or Omitted: a new function creates an Incident (category Medication Error; severity High for Error, Medium for Omitted), links `incident_id` back, and copies the participant, staff, date and medication. Duplicates are prevented on the source record id. `autoRouteEntry` then sends the manager copy.
- Refused or Withheld: the medication plan may expect this, so create a manager follow-up task instead. Create an incident if it happens 2 or more times in 7 days for the same person, or if the plan says to escalate.
- Acceptance: each outcome produces the right record exactly once, linked both ways.

**Item 189: reportable incident deadlines run themselves**
- Awareness time: when an incident is saved, if `provider_awareness_at` is empty, set it to the time it was saved. Managers can correct it, and every change is logged.
- AI suggestion: run `incidentTriage` on the server automatically and store its suggestion and reasons in new fields `triage_suggestion` and `triage_status` (Suggested, Confirmed, Overridden). The AI never decides; a manager confirms or overrides with a reason.
- Holding deadline: if the AI suggests reportable or unsure, set a 24-hour notification deadline straight away and alert, so time isn't lost while waiting for a decision.
- Final deadlines: work them out with fixed rules (not AI) from the confirmed type. 24 hours from awareness; 5 business days for an unauthorised restrictive practice with no harm; the 5-day report; the final report when the Commission asks; SIRS Priority 1 at 24 hours and Priority 2 at 30 days.
- Deadline sweep: a scheduled check every 15 minutes, Sydney time, alerts at 12 hours, 4 hours and 1 hour left. At a missed deadline it escalates to the Provider Administrator plus backup and requires `late_notification_reason`. Daily checks cover the 5-day and final reports.
- Done when the matching submitted field is filled in (`initial_notified_at`, `five_day_follow_up_submitted`, `final_report_submitted`, `sirs_notified_at`) and the Commission reference is recorded.
- Acceptance: test incidents for each type produce the correct deadlines and alerts. Confirmation and override are logged.

**Item 190: urgent alert triggers on reportability, not severity only**
- Widen the High Severity Incident Alert condition: severity High or Critical, OR `requires_ndis_report`, OR `sirs_reportable`, OR a reportable type other than Not assessed or Not reportable, OR `requires_police`, OR `whs_notification_required`.
- Trigger on create and on update when one of these first becomes true, sending once per record.
- Recipients come from item 170.
- Acceptance: a reportable incident logged as Medium alerts once, and a Low non-reportable incident does not.

**Decisions still needed from the owner (before build)**
1. Who is Manager on duty after hours: Sherelle always, or a roster on-call?
2. Should Refused or Withheld medication ever create an incident on the first occurrence?
3. Should the owner backup receive Critical alerts only, or all alerts?
4. What wording should the overdue escalation use, and who signs off a late notification reason?
5. Which build path: a Base44 branch with test records, then release (recommended)?

### 31K. Quotes, invoicing and wages: Xero and ShiftCare parity plus AI assistance (design, added 8 November 2026)
Standard: quotes and invoicing match what Xero and ShiftCare offer, and **wages match client shifts exactly**. One delivered, approved shift is the single source for the wage line, the invoice or claim line and the shift note. Feature lists come from general knowledge of Xero and ShiftCare. Confirm their current features before build.

Already built (keep and verify): the Quote Centre (Draft, Sent, Accepted, Declined, Expired; branded PDF; email; win rate), the Invoicing Centre (invoice builder, preview, PDF, print, email, CSV export, PRODA claim export, aged receivables, bank reconciliation with bank rules, finance summary), ProviderInvoice (built from shifts, support item codes, kilometres, GST, price guide release, AI validation), Shift (clock in and out with location, unpaid break, approval, invoiced flag and invoice link), Payslip (totals only), PayRun, StaffPayrollDetail, PayrollChangeLog, payslip email, and AI line items (aiLineItems) for quotes and invoices.

Found in review:
- Two invoice registers (Invoice and ProviderInvoice). Pick one as the source.
- Invoice status is only Draft, Sent, Paid or Overdue.
- Invoices can be hard-deleted.
- The PRODA export in BestInClassBenchmarkSuite builds a sample claim row (CHR-PRODA-001).
- A quote is accepted only by signing and returning the PDF.
- A quote can't be turned into an invoice.
- Payslips can't be traced back to the shifts behind them.

**Wages match client shifts exactly**
235. [Critical] Shift is the single source. Each payslip and pay run gets wage lines, one per shift (shift_id, participant, date, actual start and end from clock events, unpaid break, overnight split, pay item, rate, allowances, kilometres, total). Payslip totals are the sum of these lines and can't be typed in.
236. [Critical] Three-way match before release. For every shift in the period: delivered and approved shift, wage line and invoice or claim line must agree on shift_id, date, start, end, break, hours and kilometres. A mismatch, missing line or unapproved shift blocks the pay run and invoice batch and shows an exceptions list. A manager can override with a reason, which is logged.
237. [High] Rounding and time rules are set once and shared by wages and billing: minimum engagement, overnight and timezone, public holidays, cancellations. Staff allowances and participant billable items stay separate rule sets, each with its own effective dates and approver.
238. [High] Corrections flow both ways. Editing an approved shift after pay or billing creates a correction (back-pay or deduction line, credit note or adjustment claim) linked to the original. Paid records are never edited in place.
239. [High] Cancellations. A short-notice client cancellation is billed per NDIS rules and the service agreement, and the worker is paid per the award. Both come from the one cancelled-shift record.
240. [Medium] Reports: wages vs billing per shift, participant and worker; margin per shift; unbilled delivered shifts; unpaid delivered shifts.

**Quotes (Xero-style)**
241. [High] Online quote acceptance. The client opens a secure link, reviews, accepts or declines with a typed name, date and time, and adds a comment. The status updates automatically and the manager is told.
242. [High] Turn an accepted quote into a service agreement draft and, later, an invoice, copying the lines. Keep the quote history and versions (revise and resend).
243. [Medium] Quote templates, saved line items, discounts, terms, expiry reminders, follow-up email before expiry, and a quote-to-shifts budget check against the participant's plan.

**Invoices (Xero-style)**
244. [High] Full invoice life cycle: Draft, Awaiting approval, Approved, Sent, Partially paid, Paid, Overdue, Voided, Credited. Replace delete with void, with a reason and an audit log entry. Number invoices in sequence with no reuse.
245. [High] Payments: part payments, overpayments, prepayments, payment date and method, allocation to invoices, receipts emailed, and matching to bank statement lines.
246. [High] Credit notes and refunds linked to the original invoice and claim.
247. [Medium] Repeating invoices (weekly or fortnightly from approved shifts), batch create and send, and scheduled automatic overdue reminders (for example 7, 14 and 30 days).
248. [Medium] Customer statements (monthly, activity or outstanding), branded themes, attachments, invoice viewed or sent history, and a pay-online link (Stripe or similar) where self-managed or private clients pay directly.
249. [Medium] Accounting sync: two-way sync with Xero (contacts, invoices, payments, credit notes, pay items), or a verified export, with a sync log. GST coding: NDIS supports are GST-free; other supplies carry GST.

**NDIS and aged care billing (ShiftCare-style)**
250. [Critical] Remove the sample PRODA claim row. Bulk payment request files are built only from real approved, delivered, unclaimed shifts. Each claim line records its claim reference.
251. [High] Billing by funding type: NDIA-managed (bulk payment request upload, then import the payment results to mark each line Paid or Rejected with the reason), plan-managed (invoice to the plan manager with participant details), self-managed (invoice to the participant), and aged care Support at Home (monthly statements and client contributions).
252. [High] Price limits by date: rates come from NDISPriceGuideRelease by service date, with time-of-day, weekday, Saturday, Sunday and public holiday items, and shared or group support ratios. Block any claim above the price limit for its date and region.
253. [High] Plan budget checks at invoice time: the funds remaining for each support category, with warnings before the budget or the plan end date is passed (links to item 184).
254. [Medium] Travel: provider travel (labour) and non-labour travel kilometres claimed by NDIS rules. Worker kilometres are paid by the award from the same trip record.
255. [Medium] Rejected claims queue with reason, fix and resubmit, and an ageing view of unpaid NDIA claims.

**AI assistance (it suggests; a person approves)**
256. [High] AI billing check before send or claim: flags wrong support item for the time or day, rate above limit, duplicate claim, shift without a note, wage or billing mismatch, and plan budget overrun, each with the reason. This builds on ProviderInvoice ai_validation_status.
257. [Medium] AI quote builder: from a plain description ("2 hours weekday personal care 3 times a week for 12 weeks") it drafts lines from the current price guide (extending aiLineItems), the weekly and total cost and the plan budget impact.
258. [Medium] AI payroll check: explains each pay line in plain English (which award rule and why), flags unusual hours, missing breaks and fatigue risks, and drafts the exceptions summary for the manager.
259. [Medium] AI collections assistant: drafts polite overdue reminders and statements in the business's voice, and suggests a follow-up order by age and amount. A person always presses send.
260. [Low] AI finance Q&A in the personal assistant agent: "what's unbilled this week?", "which claims were rejected and why?", "wages vs billing for March". It reads only, and its answers link to the records they came from.

Acceptance for 31K: a test fortnight of shifts produces payslip wage lines, invoices and a claim file that agree line by line. Every mismatch is caught. No sample or invented data appears in any output. Each AI suggestion is logged with the person who approved it.

## Completion log — latest implementation
- Item 39: choosing a participant in the shift form now shows their goals and saves the selected goal on the shift. Regenerated the landing logo with a fully transparent background (no checkerboard pattern) and updated it across the nav, hero and footer.
- Items 26-28: employee profiles now include an "Intake Logs" tab showing the acknowledgements log, referee checks and buddy shifts from the linked intake case, each panel exportable as CSV. Intake save stays open for drafting, while submission and approval are already blocked until every readiness check is complete (items 22, 31, 32 verified).
- Participant progress note history is now visible (read-only) inside the participant's own profile view, and progress notes carry a participant user link so participants can read notes recorded on their own goals. Existing notes were checked; none needed linking.
- Intake verification complete: the participant intake online form now also asks the NDIS reference number, support coordinator and plan manager names, reason for referral, current supports, strengths and goals, mealtime support, and notes; the staff information form now covers employment status, experience, previous employer, medical conditions, office-use notes and buddy shift details.
- The Compliance Hub renewal calendar now plots upcoming task due dates (open and in-progress tasks only) alongside certificates, documents, policy reviews, legal requirements and NDIS deadlines, with its own filter chip.

## Completion log — latest implementation
- Item 18: Support Worker employment contract and position description drafts saved in the HR templates library and available in Contracts & PDs. Both support branded PDF downloads; employee-specific preparation remains connected to the HR register. Templates require completed terms and appropriate HR/legal review before issue.
- Item 19: File completeness now matches profile IDs, employee numbers and unambiguous legacy names; includes registered documents, issued certificates, signed contracts, acknowledged position descriptions and latest saved checklists. Server-calculated summaries are labelled for the current page, pagination is available, and changes refresh the report.
- Item 20: Added 31 editable HR templates, including onboarding, induction, screening, declarations, training, performance reviews, exit, safety checks and role paperwork. Existing templates were preserved. Document copies can be edited before preview/download.
- Insight placement completed for items 84, 93, 129, 133, 137 and 139. The insight-placement portions of items 124, 125 and 153 are completed; their other requirements remain pending.
- Contract signing now persists the recorded signature; position-description acknowledgement dates are retained. HR document headings paginate safely.
- This log does not mark the remaining master-list items complete. Intake validation, intake/profile/document syncing, rostering and the remaining module work still need implementation or substantive verification.

## Finalisation log — 20 October 2026
- Final verification sweep complete across all 169 items. Exportable registers confirmed live for CRM leads and Projects (items 124-125), volunteer intake forms confirmed present (item 154), clock in/out confirmed in the shift register (item 44), and availability management confirmed in rostering (item 38).
- Items 43 + 47: new Car Safety Check Alerts automation emails the assigned support worker a car safety checklist 5 minutes before every scheduled shift (once per shift, deduplicated), directing completion into Safety Checks so the record reaches the staff profile and document hub.
- Item 45: new Shift Note Reminders automation emails each support worker daily at 7pm Sydney time while a completed shift still has no shift note, and stops once the note is recorded.
- Item 134: new Event Attendee Reminders automation emails all attendees and contacts of programs and events starting within the next 7 days, every Monday at 9am Sydney.
- The master to-do list is now finalised. The only item deliberately left out is native mobile push notifications, which requires the app to be published as a native iOS/Android build first.

## Build order suggestion
1 → 2 → 3 → 4–8 (profiles + intake + rostering core) → 9–15 (compliance/risk/safety) → 16–22 (finance/comms/training/meetings) → 23–30 → 31 (Sherelle Manager Playbook: Critical items 170, 178, 189, 190, 235, 236, 250 first, then High, Medium, Low).

## Dashboard final-polish batch — 11 November 2026
Completed in the existing `dashboards-sherelle-jamie` branch:
- [x] Gate Today and Team Leader workspaces with the role matrix; synchronize frontend and backend permissions.
- [x] Separate executive/business, staff, participant and limited-support dashboard views.
- [x] Make staff/participant dashboard tiles use explicit navigation permission keys.
- [x] Make Today workspace panels, sidebar and mobile navigation permission-aware.
- [x] Count and list only Draft invoices as awaiting approval.
- [x] Add server-side summary counts and honest error/retry states for failed dashboard data.
- [x] Scope Team Leader shift notes to today's shift-note records and improve no-shift/late/unfilled wording.
- [x] Add task leaderboard pagination and loading/error states.
- [x] Apply navy-blue glass styling and replace near-black dark-mode surface tokens with the approved navy palette.
- [x] Run full verification: `npm run ci:verify` passed (24 tests, lint, build); `npm run typecheck` passed.

Still required before production approval:
- [ ] Visual acceptance of the branch preview by the owner.
- [ ] Responsive checks at 360, 390, 768, 1024, 1366 and 1440px.
- [ ] Keyboard, focus, contrast, zoom and screen-reader checks.
- [ ] Runtime role tests with representative approved accounts and live entity RLS.
- [ ] Verify real dashboard counts, exact deep links, exports and operational actions in the preview.
- [ ] Merge the dashboard branch to main and publish only after owner approval.
- [ ] Owner decision: confirm which approved role should access Invoicing (including Sherelle's Administration/Finance responsibilities). Align navigation permissions with entity RLS and add approved/denied runtime tests before exposing invoice actions. No access expansion was made in the dashboard polish batch.

## Enterprise modular expansion alignment — 15 November 2026

- Owner's ten-phase master plan is now the current delivery sequence. V3 prior scope and existing gap findings are preserved.
- Added `src/lib/enterprisePhases.js`: 10 phases, 28 system/layer scopes, 15 shared engines, 18 required role workspaces, register/feature requirements, dependencies, release gates, evidence chain and digital-twin scope. All are target requirements, not completion claims.
- Added an interactive phase selector to Enterprise OS → Roadmap with per-phase requirements and existing source reuse candidates. Existing inventory now says source present instead of working.
- Updated the existing review ZIP's implementation-roadmap report and saved `ENTERPRISE_MODULAR_EXPANSION_PLAN.md` from the same model. Security/privacy/tenant isolation and AI oversight apply from foundation; specialist expansion remains in phases 8 and 10.
- Before checkpoint: `6af9212339d7d28f841863e1`, commit `9ebac14ce6a8e0a2794c27af805666011454c324`.
- Verification: `npm run ci:verify` exit 0 (lint, Node tests, 117 Deno tests, Vite build); `npm run typecheck` exit 0; model integrity checks exit 0 (dependency order, existing OS source IDs and generated-plan/export parity). `git diff --check` exit 0.
- Preview returned successfully. Authenticated browser interaction, responsive/accessibility acceptance and live tenant A/B acceptance were not performed in this batch. No new entity models, role grants, operational workflows or production publication. Full implementation of the ten phases remains open, beginning with Phase 1's evidence/obligation/control and policy-lifecycle acceptance.

## V15 and V16 master build instructions — 15 November 2026

- Submitted the owner's full V15 prompt once, followed by the full V16 append instruction and fourteen-phase sequence to the existing app's main builder.
- Builder commits: 8f691647610a32012d1c7d14d2c427f0c162cd54 (Evidence OS and assurance chain); 96106eb8a6cb1e8c3522713b9f3153cdfe077f41 (assurance gap detection). These implement an initial subset, not the entire master specification.
- Before checkpoints: 6af955a80d78b01f5e307e61 (pre-V15), 6af95696dfd37afb7e04713f (pre-V16).
- Verification found frontend/backend role matrix drift and four unclassified new entities. Repaired the backend evidence navigation permission to match frontend and classified AssuranceEvidence, AssuranceFinding, ComplianceControl and RegulatoryStandard as business-owned in both canonical classification files. Existing schema tenant locks were retained.
- Final checks: build, lint and typecheck exit 0; Node tests 94 passed, zero failed; Deno tests 123 passed, zero failed.
- Outstanding: authenticated UI/UAT, live tenant A/B checks, new assurance-specific behavioral coverage, complete V15/V16 architecture and release gates, persistence of the full consolidated specification and alignment of the existing roadmap model with the new fourteen-phase sequence. PostgreSQL/Prisma, GraphQL, warehouse, Power BI and autonomous background execution are not verified as implemented. Builder readiness is not production readiness. No production publication performed.


## Unified intelligence blueprint / knowledge graph batch — 15 November 2026

- Submitted the consolidated enterprise specification to the existing main app builder. Before checkpoint: 6af95c7b4b81cbf166926873 (3ec2804ee7c887981fccb4997fd8a4f45424c869). Builder commit: 1bbede71, Knowledge Graph OS at /knowledge-graph, with 23 relationship types, 11 mapped record types, links register and 14-stage reference coverage. This is a subset of the blueprint.
- Review repairs: mirrored frontend/backend navigation policy; classified AiAgent, AiInteraction, AiPrompt, AiRecommendation and KnowledgeLink as business-owned; wrapped aiCopilot with perBusiness and createScopedClientFromRequest, required approved access, and passed explicit business context from its dialog. The graph now awaits identity, explicitly filters business, fails visibly on unavailable registers, accepts array/page SDK shapes, discloses the 500-row limit and avoids arbitrary cross-framework standard matches. Coverage copy distinguishes declarations and record references from verified compliance.
- Verification: build exit 0, typecheck exit 0, lint exit 0, five behavioral graph tests passed. Preview URL returned successfully. No authenticated UI, live tenant A/B acceptance or external AI execution was performed.
- Full CI did NOT pass: the latest completed run had 97/99 Node tests passing, with tenant classification and canonical tenant-lock failures. Other external edits appeared during verification: AiModel, AiGovernanceRecord and AiReviewDecision schemas were added and AiAgent/AiInteraction/AiRecommendation schemas changed. Further source editing paused to avoid competing writers. Reconcile those records with the canonical classification/tenant-RLS generator and rerun full CI (including Deno) once a single editing session owns the app. Do not treat build success as release acceptance.
- Remaining master scope includes the complete graph node catalogue/canvas, verified continuous traceability and relationship-specific traversal, autonomous agents, specialist clinical/allied health capabilities, Board/CEO copilots, five-level approvals, full AI lifecycle/observability and authenticated acceptance. No production publication performed by this session.


## AI Intelligence OS governed workspace batch — 15 November 2026

User authorised building the consolidated AI Intelligence OS directly in the existing app. Original checkpoint: 6af95b0f4fe60b923a19dbf7 (662c6cd17044cd62862b9d01651595b71979677d).

Implemented in this batch:
- /ai-os governed workspace: Command Centre, 14 assurance-metadata copilot review profiles, agent/prompt/model draft forms, recommendations, governance drafts, 100 proposed control templates, 30 proposed risk templates, graph navigation, human review ledger, usage analytics, workflow descriptions, nine-phase / 30-month AI roadmap and settings proposals.
- Scoped aiWorkspace server operations; direct browser writes denied on AI entities; review reason required, valid review transitions enforced, implementation evidence required. Acceptance reviews an advisory recommendation, never approves its underlying domain record. Agent/model/prompt metadata remains Draft; no activation or external connection is implied.
- aiCopilot uses perBusiness and assigned-business checks, explicit tenant reads in user context, bounded/minimised register metadata, source-ID checks, SHA-256 metadata snapshots and prompt-version audit records. Persisted Started/Analysed/Completed/Failed states prevent silently claiming that failed writes succeeded. Partial persistence is disclosed. Numeric confidence is uncalibrated and unavailable; model self-ratings are not accuracy.
- AI entities classified and canonical tenant-lock generator applied while preserving stricter server-only writes. Frontend/backend roles mirrored. Added graph approved-access gate, tenant-row rejection, identity remount and missing requested relationship labels. Existing Knowledge Graph OS changes from the separate editing session preserved.
- Tests added for malformed source responses, unsupported citations, model confidence removal, review transitions, implementation evidence and snapshot hashes; graph tests extended for unapproved users and foreign/untagged rows.

Verification history and CURRENT LIMITS:
- Before later graph/schema edits: ci:verify exit 0 (lint, 99 JavaScript tests, 128 Deno tests, production build); configured typecheck exit 0; diff check exit 0. checkJs remains false and Deno tests use no-check: this is not complete static assurance.
- Most recent CI after later edits: 100/101 JavaScript tests passed; classification failed because independently added AlliedHealthReferral, ApprovalChain, BoardResolution and CarePlan schemas were not classified. CI stopped before Deno/build. Another app build remained processing; direct source editing paused to avoid competing writers. Earlier passing checks are not final acceptance of the latest tree.
- Browser preview stayed on Loading app data. Authenticated UI, phone/tablet, accessibility, real LLM invocation, tenant A/B isolation, current membership revocation and end-to-end saves remain UNVERIFIED. No production publication performed.
- Review writes are not a transactional compare-and-swap across the ledger and recommendation update; concurrency/idempotency and privileged immutable-log storage remain release work. Model provider version is not exposed by the managed integration. The catalogue does not prove controls are effective or risks treated.
- Full requested master package remains OPEN: complete specialised domain inputs/permissions, all 27 graph nodes with version-pinned validated relationships, operational regulatory/credential feeds, scheduled monitoring, calibrated predictions, complete schema/API artefacts, live decision-authority checks, full domain dashboards and release acceptance. Dashboard categories without connected measures show Not measured. Model/prompt draft registries do not connect to runtime selection.

Saved checkpoint: 6af961aabd425e18308e4e08, commit 261774db7c10e6b2139b5f2dcec3f1a9d6dfa9a1, AI OS — governed workspace, 100 controls, 30 risks; live acceptance pending. Final tracker checkpoint requested after this append. Reconcile the shared tree and rerun all checks when one editing session owns the app.


### AI OS final reconciliation — supersedes the earlier transient CI failure above

Base44 returned ready. Reconciled AlliedHealthReferral, ApprovalChain, BoardResolution and CarePlan as business-owned in both canonical classification files and applied the existing tenant-RLS generator to those four schemas, preserving their fields and stricter rules. Restored Knowledge Graph navigation entitlement while preserving newly added Clinical OS, Board/CEO and Approval Engine entries, then mirrored the canonical backend role matrix. Updated the planned-navigation test to use an explicitly planned fixture, since the real previously planned group now contains source modules.

Final verified source checks: ci:verify exit 0 (lint; 101 JavaScript tests passed, 0 failed; 128 Deno tests passed, 0 failed; production Vite build). Configured typecheck exit 0. git diff against 662c6cd17044cd62862b9d01651595b71979677d --check exit 0. Base44 status ready. No production publication. The live UI/provider, tenant A/B, concurrency, source authority and full master-scope limits recorded above remain open. These passing checks do not establish production/regulatory readiness. Final named checkpoint requested: AI OS — verified governed workspace, controls and risk catalogues.


## Completion continuation and reconciled verification — 15 November 2026

- Continued the owner's Make complete request in the same Base44 app. Before checkpoint 6af960678ede853445a2e4ab (b175b56d4a9514ac8975f2c60e41a48d67886bb7).
- Builder added Clinical & Allied Health OS (/clinical-os), Board & CEO workspace (/board-ceo), approval chains (/approval-engine), graph canvas and agent runtime/scheduled workflow. These are implemented surfaces, not proof that the whole 30-month blueprint is complete. Builder reported live probes, but this session did not independently verify their runtime results.
- Reconciled four new business-owned entities and frontend/backend role matrices; removed duplicate classification entries caused by overlapping editing sessions. Updated the planned-navigation fixture to exercise a planned group independently of the new real clinical route. Canonical tenant RLS dry run reports zero pending changes.
- Clinical reads now require business context, accept array/page results, report malformed/unavailable data and hide stale metrics on errors. Added Exercise Physiology to the discipline list and Brisbane-local review-date arithmetic. Agent runtime now requires AI module permission, validates source IDs via the shared AI safety helper, records snapshot hash/prompt version and cannot auto-create/activate an agent as a side effect of running. Approval decisions reject unknown decision values rather than defaulting them to approve.
- Latest full CI: exit 0, lint plus 101 JavaScript tests, 128 Deno tests, production build. Configured typecheck exit 0. New approval-rule behavioral tests additionally verify five-level critical requests, risk/amount escalation and denied stage access; results recorded in final checkpoint check.
- Browser acceptance blocker: this session observed the sandbox as blank and the Base44 editor preview remaining on Loading app data, with no actionable app UI. No authenticated saves, multi-role approval acceptance, responsive checks or tenant A/B runtime acceptance can be certified from that state. Production publication was not performed.
- Remaining full specification work must stay open: complete graph node catalogue and version-pinned validated lineage; clinical supervision/credentials, discipline clinical notes and standardised outcome measures; board resolution action completion links; full canonical role/delegation/data/field scope enforcement; prompt-version lifecycle/runtime model selection; calibrated AI quality metrics; all ten operational monitoring agents and authoritative feed connections; transaction/idempotency controls and authenticated release acceptance. Generic assurance copilots and a bounded scheduled advisory scanner do not establish specialised predictions or regulatory monitoring. An approval-chain status does not approve or publish the referenced domain record.


## Single audit, compliance and assurance master prompt — 15 November 2026

- Current controlling specification: `COMPLIANCEHR_INFINITY_MASTER_PROMPT.md`, linked from AGENTS.md. The full owner prompt is preserved with implementation interpretation; earlier plans remain historical scope and existing capabilities are retained. Before checkpoint 6af963abd80d7ac19a6f8299 (2f0dc1c4cd0d2ae2c16b1421523b553a2f15df31). Submitted once to the existing Base44 main builder; builder checkpoint 6af964acc0c6c207625aff7d, commit 745675ae2db930e09b0c3fd46a6a1b10d47c6f98.
- Added `/assurance-matrix` under Compliance OS, reusing the evidence route entitlement. Searchable draft catalogues have 150 indicators, 50 controls, 350 evidence requirements, 356 audit checkpoints and nine requested domain ranges. Draft relationship drawer, filters, pagination, keyboard-accessible code buttons, rating definitions and CSV export are present in source.
- Review found broad-standard matching would incorrectly assure many checkpoints from unrelated evidence and repeat finding/action counts. Removed that inference. No live tenant records are loaded by this draft explorer; all assessments/scores are unavailable. Standard mappings, generated criticalities/review cycles and catalogue relationships require expert review. No generated risk IDs/scores, signatures or board assurance are presented as facts. Requirements and synthetic codes are internal draft proposals, not official regulatory content. CSV includes all 50 requested columns plus draft/mapping status and uses the shared spreadsheet-injection protection.
- Verification: ci:verify exit 0 (lint, existing 101 Node tests, 131 Deno tests, production build). Configured typecheck exit 0. Four new regression tests pass for catalogue integrity, broad-standard false-assurance prevention, unknown/rating boundaries and CSV safety; final npm test exit 0 (105 passed, 0 failed). Whitespace corrected after diff check; final diff check requested. Existing checkJs/no-check limitations remain.
- Preview endpoint succeeded, but direct browser rendering of /assurance-matrix remained blank after one reload. No authenticated visual, responsive/accessibility, save workflow or tenant A/B acceptance is established. Do not claim this screen is live-verified or production ready. No production publication.
- Final deliverable status: audit matrix and indicator/control/evidence catalogues are DRAFT SOURCE only. Full risk catalogue, all 18 role/permission workspaces, PostgreSQL DDL, Prisma, ERD, OpenAPI/REST/GraphQL contracts, specialist AI/dashboard/mobile/reporting specifications, warehouse, Power BI and production multi-tenant acceptance remain OPEN; existing partial implementations must be reconciled rather than duplicated.
- Next acceptance: validate semantically correct checkpoint mappings and current official framework versions; connect explicit versioned assessments with reviewed applicability, denominator and approval authority; verify real workflows and source links; resolve preview rendering and complete role/tenant/mobile acceptance. The new matrix intentionally grants no compliance score until those prerequisites exist.


## Phase 11 v2 governance and catalogue alignment — 16 November 2026

Owner scope: Ultimate Master Build Prompt v2. Preserve the existing app and canonical engines. Reference package now targets 75 logical entities (59 workflow adapter tables + 16 canonical projections), 510 proposed HTTP operations / 346 paths, 348 request DTOs / 343 response DTOs, 38 node schemas, 22 screens, 15 epics/releases and WF-001–WF-400. These counts describe contracts, not live features.

Implemented in existing code:
- Publication requires an authorised independent publisher, with all recorded draft contributors excluded. Notes cannot override independence. Clone retains known authorship. Review-only unchanged saves do not add authorship.
- Approval checks stable actor IDs across preparation/evidence history; missing provenance fails closed. Unassigned tasks are administrator-only.
- Start and act recompute pinned snapshot integrity. Act rejects invalid decisions and stale expected node IDs.
- Evidence collection emits EvidenceRecorded rather than EvidenceVerified. Legacy events remain readable.
- Publish submits the already saved/validated graph, without silently resaving it.
- Studio notice states file verification, board quorum, MFA and automation limitations.

Validation on current code: lint 0; 113 Node tests passed; 148 Deno tests passed; typecheck 0; build 0; tenant classifier reports 0 entities to lock. Four new governance regression tests cover distinct publishers, contributor history, preparer separation/legacy evidence and unassigned work.

Not verified: raw live API denial with separate users, authenticated device UAT, runtime failure injection, load/DR or production readiness. Historic acceptance entries above are retained as prior evidence and superseded where controls changed.

OPEN: transactional CAS/idempotency/outbox/inbox, scheduler/SLA events, actual evidence file/quarantine/hash/verification, board quorum/voter conflicts, MFA, notification/AI/webhook/sub-workflow adapters, classified/location ABAC integration, canonical task/approval/evidence adapters, representative load/availability/DR and F095 sign-off. Current multi-entity compensation is not atomic; start/act/escalate failure/retry paths require further hardening. No claim of full Phase 11 completion or frontend production publication.

Restore point before this batch: 6afae5e3d4ecea6c95696b00. A named post-check checkpoint is created after this log is saved.


## Ultimate Everything Prompt — specification adoption, 17 November 2026

- Owner's Master Enterprise Specification v1.0 preserved in ULTIMATE_EVERYTHING_SPECIFICATION_V1.md with normalised formatting. All 36 named requirement sections checked present.
- Updated AGENTS.md and the controlling master entry point to make it the latest product authority. Compatible existing plans and prior evidence remain intact.
- Recorded latest navy/blue/purple/pink tokens as superseding the historical pastel-only colour rule; actual styles and icons unchanged in this documentation batch.
- Current inspected package.json uses React 18 / Vite / React Router / Base44. Next.js 15 / React 19 / NestJS / Prisma / PostgreSQL and the specified infrastructure remain target architecture requiring migration work; no runtime migration performed.
- Added dependency-ordered acceptance queue and explicit tenant scope, lifecycle authority, atomic audit/evidence/version persistence, post-commit effects and reviewable AI requirements.
- Before restore point: 6afc34a4b996db58c836d4d4, commit 813bf20fa7d4c4c31c4ae8f93c940ba2481d4a40.
- Verification: all 36 section headings and three controlling references present; change scope and whitespace checked against that baseline. Documentation only; runtime tests not rerun. No feature completion, production publication or regulatory assurance claimed. Existing tenant/API/device/concurrency/DR/F095 gates remain open.
- Final named restore point: Ultimate Everything v1.0 — governing specification installed (created after this entry).


## Ultimate Master Build v2.0 — workspace reliability implementation, 17 November 2026

Owner authorised completion of outstanding tasks and supplied Ultimate Master Build Prompt v2.0. Saved normalised full requirements in ULTIMATE_MASTER_BUILD_SPECIFICATION_V2.md and updated AGENTS.md, master entry point and historical colour pointer. Checked 13 roadmap phases (0–12), all 44 ordered migration names and explicit tenantId contract. These requirements supersede v1.0; no target-stack migration was performed.

Restore baseline: 6afc3c6d61f91e53fea4e583, commit 66a18f9baa79463e3ff848acac3c7fc8d6cc144a.

Implemented in the existing Workspace OS:
- Layout requests and displayed metadata are bound to account, business, role/approval and workspace, with per-context identity so an A→B→A switch cannot admit an old response.
- Pending reads cannot overwrite a newer save. Duplicate mutations in the same mounted context are refused. Layout controls remount on identity/workspace change, clearing unsaved drafts and dialogs. Save/reset unavailable while the saved version is not ready.
- History loads depend on a stable history callback rather than the changing workspace result object. Closed/replaced dialogs discard delayed responses; page changes clear comparison selections.
- Server returns hasMore independently of count, retaining pagination during count-service failure. Added retry history and disabled compare for unreadable snapshots; no false equal-layout claim.
- Restore rejects fractional/coerced/unsafe version numbers, invalid pages, unsupported schemas, missing/mismatched snapshot hashes, invalid stored versions and duplicate live/snapshot identities requiring reconciliation. Valid restore appends a new version. Existing historical rows are retained.
- Layout/history timestamps use Australia/Brisbane. Hash checks detect accidental content mismatch only; FNV is not a signature or independent evidence verification.

Verification:
- Full ci:verify exit 0: lint, 152 JavaScript tests, 182 Deno tests and production Vite build.
- Configured typecheck completed without errors (existing checkJs=false coverage limitation retained).
- After duplicate-history detection, targeted real-handler tests 8/8 passed and complete Deno suite rerun: 183 passed, 0 failed.
- Added 6 rendered React/JSDOM regression tests using the actual hook/history component with controlled SDK responses, plus 8 real backend handler tests with an in-memory SDK substitute. These are simulated API/component evidence, not deployed tenant A/B acceptance.
- Final source diff/whitespace check against baseline performed before checkpoint. Preview connector succeeded; cloud browser reached the Base44 login page, so authenticated UI/device UAT was blocked by missing browser sign-in. No live tenant records were changed by tests. No production publication.

Remaining work is OPEN, not complete:
- All v2 operating systems require complete current-source mapping and per-feature acceptance. Existing catalogue/source mappings do not establish all 22 OS delivered.
- Workspace templates/widgets/panels, shared layouts, full lifecycle approvals/time machine and graph capabilities beyond the existing bounded personal layout implementation remain partial.
- Server transaction/CAS/idempotency/outbox guarantees remain unproven; local save serialisation does not make cross-session writes atomic. Duplicate detection requires reconciliation rather than guessing a winning snapshot.
- Workspace version snapshots do not establish a separate universal audit-event/evidence-link transaction. Full universal audit/evidence/version consistency remains an engineering gate.
- Existing MFA, scheduler/SLA, file quarantine/verification, board quorum/conflicts, external adapters, classified/location ABAC, canonical engine integration, load/DR, authenticated role/tenant/device UAT and F095 gates remain open.
- Next.js/NestJS/PostgreSQL/Keycloak/Azure monorepo target and migrations 001–044 are not deployed. A verified staged migration/cutover/rollback package is still required.

Final named checkpoint: v2 Workspace OS — scoped saves, resilient history and guarded restore.


## Ultimate All-in-One Master — Integrity Index implementation and review, 17 November 2026

Owner's exact master prompt submitted to the existing main Base44 app (6ac9f91f0d82b1f80ec6a25f) and retained in its builder conversation. Added ULTIMATE_ALL_IN_ONE_MASTER_SPECIFICATION.md as the latest normalized product scope and updated AGENTS.md/master entry points. Scope includes 25 operating systems, 18 workspaces, Trust/Assurance, universal entity/evidence/AI/security contracts, target stack, documentation, test and deployment requirements. Prior compatible requirements and release gates remain intact.

Restore baseline: 6afc4a2c2f9416e057b3162b, source 6a405cfde936b9cd750e682fd79b11175f6eb2b2. Builder intermediate checkpoint: 6afc4b01875714a3aec5eab1; source a0b6a59cd540da28968d5a771c3b21a8b1b33676. Review fixes below supersede that intermediate version.

Implemented in Executive Dashboards -> Enterprise Integrity Index:
- Exact owner weights: Governance 15, Compliance 15, Risk 10, Audit 10, Evidence 10, Workforce 10, Clinical Governance 10, Trust 10, Assurance 5, Strategic Outcomes 5.
- Expandable ten-dimension indicator cards with contributing register counts, refresh, loading and unavailable-read states, Brisbane cutoff/freshness, existing responsive glass surfaces and no route replacement.
- Queries carry the signed-in business predicate; cache identity includes account/business/role/access. The read model rejects ineligible identities before querying and applies source module gates in addition to platform RLS.
- Review removed partial-read scoring and weight renormalization. Any missing, denied, malformed, synchronous SDK or asynchronous failed read withholds the affected dimension; the fixed-weight overall composite requires all ten dimensions to be measurable. Empty business has no score.
- Proposed ratios/bands are labelled operational indicators. Counts can overlap; record status does not prove independent evidence verification, clinical quality, strategic performance, trust or compliance. No verified-assurance band remains.
- Corrected documentation that claimed unverified platform equivalents/infrastructure. Current React/Vite/Base44 remains in place; requested Next.js/NestJS/Prisma/PostgreSQL/Redis/BullMQ/OpenSearch/Azure/Keycloak and infrastructure remain target migration scope, not satisfied equivalents.
- No schema, backend mutation, permission grant or tenant record writes in this batch. Backend tests use existing test doubles.

Verification (each exit 0): npm run lint; npm test (174 passed, 0 failed); npm run typecheck; npm run test:deno (190 passed, 0 failed); npm run build. The 12 Integrity Index regression tests cover exact weights, fixed composite arithmetic, empty/partial/failure cases, actual schema fields/enums, approved identity checks, nested tenant identity, scoped reads and role matrix requests. Configured typecheck retains checkJs=false and excludes src/lib, so it is not comprehensive JS type verification. git diff --check passed against baseline. Base44 preview connector succeeded.

OPEN acceptance: authenticated browser/device/touch/accessibility journeys; deployed raw tenant A/B and denied-role aggregate/file/API tests; independently verified evidence and current regulatory mappings; approved scoring methodology/denominators/periods/snapshot provenance/export and monitoring. The ratio model is provisional and not an approved Enterprise Integrity/Trust/Assurance assessment. No complete cross-domain backend/workflow/reporting/AI/deployment implementation is claimed.

All prior transaction/CAS/idempotency/outbox, scheduler/SLA, file quarantine/verification, quorum/conflicts, MFA, classified/location ABAC, adapters, load/DR, tenant/device UAT and F095 gates remain OPEN. Full platform scope and target migration are incomplete. No production publication performed.

Final named restore point created after this log: All-in-One master — guarded Integrity Index and verified checks.
