import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const points = String(body.key_points || '').trim();
    if (!points) {
      return Response.json({ error: 'Add a few key points first.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional communications writer for ComplianceHR Infinity, an Australian NDIS disability support provider.

Write a ${body.message_type || 'professional email'} with a ${body.tone || 'professional'} tone.

Context:
- Recipient: ${body.recipient || 'not specified'}
- Key points to cover: ${points}
- Length: ${body.length || 'medium'} (short = 2-3 sentences, medium = one short paragraph plus a call to action, long = 2-3 paragraphs)

Rules:
- Australian English spelling.
- Clear, warm and human; no jargon or corporate filler.
- Do not invent facts, names, dates or clinical details that were not provided.
- Never include placeholders in square brackets; write around missing details.
- Return a subject line (skip the subject only if message_type is a shift note or internal note) and the message body.`,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Email subject line, empty string for internal notes' },
          message: { type: 'string' },
        },
        required: ['message'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Draft failed.' }, { status: 500 });
  }
}