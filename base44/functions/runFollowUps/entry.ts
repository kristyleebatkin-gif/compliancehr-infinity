import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const pageItems = (page) => page?.items || page || [];
const DAY = 86400000;

const addMonthsIso = (dateStr, months) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);
    const daysSince = (d) => (d ? Math.floor((now.getTime() - new Date(d).getTime()) / DAY) : Infinity);
    const joinLog = (entry, prev) => [entry, prev].filter(Boolean).join('\n');

    // ---------- 1. Staff surveys: 6 weeks after start date, then every 3 months ----------
    const staffPage = await service.entities.StaffProfile.filter({}, { limit: 1000 });
    const staff = pageItems(staffPage).filter((s) => s.status === 'Active' && s.email && s.start_date);

    let surveysSent = 0;
    const surveyFailures = [];
    for (const member of staff) {
      if (daysSince(member.start_date) < 42) continue;
      if (daysSince(member.last_survey_sent_date) < 84) continue;
      let delivered = true;
      try {
        await service.integrations.Core.SendEmail({
          to: member.email,
          template_name: 'StaffSurvey',
          variables: { first_name: String(member.full_name || '').split(' ')[0] },
        });
        surveysSent++;
        await service.entities.Feedback.create({
          type: 'Feedback',
          subject: `Staff survey emailed to ${member.full_name}`,
          message: `Automated staff survey emailed (6 weeks after start date, then every 3 months). Start date: ${member.start_date}. The staff member completes the survey via the feedback page and their response appears in this register.`,
          submitted_by: 'Automated survey system',
          received_via: 'Automated email',
          received_date: now.toISOString(),
          status: 'Received',
        });
      } catch (error) {
        delivered = false;
        surveyFailures.push({ name: member.full_name, email: member.email, reason: error.message });
      }
      await service.entities.StaffProfile.update(member.id, {
        last_survey_sent_date: today,
        survey_log: joinLog(`${today} ${time} | Staff survey emailed to ${member.email}${delivered ? '' : ' (delivery failed)'}`, member.survey_log),
      });
    }

    // ---------- 2. Progress note & report copies to admin users every 10 weeks; due 3-monthly ----------
    const [participantPage, notePage] = await Promise.all([
      service.entities.ParticipantProfile.filter({}, { limit: 1000 }),
      service.entities.GoalProgressNote.filter({}, { limit: 1000, fields: ['participant_name', 'entry_type', 'notes', 'recorded_date'] }),
    ]);
    // Admin recipients: registered admin users plus staff flagged with admin app access.
    const adminMap = new Map();
    try {
      const userPage = await service.entities.User.list({ limit: 1000, fields: ['role', 'email'] });
      for (const u of (userPage.items || []).filter((x) => x.role === 'admin')) if (u.email) adminMap.set(String(u.email).toLowerCase(), u.email);
    } catch (error) { /* fall through to staff admins */ }
    try {
      const staffAdminPage = await service.entities.StaffProfile.filter({ app_role: 'admin' }, { limit: 1000 });
      for (const s of pageItems(staffAdminPage)) if (s.email) adminMap.set(String(s.email).toLowerCase(), s.email);
    } catch (error) { /* no staff admins flagged */ }
    const admins = Array.from(adminMap.values()).map((email) => ({ email, role: 'admin' }));
    const notes = pageItems(notePage);
    const latestOf = (name, type) => notes
      .filter((n) => n.participant_name === name && (!type || n.entry_type === type))
      .sort((a, b) => String(b.recorded_date || '').localeCompare(String(a.recorded_date || '')))[0];

    let progressSent = 0;
    const progressFailures = [];
    for (const p of pageItems(participantPage).filter((x) => x.status !== 'Inactive')) {
      if (daysSince(p.last_progress_copy_date) < 70) continue;
      const latestNote = latestOf(p.full_name, 'Progress Note');
      const latestReport = latestOf(p.full_name, 'Progress Report');
      if (!latestNote && !latestReport) continue;
      const dueDate = addMonthsIso(today, 3);
      for (const admin of admins) {
        try {
          await service.integrations.Core.SendEmail({
            to: admin.email,
            template_name: 'ProgressNoteCopy',
            variables: {
              participant_name: p.full_name,
              latest_note_date: latestNote?.recorded_date || 'none recorded',
              latest_note: (latestNote?.notes || 'No progress notes recorded yet.').slice(0, 1200),
              latest_report: (latestReport?.notes || 'No progress report recorded yet.').slice(0, 1200),
              due_date: dueDate,
            },
          });
          progressSent++;
        } catch (error) {
          progressFailures.push({ admin: admin.email, participant: p.full_name, reason: error.message });
        }
      }
      await service.entities.ParticipantProfile.update(p.id, {
        last_progress_copy_date: today,
        progress_notes_due_date: dueDate,
        progress_email_log: joinLog(`${today} ${time} | Progress note & report copy emailed to ${admins.length} admin user(s); next due ${dueDate} (3-monthly)`, p.progress_email_log),
      });
    }

    // ---------- 3. Risk assessment dues: Individual every 3 months, Home every month ----------
    const riskPage = await service.entities.Risk.filter({}, {
      limit: 1000,
      fields: ['title', 'assessment_type', 'last_assessed_date', 'next_due_date', 'owner', 'action_log', 'identified_date'],
    });
    const risks = pageItems(riskPage).filter((r) => r.assessment_type === 'Individual' || r.assessment_type === 'Home');

    let riskReminders = 0;
    for (const risk of risks) {
      const gapMonths = risk.assessment_type === 'Home' ? 1 : 3;
      const base = risk.last_assessed_date || risk.identified_date || today;
      const due = addMonthsIso(base, gapMonths);
      const entry = `${today} ${time} | ${risk.assessment_type} assessment checked: last assessed ${risk.last_assessed_date || 'never'}, next due ${due} (every ${gapMonths === 1 ? 'month' : '3 months'})`;

      if (due <= today) {
        const openTask = await service.entities.Task.filter(
          { linked_entity_type: 'Risk', linked_entity_id: risk.id, task_type: 'Review Reminder', status: { $in: ['Open', 'In Progress'] } },
          { limit: 1, fields: ['id'] },
        );
        if ((openTask.items || openTask).length === 0) {
          await service.entities.Task.create({
            title: `${risk.assessment_type} risk assessment overdue: ${risk.title}`,
            task_type: 'Review Reminder',
            priority: 'High',
            status: 'Open',
            due_date: today,
            assigned_to: risk.owner || '',
            linked_entity_type: 'Risk',
            linked_entity_id: risk.id,
            notes: `${risk.assessment_type} assessments are due every ${gapMonths === 1 ? 'month' : '3 months'}. Last assessed ${risk.last_assessed_date || 'never recorded'}. Mark the assessment as completed on the risk record.`,
          });
          riskReminders++;
        }
        await service.entities.Risk.update(risk.id, {
          next_due_date: due,
          action_log: joinLog(`${entry} - overdue reminder task created`, risk.action_log),
        });
      } else if (!risk.next_due_date) {
        await service.entities.Risk.update(risk.id, {
          next_due_date: due,
          action_log: joinLog(entry, risk.action_log),
        });
      }
    }

    return Response.json({
      success: true,
      surveys: { sent: surveysSent, failures: surveyFailures },
      progress_copies: { sent: progressSent, admins: admins.length, failures: progressFailures },
      risk_assessments: { checked: risks.length, overdue_tasks_created: riskReminders },
      checked: { staff: staff.length, participants: admins.length ? pageItems(participantPage).length : 0 },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}