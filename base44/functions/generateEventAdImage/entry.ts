import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const title = String(body.title || '').slice(0, 120);
    const headline = String(body.headline || '').slice(0, 200);
    const description = String(body.description || '').slice(0, 600);
    if (!title) return Response.json({ error: 'A program or event title is required.' }, { status: 400 });

    const prompt = `Professional, vibrant advertisement poster artwork for a community support program titled "${title}".`
      + (headline ? ` Headline theme: ${headline}.` : '')
      + (description ? ` Context: ${description}.` : '')
      + ' Inclusive, warm and welcoming community atmosphere with people engaged and happy. Clean modern graphic design, bright cheerful colours, wide hero composition with clear space around the centre. Absolutely no readable text, words or lettering in the image.';

    const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });
    return Response.json({ url: result.url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Advertisement image could not be generated' }, { status: 500 });
  }
}