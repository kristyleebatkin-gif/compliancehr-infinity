# C8 reference block — appended by the C8 build step.

## 9. C8 — Enterprise Automation Fabric (references that mirror live records)

Delivered as records and one function, not as infrastructure. What runs is:

- Seven tenant-scoped registers: `AutomationEventType`, `AutomationSubscription`, `AutomationFlow`,
  `OrchestrationRule`, `IntegrationConnector`, `IntegrationMessage`, `EventDeliveryAttempt`.
- One server-authorised function `automationFabric` with the actions `list`, `message`,
  `createEventType`, `updateEventType`, `retireEventType`, `saveSubscription`,
  `setSubscriptionStatus`, `saveFlow`, `validateFlow`, `publishFlow`, `reviseFlow`, `setFlowStatus`,
  `saveRule`, `setRuleStatus`, `saveConnector`, `setConnectorStatus`, `publishEvent`,
  `retryMessage`, `replayMessage`.
- Pure rules in `base44/shared/automationFabric.ts`; the delivery history, retries and redaction are
  tested in `tests/deno/capabilityC8.test.ts`.
- One module at `/automation-fabric`.

Two hard boundaries the implementation keeps, and any future implementation must keep:

1. **No second workflow engine.** A delivered event starts an *existing published* Workflow Studio
   version through `base44/shared/workflowLauncher.ts`. The fabric owns routing, not execution.
2. **No credential on a record.** A connector stores the *name* of an app secret. A value that looks
   like a key is refused at write time, and a failure reason is sanitised before it is stored.

### 9.1 PostgreSQL DDL (mirror of the seven entities)

```sql
CREATE TABLE automation_event_types (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  event_key text NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Compliance','Workforce','Incident','Risk','Finance','Governance','Integration','System')),
  domain text,
  source_module text,
  schema_version int NOT NULL DEFAULT 1,
  payload_schema_json jsonb NOT NULL,
  required_fields_json jsonb,
  field_count int NOT NULL DEFAULT 0,
  sensitivity text NOT NULL CHECK (sensitivity IN ('Public','Internal','Confidential','Restricted')),
  is_system boolean NOT NULL DEFAULT false,
  sample_payload_json jsonb,
  retention_days int NOT NULL DEFAULT 365,
  status text NOT NULL CHECK (status IN ('Active','Retired')),
  version int NOT NULL DEFAULT 1,
  author text, author_id uuid, retired_at timestamptz, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (tenant_id, event_key)
);

CREATE TABLE automation_subscriptions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  subscription_key text NOT NULL,
  name text NOT NULL,
  description text,
  event_type_key text NOT NULL,
  event_type_name text,
  event_schema_version int,
  target_kind text NOT NULL CHECK (target_kind IN ('Workflow','Automation flow','Record only')),
  workflow_definition_id uuid,
  workflow_definition_name text,
  flow_id uuid,
  flow_name text,
  connector_id uuid,
  connector_name text,
  filters_json jsonb NOT NULL DEFAULT '[]',
  filter_count int NOT NULL DEFAULT 0,
  delivery_mode text NOT NULL DEFAULT 'Immediate',
  max_attempts int NOT NULL DEFAULT 3,
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  status text NOT NULL CHECK (status IN ('Active','Paused','Retired')),
  version int NOT NULL DEFAULT 1,
  delivery_count int NOT NULL DEFAULT 0,
  failure_count int NOT NULL DEFAULT 0,
  last_delivery_at timestamptz,
  created_by_name text, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (tenant_id, subscription_key)
);

CREATE TABLE automation_flows (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  flow_key text NOT NULL,
  name text NOT NULL,
  description text,
  trigger_event_key text NOT NULL,
  trigger_event_name text,
  steps_json jsonb NOT NULL,
  step_count int NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('Draft','Validated','Published','Paused','Archived')),
  version int NOT NULL DEFAULT 1,
  content_hash text,
  validated_hash text,
  validated_at timestamptz, validated_by text, validated_note text,
  published_at timestamptz, published_by text,
  publisher_independent boolean NOT NULL DEFAULT false,
  previous_version_id uuid, change_note text,
  run_count int NOT NULL DEFAULT 0, last_run_at timestamptz,
  owner_role text, author text, author_id uuid, archived_at timestamptz, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL
);

CREATE TABLE orchestration_rules (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  rule_key text NOT NULL,
  name text NOT NULL,
  description text,
  event_type_key text NOT NULL,
  conditions_json jsonb NOT NULL DEFAULT '[]',
  condition_count int NOT NULL DEFAULT 0,
  action text NOT NULL CHECK (action IN ('Route to workflow','Route to flow','Record only','Suppress')),
  target_workflow_id uuid, target_workflow_name text,
  target_flow_id uuid, target_flow_name text,
  priority int NOT NULL DEFAULT 100,
  status text NOT NULL CHECK (status IN ('Active','Disabled')),
  match_count int NOT NULL DEFAULT 0,
  last_matched_at timestamptz,
  effective_from date,
  created_by_name text, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (tenant_id, rule_key)
);

CREATE TABLE integration_connectors (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  connector_key text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('Webhook','Message queue','HTTP API','Email','SMS','Workflow')),
  endpoint_label text,
  credential_ref text,
  auth_scheme text NOT NULL CHECK (auth_scheme IN ('Secret reference','Connected app connector','None')),
  status text NOT NULL CHECK (status IN ('Active','Disabled','Unverified')),
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  max_attempts int NOT NULL DEFAULT 3,
  retry_policy_json jsonb,
  allowed_event_types_json jsonb NOT NULL DEFAULT '[]',
  last_verified_at timestamptz, verified_by text, created_by_name text, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (tenant_id, connector_key),
  CONSTRAINT credential_is_a_name CHECK (credential_ref IS NULL OR credential_ref LIKE 'secret://%')
);

CREATE TABLE integration_messages (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  message_ref text NOT NULL,
  trace_id text NOT NULL,
  event_key text NOT NULL,
  event_type_name text,
  event_schema_version int,
  direction text NOT NULL CHECK (direction IN ('Inbound','Outbound')),
  source_ref text,
  status text NOT NULL CHECK (status IN ('Queued','Delivered','Retrying','Failed','Dead letter','Suppressed','Replayed')),
  payload_json jsonb NOT NULL,
  payload_hash text,
  redacted_fields_json jsonb NOT NULL DEFAULT '[]',
  redacted_count int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 3,
  next_attempt_at timestamptz, last_error text, delivered_at timestamptz,
  rule_id uuid, rule_name text,
  subscription_id uuid, subscription_name text,
  connector_id uuid, connector_name text,
  workflow_definition_id uuid, workflow_definition_name text,
  workflow_definition_version int, workflow_instance_id uuid,
  idempotency_key text NOT NULL,
  replay_of_id uuid, replay_count int NOT NULL DEFAULT 0,
  published_by text, published_by_id uuid, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE event_delivery_attempts (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  message_id uuid NOT NULL REFERENCES integration_messages (id) ON DELETE CASCADE,
  message_ref text NOT NULL,
  trace_id text,
  attempt_number int NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_ms int,
  outcome text NOT NULL CHECK (outcome IN ('Delivered','Retrying','Failed','Dead letter','Suppressed')),
  error_code text, error_detail text,
  backoff_seconds int, next_retry_at timestamptz,
  workflow_instance_id uuid, performed_by text, notes text,
  created_date timestamptz NOT NULL, updated_date timestamptz NOT NULL,
  UNIQUE (message_id, attempt_number)
);
```

### 9.2 `schema.prisma` — C8 (reference)

```prisma
model AutomationEventType {
  id                 String   @id @default(uuid())
  tenantId           String   @map("tenant_id")
  eventKey           String   @map("event_key")
  name               String
  category           String
  schemaVersion      Int      @default(1) @map("schema_version")
  payloadSchemaJson  Json     @map("payload_schema_json")
  fieldCount         Int      @default(0) @map("field_count")
  sensitivity        String   @default("Internal")
  retentionDays      Int      @default(365) @map("retention_days")
  status             String   @default("Active")
  @@unique([tenantId, eventKey])
  @@map("automation_event_types")
}

model AutomationSubscription {
  id                  String  @id @default(uuid())
  tenantId            String  @map("tenant_id")
  subscriptionKey     String  @map("subscription_key")
  eventTypeKey        String  @map("event_type_key")
  targetKind          String  @map("target_kind")
  workflowDefinitionId String? @map("workflow_definition_id")
  flowId              String? @map("flow_id")
  connectorId         String? @map("connector_id")
  filtersJson         Json    @default("[]") @map("filters_json")
  maxAttempts         Int     @default(3) @map("max_attempts")
  rateLimitPerMinute  Int     @default(60) @map("rate_limit_per_minute")
  status              String  @default("Active")
  @@unique([tenantId, subscriptionKey])
  @@map("automation_subscriptions")
}

model AutomationFlow {
  id           String    @id @default(uuid())
  tenantId     String    @map("tenant_id")
  flowKey      String    @map("flow_key")
  triggerEventKey String @map("trigger_event_key")
  stepsJson    Json      @map("steps_json")
  status       String    @default("Draft")
  version      Int       @default(1)
  contentHash  String?   @map("content_hash")
  validatedHash String?  @map("validated_hash")
  @@map("automation_flows")
}

model OrchestrationRule {
  id             String @id @default(uuid())
  tenantId       String @map("tenant_id")
  ruleKey        String @map("rule_key")
  eventTypeKey   String @map("event_type_key")
  conditionsJson Json   @default("[]") @map("conditions_json")
  action         String
  priority       Int    @default(100)
  status         String @default("Active")
  @@unique([tenantId, ruleKey])
  @@map("orchestration_rules")
}

model IntegrationConnector {
  id              String  @id @default(uuid())
  tenantId        String  @map("tenant_id")
  connectorKey    String  @map("connector_key")
  kind            String
  credentialRef   String? @map("credential_ref")
  authScheme      String  @map("auth_scheme")
  status          String  @default("Unverified")
  @@unique([tenantId, connectorKey])
  @@map("integration_connectors")
}

model IntegrationMessage {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  messageRef     String   @map("message_ref")
  traceId        String   @map("trace_id")
  eventKey       String   @map("event_key")
  status         String   @default("Queued")
  payloadJson    Json     @map("payload_json")
  payloadHash    String?  @map("payload_hash")
  redactedCount  Int      @default(0) @map("redacted_count")
  attempts       Int      @default(0)
  maxAttempts    Int      @default(3) @map("max_attempts")
  idempotencyKey String   @map("idempotency_key")
  attemptsLog    EventDeliveryAttempt[]
  @@unique([tenantId, idempotencyKey])
  @@map("integration_messages")
}

model EventDeliveryAttempt {
  id              String @id @default(uuid())
  tenantId        String @map("tenant_id")
  messageId       String @map("message_id")
  message         IntegrationMessage @relation(fields: [messageId], references: [id])
  attemptNumber   Int    @map("attempt_number")
  outcome         String
  backoffSeconds  Int?   @map("backoff_seconds")
  nextRetryAt     DateTime? @map("next_retry_at")
  @@unique([messageId, attemptNumber])
  @@map("event_delivery_attempts")
}
```

### 9.3 OpenAPI 3.1 — `automationFabric` (reference)

```yaml
paths:
  /functions/automationFabric:
    post:
      summary: Reads and changes this business's automation fabric
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action:
                  enum:
                    [list, message, createEventType, updateEventType, retireEventType,
                     saveSubscription, setSubscriptionStatus, saveFlow, validateFlow, publishFlow,
                     reviseFlow, setFlowStatus, saveRule, setRuleStatus, saveConnector,
                     setConnectorStatus, publishEvent, retryMessage, replayMessage]
                event_type_id: { type: string }
                event_type_key: { type: string }
                fields:
                  type: array
                  items:
                    type: object
                    required: [name, type]
                    properties:
                      name: { type: string, pattern: '^[a-z][a-z0-9_]{0,48}$' }
                      type: { enum: [string, number, boolean, object, array] }
                      required: { type: boolean }
                payload: { type: object }
                steps:
                  type: array
                  items:
                    type: object
                    required: [kind]
                    properties:
                      kind: { enum: ['Route to workflow', 'Record only', 'Stop'] }
                      workflow_definition_id: { type: string }
                conditions:
                  type: array
                  items:
                    type: object
                    required: [field, op]
                    properties:
                      field: { type: string }
                      op: { enum: [equals, not_equals, contains, exists, in, gt, gte, lt, lte] }
                      value: {}
                credential_ref:
                  type: string
                  description: The NAME of an app secret. A literal key is refused.
      responses:
        '200': { description: Result of the action }
        '400': { description: The payload breaks its contract, or a step kind cannot be performed }
        '401': { description: Not signed in }
        '403': { description: Role, approval or business does not permit this }
        '404': { description: Record is not in this business }
        '409': { description: Record state does not allow this action, or the flow is immutable }
        '429': { description: Rate limit reached; the retry delay is returned }
```

Routing rule, stated once and used by the running service: an event is validated against its declared
contract; the payload is redacted and hashed; the idempotency key is `tenant + event + source +
occurred`; the first active rule whose `effective_from` has arrived and whose conditions all pass
owns the event; if no rule matches, the first eligible subscription does; delivery calls the
existing Workflow Studio launcher and records one `EventDeliveryAttempt` per try; a failure retries
with doubling backoff until `max_attempts`, then becomes a dead letter a person must see.

Named checkpoint for this step: **Capability Track C8 — Enterprise Automation Fabric**.
