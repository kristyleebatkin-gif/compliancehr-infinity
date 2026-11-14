import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const today = new Date().toISOString().slice(0, 10);

    const open = [];
    let cursor = null;
    do {
      const page = await service.entities.AuditAction.filter(
        { status: { $in: ['Open', 'In Progress'] } },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      open.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    const overdue = open.filter((a) => a.due_date && a.due_date < today);
    let emailed = 0;
    let notified = 0;
    const failures = [];

    for (const action of overdue) {
      const subject = `[Overdue] Corrective action: ${String(action.title || '').slice(0, 100)}`;
      const body = `Overdue corrective action\n\nAction: ${action.title || ''}\nLinked audit: ${action.audit_title || '-'}\nAllocated to: ${action.allocated_to || '-'}\nPriority: ${action.priority || '-'}\nDue date: ${action.due_date} (overdue)\n\n${action.description || ''}\n\nOpen the audit actions register to complete and close this action with evidence: ${APP_URL}/compliance\n\nAn action cannot be closed without a named owner and closure evidence. This is an automated escalation from ComplianceHR Infinity.`;
      const to = String(action.allocated_email || '').trim();

      if (EMAIL_RE.test(to)) {
        try {
          await service.integrations.Core.SendEmail({ to, from_name: 'ComplianceHR Infinity', subject, body });
          emailed += 1;
        } catch (error) {
          failures.push(String(error?.message || error));
        }
      }

      // Log to the Communication Centre and raise an in-app notification (once per action per day).
      const alreadyLogged = await service.entities.CommunicationEntry.filter({ subject, entry_date: today }, { limit: 1 });
      if (!(alreadyLogged.items || []).length) {
        try {
          await service.entities.CommunicationEntry.create({
            entry_kind: 'Message',
            person_type: 'Employee',
            attention: action.allocated_to || '',
            subject,
            body,
            entry_date: today,
            recipients_json: JSON.stringify([{ name: action.allocated_to || '', email: to }]),
            sender_name: 'Automated Action Escalation',
            sender_email: 'system@compliancehr-infinity',
            module: 'Compliance',
          });
        } catch (error) {
          failures.push(String(error?.message || error));
        }
        try {
          const users = await service.entities.User.list();
          const match = (users.items || []).find((u) => String(u.email || '').toLowerCase() === String(to).toLowerCase());
          if (match) {
            await service.entities.Notification.create({
              type: 'Overdue Escalation',
              recipient: match.full_name || match.email,
              recipient_id: match.id,
              message: `Corrective action overdue: ${action.title} (due ${action.due_date}). Close it out with evidence.`,
              linked_entity_type: 'AuditAction',
              linked_entity_id: action.id,
              action_url: '/compliance',
            });
            notified += 1;
          }
        } catch (error) {
          failures.push(String(error?.message || error));
        }
      }
    }

    return Response.json({ ok: true, checked: open.length, overdue: overdue.length, emails_sent: emailed, notifications: notified, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});