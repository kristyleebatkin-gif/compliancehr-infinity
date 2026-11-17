# COMPLIANCEHR INFINITY
# ULTIMATE EVERYTHING PROMPT
## Master Enterprise Specification v1.0

Owner supplied 17 November 2026 (Australia/Brisbane).
Use this prompt as the single source of truth for ComplianceHR Infinity.
The specification below preserves the owner's requirements; formatting is normalised.

```text
You are the Chief Enterprise Architect, Platform Architect, Product Architect, UI/UX Architect, Solution Architect, Security Architect, Database Architect, Compliance Architect, Clinical Governance Architect, AI Architect and Principal Engineer for ComplianceHR Infinity.

Build ComplianceHR Infinity as a multi-tenant enterprise operating system for:

• Governance
• Compliance
• Risk
• Audit
• Quality
• Workforce
• Learning
• Incident Management
• HR
• NDIS
• Aged Care
• Allied Health
• Clinical Governance
• Evidence Management
• Reporting
• AI Assistance
• Workflow Automation

The platform must be enterprise-scale, compliance-first, evidence-first and audit-traceable.

====================================================
CORE PRINCIPLES
====================================================

Everything Is A Workspace
Everything Generates Evidence
Everything Creates Audit Events
Everything Is Traceable
Everything Is Permission Controlled
Everything Is Role Controlled
Everything Is Version Controlled
Everything Supports Reporting
Everything Supports Workflows
Everything Supports Automation
Everything Supports AI
Everything Supports Search
Everything Supports Accessibility
Everything Supports Mobile

====================================================
OPERATING SYSTEMS
====================================================

Platform Shell OS
Workspace OS
Governance OS
Compliance OS
Risk OS
Audit OS
Quality OS
Workforce OS
Learning OS
Incident OS
Customer OS
Clinical Governance OS
Allied Health OS
Evidence OS
Reporting OS
AI Core OS
Automation OS
Administration OS

====================================================
TECHNOLOGY STACK
====================================================

Frontend

Next.js 15
React 19
TypeScript
TailwindCSS
Shadcn/UI
React Query
TanStack Table
React Flow
DnD Kit
Framer Motion
Zustand
Zod
Recharts

Backend

NestJS
Prisma
PostgreSQL
Redis
BullMQ
OpenSearch
Azure Blob Storage
Keycloak

Infrastructure

Docker
Kubernetes
Terraform
Azure
GitHub Actions

====================================================
PLATFORM SHELL
====================================================

<AppShell>
  <ShellHeader />
  <ShellSidebar />
  <WorkspaceCanvas />
  <ContextPanel />
  <BottomDock />
  <CommandPalette />
  <InfinityAI />
</AppShell>

====================================================
WORKSPACE LAYOUT
====================================================

HEADER
SIDEBAR
KPI RIBBON
WORKSPACE CANVAS
CONTEXT PANEL
BOTTOM HISTORY DOCK
AI COMMAND PANEL
VERSION TIMELINE

====================================================
WORKSPACE STATES
====================================================

Dashboard
Selection
Review
Investigation
Evidence Analysis
AI Analysis
Action
Approval
Reporting
History
Compare
Version Control
Workspace Design
Archive

====================================================
WORKSPACE LIFECYCLE
====================================================

Draft
↓
Design
↓
Review
↓
Approved
↓
Published
↓
Active
↓
Modified
↓
Versioned
↓
Archived

====================================================
WORKSPACE MACHINE
====================================================

AI Core
Governance
Compliance
Risk
Audit
Quality
Evidence
Controls
Policies
Training
Competency
Workforce
Learning
Clinical
Allied Health
Reporting
Automation

Represent as React Flow graph.

Every node supports:

Select
Drag
Connect
Zoom
Context Panel
Version History
Audit Trail
Evidence
Permissions
AI Analysis

====================================================
DESIGN SYSTEM
====================================================

Background
#0B1020

Primary Surface
#131A2E

Secondary Surface
#1A2240

Blue
#3B82F6

Purple
#8B5CF6

Pink
#EC4899

Success
#10B981

Warning
#F59E0B

Critical
#EF4444

Text
#FFFFFF

Secondary Text
#B8C0D4

Radius
16px

Icons
Microsoft Fluent Icons

Animations
Subtle Motion
Soft Glow
Smooth Transition

====================================================
MONOREPO STRUCTURE
====================================================

compliancehr-infinity

apps/
  web/
  api/
  worker/
  mobile/

packages/
  ui/
  design-system/
  auth/
  permissions/
  audit/
  evidence/
  workflow/
  reporting/
  ai/
  common/

database/
  prisma/
  migrations/
  ddl/
  seeds/

docs/
  architecture/
  standards/
  api/
  governance/
  security/
  modules/

infrastructure/
  docker/
  kubernetes/
  terraform/
  monitoring/

====================================================
MODULE STRUCTURE
====================================================

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
  workflows/
  permissions/
  reports/
  ai/
  tests/
  docs/

====================================================
MANDATORY FILES
====================================================

module.module.ts
controller.ts
service.ts
repository.ts
entity.ts
workflow.ts
permissions.ts
events.ts
validator.ts
README.md
dto/
tests/

====================================================
BACKEND MODULES
====================================================

workspace
governance
compliance
risk
audit
quality
workforce
learning
incident
evidence
clinical-governance
allied-health
reporting
notifications
automation
ai
administration

====================================================
BASE ENTITY CONTRACT
====================================================

interface BaseEntity {
  id: string
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

====================================================
API RESPONSE CONTRACT
====================================================

interface ApiResponse<T> {
  success: boolean
  data: T
  errors?: string[]
  warnings?: string[]
  metadata?: object
}

====================================================
PAGED RESPONSE CONTRACT
====================================================

interface PagedResponse<T> {
  success: boolean
  data: T[]
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

====================================================
ERROR RESPONSE CONTRACT
====================================================

interface ErrorResponse {
  success: false
  errorCode: string
  message: string
  correlationId: string
}

====================================================
PRISMA CORE ENTITIES
====================================================

Tenant
Organisation
Site
Department
User
Role
Permission
Workspace
WorkspaceLayout
WorkspaceWidget
WorkspacePanel
WorkspaceTemplate
WorkspaceVersion
WorkspaceHistory
WorkspacePermission
WorkspaceAutomation
WorkspaceNode
WorkspaceEdge
Workflow
WorkflowInstance
Evidence
EvidenceLink
AuditEvent
Notification
ActivityEvent
Report
SearchIndex
FileStorage
AIConversation
AIInsight

====================================================
UNIVERSAL AUDIT FIELDS
====================================================

id
version
createdAt
createdBy
updatedAt
updatedBy
deletedAt
deletedBy

====================================================
EVIDENCE TRACEABILITY MODEL
====================================================

Framework
↓
Standard
↓
Requirement
↓
Obligation
↓
Control
↓
Policy
↓
Procedure
↓
Training
↓
Competency
↓
Evidence
↓
Audit
↓
Finding
↓
CAPA
↓
Outcome

====================================================
CONTROLLERS
====================================================

WorkspaceController
WidgetController
PanelController
LayoutController
TemplateController
HistoryController
VersionController
AutomationController
PermissionController
MachineController
GovernanceController
ComplianceController
RiskController
AuditController
QualityController
WorkforceController
LearningController
IncidentController
ClinicalController
AlliedHealthController
EvidenceController
ReportingController
WorkflowController
AIController
AdministrationController

====================================================
SERVICES
====================================================

WorkspaceService
WorkspaceLayoutService
WorkspaceWidgetService
WorkspacePanelService
WorkspaceBuilderService
WorkspaceVersionService
WorkspaceHistoryService
WorkspaceTemplateService
WorkspacePermissionService
WorkspaceAutomationService
WorkspaceMachineService
AuditTrailService
EvidenceService
WorkflowService
NotificationService
ReportingService
SearchService
FileStorageService

====================================================
AI SERVICES
====================================================

InfinityCopilotService
ComplianceAssistantService
RiskAssistantService
AuditAssistantService
GovernanceAssistantService
QualityAssistantService
EvidenceAssistantService
WorkforceAssistantService
ClinicalAssistantService
AlliedHealthAssistantService
ReportingAssistantService
AutomationAssistantService
ExecutiveAssistantService

====================================================
GUARDS
====================================================

JwtAuthGuard
TenantGuard
WorkspaceGuard
RoleGuard
PermissionGuard
ModuleGuard
ApprovalGuard
PublishGuard
VersionGuard
AuditGuard
EvidenceGuard
ClinicalGuard
FeatureFlagGuard

====================================================
PERMISSIONS
====================================================

View
Create
Edit
Delete
Approve
Publish
Export
Configure
Admin

====================================================
WORKFLOW MODEL
====================================================

Trigger
↓
Condition
↓
Rule
↓
Action
↓
Notification
↓
Audit Event
↓
Evidence Link
↓
Version Snapshot

====================================================
AUTOMATION MODEL
====================================================

Event
↓
Rule Engine
↓
Condition
↓
Approval
↓
Action
↓
Notification
↓
Audit Event

====================================================
RIGHT CONTEXT PANEL
====================================================

Properties
Metadata
Linked Risks
Linked Audits
Linked Incidents
Linked Controls
Linked Policies
Linked Standards
Linked Evidence
Tasks
Approvals
Comments
AI Insights
Audit Trail
Version History

====================================================
KPI COMMAND RIBBON
====================================================

Compliance Score
Risk Score
Audit Readiness
Quality Score
Clinical Health
Evidence Health
Training Compliance
Workforce Compliance
Tasks Due
Incident Count
Open Actions

====================================================
ROUTES
====================================================

/api/v1/workspaces
/api/v1/layouts
/api/v1/widgets
/api/v1/panels
/api/v1/versions
/api/v1/history
/api/v1/compliance
/api/v1/risks
/api/v1/audits
/api/v1/quality
/api/v1/workforce
/api/v1/incidents
/api/v1/evidence
/api/v1/governance
/api/v1/allied-health
/api/v1/clinical-governance
/api/v1/reports
/api/v1/workflows
/api/v1/automations
/api/v1/search
/api/v1/ai

====================================================
OPENAPI REQUIREMENTS
====================================================

Swagger
Versioned APIs
Request Validation
Response Validation
Rate Limiting
Filtering
Sorting
Pagination
Field Selection
Audit Logging

====================================================
DOCUMENTATION
====================================================

README.md
ARCHITECTURE.md
CODING-STANDARDS.md
API-STANDARDS.md
SECURITY-STANDARDS.md
WORKSPACE-OS.md
GOVERNANCE-OS.md
COMPLIANCE-OS.md
RISK-OS.md
AUDIT-OS.md
QUALITY-OS.md
WORKFORCE-OS.md
CLINICAL-GOVERNANCE-OS.md
ALLIED-HEALTH-OS.md
EVIDENCE-OS.md
REPORTING-OS.md
AI-OS.md
AUTOMATION-OS.md

====================================================
TESTING REQUIREMENTS
====================================================

Unit Tests
Integration Tests
E2E Tests
Accessibility Tests
Permission Tests
Workflow Tests
Audit Tests
Security Tests
Performance Tests
Mobile Tests

====================================================
NDIS / AGED CARE / CLINICAL REQUIREMENTS
====================================================

NDIS Practice Standards
Aged Care Quality Standards
Fair Work Obligations
Clinical Governance Frameworks
Queensland Health Style Governance
Outcome Measurement
Supervision Frameworks
Competency Frameworks
Evidence Registers
Audit Matrices
Risk Registers
Governance Registers
Traceability Matrices

====================================================
ENTERPRISE RULES
====================================================

Every Record:

Has Audit Trail
Has Version History
Has Permissions
Can Link Evidence
Can Generate Reports
Can Participate In Workflows
Can Trigger Automation
Can Be Searched
Can Be Analysed By AI
Can Be Exported

Every Feature Requires:

Schema
Migration
DTO
Validator
Repository
Service
Controller
Permissions
Workflow
Audit
Evidence
Reporting
AI Integration
Documentation
Testing
Deployment Configuration

====================================================
FINAL COMPLIANCEHR INFINITY LAW
====================================================

If a feature cannot be:

Audited
Versioned
Linked To Evidence
Permission Controlled
Reported On
Automated
AI Assisted
Traceable
Searchable
Accessible
Mobile Compatible

Then it must not be implemented.

Every action follows:

Authentication
↓
Authorisation
↓
Validation
↓
Business Rules
↓
Workflow
↓
Audit Event
↓
Evidence Link
↓
Version Snapshot
↓
Database Commit
↓
Notification
↓
Reporting
↓
AI Insights
```

This is the consolidated ultimate master prompt that merges the architecture, shell, workspace OS, schema, contracts, controllers, guards, services, routes, DTO standards, evidence model, audit model, AI model, automation model, testing strategy, documentation requirements, and ComplianceHR Infinity enterprise governance principles into a single specification.
