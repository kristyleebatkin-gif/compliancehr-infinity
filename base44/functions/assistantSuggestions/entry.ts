import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Generates the full list of starter questions for an assistant chat,
// returned in one call so the chat can show every suggestion at once.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_name } = await req.json().catch(() => ({}));
    const name = typeof agent_name === 'string' ? agent_name.slice(0, 64) : '';
    if (!name) return Response.json({ error: 'agent_name required' }, { status: 400 });

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the "${name}" assistant inside ComplianceHR Infinity, a compliance platform for an NDIS provider (policies, audits, incidents, training, rostering, finances, participants, documents). Generate 10 short, varied, practical starter questions a staff member might ask this assistant. Each question must be at most 8 words. Return only the questions as the "questions" array.`,
      response_json_schema: {
        type: 'object',
        properties: { questions: { type: 'array', items: { type: 'string' } } },
        required: ['questions'],
      },
    });

    const questions = Array.isArray(res?.questions)
      ? res.questions.filter((q) => typeof q === 'string' && q.trim()).map((q) => q.trim()).slice(0, 12)
      : [];
    return Response.json({ questions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}