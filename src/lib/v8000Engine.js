/**
 * V8000 Evidence Fabric calculations.
 *
 * Every number here is derived from stored registers. Nothing is seeded, guessed or
 * defaulted to a flattering value: a measure with no source records is reported as
 * not measured, and validation checks only appear when they have real findings.
 *
 * This module is pure (no client, no network) so it can be unit tested directly.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const text = (value) => String(value ?? '').trim();

/** Whole days from today to a date. Null when there is no usable date. */
export function daysTo(dateValue, today = new Date()) {
  const raw = text(dateValue).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const target = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - base.getTime()) / DAY_MS);
}

/** The same state model the Evidence OS uses, made date-injectable for deterministic checks. */
export function evidenceStateAt(item, today = new Date()) {
  const status = item?.verification_status;
  if (status === 'Rejected') return 'rejected';
  if (status === 'Expired') return 'expired';
  const remaining = daysTo(item?.valid_to, today);
  if (remaining !== null && remaining < 0) return 'expired';
  if (remaining !== null && remaining <= 30) return 'expiring';
  if (status === 'Verified') return 'verified';
  if (status === 'In Review') return 'in_review';
  return 'unverified';
}

export const EVIDENCE_STATE_LABELS = {
  verified: 'Verified',
  expiring: 'Expiring within 30 days',
  in_review: 'In review',
  unverified: 'Unverified',
  rejected: 'Rejected',
  expired: 'Expired',
};

const HOLDING_STATES = ['verified', 'expiring'];
const isHolding = (state) => HOLDING_STATES.includes(state);
const activeControls = (controls) => controls.filter((control) => control.status !== 'Retired');

/** Weighted mean over measurable parts only; unmeasured weight is reported as coverage. */
export function readinessFromParts(parts = []) {
  const measured = parts.filter((part) => Number.isFinite(part.value));
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const measuredWeight = measured.reduce((sum, part) => sum + part.weight, 0);
  if (!measured.length || !totalWeight) return { score: null, coverage: 0, parts };
  const score = measured.reduce((sum, part) => sum + part.value * part.weight, 0) / measuredWeight;
  return { score: Math.round(score), coverage: Math.round((measuredWeight / totalWeight) * 100), parts };
}

/**
 * The full V8000 position for one business: evidence states, trust, gaps, reviews and readiness.
 * Every value is null when its source register is empty, so the UI can say "not measured".
 */
export function v8000Position({ standards = [], controls = [], evidence = [], findings = [], today = new Date() } = {}) {
  const states = { verified: 0, expiring: 0, in_review: 0, unverified: 0, rejected: 0, expired: 0 };
  evidence.forEach((item) => {
    states[evidenceStateAt(item, today)] += 1;
  });

  const active = activeControls(controls);
  const activeIds = new Set(active.map((control) => control.id));
  const holdingControlIds = new Set();
  const verifiedControlIds = new Set();
  evidence.forEach((item) => {
    const state = evidenceStateAt(item, today);
    if (!item.control_id || !activeIds.has(item.control_id)) return;
    if (isHolding(state)) holdingControlIds.add(item.control_id);
    if (state === 'verified') verifiedControlIds.add(item.control_id);
  });

  const controlsMissing = active.filter((control) => !holdingControlIds.has(control.id)).length;
  const expiredOnActive = evidence.filter(
    (item) => item.control_id && activeIds.has(item.control_id) && ['expired', 'rejected'].includes(evidenceStateAt(item, today))
  ).length;
  const controlsTestedCurrent = active.filter((control) => {
    const remaining = daysTo(control.next_test_date, today);
    return remaining === null || remaining >= 0;
  }).length;
  const controlTestsOverdue = active.filter((control) => {
    const remaining = daysTo(control.next_test_date, today);
    return remaining !== null && remaining < 0;
  }).length;
  const openFindings = findings.filter((finding) => finding.status !== 'Closed');
  const closedFindings = findings.filter((finding) => finding.status === 'Closed');
  const findingsOverdue = openFindings.filter((finding) => {
    const remaining = daysTo(finding.due_date, today);
    return remaining !== null && remaining < 0;
  }).length;

  const percent = (good, total) => (total ? Math.round((good / total) * 100) : null);
  const trust = percent(verifiedControlIds.size, active.length);
  const coverage = percent(holdingControlIds.size, active.length);
  // Test currency is only a real measure once at least one control declares a re-test date.
  const hasTestDates = active.some((control) => daysTo(control.next_test_date, today) !== null);

  const readiness = readinessFromParts([
    { key: 'trust', label: 'Controls holding verified evidence', weight: 50, value: trust },
    { key: 'review', label: 'Controls whose test is current', weight: 20, value: hasTestDates ? percent(controlsTestedCurrent, active.length) : null },
    { key: 'findings', label: 'Findings closed', weight: 20, value: percent(closedFindings.length, findings.length) },
    { key: 'evidence', label: 'Evidence verified', weight: 10, value: percent(states.verified, evidence.length) },
  ]);

  return {
    states,
    evidenceTotal: evidence.length,
    standardsTotal: standards.length,
    controlsTotal: controls.length,
    activeControls: active.length,
    holdingControls: holdingControlIds.size,
    verifiedControls: verifiedControlIds.size,
    controlsMissing,
    expiredOnActive,
    controlsTestedCurrent,
    controlTestsOverdue,
    openFindings: openFindings.length,
    closedFindings: closedFindings.length,
    findingsOverdue,
    trust,
    coverage,
    readiness,
  };
}

/** Readiness band labels. Text always accompanies the colour. */
export function readinessBand(score) {
  if (!Number.isFinite(score)) return { label: 'Not measured', tone: 'unmeasured' };
  if (score >= 90) return { label: 'Assured', tone: 'good' };
  if (score >= 75) return { label: 'Largely assured', tone: 'good' };
  if (score >= 60) return { label: 'Developing', tone: 'watch' };
  return { label: 'At risk', tone: 'risk' };
}

/**
 * Traceability and validation checks. A check appears only when it has findings,
 * so an empty list means the checks found nothing in the loaded records.
 */
export function validationChecks({ standards = [], controls = [], evidence = [], findings = [], today = new Date() } = {}) {
  const position = v8000Position({ standards, controls, evidence, findings, today });
  const active = activeControls(controls);
  const activeIds = new Set(active.map((control) => control.id));
  const checks = [];
  const add = (check) => {
    if (check.count > 0) checks.push(check);
  };

  add({
    id: 'no-evidence',
    severity: position.activeControls && position.controlsMissing / position.activeControls > 0.2 ? 'high' : 'medium',
    title: 'Controls with no current evidence',
    detail: 'These active controls hold no verified or in-date evidence, so they cannot be assured.',
    count: position.controlsMissing,
    action: { label: 'Open Evidence OS', path: '/evidence' },
  });

  add({
    id: 'evidence-expired',
    severity: 'high',
    title: 'Expired or rejected evidence still supporting an active control',
    detail: 'The control depends on evidence that is out of date or has been rejected.',
    count: position.expiredOnActive,
    action: { label: 'Review evidence', path: '/evidence' },
  });

  add({
    id: 'orphan-evidence',
    severity: 'medium',
    title: 'Evidence not linked to a control',
    detail: 'Evidence that traces to no control cannot be reported as supporting a standard.',
    count: evidence.filter((item) => !item.control_id || !activeIds.has(item.control_id)).length,
    action: { label: 'Link evidence', path: '/knowledge-graph' },
  });

  add({
    id: 'control-test-overdue',
    severity: 'medium',
    title: 'Control tests past their next test date',
    detail: 'A control whose test date has passed has not been re-verified in the period its frequency requires.',
    count: position.controlTestsOverdue,
    action: { label: 'Open controls', path: '/evidence' },
  });

  add({
    id: 'findings-overdue',
    severity: 'high',
    title: 'Open findings past their due date',
    detail: 'Corrective action is overdue on these findings.',
    count: position.findingsOverdue,
    action: { label: 'Open findings', path: '/evidence' },
  });

  const controlsByCode = new Map();
  controls.forEach((control) => {
    const code = text(control.standard_code).toUpperCase();
    if (code) controlsByCode.set(code, [...(controlsByCode.get(code) || []), control]);
  });
  const controlStandardIds = new Set(controls.map((control) => control.standard_id).filter(Boolean));
  const standing = standards.filter((standard) => standard.status !== 'Retired');
  add({
    id: 'standard-no-control',
    severity: 'high',
    title: 'Standards with no control attached',
    detail: 'Nothing in the business meets these standards yet, so there is no evidence chain to trace.',
    count: standing.filter((standard) => !controlStandardIds.has(standard.id) && !controlsByCode.get(text(standard.standard_code).toUpperCase())).length,
    action: { label: 'Open standards', path: '/evidence' },
  });
  add({
    id: 'standard-no-outcome',
    severity: 'low',
    title: 'Standards with no stated outcome',
    detail: 'Without a stated outcome the chain stops at the control and cannot reach the person it protects.',
    count: standing.filter((standard) => !text(standard.outcome)).length,
    action: { label: 'Complete standards', path: '/evidence' },
  });

  add({
    id: 'control-no-owner',
    severity: 'low',
    title: 'Active controls with no named owner',
    detail: 'An unowned control has no accountable person for its evidence.',
    count: active.filter((control) => !text(control.owner)).length,
    action: { label: 'Assign owners', path: '/evidence' },
  });

  add({
    id: 'closure-unverified',
    severity: 'medium',
    title: 'Findings closed without verification',
    detail: 'Closure was recorded but no one is named as having verified it.',
    count: findings.filter((finding) => finding.status === 'Closed' && !finding.closure_verified_date && !text(finding.closure_verified_by)).length,
    action: { label: 'Verify closures', path: '/evidence' },
  });

  add({
    id: 'evidence-unverified',
    severity: 'low',
    title: 'Evidence awaiting verification',
    detail: 'Collected evidence that no one has verified is not yet assurance.',
    count: position.states.unverified + position.states.in_review,
    action: { label: 'Verify evidence', path: '/evidence' },
  });

  const rank = { high: 0, medium: 1, low: 2 };
  return checks.sort((a, b) => rank[a.severity] - rank[b.severity] || b.count - a.count);
}

/** The nine V8000 dashboard entry points, each backed by the registers it reports on. */
export const ENTRY_POINTS = [
  { key: 'executive', label: 'Executive', path: '/executive-dashboards', description: 'Whole-of-business assurance position and the integrity index.',
    counts: [{ entity: 'ComplianceControl', label: 'Controls' }, { entity: 'AssuranceEvidence', label: 'Evidence records' }] },
  { key: 'board', label: 'Board', path: '/board-ceo', description: 'Board resolutions and the governance objects they govern.',
    counts: [{ entity: 'BoardResolution', label: 'Resolutions' }, { entity: 'GovernanceObject', label: 'Governance objects' }] },
  { key: 'trust', label: 'Trust', path: '/feedback', description: 'Complaints and feedback that test the trust the business has earned.',
    counts: [{ entity: 'Complaint', label: 'Complaints' }, { entity: 'Feedback', label: 'Feedback entries' }] },
  { key: 'ndis', label: 'NDIS', path: '/ndis-portal', description: 'NDIS Practice Standards obligations, controls and evidence.',
    counts: [{ entity: 'RegulatoryStandard', label: 'NDIS standards', query: { framework: 'NDIS Practice Standards' } },
      { entity: 'ComplianceControl', label: 'NDIS controls', query: { framework: 'NDIS Practice Standards' } }] },
  { key: 'aged-care', label: 'Aged Care', path: '/compliance', description: 'Aged Care Quality Standards obligations, controls and evidence.',
    counts: [{ entity: 'RegulatoryStandard', label: 'Aged Care standards', query: { framework: 'Aged Care Quality Standards' } },
      { entity: 'ComplianceControl', label: 'Aged Care controls', query: { framework: 'Aged Care Quality Standards' } }] },
  { key: 'clinical', label: 'Clinical Governance', path: '/clinical-os', description: 'Care plans, review dates and allied health referrals.',
    counts: [{ entity: 'CarePlan', label: 'Care plans' }, { entity: 'AlliedHealthReferral', label: 'Allied health referrals' }] },
  { key: 'workforce', label: 'Workforce', path: '/certificates', description: 'Credentials and training currency across the workforce.',
    counts: [{ entity: 'Certificate', label: 'Certificates' }, { entity: 'TrainingCompletion', label: 'Training completions' }] },
  { key: 'audit', label: 'Audit', path: '/auditor-portal', description: 'Audits performed and the findings they raised.',
    counts: [{ entity: 'InternalAudit', label: 'Audits' }, { entity: 'AssuranceFinding', label: 'Findings' }] },
  { key: 'risk', label: 'Risk', path: '/risks', description: 'The risk register and the compliance issues feeding it.',
    counts: [{ entity: 'Risk', label: 'Risks' }, { entity: 'ComplianceIssue', label: 'Compliance issues' }] },
];