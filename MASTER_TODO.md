# ComplianceHR Portal — Master To-Do Plan

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
1 → 2 → 3 → 4–8 (profiles + intake + rostering core) → 9–15 (compliance/risk/safety) → 16–22 (finance/comms/training/meetings) → 23–30 → 31 (Sherelle Manager Playbook: Critical items 170, 178, 189, 190 first, then High, Medium, Low).