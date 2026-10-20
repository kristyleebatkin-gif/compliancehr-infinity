import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { notifyProcurementRoles, poVariables } from '../../shared/procurementNotify.ts';

// Notifies management and finance staff whenever a purchase order is created
// or its status changes, and logs the entry to the audit trail. Called by the
// Procurement Order Alerts workflow (entity trigger on PurchaseOrder).
const EVENT_LABEL = { create: 'created', update: 'updated' };

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { po_id, event } = await req.json();
    if (!po_id) return Response.json({ error: 'po_id is required' }, { status: 400 });

    const po = await base44.asServiceRole.entities.PurchaseOrder.get(po_id);
    if (!po) return Response.json({ error: 'Purchase order not found' }, { status: 404 });

    const eventLabel = EVENT_LABEL[event] || 'updated';
    const variables = poVariables(po, eventLabel);

    await base44.asServiceRole.entities.AuditLog.create({
      action: `Purchase order ${eventLabel}`,
      entity_type: 'PurchaseOrder',
      record_id: String(po.id),
      record_title: `${variables.po_number} - ${variables.supplier_name}`,
      performed_by: user.full_name || user.email || 'System',
      performed_by_user_id: user.id,
      performed_by_email: user.email || '',
      performed_by_role: user.role || '',
      details: `Purchase order ${variables.po_number} for ${variables.supplier_name} (${variables.total}, status ${variables.status}) was ${eventLabel}.`,
      timestamp: new Date().toISOString(),
    });

    const { notified, recipients } = await notifyProcurementRoles(base44, variables);
    return Response.json({ ok: true, notified, recipients, event: eventLabel });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}