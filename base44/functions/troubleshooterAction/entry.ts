import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Action-taking AI troubleshooter: turns a diagnosis into a raised support ticket
// or an administrator notification, using only bounded inputs from the diagnosis.
const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const problem = String(body.problem || '').slice(0, 3000);
    const module_ = String(body.module || 'Not specified').slice(0, 100);
    const errorMessage = String(body.error_message || '').slice(0, 500);
    const diagnosis = String(body.diagnosis || '').slice(0, 3000);
    const steps = Array.isArray(body.steps) ? body.steps.slice(0, 10).map((s) => String(s).slice(0, 500)) : [];
    const escalate = !!body.escalate;
    const escalateReason = String(body.escalate_reason || '').slice(0, 500);

    if (action === 'create_ticket') {
      const description = [
        problem,
        errorMessage && `Error message: ${errorMessage}`,
        '',
        'AI diagnosis:',
        diagnosis,
        steps.length ? 'Suggested fix steps:\n' + steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '',
        escalate ? `Flagged for escalation: ${escalateReason}` : '',
      ].filter(Boolean).join('\n').slice(0, 4000);

      const ticket = await base44.asServiceRole.entities.HelpDeskTicket.create({
        subject: `Troubleshooter: ${problem.slice(0, 80)}`,
        module: module_,
        description,
        priority: escalate ? 'High' : 'Medium',
        status: 'Open',
        requested_by: user.full_name || '',
        requested_email: user.email || '',
      });
      return Response.json({ success: true, message: 'Support ticket created with the diagnosis attached.', ticket_id: ticket.id });
    }

    if (action === 'notify_admin') {
      const users = await base44.asServiceRole.entities.User.list();
      const admins = users.filter((u) => ADMIN_ROLES.includes(u.role)
        && String(u.email || '').trim() && u.email !== user.email);
      const summary = `${user.full_name || 'A user'} used the AI troubleshooter for the "${module_}" module and needs help.\n\nProblem: ${problem}\n\nDiagnosis: ${diagnosis}`.slice(0, 4000);
      for (const admin of admins) {
        await base44.asServiceRole.entities.Notification.create({
          type: 'Troubleshooter Escalation',
          recipient: admin.email,
          recipient_id: admin.id,
          message: summary,
          read: false,
          linked_entity_type: 'User',
        }).catch((error) => console.error(error));
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: 'Troubleshooter escalation needs your review',
          body: summary,
        }).catch((error) => console.error(error));
      }
      return Response.json({ success: true, message: admins.length ? `Notified ${admins.length} administrator${admins.length === 1 ? '' : 's'} with the diagnosis.` : 'No other administrators are registered to notify.' });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'Action failed.' }, { status: 500 });
  }
}