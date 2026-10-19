import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { REGISTRY } from '../../shared/registerRegistry.ts';

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ALLOWED_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

// Compiles an extensive list of AI suggestions across EVERY register and emails
// it to the requesting manager (no in-app page): all counts are computed
// server-side, then a single LLM call turns the live numbers into up to six
// concrete next actions per module.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

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

    const dateLabel = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const moduleSections = modules.map((m) => {
      const counts = [
        `${m.total} records`,
        `${m.open} open`,
        m.overdue !== null ? `${m.overdue} overdue` : null,
        m.expiring !== null ? `${m.expiring} due in 30 days` : null,
      ].filter(Boolean).join(' · ');
      const items = m.suggestions.length
        ? m.suggestions.map((s, i) => `<li style="margin:0 0 5px;">${esc(s)}</li>`).join('')
        : '<li style="margin:0; color:#737373;">No suggestions generated.</li>';
      return `
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; padding:16px 18px; margin-bottom:12px;">
        <div style="font-family:'Fraunces',Georgia,serif; font-weight:700; font-size:15px; color:#0f1729;">${esc(m.label)}</div>
        <div style="font-size:11px; color:#6b7280; margin:2px 0 8px;">${esc(counts)}</div>
        <ol style="margin:0; padding-left:18px; font-size:13px; color:#404040; line-height:1.55;">${items}</ol>
      </div>`;
    }).join('');

    const html = `
    <div style="margin:0; padding:0; background:#f8fafc;">
      <div style="max-width:600px; margin:0 auto; padding:24px 12px;">
        <div style="background:#7c3bed; color:#ffffff; padding:20px 24px; border-radius:24px 24px 0 0;">
          <img src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/e772c8399_logo.jpg" alt="ComplianceHR Infinity" width="40" style="display:block; border-radius:8px;" />
          <div style="font-family:'Fraunces',Georgia,serif; font-size:20px; font-weight:700; margin-top:10px;">Suggestions Digest</div>
          <div style="font-size:13px; opacity:0.9; margin-top:4px;">Every register, every suggestion — ${esc(dateLabel)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-top:none; padding:20px 24px 8px; border-radius:0 0 24px 24px;">
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:14px; color:#0f1729; font-weight:700;">${suggestionCount} suggested actions across ${modules.length} modules</div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:12px; color:#6b7280; margin:4px 0 16px;">Generated from live register numbers. Prioritise anything marked overdue.</div>
          ${moduleSections}
          <div style="font-size:11px; color:#737373; text-align:center; padding:8px 0 12px;">
            ComplianceHR Infinity · Complete Control. Greater Confidence. Brighter Success.
          </div>
        </div>
      </div>
    </div>`;

    let emailed = false;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'ComplianceHR Infinity',
        subject: `Suggestions digest — ${suggestionCount} actions across ${modules.length} registers`,
        html,
      });
      emailed = true;
    } catch (e) {
      console.error('suggestionsDigest email failed:', e.message);
    }

    return Response.json({ emailed, recipient: user.email, suggestionCount, modules, generated_at: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}