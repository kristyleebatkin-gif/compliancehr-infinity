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

## Suggested build order

1. Closed-loop corrective actions + immutable audit trails (highest audit value).
2. Tables-first refresh of Money and Compliance registers (Stripe pattern).
3. AI roster suggestions + NDIS budget utilisation bars (Lumary/FlowLogic parity).
4. Continuous compliance score + evidence automation (Vanta/Drata parity).
5. Keyboard command palette + designed empty states platform-wide (Linear pattern).
6. Offline-first mobile capture for field safety workflows (SafetyCulture parity).