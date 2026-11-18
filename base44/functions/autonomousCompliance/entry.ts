import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, COMPLIANCE_REVIEW_ROLES, MANAGEMENT_ROLES } from '../../shared/roleMatrix.ts';
import { str, dateOnly, clampPercent, today, nowIso, writeAudit } from '../../shared/registerCommon.ts';
import { FRAMEWORKS, SEVERITIES, SCORE_FOR, runAssessment } from '../../shared/complianceAssessment.ts';

const GAP_STATUSES = ['Open', 'Remediation planned', 'In progress', 'Closed', 'Risk accepted'];
const OPEN_GAP_STATUSES = ['Open', 'Remediation planned', 'In progress'];
const TEST_METHODS = ['Evidence review', 'Record inspection', 'Walkthrough', 'Re-performance', 'Interview', 'System output'];
const TEST_RESULTS = ['Pass', 'Partial', 'Fail', 'Not tested', 'Not applicable'];
const PLAN_STATUSES = ['Not started', 'In progress', 'Blocked', 'Completed', 'Closed'];
const ACTIVE_PLAN_STATUSES = ['Not started', 'In progress', 'Blocked'];

const canTest = (user: any) => COMPLIANCE_REVIEW_ROLES.includes(user.role);
const canVerify = (user: any) => MANAGEMENT_ROLES.includes(user.role);
const audit = (base44: any, user: any, action: string, entityType: string, record: any, details: any) =>
  writeAudit(base44, user, { action, entityType, record, details, route: '/compliance-operations' });

export default perBusiness(async function (req: Request) {
  let base44;
  try {
    base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use compliance operations.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';

    if (action === 'list') {
      const [assessmentsPage, gapsPage, testsPage, plansPage, standardsPage, controlsPage, evidencePage] = await Promise.all([
        base44.asServiceRole.entities.AutonomousAssessment.filter({ tenant_id: tenantId }, { sort: '-assessed_on', limit: 100 }),
        base44.asServiceRole.entities.ComplianceGapAnalysis.filter({ tenant_id: tenantId }, { sort: '-detected_on', limit: 500 }),
        base44.asServiceRole.entities.ControlTestingResult.filter({ tenant_id: tenantId }, { sort: '-tested_on', limit: 500 }),
        base44.asServiceRole.entities.RemediationPlan.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 300 }),
        base44.asServiceRole.entities.RegulatoryStandard.filter({ tenant_id: tenantId }, { limit: 500 }),
        base44.asServiceRole.entities.ComplianceControl.filter({ tenant_id: tenantId }, { limit: 500 }),
        base44.asServiceRole.entities.AssuranceEvidence.filter({ tenant_id: tenantId }, { limit: 300 }),
      ]);

      const assessments = assessmentsPage?.items || [];
      const gaps = gapsPage?.items || [];
      const tests = testsPage?.items || [];
      const plans = plansPage?.items || [];
      const standards = standardsPage?.items || [];
      const controls = controlsPage?.items || [];
      const frameworkFilter = str(body.framework);
      const gapStatus = str(body.gap_status);
      const term = str(body.search).toLowerCase();

      const visibleGaps = gaps.filter((row: any) => {
        if (frameworkFilter && row.framework !== frameworkFilter) return false;
        if (gapStatus && row.status !== gapStatus) return false;
        if (!term) return true;
        return `${row.standard_code || ''} ${row.standard_title || ''} ${row.control_statement || ''} ${row.gap_ref || ''}`.toLowerCase().includes(term);
      });
      const visibleAssessments = frameworkFilter ? assessments.filter((row: any) => row.framework === frameworkFilter) : assessments;
      const latest = visibleAssessments[0] || null;

      return Response.json({
        saved: true,
        role: user.role,
        canTest: canTest(user),
        canVerify: canVerify(user),
        assessments: visibleAssessments,
        gaps: visibleGaps,
        tests: (frameworkFilter ? tests.filter((row: any) => row.framework === frameworkFilter) : tests).slice(0, 200),
        plans: frameworkFilter ? plans.filter((row: any) => row.framework === frameworkFilter) : plans,
        frameworks: FRAMEWORKS.filter((name) => standards.some((row: any) => row.framework === name)
          || controls.some((row: any) => row.framework === name)),
        controlOptions: controls
          .filter((row: any) => row.status !== 'Retired')
          .slice(0, 300)
          .map((row: any) => ({
            id: row.id,
            label: `${row.standard_code || 'Control'} · ${(row.control_statement || row.requirement || '').slice(0, 80)}`,
          })),
        evidenceOptions: evidencePage?.items?.slice(0, 300).map((row: any) => ({ id: row.id, label: row.title })) || [],
        counts: {
          assessments: assessments.length,
          latestScore: latest?.score ?? 0,
          latestConfidence: latest?.confidence_score ?? 0,
          controlsTested: tests.length,
          passRate: tests.length ? Math.round((tests.filter((row: any) => row.result === 'Pass').length / tests.length) * 100) : 0,
          openGaps: gaps.filter((row: any) => OPEN_GAP_STATUSES.includes(row.status)).length,
          highGaps: gaps.filter((row: any) => ['High', 'Critical'].includes(row.severity)
            && !['Closed', 'Risk accepted'].includes(row.status)).length,
          plansOpen: plans.filter((row: any) => ACTIVE_PLAN_STATUSES.includes(row.status)).length,
          plansOverdue: plans.filter((row: any) => ACTIVE_PLAN_STATUSES.includes(row.status)
            && row.target_date && row.target_date < today()).length,
          plansCompleted: plans.filter((row: any) => ['Completed', 'Closed'].includes(row.status)).length,
        },
      });
    }

    if (!canTest(user)) {
      return Response.json({ error: 'Your role cannot change compliance operations records.' }, { status: 403 });
    }

    if (action === 'runAssessment') {
      const result = await runAssessment(base44, user, tenantId, body);
      if ((result as any).error) {
        return Response.json({ error: (result as any).error }, { status: (result as any).status || 400 });
      }
      return Response.json(result);
    }

    if (action === 'recordTest') {
      const controlId = str(body.control_id);
      if (!controlId) return Response.json({ error: 'Choose the control you tested.' }, { status: 400 });
      const control = await base44.asServiceRole.entities.ComplianceControl.get(controlId)
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!control || control.tenant_id !== tenantId) {
        return Response.json({ error: 'That control is not in your business.' }, { status: 404 });
      }
      const result = TEST_RESULTS.includes(body.result) ? body.result : '';
      if (!result) return Response.json({ error: 'Choose the test result.' }, { status: 400 });
      const evidenceId = str(body.evidence_id);
      let evidence: any = null;
      if (evidenceId) {
        evidence = await base44.asServiceRole.entities.AssuranceEvidence.get(evidenceId)
          .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
        if (!evidence || evidence.tenant_id !== tenantId) {
          return Response.json({ error: 'That evidence is not in your business.' }, { status: 404 });
        }
      }
      const created = await base44.asServiceRole.entities.ControlTestingResult.create({
        tenant_id: tenantId,
        framework: control.framework || '',
        standard_code: control.standard_code || '',
        control_id: control.id,
        control_statement: control.control_statement || control.requirement || '',
        evidence_id: evidence?.id || '',
        evidence_title: evidence?.title || '',
        evidence_state: evidence
          ? (evidence.verification_status === 'Verified' ? 'Verified and current' : evidence.verification_status)
          : 'None held',
        test_method: TEST_METHODS.includes(body.test_method) ? body.test_method : 'Evidence review',
        result,
        score: SCORE_FOR[result] ?? 0,
        tested_on: nowIso(),
        tested_by: user.full_name || user.email || '',
        tested_by_id: user.id,
        test_source: 'Manual test',
        remediation_required: result === 'Fail' || result === 'Partial',
        notes: str(body.notes).slice(0, 2000),
      });
      await base44.asServiceRole.entities.ComplianceControl.update(control.id, { last_tested_date: today() }).catch(() => null);
      await audit(base44, user, `Compliance operations: control tested (${result})`, 'ControlTestingResult', created, {
        control: created.control_statement, result, evidence: created.evidence_title,
      });
      return Response.json({ saved: true, test: created });
    }

    if (action === 'createRemediation') {
      const gapId = str(body.gap_id);
      if (!gapId) return Response.json({ error: 'Choose the gap to remediate.' }, { status: 400 });
      const gap = await base44.asServiceRole.entities.ComplianceGapAnalysis.get(gapId)
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!gap || gap.tenant_id !== tenantId) {
        return Response.json({ error: 'That gap is not in your business.' }, { status: 404 });
      }
      if (['Closed', 'Risk accepted'].includes(gap.status)) {
        return Response.json({ error: 'That gap is already closed.' }, { status: 409 });
      }
      const assignedTo = str(body.assigned_to).slice(0, 120);
      if (assignedTo.length < 2) return Response.json({ error: 'Name the person accountable for this remediation.' }, { status: 400 });
      const targetDate = dateOnly(body.target_date);
      if (!targetDate) return Response.json({ error: 'Set the target date.' }, { status: 400 });
      const total = await base44.asServiceRole.entities.RemediationPlan.count({ tenant_id: tenantId });
      const plan = await base44.asServiceRole.entities.RemediationPlan.create({
        tenant_id: tenantId,
        plan_ref: `REM-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`,
        gap_id: gap.id,
        gap_ref: gap.gap_ref || '',
        gap_title: gap.control_statement || gap.standard_title || gap.gap_type,
        gap_severity: gap.severity,
        framework: gap.framework,
        standard_code: gap.standard_code || '',
        control_id: gap.control_id || '',
        assigned_to: assignedTo,
        assigned_to_email: str(body.assigned_to_email).slice(0, 200),
        priority: SEVERITIES.includes(body.priority) ? body.priority : gap.severity,
        status: 'Not started',
        target_date: targetDate,
        completion_percentage: 0,
        actions: str(body.actions).slice(0, 4000),
        update_count: 0,
        created_by: user.full_name || user.email || '',
        notes: str(body.notes).slice(0, 2000),
      });
      await base44.asServiceRole.entities.ComplianceGapAnalysis.update(gap.id, {
        status: 'Remediation planned',
        remediation_count: (Number(gap.remediation_count) || 0) + 1,
        recommendation: str(body.recommendation).slice(0, 4000) || gap.recommendation || '',
      });
      await audit(base44, user, 'Compliance operations: remediation plan raised', 'RemediationPlan', plan, {
        gap: plan.gap_title, assigned_to: assignedTo, target_date: targetDate,
      });
      return Response.json({ saved: true, plan });
    }

    if (action === 'updateRemediation') {
      const planId = str(body.plan_id);
      if (!planId) return Response.json({ error: 'Choose the plan to update.' }, { status: 400 });
      const plan = await base44.asServiceRole.entities.RemediationPlan.get(planId)
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!plan || plan.tenant_id !== tenantId) {
        return Response.json({ error: 'That plan is not in your business.' }, { status: 404 });
      }
      if (plan.status === 'Closed') return Response.json({ error: 'A verified plan is closed to edits.' }, { status: 409 });
      const note = str(body.note).slice(0, 1000);
      if (!note) return Response.json({ error: 'Record what changed in this update.' }, { status: 400 });
      const percentage = clampPercent(body.completion_percentage);
      if (percentage === null) return Response.json({ error: 'Enter the completion percentage.' }, { status: 400 });
      const status = PLAN_STATUSES.includes(body.status) && body.status !== 'Closed'
        ? body.status
        : percentage >= 100 ? 'Completed' : percentage > 0 ? 'In progress' : plan.status;
      const log = (() => {
        try { return JSON.parse(plan.updates_json || '[]'); } catch { return []; }
      })();
      const nextLog = [
        ...log,
        { at: nowIso(), by: user.full_name || user.email || '', percentage, status, note },
      ].slice(-50);
      const updated = await base44.asServiceRole.entities.RemediationPlan.update(plan.id, {
        completion_percentage: percentage,
        status,
        evidence_ref: str(body.evidence_ref).slice(0, 600) || plan.evidence_ref || '',
        updates_json: JSON.stringify(nextLog),
        update_count: nextLog.length,
        last_update_by: user.full_name || user.email || '',
        last_update_at: nowIso(),
        started_on: plan.started_on || today(),
        completed_on: percentage >= 100 ? today() : plan.completed_on || '',
      });
      if (plan.gap_id) {
        const gap = await base44.asServiceRole.entities.ComplianceGapAnalysis.get(plan.gap_id).catch(() => null);
        if (gap && gap.tenant_id === tenantId && gap.status === 'Open') {
          await base44.asServiceRole.entities.ComplianceGapAnalysis.update(gap.id, { status: 'In progress' });
        }
      }
      await audit(base44, user, 'Compliance operations: remediation progress', 'RemediationPlan', updated, {
        percentage, status, note,
      });
      return Response.json({ saved: true, plan: updated });
    }

    if (action === 'verifyRemediation') {
      if (!canVerify(user)) {
        return Response.json({ error: 'Only Provider Administrator, Management or admin can verify a remediation.' }, { status: 403 });
      }
      const planId = str(body.plan_id);
      const plan = planId
        ? await base44.asServiceRole.entities.RemediationPlan.get(planId).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)))
        : null;
      if (!plan || plan.tenant_id !== tenantId) {
        return Response.json({ error: 'That plan is not in your business.' }, { status: 404 });
      }
      const note = str(body.note).slice(0, 2000);
      if (note.length < 4) return Response.json({ error: 'Record how completion was verified.' }, { status: 400 });
      const closedPlan = await base44.asServiceRole.entities.RemediationPlan.update(plan.id, {
        status: 'Closed',
        completion_percentage: 100,
        verified_by: user.full_name || user.email || '',
        verified_on: today(),
        closed_on: today(),
        closure_note: note,
        last_update_by: user.full_name || user.email || '',
        last_update_at: nowIso(),
      });
      if (plan.gap_id) {
        const gap = await base44.asServiceRole.entities.ComplianceGapAnalysis.get(plan.gap_id).catch(() => null);
        if (gap && gap.tenant_id === tenantId) {
          await base44.asServiceRole.entities.ComplianceGapAnalysis.update(gap.id, {
            status: 'Closed',
            resolved_on: today(),
            resolved_by: user.full_name || user.email || '',
            closure_note: note,
          });
        }
      }
      await audit(base44, user, 'Compliance operations: remediation verified and closed', 'RemediationPlan', closedPlan, {
        gap: plan.gap_title, note,
      });
      return Response.json({ saved: true, plan: closedPlan });
    }

    if (action === 'updateGap') {
      const gapId = str(body.gap_id);
      if (!gapId) return Response.json({ error: 'Choose the gap to update.' }, { status: 400 });
      const gap = await base44.asServiceRole.entities.ComplianceGapAnalysis.get(gapId)
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!gap || gap.tenant_id !== tenantId) {
        return Response.json({ error: 'That gap is not in your business.' }, { status: 404 });
      }
      const status = GAP_STATUSES.includes(body.status) ? body.status : gap.status;
      const patch: any = {};
      if (status !== gap.status) {
        if (['Closed', 'Risk accepted'].includes(status) && !canVerify(user)) {
          return Response.json({ error: 'Only Provider Administrator, Management or admin can close a gap or accept its risk.' }, { status: 403 });
        }
        if (status === 'Closed') {
          const note = str(body.closure_note).slice(0, 2000);
          if (note.length < 4) return Response.json({ error: 'Record how this gap was closed.' }, { status: 400 });
          patch.closure_note = note;
          patch.resolved_on = today();
        }
        patch.status = status;
        if (['Closed', 'Risk accepted'].includes(status)) patch.resolved_by = user.full_name || user.email || '';
      }
      if (SEVERITIES.includes(body.severity)) patch.severity = body.severity;
      if ('recommendation' in body) patch.recommendation = str(body.recommendation).slice(0, 4000);
      if ('notes' in body) patch.notes = str(body.notes).slice(0, 2000);
      if (!Object.keys(patch).length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.ComplianceGapAnalysis.update(gap.id, patch);
      await audit(base44, user, `Compliance operations: gap ${patch.status || 'updated'}`, 'ComplianceGapAnalysis', updated, {
        status: patch.status, severity: patch.severity,
      });
      return Response.json({ saved: true, gap: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Compliance operations are unavailable.' }, { status: 500 });
  }
});