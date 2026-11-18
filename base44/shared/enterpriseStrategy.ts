// C10 — Autonomous Enterprise Operating System: strategy and transformation.
//
// What this module really does:
//   - turns the strategy chain (portfolio → program → objective → benefit, then capability →
//     maturity assessment) into validated records, so a broken link is refused rather than stored
//   - calculates progress only from measures that exist; a missing baseline or actual yields "unknown",
//     never an invented percentage
//   - treats maturity as evidence-backed only when a validated assessment carries evidence references
//   - decides which status changes are action-triggering, so those need an independent human approval
//   - builds the hash-chained audit entry for every write
//
// What it deliberately does not do:
//   - copy decisions, risks, controls, evidence, workflows or AI recommendations: it stores a
//     reference to the source record and nothing else
//   - invent strategy data, baseline figures or maturity scores
//   - let one business reference another business's portfolio, program, objective or capability
import { canComplianceReview, canManagementAct } from './roleMatrix.ts';
import { chainHash, redactRecord, redactText } from './aiWorkforce.ts';

export const ENTERPRISE_STRATEGY_VERSION = 'C10.1';

export const PORTFOLIO_STATUSES = ['Draft', 'Active', 'Paused', 'Closed', 'Archived'];
export const PROGRAM_STATUSES = ['Draft', 'Active', 'Paused', 'Closed', 'Archived'];
export const OBJECTIVE_STATUSES = ['Not started', 'On track', 'At risk', 'Off track', 'Achieved', 'Archived'];
export const BENEFIT_REVIEW_STATUSES = ['Not reviewed', 'Under review', 'Validated', 'Rejected', 'Archived'];
export const CAPABILITY_STATUSES = ['Draft', 'Active', 'Archived'];
export const ASSESSMENT_STATUSES = ['Draft', 'Validated', 'Archived'];
export const ROADMAP_STATUSES = ['Draft', 'Submitted', 'Approved', 'Returned', 'Archived'];
export const INITIATIVE_STATUSES = ['Planned', 'In progress', 'Complete', 'On hold', 'Cancelled'];
export const MILESTONE_STATUSES = ['Planned', 'Met', 'Missed'];

export const VALUATION_METHODS = [
  'Not valued',
  'Cost avoided',
  'Revenue growth',
  'Efficiency gain',
  'Risk reduction',
  'Compliance assurance',
  'Productivity gain',
];

/** The registers this OS points at. It never copies their records. */
export const LINKED_REGISTERS = [
  'DecisionRecord',
  'Risk',
  'ComplianceControl',
  'AssuranceEvidence',
  'WorkflowDefinition',
  'AiRecommendation',
];

export const MATURITY_LEVELS = [1, 2, 3, 4, 5];
export const MATURITY_LABELS = {
  1: 'Initial',
  2: 'Emerging',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimised',
};

export const MIN_RATIONALE_LENGTH = 20;
export const MIN_REASON_LENGTH = 10;
export const MAX_REFERENCES = 40;
export const MAX_INITIATIVES = 50;

/** Status changes that set work in motion, so a person with authority must make them. */
export const APPROVAL_TRIGGERING_STATUSES = ['Active', 'Approved', 'Closed', 'Achieved'];
const APPROVAL_SUBJECTS = new Set(['EnterprisePortfolio', 'TransformationProgram', 'StrategyObjective', 'StrategyBenefit']);

/* ------------------------------------------------------------------ values */

export function metric(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export const clean = (value: any, max = 200) => String(value ?? '').trim().slice(0, max);

export const isDate = (value: any) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

const result = (errors: string[], value: any) => (errors.length ? { ok: false, errors, value: null } : { ok: true, errors: [], value });

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

/**
 * Progress from a baseline, a target and the actual measure.
 * Returns null when the measure needed is missing: an unknown measure is never shown as 0% or 100%.
 */
export function progressPercent({ baseline, target, actual }: any = {}): number | null {
  const t = metric(target);
  const a = metric(actual);
  if (t === null || a === null) return null;
  const b = metric(baseline);
  if (b === null) {
    if (t === 0) return a >= t ? 100 : 0;
    return clampPercent((a / t) * 100);
  }
  if (t === b) return a >= t ? 100 : 0;
  return clampPercent(((a - b) / (t - b)) * 100);
}

export function averageOf(values: any[] = []): number | null {
  const usable = values.filter((v: any) => typeof v === 'number' && Number.isFinite(v));
  if (!usable.length) return null;
  return Math.round(usable.reduce((a: number, b: number) => a + b, 0) / usable.length);
}

const sumOf = (rows: any[], pick: (row: any) => any) =>
  rows.reduce((total, row) => total + (metric(pick(row)) ?? 0), 0);

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

/** Overdue / due soon / on track, from a stored due date only. */
export function dueState(due: any, today = new Date().toISOString().slice(0, 10), soonDays = 30): string {
  if (!isDate(due)) return 'No date';
  const days = daysBetween(today, String(due).trim());
  if (Number.isNaN(days)) return 'No date';
  if (days < 0) return 'Overdue';
  if (days <= soonDays) return 'Due soon';
  return 'On track';
}

/* ------------------------------------------------------------------ maturity */

export function capabilityMaturity(capability: any, assessments: any[] = []) {
  const validated = assessments
    .filter((row) => row.capability_id === capability?.id && row.status === 'Validated')
    .sort((a, b) => String(b.assessed_at || '').localeCompare(String(a.assessed_at || '')));
  const latest = validated[0] || null;
  const declared = metric(capability?.current_maturity);
  const current = latest ? metric(latest.score) : declared;
  const target = metric(capability?.target_maturity);
  const evidenceCount = latest ? Number(latest.evidence_count || 0) : 0;
  return {
    current,
    target,
    gap: current !== null && target !== null ? target - current : null,
    levelLabel: current !== null ? MATURITY_LABELS[Math.round(current)] || '' : '',
    evidenceBacked: Boolean(latest && evidenceCount > 0),
    evidenceCount,
    assessor: clean(latest?.assessor, 120),
    assessedAt: clean(latest?.assessed_at, 40),
    basis: latest
      ? (evidenceCount > 0 ? 'Validated assessment with evidence' : 'Validated assessment without evidence')
      : (declared !== null ? 'Self-declared, not yet assessed' : 'No maturity recorded'),
  };
}

/* ------------------------------------------------------------------ rollups */

/**
 * Portfolio → program → objective → benefit, plus capability maturity.
 * Every figure is derived from stored fields; nothing is defaulted to a number.
 */
export function buildRollups({
  portfolios = [],
  programs = [],
  objectives = [],
  benefits = [],
  capabilities = [],
  assessments = [],
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  const livePortfolios = portfolios.filter((row: any) => row.status !== 'Archived');
  const livePrograms = programs.filter((row: any) => row.status !== 'Archived');
  const liveObjectives = objectives.filter((row: any) => row.status !== 'Archived');
  const liveBenefits = benefits.filter((row: any) => row.status !== 'Archived');
  const liveCapabilities = capabilities.filter((row: any) => row.status !== 'Archived');

  const benefitView = (benefit: any) => {
    const progress = progressPercent({ baseline: benefit.baseline_value, target: benefit.target_value, actual: benefit.actual_value });
    return {
      id: benefit.id,
      key: benefit.benefit_key,
      name: benefit.name,
      objective_id: benefit.objective_id,
      baseline_value: metric(benefit.baseline_value),
      target_value: metric(benefit.target_value),
      actual_value: metric(benefit.actual_value),
      unit: benefit.unit || '',
      progress,
      valuation_method: benefit.valuation_method || '',
      valuation_amount: metric(benefit.valuation_amount),
      review_status: benefit.review_status || '',
      realised: progress !== null && progress >= 100,
      evidenceCount: parseRefs(benefit.evidence_refs_json).length,
    };
  };

  const objectiveView = (objective: any) => {
    const owned = liveBenefits.filter((row: any) => row.objective_id === objective.id);
    const views = owned.map(benefitView);
    return {
      id: objective.id,
      key: objective.objective_key,
      name: objective.name,
      owner: objective.owner || '',
      measure: objective.measure || '',
      unit: objective.unit || '',
      baseline_value: metric(objective.baseline_value),
      target_value: metric(objective.target_value),
      current_value: metric(objective.current_value),
      due_date: objective.due_date || '',
      due: dueState(objective.due_date, today),
      status: objective.status,
      progress: progressPercent({ baseline: objective.baseline_value, target: objective.target_value, actual: objective.current_value }),
      benefitCount: views.length,
      benefitValue: sumOf(views.filter((b) => b.review_status === 'Validated'), (b) => b.valuation_amount),
      realisedValue: sumOf(views.filter((b) => b.review_status === 'Validated' && b.realised), (b) => b.valuation_amount),
      benefits: views,
    };
  };

  const programView = (program: any) => {
    const owned = liveObjectives.filter((row: any) => row.program_id === program.id).map(objectiveView);
    return {
      id: program.id,
      key: program.program_key,
      name: program.name,
      portfolio_id: program.portfolio_id,
      sponsor: program.sponsor || '',
      owner_role: program.owner_role || '',
      status: program.status,
      start_date: program.start_date || '',
      target_date: program.target_date || '',
      due: dueState(program.target_date, today),
      progress: averageOf(owned.map((row) => row.progress)),
      objectiveCount: owned.length,
      overdueObjectives: owned.filter((row) => row.due === 'Overdue' && row.status !== 'Achieved').length,
      benefitValue: sumOf(owned, (row) => row.benefitValue),
      objectives: owned,
    };
  };

  const portfolioView = (portfolio: any) => {
    const owned = livePrograms.filter((row: any) => row.portfolio_id === portfolio.id).map(programView);
    const allObjectives = owned.flatMap((row) => row.objectives);
    return {
      id: portfolio.id,
      key: portfolio.portfolio_key,
      name: portfolio.name,
      sponsor: portfolio.sponsor || '',
      strategy_alignment: portfolio.strategy_alignment || '',
      status: portfolio.status,
      owner_role: portfolio.owner_role || '',
      objective_target: metric(portfolio.objective_target),
      review_due: portfolio.review_due || '',
      reviewState: dueState(portfolio.review_due, today),
      programCount: owned.length,
      objectiveCount: allObjectives.length,
      benefitCount: allObjectives.reduce((total, row) => total + row.benefitCount, 0),
      progress: averageOf(allObjectives.map((row) => row.progress)),
      overdueObjectives: allObjectives.filter((row) => row.due === 'Overdue' && row.status !== 'Achieved').length,
      dueSoonObjectives: allObjectives.filter((row) => row.due === 'Due soon' && row.status !== 'Achieved').length,
      achievedObjectives: allObjectives.filter((row) => row.status === 'Achieved').length,
      benefitValue: sumOf(allObjectives, (row) => row.benefitValue),
      realisedValue: sumOf(allObjectives, (row) => row.realisedValue),
      programs: owned,
    };
  };

  const portfolioRows = livePortfolios.map(portfolioView);
  const capabilityRows = liveCapabilities.map((capability: any) => ({
    id: capability.id,
    key: capability.capability_key,
    name: capability.name,
    domain: capability.domain || '',
    owner: capability.owner || '',
    status: capability.status,
    review_due: capability.review_due || '',
    reviewState: dueState(capability.review_due, today),
    ...capabilityMaturity(capability, assessments),
  }));

  const allObjectives = portfolioRows.flatMap((row) => row.programs.flatMap((program) => program.objectives));
  const tracedObjectives = portfolioRows.flatMap((row) => row.programs.flatMap((program) => program.objectives.map((objective) => ({
    ...objective,
    portfolio_id: row.id,
    portfolio_name: row.name,
    program_id: program.id,
    program_name: program.name,
  }))));

  return {
    portfolios: portfolioRows,
    capabilities: capabilityRows,
    totals: {
      portfolios: portfolioRows.length,
      activePortfolios: portfolioRows.filter((row) => row.status === 'Active').length,
      programs: portfolioRows.reduce((total, row) => total + row.programCount, 0),
      objectives: allObjectives.length,
      achievedObjectives: allObjectives.filter((row) => row.status === 'Achieved').length,
      overdueObjectives: allObjectives.filter((row) => row.due === 'Overdue' && row.status !== 'Achieved').length,
      dueSoonObjectives: allObjectives.filter((row) => row.due === 'Due soon' && row.status !== 'Achieved').length,
      benefits: allObjectives.reduce((total, row) => total + row.benefitCount, 0),
      validatedBenefits: liveBenefits.filter((row: any) => row.review_status === 'Validated').length,
      benefitValue: sumOf(portfolioRows, (row) => row.benefitValue),
      realisedValue: sumOf(portfolioRows, (row) => row.realisedValue),
      progress: averageOf(allObjectives.map((row) => row.progress)),
      capabilities: capabilityRows.length,
      capabilitiesBelowTarget: capabilityRows.filter((row) => row.gap !== null && row.gap > 0).length,
      evidenceBackedCapabilities: capabilityRows.filter((row) => row.evidenceBacked).length,
      capabilitiesWithoutAssessment: capabilityRows.filter((row) => !row.assessedAt).length,
      roadmaps: 0,
    },
    dueObjectives: tracedObjectives
      .filter((row) => row.due === 'Overdue' || row.due === 'Due soon')
      .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date))),
  };
}

/* ------------------------------------------------------------------ references */

export function parseRefs(json: any): any[] {
  if (Array.isArray(json)) return json;
  try {
    const parsed = JSON.parse(String(json || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** A reference points at an existing register record; it never copies that record's content. */
export function validateReferences(list: any) {
  const rows = Array.isArray(list) ? list.slice(0, MAX_REFERENCES) : [];
  const errors: string[] = [];
  const value = rows.map((item: any) => {
    const register = clean(item?.register, 60);
    const recordId = clean(item?.record_id, 80);
    if (!LINKED_REGISTERS.includes(register)) errors.push(`"${register || 'Unknown'}" is not a register this workspace links to.`);
    if (!recordId) errors.push('A linked record needs its record id, so it stays traceable.');
    return {
      register,
      record_id: recordId,
      reference: clean(item?.reference, 120),
      label: clean(item?.label, 200),
    };
  });
  return result(errors, value);
}

/* ------------------------------------------------------------------ relationships */

export function belongsToTenant(record: any, tenantId: string) {
  return Boolean(record) && Boolean(tenantId) && record.tenant_id === tenantId;
}

/** The parent must exist in the acting business before a child may point at it. */
function parentErrors(parent: any, label: string) {
  return parent ? [] : [`Choose a ${label} that exists in your business.`];
}

/* ------------------------------------------------------------------ validators */

export function validatePortfolio(input: any = {}) {
  const errors: string[] = [];
  const name = clean(input.name, 160);
  const sponsor = clean(input.sponsor, 120);
  const strategyAlignment = clean(input.strategy_alignment, 500);
  const status = clean(input.status, 20) || 'Draft';
  if (!name) errors.push('Give the portfolio a name.');
  if (!sponsor) errors.push('Name the executive sponsor. A portfolio without a sponsor has no owner of the outcome.');
  if (strategyAlignment.length < 10) errors.push('Describe how this portfolio aligns to the strategy, in at least a sentence.');
  if (!PORTFOLIO_STATUSES.includes(status)) errors.push('Choose a portfolio status from the list.');
  if (isDate(input.start_date) === false && clean(input.start_date)) errors.push('The start date must be a real date.');
  if (isDate(input.review_due) === false && clean(input.review_due)) errors.push('The review date must be a real date.');
  const target = metric(input.objective_target);
  if (target !== null && target < 0) errors.push('The objective target cannot be negative.');
  return result(errors, {
    name,
    description: clean(input.description, 2000),
    sponsor,
    strategy_alignment: strategyAlignment,
    status,
    horizon: clean(input.horizon, 60),
    owner_role: clean(input.owner_role, 120),
    objective_target: target,
    start_date: isDate(input.start_date) ? clean(input.start_date, 10) : '',
    review_due: isDate(input.review_due) ? clean(input.review_due, 10) : '',
    notes: clean(input.notes, 2000),
  });
}

export function validateProgram(input: any = {}, portfolio: any = null) {
  const errors = parentErrors(portfolio, 'portfolio');
  const name = clean(input.name, 160);
  const purpose = clean(input.purpose, 1000);
  const status = clean(input.status, 20) || 'Draft';
  if (!name) errors.push('Give the program a name.');
  if (!clean(input.sponsor, 120)) errors.push('Name the program sponsor.');
  if (purpose.length < 10) errors.push('Describe what this program will change, in at least a sentence.');
  if (!PROGRAM_STATUSES.includes(status)) errors.push('Choose a program status from the list.');
  const start = isDate(input.start_date) ? clean(input.start_date, 10) : '';
  const target = isDate(input.target_date) ? clean(input.target_date, 10) : '';
  if (start && target && target < start) errors.push('The target date cannot fall before the start date.');
  return result(errors, {
    portfolio_id: clean(portfolio?.id, 80),
    portfolio_key: clean(portfolio?.portfolio_key, 80),
    portfolio_name: clean(portfolio?.name, 160),
    name,
    purpose,
    sponsor: clean(input.sponsor, 120),
    owner_role: clean(input.owner_role, 120),
    status,
    start_date: start,
    target_date: target,
    notes: clean(input.notes, 2000),
  });
}

export function validateObjective(input: any = {}, program: any = null) {
  const errors = parentErrors(program, 'program');
  const name = clean(input.name, 200);
  const owner = clean(input.owner, 120);
  const measure = clean(input.measure, 300);
  const status = clean(input.status, 20) || 'Not started';
  if (!name) errors.push('State the objective.');
  if (!owner) errors.push('Name the objective owner.');
  if (measure.length < 5) errors.push('Name the measure that shows whether this objective is met.');
  if (!OBJECTIVE_STATUSES.includes(status)) errors.push('Choose an objective status from the list.');
  if (!isDate(input.due_date)) errors.push('Set the objective due date.');
  const target = metric(input.target_value);
  if (target === null) errors.push('Record the target value for the measure.');
  const baseline = metric(input.baseline_value);
  const current = metric(input.current_value);
  const references = validateReferences(input.linked_records);
  errors.push(...references.errors);
  return result(errors, {
    program_id: clean(program?.id, 80),
    program_key: clean(program?.program_key, 80),
    program_name: clean(program?.name, 160),
    portfolio_id: clean(program?.portfolio_id, 80),
    portfolio_key: clean(program?.portfolio_key, 80),
    name,
    owner,
    measure,
    unit: clean(input.unit, 40),
    baseline_value: baseline,
    target_value: target,
    current_value: current,
    due_date: clean(input.due_date, 10),
    status,
    linked_records_json: JSON.stringify(references.value || []),
    notes: clean(input.notes, 2000),
  });
}

export function validateBenefit(input: any = {}, objective: any = null) {
  const errors = parentErrors(objective, 'objective');
  const name = clean(input.name, 200);
  const method = clean(input.valuation_method, 60) || 'Not valued';
  const reviewStatus = clean(input.review_status, 20) || 'Not reviewed';
  if (!name) errors.push('Name the benefit.');
  if (!VALUATION_METHODS.includes(method)) errors.push('Choose a valuation method from the list.');
  if (!BENEFIT_REVIEW_STATUSES.includes(reviewStatus)) errors.push('Choose a review status from the list.');
  if (metric(input.target_value) === null) errors.push('Record the target value for this benefit.');
  const amount = metric(input.valuation_amount);
  if (method !== 'Not valued' && (amount === null || amount < 0)) errors.push('A valued benefit needs a valuation amount.');
  if (method === 'Not valued' && amount !== null && amount !== 0) errors.push('Set the method to a valuation type, or clear the amount.');
  if (reviewStatus === 'Validated' && !clean(input.owner, 120)) errors.push('A validated benefit needs a named owner.');
  const evidence = validateReferences(input.evidence_refs);
  errors.push(...evidence.errors);
  return result(errors, {
    objective_id: clean(objective?.id, 80),
    objective_key: clean(objective?.objective_key, 80),
    objective_name: clean(objective?.name, 200),
    program_id: clean(objective?.program_id, 80),
    program_key: clean(objective?.program_key, 80),
    portfolio_id: clean(objective?.portfolio_id, 80),
    portfolio_key: clean(objective?.portfolio_key, 80),
    name,
    owner: clean(input.owner, 120),
    unit: clean(input.unit, 40),
    baseline_value: metric(input.baseline_value),
    target_value: metric(input.target_value),
    actual_value: metric(input.actual_value),
    valuation_method: method,
    valuation_amount: method === 'Not valued' ? 0 : amount,
    review_status: reviewStatus,
    realised_date: isDate(input.realised_date) ? clean(input.realised_date, 10) : '',
    evidence_refs_json: JSON.stringify(evidence.value || []),
    notes: clean(input.notes, 2000),
  });
}

export function validateCapability(input: any = {}) {
  const errors: string[] = [];
  const name = clean(input.name, 160);
  const current = metric(input.current_maturity);
  const target = metric(input.target_maturity);
  const status = clean(input.status, 20) || 'Draft';
  if (!name) errors.push('Give the capability a name.');
  if (!clean(input.owner, 120)) errors.push('Name the capability owner.');
  if (!CAPABILITY_STATUSES.includes(status)) errors.push('Choose a capability status from the list.');
  if (current === null || !MATURITY_LEVELS.includes(Math.round(current))) errors.push('Record the current maturity from 1 to 5.');
  if (target === null || !MATURITY_LEVELS.includes(Math.round(target))) errors.push('Record the target maturity from 1 to 5.');
  if (clean(input.evidence_basis, 1000).length < 10) errors.push('Record the evidence this maturity rests on, in at least a sentence.');
  const controls = validateReferences(input.control_refs);
  errors.push(...controls.errors);
  return result(errors, {
    name,
    domain: clean(input.domain, 120),
    owner: clean(input.owner, 120),
    current_maturity: current === null ? null : Math.round(current),
    target_maturity: target === null ? null : Math.round(target),
    evidence_basis: clean(input.evidence_basis, 1000),
    control_refs_json: JSON.stringify(controls.value || []),
    status,
    review_due: isDate(input.review_due) ? clean(input.review_due, 10) : '',
    notes: clean(input.notes, 2000),
  });
}

export function validateAssessment(input: any = {}, capability: any = null, now = new Date().toISOString()) {
  const errors = parentErrors(capability, 'capability');
  const score = metric(input.score);
  const rationale = clean(input.rationale, 2000);
  const assessor = clean(input.assessor, 120);
  const evidence = validateReferences(input.evidence_refs);
  errors.push(...evidence.errors);
  if (!assessor) errors.push('Name the assessor. A maturity score needs a person behind it.');
  if (score === null || !MATURITY_LEVELS.includes(Math.round(score))) errors.push('Score the maturity from 1 to 5.');
  if (rationale.length < MIN_RATIONALE_LENGTH) errors.push(`Record the rationale in at least ${MIN_RATIONALE_LENGTH} characters.`);
  if (score !== null && Math.round(score) >= 4 && !(evidence.value || []).length) {
    errors.push('A maturity of 4 or 5 needs at least one evidence reference.');
  }
  const assessedAt = clean(input.assessed_at, 40) || now;
  if (Number.isNaN(Date.parse(assessedAt))) errors.push('The assessment date must be a real date.');
  return result(errors, {
    capability_id: clean(capability?.id, 80),
    capability_key: clean(capability?.capability_key, 80),
    capability_name: clean(capability?.name, 160),
    assessor,
    assessed_at: assessedAt,
    score: score === null ? null : Math.round(score),
    rationale,
    evidence_refs_json: JSON.stringify(evidence.value || []),
    evidence_count: (evidence.value || []).length,
    status: 'Draft',
    next_review: isDate(input.next_review) ? clean(input.next_review, 10) : '',
    notes: clean(input.notes, 2000),
  });
}

/** A roadmap plan: versioned initiatives, the dependencies between them, and milestones. */
export function validateRoadmapPlan(plan: any = {}) {
  const errors: string[] = [];
  const initiatives = Array.isArray(plan.initiatives) ? plan.initiatives.slice(0, MAX_INITIATIVES) : [];
  if (!initiatives.length) errors.push('Add at least one initiative. A roadmap with no work in it changes nothing.');
  const keys = new Set<string>();
  const cleanInitiatives = initiatives.map((item: any, index: number) => {
    const key = clean(item?.key, 60) || `INIT-${index + 1}`;
    if (keys.has(key)) errors.push(`Two initiatives share the key ${key}.`);
    keys.add(key);
    const status = clean(item?.status, 20) || 'Planned';
    if (!INITIATIVE_STATUSES.includes(status)) errors.push(`Initiative ${key} has a status outside the list.`);
    const version = metric(item?.version);
    if (!clean(item?.name, 200)) errors.push(`Initiative ${key} needs a name.`);
    if (!clean(item?.owner, 120)) errors.push(`Initiative ${key} needs an owner.`);
    if (isDate(item?.due_date) === false) errors.push(`Initiative ${key} needs a due date.`);
    return {
      key,
      name: clean(item?.name, 200),
      owner: clean(item?.owner, 120),
      due_date: isDate(item?.due_date) ? clean(item.due_date, 10) : '',
      status,
      version: version === null ? 1 : Math.max(1, Math.round(version)),
    };
  });

  const dependencies = Array.isArray(plan.dependencies) ? plan.dependencies.slice(0, 100) : [];
  const cleanDependencies = dependencies.map((item: any) => {
    const from = clean(item?.from, 60);
    const to = clean(item?.to, 60);
    if (!keys.has(from) || !keys.has(to)) errors.push('A dependency points at an initiative that is not in this roadmap.');
    return { from, to, reason: clean(item?.reason, 300) };
  });

  const milestones = Array.isArray(plan.milestones) ? plan.milestones.slice(0, 50) : [];
  const cleanMilestones = milestones.map((item: any) => {
    const status = clean(item?.status, 20) || 'Planned';
    if (!MILESTONE_STATUSES.includes(status)) errors.push('A milestone has a status outside the list.');
    if (!clean(item?.name, 200)) errors.push('Every milestone needs a name.');
    if (!isDate(item?.due_date)) errors.push('Every milestone needs a due date.');
    return { name: clean(item?.name, 200), due_date: isDate(item?.due_date) ? clean(item.due_date, 10) : '', status };
  });

  return result(errors, { initiatives: cleanInitiatives, dependencies: cleanDependencies, milestones: cleanMilestones });
}

export function validateRoadmap(input: any = {}, program: any = null) {
  const errors = parentErrors(program, 'program');
  const name = clean(input.name, 160);
  const summary = clean(input.summary, 2000);
  if (!name) errors.push('Give the roadmap a name.');
  if (summary.length < 10) errors.push('Summarise what this roadmap delivers, in at least a sentence.');
  const plan = validateRoadmapPlan(input);
  errors.push(...plan.errors);
  return result(errors, {
    program_id: clean(program?.id, 80),
    program_key: clean(program?.program_key, 80),
    program_name: clean(program?.name, 160),
    portfolio_id: clean(program?.portfolio_id, 80),
    portfolio_key: clean(program?.portfolio_key, 80),
    name,
    summary,
    initiatives_json: JSON.stringify(plan.value?.initiatives || []),
    initiative_count: (plan.value?.initiatives || []).length,
    dependencies_json: JSON.stringify(plan.value?.dependencies || []),
    dependency_count: (plan.value?.dependencies || []).length,
    milestones_json: JSON.stringify(plan.value?.milestones || []),
    milestone_count: (plan.value?.milestones || []).length,
    notes: clean(input.notes, 2000),
  });
}

/* ------------------------------------------------------------------ decisions */

export function strategyPermissions(user: any = {}) {
  const read = canComplianceReview(user);
  return { read, edit: read, approve: canManagementAct(user) };
}

/** True when this change sets work in motion, so it needs someone with authority to make it. */
export function statusChangeNeedsApproval(subjectType: string, nextStatus: string) {
  if (subjectType === 'TransformationRoadmap') return nextStatus === 'Approved';
  if (!APPROVAL_SUBJECTS.has(subjectType)) return false;
  return APPROVAL_TRIGGERING_STATUSES.includes(nextStatus);
}

export function roadmapTransition({
  roadmap,
  outcome,
  reason,
  approverName,
  approverId,
  isAdministrator = false,
  now = new Date().toISOString(),
}: any = {}) {
  const errors: string[] = [];
  if (!roadmap) return result(['That roadmap is not in your business.'], null);
  if (roadmap.status !== 'Submitted') errors.push('Only a submitted roadmap can be approved or returned.');
  if (!['Approved', 'Returned'].includes(outcome)) errors.push('Choose Approved or Returned.');
  if (clean(reason).length < MIN_REASON_LENGTH) errors.push(`Record your decision reason in at least ${MIN_REASON_LENGTH} characters.`);
  const independent = Boolean(approverId) && approverId !== roadmap.author_id;
  if (outcome === 'Approved' && !independent && !isAdministrator) {
    errors.push('The person who wrote this roadmap cannot approve it. An independent approver, or an administrator, must decide.');
  }
  return result(errors, {
    status: outcome,
    decided_by: clean(approverName, 120),
    decided_by_id: clean(approverId, 80),
    decided_at: now,
    decision_note: clean(reason, 1000),
    approval_authority: independent ? 'Independent reviewer' : 'Administrator override',
    self_approved: !independent,
  });
}

/* ------------------------------------------------------------------ audit */

export function strategyRef(prefix: string, at = new Date()) {
  const stamp = at.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const noise = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

const referenceOf = (subject: any = {}) =>
  clean(subject.portfolio_key || subject.program_key || subject.objective_key || subject.benefit_key
    || subject.capability_key || subject.assessment_ref || subject.roadmap_key || subject.audit_ref, 80);

/** One hash-chained audit entry, redacted before storage. */
export async function buildAuditEntry({
  previousHash = '',
  occurredAt = new Date().toISOString(),
  action,
  subjectType,
  subject,
  detail,
  outcome = 'Recorded',
  actor,
  actorId,
  actorRole = '',
  correlationId = '',
}: any = {}) {
  const projected = typeof detail === 'string' ? null : redactRecord(detail ?? {});
  const safe = redactText(projected ? JSON.stringify(projected.value) : String(detail ?? ''), 2000);
  const entry = {
    occurred_at: occurredAt,
    action: clean(action, 160),
    subject_type: clean(subjectType, 80),
    subject_ref: referenceOf(subject),
    subject_id: clean(subject?.id, 80),
    outcome,
    detail: safe.text,
    correlation_id: clean(correlationId, 80),
  };
  return {
    ...entry,
    actor: clean(actor, 160),
    actor_id: clean(actorId, 80),
    actor_role: clean(actorRole, 80),
    redacted_count: safe.redactions.length + (projected?.redactedCount ?? 0),
    previous_hash: previousHash,
    chain_hash: await chainHash(previousHash, entry),
  };
}