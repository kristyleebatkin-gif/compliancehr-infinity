# ComplianceHR Portal — Full Recreation Checklist

Goal: rebuild this app exactly the same. Checked against the live app on 2026-10-10.

## 1. Foundation
- [ ] Vite + React + Tailwind + shadcn/ui project, files under `src/pages`, `src/components`, `base44/`
- [ ] Design tokens in `src/index.css` + `tailwind.config.js` — teal theme (light + dark)
- [ ] Router `src/App.jsx` with AuthProvider, QueryClientProvider, Toaster, ScrollToTop
- [ ] `AppLayout.jsx` — branded sidebar nav for all modules + mobile menu + account/logout
- [ ] `ProtectedRoute` wrapping all app pages (public: login/register/forgot/reset/OAuthConsent)

## 2. Auth pages (platform boilerplate, English)
- [ ] Login.jsx — email+password, Google button, forgot link
- [ ] Register.jsx — email+password+confirm, register → OTP → verify flow, resend
- [ ] ForgotPassword.jsx — reset request
- [ ] ResetPassword.jsx — reads ?token=, new password + confirm
- [ ] OAuthConsent.jsx (platform page)

## 3. Entities (31 — every one with full schema + defaults)
Announcement, Asset, Audit, Certificate, Checklist, CompanyDocument, Contact,
EmergencyDrill, EmployeeDocument, EquipmentManual, Event, Feedback, Goal, Incident,
InsurancePolicy, Intake, Invoice, LegalRequirement, Meeting, ParticipantProfile, Policy,
QualityItem, Receipt, Risk, Shift, StaffProfile, Survey, Task, TrainingModule, Volunteer
(built-in User, never recreated)

## 4. Pages + routes + sample data (31 modules)
Route / module / entity(ies) — recreate page, register route in App.jsx, add nav item in AppLayout, seed sample records:
- [ ] / — Dashboard (metrics, announcements board + post form, quick links)
- [ ] /staff — Staff (StaffProfile: search, create, delete) — 4 records
- [ ] /compliance — Compliance Hub (Policy + LegalRequirement, tabs, add/delete) — 3+3
- [ ] /documents — Document Vault (EmployeeDocument, expiry status, "Scan expiries") — 4
- [ ] /training — Training Centre (TrainingModule + Certificate) — 3+3
- [ ] /tasks — Tasks (3-stage board: create, advance, delete) — 4
- [ ] /incidents — Incidents (Incident CRUD) — ⚠ currently 0 records: seed
- [ ] /participants — Participants (ParticipantProfile CRUD) — 3
- [ ] /risks — Risks (Risk CRUD) — 3
- [ ] /shifts — Shift Scheduling (Shift CRUD) — 3
- [ ] /feedback — Feedback & Complaints (Feedback CRUD) — 2
- [ ] /checklists — Checklists (Checklist with item toggling) — 2
- [ ] /assets — Asset Management (Asset CRUD) — 3
- [ ] /invoicing — Invoicing Centre (Invoice CRUD, totals) — 3
- [ ] /meetings — Meeting Centre (Meeting CRUD) — 2
- [ ] /emergency-response — Emergency Response (EmergencyDrill CRUD) — 2
- [ ] /programs — Programs & Events (Event CRUD) — 2
- [ ] /communications — Communications (Announcement board) — 3
- [ ] /audit — Audit Centre (Audit CRUD) — 3
- [ ] /intake — Intake (Intake CRUD) — 2
- [ ] /goals — Goal Progress (Goal CRUD + progress bars) — 3
- [ ] /quality — Quality Improvement (QualityItem CRUD) — 2
- [ ] /surveys — Surveys (Survey CRUD) — 2
- [ ] /contacts — Key Contacts (Contact CRUD) — 3
- [ ] /volunteers — Volunteers (Volunteer CRUD) — 2
- [ ] /roster — Rostering (weekly Shift roster view) — 3
- [ ] /visual-boards — Visual Boards (drag-and-drop Task kanban, @hello-pangea/dnd) — 4
- [ ] /company-safe — Company Safe (CompanyDocument CRUD) — 3
- [ ] /equipment-manuals — Equipment Manuals (EquipmentManual CRUD) — 2
- [ ] /insurance — Insurance & Finance (InsurancePolicy CRUD + expiry countdown) — 3
- [ ] /receipts — Receipt Hub (Receipt CRUD, unreconciled total, toggle reconcile) — 3
- [ ] /data-control — Data Control (record counts + CSV export for all 31 entities)
- [ ] /github — GitHub Activity (repo stats via githubRepoActivity function)

## 5. Backend functions (base44/functions/<name>/entry.ts)
- [ ] complianceExpiryScan — scans EmployeeDocument expiry dates, updates status
- [ ] githubRepoActivity — GitHub connector (repo, read:org, read:user) repo stats feed

## 6. Integrations
- [ ] GitHub shared connector authorized (repo, read:org, read:user scopes)
- [ ] No workflows, agents, or email templates (none exist today)

## 7. Publish
- [ ] Publish app (current live URL: polite-safe-hire-flow.base44.app)

## Gaps found in audit
- [x] Incident entity was empty — 3 sample incidents seeded
- [ ] Only 4 tasks seeded — boards look thin; consider +4