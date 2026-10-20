import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Review & audit aging engine. Runs daily from the "Review Aging Alerts" workflow.
// Every Risk, Incident, Feedback, Complaint, Issue/Concern, Take 5 and Safety check
// is aged from its entry date (or last completed review) and coloured:
//   yellow (review due soon) at 2 months (60 days),
//   red (overdue) at 10 weeks (70 days),
//   audit-due alert the day before 3 months (89 days).
// Managers are alerted at each threshold (once per cycle) and every alert is
// stamped with the time, date and cycle on the record and in the audit log.

const SCANS = [
  { entity: 'Risk', label: 'Risk' },
  { entity: 'Incident', label: 'Incident' },
  { entity: 'Feedback', label: 'Feedback' },
  { entity: 'Complaint', label: 'Complaint' },
  { entity: 'IssueConcernBarrier', label: 'Issue / Concern' },
  { entity: 'TakeFive', label: 'Take 5' },
  { entity: 'SafetyCheck', label: 'Safety check' },
];

const MANAGER_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

const THRESHOLDS = [
  { days: 60, field: 'review_alert_60_sent', label: 'Review due soon (yellow)' },
  { days: 70, field: 'review_alert_70_sent', label: 'Review overdue (red)' },
  { days: 89, field: 'review_alert_89_sent', label: 'Audit due - day before 3 months' },
];

const titleOf = (r) =>
  r.title || r.name || r.risk_name || r.summary || r.subject || r.feedback_type ||
  r.complaint_type || r.check_type || r.issue_type || r.item || 'Untitled record';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const dueItems = [];
    const perEntityCounts = [];

    for (const { entity, label } of SCANS) {
      const records = await service.entities[entity].list();
      const updates = [];
      for (const r of records || []) {
        const baseDate = r.review_completed_date || r.created_date;
        if (!baseDate) continue;
        const days = Math.floor((now - new Date(baseDate).getTime()) / day);
        const status = days >= 89 ? 'audit_due' : days >= 70 ? 'overdue' : days >= 60 ? 'due_soon' : 'current';

        const patch = { review_status: status, review_status_checked_at: new Date().toISOString() };
        const alerts = [];
        for (const t of THRESHOLDS) {
          if (days >= t.days && !r[t.field]) {
            patch[t.field] = true;
            alerts.push(t);
          }
        }
        if (Object.keys(patch).length > 2 || alerts.length) {
          updates.push({ id: r.id, ...patch });
        }
        if (alerts.length) {
          dueItems.push({
            entity,
            label,
            id: r.id,
            title: titleOf(r),
            entered: (r.created_date || '').slice(0, 10),
            base_date: (baseDate || '').slice(0, 10),
            days,
            thresholds: alerts.map((a) => a.label).join('; '),
          });
        }
      }
      if (updates.length) await service.entities[entity].bulkUpdate(updates);
      perEntityCounts.push({ label, scanned: (records || []).length, updated: updates.length });
    }

    // Emergency drills: every drill is due again every 3 months. Managers are
    // alerted 10 weeks (70 days) after the last drill to schedule the next one,
    // stamped with the time and date of the alert.
    let drillAlerts = 0;
    const drills = await service.entities.EmergencyDrill.list();
    const drillDates = (drills || [])
      .map((d) => d.date || d.created_date)
      .filter(Boolean)
      .sort();
    if (drillDates.length) {
      const latest = (drills || []).find((d) => (d.date || d.created_date) === drillDates[drillDates.length - 1]);
      const daysSinceDrill = Math.floor((now - new Date(drillDates[drillDates.length - 1]).getTime()) / day);
      if (latest && daysSinceDrill >= 70 && !latest.next_drill_alert_sent) {
        const users0 = await service.entities.User.list();
        const mgrs = (users0 || []).filter((u) => MANAGER_ROLES.includes(u.role) && u.email);
        await Promise.allSettled(mgrs.map((m) => Promise.all([
          service.entities.Notification.create({
            type: 'Review Reminder',
            recipient: m.email,
            recipient_id: m.id,
            message: `Last emergency drill was ${daysSinceDrill} days ago (${drillDates[drillDates.length - 1]}). Drills are due every 3 months - schedule the next drill now.`,
            action_url: '/emergency-response',
          }),
          service.integrations.Core.SendEmail({
            to: m.email,
            subject: 'Emergency drill due - schedule the next drill',
            html: `<p>Hi ${m.full_name || 'there'},</p><p>The last emergency drill was recorded on <b>${drillDates[drillDates.length - 1]}</b> (${daysSinceDrill} days ago). Drills are due every 3 months, so please schedule and record the next drill in Emergency Response.</p>`,
          }),
        ])));
        await service.entities.EmergencyDrill.update(latest.id, {
          next_drill_alert_sent: true,
          next_drill_alert_at: new Date().toISOString(),
        });
        await service.entities.AuditLog.create({
          action: 'Drill renewal alert sent',
          entity_type: 'EmergencyDrill',
          record_id: String(latest.id),
          record_title: latest.title || 'Emergency drill',
          performed_by: 'Review Aging Alerts (automated)',
          details: `${daysSinceDrill} days since last drill; managers alerted to schedule the next drill`,
          timestamp: new Date().toISOString(),
        });
        drillAlerts = mgrs.length;
      }
    }

    // Participant reviews: each review recurs every 10 weeks. Managers are
    // alerted once per cycle when a participant's next review falls within
    // 10 weeks (70 days) or is overdue, with the alert time and date stamped.
    let participantReviewAlerts = 0;
    const reviews = await service.entities.ParticipantReview.list();
    const reviewAlertsList = [];
    const reviewUpdates = [];
    for (const rv of reviews || []) {
      if (rv.status === 'Completed') continue;
      const due = rv.next_review_due || rv.review_date;
      if (!due) continue;
      const daysUntil = Math.ceil((new Date(`${due}T00:00:00`).getTime() - now) / day);
      const isOverdue = daysUntil < 0;
      const isDue = daysUntil <= 70;
      const patch = { review_10wk_checked_at: new Date().toISOString() };
      if (isOverdue && rv.status !== 'Overdue') patch.status = 'Overdue';
      if (isDue && !rv.review_10wk_alert_sent) {
        patch.review_10wk_alert_sent = true;
        patch.review_10wk_alert_at = new Date().toISOString();
        reviewAlertsList.push({
          participant: rv.participant_name || 'Unknown participant',
          type: rv.review_type || 'Scheduled',
          due,
          state: isOverdue ? 'overdue' : `due in ${daysUntil} days`,
        });
      }
      if (Object.keys(patch).length > 1) reviewUpdates.push({ id: rv.id, ...patch });
    }
    if (reviewUpdates.length) await service.entities.ParticipantReview.bulkUpdate(reviewUpdates);
    if (reviewAlertsList.length) {
      const users1 = await service.entities.User.list();
      const mgrs1 = (users1 || []).filter((u) => MANAGER_ROLES.includes(u.role) && u.email);
      const listHtml1 = reviewAlertsList.slice(0, 25).map((r) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${r.participant}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${r.type}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${r.due}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${r.state}</td></tr>`
      ).join('');
      await Promise.allSettled(mgrs1.map((m) => Promise.all([
        service.entities.Notification.create({
          type: 'Review Reminder',
          recipient: m.email,
          recipient_id: m.id,
          message: `${reviewAlertsList.length} participant review(s) are due within 10 weeks or overdue. Schedule and record each review on the participant's profile.`,
          action_url: '/participants',
        }),
        service.integrations.Core.SendEmail({
          to: m.email,
          subject: `Participant reviews due: ${reviewAlertsList.length} review(s) within 10 weeks`,
          html: `<p>Hi ${m.full_name || 'there'},</p><p>The following participant reviews are due within 10 weeks or overdue (reviews recur every 10 weeks):</p>` +
            `<table style="border-collapse:collapse;width:100%;font-size:13px;">` +
            `<tr><th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Participant</th>` +
            `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Review type</th>` +
            `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Due</th>` +
            `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Status</th></tr>${listHtml1}</table>` +
            `<p>Schedule and record each review on the participant's profile.</p>`,
        }),
      ])));
      await service.entities.AuditLog.create({
        action: 'Participant 10-week review alert sent',
        entity_type: 'ParticipantReview',
        record_title: `${reviewAlertsList.length} review(s) due within 10 weeks or overdue`,
        performed_by: 'Review Aging Alerts (automated)',
        details: reviewAlertsList.map((r) => `${r.participant} (${r.type}, ${r.due}, ${r.state})`).join('; '),
        timestamp: new Date().toISOString(),
      });
      participantReviewAlerts = reviewAlertsList.length;
    }

    // Notify managers (in-app + email), once per scan run
    let notified = 0;
    if (dueItems.length) {
      const users = await service.entities.User.list();
      const managers = (users || []).filter((u) => MANAGER_ROLES.includes(u.role) && u.email);

      const listHtml = dueItems.slice(0, 25).map((d) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${d.label}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${d.title}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${d.entered}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${d.thresholds}</td></tr>`
      ).join('');

      const results = await Promise.allSettled(managers.map((m) => {
        const message = `${dueItems.length} risk/incident/feedback item(s) need review or audit. ` +
          `Yellow = review due (2 months), red = overdue (10 weeks), audit due day before 3 months. ` +
          `Open the Review Board to complete and record reviews.`;
        return Promise.all([
          service.entities.Notification.create({
            type: 'Review Reminder',
            recipient: m.email,
            recipient_id: m.id,
            message,
            action_url: '/review-due',
          }),
          service.integrations.Core.SendEmail({
            to: m.email,
            subject: `Review & audit due: ${dueItems.length} item(s) need action`,
            html: `<p>Hi ${m.full_name || 'there'},</p>` +
              `<p>The following items have passed their review thresholds (yellow at 2 months, red at 10 weeks, audit due the day before 3 months since entry or last review):</p>` +
              `<table style="border-collapse:collapse;width:100%;font-size:13px;">` +
              `<tr><th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Type</th>` +
              `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Record</th>` +
              `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Entered / last reviewed</th>` +
              `<th align="left" style="padding:6px 10px;border-bottom:2px solid #7c3bed;">Alert</th></tr>${listHtml}</table>` +
              `<p>Complete and record each review on the Review Board.</p>`,
          }),
        ]);
      }));
      notified = results.filter((r) => r.status === 'fulfilled').length;

      await service.entities.AuditLog.create({
        action: 'Review & audit aging alert sent',
        entity_type: 'ReviewAging',
        record_title: `${dueItems.length} item(s) due for review/audit`,
        performed_by: 'Review Aging Alerts (automated)',
        details: JSON.stringify({ counts: perEntityCounts, due: dueItems.map((d) => `${d.label}: ${d.title} (${d.thresholds})`).slice(0, 40) }),
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json({ ok: true, scanned: perEntityCounts, due_count: dueItems.length, notified, drill_alerts: drillAlerts, participant_review_alerts: participantReviewAlerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}