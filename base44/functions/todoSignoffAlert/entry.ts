import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';
// Manager sign-off requests route to the registered manager account.
const MANAGER_EMAIL = 'kristyleebatkin@live.com.au';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const taskId = String(body.entity_id || '').trim();
    const title = String(body.title || '').trim();
    if (!title) return Response.json({ error: 'Task title is required' }, { status: 400 });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    const nowTime = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5);

    const completedBy = String(body.completed_by || 'Staff member').trim();
    const module = String(body.module || 'General').trim();
    const dueDate = String(body.due_date || '').trim();
    const responsible = Array.isArray(body.responsible) ? body.responsible.join(', ') : '';

    const subject = `[Sign-off needed] ${title.slice(0, 100)}`;
    const emailBody = `Manager sign-off request\n\nTask: ${title}\nModule: ${module}\nSubmitted by: ${completedBy}\n${responsible ? `Assigned staff: ${responsible}\n` : ''}${dueDate ? `Due date: ${dueDate}\n` : ''}\nA completed task is awaiting your approval in the Communication Centre task board.\n\nOpen the task board to approve or return it: ${APP_URL}/communications\n\nThis is an automated notification from ComplianceHR Portal.`;

    // One email per task per day.
    const alreadyLogged = await service.entities.CommunicationEntry.filter(
      { subject, entry_date: today }, { limit: 1 },
    );
    if ((alreadyLogged.items || []).length) {
      return Response.json({ ok: true, skipped: true, reason: 'already logged today' });
    }

    const recipients = [{ name: 'Manager (sign-off approver)', email: MANAGER_EMAIL }];
    if (EMAIL_RE.test(MANAGER_EMAIL)) {
      await service.integrations.Core.SendEmail({
        to: MANAGER_EMAIL,
        from_name: 'ComplianceHR Portal',
        subject,
        body: emailBody,
      });
    }

    await service.entities.CommunicationEntry.create({
      entry_kind: 'Message',
      person_type: 'Employee',
      attention: 'Manager sign-off required',
      subject,
      body: emailBody,
      entry_date: today,
      entry_time: nowTime,
      recipients_json: JSON.stringify(recipients),
      sender_name: 'Automated Sign-off Alert',
      sender_email: 'system@compliancehr-portal',
      module: module || 'Tasks',
    });

    return Response.json({ ok: true, emailed: EMAIL_RE.test(MANAGER_EMAIL), logged: true });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});