import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ALLOWED = ['admin', 'Provider Administrator', 'Rostering Coordinator', 'Team Leader', 'Administration'];
const WINDOW_DAYS = 14;
const MAX_SHIFTS = 30;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!ALLOWED.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date(Date.now() + WINDOW_DAYS * 86400000).toISOString().slice(0, 10);

    const [shiftPage, staffPage, availPage, participantPage] = await Promise.all([
      service.entities.Shift.filter(
        { date: { $gte: today, $lte: horizon }, employee_name: null, status: { $ne: 'Cancelled' } },
        { sort: 'date', limit: 100 },
      ),
      service.entities.StaffProfile.filter({ status: 'Active' }, { limit: 100, fields: ['full_name', 'position', 'position_level', 'participant_team'] }),
      service.entities.StaffAvailability.filter({ date: { $gte: today, $lte: horizon } }, { limit: 300, fields: ['staff_name', 'type', 'date', 'start_time', 'end_time', 'all_day'] }),
      service.entities.ParticipantProfile.filter({ status: 'Active' }, { limit: 100, fields: ['full_name', 'support_team', 'support_type'] }),
    ]);

    const unfilled = (shiftPage.items || []).slice(0, MAX_SHIFTS);
    if (!unfilled.length) {
      return Response.json({ ok: true, summary: 'No unfilled shifts in the next 14 days — the roster is fully covered.', suggestions: [] });
    }

    const staff = staffPage.items || [];
    const availability = availPage.items || [];
    const participants = participantPage.items || [];

    const payload = {
      today,
      horizon,
      unfilled_shifts: unfilled.map((s, i) => ({
        index: i,
        date: s.date,
        start_time: s.start_time || '',
        end_time: s.end_time || '',
        participant: s.participant_name || 'Unspecified',
        service_type: s.service_type || '',
        funding_source: s.funding_source || '',
        location: s.location || '',
      })),
      staff: staff.map((s) => ({ name: s.full_name, position: s.position || '', level: s.position_level || '', participants_supported: s.participant_team || [] })),
      availability: availability.map((a) => ({ staff: a.staff_name, type: a.type, date: a.date, all_day: a.all_day, start: a.start_time || '', end: a.end_time || '' })),
      participant_support_teams: Object.fromEntries(participants.map((p) => [p.full_name, p.support_team || []])),
    };

    const llm = await service.integrations.Core.InvokeLLM({
      prompt: `You are a rostering assistant for an Australian NDIS disability support provider. Suggest which active staff member should fill each unfilled shift below.\n\nPriorities, in order:\n1. Continuity of support - prefer workers already on the participant's support team or listed as supporting that participant.\n2. Availability - never suggest a worker marked Unavailable for that date (all day, or overlapping the shift times).\n3. Spread the load fairly - do not suggest the same worker for everything when alternatives exist.\n4. Match service type and skill level where known.\n\nGive at most 2 candidates per shift (suggested_worker and alternative_worker). If no worker is suitable, set suggested_worker to "No suitable worker" and explain why.\n\nData (JSON): ${JSON.stringify(payload)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'One or two sentences on the overall coverage outlook.' },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                shift_index: { type: 'number', description: 'Index from unfilled_shifts' },
                suggested_worker: { type: 'string' },
                alternative_worker: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['shift_index', 'suggested_worker', 'reason'],
            },
          },
        },
        required: ['summary', 'suggestions'],
      },
    });

    const suggestions = (llm.suggestions || [])
      .filter((s) => Number.isInteger(s.shift_index) && unfilled[s.shift_index])
      .map((s) => {
        const shift = unfilled[s.shift_index];
        return {
          shift_id: shift.id,
          date: shift.date,
          start_time: shift.start_time || '',
          end_time: shift.end_time || '',
          participant: shift.participant_name || '',
          service_type: shift.service_type || '',
          suggested_worker: s.suggested_worker || '',
          alternative_worker: s.alternative_worker || '',
          reason: s.reason || '',
        };
      });

    await service.entities.AuditLog.create({
      action: 'AI Invoked (rosterSuggest)',
      entity_type: 'AIGovernance',
      record_id: today,
      record_title: 'AI Roster Fill Suggestions',
      performed_by: user.full_name || user.email || user.id,
      performed_by_user_id: user.id,
      performed_by_email: user.email || '',
      performed_by_role: user.role || '',
      details: `Evaluated ${unfilled.length} unfilled shift(s) and returned ${suggestions.length} suggestion(s).`,
      timestamp: new Date().toISOString(),
    });
    return Response.json({ ok: true, summary: llm.summary || '', checked: unfilled.length, suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}