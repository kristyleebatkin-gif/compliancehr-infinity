import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { REGISTRY } from '../../shared/registerRegistry.ts';

// Compiles an extensive list of AI suggestions across EVERY register in one pass:
// all counts are computed server-side, then a single LLM call turns the live
// numbers into up to six concrete next actions per module.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const moduleKeys = Object.keys(REGISTRY);
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const stats = [];
    for (let i = 0; i < moduleKeys.length; i += 6) {
      const batch = moduleKeys.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map(async (key) => {
        const cfg = REGISTRY[key];
        const ent = base44.entities[cfg.entity];
        const statusField = cfg.statusField || null;
        const openQuery = statusField ? { [statusField]: { $nin: cfg.closed } } : {};
        const [total, open, overdue, expiring] = await Promise.all([
          ent.count({}),
          statusField ? ent.count(openQuery) : Promise.resolve(0),
          cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $lt: today } }) : Promise.resolve(null),
          cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $gte: today, $lte: in30 } }) : Promise.resolve(null),
        ]);
        return { key, label: cfg.label, total, open: statusField ? open : total, overdue, expiring };
      }));
      for (const s of settled) if (s.status === 'fulfilled') stats.push(s.value);
    }

    const lines = stats.map((s) => [
      `Module "${s.label}" (key: ${s.key}):`,
      `- Total records: ${s.total}`,
      `- Open: ${s.open}`,
      s.overdue !== null ? `- Overdue: ${s.overdue}` : null,
      s.expiring !== null ? `- Due/expiring within 30 days: ${s.expiring}` : null,
    ].filter((l) => l !== null).join('\n')).join('\n\n');

    const digest = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [
        `You are the compliance assistant inside an NDIS provider's management app ("ComplianceHR Infinity").`,
        `Below are the live register numbers for every module. Using ONLY these numbers (never invent records, names or dates):`,
        ``,
        lines,
        ``,
        `For EACH module, produce "suggestions": an extensive list of 4-6 short, concrete, prioritised next actions for the team, grounded in that module's numbers.`,
        `Prioritise modules with overdue or soon-expiring items; for healthy modules give useful maintenance/audit actions instead of inventing concerns.`,
      ].join('\n'),
      response_json_schema: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                suggestions: { type: 'array', items: { type: 'string' } },
              },
              required: ['key', 'suggestions'],
            },
          },
        },
        required: ['modules'],
      },
    });

    const byKey = new Map((digest.modules || []).map((m) => [m.key, m.suggestions]));
    const modules = stats.map((s) => ({ ...s, suggestions: byKey.get(s.key) || [] }));
    const suggestionCount = modules.reduce((a, m) => a + m.suggestions.length, 0);

    return Response.json({ modules, suggestionCount, generated_at: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}