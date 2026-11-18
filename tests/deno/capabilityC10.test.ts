import { assertEquals, assert } from 'jsr:@std/assert@1';
import {
  ENTERPRISE_STRATEGY_VERSION,
  buildRollups,
  buildAuditEntry,
  belongsToTenant,
  capabilityMaturity,
  dueState,
  progressPercent,
  roadmapTransition,
  statusChangeNeedsApproval,
  strategyPermissions,
  validateAssessment,
  validateBenefit,
  validateCapability,
  validateObjective,
  validatePortfolio,
  validateProgram,
  validateReferences,
  validateRoadmap,
} from '../../base44/shared/enterpriseStrategy.ts';
import { tenantGroupOf } from '../../base44/shared/tenantClassification.ts';

const TODAY = '2026-11-18';
const user = (role, extra = {}) => ({
  id: 'u1', role, access_approved: true, account_status: 'Active', data: { tenant_id: 'business-a' }, ...extra,
});

/* ------------------------------------------------------------------ fixtures */

const portfolio = {
  id: 'p1', tenant_id: 'business-a', portfolio_key: 'POR-1', name: 'Quality uplift', sponsor: 'CEO',
  strategy_alignment: 'Strategic priority 2', status: 'Active', review_due: '2026-12-01',
};
const program = {
  id: 'pr1', tenant_id: 'business-a', program_key: 'PRG-1', portfolio_id: 'p1', portfolio_key: 'POR-1',
  name: 'Practice assurance', sponsor: 'COO', status: 'Active', target_date: '2026-11-01',
};
const objectiveA = {
  id: 'o1', tenant_id: 'business-a', objective_key: 'OBJ-1', program_id: 'pr1', program_key: 'PRG-1',
  portfolio_id: 'p1', portfolio_key: 'POR-1',
  name: 'Every file complete', owner: 'Quality Manager', measure: 'Files complete', unit: '%',
  baseline_value: 50, target_value: 100, current_value: 75, due_date: '2026-11-10', status: 'At risk',
};
const objectiveB = {
  id: 'o2', tenant_id: 'business-a', objective_key: 'OBJ-2', program_id: 'pr1', program_key: 'PRG-1',
  portfolio_id: 'p1', portfolio_key: 'POR-1',
  name: 'Hours returned', owner: 'Operations Manager', measure: 'Hours', unit: 'hours',
  baseline_value: 0, target_value: 200, current_value: 200, due_date: '2027-06-01', status: 'Achieved',
};
const objectiveC = {
  id: 'o3', tenant_id: 'business-a', objective_key: 'OBJ-3', program_id: 'pr1', program_key: 'PRG-1',
  portfolio_id: 'p1', portfolio_key: 'POR-1',
  name: 'No measure recorded', owner: 'Nobody', measure: 'Undefined', unit: '',
  baseline_value: null, target_value: null, current_value: null, due_date: '', status: 'Not started',
};
const benefitValidated = {
  id: 'b1', tenant_id: 'business-a', benefit_key: 'BEN-1', objective_id: 'o1', name: 'Assurance',
  baseline_value: 0, target_value: 100, actual_value: 100, valuation_method: 'Compliance assurance',
  valuation_amount: 50000, review_status: 'Validated', evidence_refs_json: '[]',
};
const benefitPending = {
  id: 'b2', tenant_id: 'business-a', benefit_key: 'BEN-2', objective_id: 'o2', name: 'Hours saved',
  baseline_value: 0, target_value: 200, actual_value: 100, valuation_method: 'Efficiency gain',
  valuation_amount: 20000, review_status: 'Under review', evidence_refs_json: '[]',
};
const capability = {
  id: 'c1', tenant_id: 'business-a', capability_key: 'CAP-1', name: 'Incident investigation',
  owner: 'Quality Manager', current_maturity: 3, target_maturity: 5, status: 'Active',
};
const assessments = [
  { id: 'a2', capability_id: 'c1', status: 'Validated', score: 2, assessed_at: '2026-01-01T00:00:00Z', assessor: 'Earlier', evidence_count: 0 },
  { id: 'a1', capability_id: 'c1', status: 'Validated', score: 4, assessed_at: '2026-10-01T00:00:00Z', assessor: 'Quality Manager', evidence_count: 2 },
  { id: 'a3', capability_id: 'c1', status: 'Draft', score: 5, assessed_at: '2026-11-01T00:00:00Z', assessor: 'Draft only', evidence_count: 3 },
];

/* ------------------------------------------------------------------ tenant isolation */

Deno.test('the C10 registers are business owned, so the release-2 lock applies to them', () => {
  for (const name of ['EnterprisePortfolio', 'TransformationProgram', 'StrategyObjective', 'StrategyBenefit',
    'EnterpriseCapability', 'CapabilityMaturityAssessment', 'TransformationRoadmap', 'StrategyAuditRecord']) {
    assertEquals(tenantGroupOf(name), 'business', `${name} must be business owned`);
  }
});

Deno.test('a record from another business is never treated as this business', () => {
  assert(belongsToTenant(portfolio, 'business-a'));
  assert(!belongsToTenant({ ...portfolio, tenant_id: 'business-b' }, 'business-a'));
  assert(!belongsToTenant(null, 'business-a'));
  assert(!belongsToTenant(portfolio, ''));
});

/* ------------------------------------------------------------------ relationships */

Deno.test('a child record is refused when its parent is not in this business', () => {
  assertEquals(validateProgram({ name: 'X', sponsor: 'Y', purpose: 'A real sentence here' }, null).ok, false);
  assertEquals(validateObjective({ name: 'X', owner: 'Y', measure: 'Files', target_value: 5, due_date: '2026-12-01' }, null).ok, false);
  assertEquals(validateBenefit({ name: 'X', target_value: 5, valuation_method: 'Not valued' }, null).ok, false);
  assertEquals(validateAssessment({ score: 3, rationale: 'A long enough rationale here', assessor: 'QA' }, null).ok, false);
  assertEquals(validateRoadmap({ name: 'R', summary: 'A summary sentence.', initiatives: [] }, null).ok, false);
});

Deno.test('portfolio and program details are inherited, so a child cannot point at a different portfolio', () => {
  const objective = validateObjective(
    { name: 'Files complete', owner: 'QM', measure: 'Files complete', target_value: 100, due_date: '2026-12-01' },
    program,
  );
  assert(objective.ok);
  assertEquals(objective.value.portfolio_id, 'p1');
  assertEquals(objective.value.portfolio_key, 'POR-1');
  assertEquals(objective.value.program_id, 'pr1');
  assertEquals(objective.value.linked_records_json, '[]');
});

Deno.test('a linked record must name a register this workspace actually points at', () => {
  assertEquals(validateReferences([{ register: 'Risk', record_id: 'r1' }]).ok, true);
  assertEquals(validateReferences([{ register: 'Risk' }]).ok, false);
  assertEquals(validateReferences([{ register: 'MadeUpRegister', record_id: 'x' }]).ok, false);
});

/* ------------------------------------------------------------------ validation */

Deno.test('a portfolio needs a sponsor and a stated alignment', () => {
  assertEquals(validatePortfolio({ name: 'Portfolio', sponsor: '', strategy_alignment: 'short' }).ok, false);
  const good = validatePortfolio({ name: 'Portfolio', sponsor: 'CEO', strategy_alignment: 'Serves strategic priority 2' });
  assert(good.ok);
  assertEquals(good.value.status, 'Draft');
});

Deno.test('a target can never fall before the start date and maturity must be 1 to 5', () => {
  assertEquals(validateProgram({ name: 'P', sponsor: 'S', purpose: 'A real sentence here', start_date: '2026-05-01', target_date: '2026-04-01' }, portfolio).ok, false);
  assertEquals(validateCapability({ name: 'C', owner: 'O', current_maturity: 6, target_maturity: 5, evidence_basis: 'A real basis sentence' }).ok, false);
  assert(validateCapability({ name: 'C', owner: 'O', current_maturity: 2, target_maturity: 4, evidence_basis: 'A real basis sentence' }).ok);
});

Deno.test('a valued benefit needs its amount, and a validated benefit needs an owner', () => {
  const base = { name: 'Benefit', target_value: 10, valuation_method: 'Cost avoided', review_status: 'Validated' };
  assertEquals(validateBenefit(base, objectiveA).ok, false);
  assertEquals(validateBenefit({ ...base, valuation_amount: 500, owner: '' }, objectiveA).ok, false);
  const good = validateBenefit({ ...base, valuation_amount: 500, owner: 'Finance' }, objectiveA);
  assert(good.ok);
  assertEquals(good.value.portfolio_id, 'p1');
});

Deno.test('a maturity of 4 or 5 cannot be recorded without evidence', () => {
  const four = { score: 4, assessor: 'QA', rationale: 'Evidence shows this is managed consistently.' };
  assertEquals(validateAssessment(four, capability).ok, false);
  const withEvidence = validateAssessment({
    ...four, evidence_refs: [{ register: 'AssuranceEvidence', record_id: 'e1' }],
  }, capability);
  assert(withEvidence.ok);
  assertEquals(withEvidence.value.evidence_count, 1);
  assert(validateAssessment({ score: 3, assessor: 'QA', rationale: 'Defined practice, not yet measured.' }, capability).ok);
});

Deno.test('a roadmap needs initiatives, and a dependency must point at one of them', () => {
  assertEquals(validateRoadmap({ name: 'R', summary: 'A summary sentence.' , initiatives: [] }, program).ok, false);
  const initiative = { key: 'INIT-1', name: 'Roll out', owner: 'PM', due_date: '2026-12-01', status: 'Planned' };
  const orphan = validateRoadmap({ name: 'R', summary: 'A summary sentence.', initiatives: [initiative], dependencies: [{ from: 'INIT-1', to: 'INIT-9' }] }, program);
  assertEquals(orphan.ok, false);
  const good = validateRoadmap({ name: 'R', summary: 'A summary sentence.', initiatives: [initiative], milestones: [{ name: 'Go live', due_date: '2026-12-15' }] }, program);
  assert(good.ok);
  assertEquals(good.value.initiative_count, 1);
  assertEquals(good.value.milestone_count, 1);
});

/* ------------------------------------------------------------------ rollups */

Deno.test('progress is calculated from real measures and is unknown when a measure is missing', () => {
  assertEquals(progressPercent({ baseline: 50, target: 100, actual: 75 }), 50);
  assertEquals(progressPercent({ baseline: 0, target: 200, actual: 200 }), 100);
  assertEquals(progressPercent({ baseline: 50, target: 100, actual: null }), null);
  assertEquals(progressPercent({ target: 100, actual: 25 }), 25);
  assertEquals(progressPercent({ baseline: 0, target: 100, actual: 400 }), 100);
});

Deno.test('due state comes from the stored date only', () => {
  assertEquals(dueState('2026-11-01', TODAY), 'Overdue');
  assertEquals(dueState('2026-12-01', TODAY), 'Due soon');
  assertEquals(dueState('2027-06-01', TODAY), 'On track');
  assertEquals(dueState('', TODAY), 'No date');
});

Deno.test('portfolio to program to objective to benefit rolls up from stored records', () => {
  const rollup = buildRollups({
    portfolios: [portfolio],
    programs: [program],
    objectives: [objectiveA, objectiveB, objectiveC],
    benefits: [benefitValidated, benefitPending],
    capabilities: [capability],
    assessments,
    today: TODAY,
  });

  const portfolioRow = rollup.portfolios[0];
  assertEquals(portfolioRow.programCount, 1);
  assertEquals(portfolioRow.objectiveCount, 3);
  assertEquals(portfolioRow.benefitCount, 2);
  assertEquals(portfolioRow.progress, 75);
  assertEquals(portfolioRow.overdueObjectives, 1);
  assertEquals(portfolioRow.achievedObjectives, 1);
  // Only the validated benefit is valued; the one under review is not.
  assertEquals(portfolioRow.benefitValue, 50000);
  assertEquals(portfolioRow.realisedValue, 50000);
  assertEquals(portfolioRow.programs[0].objectives.find((row) => row.id === 'o3').progress, null);

  assertEquals(rollup.totals.objectives, 3);
  assertEquals(rollup.totals.validatedBenefits, 1);
  assertEquals(rollup.totals.overdueObjectives, 1);
  assertEquals(rollup.totals.benefitValue, 50000);
  assertEquals(rollup.totals.progress, 75);
  assertEquals(rollup.dueObjectives.map((row) => row.id), ['o1']);
  assertEquals(rollup.dueObjectives[0].portfolio_id, 'p1');
  assertEquals(rollup.dueObjectives[0].program_name, 'Practice assurance');
});

Deno.test('capability maturity comes from the latest validated assessment and stays evidence labelled', () => {
  const view = capabilityMaturity(capability, assessments);
  assertEquals(view.current, 4);
  assertEquals(view.target, 5);
  assertEquals(view.gap, 1);
  assertEquals(view.evidenceBacked, true);
  assertEquals(view.assessor, 'Quality Manager');
  assertEquals(view.basis, 'Validated assessment with evidence');

  const withoutEvidence = capabilityMaturity(capability, [assessments[0]]);
  assertEquals(withoutEvidence.current, 2);
  assertEquals(withoutEvidence.evidenceBacked, false);
  assertEquals(withoutEvidence.basis, 'Validated assessment without evidence');

  const declared = capabilityMaturity(capability, []);
  assertEquals(declared.current, 3);
  assertEquals(declared.evidenceBacked, false);
  assertEquals(declared.basis, 'Self-declared, not yet assessed');
});

Deno.test('an empty workspace rolls up to zero rather than invented numbers', () => {
  const rollup = buildRollups({ today: TODAY });
  assertEquals(rollup.portfolios, []);
  assertEquals(rollup.totals.objectives, 0);
  assertEquals(rollup.totals.progress, null);
  assertEquals(rollup.totals.benefitValue, 0);
  assertEquals(rollup.dueObjectives, []);
});

/* ------------------------------------------------------------------ permissions */

Deno.test('permission denial: an employee cannot read or edit strategy, and only management approves', () => {
  assertEquals(strategyPermissions(user('Employee')).read, false);
  assertEquals(strategyPermissions(user('Employee')).edit, false);
  assertEquals(strategyPermissions(user('Employee')).approve, false);
  assertEquals(strategyPermissions(user('Support Worker')).read, false);
  assertEquals(strategyPermissions({ ...user('Management'), access_approved: false }).read, false);

  const administration = strategyPermissions(user('Administration'));
  assertEquals(administration.read, true);
  assertEquals(administration.edit, true);
  assertEquals(administration.approve, false);

  const management = strategyPermissions(user('Management'));
  assertEquals(management.approve, true);
  assertEquals(strategyPermissions(user('admin')).approve, true);
});

Deno.test('only status changes that set work in motion need approval', () => {
  assertEquals(statusChangeNeedsApproval('EnterprisePortfolio', 'Active'), true);
  assertEquals(statusChangeNeedsApproval('TransformationProgram', 'Closed'), true);
  assertEquals(statusChangeNeedsApproval('StrategyObjective', 'Achieved'), true);
  assertEquals(statusChangeNeedsApproval('StrategyBenefit', 'Paused'), false);
  assertEquals(statusChangeNeedsApproval('EnterpriseCapability', 'Active'), false);
  assertEquals(statusChangeNeedsApproval('TransformationRoadmap', 'Approved'), true);
  assertEquals(statusChangeNeedsApproval('TransformationRoadmap', 'Submitted'), false);
});

Deno.test('a roadmap is approved only once submitted, with a reason, by someone else', () => {
  const submitted = { id: 'rm1', status: 'Submitted', author_id: 'author-1', author: 'Author' };
  const draft = { ...submitted, status: 'Draft' };

  assertEquals(roadmapTransition({ roadmap: draft, outcome: 'Approved', reason: 'Approved by the board', approverId: 'u9', approverName: 'COO' }).ok, false);
  assertEquals(roadmapTransition({ roadmap: submitted, outcome: 'Approved', reason: 'short', approverId: 'u9', approverName: 'COO' }).ok, false);

  const selfApproval = roadmapTransition({ roadmap: submitted, outcome: 'Approved', reason: 'Approved by the board', approverId: 'author-1', approverName: 'Author' });
  assertEquals(selfApproval.ok, false);

  const override = roadmapTransition({
    roadmap: submitted, outcome: 'Approved', reason: 'Approved by the board', approverId: 'author-1', approverName: 'Author', isAdministrator: true,
  });
  assert(override.ok);
  assertEquals(override.value.approval_authority, 'Administrator override');
  assertEquals(override.value.self_approved, true);

  const independent = roadmapTransition({
    roadmap: submitted, outcome: 'Approved', reason: 'Approved by the board', approverId: 'manager-9', approverName: 'COO',
  });
  assert(independent.ok);
  assertEquals(independent.value.status, 'Approved');
  assertEquals(independent.value.approval_authority, 'Independent reviewer');
  assertEquals(independent.value.self_approved, false);
});

/* ------------------------------------------------------------------ audit */

Deno.test('every audit entry is redacted and hash chained to the one before it', async () => {
  const first = await buildAuditEntry({
    occurredAt: '2026-11-18T00:00:00.000Z',
    action: 'Portfolio created',
    subjectType: 'EnterprisePortfolio',
    subject: portfolio,
    detail: { name: 'Quality uplift', api_key: 'sk-live-abcdef123456' },
    actor: 'Quality Manager',
    actorId: 'u1',
    actorRole: 'Quality & Improvement Manager',
  });

  assertEquals(first.subject_ref, 'POR-1');
  assertEquals(first.subject_id, 'p1');
  assertEquals(first.outcome, 'Recorded');
  assert(first.redacted_count >= 1);
  assert(!first.detail.includes('sk-live-abcdef123456'));
  assert(first.chain_hash.length > 10);

  const second = await buildAuditEntry({
    previousHash: first.chain_hash,
    occurredAt: '2026-11-18T00:05:00.000Z',
    action: 'Portfolio status refused',
    subjectType: 'EnterprisePortfolio',
    subject: portfolio,
    detail: { requested: 'Active', message: 'Approval required' },
    outcome: 'Refused',
    actor: 'Administration',
    actorId: 'u2',
  });

  assertEquals(second.previous_hash, first.chain_hash);
  assert(second.chain_hash !== first.chain_hash);
  assertEquals(second.outcome, 'Refused');
});

Deno.test('the strategy version is reported with every payload', () => {
  assertEquals(ENTERPRISE_STRATEGY_VERSION.startsWith('C10'), true);
});