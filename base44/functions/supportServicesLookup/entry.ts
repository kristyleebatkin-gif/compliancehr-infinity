import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
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
      prompt: `An Australian support worker provides the postcode ${postcode}. Using web search, find 6 to 10 real, currently operating local support and community services in or around postcode ${postcode} (include the suburb/LGA name). Cover a spread of these kinds of services where they exist nearby: NDIS/disability support providers, community or neighbourhood centres, mental health services (e.g. headspace, community mental health), housing and homelessness services, family and domestic violence services, youth services, alcohol and other drug services, emergency relief / food banks, community health centres, Centrelink / Services Australia offices, and local council community services.
For each service return: name, category (free text, e.g. "Mental Health", "Housing", "NDIS / Disability"), suburb, address (if available), phone (if available), email (if available), website (https URL, if available), and a one-line description of what they help with. Only include services you can verify are real and current. Do not guess phone numbers or URLs - leave fields empty rather than inventing them.`,
      response_json_schema: {
        type: 'object',
        properties: {
          area_name: { type: 'string' },
          services: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                suburb: { type: 'string' },
                address: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
                website: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name', 'category'],
            },
          },
          notes: { type: 'string' },
        },
        required: ['area_name', 'services'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Support services lookup failed.' }, { status: 500 });
  }
});