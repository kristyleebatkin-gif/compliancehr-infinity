import { hasApprovedAccess, canAccessNav } from './roleMatrix.js';

export function enterpriseScope(user) {
  if (!user?.id || !hasApprovedAccess(user)) return null;
  const tenant = user.tenant_id || user.data?.tenant_id;
  return tenant ? { tenant, key: JSON.stringify([user.id, tenant, user.role, user.account_status, user.access_approved]) } : null;
}

export async function readRegisterCounts({ entities, registers, user, allowedEntities }) {
  const scope = enterpriseScope(user);
  if (!scope || !canAccessNav(user.role, 'enterprise-os')) return {};
  const rows = await Promise.all(registers.map(async ({ entity }) => {
    if (!allowedEntities.has(entity)) return [entity, { status: 'restricted' }];
    try {
      const value = await entities[entity].count({ tenant_id: scope.tenant });
      if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count');
      return [entity, { status: 'ready', value }];
    } catch {
      return [entity, { status: 'unavailable' }];
    }
  }));
  return Object.fromEntries(rows);
}

export const ASSURANCE_COLUMNS = [
  { key: 'object_code', label: 'Reference' }, { key: 'title', label: 'Governance record' },
  { key: 'status', label: 'Status' }, { key: 'business_owner', label: 'Owner' },
  { key: 'review_date', label: 'Review due' }, { key: 'evidence_count', label: 'Recorded evidence references' },
  { key: 'audit_link', label: 'Audit reference' }, { key: 'risk_link', label: 'Risk reference' },
  { key: 'capa_link', label: 'Corrective action reference' }, { key: 'attention', label: 'Review attention' },
];

export async function readBoardAssurance({ entities, user, today }) {
  const scope = enterpriseScope(user);
  if (!scope || !canAccessNav(user.role, 'governance')) throw new Error('Access unavailable');
  const query = { tenant_id: scope.tenant, status: { $ne: 'Archived' } };
  const response = await entities.GovernanceObject.filter(query, { sort: 'review_date', limit: 201 });
  const rows = Array.isArray(response) ? response : response?.items;
  if (!Array.isArray(rows)) throw new Error('Assurance records unavailable');
  // A bounded review, never represented as a complete board pack.
  const limited = rows.length > 200 || Boolean(response?.next_cursor);
  const items = rows.slice(0, 200).map(row => {
    if (!row || typeof row.id !== 'string' || row.tenant_id !== scope.tenant) throw new Error('Assurance scope unavailable');
    const evidence = Array.isArray(row.evidence_documents) ? row.evidence_documents.filter(x => typeof x === 'string' && x.trim()) : [];
    const attention = [];
    if (!row.business_owner?.trim()) attention.push('Owner missing');
    if (!row.review_date) attention.push('Review date missing');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.review_date)) attention.push('Review date invalid');
    else if (row.review_date < today) attention.push('Review overdue');
    if (!evidence.length) attention.push('Evidence reference missing');
    const text = key => typeof row[key] === 'string' ? row[key] : '';
    return { id: row.id, object_code: text('object_code'), title: text('title'),
      business_owner: text('business_owner'), status: text('status'), review_date: text('review_date'),
      audit_link: text('audit_link'), risk_link: text('risk_link'), capa_link: text('capa_link'),
      evidence_count: evidence.length, attention: attention.join('; ') || 'No metadata gaps detected' };
  });
  return { items, limited };
}
