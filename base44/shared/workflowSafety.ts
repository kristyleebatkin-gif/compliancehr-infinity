import { hasApprovedAccess } from './roleMatrix.ts';

export const WORKFLOW_WRITES_ENABLED = false;
export const WORKFLOW_WRITE_MESSAGE = 'This new workflow is read-only while transaction, identity and version checks are verified. Use the existing module for approved changes.';

export function assertWorkflowAction(action: string) {
  if (action !== 'assess' && !WORKFLOW_WRITES_ENABLED) {
    const error: any = new Error(WORKFLOW_WRITE_MESSAGE);
    error.status = 503;
    throw error;
  }
}

export function connectorOwnerAllows(tenantId: string, configuredOwner: string | undefined) {
  return Boolean(tenantId && configuredOwner && tenantId === configuredOwner.trim());
}

export async function readWorkflowRecords(dao: any, query: any = {}, options: any = {}) {
  const rows: any[] = [];
  const seen = new Set<string>();
  const size = 100;
  for (let offset = 0; offset < 10000; offset += size) {
    const page = await dao.filter(query, options.sort || '-created_date', size, offset);
    if (!Array.isArray(page)) throw new Error('Record response was not a complete supported page. No readiness result is available.');
    for (const record of page) {
      if (!record || typeof record.id !== 'string' || !record.id || seen.has(record.id)) {
        throw new Error('Record pagination was malformed or repeated. No readiness result is available.');
      }
      seen.add(record.id);
      rows.push(record);
    }
    if (page.length < size) return rows;
  }
  throw new Error('Record scan exceeded its safety limit. No readiness result is available.');
}

export async function requireWorkflowAdministrator(base44: any, user: any) {
  if (!hasApprovedAccess(user) || !['admin', 'Provider Administrator'].includes(user.role)) {
    const error: any = new Error('An active approved provider administrator is required.');
    error.status = 403;
    throw error;
  }
  const tenantId = base44.businessId;
  const own = user.tenant_id || user.data?.tenant_id;
  if (!tenantId || own !== tenantId) {
    const error: any = new Error('The authenticated business scope does not match this account.');
    error.status = 403;
    throw error;
  }
  const memberships = await readWorkflowRecords(base44.asServiceRole.entities.TenantMembership,
    { user_id: user.id, tenant_id: tenantId, status: 'Active' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const active = memberships.some((m: any) => m.user_id === user.id && m.tenant_id === tenantId && m.status === 'Active' &&
    (!m.starts_on || m.starts_on <= today) && (!m.ends_on || m.ends_on >= today));
  if (!active) {
    const error: any = new Error('An active business membership is required.');
    error.status = 403;
    throw error;
  }
  return tenantId;
}
