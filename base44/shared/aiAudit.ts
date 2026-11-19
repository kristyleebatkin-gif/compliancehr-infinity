// AI audit trail (AI governance law, ULTIMATE_ALL_IN_ONE_MASTER_SPECIFICATION.md section 6).
// Every model call made through loggedInvokeLLM writes one AiInteraction record: who asked, which
// feature, what was asked, a summary of the answer, how long it took and whether it failed.
// Logging never blocks or changes the feature: if the audit write fails, the answer is still returned.
// AI output recorded here is a draft. It never approves, closes or changes a governed record.

const MODEL_LABEL = 'Base44 managed provider - exact model not exposed';

type AuditContext = {
  feature: string;          // backend function name, e.g. 'incidentTriage'
  module?: string;          // app module the answer is used in
  user?: any;               // signed-in user, when there is one
  tenantId?: string | null; // business the call belongs to, when known
  sourceCount?: number;     // records given to the model, when known
};

function tenantOf(ctx: AuditContext): string | null {
  return ctx.tenantId || ctx.user?.tenant_id || ctx.user?.data?.tenant_id || null;
}

function summarise(value: unknown, max: number): string {
  if (value == null) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return String(text || '').slice(0, max);
}

export async function loggedInvokeLLM(client: any, ctx: AuditContext, params: any) {
  const began = Date.now();
  let result: any;
  let failure: any = null;
  try {
    result = await client.integrations.Core.InvokeLLM(params);
    return result;
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    try {
      const tenantId = tenantOf(ctx);
      await client.entities.AiInteraction.create({
        ...(tenantId ? { tenant_id: tenantId } : {}),
        agent_name: ctx.feature,
        module: ctx.module || ctx.feature,
        interaction_type: 'Generate',
        model: MODEL_LABEL,
        user_email: ctx.user?.email || 'system',
        actor_id: ctx.user?.id || undefined,
        question: summarise(params?.prompt, 2000),
        response_summary: failure
          ? `Failed: ${summarise(failure?.message || failure, 400)}`
          : summarise(result, 600) || 'Empty response',
        state: failure ? 'Failed' : 'Completed',
        ...(failure ? { error_code: 'LLM_CALL_FAILED' } : {}),
        duration_ms: Date.now() - began,
        prompt_version: `${ctx.feature}@1`,
        ...(typeof ctx.sourceCount === 'number' ? { source_count: ctx.sourceCount } : {}),
        flagged: false,
        override: false,
      });
    } catch {
      // The audit write must never break the feature. A missing record shows in AI governance reports.
    }
  }
}
