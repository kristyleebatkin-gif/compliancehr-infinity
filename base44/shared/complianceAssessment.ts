/**
 * C6 assessment engine. Scores the tenant's controls from the evidence register and raises gaps.
 * Nothing is invented: a control with no evidence scores zero and produces a gap.
 */
import { today, nowIso, writeAudit } from './registerCommon.ts';

export const FRAMEWORKS = [
  'NDIS Practice Standards', 'Aged Care Quality Standards', 'ISO 9001:2015', 'ISO/IEC 27001:2022',
  'NSQHS Standards', 'HSQF', 'Fair Work',
];

export const ASSESSMENT_TYPES = [
  'Scheduled assurance pass', 'Manual assessment', 'Pre-audit readiness', 'Post-incident review',
  'Certification readiness',
];

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export const SEVERITY_WEIGHT: Record<string, number> = { Low: 2, Medium: 6, High: 12, Critical: 25 };

export const SCORE_FOR: Record<string, number> = {
  Pass: 100, Partial: 50, Fail: 0, 'Not tested': 0, 'Not applicable': 0,
};

const OPEN_GAP_STATUSES = ['Open', 'Remediation planned', 'In progress'];

/** Evidence state for one control, read only from stored evidence. */
export function evidenceState(evidence: any[]): { state: string; record: any | null } {
  if (!evidence.length) return { state: 'None held', record: null };
  const ranked = [...evidence].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')));
  const current = ranked.find((row: any) => row.verification_status === 'Verified' && (!row.valid_to || row.valid_to >= today()));
  if (current) return { state: 'Verified and current', record: current };
  const rejected = ranked.find((row: any) => row.verification_status === 'Rejected');
  if (rejected) return { state: 'Rejected', record: rejected };
  const expired = ranked.find((row: any) => row.verification_status === 'Expired' || (row.valid_to && row.valid_to < today()));
  if (expired) return { state: 'Expired', record: expired };
  const review = ranked.find((row: any) => row.verification_status === 'In Review');
  if (review) return { state: 'In review', record: review };
  return { state: 'Unverified', record: ranked[0] };
}

/** Runs one assessment over the tenant's standards, controls, evidence and findings. */
export async function runAssessment(base44: any, user: any, tenantId: string, body: any) {
  const started = Date.now();
  const framework = FRAMEWORKS.includes(body.framework) ? body.framework : '';
  if (!framework) return { error: 'Choose the framework to assess.', status: 400 };
  const assessmentType = ASSESSMENT_TYPES.includes(body.assessment_type) ? body.assessment_type : 'Manual assessment';

  const [standardsPage, controlsPage, evidencePage, findingsPage, openGapsPage] = await Promise.all([
    base44.asServiceRole.entities.RegulatoryStandard.filter({ tenant_id: tenantId, framework }, { limit: 500 }),
    base44.asServiceRole.entities.ComplianceControl.filter({ tenant_id: tenantId, framework }, { limit: 500 }),
    base44.asServiceRole.entities.AssuranceEvidence.filter({ tenant_id: tenantId }, { limit: 500 }),
    base44.asServiceRole.entities.AssuranceFinding.filter({ tenant_id: tenantId }, { limit: 500 }),
    base44.asServiceRole.entities.ComplianceGapAnalysis.filter({ tenant_id: tenantId }, { limit: 500 }),
  ]);

  const standards = standardsPage?.items || [];
  const controls = (controlsPage?.items || []).filter((row: any) => row.status !== 'Retired');
  const evidence = evidencePage?.items || [];
  const findings = findingsPage?.items || [];
  if (!standards.length && !controls.length) {
    return {
      error: `No standards or controls are recorded for ${framework}. Load them into the frameworks register first; the assessment will not invent coverage.`,
      status: 400,
    };
  }

  const gapIndex = new Set(
    (openGapsPage?.items || [])
      .filter((row: any) => OPEN_GAP_STATUSES.includes(row.status))
      .map((row: any) => `${row.control_id || ''}|${row.standard_code || ''}`),
  );

  const tested: any[] = [];
  const gaps: any[] = [];
  let passed = 0;
  let withEvidence = 0;

  for (const control of controls) {
    const linked = evidence.filter(
      (row: any) => row.control_id === control.id
        || (control.standard_code && row.standard_code === control.standard_code),
    );
    const { state, record } = evidenceState(linked);
    if (state !== 'None held') withEvidence += 1;

    const openFindings = findings.filter((row: any) => row.control_id === control.id && row.status !== 'Closed');
    const majorFinding = openFindings.find((row: any) => row.rating === 'Major non-conformity');
    const otherFinding = openFindings.find((row: any) => ['Minor non-conformity', 'Observation'].includes(row.rating));

    let result = 'Not tested';
    let gapType = '';
    let severity = 'Medium';
    let observation = '';

    if (majorFinding) {
      result = 'Fail';
      gapType = 'Open finding';
      severity = 'Critical';
      observation = `Major non-conformity open: ${majorFinding.title}.`;
    } else if (state === 'Expired' || state === 'Rejected') {
      result = 'Fail';
      gapType = state === 'Expired' ? 'Evidence expired' : 'Control test failed';
      severity = 'High';
      observation = state === 'Expired'
        ? `Evidence "${record?.title || 'on file'}" expired ${record?.valid_to || 'with no valid date'}.`
        : `Evidence "${record?.title || 'on file'}" was rejected.`;
    } else if (state === 'None held' && control.evidence_required === false) {
      result = 'Pass';
      observation = 'Control is recorded as not requiring evidence.';
    } else if (state === 'None held') {
      result = 'Fail';
      gapType = 'Evidence missing';
      severity = 'High';
      observation = 'No evidence is linked to this control in the evidence register.';
    } else if (state === 'Unverified' || state === 'In review' || otherFinding) {
      result = 'Partial';
      gapType = otherFinding ? 'Open finding' : 'Partial coverage';
      severity = otherFinding ? 'High' : 'Medium';
      observation = otherFinding
        ? `Open ${otherFinding.rating.toLowerCase()}: ${otherFinding.title}.`
        : `Evidence "${record?.title || 'on file'}" is ${state.toLowerCase()}.`;
    } else {
      result = 'Pass';
      observation = `Evidence "${record?.title || ''}" is verified and current.`;
    }

    if (result === 'Pass') passed += 1;
    tested.push({
      tenant_id: tenantId,
      framework,
      standard_code: control.standard_code || '',
      control_id: control.id,
      control_statement: control.control_statement || control.requirement || '',
      evidence_id: record?.id || '',
      evidence_title: record?.title || '',
      evidence_state: state,
      test_method: 'Evidence review',
      result,
      score: SCORE_FOR[result] ?? 0,
      tested_on: nowIso(),
      tested_by: 'Assessment engine',
      test_source: 'Assessment run',
      remediation_required: result === 'Fail' || result === 'Partial',
      notes: observation,
    });

    if (gapType) {
      const key = `${control.id}|${control.standard_code || ''}`;
      if (!gapIndex.has(key)) {
        gapIndex.add(key);
        gaps.push({
          tenant_id: tenantId,
          framework,
          standard_id: control.standard_id || '',
          standard_code: control.standard_code || '',
          standard_title: control.standard_title || '',
          control_id: control.id,
          control_statement: control.control_statement || control.requirement || '',
          gap_type: gapType,
          severity,
          observation,
          recommendation: result === 'Fail'
            ? 'Restore current, verified evidence for this control or replace the control, then re-test.'
            : 'Verify or refresh the evidence for this control, then re-test.',
          status: 'Open',
          detected_on: nowIso(),
          detected_by: 'Assessment run',
          remediation_count: 0,
        });
      }
    }
  }

  for (const standard of standards) {
    const covered = controls.some((control: any) => control.standard_id === standard.id
      || (standard.standard_code && control.standard_code === standard.standard_code));
    if (covered) continue;
    const key = `|${standard.standard_code || ''}`;
    if (gapIndex.has(key)) continue;
    gapIndex.add(key);
    gaps.push({
      tenant_id: tenantId,
      framework,
      standard_id: standard.id,
      standard_code: standard.standard_code || '',
      standard_title: standard.standard_title || '',
      control_id: '',
      control_statement: '',
      gap_type: 'No control defined',
      severity: 'High',
      observation: `Standard ${standard.standard_code || standard.standard_title} has no control recorded against it.`,
      recommendation: 'Define the control that meets this standard, then run the assessment again.',
      status: 'Open',
      detected_on: nowIso(),
      detected_by: 'Assessment run',
      remediation_count: 0,
    });
  }

  const score = tested.length ? Math.round(tested.reduce((sum, row) => sum + row.score, 0) / tested.length) : 0;
  const riskScore = Math.min(100, gaps.reduce((sum, gap) => sum + (SEVERITY_WEIGHT[gap.severity] || 0), 0));
  const confidence = tested.length ? Math.round((withEvidence / tested.length) * 100) : 0;
  const total = await base44.asServiceRole.entities.AutonomousAssessment.count({ tenant_id: tenantId });

  const outstanding = (openGapsPage?.items || [])
    .filter((row: any) => row.framework === framework && OPEN_GAP_STATUSES.includes(row.status)).length + gaps.length;
  const assessment = await base44.asServiceRole.entities.AutonomousAssessment.create({
    tenant_id: tenantId,
    assessment_ref: `ASM-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`,
    framework,
    assessment_type: assessmentType,
    status: outstanding ? 'Completed with gaps' : 'Completed',
    score,
    risk_score: riskScore,
    confidence_score: confidence,
    assessed_on: nowIso(),
    standards_total: standards.length,
    controls_total: tested.length,
    controls_passed: passed,
    controls_with_evidence: withEvidence,
    gaps_found: gaps.length,
    open_findings: findings.filter((row: any) => row.status !== 'Closed').length,
    methodology: 'Each active control is scored from the evidence register: verified and current evidence scores 100, unverified or in-review evidence 50, expired, rejected or missing evidence 0. The score is the mean of those control scores; confidence is the share of controls holding any evidence; the risk score adds 25 per critical gap, 12 per high, 6 per medium and 2 per low, capped at 100.',
    summary: `${tested.length} control(s) tested for ${framework}: ${passed} passed, ${gaps.length} gap(s) raised.`,
    run_mode: 'Manual',
    run_by: user.full_name || user.email || '',
    run_by_id: user.id,
    engine_version: 'c6.1',
    duration_ms: Date.now() - started,
  });

  if (tested.length) {
    await base44.asServiceRole.entities.ControlTestingResult.bulkCreate(
      tested.map((row: any) => ({ ...row, assessment_id: assessment.id, assessment_ref: assessment.assessment_ref })),
    );
    await base44.asServiceRole.entities.ComplianceControl.bulkUpdate(
      controls.map((control: any) => ({ id: control.id, last_tested_date: today() })),
    ).catch(() => null);
  }

  const gapTotal = await base44.asServiceRole.entities.ComplianceGapAnalysis.count({ tenant_id: tenantId });
  const createdGaps = gaps.length
    ? await base44.asServiceRole.entities.ComplianceGapAnalysis.bulkCreate(
      gaps.map((row: any, index: number) => ({
        ...row,
        gap_ref: `GAP-${new Date().getFullYear()}-${String(gapTotal + index + 1).padStart(4, '0')}`,
        assessment_id: assessment.id,
        assessment_ref: assessment.assessment_ref,
      })),
    )
    : [];

  await writeAudit(base44, user, {
    action: 'Compliance operations: assessment run',
    entityType: 'AutonomousAssessment',
    record: assessment,
    route: '/compliance-operations',
    title: assessment.assessment_ref,
    details: { framework, score, risk_score: riskScore, controls: tested.length, gaps: gaps.length },
  });

  return { saved: true, assessment, gaps_created: Array.isArray(createdGaps) ? createdGaps.length : gaps.length };
}