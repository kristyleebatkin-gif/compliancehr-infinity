import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

// Daily AI insight for the Communication Centre dashboard.
// Gathers a lightweight snapshot of team activity and turns it into a short,
// encouraging insight for the day. Called by the CommDailyInsight panel.

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const s = base44.asServiceRole.entities;

    const [overdue, dueToday, inProgress, commsWeek, banterWeek, unfilledShifts] = await Promise.all([
      s.TodoTask.count({ due_date: { $lt: today }, status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }),
      s.TodoTask.count({ due_date: today, status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }),
      s.TodoTask.count({ status: 'In Progress' }),
      s.CommunicationEntry.count({ entry_date: { $gte: weekAgo } }),
      s.CommunicationEntry.count({ entry_kind: 'Team Banter', entry_date: { $gte: weekAgo } }),
      s.Shift.count({ date: { $gte: today, $lte: in7 }, employee_name: null }),
    ]);

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'You are a friendly assistant for an NDIS provider team. Write a short daily insight for the team communication dashboard: 2-3 sentences, maximum 55 words, plain text, warm and encouraging, ending with one clear focus suggestion for today. ' +
        `Data: ${overdue} overdue tasks, ${dueToday} tasks due today, ${inProgress} tasks in progress, ${commsWeek} communications logged in the last 7 days, ${banterWeek} team chat messages in the last 7 days, ${unfilledShifts} unfilled shifts in the next 7 days.`,
    });

    return Response.json({ insight: String(ai).slice(0, 600) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});