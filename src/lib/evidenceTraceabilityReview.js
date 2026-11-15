import { enterpriseScope } from './enterpriseReadModel.js';
import { canAccessNav } from './roleMatrix.js';

// Only explicit references are resolved. Titles, topics and fuzzy matches never create links.
export const TRACE_LINK_FIELDS = [
  { field: 'related_policy', label: 'Policy', stage: 'Policy' },
  { field: 'related_procedure', label: 'Procedure', stage: 'Procedure' },
  { field: 'related_plan', label: 'Plan', stage: 'Plan' },
  { field: 'related_form', label: 'Form', stage: 'Form' },
  { field: 'related_register', label: 'Register', stage: 'Register' },
  { field: 'audit_link', label: 'Audit', stage: 'Audit' },
  { field: 'capa_link', label: 'Corrective action', stage: null },
  { field: 'evidence_documents', label: 'Evidence', stage: 'Evidence' },
];
const text = value => typeof value === 'string' ? value.trim() : '';
const refs = value => [...new Set((Array.isArray(value) ? value : [value]).map(text).filter(Boolean))];
export const TRACE_COLUMNS = [
  { key: 'reference', label: 'Reference' }, { key: 'title', label: 'Record' },
  { key: 'stage', label: 'Stage' }, { key: 'version', label: 'Recorded version' },
  { key: 'owner', label: 'Owner' }, { key: 'recorded', label: 'References recorded' },
  { key: 'resolved', label: 'References resolved in review' },
  { key: 'unresolved', label: 'References unresolved in review' },
  { key: 'attention', label: 'Review attention' },
];

export async function readTraceabilityReview({ entities, user }) {
  const scope = enterpriseScope(user);
  if (!scope || !canAccessNav(user.role, 'enterprise-os') || !canAccessNav(user.role, 'governance')) {
    throw new Error('Traceability access unavailable');
  }
  const response = await entities.GovernanceObject.filter(
    { tenant_id: scope.tenant, status: { $ne: 'Archived' } },
    { sort: 'object_code', limit: 201 },
  );
  const source = Array.isArray(response) ? response : response?.items;
  if (!Array.isArray(source)) throw new Error('Traceability records unavailable');
  const ids = new Set();
  for (const row of source) {
    if (!row || !text(row.id) || row.tenant_id !== scope.tenant || ids.has(row.id)) {
      throw new Error('Traceability scope unavailable');
    }
    ids.add(row.id);
  }
  const limited = source.length > 200 || Boolean(response?.next_cursor);
  const rows = source.slice(0, 200);
  const byId = new Map(rows.map(row => [row.id, row]));
  const byCode = new Map();
  for (const row of rows) {
    const code = text(row.object_code);
    if (code) byCode.set(code, [...(byCode.get(code) || []), row]);
  }
  const items = rows.map(row => {
    const links = TRACE_LINK_FIELDS.flatMap(({ field, label, stage }) => {
      const values = refs(row[field]);
      if (!values.length) return [{ field, label, state: 'missing', count: 0 }];
      return values.map(value => {
        // Evidence values can be private storage references or URLs: never return or render them.
        const exact = byId.get(value);
        const codes = byCode.get(value) || [];
        const target = exact || (codes.length === 1 ? codes[0] : null);
        let state = 'unresolved';
        if (!exact && codes.length > 1) state = 'ambiguous';
        else if (target?.id === row.id) state = 'self-reference';
        else if (target && stage && target.lifecycle_stage !== stage) state = 'stage-mismatch';
        else if (target) state = 'resolved';
        return { field, label, state, count: 1,
          ...(state === 'resolved' ? { targetId: target.id, targetTitle: text(target.title),
            targetVersion: text(target.version), targetStage: text(target.lifecycle_stage) } : {}) };
      });
    });
    const recorded = links.filter(link => link.count).length;
    const resolved = links.filter(link => link.state === 'resolved').length;
    const attention = [];
    if (!text(row.business_owner)) attention.push('Owner missing');
    if (!text(row.version)) attention.push('Version missing');
    if (!recorded) attention.push('No references recorded');
    if (recorded > resolved) attention.push('References need review');
    return { id: row.id, reference: text(row.object_code), title: text(row.title),
      stage: text(row.lifecycle_stage), version: text(row.version),
      owner: text(row.business_owner), recorded, resolved, unresolved: recorded - resolved,
      attention: attention.join('; ') || 'No metadata gaps detected', links };
  });
  return { items, limited };
}
