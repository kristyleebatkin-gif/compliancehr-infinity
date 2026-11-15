# Controlling master specification — 15 November 2026

This is the current owner-directed specification. Earlier specifications remain historical context and existing capabilities must be preserved. Requirements below are targets, not claims of delivery. Track implementation and verification in MASTER_TODO.md. Preserve the existing Base44 runtime, routes, record IDs, shared engines and approved branding. PostgreSQL/Prisma/API/warehouse deliverables are architecture contracts until separately implemented and verified; this prompt does not migrate production data.

Use this as the **single master prompt** for ComplianceHR Infinity. It consolidates everything we've built so far into one specification prompt for Base44, Claude, GPT, Lovable, Cursor, Windsurf, Replit, Bolt, Supabase, Prisma, PostgreSQL, or enterprise architecture generation.

# COMPLIANCEHR INFINITY MASTER AUDIT, COMPLIANCE, GOVERNANCE, RISK, QUALITY, EVIDENCE & ASSURANCE PLATFORM PROMPT

Act as a team consisting of:
- Enterprise Architect
- Principal Product Designer
- Chief Compliance Officer
- NDIS Lead Auditor
- Aged Care Lead Auditor
- Clinical Governance Director
- Allied Health Director
- Chief Risk Officer
- Chief Information Security Officer
- Data Governance Lead
- AI Governance Lead
- Enterprise SaaS Technical Architect
- PostgreSQL Architect
- Prisma Architect
- UX Design Lead
- ComplianceOS Architect

Build ComplianceHR Infinity, an enterprise multi-tenant SaaS platform for:
- NDIS Providers
- Aged Care Providers
- Allied Health Providers
- Community Services
- Disability Services
- Healthcare Organisations
- Enterprise Governance Teams

The platform must use an evidence-first design model where every compliance obligation can be traced from:
```
Standard
→ Indicator
→ Control
→ Audit Checkpoint
→ Evidence Requirement
→ Evidence Document
→ Finding
→ Corrective Action
→ Risk
→ Attestation
→ Executive Report
→ Board Assurance
```

# PLATFORM ARCHITECTURE
Create:
```
Compliance OS
Governance OS
Risk OS
Quality OS
Audit OS
Evidence OS
Workforce OS
Clinical Governance OS
Allied Health OS
Provider Management OS
Incident OS
Complaints OS
CAPA OS
Cyber Security OS
Data Governance OS
Vendor Governance OS
Board Assurance OS
Executive Assurance OS
AI Governance OS
Records Management OS
Enterprise Architecture OS
```

# MASTER CATALOGUES
Generate:
```
150 Compliance Indicators
IND-001 → IND-150
```
Generate:
```
50 Enterprise Controls
CTRL-001 → CTRL-050
```
Generate:
```
350 Evidence Requirements
EVD-001 → EVD-350
```
Generate:
```
356 Audit Checkpoints
AUD-001 → AUD-356
```

# AUDIT DOMAIN STRUCTURE
```
AUD-001–025
Rights & Responsibilities
AUD-026–075
Governance & Leadership
AUD-076–125
Provision of Supports
AUD-126–165
Workforce Governance
AUD-166–195
Environment & Safety
AUD-196–235
Risk, Compliance & Audit
AUD-236–275
Clinical Governance & Allied Health
AUD-276–325
Board, Executive & Finance
AUD-326–356
Vendor, Data, AI & Technology Governance
```

# INDICATORS
Create:
```
IND-001–025
Rights
IND-026–050
Governance
IND-051–065
Environment
IND-066–095
Workforce
IND-096–100
Restrictive Practices
IND-101–115
Advanced Governance
IND-116–125
Risk & Quality
IND-126–135
Clinical Governance
IND-136–145
Allied Health
IND-146–150
Outcomes
```

# CONTROLS
Create:
```
CTRL-001 Rights
CTRL-002 Consent
CTRL-003 Complaints
CTRL-004 Risk
CTRL-005 Incident
CTRL-006 Workforce
CTRL-007 Service Delivery
CTRL-008 Clinical Governance
CTRL-009 Restrictive Practices
CTRL-010 Continuous Improvement
CTRL-011–050
Governance
Risk
Audit
Clinical
Allied Health
Finance
Data Governance
Cyber Security
Vendor Governance
Board Assurance
Executive Assurance
Technology Governance
```

# EVIDENCE REQUIREMENTS
Generate:
```
EVD-001–025
Rights
EVD-026–060
Governance
EVD-061–090
Supports
EVD-091–110
Environment
EVD-111–135
Workforce
EVD-136–150
Clinical Governance
EVD-151–175
Audit
EVD-176–195
Risk
EVD-196–215
Compliance
EVD-216–230
Quality
EVD-231–240
Incident & Complaints
EVD-241–250
Cyber Security
EVD-251–265
Board Assurance
EVD-266–280
Executive Assurance
EVD-281–300
Finance
EVD-301–315
Vendor Governance
EVD-316–330
Data Governance
EVD-331–340
AI Governance
EVD-341–350
Enterprise Architecture
```

# AUDIT MATRIX
Build:
```
356 Audit Rows
```
with complete traceability:
```
AUD
→ IND
→ CTRL
→ EVD
```

# AUDIT MATRIX COLUMNS
Create a master audit matrix with:
```
audit_id
audit_code
audit_name
audit_domain
audit_subdomain
audit_category
audit_type
indicator_id
indicator_code
indicator_name
control_id
control_code
control_name
evidence_id
evidence_code
evidence_name
standard_code
standard_name
risk_id
risk_rating
criticality
inherent_risk_score
residual_risk_score
weighting
max_score
pass_score
review_frequency
evidence_frequency
owner_role
reviewer_role
approver_role
audit_status
compliance_status
audit_date
audit_period_start
audit_period_end
evidence_review_date
finding_date
corrective_action_due_date
verification_date
closure_date
next_review_date
next_audit_date
findings_count
actions_count
evidence_count
compliance_percentage
weighted_score
created_at
updated_at
```

# ROLE MODEL
Generate role workspaces for:
```
Platform Owner
Board Member
CEO
General Manager
Compliance Manager
Quality Manager
Risk Manager
Audit Manager
Clinical Governance Lead
Allied Health Manager
HR Manager
Operations Manager
Finance Manager
IT Manager
Cyber Security Officer
Service Delivery Manager
Team Leader
Support Coordinator
```
Each role must contain:
```
Dashboard
KPIs
Reports
Registers
Tasks
Approvals
AI Assistant
Widgets
Alerts
Audit Functions
Evidence Functions
Risk Functions
```

# POSTGRESQL SCHEMA
Generate complete:
```
PostgreSQL DDL
Indexes
Foreign Keys
Views
Triggers
Audit Tables
History Tables
Partitioning Strategy
```
for:
```
Indicators
Controls
Evidence
Audits
Findings
CAPA
Risks
Documents
Reviews
Attestations
Board Reports
Executive Reports
Users
Roles
Permissions
Workflows
Tasks
Notifications
```

# PRISMA SCHEMA
Generate:
```
Complete Prisma Schema
Relationships
Enums
Indexes
Soft Deletes
Versioning
Audit Columns
```

# EVIDENCE ENGINE
Build:
```
Evidence Requirement Register
Evidence Uploads
Evidence Reviews
Evidence Scoring
Evidence Freshness
Evidence Coverage
Evidence Gap Analysis
Evidence Expiry Monitoring
```

# RISK ENGINE
Build:
```
Strategic Risks
Operational Risks
Clinical Risks
Cyber Risks
Financial Risks
Vendor Risks
Risk Register
Risk Assessments
Risk Treatment Plans
KRIs
Heat Maps
Risk Reviews
Risk Dashboards
Board Risk Reporting
```

# CAPA ENGINE
Build:
```
Findings
Actions
Corrective Actions
Preventive Actions
Action Tracking
Approvals
Verification
Closure
```

# AUDIT SCORING
```
Critical = 5
High = 4
Medium = 3
Low = 2
Informational = 1
```
Compliance rating:
```
95–100 Fully Compliant
90–94 Substantially Compliant
80–89 Partially Compliant
70–79 Improvement Required
0–69 Major Non-Conformance
```
Formula:
```
Compliance Score =
(
Achieved Points
/
Available Points
)
× 100
```

# EXECUTIVE KPIs
Generate dashboards showing:
```
Enterprise Compliance %
Domain Compliance %
Open Findings
Critical Findings
Open Risks
Overdue Risks
Open Actions
Overdue Actions
Evidence Coverage %
Evidence Freshness %
Audit Completion %
Training Compliance %
Clinical Compliance %
NDIS Compliance %
Aged Care Compliance %
Cyber Security Compliance %
Governance Score %
```

# AI COPILOTS
Provide AI assistants for:
```
Compliance Copilot
Audit Copilot
Risk Copilot
Clinical Governance Copilot
Quality Copilot
Workforce Copilot
Evidence Copilot
Board Assurance Copilot
Executive Assurance Copilot
Cyber Security Copilot
```

# UI/UX REQUIREMENTS
Use:
```
Blue
Purple
Pink
```
enterprise design system.
Include:
```
Router Navigation
Role-Based Workspaces
Mobile Responsive Design
Accessibility WCAG AA
Dark Mode
Executive Dashboards
Advanced Search
Global Command Bar
Notifications
Activity Feed
Evidence Timeline
Audit Timeline
Risk Heatmaps
AI Command Centre
```

# FINAL DELIVERABLES
Generate:
```
1. Full PostgreSQL Schema
2. Full Prisma Schema
3. Full ERD
4. Full Audit Matrix
5. Full Indicator Catalogue
6. Full Control Catalogue
7. Full Evidence Catalogue
8. Full Risk Catalogue
9. Full Role Matrix
10. Full Permissions Matrix
11. OpenAPI Specifications
12. REST APIs
13. GraphQL APIs
14. AI Assistant Specifications
15. Dashboard Specifications
16. Mobile Specifications
17. Reporting Specifications
18. Data Warehouse Model
19. Power BI Model
20. Multi-Tenant SaaS Architecture
```
Build everything to enterprise production standards with complete traceability, versioning, auditability, evidence-first compliance management, NDIS alignment, Aged Care alignment, Allied Health governance, executive assurance, board assurance, and ComplianceHR Infinity architecture principles.

## Implementation interpretation

- Catalogue entries and generated relationships are Draft proposals until reviewed against applicable, current official sources. Numbered codes are internal identifiers, not regulator-issued requirements.
- Standard, indicator, control, checkpoint and evidence-requirement mappings require explicit reviewed relationships and exact evidence versions. A shared standard code alone never proves compliance.
- Unassessed and unknown scores remain unavailable. Do not assign invented risk records, risk scores, audit dates, signatures, approvals or board assurance.
- Use applicable available points with recorded exclusions and display assessment completeness. Never equate lack of data with either compliance or regulatory non-conformance.
- Keep existing role/tenant enforcement and approved operational access. Workspace specifications do not grant permissions.
- Do not publish until the existing release gates have evidence. Report saved source, automated tests, authenticated acceptance and publication separately.
