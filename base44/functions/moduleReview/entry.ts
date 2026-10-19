import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { gatherRegisterStats, statsToPromptLines } from '../../shared/registerStats.ts';

const ALLOWED_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Quality & Improvement Manager'];

// Full module review for the Suggestions Hub: live register numbers for EVERY
// module, turned into Visualise / Automate / Refine suggestions, returned as
// JSON for the in-app page. All counts computed server-side; the LLM only sees numbers.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const stats = await gatherRegisterStats(base44);

    const review = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [
        `You are the compliance assistant inside an NDIS provider's management app ("ComplianceHR Infinity").`,
        `Below are the live register numbers for every module. Using ONLY these numbers (never invent records, names or dates):`,
        ``,
        statsToPromptLines(stats),
        ``,
        `For EACH module, produce three suggestion groups with 2-4 short, concrete, actionable items each:`,
        `- "visualise": charts, dashboards, board views or overviews worth adding to that module, grounded in what the numbers show.`,
        `- "automate": reminders, workflows, auto-routing or scheduled jobs that would save the team time in that module.`,
        `- "refine": data-quality, process and workflow improvements (field hygiene, closure discipline, review cadence).`,
        `Prioritise modules with overdue or soon-expiring items; for healthy modules give useful maintenance/audit ideas instead of inventing concerns.`,
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
                visualise: { type: 'array', items: { type: 'string' } },
                automate: { type: 'array', items: { type: 'string' } },
                refine: { type: 'array', items: { type: 'string' } },
              },
              required: ['key', 'visualise', 'automate', 'refine'],
            },
          },
        },
        required: ['modules'],
      },
    });

    const byKey = new Map((review.modules || []).map((m) => [m.key, m]));
    const modules = stats
      .map((s) => ({
        key: s.key,
        label: s.label,
        total: s.total,
        open: s.open,
        overdue: s.overdue,
        expiring: s.expiring,
        visualise: byKey.get(s.key)?.visualise || [],
        automate: byKey.get(s.key)?.automate || [],
        refine: byKey.get(s.key)?.refine || [],
      }))
      .sort((a, b) => ((b.overdue || 0) + (b.expiring || 0)) - ((a.overdue || 0) + (a.expiring || 0)));

    const suggestionCount = modules.reduce((a, m) => a + m.visualise.length + m.automate.length + m.refine.length, 0);
    return Response.json({
      modules,
      suggestionCount,
      moduleCount: modules.length,
      generated_at: new Date().toISOString(),
      reviewer: user.full_name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}