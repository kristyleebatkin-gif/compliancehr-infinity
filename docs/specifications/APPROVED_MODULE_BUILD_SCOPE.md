# Owner-authorised ComplianceHR Infinity implementation scope — 14 November 2026

Context: Kristy requested build ideas for each of the 51 modules, received the following proposals, then said “Please proceed to complete”. This attachment records that accepted scope. Implement in the EXISTING app 6ac9f91f0d82b1f80ec6a25f, Vite React SPA. Preserve architecture/routes/IDs/records/frameworks/branding/iPad Quick Access. Do not replace modules with generic showcase panels or mark configuration as working integration.

Read AGENTS.md, MASTER_TODO.md, MODULE_QUALITY_PLAN.md, current source, current SDK contracts and existing resources first. Extend existing entities and workflows; do not create competing systems. Reconcile actual current functionality, document specific gaps, implement substantive missing journeys in dependency order, and update the SAME MASTER_TODO with per-module evidence. Preserve old evidence as dated; do not carry old “verified” claims forward without current proof. A written plan is not implementation. Continue implementing feasible work rather than stopping after a scaffold.

## Shared acceptance
- Server-derived tenant/membership/approved account checks, matching frontend/backend permissions, protected files/exports/jobs. Inspect the currently disabled tenant-enforcement release flag; do not simply flip it without a dry-run ownership/migration report and safe migration readiness. Do not guess legacy ownership or change production business records.
- Jamie Miller and Sherelle Dalton remain active approved Provider Administrators with full organisation control. Personal dashboard preferences do not reduce permissions or create separate tenants.
- Reuse tasks, approvals, evidence, Universal360, document control, module directory and integration monitoring across all modules. Shared failure/loading/empty/unknown states; no fabricated KPIs or timer-based verification.
- Existing approved colour tokens, glass styling, mobile/tablet usability; use Australia/Brisbane and tenant configuration.
- Integrate existing systems first: care operations ShiftCare candidate, existing accounting/payroll, existing Google/Microsoft workspace, selected storage/signing/LMS only where needed. Verify actual provider capabilities and ownership before calling.
- Observed connector inventory today: googlecalendar active, gmail expired, github active; other providers require setup. Do not treat ChatGPT connectors as app connections. OAuth connectors may be app-scoped: isolate by approved organisation owner. Keep credentials backend-only.
- Build disabled/configuration-required integration paths when setup is missing, accurately labelled. No invented API adapters, external sends, bulk invitations, payments, payroll execution, production schedules or publication. No sensitive external data transfer without provider/scope decision. No new paid subscriptions.
- Create checkpoints; test build, lint, typecheck, root tests and relevant backend/behaviour tests; record commands and failures. Test synthetic data, retries/duplicates, source ownership and denied access. Browser test temporary Provider Administrator was blocked by approval gate; do not bypass security to manufacture a pass. State source vs runtime vs live verification separately.

## All 51 approved module outcomes
1 Dashboard: customisable role cards, urgent actions/approvals/service exceptions, evidence-linked real KPIs, card order/shortcuts for Kristy/Jamie/Sherelle.
2 Communication: threaded record-linked conversations, announcements/acknowledgements, drafts/delivery states, existing email integration, receipt links to Receipt Hub.
3 Daily Briefing: source-linked shifts, actions, incidents, appointments, renewals with freshness.
4 Meetings: agendas, attendance, minutes, decisions, follow-up tasks and calendar linking.
5 Feedback & Surveys: accessible/anonymous options, complaint escalation, responses and improvement links.
6 Operations Centre: uncovered shifts/missing notes/overdue approvals/disruptions with accountable owners.
7 Suggestions Hub: assess/prioritise/approve/implement/measure, separating staff and automated suggestions.
8 AI Assistant: authorised retrieval/drafting with source links, uncertainty, human review and safe action boundaries.
9 My Profile: personal details, qualifications/training/tasks/preferences separate from admin-controlled access.
10 Intake Centre: saved-progress enquiry/consent/eligibility/documents/agreement/readiness to commencement.
11 Employee Profiles: Staff360 qualifications, availability, supervision, training/history with restricted HR documents.
12 Participant Profiles: Participant360 goals/contacts/consents/plans/services/evidence, current vs superseded.
13 Visual Boards: picture routines, First/Then, choices, schedules, large controls, print and participant preferences.
14 Key Personnel Contacts: verified relationships, consent, contact preferences, emergency details and verification dates.
15 Volunteering & Placements: applications/checks/induction/agreements/supervision/availability/hours with limited access.
16 Users & Permissions: approvals/memberships/roles/access review/audit and effective-permission explanation.
17 Rostering: selected system coverage/exceptions/availability/qualifications/clashes/cancellations, no competing roster source.
18 Goals: goals linked to support activities/progress notes/evidence/reviews, no unsupported percentages.
19 Tasks: owners/dates/dependencies/recurrence/checklists/escalation and originating record links.
20 Programs & Events: plans/registration/consent/staffing/transport/budgets/attendance/outcomes/accessibility.
21 Frontline Rapid Hub: mobile shift start/authorised support information/notes/reporting, preserved drafts and failed-submit states.
22 Workforce Presence Centre: expected vs actual attendance/missed check-in/welfare follow-up and proportionate location use.
23 Incident Clinic: rapid report/triage/investigation/evidence/corrective actions/reviewed closure with safeguarding restrictions.
24 Incident Analytics: severity/service/contributing factors/recurrence/overdue actions/effectiveness, restricted drill-downs.
25 Risk Reporting: assessments/controls/incidents/owners/reviews, justified inherent/residual risk.
26 Emergency Response: emergency instructions/escalation/evacuation/continuity/drills with printable essential information.
27 Equipment Manuals & MSDS: searchable asset/location-linked instructions/SDS, currency and emergency print copies.
28 Compliance & Evidence: obligations/controls/owners/evidence/results and explicit missing/expired/unassessed states.
29 Auditor Portal: time-limited scope-based approved evidence/questions/responses/access logs.
30 Document Vault & Safe: private classified owned versioned documents/approvals/reviews/reliable attachments, personal vs organisation boundaries.
31 Remote Access & VPN: honest policy/session register; real verification only from supported gateway evidence.
32 Quality & Improvement: issue/root cause/approved action/implementation/effectiveness with incident/complaint/audit links.
33 Checklists: versioned conditional templates/evidence/assignments/exceptions and preserved submitted version.
34 Review Due Board: consolidated policy/plan/risk/contract/qualification/audit review calendar with prioritisation.
35 Evidence & User Success Hub: task-context guidance, incomplete journeys, evidence gaps, measured business outcomes.
36 Training Centre: role learning matrix/induction/courses/overdue/supervisor competency, verified external completion import where supported.
37 Certificates: issuer/attachment/issue/expiry/verification/renewal and shift eligibility implications.
38 Invoicing Centre: approved services/billing exceptions/funding references/accounting handoff/reconciliation with duplicate prevention.
39 Quote Centre: versioned quantities/assumptions/pricing dates/approval/acceptance and service-arrangement conversion.
40 Receipt Hub: capture/reviewable extraction/duplicate detection/coding/approval/accounting, original attachment retained.
41 Procurement: request/budget/supplier comparison/delegations/orders/goods received/invoice matching.
42 Asset Management: ownership/location/issue-return/maintenance/inspection/warranty/documents/disposal and QR labels.
43 HR Hub: recruitment/onboarding/contracts/leave/supervision/performance/grievances/offboarding, restricted matters/payroll handoff.
44 CRM & Leads: enquiries/referral sources/history/follow-up/capacity/conversion, separate marketing/care consent.
45 Referrals: structured referral/acknowledgement/consent/duplicate review/allocation/decisions/progress and accepted-intake conversion.
46 Governance Layer: board/committee agendas/packs/minutes/resolutions/interests/delegations/calendar and decision-action-evidence links.
47 Projects Hub: objectives/milestones/dependencies/budgets/risks/benefits/owners and verified executive progress.
48 NDIS Provider Portal: registration/obligations/evidence/submission preparation/follow-up, distinguish internal from actual regulator submission.
49 NDIS Updates & News: official source links/publication-effective dates/relevance/review/actions, summary distinct from original.
50 Community Council Hub: accessible consultation/advisory meetings/suggestions/directory/action tracking/feedback outcomes/privacy.
51 Help Centre: approved searchable guidance/walkthrough/contextual help/tickets/escalation/content owners/reviews, separate IT vs safeguarding.

## Priority complete journeys
A Referral -> intake -> participant profile -> commencement.
B Roster -> attendance -> service note -> approved billing.
C Incident -> investigation -> risk control -> improvement -> effectiveness review.
D Employee onboarding -> checks -> training -> shift eligibility.
E Document draft -> review -> approval -> acknowledgement -> renewal.

## Completion report
Report each module as already present and rechecked / implemented with test evidence / partial / blocked / untested. List changed files, migrations, command exit statuses, checkpoint IDs, integration setup needs and actual remaining work. Do not claim all 51 complete without evidence. Save reviewable changes and do not publish.

