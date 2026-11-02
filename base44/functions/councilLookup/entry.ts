import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const postcode = String(body.postcode || '').trim();
    if (!/^\d{4}$/.test(postcode)) {
      return Response.json({ error: 'Enter a valid 4-digit Australian postcode.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      add_context_from_internet: true,
      prompt: `An Australian user provides the postcode ${postcode}. Using web search:
1. Identify the primary Local Government Area (city council / shire) that covers most addresses in postcode ${postcode}, including the state it is in. If the postcode spans multiple councils, name the main one and mention the others in notes.
2. Find the council's official website (https URL).
3. Find the council's general enquiry phone number and email address, and the street address of its main office/customer service centre.
4. Find the URL of the council's "What's On" or community events page.
5. List 3 to 6 real, currently upcoming community events open to the public in that council area. For each event give the title, date (plain text), venue and a URL if one exists. Only include events you can verify exist right now; if you cannot verify events, return an empty list and say so in notes.
Return accurate, current information sourced from the web. Do not guess URLs.`,
      response_json_schema: {
        type: 'object',
        properties: {
          council_name: { type: 'string' },
          state: { type: 'string' },
          website: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          whats_on_url: { type: 'string' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                date: { type: 'string' },
                venue: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['title'],
            },
          },
          notes: { type: 'string' },
        },
        required: ['council_name', 'website'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Council lookup failed.' }, { status: 500 });
  }
}