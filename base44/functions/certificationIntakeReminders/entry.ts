import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { auDate, pretty, pageItems } from '../../shared/reminders.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

// Daily scan for staff compliance certifications and intake (onboarding/offboarding)
// tasks that are approaching (or past) their expiry/due date. For each affected
// staff member it emails one consolidated reminder and records a Notification
// (also used for idempotency: each item state only alerts once).
//   - Certificates expiring within 30 days, or already expired (Certificate entity).
//   - Intake pack tasks due within 7 days or overdue (TodoTask "Onboarding/Offboarding pack" titles).

const NOTIF_TYPE = 'Certification & Intake Reminder';
const CERT_HORIZON_DAYS = 30;
const TASK_HORIZON_DAYS = 7;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    const now = new Date();
    const todayStr = auDate(now);
    const certHorizonStr = auDate(new Date(now.getTime() + CERT_HORIZON_DAYS * 86400000));
    const taskHorizonStr = auDate(new Date(now.getTime() + TASK_HORIZON_DAYS * 86400000));

    const [certsPage, tasksPage, notifsPage, staffPage] = await Promise.all([
      service.entities.Certificate.filter({ expiry_date: { $exists: true, $ne: null } }, { limit: 1000 }),
      service.entities.TodoTask.filter(
        { title: { $regex: '^(Onboarding|Offboarding) pack', $options: 'i' }, due_date: { $exists: true, $ne: null } },
        { limit: 1000 },
      ),
      service.entities.Notification.filter({ type: NOTIF_TYPE }, { limit: 1000 }),
      service.entities.StaffProfile.filter({}, { limit: 500, fields: ['full_name', 'email'] }),
    ]);

    const seenKeys = new Set(pageItems(notifsPage).map((n) => String(n.message || '')));
    const staffByEmail = new Map(pageItems(staffPage)
      .filter((s) => s.email)
      .map((s) => [String(s.email || '').trim().toLowerCase(), s]));
    const staffByName = new Map(pageItems(staffPage)
      .filter((s) => s.full_name)
      .map((s) => [String(s.full_name || '').trim().toLowerCase(), s]));

    // Recipient buckets: one consolidated email per staff member.
    const buckets = new Map(); // email -> { name, certs: [], tasks: [] }
    const bucketFor = (email, name) => {
      const key = String(email).trim().toLowerCase();
      if (!buckets.has(key)) buckets.set(key, { name: name || 'there', certs: [], tasks: [] });
      return buckets.get(key);
    };

    const certAlerts = [];
    for (const cert of pageItems(certsPage)) {
      if (cert.status === 'Revoked') continue;
      const expiry = String(cert.expiry_date || '').slice(0, 10);
      if (!expiry) continue;
      const state = expiry < todayStr ? 'Expired' : (expiry <= certHorizonStr ? 'Expiring Soon' : null);
      if (!state) continue;
      const staffName = cert.staff_name || 'Unknown staff member';
      const key = `Certification ${state.toLowerCase()}: ${cert.module_title || 'Certificate'} - ${staffName} (${expiry})`;
      if (seenKeys.has(key)) continue;
      certAlerts.push({ key, state, expiry, staffName, title: cert.module_title || 'Certificate' });
      const profile = staffByName.get(String(staffName).trim().toLowerCase());
      const email = profile?.email;
      if (email) bucketFor(email, profile.full_name).certs.push({ key, title: cert.title || cert.module_title, state, expiry });
    }

    const taskAlerts = [];
    const OPEN_TASK_STATUSES = ['Pending', 'Open', 'In Progress'];
    for (const task of pageItems(tasksPage)) {
      if (!OPEN_TASK_STATUSES.includes(task.status)) continue;
      const due = String(task.due_date || '').slice(0, 10);
      if (!due || due > taskHorizonStr) continue;
      const state = due < todayStr ? 'Overdue' : (due === todayStr ? 'Due Today' : 'Due Soon');
      const key = `Intake task ${state.toLowerCase()}: ${task.title} - due ${due}`;
      if (seenKeys.has(key)) continue;
      taskAlerts.push({ key, state, due, title: task.title });
      const responsibleNames = Array.isArray(task.responsible) ? task.responsible : [];
      const recipients = new Set();
      for (const email of [task.assigned_email, ...(task.responsible_emails || [])]) {
        if (email) recipients.add(String(email).trim().toLowerCase());
      }
      for (const name of responsibleNames) {
        const profile = staffByName.get(String(name || '').trim().toLowerCase());
        if (profile?.email) recipients.add(String(profile.email).trim().toLowerCase());
      }
      for (const email of recipients) {
        bucketFor(email, staffByEmail.get(email)?.full_name).tasks.push({ key, title: task.title, state, due });
      }
    }

    if (certAlerts.length === 0 && taskAlerts.length === 0) {
      return Response.json({ success: true, message: 'No certifications or intake tasks expiring within their reminder horizons.' });
    }

    let emailsSent = 0;
    const failures = [];
    if (!dryRun) {
      for (const [email, bucket] of buckets) {
        const certSection = bucket.certs.length
          ? `COMPLIANCE CERTIFICATIONS\n${bucket.certs.map((c) => `- "${c.title}" ${c.state === 'Expired' ? 'expired' : 'expires'} ${pretty(c.expiry)}`).join('\n')}`
          : '';
        const taskSection = bucket.tasks.length
          ? `INTAKE TASKS\n${bucket.tasks.map((t) => `- "${t.title}" ${t.state === 'Overdue' ? 'overdue since' : t.state.toLowerCase()} ${pretty(t.due)}`).join('\n')}`
          : '';
        const sections = [certSection, taskSection].filter(Boolean).join('\n\n');
        try {
          await service.integrations.Core.SendEmail({
            to: email,
            template_name: 'CertificationIntakeReminder',
            variables: {
              first_name: String(bucket.name || '').split(' ')[0] || 'there',
              item_count: String(bucket.certs.length + bucket.tasks.length),
              cert_section: certSection || 'None right now.',
              task_section: taskSection || 'None right now.',
            },
          });
          emailsSent += 1;
        } catch (error) {
          failures.push(`${email}: ${String(error?.message || error)}`);
        }
        // One Notification per alert key records what has already been reminded.
        const keys = [...bucket.certs.map((c) => c.key), ...bucket.tasks.map((t) => t.key)];
        for (const key of keys) {
          if (seenKeys.has(key)) continue;
          await service.entities.Notification.create({
            type: NOTIF_TYPE,
            recipient: email,
            message: key,
            read: false,
          });
          seenKeys.add(key);
        }
      }
    }

    return Response.json({
      ok: true,
      certification_alerts: certAlerts.length,
      intake_task_alerts: taskAlerts.length,
      staff_emailed: dryRun ? 0 : emailsSent,
      dry_run: dryRun,
      failures,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}