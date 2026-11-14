import { authorizeAndLogAiAction } from '../../shared/aiGovernance.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const gate = await authorizeAndLogAiAction(base44, {
      feature: 'generateTrainingQuiz',
      requestedTenantId: body.tenant_id || null,
      recordTitle: String(body.topic || 'Training Quiz').slice(0, 120),
    });
    if (!gate.authorized) return gate.response;
    const topic = String(body.topic || '').trim().slice(0, 200);
    const count = Math.min(Math.max(Number(body.count) || 5, 3), 8);
    if (!topic) return Response.json({ error: 'Choose a training topic to drill.' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior trainer at an Australian NDIS disability support provider. Write ${count} fresh multiple-choice quiz questions to drill a support worker on the topic "${topic}", aligned to the NDIS Practice Standards and the NDIS Code of Conduct.

Rules:
- Every question must have exactly 4 options and exactly 1 correct answer.
- Vary the correct answer position across questions (do not always put it first).
- Test practical judgement (what the worker should DO), not just definitions.
- Include at least one scenario-based question. Australian context and spelling.
- If the topic relates to safety, medication or emergencies, correct answers must follow Australian emergency protocols (000 for emergencies, 13HEALTH 13 43 25 84 for medical/medication concerns, Poisons Information Line 13 11 26).`,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
                answer: { type: 'integer', minimum: 0, maximum: 3 },
                explanation: { type: 'string' },
              },
              required: ['question', 'options', 'answer', 'explanation'],
            },
          },
        },
        required: ['questions'],
      },
    });

    const questions = (result?.questions || []).filter((q) => q && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer));
    if (questions.length === 0) return Response.json({ error: 'The quiz generator returned no questions. Try again.' }, { status: 502 });
    await gate.logSuccess(`Generated ${questions.length} quiz questions for topic "${topic}".`);
    return Response.json({ questions });
  } catch (error) {
    return Response.json({ error: error.message || 'Quiz generation failed.' }, { status: 500 });
  }
});