import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const problem = String(body.problem || '').trim();
    if (!problem) {
      return Response.json({ error: 'Describe the problem first.' }, { status: 400 });
    }
    if (problem.length > 3000) {
      return Response.json({ error: 'Description is too long.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior support engineer for ComplianceHR Portal, a web app for Australian NDIS providers built on the Base44 platform. A user reports a problem and needs a diagnosis with step-by-step fixes.

Problem: ${problem}
Module: ${body.module || 'not specified'}
Error message shown (if any): ${body.error_message || 'none'}

Return:
- A one-paragraph plain-English diagnosis of the most likely cause.
- likely_causes: 2 to 4 other possible causes, each one line.
- steps: 4 to 8 ordered, concrete self-service fix steps a non-technical user can follow (refresh, check role/permissions in Users & Permissions Hub, verify dates/fields are saved, re-upload the file, export and re-import data, clear the browser cache, log out and back in, check the right tab/filter is selected, etc.). Reference specific app modules where relevant.
- escalate: true only if the steps cannot fix it or it looks like data loss, a bug in the platform, or an access/permissions problem an administrator must fix.
- escalate_reason: one line saying what to tell the support desk (and whether it needs a Provider Administrator).`,
      response_json_schema: {
        type: 'object',
        properties: {
          diagnosis: { type: 'string' },
          likely_causes: { type: 'array', items: { type: 'string' } },
          steps: { type: 'array', items: { type: 'string' } },
          escalate: { type: 'boolean' },
          escalate_reason: { type: 'string' },
        },
        required: ['diagnosis', 'likely_causes', 'steps', 'escalate'],
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Diagnosis failed.' }, { status: 500 });
  }
}