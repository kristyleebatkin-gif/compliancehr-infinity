import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goal = String(body.goal || '').trim();
    const participant = String(body.participant_name || '').trim();
    if (!goal) {
      return Response.json({ error: 'A goal description is required.' }, { status: 400 });
    }
    if (goal.length > 2000) {
      return Response.json({ error: 'Goal description is too long.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an NDIS goal coach helping Australian support coordinators plan quality, participant-led goals.
Participant: ${participant || 'not provided'}
Goal: ${goal}
Category: ${body.category || 'not provided'}
Current progress: ${body.progress != null ? body.progress + '%' : 'not started'}
Target date: ${body.target_date || 'not set'}
Support needed / current supports: ${body.support_needed || 'not provided'}

Return practical, person-centred, NDIS best-practice guidance:
- A short encouraging summary of what this goal is about.
- 4 to 6 measurable milestones or action steps ordered from first to last, each with a short title and a one-line description of how staff can support it.
- 3 to 5 practical support strategies workers can use day to day (skill-building, routines, assistive technology, community participation, capacity building).
- 2 to 4 possible barriers or risks with a one-line mitigation each.
Keep language respectful, strengths-based and easy for support workers to action.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                detail: { type: 'string' },
              },
              required: ['title', 'detail'],
            },
          },
          strategies: { type: 'array', items: { type: 'string' } },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                barrier: { type: 'string' },
                mitigation: { type: 'string' },
              },
              required: ['barrier', 'mitigation'],
            },
          },
        },
        required: ['summary', 'milestones', 'strategies', 'risks'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Goal coach failed.' }, { status: 500 });
  }
}