import { assertEquals, assertExists } from 'jsr:@std/assert@1';
import {
  EVENT_CATEGORIES,
  SENSITIVITIES,
  FIELD_TYPES,
  FLOW_STEP_KINDS,
  CONNECTOR_KINDS,
  MESSAGE_STATES,
  CONDITION_OPS,
  EVENT_CATALOGUE,
  FABRIC_VERSION,
  REDACTED,
  normaliseFields,
  validateEventPayload,
  redactPayload,
  sanitiseReason,
  idempotencyKey,
  validateConditions,
  conditionsPass,
  evaluateRules,
  backoffSeconds,
  nextAttemptAt,
  nextDeliveryState,
  rateLimitState,
  validateFlowSteps,
  flowContentHash,
  credentialRefProblem,
  endpointProblem,
  messageSummary,
} from '../../base44/shared/automationFabric.ts';
import {
  COMPLIANCE_REVIEW_ROLES,
  MANAGEMENT_ROLES,
  hasApprovedAccess,
  NAV_PERMISSIONS,
  resolveUserTenantId,
  stampTenantWritePayload,
} from '../../base44/shared/roleMatrix.ts';
import { tenantGroupOf } from '../../base44/shared/tenantClassification.ts';

const INCIDENT_CONTRACT = JSON.stringify([
  { name: 'incident_ref', type: 'string', required: true },
  { name: 'severity', type: 'string', required: true },
  { name: 'participant_ref', type: 'string', required: false },
]);

const rule = (overrides = {}) => ({
  id: 'rule-1',
  name: 'Route high severity incidents',
  status: 'Active',
  event_type_key: 'incident.created',
  priority: 100,
  conditions_json: JSON.stringify([{ field: 'severity', op: 'equals', value: 'High' }]),
  created_date: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

/* ---------------------------------------------------------------- payload contracts */

Deno.test('C8 an event that breaks its contract is refused before it is stored', () => {
  const missing = validateEventPayload(INCIDENT_CONTRACT, { incident_ref: 'INC-1' });
  assertEquals(missing.ok, false);
  assertEquals(missing.errors.length >= 1, true);

  const good = validateEventPayload(INCIDENT_CONTRACT, { incident_ref: 'INC-1', severity: 'High' });
  assertEquals(good.ok, true);
  assertEquals(good.unknownFields.length, 0);
});

Deno.test('C8 an undeclared field is kept but reported, so a reader sees the event carried more', () => {
  const result = validateEventPayload(INCIDENT_CONTRACT, { incident_ref: 'INC-1', severity: 'High', extra_note: 'x' });
  assertEquals(result.ok, true);
  assertEquals(result.unknownFields.includes('extra_note'), true);
});

Deno.test('C8 a payload contract needs at least one valid lower_snake_case field', () => {
  assertEquals(normaliseFields(JSON.stringify([])).ok, false);
  assertEquals(normaliseFields(JSON.stringify([{ name: 'Bad Name', type: 'string' }])).ok, false);
  assertEquals(normaliseFields(JSON.stringify([{ name: 'good_name', type: 'not_a_type' }])).ok, false);
  assertEquals(normaliseFields(JSON.stringify([{ name: 'good_name', type: 'string' }])).ok, true);
});

Deno.test('C8 every field type a contract may declare is one the validator knows', () => {
  FIELD_TYPES.forEach((type) => {
    assertEquals(normaliseFields(JSON.stringify([{ name: 'field_one', type }])).ok, true);
  });
});

/* ---------------------------------------------------------------- redaction */

Deno.test('C8 secret-looking values are replaced and their field names kept', () => {
  const { payload, redactedFields, redactedCount } = redactPayload({
    incident_ref: 'INC-1',
    api_token: 'abc',
    delivery_note: 'Bearer eyJabcdefghij.klmnopqrstu',
  });
  assertEquals(payload.incident_ref, 'INC-1');
  assertEquals(payload.api_token, REDACTED);
  assertEquals(payload.delivery_note, REDACTED);
  assertEquals(redactedCount >= 2, true);
  assertEquals(redactedFields.includes('api_token'), true);
});

Deno.test('C8 a restricted event is redacted even when no field name looks sensitive', () => {
  const { redactedCount } = redactPayload({ incident_ref: 'INC-1', severity: 'High' }, { force: true });
  assertEquals(redactedCount >= 1, true);
});

Deno.test('C8 a bearer token inside a failure reason never reaches the record', () => {
  const reason = sanitiseReason('Upstream refused: Authorization: Bearer sk_live_abcdef123456');
  assertEquals(reason.includes('sk_live_abcdef123456'), false);
});

/* ---------------------------------------------------------------- idempotency */

Deno.test('C8 the same event from the same source is delivered once', async () => {
  const input = { tenantId: 'business-a', eventKey: 'incident.created', sourceRef: 'INC-1', occurredAt: '2026-02-01T00:00:00.000Z' };
  assertEquals(await idempotencyKey(input), await idempotencyKey({ ...input }));
  assertEquals(await idempotencyKey(input) === await idempotencyKey({ ...input, sourceRef: 'INC-2' }), false);
});

Deno.test('C8 one business can never de-duplicate against another business event', async () => {
  const shared = { eventKey: 'incident.created', sourceRef: 'INC-1', occurredAt: '2026-02-01T00:00:00.000Z' };
  const a = await idempotencyKey({ tenantId: 'business-a', ...shared });
  const b = await idempotencyKey({ tenantId: 'business-b', ...shared });
  assertEquals(a === b, false);
});

/* ---------------------------------------------------------------- routing */

Deno.test('C8 the first matching active rule owns the event', () => {
  const chosen = evaluateRules(
    [rule({ id: 'rule-low', priority: 500 }), rule({ id: 'rule-first', priority: 10 })],
    { eventKey: 'incident.created', payload: { severity: 'High' } },
  );
  assertExists(chosen);
  assertEquals(chosen.id, 'rule-first');
});

Deno.test('C8 a disabled rule and an event from another type never claim the event', () => {
  assertEquals(evaluateRules([rule({ status: 'Disabled' })], { eventKey: 'incident.created', payload: { severity: 'High' } }), null);
  assertEquals(evaluateRules([rule()], { eventKey: 'risk.created', payload: { severity: 'High' } }), null);
});

Deno.test('C8 a rule whose conditions fail is skipped for the next matching rule', () => {
  const chosen = evaluateRules(
    [rule({ id: 'rule-high', priority: 1 }), rule({ id: 'rule-low', priority: 2, conditions_json: JSON.stringify([{ field: 'severity', op: 'equals', value: 'Low' }]) })],
    { eventKey: 'incident.created', payload: { severity: 'Low' } },
  );
  assertExists(chosen);
  assertEquals(chosen.id, 'rule-low');
});

Deno.test('C8 a rule that starts in the future waits for its effective date', () => {
  const future = rule({ effective_from: '2030-01-01' });
  assertEquals(evaluateRules([future], { eventKey: 'incident.created', payload: { severity: 'High' }, today: '2026-06-01' }), null);
  assertExists(evaluateRules([future], { eventKey: 'incident.created', payload: { severity: 'High' }, today: '2030-06-01' }));
});

Deno.test('C8 a rule with no conditions matches every event of its type', () => {
  const broad = rule({ conditions_json: '[]' });
  assertExists(evaluateRules([broad], { eventKey: 'incident.created', payload: {} }));
});

Deno.test('C8 an unsupported condition operator is refused rather than silently ignored', () => {
  assertEquals(validateConditions(JSON.stringify([{ field: 'severity', op: 'starts_with', value: 'H' }])).ok, false);
  assertEquals(validateConditions(JSON.stringify([{ field: '', op: 'equals', value: 'x' }])).ok, false);
  CONDITION_OPS.forEach((op) => {
    assertEquals(validateConditions(JSON.stringify([{ field: 'severity', op, value: 'x' }])).ok, true);
  });
});

Deno.test('C8 conditions read nested payload fields and compare numbers properly', () => {
  assertEquals(conditionsPass(JSON.stringify([{ field: 'details.count', op: 'gte', value: 3 }]), { details: { count: 4 } }), true);
  assertEquals(conditionsPass(JSON.stringify([{ field: 'details.count', op: 'gte', value: '3' }]), { details: { count: 2 } }), false);
  assertEquals(conditionsPass(JSON.stringify([{ field: 'tags', op: 'contains', value: 'sirs' }]), { tags: 'SIRS review' }), true);
});

/* ---------------------------------------------------------------- retries and limits */

Deno.test('C8 backoff grows exponentially and stops at its ceiling', () => {
  assertEquals(backoffSeconds(1), 30);
  assertEquals(backoffSeconds(2), 60);
  assertEquals(backoffSeconds(3), 120);
  assertEquals(backoffSeconds(20), 3600);
  assertExists(nextAttemptAt(2, new Date('2026-01-01T00:00:00.000Z')));
});

Deno.test('C8 a failure becomes a retry, then a dead letter that needs a person', () => {
  assertEquals(nextDeliveryState({ delivered: false, attempt: 1, maxAttempts: 3 }).status, 'Retrying');
  assertEquals(nextDeliveryState({ delivered: false, attempt: 3, maxAttempts: 3 }).status, 'Dead letter');
  assertEquals(nextDeliveryState({ delivered: false, attempt: 3, maxAttempts: 3 }).exhausted, true);
  assertEquals(nextDeliveryState({ delivered: true, attempt: 1, maxAttempts: 3 }).retry, false);
});

Deno.test('C8 attempts beyond the limit are capped, so a broken route cannot loop forever', () => {
  assertEquals(nextDeliveryState({ delivered: false, attempt: 12, maxAttempts: 99 }).status, 'Dead letter');
});

Deno.test('C8 the rate limit counts only the last minute and refuses past it', () => {
  const now = new Date('2026-01-01T12:00:00.000Z');
  const saturated = rateLimitState({
    attempts: ['2026-01-01T11:59:30.000Z', '2026-01-01T11:59:40.000Z'],
    limitPerMinute: 2,
    now,
  });
  assertEquals(saturated.allowed, false);
  assertEquals(saturated.used, 2);
  assertEquals(saturated.retryAfterSeconds > 0, true);

  const roomy = rateLimitState({ attempts: ['2026-01-01T11:00:00.000Z'], limitPerMinute: 2, now });
  assertEquals(roomy.allowed, true);
  assertEquals(roomy.used, 0);
});

/* ---------------------------------------------------------------- flows */

Deno.test('C8 a flow step this fabric cannot perform is refused', () => {
  const refused = validateFlowSteps([{ kind: 'Send an SMS' }], []);
  assertEquals(refused.ok, false);
  assertEquals(refused.errors[0].includes('cannot perform'), true);
  FLOW_STEP_KINDS.forEach((kind) => assertEquals(kind.length > 0, true));
});

Deno.test('C8 a flow needs at least one step that routes or records', () => {
  const refused = validateFlowSteps([{ kind: 'Stop' }], []);
  assertEquals(refused.ok, false);

  const accepted = validateFlowSteps([{ kind: 'Record only' }], []);
  assertEquals(accepted.ok, true);
});

Deno.test('C8 a flow cannot route to a workflow outside this business', () => {
  const refused = validateFlowSteps([{ kind: 'Route to workflow', workflow_definition_id: 'someone-elses' }], ['ours']);
  assertEquals(refused.ok, false);
  const accepted = validateFlowSteps([{ kind: 'Route to workflow', workflow_definition_id: 'ours' }], ['ours']);
  assertEquals(accepted.ok, true);
});

Deno.test('C8 editing steps changes the hash, so a stale validation cannot publish them', async () => {
  const before = await flowContentHash([{ id: 'step-1', kind: 'Record only' }]);
  const after = await flowContentHash([{ id: 'step-1', kind: 'Stop' }]);
  assertEquals(before === after, false);
});

Deno.test('C8 a duplicate step id is refused', () => {
  const refused = validateFlowSteps([{ id: 'step-1', kind: 'Record only' }, { id: 'step-1', kind: 'Stop' }], []);
  assertEquals(refused.ok, false);
});

/* ---------------------------------------------------------------- connectors */

Deno.test('C8 a credential pasted into a connector reference is refused', () => {
  assertEquals(credentialRefProblem('sk_live_51H8abcdefghijklmnop').length > 0, true);
  assertEquals(credentialRefProblem('secret://SLACK_WEBHOOK_URL'), '');
});

Deno.test('C8 a connector endpoint carrying a token is refused', () => {
  assertEquals(endpointProblem('https://api.example.com/hook?token=abc123def456').length > 0, true);
  assertEquals(endpointProblem('Operations Slack channel'), '');
});

/* ---------------------------------------------------------------- permissions */

Deno.test('C8 the fabric is readable only by the compliance review roles', () => {
  assertEquals(Array.isArray(NAV_PERMISSIONS['automation-fabric']), true);
  assertEquals(NAV_PERMISSIONS['automation-fabric'], COMPLIANCE_REVIEW_ROLES);
  assertEquals(COMPLIANCE_REVIEW_ROLES.includes('Team Leader'), false);
});

Deno.test('C8 an unapproved or unassigned user cannot reach the fabric', () => {
  assertEquals(hasApprovedAccess({ role: 'Compliance Manager', access_approved: false }), false);
  assertEquals(hasApprovedAccess({ role: 'Compliance Manager', access_approved: true, account_status: 'Active' }), true);
  const approved = { id: 'u1', role: 'Compliance Manager', access_approved: true, account_status: 'Active', data: { tenant_id: 'business-a' } };
  assertEquals(resolveUserTenantId(approved), 'business-a');
  assertEquals(hasApprovedAccess({ role: 'Compliance Manager', access_approved: true }), false);
});

Deno.test('C8 changing a connector needs a management role, not just compliance review', () => {
  assertEquals(MANAGEMENT_ROLES.length > 0, true);
  const reviewOnly = COMPLIANCE_REVIEW_ROLES.filter((role) => !MANAGEMENT_ROLES.includes(role));
  assertEquals(reviewOnly.length > 0, true);
  assertEquals(reviewOnly.includes('Team Leader'), false);
});

/* ---------------------------------------------------------------- tenancy */

Deno.test('C8 every fabric register is business-owned, so one business cannot read another', () => {
  ['AutomationEventType', 'AutomationSubscription', 'AutomationFlow', 'OrchestrationRule', 'IntegrationConnector', 'IntegrationMessage', 'EventDeliveryAttempt']
    .forEach((entity) => assertEquals(tenantGroupOf(entity), 'business'));
});

Deno.test('C8 a write is stamped with the acting business and a foreign tenant is refused', () => {
  const user = { id: 'u1', role: 'Compliance Manager', access_approved: true, account_status: 'Active', data: { tenant_id: 'business-a' } };
  assertEquals(stampTenantWritePayload({ name: 'Route incidents' }, user).tenant_id, 'business-a');
  assertEquals(stampTenantWritePayload({ name: 'x' }, user, 'business-a').tenant_id, 'business-a');
  let refused = false;
  try {
    stampTenantWritePayload({ tenant_id: 'business-b', name: 'x' }, user);
  } catch {
    refused = true;
  }
  assertEquals(refused, true);
});

/* ---------------------------------------------------------------- catalogue and summary */

Deno.test('C8 the seeded catalogue only uses categories and sensitivities the app declares', () => {
  EVENT_CATALOGUE.forEach((entry) => {
    assertEquals(EVENT_CATEGORIES.includes(entry.category), true);
    assertEquals(SENSITIVITIES.includes(entry.sensitivity), true);
    assertEquals(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(entry.event_key), true);
  });
});

Deno.test('C8 a delivery summary never includes the stored payload or a credential', () => {
  const summary = messageSummary({
    id: 'm1', message_ref: 'MSG-1', trace_id: 'trace-1', event_key: 'incident.created',
    status: 'Delivered', attempts: 1, max_attempts: 3, payload_json: '{}', credential_ref: 'secret://X',
  });
  assertEquals('payload_json' in summary, false);
  assertEquals('credential_ref' in summary, false);
  assertEquals(summary.status, 'Delivered');
});

Deno.test('C8 every message state the fabric can record is a known state', () => {
  assertEquals(MESSAGE_STATES.includes('Dead letter'), true);
  assertEquals(CONNECTOR_KINDS.includes('Webhook'), true);
  assertExists(FABRIC_VERSION);
});