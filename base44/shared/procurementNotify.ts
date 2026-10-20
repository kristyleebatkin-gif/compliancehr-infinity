// Shared procurement notification helper: emails every management/finance
// user through the ProcurementOrderAlert template. Used by the alert function
// (entity-triggered) and the end-to-end automation sweep.
export const NOTIFY_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer'];

export function poVariables(po: any, event: string) {
  return {
    po_number: po.po_number || String(po.id),
    supplier_name: po.supplier_name || 'Unknown supplier',
    total: po.total != null ? `$${Number(po.total).toFixed(2)}` : 'Not set',
    status: po.status || 'Draft',
    order_date: po.order_date || '',
    event,
  };
}

export async function notifyProcurementRoles(base44: any, variables: Record<string, string>) {
  const users = await base44.asServiceRole.entities.User.list();
  const recipients = (users || [])
    .filter((u: any) => NOTIFY_ROLES.includes(u.role) && u.email)
    .map((u: any) => u.email);
  const results = await Promise.allSettled(recipients.map((to: string) =>
    base44.asServiceRole.integrations.Core.SendEmail({
      to,
      template_name: 'ProcurementOrderAlert',
      variables,
    })
  ));
  return { notified: results.filter((r: any) => r.status === 'fulfilled').length, recipients };
}