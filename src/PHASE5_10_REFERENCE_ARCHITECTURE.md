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
| 7 | Knowledge Graph Architecture | Live: `GraphEntity`, `GraphRelationship`, `GraphTaxonomy`, `GraphOntology`, `knowledgeGraphRegistry`, `base44/shared/graphRegistry.ts`, registry tab at `/knowledge-graph`. References §8 | Delivered for C7 |
| 8 | Digital Twin Architecture | Live: `DigitalTwinModel`, `DigitalTwinScenario`, `SimulationRun`, `digitalTwin`, `base44/shared/digitalTwin.ts`, module at `/digital-twin`. References §8 | Delivered for C7 |
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

---

## 8. C7 — Knowledge Graph & Digital Twin OS (design-only references)

Live implementation: `GraphEntity`, `GraphRelationship`, `GraphTaxonomy`, `GraphOntology`,
`DigitalTwinModel`, `DigitalTwinScenario`, `SimulationRun`; the `knowledgeGraphRegistry` and
`digitalTwin` functions; the engines in `base44/shared/graphRegistry.ts` and
`base44/shared/digitalTwin.ts`; the registry tab at `/knowledge-graph` and the module at
`/digital-twin`.

**Reuse decision.** Nodes are the existing registers (`RegulatoryStandard`, `ComplianceControl`,
`AssuranceEvidence`, `AssuranceFinding`, `Policy`, `FormTemplate`, `InternalAudit`,
`ImprovementAction`, `Risk`, `ComplianceIssue`, `AiRecommendation`). No register was copied, and no
node, edge or type was invented to fill a gap. An edge is recorded by hand only in `KnowledgeLink`;
`GraphRelationship` is a derived, rebuildable index that mirrors it and the record fields, so
rebuilding can never duplicate an edge or silently invent one. An unlinked record is reported as
unlinked.

**What the index refuses.** An edge whose endpoint is not an indexed record of the same business; an
edge from a record to itself; an edge the ontology's allowed triples do not cover. Rejections are
counted and reported, never dropped silently. The house taxonomy and ontology are generated from this
app's own node and relationship types, so the ontology cannot drift from the registers it describes.

**What the twin will not do.** It returns a modelled estimate and says so on every run: the
`estimate_notice` is stored with the run and cannot be blanked. An input with no records behind it is
excluded from the arithmetic and lowers `confidence` (the share of model weight that had records);
it is never filled with a default, a zero, or a figure from another model. A model whose inputs all
lack records refuses to simulate rather than producing a number. Every lever carries a stated reason,
and the model's version, status and assumptions are pinned on the run so a later edit cannot move a
past result.

### 8.1 PostgreSQL DDL (mirror of the seven entities)

```sql
create table graph_entity (
  id                 text primary key,
  tenant_id          text not null,
  entity_type        text not null check (entity_type in ('standard','control','evidence','finding',
                       'policy','form','audit','capa','risk','issue','recommendation')),
  entity_key         text not null,
  source_entity      text not null,   -- RegulatoryStandard, ComplianceControl, ...
  source_record_id   text not null,
  display_label      text not null,
  summary            text,
  module_label       text,
  module_path        text,
  record_status      text,
  relationship_count integer not null default 0,
  index_version      text,
  last_indexed_at    timestamptz,
  indexed_by         text,
  notes              text,
  unique (tenant_id, entity_key)
);
create index graph_entity_type_idx on graph_entity (tenant_id, entity_type);
create index graph_entity_source_idx on graph_entity (tenant_id, source_entity, source_record_id);

create table graph_relationship (
  id                  text primary key,
  tenant_id           text not null,
  relationship_key    text not null,   -- from key -> relationship -> to key
  from_entity_key     text not null,
  from_entity_id      text,
  from_type           text not null,
  from_label          text,
  to_entity_key       text not null,
  to_entity_id        text,
  to_type             text not null,
  to_label            text,
  relationship        text not null check (relationship in ('HAS_STANDARD','HAS_OBLIGATION',
                        'HAS_REQUIREMENT','REQUIRES','REFERENCES','IMPLEMENTED_BY','SUPPORTED_BY',
                        'LINKED_TO','MITIGATED_BY','PRODUCES','GENERATES','CREATES','ASSIGNED_TO',
                        'EVIDENCES','AUDITED_BY','VALIDATED_BY','APPROVED_BY','REPORTS_TO',
                        'MANAGED_BY','GOVERNS','MONITORED_BY','OWNED_BY','RELATES_TO')),
  weight              integer not null default 100,
  confidence          smallint check (confidence between 0 and 100),
  provenance_type     text not null check (provenance_type in ('Record field','Knowledge link','Derived rule')),
  provenance_detail   text,
  source_field        text,
  knowledge_link_id   text,            -- KnowledgeLink.id when one exists
  derived_rule        text,
  valid_from          date,
  valid_to            date,
  status              text not null default 'Active' check (status in ('Active','Retracted','Superseded')),
  index_version       text,
  notes               text,
  unique (tenant_id, relationship_key),
  check (from_entity_key <> to_entity_key)
);
create index graph_relationship_from_idx on graph_relationship (tenant_id, from_entity_key);
create index graph_relationship_to_idx on graph_relationship (tenant_id, to_entity_key);

create table graph_taxonomy (
  id                       text primary key,
  tenant_id                text not null,
  taxonomy_key             text not null,
  name                     text not null,
  description              text,
  version                  integer not null default 1,
  status                   text not null default 'Active' check (status in ('Active','Retired')),
  is_system                boolean not null default true,
  node_types_json          text,
  relationship_types_json  text,
  node_type_count          integer not null default 0,
  relationship_type_count  integer not null default 0,
  generated_at             timestamptz,
  notes                    text,
  unique (tenant_id, taxonomy_key)
);

create table graph_ontology (
  id                       text primary key,
  tenant_id                text not null,
  ontology_key             text not null,
  name                     text not null,
  description              text,
  version                  integer not null default 1,
  status                   text not null default 'Draft' check (status in ('Draft','Validated',
                             'Approved','Retired')),
  is_system                boolean not null default false,
  node_types_json          text,
  allowed_relationships_json text,
  triple_count             integer not null default 0,
  constraints              text,
  validated_by             text,
  validated_at             timestamptz,
  approved_by              text,
  approved_at              timestamptz,
  approval_note            text,
  notes                    text,
  unique (tenant_id, ontology_key)
);

create table digital_twin_model (
  id                   text primary key,
  tenant_id            text not null,
  model_key            text not null,
  name                 text not null,
  version              integer not null default 1,
  domain               text,
  purpose              text,
  description          text,
  metrics_json         text not null,      -- inputs, weights, count ceilings
  metric_count         integer not null default 0,
  assumptions          text,
  confidence_note      text,
  horizon              text,
  status               text not null default 'Draft' check (status in ('Draft','Validated',
                         'Approved','Retired')),
  author               text,
  author_id            text,
  reviewed_by          text,
  reviewed_at          timestamptz,
  reviewed_note        text,
  approved_by          text,
  approved_by_id       text,
  approved_at          timestamptz,
  approval_note        text,
  approval_authority   text not null default 'Independent reviewer'
                         check (approval_authority in ('Independent reviewer','Administrator override')),
  self_approved        boolean not null default false,
  previous_version_id  text references digital_twin_model (id),
  change_note          text,
  retired_at           timestamptz,
  review_due           date,
  engine_version       text,
  notes                text,
  unique (tenant_id, model_key, version)
);
create index digital_twin_model_latest_idx on digital_twin_model (tenant_id, model_key, version desc);

create table digital_twin_scenario (
  id                    text primary key,
  tenant_id             text not null,
  scenario_key          text not null,
  name                  text not null,
  version               integer not null default 1,
  model_id              text not null references digital_twin_model (id),
  model_key             text,
  model_name            text,
  model_version         integer,          -- pinned so a model edit cannot move this scenario
  description           text,
  levers_json           text not null,    -- one change per input, each with its reason
  lever_count           integer not null default 0,
  baseline_note         text,
  status                text not null default 'Draft' check (status in ('Draft','Submitted',
                          'Approved','Returned','Archived')),
  author                text,
  author_id             text,
  submitted_by          text,
  submitted_at          timestamptz,
  decided_by            text,
  decided_by_id         text,
  decided_at            timestamptz,
  decision_note         text,
  approval_authority    text not null default 'Independent reviewer'
                          check (approval_authority in ('Independent reviewer','Administrator override')),
  self_approved         boolean not null default false,
  run_count             integer not null default 0,
  last_run_at           timestamptz,
  notes                 text,
  unique (tenant_id, scenario_key)
);

create table simulation_run (
  id                       text primary key,
  tenant_id                text not null,
  run_ref                  text not null,
  model_id                 text not null references digital_twin_model (id),
  model_key                text,
  model_name               text,
  model_version            integer,
  model_status_at_run      text,
  scenario_id              text not null references digital_twin_scenario (id),
  scenario_key             text,
  scenario_name            text,
  scenario_version         integer,
  scenario_status_at_run   text,
  status                   text not null check (status in ('Completed','Failed')),
  estimate_notice          text not null,  -- cannot be blank: the run is a modelled estimate
  inputs_json              text,
  assumptions_json         text,
  results_json             text,
  index_baseline           numeric(6,2),
  index_projected          numeric(6,2),
  index_delta              numeric(6,2),
  confidence               smallint check (confidence between 0 and 100),
  data_completeness        smallint check (data_completeness between 0 and 100),
  metrics_used             integer not null default 0,
  metrics_missing          integer not null default 0,
  started_at               timestamptz not null,
  completed_at             timestamptz,
  duration_ms              integer,
  run_by                   text,
  run_by_id                text,
  engine_version           text,
  notes                    text,
  unique (tenant_id, run_ref)
);
create index simulation_run_model_idx on simulation_run (tenant_id, model_id, started_at desc);
```

### 8.2 `schema.prisma` — C7 (reference)

```prisma
model GraphEntity {
  id                String   @id
  tenantId          String   @map("tenant_id")
  entityType        String   @map("entity_type")
  entityKey         String   @map("entity_key")
  sourceEntity      String   @map("source_entity")
  sourceRecordId    String   @map("source_record_id")
  displayLabel      String   @map("display_label")
  summary           String?
  moduleLabel       String?  @map("module_label")
  modulePath        String?  @map("module_path")
  recordStatus      String?  @map("record_status")
  relationshipCount Int      @default(0) @map("relationship_count")
  indexVersion      String?  @map("index_version")
  lastIndexedAt     DateTime? @map("last_indexed_at")
  indexedBy         String?  @map("indexed_by")
  notes             String?

  @@unique([tenantId, entityKey])
  @@index([tenantId, entityType])
  @@map("graph_entity")
}

model GraphRelationship {
  id               String    @id
  tenantId         String    @map("tenant_id")
  relationshipKey  String    @map("relationship_key")
  fromEntityKey    String    @map("from_entity_key")
  fromEntityId     String?   @map("from_entity_id")
  fromType         String    @map("from_type")
  fromLabel        String?   @map("from_label")
  toEntityKey      String    @map("to_entity_key")
  toEntityId       String?   @map("to_entity_id")
  toType           String    @map("to_type")
  toLabel          String?   @map("to_label")
  relationship     String
  weight           Int       @default(100)
  confidence       Int?
  provenanceType   String    @map("provenance_type")
  provenanceDetail String?   @map("provenance_detail")
  sourceField      String?   @map("source_field")
  knowledgeLinkId  String?   @map("knowledge_link_id")
  derivedRule      String?   @map("derived_rule")
  validFrom        DateTime? @map("valid_from") @db.Date
  validTo          DateTime? @map("valid_to") @db.Date
  status           String    @default("Active")
  indexVersion     String?   @map("index_version")
  notes            String?

  @@unique([tenantId, relationshipKey])
  @@index([tenantId, fromEntityKey])
  @@index([tenantId, toEntityKey])
  @@map("graph_relationship")
}

model GraphTaxonomy {
  id                     String    @id
  tenantId               String    @map("tenant_id")
  taxonomyKey            String    @map("taxonomy_key")
  name                   String
  description            String?
  version                Int       @default(1)
  status                 String    @default("Active")
  isSystem               Boolean   @default(true) @map("is_system")
  nodeTypesJson          String?   @map("node_types_json")
  relationshipTypesJson  String?   @map("relationship_types_json")
  nodeTypeCount          Int       @default(0) @map("node_type_count")
  relationshipTypeCount  Int       @default(0) @map("relationship_type_count")
  generatedAt            DateTime? @map("generated_at")
  notes                  String?

  @@unique([tenantId, taxonomyKey])
  @@map("graph_taxonomy")
}

model GraphOntology {
  id                     String    @id
  tenantId               String    @map("tenant_id")
  ontologyKey            String    @map("ontology_key")
  name                   String
  description            String?
  version                Int       @default(1)
  status                 String    @default("Draft")
  isSystem               Boolean   @default(false) @map("is_system")
  nodeTypesJson          String?   @map("node_types_json")
  allowedRelationshipsJson String? @map("allowed_relationships_json")
  tripleCount            Int       @default(0) @map("triple_count")
  constraints            String?
  validatedBy            String?   @map("validated_by")
  validatedAt            DateTime? @map("validated_at")
  approvedBy             String?   @map("approved_by")
  approvedAt             DateTime? @map("approved_at")
  approvalNote           String?   @map("approval_note")
  notes                  String?

  @@unique([tenantId, ontologyKey])
  @@map("graph_ontology")
}

model DigitalTwinModel {
  id                 String    @id
  tenantId           String    @map("tenant_id")
  modelKey           String    @map("model_key")
  name               String
  version            Int       @default(1)
  domain             String?
  purpose            String?
  description        String?
  metricsJson        String    @map("metrics_json")
  metricCount        Int       @default(0) @map("metric_count")
  assumptions        String?
  confidenceNote     String?   @map("confidence_note")
  horizon            String?
  status             String    @default("Draft")
  author             String?
  authorId           String?   @map("author_id")
  reviewedBy         String?   @map("reviewed_by")
  reviewedAt         DateTime? @map("reviewed_at")
  reviewedNote       String?   @map("reviewed_note")
  approvedBy         String?   @map("approved_by")
  approvedById       String?   @map("approved_by_id")
  approvedAt         DateTime? @map("approved_at")
  approvalNote       String?   @map("approval_note")
  approvalAuthority  String    @default("Independent reviewer") @map("approval_authority")
  selfApproved       Boolean   @default(false) @map("self_approved")
  previousVersionId  String?   @map("previous_version_id")
  changeNote         String?   @map("change_note")
  retiredAt          DateTime? @map("retired_at")
  reviewDue          DateTime? @map("review_due") @db.Date
  engineVersion      String?   @map("engine_version")
  notes              String?
  scenarios          DigitalTwinScenario[]
  runs               SimulationRun[]

  @@unique([tenantId, modelKey, version])
  @@map("digital_twin_model")
}

model DigitalTwinScenario {
  id                String    @id
  tenantId          String    @map("tenant_id")
  scenarioKey       String    @map("scenario_key")
  name              String
  version           Int       @default(1)
  modelId           String    @map("model_id")
  modelKey          String?   @map("model_key")
  modelName         String?   @map("model_name")
  modelVersion      Int?      @map("model_version")
  description       String?
  leversJson        String    @map("levers_json")
  leverCount        Int       @default(0) @map("lever_count")
  baselineNote      String?   @map("baseline_note")
  status            String    @default("Draft")
  author            String?
  authorId          String?   @map("author_id")
  submittedBy       String?   @map("submitted_by")
  submittedAt       DateTime? @map("submitted_at")
  decidedBy         String?   @map("decided_by")
  decidedById       String?   @map("decided_by_id")
  decidedAt         DateTime? @map("decided_at")
  decisionNote      String?   @map("decision_note")
  approvalAuthority String    @default("Independent reviewer") @map("approval_authority")
  selfApproved      Boolean   @default(false) @map("self_approved")
  runCount          Int       @default(0) @map("run_count")
  lastRunAt         DateTime? @map("last_run_at")
  notes             String?
  model             DigitalTwinModel @relation(fields: [modelId], references: [id])
  runs              SimulationRun[]

  @@unique([tenantId, scenarioKey])
  @@map("digital_twin_scenario")
}

model SimulationRun {
  id                    String    @id
  tenantId              String    @map("tenant_id")
  runRef                String    @map("run_ref")
  modelId               String    @map("model_id")
  modelKey              String?   @map("model_key")
  modelName             String?   @map("model_name")
  modelVersion          Int?      @map("model_version")
  modelStatusAtRun      String?   @map("model_status_at_run")
  scenarioId            String    @map("scenario_id")
  scenarioKey           String?   @map("scenario_key")
  scenarioName          String?   @map("scenario_name")
  scenarioVersion       Int?      @map("scenario_version")
  scenarioStatusAtRun   String?   @map("scenario_status_at_run")
  status                String
  estimateNotice        String    @map("estimate_notice")
  inputsJson            String?   @map("inputs_json")
  assumptionsJson       String?   @map("assumptions_json")
  resultsJson           String?   @map("results_json")
  indexBaseline         Decimal?  @map("index_baseline") @db.Decimal(6, 2)
  indexProjected        Decimal?  @map("index_projected") @db.Decimal(6, 2)
  indexDelta            Decimal?  @map("index_delta") @db.Decimal(6, 2)
  confidence            Int?
  dataCompleteness      Int?      @map("data_completeness")
  metricsUsed           Int       @default(0) @map("metrics_used")
  metricsMissing        Int       @default(0) @map("metrics_missing")
  startedAt             DateTime  @map("started_at")
  completedAt           DateTime? @map("completed_at")
  durationMs            Int?      @map("duration_ms")
  runBy                 String?   @map("run_by")
  runById               String?   @map("run_by_id")
  engineVersion         String?   @map("engine_version")
  notes                 String?
  model                 DigitalTwinModel    @relation(fields: [modelId], references: [id])
  scenario              DigitalTwinScenario @relation(fields: [scenarioId], references: [id])

  @@unique([tenantId, runRef])
  @@index([tenantId, modelId, startedAt])
  @@map("simulation_run")
}
```

### 8.3 OpenAPI 3.1 — `knowledgeGraphRegistry` (reference)

```yaml
paths:
  /functions/knowledgeGraphRegistry:
    post:
      summary: Read the graph index, inspect one node, or rebuild the index
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action: { enum: [list, node, rebuild] }
                entity_key: { type: string, description: "Required for node, e.g. risk:abc123" }
                entity_type: { type: string }
                search: { type: string }
                node_limit: { type: integer, minimum: 1, maximum: 500 }
                edge_limit: { type: integer, minimum: 1, maximum: 500 }
      responses:
        '200': { description: Nodes, edges, taxonomy, ontology and rejection counts }
        '400': { description: Missing or invalid input }
        '403': { description: Role or business not permitted }
        '404': { description: Node is not indexed for this business }
```

### 8.4 OpenAPI 3.1 — `digitalTwin` (reference)

```yaml
paths:
  /functions/digitalTwin:
    post:
      summary: Read the twin, build a model or scenario, decide it, or run a simulation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action:
                  enum: [list, createModel, updateModel, reviseModel, validateModel, approveModel,
                         retireModel, createScenario, updateScenario, reviseScenario,
                         submitScenario, decideScenario, runSimulation]
                model_id: { type: string }
                scenario_id: { type: string }
                name: { type: string, minLength: 3 }
                domain: { type: string }
                purpose: { type: string }
                description: { type: string }
                assumptions: { type: string }
                horizon: { type: string }
                review_due: { type: string, format: date }
                metrics:
                  type: array
                  minItems: 1
                  items:
                    type: object
                    required: [metric, weight]
                    properties:
                      metric: { type: string }
                      weight: { type: integer, minimum: 1, maximum: 100 }
                      ceiling: { type: integer, minimum: 1, maximum: 1000 }
                levers:
                  type: array
                  items:
                    type: object
                    required: [metric, delta, rationale]
                    properties:
                      metric: { type: string }
                      delta: { type: number }
                      rationale: { type: string, minLength: 4, maxLength: 400 }
                change_note: { type: string }
                note: { type: string }
                decision: { enum: [Approved, Returned] }
      responses:
        '200': { description: Result of the action, including the estimate notice on a run }
        '400': { description: Invalid input, an unapproved model, or no records behind every input }
        '403': { description: Role not permitted to build or decide }
        '404': { description: Record is not in this business }
        '409': { description: Model or scenario state does not allow this action }
```

Estimate rule, stated once and used by both the running engine and any future implementation: an
input with records contributes its weight; an input without records is excluded from both the index
and the confidence denominator's numerator; the modelled index is the weight-normalised mean of the
input scores; confidence is the share of model weight that had records; a run with no input holding
records is refused rather than scored.

Named checkpoint for this step: **Capability Track C7 — Knowledge Graph & Digital Twin OS**.
