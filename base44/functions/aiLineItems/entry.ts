import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// AI line-item generation for the Invoicing and Quote builders.
// The caller sends a plain-English description of the supports (and the NDIS
// price guide list), the LLM picks matching support items with codes, units,
// quantities and rates, and the suggestions come back for the user to add.
const ALLOWED_ROLES = [
  'admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer',
  'Rostering Coordinator', 'Compliance Manager',
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return Response.json({ error: 'Not authorised to generate billing items.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const requestText = String(body.request_text || '').slice(0, 2000).trim();
    const mode = body.mode === 'quote' ? 'quote' : 'invoice';
    const guide = Array.isArray(body.price_guide) ? body.price_guide.slice(0, 200) : [];
    if (!requestText) {
      return Response.json({ error: 'Describe the supports to bill.' }, { status: 400 });
    }

    const guideText = guide
      .map((i) => `${i.code || '(no code)'} | ${i.description} | $${Number(i.rate || 0).toFixed(2)} per ${i.unit || 'hour'}`)
      .join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an NDIS billing assistant helping an Australian disability support provider draft ${mode === 'quote' ? 'a quote' : 'an invoice'} line items.
Choose ONLY from the NDIS price guide list below - match the support item code, description, unit and unit price EXACTLY as listed (pick the closest suitable support). Choose the quantity that the request implies.

PRICE GUIDE (code | description | rate | unit):
${guideText || '(no guide provided - use reasonable NDIS support item descriptions and rates)'}

REQUESTED SUPPORTS: ${requestText}

Suggest between 1 and 8 line items that cover the request, most relevant first.`,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                description: { type: 'string' },
                unit: { type: 'string' },
                qty: { type: 'number' },
                unit_price: { type: 'number' },
                reason: { type: 'string' },
              },
              required: ['description', 'qty', 'unit_price'],
            },
          },
        },
        required: ['items'],
      },
    });

    const items = (result?.items || []).slice(0, 8).map((i) => ({
      code: String(i.code || ''),
      description: String(i.description || ''),
      unit: String(i.unit || 'hour'),
      qty: Number(i.qty) || 1,
      unit_price: Number(i.unit_price) || 0,
      reason: String(i.reason || ''),
    }));
    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}