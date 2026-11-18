// C10 — Autonomous Enterprise Operating System: strategy and transformation service.
//
// What this function really does:
//   - keeps business-scoped portfolios, programs, objectives, benefits, capabilities, maturity
//     assessments and versioned roadmaps, with every child pointing at a parent in the same business
//   - validates each record before it is written, so a benefit cannot hang off another business's
//     objective and a maturity score of 4 or 5 cannot be recorded without evidence
//   - calculates the portfolio → program → objective → benefit rollup and the evidence-backed
//     capability maturity from stored fields only
//   - requires an independent human approval for any status change that sets work in motion
//   - appends a hash-chained, redacted audit record for every write and every refused attempt
//
// What it deliberately refuses:
//   - copying decisions, risks, controls, evidence, workflows or AI recommendations: it stores a
//     reference to the source record, never a duplicate
//   - inventing strategy data, baselines, actuals or maturity scores
//   - performing work: approving a roadmap authorises people, it starts nothing
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId } from '../../shared/roleMatrix.ts';
import { Refusal, refuse, pageOf, requireOwn } from '../../shared/serviceKit.ts';
import { str, nowIso } from '../../shared/registerCommon.ts';
import {
  ENTERPRISE_STRATEGY_VERSION,
  PORTFOLIO_STATUSES,
  PROGRAM_STATUSES,
  OBJECTIVE_STATUSES,
  BENEFIT_REVIEW_STATUSES,
  CAPABILITY_STATUSES,
  ROADMAP_STATUSES,
  INITIATIVE_STATUSES,
  MILESTONE_STATUSES,
  VALUATION_METHODS,
  LINKED_REGISTERS,
  MATURITY_LABELS,
  MIN_RATIONALE_LENGTH,
  MIN_REASON_LENGTH,
  buildRollups,
  buildAuditEntry,
  capabilityMaturity,
  clean,
  strategyPermissions,
  strategyRef,
  statusChangeNeedsApproval,
  roadmapTransition,
  validatePortfolio,
  validateProgram,
  validateObjective,
  validateBenefit,
  validateCapability,
  validateAssessment,
  validateRoadmap,
} from '../../shared/enterpriseStrategy.ts';

const MAX_ROWS = 200;

const firstProblem = (validated: any) => (validated.ok ? '' : (validated.errors || [])[0] || 'That record is not valid.');

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the strategy workspace.' }, { status: 401 });

    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }

    const tenantId = base44.businessId;
    const entities = base44.asServiceRole.entities;
    const permissions = strategyPermissions(user);
    if (!permissions.read) {
      return Response.json({ error: 'Your role cannot read the strategy register.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';
    const actor = user.full_name || user.email || 'Unknown';

    /* ------------------------------------------------------------------ audit trail */

    const appendAudit = async (
      auditAction: string, subjectType: string, subject: any, detail: any,
      outcome: 'Recorded' | 'Refused' | 'Changed' = 'Recorded', correlationId = '',
    ) => {
      const last = (await pageOf(entities.StrategyAuditRecord, { tenant_id: tenantId }, '-created_date', 1))[0];
      const entry = await buildAuditEntry({
        previousHash: last?.chain_hash || '',
        action: auditAction,
        subjectType,
        subject,
        detail,
        outcome,
        actor,
        actorId: user.id,
        actorRole: String(user.role || ''),
        correlationId,
      });
      return entities.StrategyAuditRecord.create({ tenant_id: tenantId, audit_ref: strategyRef('AUD'), ...entry });
    };

    /** Refuse, but leave the refusal in the audit trail when the person can read the register. */
    const guard = async (allowed: boolean, message: string, subjectType: string, subject: any, detail: any = {}) => {
      if (allowed) return;
      await appendAudit('Strategy change refused', subjectType, subject, { message, ...detail }, 'Refused');
      refuse(message, 403);
    };

    const nextKey = async (dao: any, prefix: string) => {
      const total = await dao.count({ tenant_id: tenantId });
      return `${prefix}-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`;
    };

    /* ------------------------------------------------------------------ read */

    if (action === 'list') {
      const [portfolios, programs, objectives, benefits, capabilities, assessments, roadmaps, audit] = await Promise.all([
        pageOf(entities.EnterprisePortfolio, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.TransformationProgram, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.StrategyObjective, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.StrategyBenefit, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.EnterpriseCapability, { tenant_id: tenantId }, 'name', MAX_ROWS),
        pageOf(entities.CapabilityMaturityAssessment, { tenant_id: tenantId }, '-assessed_at', MAX_ROWS),
        pageOf(entities.TransformationRoadmap, { tenant_id: tenantId }, '-created_date', MAX_ROWS),
        pageOf(entities.StrategyAuditRecord, { tenant_id: tenantId }, '-occurred_at', 100),
      ]);

      const rollups = buildRollups({ portfolios, programs, objectives, benefits, capabilities, assessments });

      return Response.json({
        saved: true,
        role: user.role,
        canEdit: permissions.edit,
        canApprove: permissions.approve,
        strategyVersion: ENTERPRISE_STRATEGY_VERSION,
        meta: {
          portfolioStatuses: PORTFOLIO_STATUSES,
          programStatuses: PROGRAM_STATUSES,
          objectiveStatuses: OBJECTIVE_STATUSES,
          benefitReviewStatuses: BENEFIT_REVIEW_STATUSES,
          capabilityStatuses: CAPABILITY_STATUSES,
          roadmapStatuses: ROADMAP_STATUSES,
          initiativeStatuses: INITIATIVE_STATUSES,
          milestoneStatuses: MILESTONE_STATUSES,
          valuationMethods: VALUATION_METHODS,
          linkedRegisters: LINKED_REGISTERS,
          maturityLevels: Object.entries(MATURITY_LABELS).map(([score, label]) => ({ score: Number(score), label })),
          minRationaleLength: MIN_RATIONALE_LENGTH,
          minReasonLength: MIN_REASON_LENGTH,
        },
        portfolios,
        programs,
        objectives,
        benefits,
        capabilities,
        assessments,
        roadmaps,
        audit,
        rollups: rollups.portfolios,
        capabilityRollups: rollups.capabilities,
        dueObjectives: rollups.dueObjectives,
        counts: {
          ...rollups.totals,
          roadmaps: roadmaps.length,
          draftRoadmaps: roadmaps.filter((row: any) => row.status === 'Draft').length,
          submittedRoadmaps: roadmaps.filter((row: any) => row.status === 'Submitted').length,
          approvedRoadmaps: roadmaps.filter((row: any) => row.status === 'Approved').length,
          assessments: assessments.length,
          validatedAssessments: assessments.filter((row: any) => row.status === 'Validated').length,
          auditRecords: audit.length,
        },
      });
    }

    /* ------------------------------------------------------------------ status changes */

    const changeStatus = async ({ dao, entityName, label, id, status, reason, statuses }: any) => {
      const record = await requireOwn(dao, id, tenantId, label);
      if (!statuses.includes(status)) refuse(`Choose a ${label} status from the list.`);
      const note = clean(reason, 1000);
      const needsApproval = statusChangeNeedsApproval(entityName, status);

      if (needsApproval) {
        await guard(
          permissions.approve,
          `Moving this ${label} to ${status} sets work in motion, so it needs management approval. Ask a manager or administrator to make this change.`,
          entityName, record, { requested: status, reason: note },
        );
      }
      if ((needsApproval || status === 'Archived') && note.length < MIN_REASON_LENGTH) {
        refuse(`Record the reason for this status change in at least ${MIN_REASON_LENGTH} characters.`);
      }

      const updated = await dao.update(record.id, {
        status,
        status_reason: note,
        ...(status === 'Archived' ? { archived_at: nowIso() } : {}),
      });
      await appendAudit(`${label} status changed`, entityName, updated, {
        from: record.status, to: status, reason: note,
      }, 'Changed');
      return updated;
    };

    /* ------------------------------------------------------------------ portfolios */

    if (action === 'savePortfolio') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'EnterprisePortfolio', body.portfolio_id ? { id: body.portfolio_id } : {});
      const validated = validatePortfolio(body);
      if (!validated.ok) refuse(firstProblem(validated));

      if (str(body.portfolio_id)) {
        const existing = await requireOwn(entities.EnterprisePortfolio, body.portfolio_id, tenantId, 'portfolio');
        const record = await entities.EnterprisePortfolio.update(existing.id, validated.value);
        await appendAudit('Portfolio updated', 'EnterprisePortfolio', record, { name: record.name, sponsor: record.sponsor }, 'Changed');
        return Response.json({ saved: true, portfolio: record });
      }

      const record = await entities.EnterprisePortfolio.create({
        tenant_id: tenantId,
        portfolio_key: await nextKey(entities.EnterprisePortfolio, 'POR'),
        ...validated.value,
        status: 'Draft',
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Portfolio created', 'EnterprisePortfolio', record, { name: record.name, sponsor: record.sponsor });
      return Response.json({ saved: true, portfolio: record });
    }

    if (action === 'setPortfolioStatus') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'EnterprisePortfolio', { id: body.portfolio_id });
      const portfolio = await changeStatus({
        dao: entities.EnterprisePortfolio, entityName: 'EnterprisePortfolio', label: 'portfolio',
        id: body.portfolio_id, status: str(body.status), reason: body.reason, statuses: PORTFOLIO_STATUSES,
      });
      return Response.json({ saved: true, portfolio });
    }

    /* ------------------------------------------------------------------ programs */

    if (action === 'saveProgram') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'TransformationProgram', body.program_id ? { id: body.program_id } : {});
      const portfolio = await requireOwn(entities.EnterprisePortfolio, body.portfolio_id, tenantId, 'portfolio');
      const validated = validateProgram(body, portfolio);
      if (!validated.ok) refuse(firstProblem(validated));

      if (str(body.program_id)) {
        const existing = await requireOwn(entities.TransformationProgram, body.program_id, tenantId, 'program');
        const record = await entities.TransformationProgram.update(existing.id, validated.value);
        await appendAudit('Program updated', 'TransformationProgram', record, { name: record.name, portfolio: record.portfolio_key }, 'Changed');
        return Response.json({ saved: true, program: record });
      }

      const record = await entities.TransformationProgram.create({
        tenant_id: tenantId,
        program_key: await nextKey(entities.TransformationProgram, 'PRG'),
        ...validated.value,
        status: 'Draft',
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Program created', 'TransformationProgram', record, { name: record.name, portfolio: record.portfolio_key });
      return Response.json({ saved: true, program: record });
    }

    if (action === 'setProgramStatus') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'TransformationProgram', { id: body.program_id });
      const program = await changeStatus({
        dao: entities.TransformationProgram, entityName: 'TransformationProgram', label: 'program',
        id: body.program_id, status: str(body.status), reason: body.reason, statuses: PROGRAM_STATUSES,
      });
      return Response.json({ saved: true, program });
    }

    /* ------------------------------------------------------------------ objectives */

    if (action === 'saveObjective') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'StrategyObjective', body.objective_id ? { id: body.objective_id } : {});
      const program = await requireOwn(entities.TransformationProgram, body.program_id, tenantId, 'program');
      const validated = validateObjective(body, program);
      if (!validated.ok) refuse(firstProblem(validated));

      if (str(body.objective_id)) {
        const existing = await requireOwn(entities.StrategyObjective, body.objective_id, tenantId, 'objective');
        const record = await entities.StrategyObjective.update(existing.id, validated.value);
        await appendAudit('Objective updated', 'StrategyObjective', record, { name: record.name, program: record.program_key, status: record.status }, 'Changed');
        return Response.json({ saved: true, objective: record });
      }

      const record = await entities.StrategyObjective.create({
        tenant_id: tenantId,
        objective_key: await nextKey(entities.StrategyObjective, 'OBJ'),
        ...validated.value,
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Objective created', 'StrategyObjective', record, {
        name: record.name, program: record.program_key, measure: record.measure, target: record.target_value,
      });
      return Response.json({ saved: true, objective: record });
    }

    if (action === 'setObjectiveStatus') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'StrategyObjective', { id: body.objective_id });
      const objective = await changeStatus({
        dao: entities.StrategyObjective, entityName: 'StrategyObjective', label: 'objective',
        id: body.objective_id, status: str(body.status), reason: body.reason, statuses: OBJECTIVE_STATUSES,
      });
      return Response.json({ saved: true, objective });
    }

    /* ------------------------------------------------------------------ benefits */

    if (action === 'saveBenefit') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'StrategyBenefit', body.benefit_id ? { id: body.benefit_id } : {});
      const objective = await requireOwn(entities.StrategyObjective, body.objective_id, tenantId, 'objective');
      const validated = validateBenefit(body, objective);
      if (!validated.ok) refuse(firstProblem(validated));

      if (str(body.benefit_id)) {
        const existing = await requireOwn(entities.StrategyBenefit, body.benefit_id, tenantId, 'benefit');
        const record = await entities.StrategyBenefit.update(existing.id, validated.value);
        await appendAudit('Benefit updated', 'StrategyBenefit', record, { name: record.name, review: record.review_status }, 'Changed');
        return Response.json({ saved: true, benefit: record });
      }

      const record = await entities.StrategyBenefit.create({
        tenant_id: tenantId,
        benefit_key: await nextKey(entities.StrategyBenefit, 'BEN'),
        ...validated.value,
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Benefit created', 'StrategyBenefit', record, {
        name: record.name, objective: record.objective_key, method: record.valuation_method,
      });
      return Response.json({ saved: true, benefit: record });
    }

    if (action === 'reviewBenefit') {
      await guard(permissions.edit, 'Your role cannot change the strategy register.', 'StrategyBenefit', { id: body.benefit_id });
      const benefit = await requireOwn(entities.StrategyBenefit, body.benefit_id, tenantId, 'benefit');
      const reviewStatus = str(body.review_status);
      if (!BENEFIT_REVIEW_STATUSES.includes(reviewStatus)) refuse('Choose a review status from the list.');
      const reason = clean(body.reason, 1000);
      if (reviewStatus !== 'Not reviewed' && reason.length < MIN_REASON_LENGTH) {
        refuse(`Record the review reason in at least ${MIN_REASON_LENGTH} characters.`);
      }
      const record = await entities.StrategyBenefit.update(benefit.id, {
        review_status: reviewStatus,
        status_reason: reason,
        ...(reviewStatus === 'Archived' ? { archived_at: nowIso() } : {}),
      });
      await appendAudit('Benefit review changed', 'StrategyBenefit', record, {
        from: benefit.review_status, to: reviewStatus, reason,
      }, 'Changed');
      return Response.json({ saved: true, benefit: record });
    }

    /* ------------------------------------------------------------------ capabilities */

    if (action === 'saveCapability') {
      await guard(permissions.edit, 'Your role cannot change the capability register.', 'EnterpriseCapability', body.capability_id ? { id: body.capability_id } : {});
      const validated = validateCapability(body);
      if (!validated.ok) refuse(firstProblem(validated));

      if (str(body.capability_id)) {
        const existing = await requireOwn(entities.EnterpriseCapability, body.capability_id, tenantId, 'capability');
        const record = await entities.EnterpriseCapability.update(existing.id, validated.value);
        await appendAudit('Capability updated', 'EnterpriseCapability', record, { name: record.name, current: record.current_maturity, target: record.target_maturity }, 'Changed');
        return Response.json({ saved: true, capability: record });
      }

      const record = await entities.EnterpriseCapability.create({
        tenant_id: tenantId,
        capability_key: await nextKey(entities.EnterpriseCapability, 'CAP'),
        ...validated.value,
        status: 'Draft',
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Capability created', 'EnterpriseCapability', record, { name: record.name, current: record.current_maturity, target: record.target_maturity });
      return Response.json({ saved: true, capability: record });
    }

    if (action === 'setCapabilityStatus') {
      await guard(permissions.edit, 'Your role cannot change the capability register.', 'EnterpriseCapability', { id: body.capability_id });
      const capability = await changeStatus({
        dao: entities.EnterpriseCapability, entityName: 'EnterpriseCapability', label: 'capability',
        id: body.capability_id, status: str(body.status), reason: body.reason, statuses: CAPABILITY_STATUSES,
      });
      return Response.json({ saved: true, capability });
    }

    /* ------------------------------------------------------------------ maturity assessments */

    const refreshCapabilityMaturity = async (capabilityId: string) => {
      const [capability, validated] = await Promise.all([
        requireOwn(entities.EnterpriseCapability, capabilityId, tenantId, 'capability'),
        pageOf(entities.CapabilityMaturityAssessment, { tenant_id: tenantId, capability_id: capabilityId, status: 'Validated' }, '-assessed_at', 5),
      ]);
      const latest = validated[0] || null;
      const maturity = capabilityMaturity(capability, validated);
      return entities.EnterpriseCapability.update(capability.id, {
        latest_assessment_id: latest?.id || '',
        latest_assessment_score: latest ? Number(latest.score) : null,
        latest_assessment_at: latest?.assessed_at || '',
        evidence_backed: maturity.evidenceBacked,
      });
    };

    if (action === 'recordAssessment') {
      await guard(permissions.edit, 'Your role cannot record a maturity assessment.', 'CapabilityMaturityAssessment', {});
      const capability = await requireOwn(entities.EnterpriseCapability, body.capability_id, tenantId, 'capability');
      const validated = validateAssessment({ ...body, assessor: clean(body.assessor, 120) || actor }, capability);
      if (!validated.ok) refuse(firstProblem(validated));

      const record = await entities.CapabilityMaturityAssessment.create({
        tenant_id: tenantId,
        assessment_ref: await nextKey(entities.CapabilityMaturityAssessment, 'ASM'),
        ...validated.value,
        assessor_id: user.id,
      });
      await appendAudit('Maturity assessment recorded', 'CapabilityMaturityAssessment', record, {
        capability: record.capability_key, score: record.score, evidence: record.evidence_count,
      });
      return Response.json({ saved: true, assessment: record });
    }

    if (action === 'validateAssessment') {
      await guard(permissions.edit, 'Your role cannot validate a maturity assessment.', 'CapabilityMaturityAssessment', { id: body.assessment_id });
      const assessment = await requireOwn(entities.CapabilityMaturityAssessment, body.assessment_id, tenantId, 'assessment');
      if (assessment.status === 'Validated') refuse('This assessment is already validated.', 409);
      if (assessment.status === 'Archived') refuse('An archived assessment cannot be validated.', 409);
      const note = clean(body.note, 1000);
      if (note.length < MIN_RATIONALE_LENGTH) refuse(`Record the validation note in at least ${MIN_RATIONALE_LENGTH} characters.`);

      const record = await entities.CapabilityMaturityAssessment.update(assessment.id, {
        status: 'Validated',
        validated_by: actor,
        validated_by_id: user.id,
        validated_at: nowIso(),
        validation_note: note,
      });
      await refreshCapabilityMaturity(record.capability_id);
      await appendAudit('Maturity assessment validated', 'CapabilityMaturityAssessment', record, {
        capability: record.capability_key, score: record.score, evidence: record.evidence_count, independent: record.assessor_id !== user.id,
      }, 'Changed');
      return Response.json({ saved: true, assessment: record });
    }

    /* ------------------------------------------------------------------ roadmaps */

    if (action === 'saveRoadmap') {
      await guard(permissions.edit, 'Your role cannot change a roadmap.', 'TransformationRoadmap', body.roadmap_id ? { id: body.roadmap_id } : {});
      const program = await requireOwn(entities.TransformationProgram, body.program_id, tenantId, 'program');
      const validated = validateRoadmap(body, program);
      if (!validated.ok) refuse(firstProblem(validated));
      const changeNote = clean(body.change_note, 400) || 'Initial version.';

      if (str(body.roadmap_id)) {
        const existing = await requireOwn(entities.TransformationRoadmap, body.roadmap_id, tenantId, 'roadmap');
        if (['Submitted', 'Approved', 'Archived'].includes(existing.status)) {
          if (existing.status === 'Archived') refuse('An archived roadmap cannot be versioned. Create a new roadmap instead.', 409);
          const record = await entities.TransformationRoadmap.create({
            tenant_id: tenantId,
            roadmap_key: existing.roadmap_key,
            version: Number(existing.version || 1) + 1,
            ...validated.value,
            status: 'Draft',
            previous_version_id: existing.id,
            change_note: changeNote,
            engine_version: ENTERPRISE_STRATEGY_VERSION,
            author: actor,
            author_id: user.id,
          });
          await appendAudit('Roadmap version created', 'TransformationRoadmap', record, {
            roadmap: record.roadmap_key, version: record.version, previous_version: existing.version, change: changeNote,
          });
          return Response.json({ saved: true, roadmap: record, newVersion: true });
        }
        const record = await entities.TransformationRoadmap.update(existing.id, {
          ...validated.value,
          change_note: changeNote,
          status: existing.status === 'Returned' ? 'Draft' : existing.status,
        });
        await appendAudit('Roadmap updated', 'TransformationRoadmap', record, {
          roadmap: record.roadmap_key, version: record.version, initiatives: record.initiative_count,
        }, 'Changed');
        return Response.json({ saved: true, roadmap: record });
      }

      const record = await entities.TransformationRoadmap.create({
        tenant_id: tenantId,
        roadmap_key: await nextKey(entities.TransformationRoadmap, 'RDM'),
        version: 1,
        ...validated.value,
        status: 'Draft',
        change_note: changeNote,
        engine_version: ENTERPRISE_STRATEGY_VERSION,
        author: actor,
        author_id: user.id,
      });
      await appendAudit('Roadmap created', 'TransformationRoadmap', record, {
        roadmap: record.roadmap_key, program: record.program_key, initiatives: record.initiative_count,
      });
      return Response.json({ saved: true, roadmap: record });
    }

    if (action === 'submitRoadmap') {
      await guard(permissions.edit, 'Your role cannot submit a roadmap.', 'TransformationRoadmap', { id: body.roadmap_id });
      const roadmap = await requireOwn(entities.TransformationRoadmap, body.roadmap_id, tenantId, 'roadmap');
      if (!['Draft', 'Returned'].includes(roadmap.status)) refuse('Only a draft or returned roadmap can be submitted for approval.', 409);
      if (Number(roadmap.initiative_count || 0) < 1) refuse('Add at least one initiative before submitting this roadmap.');
      const record = await entities.TransformationRoadmap.update(roadmap.id, {
        status: 'Submitted',
        submitted_by: actor,
        submitted_by_id: user.id,
        submitted_at: nowIso(),
      });
      await appendAudit('Roadmap submitted for approval', 'TransformationRoadmap', record, {
        roadmap: record.roadmap_key, version: record.version,
      }, 'Changed');
      return Response.json({ saved: true, roadmap: record });
    }

    if (action === 'decideRoadmap') {
      await guard(permissions.approve, 'Only a manager or administrator can approve a roadmap. Submitting it for approval is the way to hand it over.', 'TransformationRoadmap', { id: body.roadmap_id });
      const roadmap = await requireOwn(entities.TransformationRoadmap, body.roadmap_id, tenantId, 'roadmap');
      const transition = roadmapTransition({
        roadmap,
        outcome: str(body.outcome),
        reason: body.reason,
        approverName: actor,
        approverId: user.id,
        isAdministrator: ['admin', 'Provider Administrator'].includes(String(user.role || '')),
      });
      if (!transition.ok) refuse(firstProblem(transition));
      const record = await entities.TransformationRoadmap.update(roadmap.id, transition.value);
      await appendAudit(`Roadmap ${String(transition.value.status).toLowerCase()}`, 'TransformationRoadmap', record, {
        roadmap: record.roadmap_key, version: record.version, reason: record.decision_note,
        authority: record.approval_authority,
      }, 'Changed');
      return Response.json({ saved: true, roadmap: record });
    }

    if (action === 'archiveRoadmap') {
      await guard(permissions.edit, 'Your role cannot archive a roadmap.', 'TransformationRoadmap', { id: body.roadmap_id });
      const roadmap = await requireOwn(entities.TransformationRoadmap, body.roadmap_id, tenantId, 'roadmap');
      const reason = clean(body.reason, 1000);
      if (reason.length < MIN_REASON_LENGTH) refuse(`Say why this roadmap is being archived, in at least ${MIN_REASON_LENGTH} characters.`);
      const record = await entities.TransformationRoadmap.update(roadmap.id, {
        status: 'Archived',
        decision_note: reason,
        archived_at: nowIso(),
      });
      await appendAudit('Roadmap archived', 'TransformationRoadmap', record, { roadmap: record.roadmap_key, reason }, 'Changed');
      return Response.json({ saved: true, roadmap: record });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    const status = error instanceof Refusal || [400, 401, 403, 404, 409, 422].includes(error?.status)
      ? Number(error.status) || 400
      : 500;
    const message = status === 500
      ? 'The strategy workspace could not complete that. Refresh and try again, or tell your administrator.'
      : clean(error?.message || 'That action is not available.', 400);
    return Response.json({ error: message }, { status });
  }
});