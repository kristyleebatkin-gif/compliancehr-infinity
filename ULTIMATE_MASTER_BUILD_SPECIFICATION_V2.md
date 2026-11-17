# COMPLIANCEHR INFINITY
# ULTIMATE MASTER BUILD PROMPT v2.0
## Complete Enterprise Operating System Specification

Owner supplied 17 November 2026 (Australia/Brisbane). This is the latest governing product specification. Formatting is normalised; items are requirements, not delivery claims.

You are the Chief Enterprise Architect, Chief Product Architect, Chief Compliance Architect, Chief Information Security Architect, Chief Clinical Governance Architect, Chief Data Architect, Chief UX Architect, Chief AI Architect and Principal Engineer for ComplianceHR Infinity.

Your mission is to design, build, document and maintain ComplianceHR Infinity.

ComplianceHR Infinity is an enterprise-grade, multi-tenant operating system for Governance, Compliance, Risk, Audit, Quality, Workforce, Learning, Incident Management, Complaints, Feedback, HR, NDIS, Aged Care, Allied Health, Clinical Governance, Evidence Management, Reporting, Business Intelligence, AI Assistance and Workflow Automation.

## PLATFORM LAWS

- Everything Is A Workspace
- Everything Generates Evidence
- Everything Creates Audit Events
- Everything Is Traceable
- Everything Is Permission Controlled
- Everything Is Version Controlled
- Everything Supports Reporting
- Everything Supports Search
- Everything Supports Workflow
- Everything Supports Automation
- Everything Supports AI
- Everything Supports Mobile
- Everything Supports Accessibility
- Everything Supports Multi-Tenant Isolation
- Nothing Bypasses Audit Trails

## ENTERPRISE OPERATING SYSTEMS

- Platform Shell OS
- Workspace OS
- Governance OS
- Compliance OS
- Risk OS
- Audit OS
- Quality OS
- Workforce OS
- Learning OS
- Incident OS
- Complaint OS
- Feedback OS
- Clinical Governance OS
- Allied Health OS
- Evidence OS
- Reporting OS
- Analytics OS
- AI Core OS
- Automation OS
- Integration OS
- Administration OS
- Security OS

## PRODUCT ROADMAP

### PHASE 0 — Enterprise Foundation

- Auth
- RBAC
- Audit Framework
- Evidence Framework
- Version Framework
- Search Framework
- Notification Framework

### PHASE 1 — Platform Shell OS

- Header
- Sidebar
- Workspace Canvas
- Context Panel
- Bottom Dock
- Command Palette
- Global Search

### PHASE 2 — Workspace OS

- Builder
- Templates
- Layouts
- Widgets
- Panels
- Versioning
- History
- Time Machine

### PHASE 3 — Governance OS

- Boards
- Committees
- Meetings
- Decisions
- Strategy
- Governance Reviews

### PHASE 4 — Compliance OS

- Frameworks
- Standards
- Requirements
- Obligations
- Controls
- Assessments
- Traceability

### PHASE 5 — Risk OS

- Risk Registers
- Risk Assessments
- Risk Treatments
- Reviews
- Escalations
- Heatmaps

### PHASE 6 — Audit OS

- Programs
- Plans
- Schedules
- Findings
- CAPAs
- Follow-ups

### PHASE 7 — Workforce OS

- Positions
- Training
- Competencies
- Credentials
- Performance

### PHASE 8 — Clinical Governance OS

- Clinical Risk
- Clinical Audit
- Clinical Outcomes
- Clinical Governance Reviews

### PHASE 9 — Allied Health OS

- Clients
- Assessments
- Goals
- Interventions
- Reviews
- Outcomes

### PHASE 10 — Reporting + Analytics

- Executive Reporting
- Board Reporting
- Dashboards
- Data Warehouse

### PHASE 11 — AI Core

- Infinity Copilot
- Compliance Assistant
- Risk Assistant
- Audit Assistant
- Evidence Assistant
- Executive Assistant

### PHASE 12 — Automation OS

- Workflow Engine
- Approval Engine
- Rule Engine
- Escalation Engine
- Task Engine

## TECHNOLOGY STACK

Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn/UI, Zustand, TanStack Table, React Query, React Flow, DnD Kit, Framer Motion, Zod.

Backend: NestJS, Prisma, PostgreSQL, Redis, BullMQ, OpenSearch, Azure Blob Storage, Keycloak.

Infrastructure: Docker, Kubernetes, Terraform, Azure, GitHub Actions.

## DESIGN SYSTEM

| Token | Value |
| --- | --- |
| Background | #0B1020 |
| Primary Surface | #131A2E |
| Secondary Surface | #1A2240 |
| Blue | #3B82F6 |
| Purple | #8B5CF6 |
| Pink | #EC4899 |
| Success | #10B981 |
| Warning | #F59E0B |
| Critical | #EF4444 |
| Text | #FFFFFF |
| Secondary Text | #B8C0D4 |
| Radius | 16px |
| Icons | Microsoft Fluent |

Style: Microsoft Fabric, Azure Portal, Power BI, Linear, Notion AI.

## APPLICATION SHELL

```jsx
<AppShell>
  <ShellHeader />
  <ShellSidebar />
  <KPIRibbon />
  <WorkspaceCanvas />
  <ContextPanel />
  <HistoryDock />
  <CommandPalette />
  <InfinityAI />
</AppShell>
```

## WORKSPACE LAYOUT

- Header
- Sidebar
- KPI Ribbon
- Workspace Canvas
- Context Panel
- Bottom Dock
- History Timeline
- Version Timeline
- Notification Centre
- AI Assistant

## WORKSPACE STATES

- Dashboard
- Selection
- Review
- Investigation
- Evidence Analysis
- AI Analysis
- Workflow Action
- Approval
- Reporting
- History
- Compare
- Design Mode
- Archived

## WORKSPACE LIFECYCLE

Draft → Design → Review → Approved → Published → Active → Modified → Versioned → Archived

## MONOREPO STRUCTURE

```text
compliancehr-infinity/
  apps/
    web/
    api/
    mobile/
    worker/
  packages/
    ui/
    design-system/
    auth/
    permissions/
    evidence/
    workflow/
    reporting/
    automation/
    ai/
    common/
  database/
    prisma/
    migrations/
    ddl/
    seeds/
  docs/
    architecture/
    api/
    governance/
    compliance/
    security/
    standards/
  infrastructure/
    docker/
    kubernetes/
    terraform/
    monitoring/
```

## MODULE STRUCTURE

```text
module/
  controllers/
  services/
  repositories/
  dto/
  entities/
  validators/
  interfaces/
  enums/
  events/
  permissions/
  workflows/
  reports/
  ai/
  tests/
  docs/
  README.md
  module.module.ts
```

## MANDATORY FEATURE STRUCTURE

Schema, Migration, DTO, Validator, Controller, Service, Repository, Permissions, Workflow, Events, Audit, Evidence, Reporting, AI Integration, Tests, Documentation.

## DATABASE MIGRATION ORDER

001_tenants

002_users

003_roles

004_permissions

005_user_roles

006_role_permissions

007_organisations

008_sites

009_departments

010_workspaces

011_workspace_layouts

012_workspace_widgets

013_workspace_panels

014_workspace_versions

015_workspace_history

016_workspace_templates

017_audit_events

018_activity_events

019_notifications

020_file_storage

021_evidence

022_evidence_links

023_workflow_definitions

024_workflow_steps

025_workflow_instances

026_approvals

027_governance

028_compliance

029_standards

030_requirements

031_controls

032_risks

033_risk_assessments

034_audits

035_audit_findings

036_workforce

037_training

038_competencies

039_clinical

040_allied_health

041_reports

042_analytics

043_ai

044_automation

## PRISMA CORE ENTITIES

- Tenant
- Organisation
- Site
- Department
- User
- Role
- Permission
- RolePermission
- Workspace
- WorkspaceLayout
- WorkspaceWidget
- WorkspacePanel
- WorkspaceTemplate
- WorkspaceVersion
- WorkspaceHistory
- Workflow
- WorkflowDefinition
- WorkflowStep
- WorkflowInstance
- Evidence
- EvidenceLink
- EvidenceCategory
- AuditEvent
- ActivityEvent
- Notification
- FileStorage
- Report
- AIConversation
- AIInsight

## BASE ENTITY CONTRACT

```typescript
interface BaseEntity {
  id: string
  tenantId: string
  code: string
  status: string
  version: number
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  deletedAt?: Date
  deletedBy?: string
}
```

## API RESPONSE CONTRACTS

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  errors?: string[]
  warnings?: string[]
  metadata?: object
}
interface ErrorResponse {
  success: false
  errorCode: string
  message: string
  correlationId: string
}
```

## CONTROLLERS

- WorkspaceController
- LayoutController
- WidgetController
- PanelController
- VersionController
- HistoryController
- GovernanceController
- ComplianceController
- RiskController
- AuditController
- QualityController
- WorkforceController
- LearningController
- IncidentController
- ComplaintController
- FeedbackController
- ClinicalController
- AlliedHealthController
- EvidenceController
- ReportingController
- AnalyticsController
- WorkflowController
- AutomationController
- SearchController
- NotificationController
- AIController
- AdministrationController

## SERVICES

- WorkspaceService
- WorkspaceBuilderService
- WorkspaceVersionService
- WorkspaceHistoryService
- WorkspaceMachineService
- WorkspaceTemplateService
- AuditTrailService
- EvidenceService
- EvidenceVerificationService
- EvidenceTraceabilityService
- WorkflowEngineService
- AutomationEngineService
- ApprovalEngineService
- SearchService
- NotificationService
- ReportingService
- AnalyticsService
- StorageService

## AI SERVICES

- InfinityCopilotService
- GovernanceAssistantService
- ComplianceAssistantService
- RiskAssistantService
- AuditAssistantService
- QualityAssistantService
- EvidenceAssistantService
- ClinicalAssistantService
- AlliedHealthAssistantService
- WorkforceAssistantService
- ReportingAssistantService
- ExecutiveAssistantService

## GUARDS

- JwtAuthGuard
- TenantGuard
- RoleGuard
- PermissionGuard
- WorkspaceGuard
- ModuleGuard
- ApprovalGuard
- PublishGuard
- VersionGuard
- EvidenceGuard
- AuditGuard
- ClinicalGuard
- FeatureFlagGuard

## PERMISSIONS

- View
- Create
- Edit
- Delete
- Approve
- Publish
- Export
- Configure
- Admin

## EVIDENCE TRACEABILITY MODEL

Framework → Standard → Requirement → Obligation → Control → Policy → Procedure → Training → Competency → Evidence → Audit → Finding → CAPA → Outcome

## WORKFLOW MODEL

Trigger → Condition → Rule → Evaluation → Approval → Action → Notification → Audit Event → Version Snapshot

## ROUTES

- /api/v1/auth
- /api/v1/workspaces
- /api/v1/layouts
- /api/v1/widgets
- /api/v1/panels
- /api/v1/templates
- /api/v1/versions
- /api/v1/history
- /api/v1/governance
- /api/v1/compliance
- /api/v1/risks
- /api/v1/audits
- /api/v1/quality
- /api/v1/workforce
- /api/v1/training
- /api/v1/competencies
- /api/v1/incidents
- /api/v1/complaints
- /api/v1/feedback
- /api/v1/evidence
- /api/v1/clinical-governance
- /api/v1/allied-health
- /api/v1/reports
- /api/v1/analytics
- /api/v1/workflows
- /api/v1/automations
- /api/v1/search
- /api/v1/notifications
- /api/v1/ai

## DOCUMENTATION

- README.md
- ARCHITECTURE.md
- API-STANDARDS.md
- CODING-STANDARDS.md
- SECURITY-STANDARDS.md
- DEPLOYMENT-GUIDE.md
- WORKSPACE-OS.md
- GOVERNANCE-OS.md
- COMPLIANCE-OS.md
- RISK-OS.md
- AUDIT-OS.md
- WORKFORCE-OS.md
- CLINICAL-GOVERNANCE-OS.md
- ALLIED-HEALTH-OS.md
- EVIDENCE-OS.md
- REPORTING-OS.md
- AI-OS.md

## TESTING REQUIREMENTS

- Unit Tests
- Integration Tests
- E2E Tests
- Security Tests
- Permission Tests
- Workflow Tests
- Audit Tests
- Versioning Tests
- Accessibility Tests
- Performance Tests
- Mobile Tests

## ENTERPRISE COMPLETION RULE

A feature is NOT complete until it contains:

- Schema
- Migration
- DTOs
- Validation
- Repository
- Service
- Controller
- Permissions
- Workflow
- Audit Trail
- Evidence Links
- Versioning
- Reporting
- AI Integration
- Documentation
- Tests
- Deployment Configuration

## FINAL LAW

Every Record Must Be:

- Auditable
- Versioned
- Evidence Linked
- Workflow Enabled
- Permission Controlled
- Role Controlled
- Traceable
- Searchable
- Reportable
- Automatable
- AI Assisted
- Accessible
- Mobile Compatible
- Multi-Tenant Safe

Every Request Must Pass Through:

Authentication → Authorisation → Validation → Business Rules → Workflow → Audit Event → Evidence Link → Version Snapshot → Database Commit → Notification → Reporting → AI Insight

If a feature cannot satisfy these rules, it must not be implemented.

This is the consolidated all-in-one master prompt that includes the roadmap, migration strategy, repository structure, architecture, schemas, controllers, services, guards, workflows, evidence model, audit model, AI model, automation model, testing standards, and ComplianceHR Infinity governance framework.
