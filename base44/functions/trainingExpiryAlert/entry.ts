import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SYDNEY = 'Australia/Sydney';
const auDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const prettyDate = (iso) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    // Certifications that expire exactly one week from today (Sydney time)
    // force_date is a test override (YYYY-MM-DD) to preview a specific alert day
    const targetStr = body.force_date || auDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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

    const byEmail = new Map();
    const unmatched = [];
    for (const item of expiring) {
      const email = resolveEmail(item.record, item.idKey, item.nameKey);
      if (!email) { unmatched.push(item.name || 'Unknown staff'); continue; }
      if (!byEmail.has(email)) byEmail.set(email, { name: item.name || email, modules: [] });
      byEmail.get(email).modules.push(`- ${item.record.module_title || 'Training certification'}`);
    }

    const recipients = [...byEmail.entries()].map(([email, info]) => ({ email, name: info.name, modules: info.modules }));
    if (dryRun) {
      return Response.json({ dry_run: true, target_date: targetStr, due_text: dueText, would_notify: recipients, unmatched });
    }

    const results = await Promise.allSettled(recipients.map((r) =>
      service.integrations.Core.SendEmail({
        to: r.email,
        template_name: 'TrainingExpiryReminder',
        variables: {
          first_name: String(r.name || '').split(' ')[0] || 'there',
          item_count: String(r.modules.length),
          item_count_s: r.modules.length === 1 ? '' : 's',
          due_date: dueText,
          items_list: r.modules.join('\n'),
        },
      })
    ));
    const sentTo = recipients.filter((_, i) => results[i].status === 'fulfilled').map((r) => r.email);
    const failed = recipients.filter((_, i) => results[i].status === 'rejected').map((r) => r.email);

    return Response.json({ target_date: targetStr, due_text: dueText, records_found: expiring.length, sent_to: sentTo, failed, unmatched });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}