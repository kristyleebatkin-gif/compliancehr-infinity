// Resolves the master audit matrix against the live registers.
//
// A checkpoint is only ever scored from records that exist: a matching
// ComplianceControl, current evidence for that standard, and open
// AssuranceFinding records. Nothing is assumed, and a checkpoint with no
// register coverage scores zero rather than counting as compliant.

import { isEvidenceHolding } from './assuranceChain.js';
import { AUDIT_CHECKPOINTS, AUDIT_DOMAINS, RATING_BANDS } from './masterAssuranceCatalogue.js';

export const MATRIX_STATES = {
  assured: { label: 'Assured', weight: 1, tone: 'border-safe/40 bg-safe/10 text-safe' },
  exception: { label: 'Exception', weight: 0.5, tone: 'border-danger/50 bg-danger/15 text-danger' },
  pending: { label: 'Evidence pending', weight: 0.3, tone: 'border-warning/50 bg-warning/20 text-warning' },
  missing: { label: 'No evidence', weight: 0, tone: 'border-warning/40 bg-warning/15 text-warning' },
  unmapped: { label: 'Not mapped', weight: 0, tone: 'border-border bg-muted text-muted-foreground' },
};

export const MATRIX_STATE_ORDER = ['exception', 'missing', 'pending', 'unmapped', 'assured'];

export function ratingFor(percent) {
  const value = Number(percent) || 0;
  return RATING_BANDS.find((band) => value >= band.min) || RATING_BANDS[RATING_BANDS.length - 1];
}

function groupByStandard(records) {
  const map = new Map();
  records.forEach((record) => {
    const key = record?.standard_code;
    if (!key) return;
    const list = map.get(key) || [];
    list.push(record);
    map.set(key, list);
  });
  return map;
}

export function resolveAuditMatrix({ controls = [], evidence = [], findings = [] } = {}) {
  const controlsByStandard = groupByStandard(controls);
  const evidenceByStandard = groupByStandard(evidence);
  const openFindingsByStandard = groupByStandard(findings.filter((finding) => finding.status !== 'Closed'));

  const rows = AUDIT_CHECKPOINTS.map((checkpoint) => {
    const mappedControls = controlsByStandard.get(checkpoint.standard_code) || [];
    const mappedEvidence = evidenceByStandard.get(checkpoint.standard_code) || [];
    const openFindings = openFindingsByStandard.get(checkpoint.standard_code) || [];
    const current = mappedEvidence.filter(isEvidenceHolding).length;
    const actions = openFindings.filter((finding) => finding.corrective_action).length;

    let state = 'assured';
    if (!mappedControls.length) state = 'unmapped';
    else if (openFindings.length) state = 'exception';
    else if (current) state = 'assured';
    else if (mappedEvidence.length) state = 'pending';
    else state = 'missing';

    const points = checkpoint.weighting * MATRIX_STATES[state].weight;

    return {
      ...checkpoint,
      state,
      state_label: MATRIX_STATES[state].label,
      state_tone: MATRIX_STATES[state].tone,
      control_records: mappedControls.length,
      evidence_count: mappedEvidence.length,
      current_evidence: current,
      findings_count: openFindings.length,
      actions_count: actions,
      achieved_points: Math.round(points * 10) / 10,
      compliance_percentage: Math.round((points / checkpoint.weighting) * 100),
    };
  });

  const byDomain = AUDIT_DOMAINS.map((domain) => {
    const domainRows = rows.filter((row) => row.audit_domain === domain.domain);
    const available = domainRows.reduce((sum, row) => sum + row.weighting, 0);
    const achieved = domainRows.reduce((sum, row) => sum + row.achieved_points, 0);
    const percent = available ? Math.round((achieved / available) * 1000) / 10 : 0;
    return {
      ...domain,
      available,
      achieved: Math.round(achieved * 10) / 10,
      percent,
      rating: ratingFor(percent),
      assured: domainRows.filter((row) => row.state === 'assured').length,
      exceptions: domainRows.filter((row) => row.state === 'exception').length,
      missing: domainRows.filter((row) => row.state === 'missing' || row.state === 'unmapped').length,
    };
  });

  const available = rows.reduce((sum, row) => sum + row.weighting, 0);
  const achieved = rows.reduce((sum, row) => sum + row.achieved_points, 0);
  const percent = available ? Math.round((achieved / available) * 1000) / 10 : 0;

  const counts = {
    total: rows.length,
    assured: rows.filter((row) => row.state === 'assured').length,
    exception: rows.filter((row) => row.state === 'exception').length,
    pending: rows.filter((row) => row.state === 'pending').length,
    missing: rows.filter((row) => row.state === 'missing').length,
    unmapped: rows.filter((row) => row.state === 'unmapped').length,
    openFindings: rows.reduce((sum, row) => sum + row.findings_count, 0),
    criticalFindings: rows.filter((row) => row.findings_count && row.criticality === 'Critical').length,
    openActions: rows.reduce((sum, row) => sum + row.actions_count, 0),
    evidenceHeld: rows.reduce((sum, row) => sum + row.current_evidence, 0),
  };
  counts.evidenceGaps = counts.missing + counts.pending + counts.unmapped;
  counts.coveragePercent = counts.total ? Math.round((counts.assured / counts.total) * 100) : 0;

  return {
    rows,
    byDomain,
    counts,
    enterprise: {
      available,
      achieved: Math.round(achieved * 10) / 10,
      percent,
      rating: ratingFor(percent),
    },
  };
}

const CSV_COLUMNS = [
  ['audit_code', 'Audit Code'],
  ['audit_name', 'Audit Checkpoint'],
  ['audit_domain', 'Domain'],
  ['audit_subdomain', 'Subdomain'],
  ['audit_type', 'Audit Type'],
  ['indicator_code', 'Indicator'],
  ['indicator_name', 'Indicator Name'],
  ['control_code', 'Control'],
  ['control_name', 'Control Name'],
  ['evidence_code', 'Evidence Requirement'],
  ['standard_code', 'Standard'],
  ['standard_name', 'Standard Name'],
  ['criticality', 'Criticality'],
  ['weighting', 'Weighting'],
  ['inherent_risk_score', 'Inherent Risk'],
  ['residual_risk_score', 'Residual Risk'],
  ['owner_role', 'Owner'],
  ['reviewer_role', 'Reviewer'],
  ['approver_role', 'Approver'],
  ['state_label', 'Live Status'],
  ['compliance_percentage', 'Compliance %'],
  ['findings_count', 'Open Findings'],
  ['evidence_count', 'Evidence Records'],
];

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function matrixCsv(rows = []) {
  const header = CSV_COLUMNS.map(([, label]) => csvCell(label)).join(',');
  const body = rows.map((row) => CSV_COLUMNS.map(([key]) => csvCell(row[key])).join(','));
  return [header, ...body].join('\n');
}