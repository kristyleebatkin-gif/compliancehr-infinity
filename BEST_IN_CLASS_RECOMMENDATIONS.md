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

## Suggested build order

1. Closed-loop corrective actions + immutable audit trails (highest audit value).
2. Tables-first refresh of Money and Compliance registers (Stripe pattern).
3. AI roster suggestions + NDIS budget utilisation bars (Lumary/FlowLogic parity).
4. Continuous compliance score + evidence automation (Vanta/Drata parity).
5. Keyboard command palette + designed empty states platform-wide (Linear pattern).
6. Offline-first mobile capture for field safety workflows (SafetyCulture parity).