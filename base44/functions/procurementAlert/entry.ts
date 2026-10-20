import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Notifies management and finance staff whenever a purchase order is created
// or its status changes, and logs the entry to the audit trail. Called by the
// Procurement Order Alerts workflow (entity trigger on PurchaseOrder).
const NOTIFY_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer'];
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
    const variables = {
      po_number: po.po_number || String(po.id),
      supplier_name: po.supplier_name || 'Unknown supplier',
      total: po.total != null ? `$${Number(po.total).toFixed(2)}` : 'Not set',
      status: po.status || 'Draft',
      order_date: po.order_date || '',
      event: eventLabel,
    };

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

    const users = await base44.asServiceRole.entities.User.list();
    const recipients = (users || [])
      .filter((u) => NOTIFY_ROLES.includes(u.role) && u.email)
      .map((u) => u.email);

    const results = await Promise.allSettled(recipients.map((to) =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to,
        template_name: 'ProcurementOrderAlert',
        variables,
      })
    ));

    const notified = results.filter((r) => r.status === 'fulfilled').length;
    return Response.json({ ok: true, notified, recipients, event: eventLabel });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}