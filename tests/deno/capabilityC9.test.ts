import { assertEquals } from 'jsr:@std/assert@1';
import {
  AI_WORKFORCE_VERSION,
  TOOL_KINDS,
  AUTONOMOUS_ELIGIBLE_KINDS,
  FORBIDDEN_AUTONOMOUS_KINDS,
  ASSIGNMENT_POLICIES,
  DECISION_STATES,
  EXECUTION_STATES,
  MODEL_STATUSES,
  PROVIDERS,
  riskOfKind,
  autonomousEligible,
  providerProblem,
  credentialReferenceProblem,
  validateModelSettings,
  promptGuardrailProblem,
  validateToolPolicy,
  decidePolicy,
  reviewTransition,
  redactText,
  redactRecord,
  chainHash,
  decisionSummary,
  confidenceBand,
} from '../../base44/shared/aiWorkforce.ts';
import { getOwn, pageOf, refuse, Refusal } from '../../base44/shared/serviceKit.ts';
import {
  canComplianceReview,
  canManagementAct,
  hasApprovedAccess,
  NAV_PERMISSIONS,
  resolveUserTenantId,
} from '../../base44/shared/roleMatrix.ts';
import { tenantGroupOf } from '../../base44/shared/tenantClassification.ts';

const approved = (role = 'Compliance Manager') => ({
  id: 'u1', role, access_approved: true, account_status: 'Active', data: { tenant_id: 'business-a' },
});

const grant = (overrides = {}) => ({
  id: 'g1', status: 'Active', policy: 'Allowed internal', tool_kind: 'Read internal record',
  idempotency_required: false, ...overrides,
});

/* ---------------------------------------------------------------- tenancy */

Deno.test('C9 every AI workforce register is business-owned', () => {
  ['AiWorkforceModel', 'AiWorkforceAgent', 'AiPromptVersion', 'AiTool', 'AiAgentToolAssignment',
    'AiDecisionRecord', 'AiDecisionReview', 'AiAuditRecord']
    .forEach((entity) => assertEquals(tenantGroupOf(entity), 'business'));
});

Deno.test('C9 a record belonging to another business reads as not found', async () => {
  const dao = { get: async () => ({ id: 'r1', tenant_id: 'business-b' }) };
  assertEquals(await getOwn(dao, 'r1', 'business-a'), null);
  assertEquals((await getOwn(dao, 'r1', 'business-b'))?.id, 'r1');
});

Deno.test('C9 a bounded read returns rows whether the SDK returns a page or an array', async () => {
  const paged = { filter: async () => ({ items: [{ id: 'a' }], next_cursor: null, has_more: false }) };
  const plain = { filter: async () => [{ id: 'b' }] };
  assertEquals((await pageOf(paged, { tenant_id: 'business-a' })).length, 1);
  assertEquals((await pageOf(plain, { tenant_id: 'business-a' })).length, 1);
  assertEquals(await pageOf({ filter: async () => ({}) }, {}), []);
});

Deno.test('C9 a refusal carries the status the client should see', () => {
  let caught: any = null;
  try { refuse('That model is not in your business.', 404); } catch (error) { caught = error; }
  assertEquals(caught instanceof Refusal, true);
  assertEquals(caught.status, 404);
});

/* ---------------------------------------------------------------- permissions */

Deno.test('C9 the AI workforce is closed to unapproved and non-review roles', () => {
  assertEquals(NAV_PERMISSIONS['ai-workforce'].includes('Employee'), false);
  assertEquals(NAV_PERMISSIONS['ai-workforce'].includes('Participant'), false);
  assertEquals(NAV_PERMISSIONS['ai-workforce'].includes('Team Leader'), false);
  assertEquals(NAV_PERMISSIONS['ai-workforce'].includes('Compliance Manager'), true);
  assertEquals(canComplianceReview(approved('Employee')), false);
  assertEquals(canComplianceReview({ role: 'Compliance Manager', access_approved: false }), false);
  assertEquals(canComplianceReview(approved()), true);
  assertEquals(hasApprovedAccess({ role: 'Compliance Manager', access_approved: true }), false);
});

Deno.test('C9 only management can grant a tool or touch provider settings', () => {
  assertEquals(canManagementAct(approved('Compliance Manager')), false);
  assertEquals(canManagementAct(approved('Management')), true);
  assertEquals(canManagementAct(approved('admin')), true);
  assertEquals(resolveUserTenantId(approved()), 'business-a');
  let threw = false;
  try { resolveUserTenantId({ role: 'Compliance Manager', access_approved: true }); } catch { threw = true; }
  assertEquals(threw, true);
});

/* ---------------------------------------------------------------- model settings */

Deno.test('C9 model settings accept a real provider with a secret reference', () => {
  const result = validateModelSettings({
    provider: 'OpenAI', provider_model_id: 'a-current-model-id', credential_ref: 'secret://OPENAI_API_KEY',
    context_window: 128000, sensitivity_ceiling: 'Internal',
  });
  assertEquals(result.ok, true);
  assertEquals(result.value?.credential_ref, 'secret://OPENAI_API_KEY');
  assertEquals(result.value?.context_window, 128000);
});

Deno.test('C9 a pasted credential is refused and only a secret name is accepted', () => {
  assertEquals(credentialReferenceProblem('') !== '', true);
  assertEquals(credentialReferenceProblem('sk_live_abcdef1234567890') !== '', true);
  assertEquals(credentialReferenceProblem('OPENAI_API_KEY') !== '', true);
  assertEquals(credentialReferenceProblem('secret://OPENAI_API_KEY'), '');
});

Deno.test('C9 an unknown provider or an impossible context window is refused', () => {
  assertEquals(providerProblem('Some New Provider') !== '', true);
  PROVIDERS.forEach((provider) => assertEquals(providerProblem(provider), ''));
  const bad = validateModelSettings({
    provider: 'OpenAI', provider_model_id: 'x', credential_ref: 'secret://OPENAI_API_KEY', context_window: 12,
  });
  assertEquals(bad.ok, false);
  const secretInId = validateModelSettings({
    provider: 'OpenAI', provider_model_id: 'sk_live_abcdef1234567890', credential_ref: 'secret://OPENAI_API_KEY', context_window: 8000,
  });
  assertEquals(secretInId.ok, false);
});

/* ---------------------------------------------------------------- prompts */

Deno.test('C9 a prompt must carry the human-review guardrail', () => {
  assertEquals(promptGuardrailProblem('Summarise this.') !== '', true);
  assertEquals(promptGuardrailProblem('Draft a recommendation from the records supplied and return it to the reviewer.') !== '', true);
  assertEquals(promptGuardrailProblem('Read the records and produce a summary of the incident register for the week.') !== '', true);
  const good = 'Read the records supplied and draft a recommendation. Your output is a recommendation only: a human reviewer must approve it before anyone acts on it.';
  assertEquals(promptGuardrailProblem(good), '');
});

Deno.test('C9 a prompt cannot smuggle a credential', () => {
  const withKey = 'Draft a recommendation for the reviewer, a human must approve it. Use the key sk_live_abcdef1234567890 when calling the provider.';
  assertEquals(promptGuardrailProblem(withKey) !== '', true);
});

/* ---------------------------------------------------------------- tools and grants */

Deno.test('C9 the risk and autonomy of a tool come from its kind, not from the screen', () => {
  assertEquals(riskOfKind('Read internal record'), 'Low');
  assertEquals(riskOfKind('Write internal record'), 'Medium');
  assertEquals(riskOfKind('Financial'), 'High');
  assertEquals(riskOfKind('Permission change'), 'Critical');
  assertEquals(riskOfKind('Something invented'), 'Critical');
  assertEquals(autonomousEligible('Read internal record'), true);
  TOOL_KINDS.forEach((kind) => {
    if (FORBIDDEN_AUTONOMOUS_KINDS.includes(kind)) assertEquals(autonomousEligible(kind), false);
  });
  FORBIDDEN_AUTONOMOUS_KINDS.forEach((kind) => assertEquals(TOOL_KINDS.includes(kind), true));
});

Deno.test('C9 no forbidden kind can ever be granted internal autonomy', () => {
  FORBIDDEN_AUTONOMOUS_KINDS.forEach((kind) => {
    const result = validateToolPolicy({ kind, policy: 'Allowed internal', idempotency_supported: true });
    assertEquals(result.ok, false);
    assertEquals(result.autonomous_allowed, false);
    assertEquals(result.requires_human_approval, true);
  });
  ASSIGNMENT_POLICIES.forEach((policy) => {
    const result = validateToolPolicy({ kind: 'Financial', policy, idempotency_supported: true });
    if (policy === 'Allowed internal') assertEquals(result.ok, false);
    else assertEquals(result.ok, true);
  });
});

Deno.test('C9 an internal grant needs a low-risk kind and idempotency', () => {
  const read = validateToolPolicy({ kind: 'Read internal record', policy: 'Allowed internal', idempotency_supported: true });
  assertEquals(read.ok, true);
  assertEquals(read.requires_human_approval, false);
  const write = validateToolPolicy({ kind: 'Write internal record', policy: 'Allowed internal', idempotency_supported: false });
  assertEquals(write.ok, false);
  const writeWithKey = validateToolPolicy({ kind: 'Write internal record', policy: 'Allowed internal', idempotency_supported: true });
  assertEquals(writeWithKey.ok, true);
  const bogus = validateToolPolicy({ kind: 'Read internal record', policy: 'Anything', idempotency_supported: true });
  assertEquals(bogus.ok, false);
});

/* ---------------------------------------------------------------- policy decisions */

Deno.test('C9 a paused or disabled agent cannot proceed, and that is a safe failure', () => {
  ['Paused', 'Disabled', 'Draft', 'Archived'].forEach((agentStatus) => {
    const decision = decidePolicy({ agentStatus, autonomyLevel: 'Internal actions permitted', assignment: grant(), confidence: 90 });
    assertEquals(decision.verdict, 'Blocked');
    assertEquals(decision.status, 'Safe failure');
    assertEquals(decision.executionState, 'Refused');
    assertEquals(decision.allowedAutonomously, false);
  });
});

Deno.test('C9 a proposal with no grant, a denied grant or a disabled grant is refused', () => {
  assertEquals(decidePolicy({ agentStatus: 'Active', autonomyLevel: 'Internal actions permitted', assignment: null, confidence: 90 }).status, 'Blocked');
  assertEquals(decidePolicy({ agentStatus: 'Active', assignment: grant({ policy: 'Denied' }), confidence: 90 }).status, 'Blocked');
  assertEquals(decidePolicy({ agentStatus: 'Active', assignment: grant({ status: 'Disabled' }), confidence: 90 }).status, 'Blocked');
});

Deno.test('C9 an external action always waits for a person, whatever the autonomy setting', () => {
  const decision = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Internal actions permitted',
    assignment: grant({ policy: 'Propose only', tool_kind: 'External API' }), toolKind: 'External API', confidence: 99,
  });
  assertEquals(decision.verdict, 'Human approval required');
  assertEquals(decision.status, 'Awaiting human review');
  assertEquals(decision.executionState, 'Not executed');
  assertEquals(decision.allowedAutonomously, false);
});

Deno.test('C9 suggest-only keeps even a permitted internal step with a person', () => {
  const decision = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Suggest only', assignment: grant(), toolKind: 'Read internal record', confidence: 95,
  });
  assertEquals(decision.verdict, 'Human approval required');
  assertEquals(decision.status, 'Awaiting human review');
});

Deno.test('C9 a low-risk internal step is recorded, never executed', () => {
  const decision = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Internal actions permitted', assignment: grant(),
    toolKind: 'Read internal record', idempotencyKey: 'run-1', confidence: 88,
  });
  assertEquals(decision.verdict, 'Internal action permitted');
  assertEquals(decision.status, 'Permitted internal');
  assertEquals(decision.allowedAutonomously, true);
  assertEquals(decision.executionState, 'Recorded only');
  assertEquals(EXECUTION_STATES.includes(decision.executionState), true);
  assertEquals(['Not executed', 'Recorded only', 'Refused'].includes(decision.executionState), true);
});

Deno.test('C9 low confidence or a missing idempotency key sends the step to a person', () => {
  const lowConfidence = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Internal actions permitted', assignment: grant(), confidence: 20,
  });
  assertEquals(lowConfidence.status, 'Awaiting human review');
  const noKey = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Internal actions permitted',
    assignment: grant({ idempotency_required: true }), toolKind: 'Write internal record', confidence: 90,
  });
  assertEquals(noKey.status, 'Awaiting human review');
});

Deno.test('C9 a higher-risk internal write with an approval grant waits for a person', () => {
  const decision = decidePolicy({
    agentStatus: 'Active', autonomyLevel: 'Internal actions permitted',
    assignment: grant({ policy: 'Allowed with approval', tool_kind: 'Write internal record' }),
    toolKind: 'Write internal record', idempotencyKey: 'k', confidence: 95,
  });
  assertEquals(decision.status, 'Awaiting human review');
  assertEquals(decision.allowedAutonomously, false);
});

/* ---------------------------------------------------------------- human review */

const awaiting = () => ({
  id: 'd1', status: 'Awaiting human review', requested_by_id: 'u1', decision_ref: 'AID-1', policy_verdict: 'Human approval required',
});

Deno.test('C9 a permitted reviewer approves, and the AI still executed nothing', () => {
  const result = reviewTransition({
    decision: awaiting(), outcome: 'Approved', reason: 'Evidence supports the recommendation, action assigned to me.',
    reviewerName: 'Reviewer Two', reviewerId: 'u2', reviewerRole: 'Compliance Manager',
  });
  assertEquals(result.ok, true);
  assertEquals(result.patch?.status, 'Approved');
  assertEquals(result.patch?.review_outcome, 'Approved');
  assertEquals(result.patch?.execution_state, 'Not executed');
  assertEquals(result.patch?.override_reason, '');
});

Deno.test('C9 an override needs its own reason and keeps both reasons', () => {
  const missing = reviewTransition({
    decision: awaiting(), outcome: 'Overridden', reason: 'The recommendation is too narrow for this incident.',
    reviewerName: 'Reviewer Two', reviewerId: 'u2',
  });
  assertEquals(missing.ok, false);
  const ok = reviewTransition({
    decision: awaiting(), outcome: 'Overridden', reason: 'The recommendation is too narrow for this incident.',
    overrideReason: 'Widen the review to the whole site and re-test the control.', reviewerName: 'Reviewer Two', reviewerId: 'u2',
  });
  assertEquals(ok.ok, true);
  assertEquals(ok.patch?.override_reason.includes('Widen the review'), true);
});

Deno.test('C9 a reviewer cannot approve their own AI proposal', () => {
  const result = reviewTransition({
    decision: awaiting(), outcome: 'Approved', reason: 'I recorded it and I also approve it, which is not independent.',
    reviewerName: 'Same Person', reviewerId: 'u1',
  });
  assertEquals(result.ok, false);
  assertEquals(result.errors.join(' ').includes('own AI proposal'), true);
});

Deno.test('C9 a bare reason, an unknown outcome or a settled decision cannot be reviewed', () => {
  assertEquals(reviewTransition({ decision: awaiting(), outcome: 'Approved', reason: 'ok', reviewerId: 'u2' }).ok, false);
  assertEquals(reviewTransition({ decision: awaiting(), outcome: 'Maybe', reason: 'A long enough reason here.', reviewerId: 'u2' }).ok, false);
  assertEquals(reviewTransition({
    decision: { ...awaiting(), status: 'Blocked' }, outcome: 'Approved', reason: 'A long enough reason here.', reviewerId: 'u2',
  }).ok, false);
  assertEquals(reviewTransition({
    decision: { ...awaiting(), status: 'Permitted internal' }, outcome: 'Approved', reason: 'A long enough reason here.', reviewerId: 'u2',
  }).ok, false);
});

/* ---------------------------------------------------------------- redaction */

Deno.test('C9 secrets and identifiers are removed from free text', () => {
  const result = redactText('Escalate to jane.doe@example.com or 0412 345 678. Header was Bearer abcdefghijklmnop and key sk_live_abcdef1234567890.');
  assertEquals(result.text.includes('jane.doe'), false);
  assertEquals(result.text.includes('0412'), false);
  assertEquals(result.text.includes('abcdefghijklmnop'), false);
  assertEquals(result.text.includes('sk_live'), false);
  assertEquals(result.redactions.length > 0, true);
});

Deno.test('C9 a stored record never carries a credential or a participant identifier', () => {
  const result = redactRecord({
    incident_ref: 'INC-1042',
    api_key: 'abc',
    participant_name: 'A real person',
    contact: { email: 'someone@example.com', phone: '0400 000 000' },
    note: 'Reviewed the register',
  });
  const stored = result.value as any;
  assertEquals(stored.api_key, '[redacted]');
  assertEquals(stored.participant_name, '[redacted]');
  assertEquals(stored.contact.email, '[redacted]');
  assertEquals(stored.incident_ref, 'INC-1042');
  assertEquals(result.redactedCount >= 4, true);
  assertEquals(result.redactedFields.includes('api_key'), true);
});

Deno.test('C9 a decision summary never exposes a raw payload or credential field', () => {
  const summary = decisionSummary({
    id: 'd1', decision_ref: 'AID-1', agent_name: 'Agent', status: 'Awaiting human review',
    policy_verdict: 'Human approval required', execution_state: 'Not executed',
    payload_json: '{}', credential_ref: 'secret://X', prompt_hash: 'sha256:abc',
  }) as any;
  assertEquals('payload_json' in summary, false);
  assertEquals('credential_ref' in summary, false);
  assertEquals(summary.execution_state, 'Not executed');
  assertEquals(confidenceBand(10), 'Low');
  assertEquals(confidenceBand(60), 'Moderate');
  assertEquals(confidenceBand(95), 'High');
});

/* ---------------------------------------------------------------- audit integrity */

Deno.test('C9 the audit chain changes when the entry or its predecessor changes', async () => {
  const first = await chainHash('', { action: 'AI agent registered', subject_ref: 'AGT-1' });
  const same = await chainHash('', { action: 'AI agent registered', subject_ref: 'AGT-1' });
  const changedEntry = await chainHash('', { action: 'AI agent registered', subject_ref: 'AGT-2' });
  const changedPrevious = await chainHash(first, { action: 'AI agent registered', subject_ref: 'AGT-1' });
  assertEquals(first, same);
  assertEquals(first === changedEntry, false);
  assertEquals(first === changedPrevious, false);
  assertEquals(first.startsWith('sha256:') || first.startsWith('fnv1a64:'), true);
});

Deno.test('C9 the module declares the states and versions it actually uses', () => {
  assertEquals(AI_WORKFORCE_VERSION, 'c9-1.0.0');
  assertEquals(DECISION_STATES.includes('Awaiting human review'), true);
  assertEquals(DECISION_STATES.includes('Safe failure'), true);
  assertEquals(MODEL_STATUSES.includes('Validated'), true);
  assertEquals(AUTONOMOUS_ELIGIBLE_KINDS.length, 2);
  assertEquals(AUTONOMOUS_ELIGIBLE_KINDS.includes('Financial'), false);
});