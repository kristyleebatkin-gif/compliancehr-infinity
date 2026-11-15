// Phase 11 design preview. Operational writes use the existing release gate.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, canAccessNav } from '../../shared/roleMatrix.ts';
import { assertWorkflowAction } from '../../shared/workflowSafety.ts';

export function studioRows(page: any, tenantId: string, limit: number) {
  const rows = Array.isArray(page) ? page : page?.items;
  if (!Array.isArray(rows) || rows.some((r: any) => !r || typeof r.id !== 'string' || r.tenant_id !== tenantId)) {
    throw new Error('Workflow data is unavailable.');
  }
  return { rows: rows.slice(0, limit), truncated: rows.length > limit || Boolean(page?.next_cursor || page?.nextCursor) };
}

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    const tenantId = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !tenantId || tenantId !== base44.businessId || !canAccessNav(user.role, 'compliance')) {
      return Response.json({ error: 'Approved workflow access to your assigned business is required.' }, { status: 403 });
    }
    const body = await req.json();
    if (body.action !== 'list') {
      // No draft saves, publication, execution, evidence counters or sends bypass this gate.
      assertWorkflowAction(String(body.action || 'unknown'));
      return Response.json({ error: 'This action is unavailable.' }, { status: 503 });
    }
    const definitions = studioRows(await base44.entities.WorkflowDefinition.filter({ tenant_id: tenantId }, '-updated_date', 201, 0), tenantId, 200);
    const instances = studioRows(await base44.entities.WorkflowInstance.filter({ tenant_id: tenantId }, '-started_at', 301, 0), tenantId, 300);
    return Response.json({
      definitions: definitions.rows, instances: instances.rows,
      truncated: definitions.truncated || instances.truncated,
      writes_enabled: false,
      notice: 'Design preview. Publication and execution remain gated pending version, transaction, evidence and identity acceptance.'
    });
  } catch (error: any) {
    const status = [401, 403, 503].includes(error?.status) ? error.status : 500;
    return Response.json({ error: status === 503 ? 'Workflow publication and execution are not yet available.' : 'Workflow data is unavailable. Refresh or contact your administrator.' }, { status });
  }
});
