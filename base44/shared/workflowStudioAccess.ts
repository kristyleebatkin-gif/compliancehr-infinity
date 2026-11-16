import { hasApprovedAccess, resolveUserTenantId, canAccessNav } from './roleMatrix.ts';

export function studioTenant(user: any, businessId: string) {
  const tenantId = resolveUserTenantId(user);
  if (!user?.id || !hasApprovedAccess(user) || !tenantId || tenantId !== businessId || !canAccessNav(user.role, 'compliance')) {
    const error: any = new Error('Approved workflow access to your assigned business is required.');
    error.status = 403;
    throw error;
  }
  return tenantId;
}
const instanceFields = ['id', 'tenant_id', 'definition_id', 'definition_code', 'definition_name', 'definition_version', 'version_id', 'content_hash', 'workflow_type', 'domain', 'state', 'current_node_id', 'current_node_label', 'current_node_type', 'current_step', 'task_kind', 'task_label', 'task_role', 'assigned_role', 'priority', 'sla_hours', 'due_at', 'sla_state', 'evidence_required', 'evidence_count', 'approval_count', 'started_at', 'completed_at'];
const definitionFields = ['id', 'tenant_id', 'code', 'name', 'workflow_type', 'domain', 'description', 'state', 'version', 'template_code', 'nodes_json', 'owner_role', 'sla_hours', 'standard_refs', 'evidence_refs', 'content_hash', 'validated_hash', 'validated_at', 'validated_by', 'published_version_id', 'publisher_independent', 'publication_note', 'published_by', 'published_at', 'author_id', 'author_name'];
export function studioRows(page: any, tenantId: string, limit: number, kind = 'instance') {
  const rows = Array.isArray(page) ? page : page?.items;
  if (!Array.isArray(rows) || rows.some((r: any) => !r || typeof r.id !== 'string' || !r.id || r.tenant_id !== tenantId)) {
    throw new Error('Workflow data is unavailable.');
  }
  const keys = kind === 'definition' ? definitionFields : instanceFields;
  return {
    rows: rows.slice(0, limit).map((r: any) => Object.fromEntries(keys.filter(k => Object.hasOwn(r, k)).map(k => [k, r[k]]))),
    truncated: rows.length > limit || Boolean(page?.next_cursor || page?.nextCursor)
  };
}