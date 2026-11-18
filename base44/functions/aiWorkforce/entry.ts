// C9 — Autonomous AI Workforce OS service.
//
// What this function really does:
//   - keeps business-scoped models, agents, versioned prompts, tools and per-tool grants
//   - pins the exact model, prompt version and prompt hash an agent was activated on
//   - validates provider settings and refuses a credential pasted into a record (secrets live in the
//     platform secret store and are referenced by name)
//   - decides, from the tool kind and the agent's own grant, whether a proposal may proceed, then
//     routes anything that matters to a human reviewer with a reason
//   - redacts secrets and participant/staff identifiers before any record is written
//   - appends a hash-chained audit record for every action, so a removed entry is visible
//
// What it deliberately refuses:
//   - performing any action: this OS records and approves, it never executes. `execution_state` is
//     never set to anything but "Not executed", "Recorded only" or "Refused".
//   - granting autonomy to external, financial, employment, clinical, participant-impacting,
//     permission-changing, destructive or compliance-status-changing tools, whatever the screen sends
//   - letting a person review their own AI proposal
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, canComplianceReview, canManagementAct } from '../../shared/roleMatrix.ts';
import { Refusal, refuse, pageOf, getOwn, requireOwn } from '../../shared/serviceKit.ts';
import { str, nowIso } from '../../shared/registerCommon.ts';
import { canonicalJson, hashText } from '../../shared/automationFabric.ts';
import {
  AI_WORKFORCE_VERSION, PROVIDERS, MODEL_STATUSES, SENSITIVITY_LEVELS, AUTONOMY_LEVELS, AGENT_STATUSES,
  AGENT_RISK_TIERS, PROMPT_STATUSES, TOOL_KINDS, ASSIGNMENT_POLICIES, DECISION_STATES, REVIEW_OUTCOMES,
  MIN_REASON_LENGTH, riskOfKind, autonomousEligible, validateModelSettings, validateToolPolicy,
  promptGuardrailProblem, normaliseVariables, decidePolicy, reviewTransition, redactText, redactRecord,
  chainHash, auditRef, decisionRef, reviewRef, confidenceBand, decisionSummary, parseJson,
} from '../../shared/aiWorkforce.ts';

const canRead = (user: any) => canComplianceReview(user);
const canReview = (user: any) => canComplianceReview(user);
const canConfigureAgents = (user: any) => canComplianceReview(user);
const canManageModels = (user: any) => canManagementAct(user);
const canGrantTools = (user: any) => canManagementAct(user);

const MAX_ROWS = 200;
const DECISION_REVIEW_HOURS = 72;

const slug = (value: unknown, fallback: string) => {
  const text = str(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
  return text || fallback;
};

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the AI workforce.' }, { status: 401 });

    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId || !canRead(user)) {
      return Response.json({ error: 'Approved compliance access to your assigned business is required.' }, { status: 403 });
    }

    const tenantId = base44.businessId;
    const entities = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';
    const actor = user.full_name || user.email || 'Unknown';
    const configure = (allowed: boolean, message: string) => { if (!allowed) refuse(message, 403); };

    /* ------------------------------------------------------------------ audit trail */

    const appendAudit = async (
      auditAction: string, subjectType: string, subject: any, detail: any,
      outcome: 'Recorded' | 'Refused' | 'Changed' = 'Recorded', correlationId = '',
    ) => {
      const last = (await pageOf(entities.AiAuditRecord, { tenant_id: tenantId }, '-created_date', 1))[0];
      const safe = redactText(typeof detail === 'string' ? detail : JSON.stringify(detail ?? {}), 2000);
      const entry = {
        occurred_at: nowIso(),
        action: auditAction,
        subject_type: subjectType,
        subject_ref: str(subject?.decision_ref || subject?.agent_key || subject?.prompt_key || subject?.model_key || subject?.tool_key || subject?.assignment_key || subject?.audit_ref),
        subject_id: str(subject?.id),
        outcome,
        detail: safe.text,
        correlation_id: correlationId,
      };
      return entities.AiAuditRecord.create({
        tenant_id: tenantId,
        audit_ref: auditRef(),
        actor,
        actor_id: user.id,
        actor_role: String(user.role || ''),
        redacted_count: safe.redactions.length,
        previous_hash: last?.chain_hash || '',
        chain_hash: await chainHash(last?.chain_hash || '', entry),
        ...entry,
      });
    };

    /* ------------------------------------------------------------------ read */

    if (action === 'list') {
      const [models, agents, prompts, tools, assignments, decisionRows, reviews, auditRows] = await Promise.all([
        pageOf(entities.AiWorkforceModel, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.AiWorkforceAgent, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.AiPromptVersion, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.AiTool, { tenant_id: tenantId }, 'name', MAX_ROWS),
        pageOf(entities.AiAgentToolAssignment, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.AiDecisionRecord, { tenant_id: tenantId }, '-created_date', 100),
        pageOf(entities.AiDecisionReview, { tenant_id: tenantId }, '-decided_at', 100),
        pageOf(entities.AiAuditRecord, { tenant_id: tenantId }, '-occurred_at', 100),
      ]);

      const decisions = decisionRows.map(decisionSummary).filter(Boolean) as any[];
      const byStatus = DECISION_STATES.reduce((acc: Record<string, number>, state) => {
        acc[state] = decisions.filter((row: any) => row.status === state).length;
        return acc;
      }, {});

      return Response.json({
        saved: true,
        role: user.role,
        canReview: canReview(user),
        canConfigureAgents: canConfigureAgents(user),
        canManageModels: canManageModels(user),
        canGrantTools: canGrantTools(user),
        workforceVersion: AI_WORKFORCE_VERSION,
        meta: {
          providers: PROVIDERS,
          modelStatuses: MODEL_STATUSES,
          sensitivities: SENSITIVITY_LEVELS,
          autonomyLevels: AUTONOMY_LEVELS,
          agentStatuses: AGENT_STATUSES,
          riskTiers: AGENT_RISK_TIERS,
          promptStatuses: PROMPT_STATUSES,
          toolKinds: TOOL_KINDS.map((kind) => ({ kind, risk: riskOfKind(kind), autonomousEligible: autonomousEligible(kind) })),
          policies: ASSIGNMENT_POLICIES,
          decisionStates: DECISION_STATES,
          reviewOutcomes: REVIEW_OUTCOMES,
          minReasonLength: MIN_REASON_LENGTH,
        },
        models,
        agents,
        prompts,
        tools,
        assignments,
        decisions,
        reviews,
        audit: auditRows,
        counts: {
          models: models.length,
          validatedModels: models.filter((row: any) => row.status === 'Validated').length,
          agents: agents.length,
          activeAgents: agents.filter((row: any) => row.status === 'Active').length,
          pausedOrDisabled: agents.filter((row: any) => ['Paused', 'Disabled'].includes(row.status)).length,
          prompts: prompts.length,
          publishedPrompts: prompts.filter((row: any) => row.status === 'Published').length,
          tools: tools.length,
          assignments: assignments.length,
          activeAssignments: assignments.filter((row: any) => row.status === 'Active').length,
          autonomousGrants: assignments.filter((row: any) => row.status === 'Active' && row.policy === 'Allowed internal').length,
          decisions: decisions.length,
          awaitingReview: byStatus['Awaiting human review'] || 0,
          permittedInternal: byStatus['Permitted internal'] || 0,
          approved: byStatus.Approved || 0,
          rejected: byStatus.Rejected || 0,
          overridden: byStatus.Overridden || 0,
          blocked: byStatus.Blocked || 0,
          safeFailures: byStatus['Safe failure'] || 0,
          reviews: reviews.length,
          auditRecords: auditRows.length,
        },
      });
    }

    if (action === 'decision') {
      const decision = await requireOwn(entities.AiDecisionRecord, body.decision_id, tenantId, 'decision');
      const [reviews, auditRows] = await Promise.all([
        pageOf(entities.AiDecisionReview, { tenant_id: tenantId, decision_id: decision.id }, '-decided_at', 20),
        pageOf(entities.AiAuditRecord, { tenant_id: tenantId, subject_id: decision.id }, '-occurred_at', 20),
      ]);
      return Response.json({
        saved: true,
        decision,
        reviews,
        audit: auditRows,
        inputRefs: parseJson(decision.input_refs_json, []),
      });
    }

    /* ------------------------------------------------------------------ models */

    if (action === 'saveModel') {
      configure(canManageModels(user), 'Only an administrator or management can register an AI model.');
      const validated = validateModelSettings(body);
      if (!validated.ok) refuse(validated.errors.join(' '));
      const name = str(body.name).slice(0, 160) || validated.value!.provider_model_id;

      const patch: any = {
        name,
        ...validated.value,
        capabilities_json: JSON.stringify((Array.isArray(body.capabilities) ? body.capabilities : []).map((v: any) => str(v)).filter(Boolean).slice(0, 20)),
        owner_role: str(body.owner_role).slice(0, 120),
        notes: str(body.notes).slice(0, 2000),
      };

      if (str(body.model_id)) {
        const existing = await requireOwn(entities.AiWorkforceModel, body.model_id, tenantId, 'model');
        if (existing.status === 'Retired') refuse('A retired model cannot be edited.', 409);
        const changed = ['provider', 'provider_model_id', 'credential_ref', 'context_window', 'sensitivity_ceiling']
          .some((key) => String(existing[key] ?? '') !== String(patch[key] ?? ''));
        const record = await entities.AiWorkforceModel.update(existing.id, {
          ...patch,
          ...(changed ? { status: 'Registered', validated_at: '', validated_by: '', validation_note: '' } : {}),
        });
        await appendAudit('AI model settings saved', 'AiWorkforceModel', record, {
          model_key: record.model_key, provider: record.provider, changed, revalidated: changed,
        });
        return Response.json({ saved: true, model: record, requiresValidation: changed });
      }

      const total = await entities.AiWorkforceModel.count({ tenant_id: tenantId });
      const record = await entities.AiWorkforceModel.create({
        tenant_id: tenantId,
        model_key: `MOD-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Registered',
        created_by_name: actor,
      });
      await appendAudit('AI model registered', 'AiWorkforceModel', record, {
        model_key: record.model_key, provider: record.provider, has_credential_reference: Boolean(record.credential_ref),
      });
      return Response.json({ saved: true, model: record });
    }

    if (action === 'validateModel') {
      configure(canManageModels(user), 'Only an administrator or management can validate an AI model.');
      const existing = await requireOwn(entities.AiWorkforceModel, body.model_id, tenantId, 'model');
      if (existing.status === 'Retired') refuse('A retired model cannot be validated.', 409);
      const validated = validateModelSettings(existing);
      if (!validated.ok) refuse(validated.errors.join(' '));
      const record = await entities.AiWorkforceModel.update(existing.id, {
        status: 'Validated',
        validated_at: nowIso(),
        validated_by: actor,
        validation_note: str(body.note).slice(0, 2000) || 'Provider settings complete and the credential is referenced by name.',
      });
      await appendAudit('AI model validated', 'AiWorkforceModel', record, {
        model_key: record.model_key, note: record.validation_note,
      });
      return Response.json({ saved: true, model: record });
    }

    if (action === 'retireModel') {
      configure(canManageModels(user), 'Only an administrator or management can retire an AI model.');
      const existing = await requireOwn(entities.AiWorkforceModel, body.model_id, tenantId, 'model');
      const inUse = await entities.AiWorkforceAgent.count({ tenant_id: tenantId, model_id: existing.id, status: 'Active' });
      if (inUse > 0) refuse('An active agent still runs on this model. Pause or disable that agent first.', 409);
      const record = await entities.AiWorkforceModel.update(existing.id, { status: 'Retired', retired_at: nowIso() });
      await appendAudit('AI model retired', 'AiWorkforceModel', record, { model_key: record.model_key });
      return Response.json({ saved: true, model: record });
    }

    /* ------------------------------------------------------------------ prompts */

    if (action === 'savePrompt') {
      configure(canConfigureAgents(user), 'Your role cannot change AI prompts.');
      const promptProblem = promptGuardrailProblem(body.body);
      if (promptProblem) refuse(promptProblem);
      const variables = normaliseVariables(body.variables);
      if (!variables.ok) refuse(variables.error);

      const name = str(body.name).slice(0, 160);
      if (!name) refuse('Give the prompt a name.');
      const promptKey = slug(body.prompt_key || name, 'prompt');
      const previous = (await pageOf(entities.AiPromptVersion, { tenant_id: tenantId, prompt_key: promptKey }, '-version', 1))[0];
      const promptBody = String(body.body);

      const record = await entities.AiPromptVersion.create({
        tenant_id: tenantId,
        prompt_key: promptKey,
        name,
        version: Number(previous?.version || 0) + 1,
        purpose: str(body.purpose).slice(0, 1000),
        body: promptBody,
        body_hash: await hashText(promptBody),
        variables_json: JSON.stringify(variables.variables),
        variable_count: variables.variables.length,
        status: 'Draft',
        previous_version_id: previous?.id || '',
        change_note: str(body.change_note).slice(0, 400) || (previous ? 'New version.' : 'First version.'),
        author: actor,
        author_id: user.id,
        review_due: str(body.review_due).slice(0, 10),
        notes: str(body.notes).slice(0, 2000),
      });
      await appendAudit('AI prompt version saved', 'AiPromptVersion', record, {
        prompt_key: promptKey, version: record.version, variables: record.variable_count,
      });
      return Response.json({ saved: true, prompt: record });
    }

    if (action === 'publishPrompt') {
      configure(canConfigureAgents(user), 'Your role cannot publish AI prompts.');
      const prompt = await requireOwn(entities.AiPromptVersion, body.prompt_id, tenantId, 'prompt version');
      if (['Retired'].includes(prompt.status)) refuse('A retired prompt version cannot be published.', 409);
      if (prompt.status === 'Published') refuse('This prompt version is already published.', 409);
      const promptProblem = promptGuardrailProblem(prompt.body);
      if (promptProblem) refuse(promptProblem);

      const siblings = await pageOf(entities.AiPromptVersion, { tenant_id: tenantId, prompt_key: prompt.prompt_key, status: 'Published' }, '-version', 20);
      await Promise.all(siblings.map((row: any) => entities.AiPromptVersion.update(row.id, { status: 'Retired', retired_at: nowIso() })));

      const record = await entities.AiPromptVersion.update(prompt.id, {
        status: 'Published',
        body_hash: await hashText(prompt.body),
        published_at: nowIso(),
        published_by: actor,
        publisher_independent: String(prompt.author || '') !== actor,
        validated_at: prompt.validated_at || nowIso(),
        validated_by: prompt.validated_by || actor,
        validation_note: prompt.validation_note || 'Human-review guardrail present.',
      });
      await appendAudit('AI prompt version published', 'AiPromptVersion', record, {
        prompt_key: record.prompt_key, version: record.version, independent: record.publisher_independent,
        retired_versions: siblings.length,
      });
      return Response.json({ saved: true, prompt: record });
    }

    /* ------------------------------------------------------------------ agents */

    if (action === 'saveAgent') {
      configure(canConfigureAgents(user), 'Your role cannot change AI agents.');
      const model = await requireOwn(entities.AiWorkforceModel, body.model_id, tenantId, 'model');
      if (model.status !== 'Validated') refuse('Only a validated model can run an agent. Validate the model first.', 409);
      const prompt = await requireOwn(entities.AiPromptVersion, body.prompt_id, tenantId, 'prompt version');
      if (prompt.status !== 'Published') refuse('Only a published prompt version can run an agent.', 409);
      const autonomyLevel = str(body.autonomy_level) || 'Suggest only';
      if (!AUTONOMY_LEVELS.includes(autonomyLevel)) refuse('Choose an autonomy level from the list.');
      const riskTier = AGENT_RISK_TIERS.includes(str(body.risk_tier)) ? str(body.risk_tier) : 'Low';

      const name = str(body.name).slice(0, 160);
      if (!name) refuse('Give the agent a name.');
      const patch: any = {
        name,
        purpose: str(body.purpose).slice(0, 500),
        description: str(body.description).slice(0, 2000),
        model_id: model.id,
        model_key: model.model_key,
        model_name: model.name,
        model_version: Number(model.context_window || 0),
        prompt_id: prompt.id,
        prompt_key: prompt.prompt_key,
        prompt_name: prompt.name,
        prompt_version: Number(prompt.version || 1),
        prompt_hash: prompt.body_hash || '',
        autonomy_level: autonomyLevel,
        risk_tier: riskTier,
        data_scope: str(body.data_scope).slice(0, 1000),
        owner_role: str(body.owner_role).slice(0, 120),
        review_due: str(body.review_due).slice(0, 10),
        notes: str(body.notes).slice(0, 2000),
      };

      if (str(body.agent_id)) {
        const existing = await requireOwn(entities.AiWorkforceAgent, body.agent_id, tenantId, 'agent');
        if (existing.status === 'Active') {
          const repoint = String(existing.model_id) !== String(patch.model_id) || String(existing.prompt_id) !== String(patch.prompt_id);
          if (repoint) refuse('Pause this agent before changing its model or prompt version, so the change is reviewed before it runs again.', 409);
        }
        const record = await entities.AiWorkforceAgent.update(existing.id, patch);
        await appendAudit('AI agent updated', 'AiWorkforceAgent', record, {
          agent_key: record.agent_key, autonomy: record.autonomy_level, risk: record.risk_tier,
        });
        return Response.json({ saved: true, agent: record });
      }

      const total = await entities.AiWorkforceAgent.count({ tenant_id: tenantId });
      const record = await entities.AiWorkforceAgent.create({
        tenant_id: tenantId,
        agent_key: `AGT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Draft',
        tool_count: 0,
        decision_count: 0,
        author: actor,
        author_id: user.id,
      });
      await appendAudit('AI agent registered', 'AiWorkforceAgent', record, {
        agent_key: record.agent_key, model: record.model_name, prompt_version: record.prompt_version,
      });
      return Response.json({ saved: true, agent: record });
    }

    if (action === 'setAgentStatus') {
      configure(canConfigureAgents(user), 'Your role cannot change AI agents.');
      const existing = await requireOwn(entities.AiWorkforceAgent, body.agent_id, tenantId, 'agent');
      const status = str(body.status);
      if (!AGENT_STATUSES.includes(status)) refuse('Choose a status from the list.');
      const reason = str(body.reason).slice(0, 1000);

      if (status === 'Active') {
        const model = await getOwn(entities.AiWorkforceModel, existing.model_id, tenantId);
        if (!model || model.status !== 'Validated') refuse('This agent cannot be activated: its model is no longer validated.', 409);
        const prompt = await getOwn(entities.AiPromptVersion, existing.prompt_id, tenantId);
        if (!prompt || prompt.status !== 'Published') refuse('This agent cannot be activated: its pinned prompt version is not published.', 409);
      }
      if (['Paused', 'Disabled', 'Archived'].includes(status) && reason.length < 5) {
        refuse(`Say why this agent is being ${status.toLowerCase()}. That reason is the record.`);
      }

      const record = await entities.AiWorkforceAgent.update(existing.id, {
        status,
        status_reason: status === 'Active' ? '' : reason,
        paused_by: ['Paused', 'Disabled', 'Archived'].includes(status) ? actor : existing.paused_by || '',
        paused_at: ['Paused', 'Disabled', 'Archived'].includes(status) ? nowIso() : existing.paused_at || '',
        activated_at: status === 'Active' ? nowIso() : existing.activated_at || '',
      });
      await appendAudit(`AI agent ${status.toLowerCase()}`, 'AiWorkforceAgent', record, {
        agent_key: record.agent_key, previous_status: existing.status, reason,
      }, status === 'Active' ? 'Changed' : 'Changed');
      return Response.json({ saved: true, agent: record });
    }

    /* ------------------------------------------------------------------ tools and grants */

    if (action === 'saveTool') {
      configure(canGrantTools(user), 'Only an administrator or management can define an AI tool.');
      const kind = str(body.kind);
      if (!TOOL_KINDS.includes(kind)) refuse('Choose a tool kind from the list.');
      const name = str(body.name).slice(0, 160);
      if (!name) refuse('Give the tool a name.');
      const risk = riskOfKind(kind);
      const eligible = autonomousEligible(kind);

      const patch: any = {
        name,
        description: str(body.description).slice(0, 2000),
        kind,
        risk_level: risk,
        autonomous_allowed: eligible,
        requires_human_approval: !eligible,
        idempotency_supported: Boolean(body.idempotency_supported),
        owner_role: str(body.owner_role).slice(0, 120),
        notes: str(body.notes).slice(0, 2000),
      };

      if (str(body.tool_id)) {
        const existing = await requireOwn(entities.AiTool, body.tool_id, tenantId, 'tool');
        const record = await entities.AiTool.update(existing.id, patch);
        await appendAudit('AI tool updated', 'AiTool', record, { tool_key: record.tool_key, kind: record.kind, risk: record.risk_level });
        return Response.json({ saved: true, tool: record });
      }

      const total = await entities.AiTool.count({ tenant_id: tenantId });
      const record = await entities.AiTool.create({
        tenant_id: tenantId,
        tool_key: `TOOL-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Active',
        created_by_name: actor,
      });
      await appendAudit('AI tool defined', 'AiTool', record, { tool_key: record.tool_key, kind: record.kind, risk: record.risk_level });
      return Response.json({ saved: true, tool: record });
    }

    if (action === 'saveAssignment') {
      configure(canGrantTools(user), 'Only an administrator or management can grant a tool to an agent.');
      const agent = await requireOwn(entities.AiWorkforceAgent, body.agent_id, tenantId, 'agent');
      const tool = await requireOwn(entities.AiTool, body.tool_id, tenantId, 'tool');
      if (tool.status !== 'Active') refuse('That tool is disabled, so it cannot be granted.', 409);
      const policy = str(body.policy);
      const validated = validateToolPolicy({ kind: tool.kind, policy, idempotency_supported: tool.idempotency_supported });
      if (!validated.ok) refuse(validated.errors.join(' '));
      const justification = str(body.least_privilege_note);
      if (justification.length < 10) refuse('Record why this agent needs this tool, in at least a sentence. Least privilege has to be justified.');

      const patch: any = {
        agent_id: agent.id,
        agent_key: agent.agent_key,
        agent_name: agent.name,
        tool_id: tool.id,
        tool_key: tool.tool_key,
        tool_name: tool.name,
        tool_kind: tool.kind,
        tool_risk_level: riskOfKind(tool.kind),
        policy,
        requires_human_approval: validated.requires_human_approval,
        idempotency_required: policy === 'Allowed internal',
        rate_limit_per_run: Math.min(50, Math.max(1, Number(body.rate_limit_per_run) || 1)),
        least_privilege_note: justification.slice(0, 1000),
        review_due: str(body.review_due).slice(0, 10),
        notes: str(body.notes).slice(0, 2000),
      };

      if (str(body.assignment_id)) {
        const existing = await requireOwn(entities.AiAgentToolAssignment, body.assignment_id, tenantId, 'grant');
        const record = await entities.AiAgentToolAssignment.update(existing.id, patch);
        await appendAudit('AI tool grant changed', 'AiAgentToolAssignment', record, {
          agent_key: record.agent_key, tool_key: record.tool_key, policy: record.policy,
        }, 'Changed');
        return Response.json({ saved: true, assignment: record });
      }

      const total = await entities.AiAgentToolAssignment.count({ tenant_id: tenantId });
      const record = await entities.AiAgentToolAssignment.create({
        tenant_id: tenantId,
        assignment_key: `GRANT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Active',
        granted_by: actor,
        granted_by_id: user.id,
        granted_at: nowIso(),
      });
      const activeCount = await entities.AiAgentToolAssignment.count({ tenant_id: tenantId, agent_id: agent.id, status: 'Active' });
      await entities.AiWorkforceAgent.update(agent.id, { tool_count: activeCount });
      await appendAudit('AI tool granted', 'AiAgentToolAssignment', record, {
        agent_key: record.agent_key, tool_key: record.tool_key, policy: record.policy,
        autonomous: record.autonomous_allowed, risk: record.tool_risk_level,
      });
      return Response.json({ saved: true, assignment: record });
    }

    if (action === 'setAssignmentStatus') {
      configure(canGrantTools(user), 'Only an administrator or management can change a tool grant.');
      const existing = await requireOwn(entities.AiAgentToolAssignment, body.assignment_id, tenantId, 'grant');
      const status = str(body.status);
      if (!['Active', 'Disabled'].includes(status)) refuse('A grant is either Active or Disabled.');
      const record = await entities.AiAgentToolAssignment.update(existing.id, { status });
      const activeCount = await entities.AiAgentToolAssignment.count({ tenant_id: tenantId, agent_id: record.agent_id, status: 'Active' });
      await entities.AiWorkforceAgent.update(record.agent_id, { tool_count: activeCount });
      await appendAudit(`AI tool grant ${status.toLowerCase()}`, 'AiAgentToolAssignment', record, {
        agent_key: record.agent_key, tool_key: record.tool_key,
      }, 'Changed');
      return Response.json({ saved: true, assignment: record });
    }

    /* ------------------------------------------------------------------ decisions */

    if (action === 'submitDecision') {
      configure(canConfigureAgents(user), 'Your role cannot record an AI proposal.');
      const agent = await requireOwn(entities.AiWorkforceAgent, body.agent_id, tenantId, 'agent');
      const tool = str(body.tool_id) ? await requireOwn(entities.AiTool, body.tool_id, tenantId, 'tool') : null;
      const assignment = tool
        ? (await pageOf(entities.AiAgentToolAssignment, { tenant_id: tenantId, agent_id: agent.id, tool_id: tool.id }, '-created_date', 5))
          .find((row: any) => row.status === 'Active') || null
        : null;

      const actionTitle = str(body.action_title).slice(0, 200);
      if (!actionTitle) refuse('State the action the agent proposed.');
      const outputSummary = str(body.output_summary);
      if (!outputSummary) refuse('Record what the agent produced, even if that is only a recommendation.');
      const inputSource = str(body.input_source).slice(0, 200);
      if (!inputSource) refuse('Record where the input came from, so the proposal can be traced.');

      const confidence = Number(body.confidence);
      if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
        refuse('Confidence must be a number from 0 to 100. Leave it out only if the agent stated none.');
      }

      const policy = decidePolicy({
        agentStatus: agent.status,
        autonomyLevel: agent.autonomy_level,
        assignment,
        toolKind: tool?.kind,
        idempotencyKey: body.idempotency_key,
        confidence,
      });

      const safeAction = redactText(body.action_summary, 2000);
      const safeOutput = redactText(outputSummary);
      const safeRationale = redactText(body.rationale, 2000);
      const safeInput = redactText(body.input_summary, 2000);
      const refs = redactRecord(Array.isArray(body.input_refs) ? body.input_refs.slice(0, 30) : []);

      const key = await hashText(canonicalJson({
        tenantId,
        agentId: agent.id,
        toolId: tool?.id || '',
        actionTitle,
        outputHash: safeOutput.text,
        statedKey: str(body.idempotency_key),
      }));
      const duplicate = (await pageOf(entities.AiDecisionRecord, { tenant_id: tenantId, idempotency_key: key }, '-created_date', 1))[0];
      if (duplicate) {
        return Response.json({
          saved: true,
          deduplicated: true,
          decision: decisionSummary(duplicate),
          verdict: duplicate.policy_verdict,
          reason: 'This exact proposal was already recorded for this agent; nothing was recorded twice.',
          redactedFields: [],
        });
      }

      // Correlation only. This OS never starts a workflow from a decision.
      let workflow: any = null;
      if (str(body.workflow_instance_id)) {
        workflow = await getOwn(entities.WorkflowInstance, body.workflow_instance_id, tenantId);
      }

      const now = new Date();
      const record = await entities.AiDecisionRecord.create({
        tenant_id: tenantId,
        decision_ref: decisionRef(now),
        agent_id: agent.id,
        agent_key: agent.agent_key,
        agent_name: agent.name,
        agent_status_at_run: agent.status,
        autonomy_level: agent.autonomy_level,
        model_ref_id: agent.model_id,
        model_key: agent.model_key,
        model_name: agent.model_name,
        model_version: Number(agent.model_version || 0),
        prompt_key: agent.prompt_key,
        prompt_name: agent.prompt_name,
        prompt_version: Number(agent.prompt_version || 1),
        prompt_hash: agent.prompt_hash || '',
        tool_key: tool?.tool_key || '',
        tool_name: tool?.name || '',
        tool_kind: tool?.kind || '',
        tool_risk_level: tool ? riskOfKind(tool.kind) : '',
        assignment_id: assignment?.id || '',
        assignment_policy: assignment?.policy || 'None',
        action_title: actionTitle,
        action_summary: safeAction.text,
        input_source: inputSource,
        input_refs_json: JSON.stringify(refs.value),
        input_summary: safeInput.text,
        input_hash: await hashText(canonicalJson({ source: inputSource, summary: safeInput.text, refs: refs.value })),
        output_summary: safeOutput.text,
        output_hash: await hashText(safeOutput.text),
        confidence: Math.round(confidence),
        confidence_band: confidenceBand(confidence),
        rationale: safeRationale.text,
        policy_verdict: policy.verdict,
        policy_reason: policy.reason,
        status: policy.status,
        execution_state: policy.executionState,
        redacted_count: safeAction.redactions.length + safeOutput.redactions.length + safeRationale.redactions.length + safeInput.redactions.length + refs.redactedCount,
        idempotency_key: key,
        correlation_id: `trace-${key.replace(/^[a-z0-9]+:/, '').slice(0, 24)}`,
        workflow_definition_id: workflow?.definition_id || '',
        workflow_definition_name: workflow?.definition_name || '',
        workflow_definition_version: workflow?.definition_version ?? null,
        workflow_instance_id: workflow?.id || '',
        requested_by: actor,
        requested_by_id: user.id,
        expires_at: new Date(now.getTime() + DECISION_REVIEW_HOURS * 3600 * 1000).toISOString(),
        notes: str(body.notes).slice(0, 2000),
      });

      await entities.AiWorkforceAgent.update(agent.id, {
        decision_count: Number(agent.decision_count || 0) + 1,
        last_activity_at: nowIso(),
      });
      await appendAudit('AI proposal recorded', 'AiDecisionRecord', record, {
        decision_ref: record.decision_ref, agent_key: record.agent_key, tool_kind: record.tool_kind,
        verdict: record.policy_verdict, status: record.status, redacted: record.redacted_count,
      }, policy.verdict === 'Blocked' ? 'Refused' : 'Recorded', record.correlation_id);

      return Response.json({
        saved: true,
        decision: decisionSummary(record),
        verdict: policy.verdict,
        reason: policy.reason,
        redactedFields: [...safeAction.redactions, ...safeOutput.redactions, ...safeInput.redactions, ...refs.redactedFields],
      });
    }

    if (action === 'reviewDecision') {
      configure(canReview(user), 'Your role cannot review an AI decision.');
      const decision = await requireOwn(entities.AiDecisionRecord, body.decision_id, tenantId, 'decision');
      const outcome = str(body.outcome);
      const transition = reviewTransition({
        decision,
        outcome,
        reason: body.reason,
        overrideReason: body.override_reason,
        reviewerName: actor,
        reviewerId: user.id,
        reviewerRole: user.role,
      });
      if (!transition.ok) refuse(transition.errors.join(' '));

      const review = await entities.AiDecisionReview.create({
        tenant_id: tenantId,
        review_ref: reviewRef(),
        decision_id: decision.id,
        decision_ref: decision.decision_ref,
        agent_name: decision.agent_name || '',
        action_title: decision.action_title || '',
        policy_verdict: decision.policy_verdict || '',
        outcome,
        reason: str(body.reason).slice(0, 2000),
        override_reason: transition.patch!.override_reason,
        conditions: str(body.conditions).slice(0, 1000),
        reviewer: actor,
        reviewer_id: user.id,
        reviewer_role: String(user.role || ''),
        independent: true,
        decided_at: transition.patch!.reviewed_at,
        correlation_id: decision.correlation_id || '',
        notes: str(body.notes).slice(0, 1000),
      });

      const updated = await entities.AiDecisionRecord.update(decision.id, {
        ...transition.patch,
        review_id: review.id,
      });
      await appendAudit(`AI decision ${outcome.toLowerCase()}`, 'AiDecisionRecord', updated, {
        decision_ref: updated.decision_ref, outcome, reason: str(body.reason).slice(0, 400),
        override_reason: str(body.override_reason).slice(0, 400), execution_state: updated.execution_state,
      }, 'Changed', updated.correlation_id || '');

      return Response.json({ saved: true, decision: decisionSummary(updated), review });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    const status = error instanceof Refusal || [400, 401, 403, 404, 409, 422].includes(error?.status)
      ? Number(error.status) || 400
      : 500;
    const message = status === 500
      ? 'The AI workforce could not complete that. Refresh and try again, or tell your administrator.'
      : redactText(error?.message || 'That action is not available.').text;
    return Response.json({ error: message }, { status });
  }
});