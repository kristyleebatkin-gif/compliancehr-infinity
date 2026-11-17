import { base44 } from '@/api/base44Client';
import { hasApprovedAccess, canAccessNav } from '@/lib/roles';
import { ENTRY_POINTS } from '@/lib/v8000Engine';

export {
  EVIDENCE_STATE_LABELS,
  ENTRY_POINTS,
  daysTo,
  evidenceStateAt,
  readinessBand,
  readinessFromParts,
  v8000Position,
  validationChecks,
} from '@/lib/v8000Engine';

export const FABRIC_LIMIT = 500;

/** Load the fabric registers for the signed-in business. A failed register throws rather than reading as empty. */
export async function loadFabric(client = base44) {
  const user = await client.auth.me();
  if (!hasApprovedAccess(user) || !canAccessNav(user.role, 'v8000-command')) throw new Error('Approved V8000 access is required.');
  const tenantId = user?.tenant_id || user?.data?.tenant_id;
  if (!tenantId) throw new Error('Choose a business before loading the evidence fabric.');

  const read = async (entity) => {
    const page = await client.entities[entity].filter({ tenant_id: tenantId }, { limit: FABRIC_LIMIT });
    const items = Array.isArray(page) ? page : page?.items;
    if (!Array.isArray(items)) throw new Error(`${entity} returned an unavailable register.`);
    if (items.some((row) => row.tenant_id !== tenantId)) throw new Error('Fabric scope mismatch.');
    return { items, truncated: items.length >= FABRIC_LIMIT || Boolean(page?.has_more || page?.next_cursor) };
  };

  const [standards, controls, evidence, findings, links] = await Promise.all(
    ['RegulatoryStandard', 'ComplianceControl', 'AssuranceEvidence', 'AssuranceFinding', 'KnowledgeLink'].map(read)
  );

  return {
    tenantId,
    standards: standards.items,
    controls: controls.items,
    evidence: evidence.items,
    findings: findings.items,
    links: links.items,
    truncated: [standards, controls, evidence, findings, links].some((page) => page.truncated),
  };
}

/** Live counts for the nine entry points. A count that cannot be read is null, never zero. */
export async function loadEntryPointCounts(tenantId, client = base44) {
  return Promise.all(ENTRY_POINTS.map(async (entry) => ({
    ...entry,
    counts: await Promise.all(entry.counts.map(async (source) => {
      try {
        const count = await client.entities[source.entity].count({ tenant_id: tenantId, ...(source.query || {}) });
        return { label: source.label, count: Number.isFinite(count) ? count : null };
      } catch {
        return { label: source.label, count: null };
      }
    })),
  })));
}