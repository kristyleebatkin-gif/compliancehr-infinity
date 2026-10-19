import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const pageItems = (page) => page?.items || page || [];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [participants, reviews, trainComp, policies, incidents, existingTasks, existingNotifs, users] = await Promise.all([
      base44.entities.ParticipantProfile.filter({}, { limit: 2000 }).catch(() => []),
      base44.entities.ParticipantReview.filter({}, { limit: 2000 }).catch(() => []),
      base44.entities.TrainingCompletion.filter({}, { limit: 2000 }).catch(() => []),
      base44.entities.Policy.filter({}, { limit: 2000 }).catch(() => []),
      base44.entities.Incident.filter({}, { limit: 2000 }).catch(() => []),
      base44.entities.TodoTask.filter({}, { limit: 2000 }).catch(() => []),
      base44.asServiceRole.entities.Notification.filter({}, { limit: 2000 }).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => []),
    ]);

    const today = new Date();
    const daysSince = (d) => d ? (today - new Date(d)) / 86400000 : Infinity;
    const daysUntil = (d) => d ? (new Date(d) - today) / 86400000 : Infinity;

    const participantList = pageItems(participants);
    const reviewsList = pageItems(reviews);
    const trainCompList = pageItems(trainComp);
    const policiesList = pageItems(policies);
    const incidentsList = pageItems(incidents);
    const existingTasksList = pageItems(existingTasks);
    const existingNotifsList = pageItems(existingNotifs);
    const usersList = pageItems(users);

    const taskExists = (title) => existingTasksList.some((t) => t.title === title);
    const administrators = usersList.filter((candidate) => ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'].includes(candidate.role) && candidate.account_status !== 'Archived');
    const notifExists = (type, recipientId, message) =>
      existingNotifsList.some((n) => n.type === type && n.recipient_id === recipientId && n.message === message);

    const created = { tasks: 0, notifications: 0 };
    const notifyAdministrators = async (type, message, linkedEntityType, linkedEntityId) => {
      for (const administrator of administrators) {
        if (notifExists(type, administrator.id, message)) continue;
        await base44.asServiceRole.entities.Notification.create({
          type,
          recipient: administrator.email || administrator.full_name || administrator.role,
          recipient_id: administrator.id,
          message,
          read: false,
          linked_entity_type: linkedEntityType,
          linked_entity_id: linkedEntityId,
        });
        created.notifications++;
      }
    };

    // 1. Participant Review Reminder (90 days after last review)
    for (const p of participantList) {
      if (p.status !== 'Active') continue;
      const pReviews = reviewsList.filter((r) => r.participant_id === p.id);
      const latest = pReviews.sort((a, b) => new Date(b.review_date || 0) - new Date(a.review_date || 0))[0];
      const overdue = !latest || daysSince(latest.review_date) >= 90;
      if (overdue) {
        const title = `Conduct participant review for ${p.full_name}`;
        if (!taskExists(title)) {
          await base44.entities.TodoTask.create({ title, task_type: 'Review Reminder', assigned_to: p.support_coordinator || 'Team Leader', due_date: new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10), status: 'Open', priority: 'High', linked_entity_type: 'ParticipantProfile', linked_entity_id: p.id });
          created.tasks++;
        }
      }
    }

    // 2. Training Expiry (30 days before expiry)
    for (const t of trainCompList) {
      const d = daysUntil(t.expiry_date);
      if (d >= 0 && d <= 30 && t.status !== 'Expired') {
        const message = `Training "${t.module_title}" for ${t.employee_name} expires on ${t.expiry_date}.`;
        await notifyAdministrators('Training Expiry', message, 'TrainingCompletion', t.id);
      }
    }

    // 3. Policy Review (30 days before review date)
    for (const p of policiesList) {
      const d = daysUntil(p.review_date);
      if ((d >= 0 && d <= 30) || p.status === 'Under Review' || p.status === 'Expired') {
        const message = `Policy "${p.document_name}" is due for review on ${p.review_date || 'soon'} (status: ${p.status}).`;
        await notifyAdministrators('Policy Review', message, 'Policy', p.id);
      }
    }

    // 4. Incident Escalation (high/critical severity)
    for (const inc of incidentsList) {
      if ((inc.severity === 'High' || inc.severity === 'Critical') && inc.status !== 'Resolved' && inc.status !== 'Closed') {
        const message = `High severity incident "${inc.title}" (${inc.incident_id || ''}) requires administrator attention.`;
        await notifyAdministrators('Incident Escalation', message, 'Incident', inc.id);
      }
    }

    return Response.json({ success: true, created, message: `Created ${created.tasks} task(s) and ${created.notifications} notification(s).` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}