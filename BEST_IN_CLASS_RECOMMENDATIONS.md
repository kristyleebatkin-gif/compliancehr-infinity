# Best-In-Class Recommendations — ComplianceHR Infinity

A module-by-module review of the entire app against the world's leading platforms in each
category, with the specific changes needed to reach the same standard.

## Benchmarks researched (2026 leaders)

| Category | World's best platforms | What they are known for |
|---|---|---|
| NDIS / care management | FlowLogic, Lumary, Brevity, ShiftCare, Vertex360 | PRODA/PACE claiming, SCHADS award interpretation, care plans, funding utilisation, live compliance dashboards |
| Compliance / GRC automation | Vanta, Drata, AuditBoard, Hyperproof | Continuous monitoring, automated evidence collection, control mapping, auditor collaboration portals, trust centres |
| Safety & inspections | SafetyCulture (Mitti), Vector Solutions, EASE | One-thumb mobile inspections, photo-annotated issues, closed-loop corrective actions with escalation, immutable audit trails, template library |
| Workforce / rostering | Deputy, Tanda, Employment Hero | AI scheduling, demand forecasting, award interpretation, labour-cost forecasting, mobile clock-in with geofencing |
| Learning (LMS) | Docebo, Absorb, 360Learning, TalentLMS, Litmos | AI authoring and recommendations, skills-gap intelligence, gamification, mobile learning, certification management |
| Product & dashboard design | Linear, Stripe, Vercel, Mercury, Attio | Dark-first power tools, tables-as-truth, one hero chart, progressive disclosure, designed empty states, keyboard-first |

## Cross-cutting standards to adopt (affects every module)

1. **Tables as the primary interface** (Stripe/Linear standard): right-aligned numerals, tabular figures, muted gridlines, inline sparklines on money/audit registers; charts only where a trend genuinely needs a shape.
2. **Progressive disclosure**: summary first, drill-down on demand — never a wall of fields; detail views show exactly one level at a time.
3. **Designed empty states**: every register's empty view teaches — what belongs here, one clear action (Mercury/Supabase pattern).
4. **Keyboard-first actions**: global command palette (already partly built with the command component) extended to every register: `⌘K` search, `N` new, arrow navigation.
5. **Dark-first polish**: promote dark mode to a first-class theme (Linear standard) — current dark tokens are good, but each module should be visually verified in dark.
6. **Immutable audit trails** (SafetyCulture standard): every edit to compliance-grade records (incidents, audits, certificates, consents) logs who/when and cannot be deleted — the StatusLog system should be enforced platform-wide.
7. **Visible security posture** (2026 regulated-industry standard): surface encryption, role-based access and audit-log guarantees inside the app UI (Security page in Company Safe), not just in settings.
8. **Offline-first mobile capture**: forms, Take Fives and safety checks should queue offline and sync — the SafetyCulture "thumb-first" pattern for field staff.
9. **AI as a default layer** (Docebo/Vanta standard): AI summaries on every register (what changed, what needs attention), not only in the Assistant.

## Module-by-module recommendations

### Overview — Dashboard
- **Benchmark:** Linear (restraint), Stripe (KPI hierarchy), Attio (AI-native).
- **Do:** one hero metric per role in the top-left with the largest type; downgrade decorative charts to numeric tables; add a real-time "needs attention" feed limited to actionable items only.

### People — Staff, Participants, Key Contacts, HR
- **Benchmark:** FlowLogic/Lumary participant records; Rippling/ADP HR suites.
- **Do:** funding and plan-utilisation bars on participant profiles (NDIS budget visibility); SCHADS-accurate employment data carried through to rostering; employment timeline view per staff member; delegated-authority expiry alerts on key personnel.

### Care & Support — Intake, Goals, Visual Boards, Rostering, Referral, Programs
- **Benchmark:** Lumary (AI rostering), RotaWiz (SCHADS compliance checking), Deputy (AI scheduling + demand forecasting).
- **Do:** AI-suggested roster from availability, qualifications and continuity of support; live NDIS budget/fund tracking per plan; forecast labour cost before publishing a roster; geofenced mobile clock-in; goal data charted to funding outcomes (NDIS progress reports).

### Compliance & Safety — Compliance Centre, Incidents, Risks, Emergency, Equipment/MSDS, Certificates, NDIS Portal & News, Assets
- **Benchmark:** Vanta/Drata (continuous compliance), SafetyCulture (inspections), EASE (closed-loop actions).
- **Do:** continuous (not scheduled) compliance monitoring with a live score; automated evidence collection from connected registers; auditor collaboration portal (read-only external access); corrective actions that cannot close without evidence + owner + notification escalation; photo-annotated incident capture; control-to-framework mapping for the NDIS Practice Standards so every checklist item maps to its evidence automatically.

### Money — Invoicing, Quotes, Receipts, Procurement
- **Benchmark:** Stripe (financial dashboards), Xero, FlowLogic (PRODA/PACE claiming).
- **Do:** PRODA/PACE-ready claim submission or export; NDIS plan-budget utilisation check before invoicing; inline sparklines on the aged-receivables table; invoice-to-shift drill-down that never loses your place; supplier invoice matching to purchase orders (three-way match).

### Work — Tasks, Meetings, Projects, Training, Communications, Feedback
- **Benchmark:** Linear (issues), Docebo/360Learning (learning), Intercom (support).
- **Do:** keyboard-first task triage; meeting actions auto-created as Linear-style issues with owners; AI course authoring from existing training content; skills-gap analytics (Docebo skills intelligence); gamified streaks for mandatory training completion; complaint SLA timers with escalation.

### Company — Documents, Company Safe, Quality, Analytics, Users
- **Benchmark:** Drata (policy centre), Notion (docs), Stripe (analytics).
- **Do:** document-to-control mapping with automatic expiry-driven reviews; version history with diff on every policy; analytics built on tables-first design with one hero chart; permission matrix with audit-grade change history.

### Help & Tools — Assistant, Help Centre, User Guides
- **Benchmark:** Intercom/Zendesk (AI-first support), Vanta (trust centre).
- **Do:** AI troubleshooter that acts (opens tickets, drafts fixes) not just advises; in-context help on every module (docs appear beside the form, not in a separate library).

## Module data specifications (the data each module needs)

Each module needs three data layers to match the benchmarks: **(A)** its core records
(entities that already exist in the app), **(B)** reference/content data packs, and
**(C)** benchmark rule values. Missing data is filled by loading the packs listed below.

### Overview — Dashboard
- **A:** all entity counts via server-side count/aggregate (never load lists).
- **B:** per-role tile definitions (admin, team leader, support worker, participant).
- **C:** attention thresholds — 7 days before certificate/doc expiry = warning, 0 days = critical; roster coverage < 90% = warning; overdue tasks > 5 = red.

### People — Staff Profiles, Participant Profiles, Key Contacts, HR
- **A:** StaffProfile, ParticipantProfile, EmployeeDocument, EmployeeEmploymentContract, EmployeePerformanceAppraisal, EmployeePositionDescription, LeaveRequest, KeyBusinessContact, StaffMedicalProfile.
- **B:** role framework (the 12 roles in the access config), mandatory-document checklist per role (see rule values below).
- **C (benchmark expiry rules, Australian practice):** NDIS Worker Screening 5 yrs · WWCC 5 yrs · Police Check 3 yrs · First Aid (HLTAID011) 3 yrs · CPR refresher 12 months · working-rights check 3 yrs · contract review 12 months · appraisal 12 months.
- **Data packs:** NDIS support-worker role competency set; HR contract templates per role.

### Care & Support — Intake, Goals, Visual Boards, Rostering, Referrals, Programs
- **A:** Intake, IntakeCase, Goal, ParticipantGoalProgress, GoalProgressNote, Shift, ShiftPatternTemplate, StaffAvailability, RosterTeam, RosterPublicHoliday, BuddyShift, ParticipantShiftDetail, VisualRoutine, VisualBoard, CommunityEvent, CommunityProgram, CommunityReferralService, Referral, SupportLetter, Event, Lead.
- **B:** SCHADS award template (levels 2.1–3.4, casual loadings, penalty rates); NDIS plan funding categories (Core, Capacity Building, Capital) with per-category budgets; shift pattern templates; standard goal domains (daily living, social, health, education, employment).
- **C:** shift must be filled by T-48h → escalation; roster coverage target ≥ 95%; continuity-of-support ≥ 60% same-worker rule; SCHADS penalty multipliers (Sat 1.25, Sun 1.5, PH 2.25, evening 1.25) and casual loading 25% — these live in the payroll module and must stay the single source of truth.

### Compliance & Safety — Compliance Centre, Incident Clinic, Risks, Emergency, Equipment/MSDS, Certificates, NDIS Portal, NDIS News, Assets
- **A:** ComplianceChecklistEntry, Audit, InternalAudit, AuditAction, AuditChecklistFile, AuditReport, NDISComplianceDeadline, NDISRegistrationProfile, NDISRegistrationGroup, NDISAuditRecord, NDISAuditReminderLog, GovernanceControlRecord, Incident, Investigation, Risk, TakeFive, SafetyCheck, SafetyDocument, EmergencyDocument, EmergencyDrill, EmergencyResource, VisitorLog, Chemical, MSDSRecord, EquipmentManual, Asset, AssetMaintenance, AssetDisposal, AssetComplianceReview, Certificate, DataBreach, InsurancePolicy, LegalRequirement, VehicleSafetyCheck.
- **B:** NDIS Practice Standards checklist (Core + Supplementary modules) mapped control-to-evidence; incident taxonomy (NDIS Commission categories + severity ladder); risk matrix 5×5 likelihood × consequence; emergency drill schedule; common-hazard library; SDS reference library per chemical category.
- **C:** NDIS mandatory incident report to Commission within **24 hours** (serious) / **5 business days**; complaint decision within **21 days**; fire evacuation drill every **6 months**; fire extinguisher/service checks **6 months**; vehicle safety checks **6 months**; asset calibration per manufacturer schedule; data-breach OAIC assessment **30 days**; quality-control audit cycle **annually**, internal audit **quarterly**.

### Money — Invoicing, Quotes, Receipts, Procurement
- **A:** Invoice, InvoiceTemplateSettings, ProviderInvoice, Quote, Receipt, ReceiptRecord, PurchaseOrder, Supplier, FinanceRecord, NDISPriceGuideItem, NDISPriceGuideRelease, BusinessDetails (bank fields, terms).
- **B:** current NDIS Price Guide line items (per hour, per km, non-labour-cost travel, ETF items) loaded as records; standard invoice/quote term templates (already defaults in BusinessDetails); supplier category list.
- **C:** payment terms 14 days; quote validity 30 days (both settable); aged-receivable bands 0/7/14/30+ days; GST-free rule for NDIS supports; price-guide sync from the NDIS release feed (existing news-sync automation).

### Work — Tasks, Meetings, Projects, Training, Communications, Feedback
- **A:** Task, TodoTask, Meeting, MeetingRecord, MeetingAttendanceRecord, MeetingActionRecord, BusinessProject, TrainingModule, TrainingTemplate, TrainingCompletion, StaffTrainingAudit, Certificate, LMS quiz packages (training libraries), CommunicationEntry, CommunicationLog, SatisfactionSurvey, Survey, Feedback, Complaint, IssueConcernBarrier, QualityItem, ImprovementAction, ImprovementReview, ImprovementSource, KPI, Announcement, Notification.
- **B:** training curriculum per role (existing modules in the LMS library); competency checklists; complaint-handling SLA ladder; meeting agenda templates; message template library.
- **C:** mandatory-training cycle 12 months (annual refreshers) / 3 years (full certificates); training expiry warning at 60 days; complaint SLA 21 days with escalation at day 14; meeting actions due 14 days from the meeting; task reminders at due date, +3 days, +7 days.

### Company — Documents, Company Safe, Quality, Analytics, Users
- **A:** CompanyDocument, BusinessDocument, HRDocumentTemplate, FormsLibraryDocument, FormTemplate, FormSubmission, AuditLog, activity/page-view records, Notification, ArchivedUser, User entity.
- **B:** policy template library with version history; document control register categories (Policies, Templates, Certificates, Registrations, Licences, Financial); permission matrix per role × module.
- **C:** policy review cycle **12 months**; document version retention — never overwrite, supersede; every status change written to the status/audit log (immutable trail).

### Help & Tools — Assistant, Help Centre, User Guides
- **A:** HelpDeskTicket, support resource library, guide content libraries.
- **B:** module guide content per module; troubleshooting decision tree per module.
- **C:** ticket first-response target 4 business hours; resolution target 2 business days; AI answers must cite the module guide they came from.

## Data packs to load (one-time)

1. **NDIS Price Guide pack** → price-guide items (synced by the existing news-sync automation).
2. **SCHADS award template** → structured data inside the payroll module.
3. **NDIS Practice Standards checklist pack** → compliance checklist templates, mapped to evidence.
4. **Incident taxonomy + risk matrix** → incident/risk template libraries.
5. **Mandatory-document matrix per role** → employee document definitions (rule values above).
6. **Training curriculum + quiz packages** → already present in the LMS libraries; keep versioned.
7. **Sample seed records** for demos: 1 provider profile, 5 staff, 3 participants, 10 shifts, 3 invoices, 2 quotes, 5 training completions, 2 incidents, 1 audit — enough for every dashboard tile to show a real value.

## The every-module standard (design + features + functions)

Every module must pass the same seven tests. These are acceptance criteria, not aspirations —
a module is not finished until all seven are verified.

1. **Design — extremely visually appealing.** The module's fixed accent colour carries the
   header, icon chips, status badges and charts (centralised statusTone colours only — never
   hash-random); one hero metric per screen with the largest type; tables-first registers with
   right-aligned tabular numerals and muted gridlines; staggered, shadow-boxed form questions
   with breather panels between dense groups; designed empty state that teaches and offers one
   clear action; verified in dark mode and stacked correctly at 390 px mobile width.
2. **Features — everything needed to run the module.** Full CRUD on every register, filters
   and search executed on the server, sort and saved views, bulk actions where work repeats,
   attachments/links where evidence belongs, status flows with dated transitions, and an
   export for every list (CSV + branded PDF).
3. **Functions — automation that does the work.** Expiry/due-date scans, reminders and
   escalations run by workflow (never by someone remembering); AI summaries and next-action
   suggestions on every register; auto-routing of submissions into the right module with the
   right owner notified.
4. **Fast, easy and simple to complete every task.** The three-interaction rule: any record
   can be created in three taps or fewer; smart defaults and autofill from existing profiles;
   choices as checkboxes/radios, not free text where a choice exists; single-line ruled fields
   for dates, times, numbers and IDs; one-thumb mobile forms that queue offline and sync;
   ⌘K palette on every register (`N` new, arrow navigation, Enter open).
5. **Review every item — nothing hides.** Every record opens into a review view showing all
   stored fields, its full status history, who changed what and when, attached evidence, and
   an AI one-line "what needs attention"; list views show progress at a glance (status +
   age + owner), with "reviewed/approved" sign-off captured per item.
6. **Achieve all business standards, requirements and compliance.** Every checklist item maps
   to its NDIS Practice Standard control and its evidence automatically; expiry rules from the
   benchmark rule values below are enforced by automation; corrective actions cannot close
   without owner + evidence + notification; all compliance-grade edits write an immutable
   audit-trail entry.
7. **Saving, storing, reporting and display.** Drafts autosave; superseded versions are
   retained, never overwritten; every register exports (CSV via the cursor helper so nothing
   is capped at 1,000, plus branded PDF); every module has one live display surface (dashboard
   tile + module page) driven by server-side count/aggregate only.

### Module-specific application

| Module group | Design | Features | Functions | Completion | Review | Compliance | Save / store / report / display |
|---|---|---|---|---|---|---|---|
| Overview — Dashboard | One hero metric per role, accent-coloured tiles, no decorative charts | Role-tailored tiles, drill-down to source module | Morning brief workflow; live "needs attention" feed | One-tile = one destination | Attention feed is fully actionable, zero stale items | Coverage % across all mandatory registers | Tile numbers from count/aggregate; CSV of attention list |
| People — Staff, Participants, Contacts, HR | Timeline view per person, funding bars on participants | Full profile CRUD, document checklists per role, leave, appraisals, position descriptions | Expiry alerts at benchmark intervals; appraisal & contract reminders | Autofill new documents from the profile; 3-tap intake | Per-person compliance view: every doc, expiry, status, history | Mandatory-document matrix per role enforced | Branded HR PDFs; CSV staff register; profile header display |
| Care & Support — Intake, Goals, Rostering, Boards, Referrals, Programs | Roster board with coverage heat map; goal progress charts | AI-suggested roster, budget-utilisation bars, shift patterns, buddy shifts, visual boards | T-48h unfilled-shift escalation; continuity-of-support checks; goal reminders | Pattern templates fill rosters in one action | Per-shift and per-goal drill-down with notes history | SCHADS rules single-sourced in payroll module | Payroll report, ICS feed, goal progress PDFs; CSV roster export |
| Compliance & Safety — Compliance Centre, Incidents, Risks, Emergency, Equipment/MSDS, Certificates, NDIS Portal, Assets | Live compliance score ring, severity-laddered badges | Continuous monitoring, control-to-evidence mapping, audits, corrective actions, photo-annotated incidents | 24-hour/5-day incident escalation; drill & asset-check schedules; expiry scans | Template library pre-fills any inspection in one tap | Every item reviewable with full trail and evidence attached | NDIS Practice Standards + Commission deadlines enforced | Branded audit packs & reports; CSV register exports; live score display |
| Money — Invoicing, Quotes, Receipts, Procurement | Aged-receivables table with sparklines, one hero cash chart | Invoices, quotes, receipts with scan, POs, suppliers, price-guide sync | Budget-utilisation check before invoicing; overdue payment reminders | Quote-to-invoice conversion in one click | Invoice-to-shift drill-down that never loses your place | GST-free rule, 14-day terms, 30-day quote validity by default | Branded invoice/quote PDFs; CSV export; finance summary display |
| Work — Tasks, Meetings, Projects, Training, Communications, Feedback | Kanban boards, streaks for training, SLA timers on complaints | Tasks with sign-off, meeting actions, projects with milestones, LMS with quizzes, complaints with SLA | Task reminders at due/+3/+7 days; meeting action follow-ups; training expiry alerts | Meeting actions auto-created as tasks with owners | Every task/meeting/training item shows status, history, sign-off | 12-month training cycle; 21-day complaint SLA with escalation | Task certificates, minutes PDFs, training audit reports; CSV exports |
| Company — Documents, Company Safe, Quality, Analytics, Users | Document control register with version chips, tables-first analytics | Version history with supersede, quality register, permission matrix, KPIs | Auto next-review scheduling; expiry-driven review prompts | New document from template with owner + review date in one flow | Version diff and full change history per document | 12-month policy review cycle; immutable status log | Branded document PDFs; CSV export; analytics hero chart |
| Help & Tools — Assistant, Help Centre, User Guides | In-context help beside the form, searchable guides | Tickets, AI troubleshooter, guide libraries, module docs | AI answers cite their source guide; ticket SLA timers | Raise a ticket in three fields | Ticket thread with full response history | First response 4 business hours, resolution 2 business days | Ticket export; system-health display |

### Module acceptance checklist (run before signing off any module)

- [ ] Header, badges and charts use the module's fixed accent colour; dark mode verified
- [ ] Mobile 390 px verified — forms stack, tables scroll, buttons reachable
- [ ] Every register: server-side filter/sort, CSV + branded PDF export, designed empty state
- [ ] Any record creatable in ≤ 3 interactions, with smart defaults and autofill
- [ ] Every record reviewable in full — all fields, history, evidence, sign-off
- [ ] Automated reminders/escalations wired for every date the module tracks
- [ ] Compliance mapping + immutable audit trail present for compliance-grade records
- [ ] Dashboard tile live from count/aggregate; AI summary on the register

## Visual design blueprint — every section amazing, stylish, professional

Brand foundations every module builds on (never reinvented per module):

- **Typography:** Fraunces (editorial serif) for page titles and hero numbers, Manrope for all
  UI/body text; tabular figures everywhere money, dates or counts appear; page titles never
  below 1.75rem with the accent-tinted PageHeader card.
- **Colour discipline:** the module's fixed semantic accent from `moduleColours.js` (safety
  red, finance green, training teal, compliance indigo, people blue, participant pink,
  roster indigo, NDIS purple) drives header tint, icon chips, active states and chart series;
  accent washes at 8–12% opacity for section backgrounds; brand gradient reserved for one
  hero moment per page; dark text on light action buttons — no white-on-saturated.
- **Surfaces:** rounded-2xl cards with `shadow-panel` layering and hairline rings; gradient
  wash behind the hero row only; generous 24/32px section rhythm inside a max-w-6xl column.
- **Micro-polish:** staggered question cards with solid ruled answer lines; statusTone badges
  with dot + label; hover lift on interactive cards; skeleton loaders on every data surface;
  empty states with a tinted icon chip, one teaching line, one action.

### Per-section design specification

| Section | Signature visual | Styling direction | Data display |
|---|---|---|---|
| Overview — Dashboard | One hero metric card per role with oversized Fraunces number on a brand-gradient wash | Role-coloured tiles, restrained chrome, whitespace-first | Numeric tables with sparkline accents; single hero chart |
| People — Staff, Participants, Contacts, HR | Profile header with accent-tinted identity band and compliance ring | Timeline styling on employment history; tinted doc-checklist chips | Funding/plan utilisation bars; expiry countdown pills |
| Care & Support — Intake, Goals, Rostering, Boards, Referrals, Programs | Roster board with coverage heat map and indigo shift cards | Card-based goals with progress rings; calm, playful visual-board surfaces | Coverage %, budget bars, goal-outcome charts |
| Compliance & Safety — Compliance Centre, Incidents, Risks, Emergency, Equipment/MSDS, Certificates, NDIS Portal, Assets | Live compliance score ring in indigo, severity-laddered red/amber badges | Confident, alert-toned styling; heat cells for the 5×5 risk matrix | Score ring, trend table, evidence-linked checklist rows |
| Money — Invoicing, Quotes, Receipts, Procurement | Aged-receivables table with inline sparklines on a green accent header | Stripe-style financial tables; receipt scan cards with clean thumbnails | Sparkline money columns, one hero cash chart |
| Work — Tasks, Meetings, Projects, Training, Communications, Feedback | Kanban columns with teal task cards; streak badges for training | Meeting agenda cards with tinted type chips; SLA timer pills on complaints | Progress bars, streaks, SLA countdowns |
| Company — Documents, Company Safe, Quality, Analytics, Users | Document control register with purple version chips and review-status pills | Vault-style card grid for the safe; tables-first analytics | Version history, KPI tiles, hero analytics chart |
| Help & Tools — Assistant, Help Centre, User Guides | Floating assistant panel with gradient orb avatar | Calm reading layout for guides; tinted category chips | Search-first display, article cards |

**Motion rules:** entrance fade-and-rise 200 ms on page load, staggered 60 ms on card grids;
no animation inside tables or forms beyond focus rings; hover lift only where the card is
clickable; everything must stay smooth at 390 px mobile width.

**Professional finish checklist per section:** the same accent family runs from header →
badges → charts → export PDFs (PDFs use the same module accent and Fraunces/Manrope); icons
from one set (lucide) at one stroke weight; one radius family; one shadow elevation scale;
no more than two font sizes per card.

## Suggested build order

1. Closed-loop corrective actions + immutable audit trails (highest audit value).
2. Tables-first refresh of Money and Compliance registers (Stripe pattern).
3. AI roster suggestions + NDIS budget utilisation bars (Lumary/FlowLogic parity).
4. Continuous compliance score + evidence automation (Vanta/Drata parity).
5. Keyboard command palette + designed empty states platform-wide (Linear pattern).
6. Offline-first mobile capture for field safety workflows (SafetyCulture parity).