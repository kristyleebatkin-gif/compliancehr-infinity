import type {
  Assessment,
  Audit,
  Capa,
  Competency,
  Control,
  Evidence,
  Finding,
  Framework,
  IsoDate,
  Outcome,
  Owner,
  Policy,
  Procedure,
  RecordId,
  Requirement,
  Review,
  RiskRecord,
  Standard,
  Training,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStep,
} from '../../types/index.ts';
import { riskRating } from '../../types/risk.ts';

/**
 * Fixture factories.
 *
 * Every factory fills a complete, schema-valid record from a small override, so a dataset reads
 * as the intent it encodes (`makeControl({ status: 'retired' })`) instead of fifty lines of
 * boilerplate. Ids come from per-prefix counters, so two runs of the same factory produce the
 * same ids; call `resetFixtureIds()` before building a dataset to make a run reproducible.
 */

/** The date every fixture is written around. Runners take `today`, so results are repeatable. */
export const FIXTURE_TODAY: IsoDate = '2026-11-17';

/** Fixed build instant, so a snapshot of a dataset is byte-identical between runs. */
export const FIXTURE_BUILT_ON = '2026-11-17T00:00:00.000Z';

const counters = new Map<string, number>();

/** Next id for a prefix, three digits, e.g. `ctl-004`. */
export function nextId(prefix: string): RecordId {
  const next = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, next);
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

/** Forget every counter. Datasets call this first so their ids never depend on call order. */
export function resetFixtureIds(): void {
  counters.clear();
}

/** `date` shifted by whole days, in UTC. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const base = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(base)) throw new Error(`addDays() needs an ISO date, got ${date}`);
  return new Date(base + days * 86_400_000).toISOString().slice(0, 10);
}

export function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    id: nextId('fw'),
    code: 'NDIS',
    label: 'NDIS Practice Standards',
    legislation: 'National Disability Insurance Scheme Act 2013 (Cth)',
    version: '2025.1',
    effectiveFrom: '2025-11-01',
    reviewDue: addDays(FIXTURE_TODAY, 180),
    ...overrides,
  };
}

export function makeStandard(overrides: Partial<Standard> = {}): Standard {
  return {
    id: nextId('std'),
    framework: 'NDIS',
    code: 'Core 1.1',
    title: 'Person-centred supports',
    moduleArea: 'Core Module',
    outcome: 'Each participant receives supports that are safe, effective and tailored to their needs and goals.',
    effectiveFrom: '2025-11-01',
    reviewDue: addDays(FIXTURE_TODAY, 180),
    status: 'active',
    ...overrides,
  };
}

export function makeRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: nextId('req'),
    standardId: nextId('std'),
    framework: 'NDIS',
    code: 'Core 1.1',
    obligation: 'Plan supports with the participant.',
    requirement: 'Supports are developed with each participant, in a way the participant understands.',
    mandatory: true,
    evidenceExpectation: 'A signed support plan recording the participant’s choices, reviewed on schedule.',
    ownerRole: 'Support Coordinator',
    ...overrides,
  };
}

export function makeOutcome(overrides: Partial<Outcome> = {}): Outcome {
  return {
    id: nextId('out'),
    requirementId: nextId('req'),
    statement: 'The participant can describe how their supports reflect what matters to them.',
    beneficiary: 'participant',
    indicator: 'Support plan content matches the participant’s stated goals at review.',
    status: 'met',
    source: 'recorded',
    ...overrides,
  };
}

export function makeOwner(overrides: Partial<Owner> = {}): Owner {
  return {
    id: nextId('own'),
    name: 'Operations Manager',
    role: 'Management',
    department: 'Operations',
    email: null,
    accountableFor: ['control'],
    active: true,
    ...overrides,
  };
}

export function makePolicy(overrides: Partial<Policy> = {}): Policy {
  return {
    id: nextId('pol'),
    title: 'Person-centred supports policy',
    framework: 'NDIS',
    standardCodes: ['Core 1.1'],
    version: '3.0',
    approvedBy: 'Chief Executive Officer',
    approvedOn: '2026-02-01',
    reviewDue: addDays(FIXTURE_TODAY, 200),
    status: 'active',
    ...overrides,
  };
}

export function makeProcedure(overrides: Partial<Procedure> = {}): Procedure {
  return {
    id: nextId('proc'),
    policyId: null,
    title: 'Support planning conversation',
    steps: ['Confirm the participant’s goals', 'Record choices and consent', 'Approve and issue the plan'],
    ownerRole: 'Support Coordinator',
    reviewDue: addDays(FIXTURE_TODAY, 200),
    status: 'active',
    ...overrides,
  };
}

export function makeTraining(overrides: Partial<Training> = {}): Training {
  return {
    id: nextId('trn'),
    title: 'Worker orientation and safety',
    moduleCode: 'MOD-ORI-01',
    mandatedBy: ['Module 2A'],
    refresherMonths: 12,
    ownerRole: 'Workforce Manager',
    status: 'active',
    ...overrides,
  };
}

export function makeCompetency(overrides: Partial<Competency> = {}): Competency {
  return {
    id: nextId('cmp'),
    trainingId: nextId('trn'),
    holder: 'Worker',
    role: 'Support Worker',
    required: true,
    assessedOn: '2026-06-01',
    expiresOn: addDays(FIXTURE_TODAY, 120),
    assessor: 'Workforce Manager',
    ...overrides,
  };
}

export function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: nextId('asm'),
    controlId: nextId('ctl'),
    assessedOn: addDays(FIXTURE_TODAY, -45),
    assessor: 'Quality Manager',
    method: 'sampling',
    sampleSize: 10,
    score: 90,
    findings: 0,
    ...overrides,
  };
}

export function makeControl(overrides: Partial<Control> = {}): Control {
  return {
    id: nextId('ctl'),
    requirementIds: [],
    framework: 'NDIS',
    statement: 'Support plans are co-designed with the participant and reviewed on schedule.',
    type: 'preventive',
    cadence: 'quarterly',
    ownerId: null,
    policyId: null,
    procedureIds: [],
    trainingIds: [],
    evidenceRequired: true,
    lastTestedOn: addDays(FIXTURE_TODAY, -60),
    nextTestOn: addDays(FIXTURE_TODAY, 35),
    status: 'active',
    ...overrides,
  };
}

export function makeEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: nextId('ev'),
    controlId: null,
    requirementId: null,
    title: 'Evidence record',
    type: 'document',
    source: 'Document vault',
    ownerId: null,
    collectedOn: addDays(FIXTURE_TODAY, -30),
    validFrom: addDays(FIXTURE_TODAY, -30),
    validTo: addDays(FIXTURE_TODAY, 200),
    confidence: 90,
    verificationStatus: 'verified',
    verifiedBy: 'Quality Manager',
    verifiedOn: addDays(FIXTURE_TODAY, -20),
    fileRef: null,
    provenance: 'fixture',
    ...overrides,
  };
}

export function makeAudit(overrides: Partial<Audit> = {}): Audit {
  return {
    id: nextId('aud'),
    framework: 'NDIS',
    scope: 'Core Module',
    standardIds: [],
    plannedFor: addDays(FIXTURE_TODAY, -40),
    completedOn: addDays(FIXTURE_TODAY, -35),
    auditor: 'Quality Manager',
    independence: 'internal',
    method: 'sampling',
    status: 'complete',
    ...overrides,
  };
}

export function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: nextId('fnd'),
    auditId: null,
    controlId: null,
    standardId: null,
    title: 'Finding',
    rating: 'observation',
    severity: 'medium',
    source: 'internal_audit',
    detail: 'What was found.',
    rootCause: 'What allowed it.',
    ownerId: nextId('own'),
    raisedOn: addDays(FIXTURE_TODAY, -40),
    dueOn: addDays(FIXTURE_TODAY, 14),
    status: 'open',
    closedOn: null,
    closedBy: null,
    ...overrides,
  };
}

export function makeCapa(overrides: Partial<Capa> = {}): Capa {
  return {
    id: nextId('capa'),
    findingId: nextId('fnd'),
    type: 'corrective',
    action: 'Re-brief the team and re-sample in 30 days.',
    ownerId: nextId('own'),
    dueOn: addDays(FIXTURE_TODAY, 30),
    completedOn: null,
    effectivenessCheck: 'pending',
    verifiedBy: null,
    ...overrides,
  };
}

export function makeStep(overrides: Partial<WorkflowStep> = {}): WorkflowStep {
  return {
    id: nextId('step'),
    label: 'Step',
    kind: 'task',
    role: 'Team Leader',
    slaHours: 24,
    next: [],
    ...overrides,
  };
}

export function makeWorkflow(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: nextId('wf'),
    code: 'WF-INC-01',
    name: 'Incident follow-up',
    framework: 'NDIS',
    domain: 'Incident Management',
    steps: [
      makeStep({ label: 'Log incident', kind: 'task', next: [] }),
      makeStep({ label: 'Triage', kind: 'decision', next: [] }),
    ],
    ownerRole: 'Quality Manager',
    slaHours: 72,
    published: true,
    ...overrides,
  };
}

export function makeInstance(overrides: Partial<WorkflowInstance> = {}): WorkflowInstance {
  return {
    id: nextId('inst'),
    definitionId: nextId('wf'),
    state: 'running',
    currentNodeId: nextId('step'),
    openedOn: `${addDays(FIXTURE_TODAY, -5)}T09:00:00.000Z`,
    dueOn: addDays(FIXTURE_TODAY, 2),
    closedOn: null,
    subjectRef: null,
    ownerId: null,
    ...overrides,
  };
}

export function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: nextId('rev'),
    subjectRef: { type: 'control', id: nextId('ctl') },
    title: 'Control review',
    type: 'control',
    cadence: 'annually',
    lastReviewedOn: addDays(FIXTURE_TODAY, -300),
    dueOn: addDays(FIXTURE_TODAY, 60),
    ownerId: null,
    reviewerName: 'Quality Manager',
    outcome: 'effective',
    notes: '',
    ...overrides,
  };
}

export function makeRisk(overrides: Partial<RiskRecord> = {}): RiskRecord {
  const likelihood = overrides.likelihood ?? 3;
  const consequence = overrides.consequence ?? 3;
  return {
    id: nextId('rsk'),
    title: 'Risk',
    category: 'operational',
    likelihood,
    consequence,
    rating: riskRating(likelihood, consequence),
    status: 'treating',
    ownerId: nextId('own'),
    reviewDue: addDays(FIXTURE_TODAY, 90),
    controlIds: [],
    treatment: 'Monitor and review.',
    ...overrides,
  };
}