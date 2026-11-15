// Draft catalogue projection. Live assessment is deliberately unavailable until
// explicit reviewed mappings, applicability and version-pinned results exist.
// Broad standard matches must never produce checkpoint assurance.
import { AUDIT_CHECKPOINTS, AUDIT_DOMAINS, RATING_BANDS } from './masterAssuranceCatalogue.js';
import { buildCsv } from './csvExport.js';

const UNKNOWN = { label: 'Not assessed', tone: 'border-border bg-muted text-muted-foreground' };
export const MATRIX_STATES = { unassessed: { ...UNKNOWN, weight: 0 } };
export const MATRIX_STATE_ORDER = ['unassessed'];

export function ratingFor(percent) {
  if (typeof percent !== 'number' || !Number.isFinite(percent) || percent < 0 || percent > 100) return UNKNOWN;
  return RATING_BANDS.find(band => percent >= band.min) || UNKNOWN;
}

export function resolveAuditMatrix() {
  const rows = AUDIT_CHECKPOINTS.map(checkpoint => ({
    ...checkpoint,
    state: 'unassessed', state_label: UNKNOWN.label, state_tone: UNKNOWN.tone,
    control_records: null, evidence_count: null, current_evidence: null,
    findings_count: null, actions_count: null, achieved_points: null,
    compliance_percentage: null, weighted_score: null,
  }));
  return {
    rows,
    byDomain: AUDIT_DOMAINS.map(domain => ({ ...domain, available: null, achieved: null,
      percent: null, rating: UNKNOWN, assured: 0, exceptions: null, missing: null })),
    counts: { total: rows.length, assured: 0, unassessed: rows.length,
      exception: null, pending: null, missing: null, unmapped: rows.length,
      openFindings: null, criticalFindings: null, openActions: null,
      evidenceHeld: null, evidenceGaps: null, coveragePercent: null },
    enterprise: { available: null, achieved: null, percent: null, rating: UNKNOWN },
  };
}

export const MATRIX_COLUMNS = [
  'audit_id', 'audit_code', 'audit_name', 'audit_domain', 'audit_subdomain', 'audit_category', 'audit_type',
  'indicator_id', 'indicator_code', 'indicator_name', 'control_id', 'control_code', 'control_name',
  'evidence_id', 'evidence_code', 'evidence_name', 'standard_code', 'standard_name', 'risk_id',
  'risk_rating', 'criticality', 'inherent_risk_score', 'residual_risk_score', 'weighting', 'max_score',
  'pass_score', 'review_frequency', 'evidence_frequency', 'owner_role', 'reviewer_role', 'approver_role',
  'audit_status', 'compliance_status', 'audit_date', 'audit_period_start', 'audit_period_end',
  'evidence_review_date', 'finding_date', 'corrective_action_due_date', 'verification_date', 'closure_date',
  'next_review_date', 'next_audit_date', 'findings_count', 'actions_count', 'evidence_count',
  'compliance_percentage', 'weighted_score', 'created_at', 'updated_at',
  'catalogue_status', 'mapping_status',
];
export function matrixCsv(rows = []) {
  return buildCsv(MATRIX_COLUMNS.map(key => ({ key, label: key })), rows);
}
