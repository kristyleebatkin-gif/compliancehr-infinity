import { COMPLIANCE_REVIEW_ROLES, HR_ROLES } from '../../shared/roleMatrix.ts';
import { authorizeAndLogAiAction } from '../../shared/aiGovernance.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const gate = await authorizeAndLogAiAction(base44, {
      feature: 'aiCourseAuthor',
      allowedRoles: [...COMPLIANCE_REVIEW_ROLES, ...HR_ROLES],
      requestedTenantId: body.tenant_id || null,
      recordTitle: String(body.name || body.role || 'Training Curriculum').slice(0, 120),
    });
    if (!gate.authorized) return gate.response;
    const role = String(body.role || '').slice(0, 80);
    const name = String(body.name || '').slice(0, 120);
    const description = String(body.description || '').slice(0, 500);
    const catalog = Array.isArray(body.catalog)
      ? body.catalog.slice(0, 120).map((m: any) => ({
          title: String(m.title || '').slice(0, 160),
          group: String(m.group || '').slice(0, 80),
        }))
      : [];
    if (catalog.length === 0) {
      return Response.json({ error: 'A training catalog is required' }, { status: 400 });
    }

    const catalogText = catalog
      .map((m: any) => `- ${m.title}${m.group ? ` [${m.group}]` : ''}`)
      .join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a senior NDIS learning-and-development designer for an Australian disability support provider.

A training coordinator is building a role template:
- Template name: ${name || '(not set)'}
- Target role: ${role || '(not set)'}
- Purpose/description: ${description || '(not set)'}

CURRICULUM CATALOG (exact titles):
${catalogText}

MANDATORY RULES for your JSON:
1. "selected" MUST be a non-empty array containing between 5 and 10 titles COPIED VERBATIM from the CURRICULUM CATALOG above. Choose the most appropriate for this role, balancing induction essentials, safety and role-specific skills. Never invent titles in "selected".
2. "new_modules" may contain at most 3 genuinely missing modules worth adding (title + one-sentence description), or be empty if the catalog already covers the role.
3. "summary" is one short sentence explaining the selection logic.
Return JSON only.`,
      response_json_schema: {
        type: 'object',
        properties: {
          selected: { type: 'array', items: { type: 'string' } },
          new_modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, description: { type: 'string' } },
              required: ['title'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['selected'],
      },
    });

    const valid = new Set(catalog.map((m: any) => m.title));
    const clean = (t: any) => String(t || '').replace(/\s*\[[^\]]*\]\s*$/, '').trim();
    const selected = (result?.selected || []).map(clean).filter((t: any) => valid.has(t));
    await gate.logSuccess(`Authored curriculum selection (${selected.length} modules) for role "${role || 'unspecified'}".`);
    return Response.json({
      selected,
      new_modules: (result?.new_modules || []).slice(0, 5),
      summary: result?.summary || '',
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}