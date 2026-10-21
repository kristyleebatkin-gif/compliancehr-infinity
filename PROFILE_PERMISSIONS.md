# My Profile — Participant Permissions (documented record)

This documents who can see and change each part of the participant profile page,
as configured in the entity row-level security. It exists so the access rules for
the participant profile design (intake forms, required documents, audit readiness,
journey, consents) are written down, not assumed.

## Participant profile record (ParticipantProfile)
- **View:** admin, Provider Administrator, Management, Compliance Manager,
  Administration, Team Leader, Auditor — plus Support Workers and Employees, but
  only while the profile is approved by admin (`admin_approved`), and the
  participant themself (matched on the profile email).
- **Create:** admin, Provider Administrator, Management, Administration,
  Team Leader, Support Worker.
- **Edit:** admin, Provider Administrator, Management — plus the participant
  themself (matched on the profile email).
- **Delete:** admin, Provider Administrator, Management only.

## Consent fields — service role only
Audit consent, who recorded it (by/date/time), and the three consent objects
(share information, act as advocate, medication) can **only** be written by
backend functions (for example `participantAuditConsent`). No app user, whatever
their role, can edit these directly, so a consent decision can never be silently
changed from the profile screen. Recording always logs who recorded it, when,
and the reason.

## Participant intake forms and documents
- The participant's intake case and required documents are loaded through the
  personal intake client (`myStaffIntakeDocuments`), scoped to that one profile —
  a user only ever receives the case and documents belonging to the profile they
  opened.
- Required documents (Participant Intake Form, Intake Assessment, agreements,
  supports, health, feedback groups, and the "All Required Documents" space)
  belong to the participant: uploading and viewing follows the same personal
  access path, so each person sees only their own paperwork.
- Audit readiness is read from the same personal intake snapshot.

## Participant journey
The Participant Journey panel reads the participant's own intake case actions
(consents, acknowledgements, referee checks, documents, review, conversion) and
exports them to CSV. It is visible only inside that participant's profile and
inherits the same personal access scoping — no cross-participant journey data.

## Form submissions linked to a participant
Submissions carrying a `participant_id` can be read and updated by the profile
management roles above and by the participant themself only while the submission
belongs to their own linked profile.

## Staff profile and name tag
The employee (staff) profile page mirrors the participant design: name tag at the
top, half-height paired forms, and Résumé following the Driver's Licence section.
- The name tag preview reads company branding from Company Safe; no personal
  data leaves the profile.
- Sending a name tag by email goes through the `sendNameTagEmail` function and
  reaches registered app users only.
- Staff intake documents load through the same personal intake client
  (`myStaffIntakeDocuments`), scoped to that one staff profile.
- Staff forms (Staff Information, Staff Onboarding, Résumé, section forms) save
  to that staff member's own profile records.

## Employee Journey — permissions and workplace steps
The Employee Journey panel documents every workplace related step for the staff
member, in order: **Intake → Induction → Buddy shift → Training → More buddy
shift → (repeat the cycle)**. Training completed anywhere in the app is recorded
as a Training milestone with its dates; repeat cycles are added with
"Add milestone", so the same person logs more buddy shifts and more training as
often as the cycle repeats.

Each step captures, and the export includes:
- **Date** — scheduled, completed and next due / renewal date.
- **Comments** — outcome and notes written by whoever ran the step.
- **Report** — the report or reference for that step.
- **Who** — the buddy, trainer or reviewer responsible.
- Supporting documents, attached to the step and downloadable.

Exportable: the whole journey exports to CSV and PDF from the panel, and every
dated journey step also appears in the profile's "All Logs (Exportable)"
section with the date, who and what action.

Role permissions for the Employee Journey (all staff roles):
- **admin, Provider Administrator, Human Resources Manager, Administration** —
  edit milestones, add or remove steps, attach documents, save and export.
- **The staff member themself** (matched on the profile email) — the same
  editing rights on their own journey, including their employment start and
  induction dates.
- **admin, Provider Administrator, Human Resources Manager** (plus the person
  themself) — only these can change the employment start date and induction
  date on the profile record itself.
- **Everyone else with profile access** (Management, Compliance Manager,
  Team Leader, Support Worker, Auditor and others) — read-only view of the
  journey and its exports; nothing can be changed.
- Supporting documents stay attached to the step they were uploaded to.

## Profile logs — what is recorded and who can see it
Every log line carries its date, time, who performed it and what happened:
- **Audit consent (accept or decline):** the decision, the reason or evidence,
  who recorded it, plus the date and Sydney time. Written only by backend
  functions (`staffAuditConsent` / `participantAuditConsent`) from the
  authenticated caller — never from the form itself — so an accept or decline
  can never be changed silently. Shown in "Logged Audit Consent" and in All
  Logs.
- **Detail changes:** every change made to the profile is logged with what
  changed, who changed it, and the date and time. Shown in "Logged Detail
  Changes" and in All Logs.
- **Acknowledgements:** every acknowledgement is logged with what was
  acknowledged, who acknowledged it, and the date and time. Shown in "Logged
  Acknowledgements" and in All Logs. Staff acknowledgements are limited to the
  staff member's own entries.
- **All actions:** "All Logs (Exportable)" merges consent decisions, detail
  changes, acknowledgements and every dated journey step into one list with
  date, time, who and what action, exportable to CSV.

## Communication log
Both profiles carry a "Communication Logs & Records" section showing every
communication involving the person — shift notes, employee logs, messages,
emails, broadcasts, team banter and video calls — with who was involved
(sender, recipients and staff involved), the date and time, and attachments.
Employees see only communications addressed to or authored by them plus team
banter; management roles see the full record for the person.

## Participant profile — the same logging, mirrored
The participant profile mirrors every employee log:
- **Participant Journey** — every action on the participant's intake case
  (case opened, referral, consents, acknowledgements, referee checks,
  documents, review, conversion), in order, with stage, action, detail, date
  and who — exportable to CSV.
- **Communication Logs & Records** — all communications involving the
  participant and who was involved.
- **Logged Audit Consent / Detail Changes / Acknowledgements / All Logs** —
  identical logging and CSV export, scoped to that one participant.