# Phases 5–10 — Reference Architecture (not executed by this app)

Companion to `PHASE5_10_INVENTORY.md`. Decisions taken: this work is a **separate capability
track (C5–C10)** mapped onto the existing 12-phase register, and the non-native artifacts below are
**design references only**. Nothing in this file is deployed, run or enforced by ComplianceHR
Infinity. The running implementation is the entity schemas, entity RLS and backend function that
this document mirrors.

If the reference and the records ever disagree, the records win.

---

## 1. Deliverable mapping

| # | Requested deliverable | What exists or will exist here | Status |
| --- | --- | --- | --- |
| 1 | Master Enterprise ERD | `PHASE5_10_INVENTORY.md` §2 coverage map + §4 build order | Delivered for C5 scope |
| 2 | Full PostgreSQL DDL | §3 below — mirrors the entity schemas exactly | Reference, C5 tables only |
| 3 | `schema.prisma` | §4 below — same three tables | Reference, C5 tables only |
| 4 | OpenAPI 3.1 contracts | §5 below — one contract per backend function | Reference, C5 function only |
| 5 | NestJS services | Not built. The equivalent is `decisionRegister` (auth, validation, transitions, audit) | Replaced by function |
| 6 | Next.js frontend | Not built. The equivalent is `src/pages/DecisionIntelligence.jsx` + `src/components/decisions/*` | Replaced by React app |
| 7 | Knowledge Graph Architecture | Existing: `KnowledgeLink`, `KnowledgeGraphOS`, `lib/knowledgeGraph.js`. Gaps in C7 | Partial |
| 8 | Digital Twin Architecture | Not built (register phase 12 target). Gaps in C7 | Planned |
| 9 | Event Fabric Architecture | Existing workflow triggers. Catalogue and message log are C8 gaps | Planned |
| 10 | AI Workforce Architecture | Existing `AiModel`, `AiAgent`, `AiPrompt`, `AiInteraction`. Tool grants are C9 gaps | Partial |
| 11 | Enterprise Strategy Architecture | Not built; C10 | Planned |
| 12 | Analytics Warehouse Schema | Existing snapshot records only (`ExecutiveScoreSnapshot`, `ProgressSnapshot`, `ModuleDailyStatus`) | Partial |
| 13–15 | RBAC / ABAC / RLS | Live: `roleMatrix` (both copies), entity `rls` blocks, tenant-scoped functions | Delivered pattern |
| 16 | Automation Definitions | Workflow `.jsonc` definitions (68), workflow engine | Delivered pattern |
| 17 | AI Agent Definitions | `base44/agents/*.jsonc` (4), `agentRuntime` | Delivered pattern |
| 18 | Workspace Specifications | Workspace OS (`workspacePreferences`, `WorkspacePreference`, `WorkspaceLayoutBar`) | Delivered pattern |
| 19–21 | Terraform / AKS / Observability | Not applicable: the platform hosts the app, database and functions. Logs are the function log stream | Not applicable |
| 22 | Disaster Recovery | Not applicable at this layer: platform-managed. Restorable checkpoints are the app's recovery unit | Not applicable |
| 23 | Performance & Scalability | Server-side counts, cursor paging, bounded queries (§6) | Design rule |
| 24 | Production Release Package | Per-step checkpoints; publication is a separate owner action | Process |

---

## 2. Why 19–22 cannot be delivered as code here

There is no server, cluster, container or database instance for this app to provision. Writing
Terraform for AKS, or a Kubernetes manifest set, would describe infrastructure that does not host
this application, cannot be applied by it, and would misstate the security and recovery posture.
The honest equivalents are recorded in the mapping table: platform hosting, platform-managed
backups and the function log stream. Any claim of a tested DR objective would be a fabrication.

---

## 3. PostgreSQL DDL — C5 decision register (reference)

Mirrors `DecisionRecord`, `DecisionEvidence`, `DecisionOutcome`. The `rls` block in each entity
schema is the enforced policy today; the policies below are its SQL translation.

```sql
create table decision_record (
  id                    text primary key,
  tenant_id             text not null,
  decision_number       text,
  title                 text not null check (length(title) between 4 and 200),
  summary               text,
  decision_type         text not null check (decision_type in (
                          'Operational Governance','Clinical Governance','Financial','Strategic',
                          'Risk Acceptance','Workforce','Technology','Policy','Safeguarding',
                          'Regulatory Response')),
  domain                text,
  status                text not null default 'Draft' check (status in (
                          'Draft','Proposed','In Review','Approved','Rejected','Deferred',
                          'Implemented','Closed')),
  priority              text not null default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  owner                 text,
  decision_maker        text,
  decision_date         date,
  effective_date        date,
  review_date           date,
  context               text,
  options_considered    text,
  recommendation        text,
  impact_summary        text,
  benefit_expected      text,
  benefit_actual        text,
  cost_estimate         numeric(14,2) default 0,
  risk_level            text not null default 'Medium' check (risk_level in ('Low','Medium','High','Critical')),
  risk_summary          text,
  evidence_confidence   smallint check (evidence_confidence between 0 and 100),
  confidence_score      smallint check (confidence_score between 0 and 100),
  standard_refs         text,
  control_refs          text,
  risk_refs             text,
  linked_recommendation_id     text,
  linked_recommendation_label  text,
  linked_approval_chain_id     text,
  linked_workflow_instance_id  text,
  linked_board_resolution_id   text,
  outcome_target        text,
  outcome_status        text not null default 'Not measured' check (outcome_status in (
                          'Not measured','On track','At risk','Achieved','Not achieved')),
  evidence_count        integer not null default 0,
  outcome_count         integer not null default 0,
  decided_by            text,
  decided_by_id         text,
  decided_at            timestamptz,
  decision_note         text,
  created_by_name       text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            text,
  updated_by            text,
  version               integer not null default 1,
  deleted_at            timestamptz,
  row_hash              text,
  audit_reference       text,
  metadata              jsonb not null default '{}'::jsonb,
  unique (tenant_id, decision_number)
);
create index decision_record_tenant_status_idx on decision_record (tenant_id, status);
create index decision_record_tenant_review_idx on decision_record (tenant_id, review_date)
  where deleted_at is null;
create index decision_record_risk_idx on decision_record (tenant_id, risk_level)
  where status in ('Draft','Proposed','In Review');
create index decision_record_meta_gin on decision_record using gin (metadata jsonb_path_ops);

create table decision_evidence (
  id                   text primary key,
  tenant_id            text not null,
  decision_id          text not null references decision_record (id),
  decision_title       text,
  title                text not null,
  evidence_type        text not null default 'Document',
  source               text,
  file_url             text,
  linked_evidence_id   text,          -- references assurance evidence; deliberately not copied
  standard_code        text,
  control_id           text,
  confidence           smallint check (confidence between 0 and 100),
  verification_status  text not null default 'Unverified'
                         check (verification_status in ('Unverified','Verified','Rejected','Expired')),
  verified_by          text,
  verified_date        date,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);
create index decision_evidence_decision_idx on decision_evidence (tenant_id, decision_id);

create table decision_outcome (
  id            text primary key,
  tenant_id     text not null,
  decision_id   text not null references decision_record (id),
  decision_title text,
  metric_name   text not null,
  unit          text,
  baseline_value numeric(14,2),
  target_value  numeric(14,2),
  actual_value  numeric(14,2),
  target_date   date,
  measured_date date,
  status        text not null default 'Not started' check (status in (
                  'Not started','On track','Off track','Achieved','Not achieved')),
  evidence_ref  text,
  verified_by   text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index decision_outcome_decision_idx on decision_outcome (tenant_id, decision_id);

-- Row-level security: the SQL form of the entity rls block.
alter table decision_record enable row level security;
create policy decision_record_read on decision_record for select
  using (tenant_id = current_setting('app.tenant_id', true) or current_setting('app.role', true) = 'admin');
create policy decision_record_write on decision_record for all
  using (current_setting('app.role', true) in ('admin','Provider Administrator','Compliance Manager',
    'Compliance Administrator','Management','Administration','Quality & Improvement Manager'))
  with check (tenant_id = current_setting('app.tenant_id', true));
-- Writes arrive from the service role only; the browser never holds a write grant.
```

A materialised view over outcomes (achievement rate per decision type) belongs in C6, alongside the
first assessment-run records, so it is defined once rather than twice.

---

## 4. `schema.prisma` — C5 (reference)

```prisma
model DecisionRecord {
  id                        String    @id @default(cuid())
  tenantId                  String
  decisionNumber            String?
  title                     String
  summary                   String?
  decisionType              String
  domain                    String?
  status                    String    @default("Draft")
  priority                  String    @default("Medium")
  owner                     String?
  decisionMaker             String?
  decisionDate              DateTime? @db.Date
  effectiveDate             DateTime? @db.Date
  reviewDate                DateTime? @db.Date
  context                   String?
  optionsConsidered         String?
  recommendation            String?
  impactSummary             String?
  benefitExpected           String?
  benefitActual             String?
  costEstimate              Decimal   @default(0) @db.Decimal(14, 2)
  riskLevel                 String    @default("Medium")
  riskSummary               String?
  evidenceConfidence        Int?
  confidenceScore           Int?
  standardRefs              String?
  controlRefs               String?
  riskRefs                  String?
  linkedRecommendationId    String?
  linkedRecommendationLabel String?
  outcomeTarget             String?
  outcomeStatus             String    @default("Not measured")
  evidenceCount             Int       @default(0)
  outcomeCount              Int       @default(0)
  decidedBy                 String?
  decidedById               String?
  decidedAt                 DateTime?
  decisionNote              String?
  createdByName             String?
  notes                     String?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
  deletedAt                 DateTime?
  evidence                  DecisionEvidence[]
  outcomes                  DecisionOutcome[]

  @@unique([tenantId, decisionNumber])
  @@index([tenantId, status])
  @@index([tenantId, reviewDate])
}

model DecisionEvidence {
  id                 String    @id @default(cuid())
  tenantId           String
  decisionId         String
  decision           DecisionRecord @relation(fields: [decisionId], references: [id])
  title              String
  evidenceType       String    @default("Document")
  source             String?
  fileUrl            String?
  linkedEvidenceId   String?
  standardCode       String?
  controlId          String?
  confidence         Int?
  verificationStatus String    @default("Unverified")
  verifiedBy         String?
  verifiedDate       DateTime? @db.Date
  notes              String?
  createdAt          DateTime  @default(now())
  deletedAt          DateTime?

  @@index([tenantId, decisionId])
}

model DecisionOutcome {
  id            String    @id @default(cuid())
  tenantId      String
  decisionId    String
  decision      DecisionRecord @relation(fields: [decisionId], references: [id])
  metricName    String
  unit          String?
  baselineValue Decimal?  @db.Decimal(14, 2)
  targetValue   Decimal?  @db.Decimal(14, 2)
  actualValue   Decimal?  @db.Decimal(14, 2)
  targetDate    DateTime? @db.Date
  measuredDate  DateTime? @db.Date
  status        String    @default("Not started")
  evidenceRef   String?
  verifiedBy    String?
  notes         String?
  createdAt     DateTime  @default(now())
  deletedAt     DateTime?

  @@index([tenantId, decisionId])
}
```

---

## 5. OpenAPI 3.1 — `decisionRegister` (reference)

The live endpoint is `POST /functions/decisionRegister`, invoked from the app through
`base44.functions.invoke('decisionRegister', payload)`. One contract, four actions.

```yaml
openapi: 3.1.0
info:
  title: ComplianceHR Infinity — Decision Register
  version: 1.0.0
  description: Governed decisions, their evidence and their measured outcomes. Tenant-scoped, server-authorised, audited.
paths:
  /functions/decisionRegister:
    post:
      summary: List or change decision records
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/Action' }
      responses:
        '200':
          description: Action result
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/ListResult'
                  - $ref: '#/components/schemas/DecisionResult'
        '400': { description: Invalid input }
        '401': { description: Not signed in }
        '403': { description: Role or business not permitted }
        '404': { description: Decision not in this business }
        '409': { description: Decision already recorded }
components:
  schemas:
    Action:
      type: object
      required: [action]
      properties:
        action: { enum: [list, create, update, decide, addEvidence, addOutcome] }
        decision_id: { type: string }
        status:
          type: string
          description: Filter for list, or the outcome for decide.
        decision_type: { type: string }
        search: { type: string }
        title: { type: string, minLength: 4, maxLength: 200 }
        summary: { type: string }
        priority: { enum: [Low, Medium, High, Critical] }
        risk_level: { enum: [Low, Medium, High, Critical] }
        review_date: { type: string, format: date }
        outcome_target: { type: string }
        metric_name: { type: string, minLength: 3 }
        target_value: { type: number }
        actual_value: { type: number }
        note: { type: string }
    Decision:
      type: object
      properties:
        id: { type: string }
        tenant_id: { type: string }
        decision_number: { type: string }
        title: { type: string }
        status: { enum: [Draft, Proposed, 'In Review', Approved, Rejected, Deferred, Implemented, Closed] }
        risk_level: { enum: [Low, Medium, High, Critical] }
        outcome_status: { enum: ['Not measured', 'On track', 'At risk', Achieved, 'Not achieved'] }
        evidence_count: { type: integer }
        outcome_count: { type: integer }
    Counts:
      type: object
      properties:
        total: { type: integer }
        open: { type: integer }
        awaitingDecision: { type: integer }
        approved: { type: integer }
        highRiskOpen: { type: integer }
        overdueReview: { type: integer }
        outcomesAchieved: { type: integer }
        evidenceRecords: { type: integer }
        measures: { type: integer }
    ListResult:
      type: object
      properties:
        saved: { const: true }
        canWrite: { type: boolean }
        canDecide: { type: boolean }
        decisions: { type: array, items: { $ref: '#/components/schemas/Decision' } }
        evidence: { type: array, items: { type: object } }
        outcomes: { type: array, items: { type: object } }
        counts: { $ref: '#/components/schemas/Counts' }
    DecisionResult:
      type: object
      properties:
        saved: { const: true }
        decision: { $ref: '#/components/schemas/Decision' }
```

---

## 6. Runtime rules these references must obey

1. **Tenant isolation** — every query carries `tenant_id` from the signed-in user's business; a
   cross-business id returns 404, never another tenant's record.
2. **Write authority** — browser writes are denied by entity RLS; the function performs writes with
   the service role only after checking role and business.
3. **Audit evidence** — every create, edit, decision, evidence and outcome write appends an
   `AuditLog` record naming actor, role and time.
4. **Truthful counts** — every figure on screen counts records; no figure is estimated, seeded or
   carried over from a mock.
5. **Bounded reads** — registers are read with a limit and sorted server-side; nothing loads a whole
   table into memory per render.

---

## 7. C6 — Autonomous Compliance Operations OS (design-only references)

Live implementation: `AutonomousAssessment`, `ComplianceGapAnalysis`, `ControlTestingResult`,
`RemediationPlan`, the `autonomousCompliance` function, the engine in
`base44/shared/complianceAssessment.ts`, and the module at `/compliance-operations`.

**Reuse decision.** Frameworks and standards are the existing `RegulatoryStandard` records; controls
are `ComplianceControl`; evidence is `AssuranceEvidence`; findings are `AssuranceFinding`. There is no
`compliance_frameworks` table in this app and none was created: `framework` is the framework name on
those records. The assessment reads them and raises gaps; it never creates a standard, a control or
an evidence record to fill a gap. A standard with no control, or a control with no evidence, becomes a
gap record, which is the point of the module.

### 7.1 PostgreSQL DDL (mirror of the four entities)

```sql
create table autonomous_assessment (
  id                     text primary key,
  tenant_id              text not null,
  assessment_ref         text not null,
  framework              text not null,
  assessment_type        text not null,
  status                 text not null check (status in ('Completed','Completed with gaps','Failed')),
  score                  smallint check (score between 0 and 100),
  risk_score             smallint check (risk_score between 0 and 100),
  confidence_score       smallint check (confidence_score between 0 and 100),
  assessed_on            timestamptz not null,
  standards_total        integer not null default 0,
  controls_total         integer not null default 0,
  controls_passed        integer not null default 0,
  controls_with_evidence integer not null default 0,
  gaps_found             integer not null default 0,
  open_findings          integer not null default 0,
  methodology            text,
  summary                text,
  run_mode               text not null default 'Manual',
  run_by                 text,
  run_by_id              text,
  engine_version         text,
  duration_ms            integer,
  created_at             timestamptz not null default now(),
  unique (tenant_id, assessment_ref)
);
create index autonomous_assessment_fw_idx on autonomous_assessment (tenant_id, framework, assessed_on desc);

create table compliance_gap_analysis (
  id                text primary key,
  tenant_id         text not null,
  gap_ref           text,
  framework         text not null,
  standard_id       text,          -- RegulatoryStandard.id
  standard_code     text,
  standard_title    text,
  control_id        text,          -- ComplianceControl.id, empty when no control exists
  control_statement text,
  gap_type          text not null check (gap_type in ('No control defined','Evidence missing',
                      'Evidence expired','Control not tested','Control test failed','Open finding',
                      'Partial coverage')),
  severity          text not null check (severity in ('Low','Medium','High','Critical')),
  observation       text,
  recommendation    text,
  status            text not null default 'Open' check (status in ('Open','Remediation planned',
                      'In progress','Closed','Risk accepted')),
  assessment_id     text references autonomous_assessment (id),
  assessment_ref    text,
  detected_on       timestamptz not null,
  detected_by       text not null default 'Assessment run',
  remediation_count integer not null default 0,
  resolved_on       date,
  resolved_by       text,
  closure_note      text,
  created_at        timestamptz not null default now()
);
create index gap_open_idx on compliance_gap_analysis (tenant_id, status, severity)
  where status in ('Open','Remediation planned','In progress');
create unique index gap_no_duplicate_open on compliance_gap_analysis (tenant_id, control_id, standard_code)
  where status in ('Open','Remediation planned','In progress');

create table control_testing_result (
  id                   text primary key,
  tenant_id            text not null,
  framework            text not null,
  standard_code        text,
  control_id           text not null,   -- ComplianceControl.id
  control_statement    text,
  evidence_id          text,            -- AssuranceEvidence.id
  evidence_title       text,
  evidence_state       text,
  test_method          text,
  result               text not null check (result in ('Pass','Partial','Fail','Not tested','Not applicable')),
  score                smallint check (score between 0 and 100),
  tested_on            timestamptz not null,
  tested_by            text,
  tested_by_id         text,
  test_source          text not null default 'Assessment run',
  assessment_id        text references autonomous_assessment (id),
  remediation_required boolean not null default false,
  notes                text
);
create index control_test_idx on control_testing_result (tenant_id, control_id, tested_on desc);

create table remediation_plan (
  id                    text primary key,
  tenant_id             text not null,
  plan_ref              text not null,
  gap_id                text not null references compliance_gap_analysis (id),
  gap_ref               text,
  gap_title             text,
  gap_severity          text,
  framework             text,
  standard_code         text,
  control_id            text,
  assigned_to           text not null,
  assigned_to_id        text,
  assigned_to_email     text,
  priority              text not null default 'Medium',
  status                text not null default 'Not started' check (status in ('Not started',
                          'In progress','Blocked','Completed','Closed')),
  target_date           date,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  actions               text,
  evidence_ref          text,
  updates_json          jsonb not null default '[]'::jsonb,
  update_count          integer not null default 0,
  started_on            date,
  completed_on          date,
  closed_on             date,
  closure_note          text,
  verified_by           text,
  verified_on           date,
  last_update_by        text,
  last_update_at        timestamptz,
  created_at            timestamptz not null default now(),
  unique (tenant_id, plan_ref)
);
create index remediation_open_idx on remediation_plan (tenant_id, status, target_date);

-- Same RLS shape as C5: reads by permitted role inside the tenant, writes from the service role only.
alter table autonomous_assessment enable row level security;
create policy assessment_tenant on autonomous_assessment for select
  using (tenant_id = current_setting('app.tenant_id', true) or current_setting('app.role', true) = 'admin');
```

### 7.2 Prisma models (design-only)

```prisma
model AutonomousAssessment {
  id                   String   @id @default(cuid())
  tenantId             String
  assessmentRef        String
  framework            String
  assessmentType       String
  status               String   @default("Completed")
  score                Int?
  riskScore            Int?
  confidenceScore      Int?
  assessedOn           DateTime
  standardsTotal       Int      @default(0)
  controlsTotal        Int      @default(0)
  controlsPassed       Int      @default(0)
  controlsWithEvidence Int      @default(0)
  gapsFound            Int      @default(0)
  openFindings         Int      @default(0)
  methodology          String?
  summary              String?
  runMode              String   @default("Manual")
  runBy                String?
  runById              String?
  engineVersion        String?
  durationMs           Int?
  gaps                 ComplianceGapAnalysis[]
  tests                ControlTestingResult[]

  @@unique([tenantId, assessmentRef])
  @@index([tenantId, framework, assessedOn])
}

model ComplianceGapAnalysis {
  id               String    @id @default(cuid())
  tenantId         String
  gapRef           String?
  framework        String
  standardId       String?
  standardCode     String?
  standardTitle    String?
  controlId        String?
  controlStatement String?
  gapType          String
  severity         String
  observation      String?
  recommendation   String?
  status           String    @default("Open")
  assessmentId     String?
  assessment       AutonomousAssessment? @relation(fields: [assessmentId], references: [id])
  detectedOn       DateTime
  detectedBy       String    @default("Assessment run")
  remediationCount Int       @default(0)
  resolvedOn       DateTime? @db.Date
  resolvedBy       String?
  closureNote      String?
  plans            RemediationPlan[]

  @@index([tenantId, status, severity])
}

model ControlTestingResult {
  id                  String    @id @default(cuid())
  tenantId            String
  framework           String
  standardCode        String?
  controlId           String
  controlStatement    String?
  evidenceId          String?
  evidenceTitle       String?
  evidenceState       String?
  testMethod          String?
  result              String
  score               Int?
  testedOn            DateTime
  testedBy            String?
  testedById          String?
  testSource          String    @default("Assessment run")
  assessmentId        String?
  assessment          AutonomousAssessment? @relation(fields: [assessmentId], references: [id])
  remediationRequired Boolean   @default(false)
  notes               String?

  @@index([tenantId, controlId, testedOn])
}

model RemediationPlan {
  id                   String    @id @default(cuid())
  tenantId             String
  planRef              String
  gapId                String
  gap                  ComplianceGapAnalysis @relation(fields: [gapId], references: [id])
  gapTitle             String?
  gapSeverity          String?
  framework            String?
  standardCode         String?
  controlId            String?
  assignedTo           String
  assignedToId         String?
  assignedToEmail      String?
  priority             String    @default("Medium")
  status               String    @default("Not started")
  targetDate           DateTime? @db.Date
  completionPercentage Int       @default(0)
  actions              String?
  evidenceRef          String?
  updatesJson          Json      @default("[]")
  updateCount          Int       @default(0)
  startedOn            DateTime? @db.Date
  completedOn          DateTime? @db.Date
  closedOn             DateTime? @db.Date
  closureNote          String?
  verifiedBy           String?
  verifiedOn           DateTime? @db.Date

  @@unique([tenantId, planRef])
  @@index([tenantId, status, targetDate])
}
```

### 7.3 OpenAPI 3.1 — `autonomousCompliance` (design-only)

```yaml
paths:
  /functions/autonomousCompliance:
    post:
      summary: Read registers, run an assessment, or record gap, test and remediation work
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action:
                  enum: [list, runAssessment, recordTest, createRemediation, updateRemediation,
                         verifyRemediation, updateGap]
                framework: { type: string }
                assessment_type: { type: string }
                gap_status: { type: string }
                search: { type: string }
                gap_id: { type: string }
                plan_id: { type: string }
                control_id: { type: string }
                evidence_id: { type: string }
                result: { enum: [Pass, Partial, Fail, 'Not tested', 'Not applicable'] }
                test_method: { type: string }
                assigned_to: { type: string, minLength: 2 }
                target_date: { type: string, format: date }
                completion_percentage: { type: integer, minimum: 0, maximum: 100 }
                note: { type: string }
                closure_note: { type: string }
      responses:
        '200': { description: Result of the action }
        '400': { description: Missing or invalid input, including a framework with no recorded coverage }
        '403': { description: Role or business not permitted }
        '404': { description: Record is not in this business }
        '409': { description: Record already closed }
```

Scoring rule, stated once and used by both the running engine and any future implementation:
verified and current evidence scores 100, unverified or in-review evidence 50, expired, rejected or
missing evidence 0; the assessment score is the mean control score; confidence is the share of
controls holding any evidence; the risk score adds 25 per critical gap, 12 per high, 6 per medium and
2 per low, capped at 100.
