import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, COMPLIANCE_REVIEW_ROLES, MANAGEMENT_ROLES } from '../../shared/roleMatrix.ts';

const DECISION_TYPES = [
  'Operational Governance', 'Clinical Governance', 'Financial', 'Strategic', 'Risk Acceptance',
  'Workforce', 'Technology', 'Policy', 'Safeguarding', 'Regulatory Response',
];
const STATUSES = ['Draft', 'Proposed', 'In Review', 'Approved', 'Rejected', 'Deferred', 'Implemented', 'Closed'];
const DECIDABLE = ['Approved', 'Rejected', 'Deferred', 'Implemented', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const OUTCOME_STATUSES = ['Not started', 'On track', 'Off track', 'Achieved', 'Not achieved'];
const EVIDENCE_TYPES = ['Document', 'Record', 'Register extract', 'Photo', 'Sign-off', 'System export', 'Certificate', 'Meeting minutes', 'Other'];
const OPEN_STATUSES = ['Draft', 'Proposed', 'In Review'];

const str = (value: any) => (typeof value === 'string' ? value.trim() : '');
const num = (value: any) => (Number.isFinite(Number(value)) ? Number(value) : null);
const dateOnly = (value: any) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '');
const clampPercent = (value: any) => {
  const n = num(value);
  return n === null ? null : Math.max(0, Math.min(100, Math.round(n)));
};
const today = () => new Date().toISOString().slice(0, 10);

function canWrite(user: any) {
  return COMPLIANCE_REVIEW_ROLES.includes(user.role);
}

function canDecide(user: any) {
  return MANAGEMENT_ROLES.includes(user.role);
}

async function audit(base44: any, user: any, action: string, record: any, details: any) {
  await base44.asServiceRole.entities.AuditLog.create({
    tenant_id: record.tenant_id,
    action,
    entity_type: 'DecisionRecord',
    record_id: record.id,
    record_title: record.title,
    performed_by: user.full_name || user.email || 'Unknown',
    performed_by_user_id: user.id,
    performed_by_email: user.email || '',
    performed_by_role: user.role,
    route: '/decision-intelligence',
    details: JSON.stringify(details).slice(0, 4000),
    timestamp: new Date().toISOString(),
  });
}

function outcomeFromMeasures(measures: any[]) {
  if (!measures.length) return 'Not measured';
  if (measures.some((m) => m.status === 'Not achieved' || m.status === 'Off track')) return 'At risk';
  if (measures.every((m) => m.status === 'Achieved')) return 'Achieved';
  if (measures.some((m) => m.status === 'On track' || m.status === 'Achieved')) return 'On track';
  return 'Not measured';
}

export default perBusiness(async function (req: Request) {
  let base44;
  try {
    base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the decision register.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';

    if (action === 'list') {
      const [decisions, evidence, outcomes] = await Promise.all([
        base44.asServiceRole.entities.DecisionRecord.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 500 }),
        base44.asServiceRole.entities.DecisionEvidence.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 300 }),
        base44.asServiceRole.entities.DecisionOutcome.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 300 }),
      ]);
      const all = decisions?.items || [];
      const measures = outcomes?.items || [];
      const statusFilter = str(body.status);
      const typeFilter = str(body.decision_type);
      const term = str(body.search).toLowerCase();
      const rows = all.filter((row: any) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (typeFilter && row.decision_type !== typeFilter) return false;
        if (!term) return true;
        return `${row.title || ''} ${row.decision_number || ''} ${row.owner || ''}`.toLowerCase().includes(term);
      });
      const due = all.filter((r: any) => OPEN_STATUSES.includes(r.status) && r.review_date && r.review_date < today()).length;
      return Response.json({
        saved: true,
        role: user.role,
        canWrite: canWrite(user),
        canDecide: canDecide(user),
        decisions: rows,
        evidence: evidence?.items || [],
        outcomes: measures,
        counts: {
          total: all.length,
          open: all.filter((r: any) => OPEN_STATUSES.includes(r.status)).length,
          awaitingDecision: all.filter((r: any) => ['Proposed', 'In Review'].includes(r.status)).length,
          approved: all.filter((r: any) => ['Approved', 'Implemented'].includes(r.status)).length,
          highRiskOpen: all.filter((r: any) => OPEN_STATUSES.includes(r.status) && ['High', 'Critical'].includes(r.risk_level)).length,
          overdueReview: due,
          outcomesAchieved: all.filter((r: any) => r.outcome_status === 'Achieved').length,
          evidenceRecords: (evidence?.items || []).length,
          measures: measures.length,
        },
      });
    }

    if (!canWrite(user)) {
      return Response.json({ error: 'Your role cannot change the decision register.' }, { status: 403 });
    }

    if (action === 'create') {
      const title = str(body.title).slice(0, 200);
      if (title.length < 4) return Response.json({ error: 'Describe the decision (at least 4 characters).' }, { status: 400 });
      const decisionType = DECISION_TYPES.includes(body.decision_type) ? body.decision_type : DECISION_TYPES[0];
      const priority = PRIORITIES.includes(body.priority) ? body.priority : 'Medium';
      const riskLevel = RISK_LEVELS.includes(body.risk_level) ? body.risk_level : 'Medium';
      const total = await base44.asServiceRole.entities.DecisionRecord.count({ tenant_id: tenantId });
      const created = await base44.asServiceRole.entities.DecisionRecord.create({
        tenant_id: tenantId,
        decision_number: `DEC-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`,
        title,
        summary: str(body.summary).slice(0, 4000),
        decision_type: decisionType,
        domain: str(body.domain).slice(0, 80),
        status: 'Draft',
        priority,
        owner: str(body.owner).slice(0, 120),
        decision_maker: str(body.decision_maker).slice(0, 120),
        decision_date: dateOnly(body.decision_date),
        effective_date: dateOnly(body.effective_date),
        review_date: dateOnly(body.review_date),
        context: str(body.context).slice(0, 4000),
        options_considered: str(body.options_considered).slice(0, 4000),
        recommendation: str(body.recommendation).slice(0, 4000),
        impact_summary: str(body.impact_summary).slice(0, 4000),
        benefit_expected: str(body.benefit_expected).slice(0, 2000),
        cost_estimate: num(body.cost_estimate) ?? 0,
        risk_level: riskLevel,
        risk_summary: str(body.risk_summary).slice(0, 2000),
        confidence_score: clampPercent(body.confidence_score),
        standard_refs: str(body.standard_refs).slice(0, 400),
        control_refs: str(body.control_refs).slice(0, 400),
        risk_refs: str(body.risk_refs).slice(0, 400),
        linked_recommendation_id: str(body.linked_recommendation_id).slice(0, 80),
        linked_recommendation_label: str(body.linked_recommendation_label).slice(0, 200),
        outcome_target: str(body.outcome_target).slice(0, 2000),
        outcome_status: 'Not measured',
        evidence_count: 0,
        outcome_count: 0,
        created_by_name: user.full_name || user.email || '',
        notes: str(body.notes).slice(0, 2000),
      });
      await audit(base44, user, 'Decision register: raised', created, { status: created.status, decision_type: created.decision_type });
      return Response.json({ saved: true, decision: created });
    }

    const decisionId = str(body.decision_id);
    if (!decisionId) return Response.json({ error: 'A decision is required.' }, { status: 400 });
    const existing = await base44.asServiceRole.entities.DecisionRecord.get(decisionId)
      .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
    if (!existing || existing.tenant_id !== tenantId) {
      return Response.json({ error: 'That decision is not in your business.' }, { status: 404 });
    }

    if (action === 'update') {
      if (['Approved', 'Rejected', 'Implemented', 'Closed'].includes(existing.status)) {
        return Response.json({ error: 'A decided record is closed to edits. Use a new decision for a new position.' }, { status: 409 });
      }
      const patch: any = {};
      if ('title' in body) {
        const title = str(body.title).slice(0, 200);
        if (title.length < 4) return Response.json({ error: 'Describe the decision (at least 4 characters).' }, { status: 400 });
        patch.title = title;
      }
      if ('summary' in body) patch.summary = str(body.summary).slice(0, 4000);
      if ('status' in body && ['Draft', 'Proposed', 'In Review'].includes(body.status)) patch.status = body.status;
      if ('priority' in body && PRIORITIES.includes(body.priority)) patch.priority = body.priority;
      if ('risk_level' in body && RISK_LEVELS.includes(body.risk_level)) patch.risk_level = body.risk_level;
      if ('domain' in body) patch.domain = str(body.domain).slice(0, 80);
      if ('owner' in body) patch.owner = str(body.owner).slice(0, 120);
      if ('decision_maker' in body) patch.decision_maker = str(body.decision_maker).slice(0, 120);
      if ('context' in body) patch.context = str(body.context).slice(0, 4000);
      if ('options_considered' in body) patch.options_considered = str(body.options_considered).slice(0, 4000);
      if ('recommendation' in body) patch.recommendation = str(body.recommendation).slice(0, 4000);
      if ('impact_summary' in body) patch.impact_summary = str(body.impact_summary).slice(0, 4000);
      if ('benefit_expected' in body) patch.benefit_expected = str(body.benefit_expected).slice(0, 2000);
      if ('benefit_actual' in body) patch.benefit_actual = str(body.benefit_actual).slice(0, 2000);
      if ('cost_estimate' in body) patch.cost_estimate = num(body.cost_estimate) ?? 0;
      if ('risk_summary' in body) patch.risk_summary = str(body.risk_summary).slice(0, 2000);
      if ('confidence_score' in body) patch.confidence_score = clampPercent(body.confidence_score);
      if ('standard_refs' in body) patch.standard_refs = str(body.standard_refs).slice(0, 400);
      if ('control_refs' in body) patch.control_refs = str(body.control_refs).slice(0, 400);
      if ('risk_refs' in body) patch.risk_refs = str(body.risk_refs).slice(0, 400);
      if ('outcome_target' in body) patch.outcome_target = str(body.outcome_target).slice(0, 2000);
      if ('review_date' in body) patch.review_date = dateOnly(body.review_date);
      if ('effective_date' in body) patch.effective_date = dateOnly(body.effective_date);
      if ('linked_recommendation_id' in body) patch.linked_recommendation_id = str(body.linked_recommendation_id).slice(0, 80);
      if ('linked_recommendation_label' in body) patch.linked_recommendation_label = str(body.linked_recommendation_label).slice(0, 200);
      if ('notes' in body) patch.notes = str(body.notes).slice(0, 2000);
      if (!Object.keys(patch).length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.DecisionRecord.update(decisionId, patch);
      await audit(base44, user, 'Decision register: updated', updated, { fields: Object.keys(patch) });
      return Response.json({ saved: true, decision: updated });
    }

    if (action === 'decide') {
      if (!canDecide(user)) {
        return Response.json({ error: 'Only Provider Administrator, Management or admin can record a decision outcome.' }, { status: 403 });
      }
      const status = DECIDABLE.includes(body.status) ? body.status : '';
      if (!status) return Response.json({ error: 'Choose a decision outcome.' }, { status: 400 });
      if (['Approved', 'Implemented', 'Closed'].includes(existing.status)) {
        return Response.json({ error: 'That decision already has a recorded outcome.' }, { status: 409 });
      }
      const updated = await base44.asServiceRole.entities.DecisionRecord.update(decisionId, {
        status,
        decision_note: str(body.note).slice(0, 2000),
        decided_by: user.full_name || user.email || '',
        decided_by_id: user.id,
        decided_at: new Date().toISOString(),
        decision_date: existing.decision_date || today(),
        effective_date: dateOnly(body.effective_date) || existing.effective_date,
      });
      await audit(base44, user, `Decision register: ${status.toLowerCase()}`, updated, { status, note: str(body.note).slice(0, 1000) });
      return Response.json({ saved: true, decision: updated });
    }

    if (action === 'addEvidence') {
      const title = str(body.title).slice(0, 200);
      if (title.length < 3) return Response.json({ error: 'Name the evidence you are attaching.' }, { status: 400 });
      const evidence = await base44.asServiceRole.entities.DecisionEvidence.create({
        tenant_id: tenantId,
        decision_id: decisionId,
        decision_title: existing.title,
        title,
        evidence_type: EVIDENCE_TYPES.includes(body.evidence_type) ? body.evidence_type : 'Document',
        source: str(body.source).slice(0, 200),
        file_url: str(body.file_url).slice(0, 600),
        linked_evidence_id: str(body.linked_evidence_id).slice(0, 80),
        standard_code: str(body.standard_code).slice(0, 40),
        control_id: str(body.control_id).slice(0, 80),
        confidence: clampPercent(body.confidence) ?? 0,
        verification_status: 'Unverified',
        notes: str(body.notes).slice(0, 2000),
      });
      const all = await base44.asServiceRole.entities.DecisionEvidence.filter({ tenant_id: tenantId, decision_id: decisionId }, { limit: 200 });
      const rows = all?.items || [];
      const average = rows.length
        ? Math.round(rows.reduce((sum: number, row: any) => sum + (Number(row.confidence) || 0), 0) / rows.length)
        : 0;
      const updated = await base44.asServiceRole.entities.DecisionRecord.update(decisionId, {
        evidence_count: rows.length,
        evidence_confidence: average,
      });
      await audit(base44, user, 'Decision register: evidence attached', updated, { evidence: evidence.title, confidence: evidence.confidence });
      return Response.json({ saved: true, evidence, decision: updated });
    }

    if (action === 'addOutcome') {
      const metricName = str(body.metric_name).slice(0, 200);
      if (metricName.length < 3) return Response.json({ error: 'Name the outcome measure.' }, { status: 400 });
      const target = num(body.target_value);
      const actual = num(body.actual_value);
      const outcome = await base44.asServiceRole.entities.DecisionOutcome.create({
        tenant_id: tenantId,
        decision_id: decisionId,
        decision_title: existing.title,
        metric_name: metricName,
        unit: str(body.unit).slice(0, 40),
        baseline_value: num(body.baseline_value) ?? 0,
        target_value: target ?? 0,
        actual_value: actual ?? 0,
        target_date: dateOnly(body.target_date),
        measured_date: dateOnly(body.measured_date) || today(),
        status: OUTCOME_STATUSES.includes(body.status) ? body.status : 'Not started',
        evidence_ref: str(body.evidence_ref).slice(0, 400),
        verified_by: user.full_name || user.email || '',
        notes: str(body.notes).slice(0, 2000),
      });
      const all = await base44.asServiceRole.entities.DecisionOutcome.filter({ tenant_id: tenantId, decision_id: decisionId }, { limit: 200 });
      const rows = all?.items || [];
      const updated = await base44.asServiceRole.entities.DecisionRecord.update(decisionId, {
        outcome_count: rows.length,
        outcome_status: outcomeFromMeasures(rows),
      });
      await audit(base44, user, 'Decision register: outcome recorded', updated, { measure: outcome.metric_name, status: outcome.status });
      return Response.json({ saved: true, outcome, decision: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The decision register is unavailable.' }, { status: 500 });
  }
});