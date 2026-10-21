import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { auDate, pretty } from '../../shared/reminders.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const administrator = user.role === 'admin';
    const { dry_run = false } = await req.json();
    const service = base44.asServiceRole;
    const titles = { "Driver's Licence Details": "Driver's licence", 'Car Registration Details': 'Vehicle registration (rego)', 'Medicare Card Details': 'Medicare card' };
    const users = administrator ? await service.entities.User.list() : [user];
    const byEmail = new Map(users.filter((u) => u.account_status !== 'Archived' && u.email).map((u) => [u.email.trim().toLowerCase(), u]));
    const today = auDate(new Date());
    let cursor, checked = 0, due = 0, created = 0, invalidDates = 0;
    do {
      const profileQuery = administrator ? { email: { $exists: true, $ne: null } } : { email: user.email };
      const page = await service.entities.StaffProfile.filter(profileQuery, { limit: 50, ...(cursor ? { cursor } : {}) });
      for (const profile of page.items) {
        const recipient = byEmail.get(String(profile.email || '').trim().toLowerCase());
        if (!recipient || profile.status === 'Inactive' || profile.status === 'Archived') continue;
        for (const [title, label] of Object.entries(titles)) {
          const entries = await service.entities.StaffFormEntry.filter({ staff_id: profile.id, form_type: title }, { sort: '-updated_date', limit: 1 });
          const entry = entries.items[0];
          if (!entry?.answers) continue;
          const answers = JSON.parse(entry.answers);
          const expiry = String(answers['Expiry date'] || answers['Expiry Date'] || '').trim();
          if (!expiry) continue;
          checked++;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) || Number.isNaN(Date.parse(`${expiry}T00:00:00Z`)) || new Date(`${expiry}T00:00:00Z`).toISOString().slice(0, 10) !== expiry) { invalidDates++; continue; }
          const days = Math.round((Date.parse(`${expiry}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
          const stage = days < 0 ? 'expired' : days === 0 ? 'due today' : days <= 7 ? 'within 7 days' : days <= 14 ? 'within 14 days' : days <= 30 ? 'within 30 days' : null;
          if (!stage) continue;
          const message = `${label}: ${stage}. ${days < 0 ? 'Expired' : 'Expires'} on ${pretty(expiry)}. Please renew and update the expiry date in My Profile.`;
          const query = { recipient_id: recipient.id, type: 'Expiry Alert', linked_entity_type: 'StaffProfile', linked_entity_id: profile.id, message };
          if (await service.entities.Notification.count(query)) continue;
          due++;
          if (!dry_run) {
            await service.entities.Notification.create({ ...query, recipient: recipient.email, read: false, action_url: '/my-profile' });
            created++;
          }
        }
      }
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
    return Response.json({ success: true, dry_run, checked, due, created, invalid_dates: invalidDates });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}