import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const state = String(body.state || '').trim();
    const postcode = String(body.postcode || '').trim();
    if (!state && !/^\d{4}$/.test(postcode)) {
      return Response.json({ error: 'Enter a 4-digit postcode or choose a state.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      add_context_from_internet: true,
      prompt: `You are an emergency readiness assistant for an Australian NDIS provider. Using web search, find CURRENT, ACTIVE emergency warnings and alerts relevant to ${postcode ? `postcode ${postcode}` : state} (state: ${state || 'any Australian state/territory'}).
Check the authoritative official sources: state/territory emergency services (e.g. NSW RFS, VIC Emergency, QLD Alerts, BOM Bureau of Meteorology, SES), and national sources.
Return only alerts that are active or current right now (bushfire, flood, storm, severe weather, heatwave, cyclone, air quality, community safety). For each alert give: title, level (Emergency Warning, Watch and Act, Advice, or Information), area/suburb affected, source agency, issue time/date (plain text), and the official URL to view the alert.
If there are no active alerts for the area, return an empty alerts list and say so in the summary. Never invent alerts, levels or URLs.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          checked_at_note: { type: 'string' },
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                level: { type: 'string' },
                area: { type: 'string' },
                source: { type: 'string' },
                issued: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['title', 'level'],
            },
          },
        },
        required: ['summary', 'alerts'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Alert lookup failed.' }, { status: 500 });
  }
}