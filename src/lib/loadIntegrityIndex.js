import { canAccessNav } from './roleMatrix.js';
import { canReadExecutiveMetrics } from './executiveMetrics.js';
import { integrityDimensions, scoreIntegrityIndex } from './integrityIndex.js';

// These gates limit requests; server RLS remains the authority for every count.
export const INTEGRITY_SOURCE_PERMISSIONS = {
  GovernanceObject: 'governance', BoardResolution: 'governance',
  ComplianceControl: 'compliance', ComplianceIssue: 'compliance', Policy: 'compliance',
  Risk: 'risks', Audit: 'compliance', AssuranceFinding: 'evidence', AssuranceEvidence: 'evidence',
  Certificate: 'certificates', TrainingCompletion: 'training',
  CarePlan: 'clinical-os', AlliedHealthReferral: 'clinical-os',
  Complaint: 'feedback', Feedback: 'feedback', Goal: 'goals', BusinessProject: 'projects',
};

export async function loadIntegrityIndex({ entities, user, today }) {
  const dimensions = integrityDimensions(today);
  if (!canReadExecutiveMetrics(user)) return { ...scoreIntegrityIndex(dimensions), counts: {}, unavailableReads: 0, today };
  const tenant = user.tenant_id || user.data.tenant_id;
  const measures = dimensions.flatMap(dimension => dimension.measures);
  const results = await Promise.allSettled(measures.map(async measure => {
    const permission = INTEGRITY_SOURCE_PERMISSIONS[measure.entity];
    if (!permission || !canAccessNav(user.role, permission)) return null;
    return entities[measure.entity].count({ ...measure.query, tenant_id: tenant });
  }));
  const counts = Object.fromEntries(measures.map((measure, index) => {
    const result = results[index];
    const value = result.status === 'fulfilled' ? result.value : null;
    return [measure.key, Number.isSafeInteger(value) && value >= 0 ? value : null];
  }));
  const unavailableReads = Object.values(counts).filter(value => value === null).length;
  return { ...scoreIntegrityIndex(dimensions, counts), counts, unavailableReads, today };
}
