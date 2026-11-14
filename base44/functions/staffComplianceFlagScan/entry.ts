import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { computeStaffCompliance, isFlagged, FLAG_THRESHOLD } from '../../shared/staffCompliance.ts';

const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Scheduled scan (workflow): flags staff whose compliance progress (onboarding
// pack completion) is below 80%. Records an in-app notification per admin for
// each currently flagged staff member (deduplicated by message) and emails
// admins only when a staff member newly drops below the threshold.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!await authorizeSystemCall(base44)) return Response.json({ error: 'Approved management access required.' }, { status: 403 });
    const service = base44.asServiceRole;

    const rows = (await computeStaffCompliance(service)).filter(isFlagged);
    if (!rows.length) return Response.json({ ok: true, flagged: 0, new_flags: 0, notifications_created: 0 });

    const [usersPage, notifPage] = await Promise.all([
      service.entities.User.list(),
      service.entities.Notification.filter({ type: 'General' }, { limit: 1000 }),
    ]);
    const users = Array.isArray(usersPage) ? usersPage : usersPage.items || [];
    const admins = users.filter((u) => u.role === 'admin' && u.email && EMAIL_RE.test(String(u.email).trim()));
    const existing = new Set((notifPage.items || []).map((n) => String(n.message || '')));

    // Only alert on staff who are not already flagged in notifications.
    const fresh = rows.filter((r) => {
      const message = flagMessage(r);
      return !existing.has(message);
    });

    let notificationsCreated = 0;
    if (admins.length) {
      const records = [];
      for (const r of rows) {
        for (const admin of admins) {
          records.push({
            type: 'General',
            recipient: String(admin.email).trim(),
            recipient_id: admin.id,
            message: flagMessage(r),
            linked_entity_type: 'StaffProfile',
            action_url: `${APP_URL}/staff-progress`,
          });
        }
      }
      if (records.length) {
        const created = await service.entities.Notification.bulkCreate(records);
        notificationsCreated = (created && created.length) || records.length;
      }
    }

    // Email admins only when someone newly dropped below the threshold.
    let emailed = 0;
    if (fresh.length && admins.length) {
      const listText = fresh.map((r) => `- ${r.name}: ${r.pct}% (${r.done}/${r.total} onboarding steps${r.overdue ? `, ${r.overdue} overdue` : ''})`).join('\n');
      const subject = `[Compliance flag] ${fresh.length} staff member${fresh.length === 1 ? '' : 's'} below ${FLAG_THRESHOLD}% compliance progress`;
      const body = `The following staff member${fresh.length === 1 ? ' is' : 's are'} below the ${FLAG_THRESHOLD}% compliance progress threshold:\n\n${listText}\n\nView the staff progress dashboard: ${APP_URL}/staff-progress`;
      for (const admin of admins) {
        try {
          await service.integrations.Core.SendEmail({ to: String(admin.email).trim(), subject, body, from_name: 'ComplianceHR Infinity' });
          emailed += 1;
        } catch (err) {
          // One failed admin email should not stop the scan.
        }
      }
    }

    return Response.json({
      ok: true,
      flagged: rows.length,
      flagged_names: rows.map((r) => `${r.name} (${r.pct}%)`),
      new_flags: fresh.length,
      notifications_created: notificationsCreated,
      admins_emailed: emailed,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});

function flagMessage(r) {
  return `[Compliance Flag] ${r.name} — ${r.pct}% compliance progress (below ${FLAG_THRESHOLD}%)`;
}