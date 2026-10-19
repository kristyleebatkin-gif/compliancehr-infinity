import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { computeStaffRiskScores, RISK_ALERT_THRESHOLD, exceedsRiskThreshold } from '../../shared/staffRiskScore.ts';

const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Triggered immediately (workflows) whenever staff compliance data changes:
// scores every staff member and, for anyone whose compliance risk score
// exceeds the threshold, creates a deduplicated in-app notification for each
// admin so the HR dashboard picks it up straight away.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const service = base44.asServiceRole;

    const rows = await computeStaffRiskScores(service);
    const flagged = rows.filter(exceedsRiskThreshold);
    if (!flagged.length) {
      return Response.json({ ok: true, threshold: RISK_ALERT_THRESHOLD, flagged: 0, notifications_created: 0 });
    }

    const [usersPage, notifPage] = await Promise.all([
      service.entities.User.list(),
      service.entities.Notification.filter({ type: 'General' }, { limit: 1000 }),
    ]);
    const users = Array.isArray(usersPage) ? usersPage : usersPage.items || [];
    const admins = users.filter((u) => u.role === 'admin' && u.email && EMAIL_RE.test(String(u.email).trim()));
    const existing = new Set((notifPage.items || []).map((n) => String(n.message || '')));

    const records = [];
    for (const r of flagged) {
      const message = `[Risk Alert] ${r.name} — compliance risk score ${r.risk_points} exceeds the alert threshold of ${RISK_ALERT_THRESHOLD} (clear score ${r.score}/100, ${r.overdue_tasks} overdue tasks, ${r.expired_docs} expired documents, ${r.expired_certs} expired certificates).`;
      if (existing.has(message)) continue;
      for (const admin of admins) {
        records.push({
          type: 'General',
          recipient: String(admin.email).trim(),
          recipient_id: admin.id,
          message,
          linked_entity_type: 'StaffProfile',
          linked_entity_id: r.staff_id,
          action_url: `${APP_URL}/staff/${r.staff_id}`,
        });
      }
    }

    let notificationsCreated = 0;
    if (records.length) {
      const created = await service.entities.Notification.bulkCreate(records);
      notificationsCreated = (created && created.length) || records.length;
    }

    return Response.json({
      ok: true,
      threshold: RISK_ALERT_THRESHOLD,
      flagged: flagged.length,
      flagged_names: flagged.map((r) => `${r.name} (${r.risk_points})`),
      notifications_created: notificationsCreated,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}