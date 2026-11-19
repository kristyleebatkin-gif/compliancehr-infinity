# Gap Audit — current app vs original (kristyleebatkin-gif/ComplianceHRLatestVersion, main)

Audited 2026-10-10 directly against the original GitHub source.

## Scale
| Area | Original | Current | Gap |
|---|---|---|---|
| Pages | 60 (~1.1 MB of code) | 38 (simplified, ~5 KB each) | 25 pages missing, all others heavily reduced |
| Feature components | 118 (~1 MB) | ~3 | ~115 missing |
| Lib helpers (PDFs, LMS, templates, roles…) | 80 | 4 | ~76 missing |
| Entities | 95 + User | 30 + User | 65+ missing; shared ones have far fewer fields |
| Backend functions | 60 | 2 | 59 missing (complianceExpiryScan is new, not original) |
| Workflows | 9 | 0 | 9 missing |
| AI agents | 4 | 0 | 4 missing |
| Role-based access (RoleGate, roles, useRole) | yes | no | missing |

## Routes missing entirely
Public: `/` Landing page (original dashboard lives at `/dashboard`), `/feedback/new` public feedback form, `/volunteer-interest` public form.
App: `/participants/:id` (ParticipantHub), `/staff/:id` (EmployeeHub), `/human-resources` (HR Unit / performance reviews), `/employee-document-review`, `/incidents/new`, `/incidents/:id`, `/incidents/:id/edit`, `/audit-centre`, `/assistant` (AI assistant), `/certificates`, `/complaints`, `/forms` (Forms Library), `/intake/participant`, `/intake/employee`, `/users` (Users & Permissions), `/portal` (My Portal), `/safety-insights` (AI Safety Insights), `/community-referral`, `/ndis-provider` (NDIS Registered Provider Portal), `/events` (separate from programs), `/ndis-news`, `/weather`, `/whats-on`, `/manual` (Manual Library).

Routes renamed in current app (original path in brackets): `/roster` (`/rostering`), `/contacts` (`/key-contacts`), `/volunteers` (`/volunteering-placements`), `/insurance` (`/insurance-finance`). `/github` is new.

## Module-by-module gaps
- **Participants** — original: list (20 KB) + ParticipantHub profile page (64 KB), ParticipantPortal, ParticipantIntake. Missing: profile detail page, document checklist, folder compliance checklist, audit readiness overview, compliance journey, forms library + online forms, goal controls, risk list, service delivery register, shift notes, support letters, bulk transfer, email referral form, profile photo, medical profile, audit consent, safeguard records, reviews. Entity has ~60% fewer fields. Missing entities: ParticipantDocument, ParticipantFolderAudit, ParticipantFolderChecklist, ParticipantGoalProgress, ParticipantReview, ParticipantSafeguardRecord, ParticipantShiftDetail, ShiftNote, SupportLetter, InformationSharingConsent.
- **Staff / HR** — original: Staff list, EmployeeHub (54 KB), HumanResourcesUnit (70 KB), EmployeeIntake, EmployeeDocumentReview. Missing: employee profile page, HR register, staff letters, staff certificates, training modules per staff, name-tag PDF, bulk transfer, milestones/leaderboard, performance appraisals, contracts, position descriptions, timesheets, medical profile. Entities: EmployeeEmploymentContract, EmployeeLeaderboardSettings, EmployeeMilestone, EmployeePerformanceAppraisal, EmployeePositionDescription, EmployeeTimesheet, StaffLetter, StaffMedicalProfile, StaffTrainingAudit, WorkforceAssuranceRecord, HRDocumentTemplate, ArchivedUser.
- **Incidents** — original: list (24 KB), IncidentForm, IncidentDetail, kanban, follow-up workflow, profile incident reports, investigations. Entity: Investigation.
- **Risks** — treatment section, risk templates, issue/concern/barrier tracking (IssueConcernBarrier).
- **Training** — LMS learner with curriculum, quizzes (7 packages), scenarios, competency checklists, training calendar, professional certificate PDF. Entity: TrainingCompletion. Separate Certificates page.
- **Compliance & Reports** — compliance dashboard, control workspace, docs, Reports Centre (30 KB), governance controls, KPIs, NDIS compliance deadlines, data breach log. Entities: GovernanceControlRecord, KPI, NDISComplianceDeadline, DataBreachLog, Register, RegisterNote.
- **Dashboard** — admin/staff/participant dashboards by role, attention panel, charts, quick start, employee milestones, import modal.
- **Asset Management** (38 KB) — maintenance, disposal, compliance review, internal audit, continuous improvement, emergency drill schedule, participant folder & staff training audit schedules. Entities: AssetMaintenance, AssetDisposal, AssetComplianceReview, InternalAudit, ImprovementAction/Review/Source.
- **Company Safe** (41 KB) / **Document Vault** — business forms, plan/policy/register templates, checklists library, key personnel register, management contacts, NDIS easy-read library, vault spreadsheet register, bulk download. Entities: CompanySafeDocument, BusinessDocument, ChecklistDocument, SafetyDocument, FormTemplate, FormSubmission.
- **Invoicing** (44 KB) — provider invoices, invoice template settings, NDIS price guide. Entities: ProviderInvoice, Provider, InvoiceTemplateSettings, NDISPriceGuideItem/Release.
- **Insurance & Finance** (45 KB) — finance records, leases. Entities: FinanceRecord, LeaseRecord.
- **Rostering Facility** (27 KB) / **Shift Scheduling** — shift modal, roster compliance dashboard, support panels, participant shift spreadsheet, teams, public holidays, calendar sync, roster emails. Entities: RosterTeam, RosterPublicHoliday.
- **Visual Boards** (42 KB) — dedicated VisualBoard entity (current reuses Task).
- **NDIS Provider Portal** (45 KB) — registration profile/groups, audit records & reminders. Entities: NDISRegistrationProfile, NDISRegistrationGroup, NDISAuditRecord, NDISAuditReminderLog.
- **Communications** — broadcast composer, communication log, feedback register + entry form. Entities: CommunicationLog, Notification.
- **Goal Progress** (34 KB) — goal form, progress snapshots, issue/concern form, spreadsheet export. Entities: ProgressSnapshot.
- **Programs & Events** (31 KB) — split Programs / Events. Entities: CommunityProgram, CommunityEvent.
- **Meeting Centre** — action + attendance records. Entities: MeetingRecord, MeetingActionRecord, MeetingAttendanceRecord.
- **Volunteering & Placements** (30 KB) + public interest form. Entities: VolunteerPlacement, VolunteerInterest.
- **Equipment Manuals & MSDS** — MSDS compliance folder, electrical/garden equipment manual libraries. Entity: MSDSRecord.
- **Safety** — AI Safety Insights, safety forms library, Take Five register, vehicle safety checks. Entities: TakeFive, VehicleSafetyCheck.
- **Receipt Hub** (22 KB) — receipt finder AI assistant. Entity: ReceiptRecord.
- **Quality CI** (19 KB) — quality dashboard. **Complaints** page + Complaint entity. **Surveys** → SatisfactionSurvey.
- **Other** — Community Referral (CommunityReferralService), Users & Permissions, Audit Log (AuditLog), Manual Library + quick start guide, What's On, NDIS News, Weather, AI Assistant, Landing page (hero, features, pricing, CTA).

## Backend functions missing (59)
aiAssistant, assetEvent, birthdayShoutouts, broadcastMessage, communityReferralSearch, communityUpdates, documentRegisters, employeeBulkTransfer, escalateOverdue, expiryNotifications, exportDataBackup, exportReport, exportSpreadsheet, goalEvent, goalProgressSpreadsheet, humanResourcesAction, importSpreadsheet, incidentAlert, insuranceFinanceRegister, invoiceAction, listDocumentVaultResources, manageUserApproval, manageUserArchive, markNotificationsRead, meetingAdministrationNotification, ndisAuditReminders, operationalRegisters, pageActivity, participantBulkTransfer, participantJourneySpreadsheet, participantShiftDetails, receiptAction, receiptRegister, recordFormUpload, requestAccountApproval, rosterAssistant, rosterShiftAction, runAutomations, safetyEvent, safetyInsights, safetyRegisters, sendManualEmail, sendParticipantReferralForm, sendRosterEmail, submitPublicFeedback, submitVehicleSafetyCheck, submitVolunteerInterest, syncCompanySafeDocument, syncHumanResourceRegister, syncParticipantComplianceForm, syncShiftsToCalendar, syncStaffTrainingPlan, townsvilleWhatsOn, updateAuditConsent, updateCompanyBranding, updateStaffAvailability, weeklyComplianceSummary, weeklyNDISPriceGuideCheck, weeklyPerformanceAppraisalDigest (+ shared-utils).

## Workflows missing (9)
Daily Birthday Shout-outs, Daily Expiry Notifications, Daily NDIS Audit Reminders, Incident Alert, Overdue Escalation, Safety Insights Scan, Tuesday NDIS Price Guide Check, Wednesday Performance Appraisal Review, Weekly Compliance Summary.

## AI agents missing (4)
compliance_agent, personal_assistant_agent, receipt_finder_agent, roster_assistant_agent.

## Shared UI missing
PageHeader, SectionCard, StatCard, StatusBadge, EmptyState, Field, ScoreRing, TemplatePicker, RegisterNotesBox, RoleGate, ValuePropsFooter, ArchivedPeopleRegister, CommunicationLog, IncidentWorkflow, registers/EntityRegisterPanel, registers/OperationalRegisterSpreadsheet.

## Recommended restoration order
Port original source module by module (entities → lib → components → page → functions → workflows), verifying each builds before the next:
1. Shared foundation: roles/RoleGate, shared UI components, Landing at `/` + Dashboard at `/dashboard`, original nav
2. Participants (list + hub + portal + intake)
3. Staff / HR (list + employee hub + HR unit + employee intake + document review)
4. Incidents & Risks
5. Training LMS & Certificates
6. Compliance & Reports, NDIS Provider Portal
7. Remaining operational modules, then functions, workflows and agents