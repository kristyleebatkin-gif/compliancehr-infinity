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

## Profile logs
Consent changes, detail changes and acknowledgements shown in the Logged sections
come from function-recorded logs (service-role written) and staff acknowledgements
are limited to the staff member's own entries.