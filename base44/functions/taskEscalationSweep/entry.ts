import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate, pageItems } from '../../shared/reminders.ts';
import { planEscalations, holidaySet, DONE_STATUSES } from '../../shared/taskEscalation.ts';

// Backlog 17.20 - task escalation sweep.
// TEST MODE: this function only REPORTS who would be alerted. It sends nothing and
// changes no records. It is not on any schedule. Live sending will be switched on
// only after the owner approves the test results (restore point: BEFORE Escalation rules 17 Nov).
const LIVE_SENDING_ENABLED = false;

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const today = /^\d{4}-\d{2}-\d{2}$/.test(String(body.today || '')) ? body.today : auDate(new Date());

    const tasks: any[] = [];
    let cursor = null;
    do {
      const page = await service.entities.TodoTask.filter(
        { status: { $nin: DONE_STATUSES }, archived: { $ne: true }, due_date: { $gte: '0001-01-01', $lt: today } },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      tasks.push(...pageItems(page));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    const users = pageItems(await service.entities.User.list());
    const holidays = pageItems(await service.entities.RosterPublicHoliday.list());
    const plan = planEscalations(tasks, users, holidays, today);

    return Response.json({
      ok: true,
      test_mode: !LIVE_SENDING_ENABLED,
      today,
      queensland_holidays_counted: holidaySet(holidays).size,
      overdue_tasks: tasks.length,
      would_escalate: plan.length,
      unassigned: plan.filter((p) => p.unassigned).length,
      plan,
      note: 'Test mode: nothing was sent and no records were changed.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
