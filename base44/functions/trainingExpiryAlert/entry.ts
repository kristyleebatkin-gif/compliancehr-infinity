import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { MANAGEMENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

const SYDNEY = 'Australia/Sydney';
const auDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const prettyDate = (iso) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Confidential staff training data and org-identity sends: management only.
    if (!hasAnyRole(user, MANAGEMENT_ROLES)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    // Certifications that expire exactly 30 days from today (Sydney time)
    // force_date is a test override (YYYY-MM-DD) to preview a specific alert day
    const targetStr = body.force_date || auDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const dueText = prettyDate(targetStr);

    const service = base44.asServiceRole;

    // Staff directory, to resolve each record to an email
    const staff = await service.entities.StaffProfile.list({ limit: 500 });
    const staffById = new Map(staff.items.map((s) => [s.id, s]));
    const staffByName = new Map(staff.items.map((s) => [String(s.full_name || '').toLowerCase(), s]));

    const resolveEmail = (record, idKey, nameKey) => {
      const byId = idKey ? staffById.get(record[idKey]) : null;
      const byName = staffByName.get(String(record[nameKey] || '').toLowerCase());
      return (byId?.email || byName?.email || '').trim().toLowerCase() || null;
    };

    const [completions, certificates] = await Promise.all([
      service.entities.TrainingCompletion.filter({ expiry_date: targetStr, status: { $ne: 'Archived' } }, { limit: 200 }),
      service.entities.Certificate.filter({ expiry_date: targetStr }, { limit: 200 }),
    ]);

    const expiring = [
      ...completions.items.filter((r) => r.learner_type !== 'Participant').map((r) => ({ record: r, name: r.employee_name, idKey: 'employee_id', nameKey: 'employee_name' })),
      ...certificates.items.filter((r) => r.status !== 'Revoked' && r.status !== 'Expired').map((r) => ({ record: r, name: r.staff_name, idKey: 'staff_id', nameKey: 'staff_name' })),
    ];

    // Group by staff member; each group notifies the staff member and their supervisor
    const groups = new Map();
    const unmatched = [];
    for (const item of expiring) {
      const rec = (item.idKey ? staffById.get(item.record[item.idKey]) : null)
        || staffByName.get(String(item.record[item.nameKey] || '').toLowerCase());
      if (!rec || !String(rec.email || '').trim()) { unmatched.push(item.name || 'Unknown staff'); continue; }
      if (!groups.has(rec.id)) {
        const supRec = staffByName.get(String(rec.supervisor || '').trim().toLowerCase());
        const supEmail = supRec && supRec.email && supRec.email.toLowerCase() !== rec.email.toLowerCase()
          ? supRec.email.trim().toLowerCase() : null;
        groups.set(rec.id, { staffName: rec.full_name, staffEmail: rec.email.trim().toLowerCase(), supName: supRec?.full_name || null, supEmail, modules: [] });
      }
      groups.get(rec.id).modules.push(`- ${item.record.module_title || 'Training certification'}`);
    }

    const recipients = [];
    for (const g of groups.values()) {
      recipients.push({ email: g.staffEmail, name: g.staffName, staff: g.staffName, modules: g.modules });
      if (g.supEmail) recipients.push({ email: g.supEmail, name: g.supName || 'Supervisor', staff: g.staffName, modules: g.modules });
    }
    if (dryRun) {
      // Counts only: never expose staff names, emails or certification details.
      return Response.json({ dry_run: true, target_date: targetStr, due_text: dueText, recipient_count: recipients.length, unmatched_count: unmatched.length });
    }

    const results = await Promise.allSettled(recipients.map((r) =>
      service.integrations.Core.SendEmail({
        to: r.email,
        template_name: 'TrainingExpiryReminder',
        variables: {
          first_name: String(r.name || '').split(' ')[0] || 'there',
          staff_name: r.staff,
          item_count: String(r.modules.length),
          item_count_s: r.modules.length === 1 ? '' : 's',
          due_date: dueText,
          items_list: r.modules.join('\n'),
        },
      })
    ));
    const sentCount = recipients.filter((_, i) => results[i].status === 'fulfilled').length;
    const failedCount = recipients.length - sentCount;

    // Return counts only; recipient addresses stay server-side.
    return Response.json({ target_date: targetStr, due_text: dueText, records_found: expiring.length, sent_count: sentCount, failed_count: failedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}