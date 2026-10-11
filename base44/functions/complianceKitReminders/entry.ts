import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SYDNEY = 'Australia/Sydney';
const auDate = (d) => new Intl.DateTimeFormat('en-CA', {
  timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(d);
const pretty = (iso) => iso
  ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T00:00:00Z`))
  : '';
const addDays = (iso, days) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const KIT_CHECK_TYPES = ['Natural Disaster Kit Check', 'First Aid Kit Check', 'Fire Safety Equipment Check'];
const SIX_MONTHS_DAYS = 182;
const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    const today = new Date();
    const todayStr = auDate(today);
    const horizonStr = auDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));

    const [checks, drills, entries, existingNotifs, users] = await Promise.all([
      service.entities.SafetyCheck.filter({}, { limit: 500 }),
      service.entities.EmergencyDrill.filter({}, { limit: 500 }),
      service.entities.ComplianceChecklistEntry.filter({}, { limit: 500 }),
      service.entities.Notification.filter({ type: 'Compliance Kit Due' }, { limit: 500 }),
      service.entities.User.list(),
    ]);
    const pageItems = (page) => page?.items || page || [];
    const checkItems = pageItems(checks);
    const drillItems = pageItems(drills);
    const entryItems = pageItems(entries);
    const notifItems = pageItems(existingNotifs);
    const userItems = pageItems(users);

    const due = [];

    for (const checkType of KIT_CHECK_TYPES) {
      const forType = checkItems
        .filter((c) => c.check_type === checkType)
        .sort((a, b) => String(b.date_completed || '').localeCompare(String(a.date_completed || '')));
      const latest = forType[0];
      if (!latest) {
        due.push({ label: checkType, due: todayStr, note: 'No check recorded yet' });
        continue;
      }
      const dueDate = latest.next_due_date || addDays(latest.date_completed, SIX_MONTHS_DAYS);
      if (dueDate && dueDate <= horizonStr) {
        due.push({ label: checkType, due: dueDate, note: latest.location || '' });
      }
    }

    const fireDrills = drillItems
      .filter((d) => d.drill_type === 'Fire Evacuation')
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const latestDrill = fireDrills[0];
    const drillDue = latestDrill ? addDays(latestDrill.date, SIX_MONTHS_DAYS) : todayStr;
    if (!latestDrill || (drillDue && drillDue <= horizonStr)) {
      due.push({
        label: 'Fire Evacuation Drill',
        due: drillDue || todayStr,
        note: latestDrill ? (latestDrill.location || '') : 'No fire drill recorded yet',
      });
    }

    for (const entry of entryItems) {
      if (entry.next_due_date && entry.next_due_date <= horizonStr) {
        due.push({
          label: entry.title || entry.checklist_key || 'Compliance checklist',
          due: entry.next_due_date,
          note: entry.section || 'Compliance checklist',
        });
      }
    }

    if (due.length === 0) {
      return Response.json({ success: true, due_items: 0, message: 'No compliance items due within 30 days.' });
    }

    const administrators = userItems.filter((candidate) => ADMIN_ROLES.includes(candidate.role)
      && candidate.account_status !== 'Archived' && String(candidate.email || '').trim());
    const itemsList = due
      .map((item) => `- ${item.label}: due ${pretty(item.due)}${item.note ? ` (${item.note})` : ''}`)
      .join('\n');

    const sentTo = [];
    const notificationsCreated = [];
    for (const admin of administrators) {
      const message = `${due.length} compliance item(s) due: ${due.map((d) => d.label).join(', ')}.`;
      const already = notifItems.some((n) => n.message === message && n.recipient_id === admin.id);
      if (!already) {
        await service.entities.Notification.create({
          type: 'Compliance Kit Due',
          recipient: admin.email || admin.full_name || admin.role,
          recipient_id: admin.id,
          message,
          read: false,
          linked_entity_type: 'ComplianceChecklistEntry',
        });
        notificationsCreated.push(admin.email);
      }
      if (dryRun) {
        sentTo.push(admin.email);
        continue;
      }
      const result = await service.integrations.Core.SendEmail({
        to: admin.email,
        template_name: 'ComplianceKitReminder',
        variables: {
          first_name: String(admin.full_name || '').split(' ')[0] || 'there',
          item_count: String(due.length),
          items_list: itemsList,
        },
      }).catch((error) => ({ error: error.message }));
      if (!result.error) sentTo.push(admin.email);
    }

    return Response.json({
      success: true,
      due_items: due.length,
      due_list: due,
      emails_sent: dryRun ? [] : sentTo,
      notifications_created: notificationsCreated,
      dry_run: dryRun,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}