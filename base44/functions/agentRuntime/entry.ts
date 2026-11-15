import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId } from '../../shared/roleMatrix.ts';

// Autonomous agent runtime: an active autonomous agent reads a bounded snapshot of the
// assurance registers, drafts advisory recommendations, and every draft lands in the
// human review queue. It never changes a register, approves anything or decides care.

const DEFAULT_AGENT = {
  name: 'Autonomy Sentinel',
  kind: 'Autonomous agent',
  domain: 'Compliance',
  purpose: 'Nightly pass over the assurance registers to surface evidenced gaps and propose next actions for human review.',
  model: 'Base44 managed provider',
  owner: 'Compliance Manager',
  data_scope: 'Enterprise',
  capabilities: ['Register scan', 'Gap detection', 'Recommendation drafting'],
  guardrails: 'Advisory only. Every recommendation needs human review. No record changes, approvals or reports are sent.',
  human_review_required: true,
};

const SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          action: { type: 'string' },
          reasoning: { type: 'string' },
          priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          standard_refs: { type: 'array', items: { type: 'string' } },
          control_refs: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'action', 'reasoning', 'priority'],
      },
    },
    limitations: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'recommendations', 'limitations'],
};

const str = (value: any) => (typeof value === 'string' ? value.trim() : '');
const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);

async function readSnapshot(base44: any, tenantId: string) {
  const [standards, controls, evidence, findings, actions, issues] = await Promise.all([
    base44.asServiceRole.entities.RegulatoryStandard.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
    base44.asServiceRole.entities.ComplianceControl.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
    base44.asServiceRole.entities.AssuranceEvidence.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
    base44.asServiceRole.entities.AssuranceFinding.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
    base44.asServiceRole.entities.ImprovementAction.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
    base44.asServiceRole.entities.ComplianceIssue.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 60 }),
  ]);
  const standardsRows = items(standards);
  const controlRows = items(controls);
  const evidenceRows = items(evidence);
  const findingRows = items(findings);
  const actionRows = items(actions);
  const issueRows = items(issues);
  const open = (rows: any[], closed: string[]) => rows.filter((row) => !closed.includes(String(row.status || '')));
  return {
    records: {
      standards: standardsRows.map((row: any) => ({ code: row.standard_code, title: row.standard_title, framework: row.framework, status: row.status })),
      controls: controlRows.map((row: any) => ({ code: row.standard_code, statement: String(row.control_statement || '').slice(0, 140), owner: row.owner, status: row.status, next_test: row.next_test_date })),
      evidence: evidenceRows.map((row: any) => ({ title: row.title, control: row.standard_code, verification: row.verification_status, valid_to: row.valid_to })),
      findings: findingRows.map((row: any) => ({ title: row.title, rating: row.rating, status: row.status, due: row.due_date })),
      correctiveActions: actionRows.map((row: any) => ({ title: row.title, status: row.status, priority: row.priority, due: row.due_date })),
      issues: issueRows.map((row: any) => ({ title: row.title, status: row.status, priority: row.priority })),
    },
    metrics: {
      standards: standardsRows.length,
      controls: controlRows.length,
      evidence: evidenceRows.length,
      evidenceVerified: evidenceRows.filter((row: any) => row.verification_status === 'Verified').length,
      evidenceExpired: evidenceRows.filter((row: any) => row.verification_status === 'Expired').length,
      findingsOpen: open(findingRows, ['Closed']).length,
      actionsOpen: open(actionRows, ['Completed', 'Closed', 'Verified']).length,
      issuesOpen: open(issueRows, ['Resolved', 'Closed']).length,
    },
  };
}

async function autonomousAgents(base44: any, tenantId: string) {
  const page = await base44.asServiceRole.entities.AiAgent.filter({ tenant_id: tenantId, kind: 'Autonomous agent' });
  return items(page);
}

async function ensureAgent(base44: any, tenantId: string) {
  const existing = await autonomousAgents(base44, tenantId);
  if (existing.length) return existing;
  const created = await base44.asServiceRole.entities.AiAgent.create({ ...DEFAULT_AGENT, tenant_id: tenantId, status: 'Active' });
  return [created];
}

async function runAgent(base44: any, tenantId: string, agent: any, user: any) {
  if (String(agent.status || '') !== 'Active') {
    return { agent: agent.name, skipped: true, reason: `Agent is ${agent.status || 'not active'}.`, created: 0 };
  }
  const snapshot = await readSnapshot(base44, tenantId);
  if (!snapshot.metrics.standards && !snapshot.metrics.controls) {
    return { agent: agent.name, skipped: true, reason: 'No assurance records to review yet.', created: 0 };
  }
  const began = Date.now();
  const interaction = await base44.asServiceRole.entities.AiInteraction.create({
    tenant_id: tenantId,
    agent_name: agent.name,
    module: agent.domain || 'Compliance',
    interaction_type: 'Autonomous pass',
    model: 'Base44 managed provider — exact model not exposed',
    user_email: 'Scheduled agent run',
    actor_id: user.id,
    question: str(agent.purpose).slice(0, 500),
    response_summary: 'Autonomous pass started',
    state: 'Started',
    source_count: snapshot.metrics.standards + snapshot.metrics.controls,
    flagged: false,
    override: false,
  });
  const prompt = [
    'You are an autonomous assurance agent inside an Australian disability and aged care provider platform.',
    'You produce ADVISORY recommendations only for human review. You never approve, decide, certify, diagnose, prescribe or change a record.',
    'Use ONLY the supplied register metadata. Cite exact standard codes and control codes from the snapshot. Never invent dates, law, ratings, percentages or confidence scores.',
    'Prefer gaps that are visible in the data: controls without verified evidence, expired evidence, open findings without a corrective action, overdue actions.',
    `Agent purpose: ${str(agent.purpose) || 'Surface evidenced assurance gaps.'}`,
    `Guardrails: ${str(agent.guardrails) || 'Advisory only; human review required.'}`,
    'Return at most 5 recommendations, most material first. If the data shows no actionable gap, return an empty recommendations list and say so in the limitations.',
    `Register snapshot: ${JSON.stringify(snapshot.records)}`,
    `Metrics: ${JSON.stringify(snapshot.metrics)}`,
  ].join('\n');
  let analysis: any = null;
  try {
    analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA });
  } catch (error: any) {
    await base44.asServiceRole.entities.AiInteraction.update(interaction.id, {
      state: 'Failed',
      response_summary: 'The provider call failed.',
      error_code: 'PROVIDER_ERROR',
      duration_ms: Date.now() - began,
    });
    throw new Error(error?.message || 'The agent could not complete its pass.');
  }
  const recs = Array.isArray(analysis?.recommendations) ? analysis.recommendations.slice(0, 5) : [];
  const created = [];
  for (const item of recs) {
    const row = await base44.asServiceRole.entities.AiRecommendation.create({
      tenant_id: tenantId,
      title: str(item.title).slice(0, 140) || str(item.action).slice(0, 140),
      module: agent.domain || 'Compliance',
      agent_name: agent.name,
      recommendation_type: 'Autonomous pass',
      recommendation: str(item.action).slice(0, 1200),
      reasoning: str(item.reasoning).slice(0, 1200),
      executive_summary: str(analysis?.headline).slice(0, 600),
      priority: ['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium',
      status: 'Awaiting review',
      interaction_id: interaction.id,
      standard_refs: (item.standard_refs || []).join(', ').slice(0, 400),
      control_refs: (item.control_refs || []).slice(0, 400).join(', '),
      traceability: 'Autonomous pass over the assurance registers; human review required before any action.',
    });
    created.push(row.id);
  }
  await base44.asServiceRole.entities.AiInteraction.update(interaction.id, {
    state: 'Completed',
    response_summary: str(analysis?.headline).slice(0, 600) || 'Autonomous pass completed',
    report: { ...analysis, persisted_recommendation_count: created.length },
    duration_ms: Date.now() - began,
  });
  return { agent: agent.name, skipped: false, created: created.length, headline: str(analysis?.headline) };
}

export default perBusiness(async function (req: Request) {
  let base44;
  try {
    base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to run the agent runtime.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'status';

    if (action === 'status') {
      const agents = await autonomousAgents(base44, tenantId);
      const runs = await base44.asServiceRole.entities.AiInteraction.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 20 });
      const awaiting = await base44.asServiceRole.entities.AiRecommendation.filter({ tenant_id: tenantId, status: 'Awaiting review' });
      const runRows = items(runs);
      return Response.json({
        saved: true,
        can_run_all: user.role === 'admin',
        awaiting: items(awaiting).length,
        agents: agents.map((agent: any) => {
          const last = runRows.find((run: any) => run.agent_name === agent.name && String(run.interaction_type || '').includes('Autonomous'));
          return {
            ...agent,
            last_run: last?.created_date || '',
            last_state: last?.state || '',
            last_summary: last?.response_summary || '',
          };
        }),
        runs: runRows.map((run: any) => ({
          id: run.id,
          agent_name: run.agent_name,
          state: run.state,
          summary: run.response_summary,
          created_date: run.created_date,
          recommendations: run.report?.persisted_recommendation_count || 0,
        })),
      });
    }

    if (action === 'run') {
      const agents = await autonomousAgents(base44, tenantId);
      const agentId = str(body.agent_id);
      const agent = agentId ? agents.find((row: any) => row.id === agentId) : agents[0];
      if (!agent) return Response.json({ error: 'No autonomous agent is registered for this business yet.' }, { status: 404 });
      const result = await runAgent(base44, tenantId, agent, user);
      return Response.json({ saved: true, result });
    }

    if (action === 'run_all') {
      if (user.role !== 'admin') return Response.json({ error: 'Only an administrator can run the scheduled agent pass.' }, { status: 403 });
      const agents = (await ensureAgent(base44, tenantId)).slice(0, 3);
      const results = [];
      for (const agent of agents) {
        results.push(await runAgent(base44, tenantId, agent, user));
      }
      return Response.json({ saved: true, results });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The agent runtime could not complete that.' }, { status: 500 });
  }
});