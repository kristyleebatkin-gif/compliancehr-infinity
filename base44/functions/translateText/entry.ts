import { authorizeAndLogAiAction } from '../../shared/aiGovernance.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const gate = await authorizeAndLogAiAction(base44, {
      feature: 'translateText',
      requestedTenantId: body.tenant_id || null,
      recordTitle: `Translation (${String(body.language || '').slice(0, 60)})`,
    });
    if (!gate.authorized) return gate.response;
    const text = String(body.text || '').trim().slice(0, 2000);
    const language = String(body.language || '').trim().slice(0, 60);
    if (!text || !language) {
      return Response.json({ error: 'Text and language are required' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate the following text into ${language}. Return ONLY the translated text, nothing else. Keep the translation simple, natural and easy to read aloud. If the text is already in ${language}, return it unchanged.\n\nText to translate: ${text}`,
    });

    await gate.logSuccess(`Translated ${text.length} chars into ${language}.`);
    return Response.json({ translation: String(result || '').trim(), language });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}