import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { auDate, auTime, pretty, pageItems } from '../../shared/reminders.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

// Daily delegated-authority expiry scan on key personnel. For every KeyBusinessContact
// whose delegated-authority end date has expired or expires within 30 days it:
//   1. posts an alert entry into the Communication Centre diary,
//   2. raises a Notification for each administrator.
// Idempotent: a contact only alerts again when its state changes.
const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];
const HORIZON_DAYS = 30;
const NOTIF_TYPE = 'Key Authority Expiry';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = !!body.dry_run;

    const now = new Date();
    const todayStr = auDate(now);
    const horizonStr = auDate(new Date(now.getTime() + HORIZON_DAYS * 86400000));
    const time = auTime(now);

    const [contactsPage, notifsPage, existingEntries, users] = await Promise.all([
      service.entities.KeyBusinessContact.filter({}, { limit: 500 }),
      service.entities.Notification.filter({ type: NOTIF_TYPE }, { limit: 1000 }),
      service.entities.CommunicationEntry.filter({ entry_kind: 'Message', note_type: 'Authority Expiry Alert' }, { limit: 1000 }),
      service.entities.User.list(),
    ]);

    const seenKeys = new Set(pageItems(notifsPage).map((n) => String(n.message || '')));
    const entryKeys = new Set(pageItems(existingEntries).map((e) => String(e.subject || '')));

    const due = [];
    for (const contact of pageItems(contactsPage)) {
      const end = String(contact.authority_end_date || '').slice(0, 10);
      if (!end) continue;
      const state = end < todayStr ? 'Expired' : (end <= horizonStr ? 'Expiring Soon' : null);
      if (!state) continue;
      const key = `Delegated authority ${state.toLowerCase()}: ${contact.full_name || 'Key contact'} (${end})`;
      if (seenKeys.has(key) || entryKeys.has(key)) continue;
      due.push({
        key,
        contact_id: contact.id,
        full_name: contact.full_name || 'Key contact',
        role_title: contact.role_title || 'Key Personnel',
        authority_level: contact.authority_level || 'Delegated authority',
        state,
        end,
      });
    }

    if (due.length === 0) {
      return Response.json({ success: true, due_items: 0, message: 'No delegated authorities expired or expiring within 30 days.' });
    }

    if (!dryRun) {
      for (const item of due) {
        await service.entities.CommunicationEntry.create({
          entry_kind: 'Message',
          note_type: 'Authority Expiry Alert',
          person_type: 'Employee',
          person_name: item.full_name,
          subject: item.key,
          attention: 'Compliance Manager, Administration',
          body: `${item.state === 'Expired' ? 'EXPIRED' : 'Expiring soon'}: ${item.authority_level} held by ${item.full_name} (${item.role_title}) `
            + `${item.state === 'Expired' ? 'expired' : 'expires'} on ${pretty(item.end)}. `
            + 'Please renew the delegation or update the key personnel register.',
          module: 'Key Contacts',
          entry_date: todayStr,
          entry_time: time,
          sender_name: 'System (Compliance Reminders)',
          email_sent: false,
        });
      }
    }

    const administrators = pageItems(users).filter((u) => ADMIN_ROLES.includes(u.role)
      && u.account_status !== 'Archived' && String(u.email || '').trim());
    const notificationsCreated = [];
    if (!dryRun) {
      for (const admin of administrators) {
        await service.entities.Notification.create({
          type: NOTIF_TYPE,
          recipient: admin.email,
          recipient_id: admin.id,
          message: due.map((d) => d.key).join('; '),
          read: false,
          linked_entity_type: 'KeyBusinessContact',
        });
        notificationsCreated.push(admin.email);
      }
    }

    return Response.json({
      success: true,
      due_items: due.length,
      due_list: due,
      diary_entries_created: dryRun ? 0 : due.length,
      notifications_created: notificationsCreated,
      dry_run: dryRun,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}