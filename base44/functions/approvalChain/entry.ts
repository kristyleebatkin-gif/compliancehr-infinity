import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId } from '../../shared/roleMatrix.ts';
import { CHAIN_CATEGORIES, buildStages, stageAt, canDecide, isRiskLevel, stageNames } from '../../shared/approvalChainRules.ts';

const str = (value: any) => (typeof value === 'string' ? value.trim() : '');
const dateOnly = (value: any) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '');
const isoInDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

function safeStages(row: any) {
  try {
    const parsed = JSON.parse(row?.stages_json || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeDecisions(row: any) {
  try {
    const parsed = JSON.parse(row?.decisions_json || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function view(row: any, user: any) {
  return {
    ...row,
    stages: safeStages(row),
    decisions: safeDecisions(row),
    mine: row.requested_by_id === user.id || (row.requested_by_email && row.requested_by_email === user.email),
  };
}

export default perBusiness(async function (req: Request) {
  let base44;
  try {
    base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use approval chains.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';

    if (action === 'list') {
      const page = await base44.entities.ApprovalChain.filter({ tenant_id: tenantId }, { sort: '-requested_at', limit: 100 });
      return Response.json({
        saved: true,
        role: user.role,
        categories: CHAIN_CATEGORIES,
        chains: (page?.items || []).map((row: any) => view(row, user)),
      });
    }

    if (action === 'create') {
      const title = str(body.title).slice(0, 160);
      if (title.length < 4) return Response.json({ error: 'Describe what needs approval (at least 4 characters).' }, { status: 400 });
      const category = CHAIN_CATEGORIES.includes(body.category) ? body.category : '';
      if (!category) return Response.json({ error: 'Choose an approval category.' }, { status: 400 });
      const amount = Number(body.amount) > 0 ? Number(body.amount) : 0;
      const riskLevel = isRiskLevel(body.risk_level) ? body.risk_level : 'Medium';
      const stages = buildStages(category, { amount, riskLevel });
      const first = stageAt(stages, 1);
      if (!first) return Response.json({ error: 'No approval stage is configured for that category.' }, { status: 400 });
      const created = await base44.asServiceRole.entities.ApprovalChain.create({
        tenant_id: tenantId,
        title,
        summary: str(body.summary).slice(0, 800),
        module: str(body.module).slice(0, 80),
        record_type: str(body.record_type).slice(0, 60),
        record_id: str(body.record_id).slice(0, 80),
        record_url: str(body.record_url).slice(0, 300),
        category,
        amount,
        risk_level: riskLevel,
        levels: stages.length,
        stages_json: JSON.stringify(stages),
        stage_names: stageNames(stages),
        current_level: 1,
        current_stage: first.name,
        current_roles: (first.roles || []).join(', '),
        status: 'Pending',
        requested_by_id: user.id,
        requested_by_name: user.full_name || user.email,
        requested_by_email: user.email,
        requested_at: new Date().toISOString(),
        due_date: dateOnly(body.due_date) || isoInDays(7),
        decisions_json: '[]',
        decision_count: 0,
      });
      return Response.json({ saved: true, chain: view(created, user) });
    }

    if (action === 'decide') {
      const id = str(body.id);
      if (!id) return Response.json({ error: 'Choose a request to decide.' }, { status: 400 });
      const chain = await base44.asServiceRole.entities.ApprovalChain.get(id).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!chain || chain.tenant_id !== tenantId) return Response.json({ error: 'That request was not found.' }, { status: 404 });
      if (chain.status !== 'Pending') return Response.json({ error: 'That request is already closed.' }, { status: 400 });
      const stages = safeStages(chain);
      const stage = stageAt(stages, chain.current_level);
      if (!stage) return Response.json({ error: 'The current approval stage is missing.' }, { status: 400 });
      if (!canDecide(stage, user.role)) {
        return Response.json({ error: `Level ${stage.level} (${stage.name}) is decided by ${(stage.roles || []).join(', ')}.` }, { status: 403 });
      }
      const ownRequest = chain.requested_by_id === user.id
        || (chain.requested_by_email && String(chain.requested_by_email).toLowerCase() === String(user.email || '').toLowerCase());
      if (ownRequest) return Response.json({ error: 'You cannot decide your own request. Another approver must decide it.' }, { status: 403 });
      if (!['return', 'approve'].includes(body.decision)) return Response.json({ error: 'Choose approve or return.' }, { status: 400 });
      const decision = body.decision;
      const note = str(body.note).slice(0, 1000);
      const signature = str(body.signature).slice(0, 120);
      if (decision === 'approve' && signature.length < 2) return Response.json({ error: 'Type your full name to sign the approval.' }, { status: 400 });
      if (decision === 'return' && note.length < 3) return Response.json({ error: 'Say why the request is being returned.' }, { status: 400 });

      const decisions = safeDecisions(chain);
      decisions.push({
        level: stage.level,
        stage: stage.name,
        decision,
        by: user.full_name || user.email,
        email: user.email,
        note,
        signature,
        at: new Date().toISOString(),
      });
      const next = decision === 'approve' ? stageAt(stages, stage.level + 1) : null;
      const changes: any = {
        decisions_json: JSON.stringify(decisions),
        decision_count: decisions.length,
        last_decision_by: user.full_name || user.email,
        last_decision_note: note,
      };
      if (decision === 'return') {
        changes.status = 'Returned';
        changes.closed_at = new Date().toISOString();
      } else if (!next) {
        changes.status = 'Approved';
        changes.closed_at = new Date().toISOString();
      } else {
        changes.current_level = next.level;
        changes.current_stage = next.name;
        changes.current_roles = (next.roles || []).join(', ');
      }
      const saved = await base44.asServiceRole.entities.ApprovalChain.update(chain.id, changes);
      return Response.json({ saved: true, chain: view(saved, user) });
    }

    if (action === 'withdraw') {
      const id = str(body.id);
      const chain = await base44.asServiceRole.entities.ApprovalChain.get(id).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!chain || chain.tenant_id !== tenantId) return Response.json({ error: 'That request was not found.' }, { status: 404 });
      if (chain.status !== 'Pending') return Response.json({ error: 'That request is already closed.' }, { status: 400 });
      const ownRequest = chain.requested_by_id === user.id || chain.requested_by_email === user.email;
      if (!ownRequest && user.role !== 'admin') return Response.json({ error: 'Only the person who raised a request can withdraw it.' }, { status: 403 });
      const saved = await base44.asServiceRole.entities.ApprovalChain.update(chain.id, {
        status: 'Withdrawn',
        closed_at: new Date().toISOString(),
      });
      return Response.json({ saved: true, chain: view(saved, user) });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The approval engine could not complete that.' }, { status: 500 });
  }
});