// Phase 11 design preview. Operational writes use the existing release gate.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { studioTenant, studioRows } from '../../shared/workflowStudioAccess.ts';
import { assertWorkflowAction } from '../../shared/workflowSafety.ts';

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    const tenantId = studioTenant(user, base44.businessId);
    const body = await req.json();
    if (body.action !== 'list') {
      // No draft saves, publication, execution, evidence counters or sends bypass this gate.
      assertWorkflowAction(String(body.action || 'unknown'));
      return Response.json({ error: 'This action is unavailable.' }, { status: 503 });
    }
    const definitions = studioRows(await base44.entities.WorkflowDefinition.filter({ tenant_id: tenantId }, '-updated_date', 201, 0), tenantId, 200, 'definition');
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
