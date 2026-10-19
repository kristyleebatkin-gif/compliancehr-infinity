import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { REGISTRY } from '../../shared/registerRegistry.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { module: moduleKey } = await req.json();
    const cfg = REGISTRY[moduleKey];
    if (!cfg) return Response.json({ error: 'Unknown module' }, { status: 400 });

    const ent = base44.entities[cfg.entity];
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const statusField = cfg.statusField || null;
    const openQuery = statusField ? { [statusField]: { $nin: cfg.closed } } : {};

    const [total, statusAgg, overdue, expiring] = await Promise.all([
      ent.count({}),
      statusField ? ent.aggregate({ groupBy: statusField }) : Promise.resolve({ rows: [] }),
      cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $lt: today } }) : Promise.resolve(null),
      cfg.dateField ? ent.count({ ...openQuery, [cfg.dateField]: { $gte: today, $lte: in30 } }) : Promise.resolve(null),
    ]);

    const byStatus = statusField
      ? (statusAgg.rows || []).map((r) => ({ status: r[statusField] || 'Unset', count: r.count }))
      : [];
    const open = statusField
      ? byStatus.filter((s) => !cfg.closed.includes(s.status)).reduce((a, s) => a + s.count, 0)
      : total;

    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [
        `You are the compliance assistant inside an NDIS provider's management app ("ComplianceHR Infinity").`,
        `Write a register insight for the "${cfg.label}" module, using ONLY these live numbers (do not invent records or names):`,
        `- Total records: ${total}`,
        `- Open (not in closed states ${JSON.stringify(cfg.closed)}): ${open}`,
        cfg.dateField ? `- Overdue (past ${cfg.dateField.replace(/_/g, ' ')} and still open): ${overdue}` : null,
        cfg.dateField ? `- Due or expiring within the next 30 days and still open: ${expiring}` : null,
        `- Counts by status: ${byStatus.map((s) => `${s.status}: ${s.count}`).join(', ')}`,
        ``,
        `Respond with: "summary" - one crisp sentence (max 25 words) on the register's state;`,
        `"attention" - up to 3 items that need attention, each {item, detail} where item is 2-4 words and detail is one short sentence grounded in the numbers above;`,
        `"suggestions" - up to 2 short next actions for the team.`,
        `If everything looks healthy, say so plainly instead of inventing concerns.`,
      ].filter((l) => l !== null).join('\n'),
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          attention: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, detail: { type: 'string' } }, required: ['item', 'detail'] } },
          suggestions: { type: 'array', items: { type: 'string' } },
        },
        required: ['summary', 'attention', 'suggestions'],
      },
    });

    return Response.json({
      module: cfg.label,
      total,
      open,
      overdue,
      expiring,
      byStatus,
      insights,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}