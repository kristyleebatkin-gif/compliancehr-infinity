import { base44 } from '@/api/base44Client';

export const DEFAULT_SCORE_CONFIGS = {
  organisation_health: {
    score_key: 'organisation_health',
    title: 'Organisation Health Score',
    shortTitle: 'Org Health',
    color: '#0A2B6D',
    accent: '#0072FF',
    warning_threshold: 80,
    critical_threshold: 65,
    formula_description:
      'OrgHealth = (w_comp × ComplianceScore) + (w_work × WorkforceScore) + (w_risk × RiskScore) + (w_qual × QualityScore)',
    contributingModules: [
      { name: 'Compliance Hub', route: '/compliance' },
      { name: 'HR & Workforce', route: '/our-employees' },
      { name: 'Risk & Incidents', route: '/risks' },
      { name: 'Quality & CAPA', route: '/quality' },
      { name: 'Governance Layer', route: '/governance' },
    ],
    contributingEntities: [
      'DocumentControl',
      'Policy',
      'InternalAudit',
      'Checklist',
      'StaffProfile',
      'EmployeeDocument',
      'Certificate',
      'Risk',
      'Incident',
      'QualityItem',
      'Complaint',
      'TodoTask',
    ],
    weights: [
      { key: 'compliance', label: 'Compliance Score Weight', pct: 30, unit: '% of composite' },
      { key: 'workforce', label: 'Workforce Score Weight', pct: 25, unit: '% of composite' },
      { key: 'risk', label: 'Risk & Safety Score Weight', pct: 25, unit: '% of composite' },
      { key: 'quality', label: 'Quality & Improvement Score Weight', pct: 20, unit: '% of composite' },
    ],
  },
  compliance: {
    score_key: 'compliance',
    title: 'Compliance Score',
    shortTitle: 'Compliance',
    color: '#5A00D6',
    accent: '#A100FF',
    warning_threshold: 82,
    critical_threshold: 68,
    formula_description:
      'Compliance = (w_doc × ControlledDocApprovedRate) + (w_chk × ChecklistApprovedRate) + (w_aud × AuditCompletionRate) + (w_task × TaskOnTimeRate)',
    contributingModules: [
      { name: 'Compliance Centre', route: '/compliance' },
      { name: 'Governance & Document Control', route: '/governance' },
      { name: 'Checklists & Assessments', route: '/checklists' },
      { name: 'Auditor Portal', route: '/auditor-portal' },
    ],
    contributingEntities: ['DocumentControl', 'Policy', 'Checklist', 'InternalAudit', 'TodoTask'],
    weights: [
      { key: 'doc_control', label: 'Controlled Documents Approved / Current', pct: 30, entity: 'DocumentControl' },
      { key: 'checklists', label: 'Checklists Completed / Approved', pct: 25, entity: 'Checklist' },
      { key: 'audits', label: 'Internal Audits Completed / Verified', pct: 25, entity: 'InternalAudit' },
      { key: 'tasks_sla', label: 'Compliance Tasks Not Overdue', pct: 20, entity: 'TodoTask' },
    ],
  },
  workforce: {
    score_key: 'workforce',
    title: 'Workforce Score',
    shortTitle: 'Workforce',
    color: '#0072FF',
    accent: '#00C6FF',
    warning_threshold: 85,
    critical_threshold: 70,
    formula_description:
      'Workforce = (w_staff × ActiveStaffRate) + (w_cred × CurrentCredentialRate) + (w_cert × ValidCertificateRate) + (w_consent × ActiveEmployeeConsentRate)',
    contributingModules: [
      { name: 'Employee Profiles', route: '/our-employees' },
      { name: 'Document Vault', route: '/documents' },
      { name: 'Training & LMS', route: '/training' },
      { name: 'Certificates', route: '/certificates' },
    ],
    contributingEntities: ['StaffProfile', 'EmployeeDocument', 'Certificate', 'EmployeeConsent'],
    weights: [
      { key: 'active_staff', label: 'Active & Cleared Staff Profiles', pct: 25, entity: 'StaffProfile' },
      { key: 'credentials_current', label: 'Employee Screening & Documents Current', pct: 35, entity: 'EmployeeDocument' },
      { key: 'certificates_valid', label: 'Training Certificates Current', pct: 25, entity: 'Certificate' },
      { key: 'employee_consents', label: 'Employee Consents Active', pct: 15, entity: 'EmployeeConsent' },
    ],
  },
  risk: {
    score_key: 'risk',
    title: 'Risk Score',
    shortTitle: 'Risk & Safety',
    color: '#FF2E9A',
    accent: '#FF6EDB',
    warning_threshold: 78,
    critical_threshold: 60,
    formula_description:
      'RiskScore = (w_ctrl × RiskControlledOrClosedRate) + (w_crit × NonCriticalRiskRate) + (w_inc × IncidentResolvedRate) + (w_drill × EmergencyDrillReadiness)',
    contributingModules: [
      { name: 'Risk Register', route: '/risks' },
      { name: 'Incident Management', route: '/incidents' },
      { name: 'Emergency Response', route: '/emergency-response' },
      { name: 'Workforce Presence', route: '/workforce-presence' },
    ],
    contributingEntities: ['Risk', 'Incident', 'EmergencyDrill', 'SafetyCheck'],
    weights: [
      { key: 'risk_treated', label: 'Risks Controlled / Monitored / Closed', pct: 30, entity: 'Risk' },
      { key: 'risk_non_critical', label: 'Proportion Not Rated Critical/High Untreated', pct: 30, entity: 'Risk' },
      { key: 'incident_resolved', label: 'Incidents Resolved / Closed', pct: 25, entity: 'Incident' },
      { key: 'emergency_drills', label: 'Emergency Drills & Safety Checks Logged', pct: 15, entity: 'EmergencyDrill' },
    ],
  },
  quality: {
    score_key: 'quality',
    title: 'Quality Score',
    shortTitle: 'Quality & CIR',
    color: '#A100FF',
    accent: '#5A00D6',
    warning_threshold: 80,
    critical_threshold: 65,
    formula_description:
      'Quality = (w_cir × QualityItemsImplementedRate) + (w_comp × ComplaintsResolvedRate) + (w_goal × ActiveParticipantGoalsRate) + (w_part × ParticipantConsentActiveRate)',
    contributingModules: [
      { name: 'Quality & Continuous Improvement', route: '/quality' },
      { name: 'Feedback & Complaints', route: '/feedback' },
      { name: 'Goals & Outcomes', route: '/goals' },
      { name: 'Participant Profiles', route: '/our-participants' },
    ],
    contributingEntities: ['QualityItem', 'Complaint', 'Goal', 'InformationSharingConsent'],
    weights: [
      { key: 'cir_implemented', label: 'Quality & CAPA Items In Progress / Implemented / Closed', pct: 35, entity: 'QualityItem' },
      { key: 'complaints_resolved', label: 'Complaints Resolved / Closed', pct: 25, entity: 'Complaint' },
      { key: 'goals_active', label: 'Participant Goals Tracked / Achieved', pct: 20, entity: 'Goal' },
      { key: 'consents_active', label: 'Participant Sharing Consents Active', pct: 20, entity: 'InformationSharingConsent' },
    ],
  },
};

function safeRatio(numerator, denominator, emptyFallback = null) {
  if (typeof denominator !== 'number' || denominator <= 0) return emptyFallback;
  const num = Math.max(0, Math.min(denominator, Number(numerator) || 0));
  return Math.round((num / denominator) * 100);
}

function computeWeightedScore(components, weights) {
  let weightedSum = 0;
  let activeWeightSum = 0;
  const detailed = weights.map((w) => {
    const comp = components[w.key] || { rate: null, numerator: 0, denominator: 0, detail: 'No records' };
    const weightNum = Number(w.pct) || 0;
    if (comp.rate !== null && weightNum > 0) {
      weightedSum += comp.rate * weightNum;
      activeWeightSum += weightNum;
    }
    return {
      ...w,
      rate: comp.rate,
      numerator: comp.numerator,
      denominator: comp.denominator,
      detail: comp.detail,
      contribution: comp.rate !== null ? Math.round((comp.rate * weightNum) / 100) : null,
    };
  });

  const finalScore = activeWeightSum > 0 ? Math.round(weightedSum / activeWeightSum) : null;
  return { score: finalScore, breakdown: detailed, activeWeightSum };
}

export function evaluateThresholdBand(score, warningThreshold = 80, criticalThreshold = 65, hasError = false) {
  if (hasError) {
    return { status: 'Error', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', hex: '#DC2626' };
  }
  if (score === null || score === undefined) {
    return { status: 'Missing Data', badgeClass: 'bg-slate-100 text-[#0A2B6D] border-slate-300', hex: '#64748B' };
  }
  if (score < criticalThreshold) {
    return { status: 'Fail', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', hex: '#DC2626' };
  }
  if (score < warningThreshold) {
    return { status: 'Warning', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', hex: '#D97706' };
  }
  return { status: 'Pass', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', hex: '#059669' };
}

export async function loadAndCalculateExecutiveScores(client = base44) {
  const queryErrors = [];
  const safeCount = (entityName, query = {}) =>
    client.entities[entityName]?.count
      ? client.entities[entityName].count(query).catch((err) => {
          queryErrors.push({ entity: entityName, error: err?.message || 'Count query failed' });
          return 0;
        })
      : Promise.resolve(0);

  const safeFilter = (entityName, query = {}, limit = 6) =>
    client.entities[entityName]?.filter
      ? client.entities[entityName]
          .filter(query, { sort: '-created_date', limit })
          .then((res) => (Array.isArray(res) ? res : res?.items || []))
          .catch((err) => {
            queryErrors.push({ entity: entityName, error: err?.message || 'Filter query failed' });
            return [];
          })
      : Promise.resolve([]);

  const [
    savedConfigs,
    snapshots,
    docTotal,
    docApproved,
    chkTotal,
    chkApproved,
    chkNdisCompliant,
    chkAgedCareCompliant,
    audTotal,
    audCompleted,
    taskTotal,
    taskOverdue,
    staffTotal,
    staffActive,
    empDocTotal,
    empDocCurrent,
    certTotal,
    certExpired,
    empConsentTotal,
    empConsentActive,
    riskTotal,
    riskControlled,
    riskCriticalOpen,
    incTotal,
    incResolved,
    drillTotal,
    qualTotal,
    qualProgressed,
    compTotal,
    compResolved,
    goalTotal,
    partConsentTotal,
    partConsentActive,
    partDocTotal,
    partDocVerified,
    policyTotal,
    sampleDocs,
    sampleChecklists,
    sampleStaff,
    sampleEmpDocs,
    sampleRisks,
    sampleIncidents,
    sampleQuality,
    sampleComplaints,
  ] = await Promise.all([
    safeFilter('ExecutiveScoreConfig', {}, 10),
    safeFilter('ExecutiveScoreSnapshot', {}, 20),
    safeCount('DocumentControl', {}),
    safeCount('DocumentControl', { status: 'Approved' }),
    safeCount('Checklist', {}),
    safeCount('Checklist', { status: { $in: ['Approved', 'Completed'] } }),
    safeCount('Checklist', { ndis_compliant: true }),
    safeCount('Checklist', { aged_care_compliant: true }),
    safeCount('InternalAudit', {}),
    safeCount('InternalAudit', { status: { $in: ['Completed', 'Closed', 'Verified'] } }),
    safeCount('TodoTask', { status: { $nin: ['Cancelled'] } }),
    safeCount('TodoTask', { status: 'Overdue' }),
    safeCount('StaffProfile', {}),
    safeCount('StaffProfile', { status: { $in: ['Active', 'Current', 'Approved'] } }),
    safeCount('EmployeeDocument', {}),
    safeCount('EmployeeDocument', { status: 'Current' }),
    safeCount('Certificate', {}),
    safeCount('Certificate', { status: 'Expired' }),
    safeCount('EmployeeConsent', {}),
    safeCount('EmployeeConsent', { status: 'Active' }),
    safeCount('Risk', {}),
    safeCount('Risk', { status: { $in: ['Treating', 'Monitored', 'Closed', 'Assessed'] } }),
    safeCount('Risk', { rating: { $in: ['Critical', 'High'] }, status: 'Identified' }),
    safeCount('Incident', {}),
    safeCount('Incident', { status: { $in: ['Resolved', 'Closed'] } }),
    safeCount('EmergencyDrill', {}),
    safeCount('QualityItem', {}),
    safeCount('QualityItem', { status: { $in: ['In Progress', 'Implemented', 'Closed'] } }),
    safeCount('Complaint', {}),
    safeCount('Complaint', { status: { $in: ['Resolved', 'Closed'] } }),
    safeCount('Goal', {}),
    safeCount('InformationSharingConsent', {}),
    safeCount('InformationSharingConsent', { status: 'Active' }),
    safeCount('ParticipantDocument', {}),
    safeCount('ParticipantDocument', { status: { $in: ['Completed', 'Verified', 'Received'] } }),
    safeCount('Policy', {}),
    safeFilter('DocumentControl', {}, 5),
    safeFilter('Checklist', {}, 5),
    safeFilter('StaffProfile', {}, 5),
    safeFilter('EmployeeDocument', {}, 5),
    safeFilter('Risk', {}, 5),
    safeFilter('Incident', {}, 5),
    safeFilter('QualityItem', {}, 5),
    safeFilter('Complaint', {}, 5),
  ]);

  const mergedConfigs = { ...DEFAULT_SCORE_CONFIGS };
  for (const row of savedConfigs) {
    if (row.score_key && mergedConfigs[row.score_key]) {
      let parsedWeights = mergedConfigs[row.score_key].weights;
      if (row.weights_json) {
        try {
          const candidate = JSON.parse(row.weights_json);
          if (Array.isArray(candidate) && candidate.length > 0) parsedWeights = candidate;
        } catch {
          // keep default weights
        }
      }
      mergedConfigs[row.score_key] = {
        ...mergedConfigs[row.score_key],
        configRecordId: row.id,
        warning_threshold:
          typeof row.warning_threshold === 'number'
            ? row.warning_threshold
            : mergedConfigs[row.score_key].warning_threshold,
        critical_threshold:
          typeof row.critical_threshold === 'number'
            ? row.critical_threshold
            : mergedConfigs[row.score_key].critical_threshold,
        formula_description: row.formula_description || mergedConfigs[row.score_key].formula_description,
        weights: parsedWeights,
        updated_by_email: row.updated_by_email,
        change_reason: row.change_reason,
      };
    }
  }

  // 1. Compliance Components
  const taskNotOverdue = Math.max(0, taskTotal - taskOverdue);
  const complianceComponents = {
    doc_control: {
      rate: safeRatio(docApproved, docTotal),
      numerator: docApproved,
      denominator: docTotal,
      detail: `${docApproved} of ${docTotal} controlled documents approved`,
    },
    checklists: {
      rate: safeRatio(chkApproved, chkTotal),
      numerator: chkApproved,
      denominator: chkTotal,
      detail: `${chkApproved} of ${chkTotal} checklists completed/approved`,
    },
    audits: {
      rate: safeRatio(audCompleted, audTotal),
      numerator: audCompleted,
      denominator: audTotal,
      detail: `${audCompleted} of ${audTotal} internal audits completed/verified`,
    },
    tasks_sla: {
      rate: safeRatio(taskNotOverdue, taskTotal),
      numerator: taskNotOverdue,
      denominator: taskTotal,
      detail: `${taskNotOverdue} of ${taskTotal} active/completed tasks within SLA (${taskOverdue} overdue)`,
    },
  };
  const compCalc = computeWeightedScore(complianceComponents, mergedConfigs.compliance.weights);

  // 2. Workforce Components
  const certValid = Math.max(0, certTotal - certExpired);
  const workforceComponents = {
    active_staff: {
      rate: safeRatio(staffActive, staffTotal),
      numerator: staffActive,
      denominator: staffTotal,
      detail: `${staffActive} of ${staffTotal} staff profiles active`,
    },
    credentials_current: {
      rate: safeRatio(empDocCurrent, empDocTotal),
      numerator: empDocCurrent,
      denominator: empDocTotal,
      detail: `${empDocCurrent} of ${empDocTotal} employee documents marked Current`,
    },
    certificates_valid: {
      rate: safeRatio(certValid, certTotal),
      numerator: certValid,
      denominator: certTotal,
      detail: `${certValid} of ${certTotal} training certificates valid`,
    },
    employee_consents: {
      rate: safeRatio(empConsentActive, empConsentTotal),
      numerator: empConsentActive,
      denominator: empConsentTotal,
      detail: `${empConsentActive} of ${empConsentTotal} employee consents active`,
    },
  };
  const workCalc = computeWeightedScore(workforceComponents, mergedConfigs.workforce.weights);

  // 3. Risk Components
  const riskNonCritUntreated = Math.max(0, riskTotal - riskCriticalOpen);
  const riskComponents = {
    risk_treated: {
      rate: safeRatio(riskControlled, riskTotal),
      numerator: riskControlled,
      denominator: riskTotal,
      detail: `${riskControlled} of ${riskTotal} risks assessed, treating, monitored or closed`,
    },
    risk_non_critical: {
      rate: safeRatio(riskNonCritUntreated, riskTotal),
      numerator: riskNonCritUntreated,
      denominator: riskTotal,
      detail: `${riskNonCritUntreated} of ${riskTotal} risks not untreated high/critical`,
    },
    incident_resolved: {
      rate: safeRatio(incResolved, incTotal),
      numerator: incResolved,
      denominator: incTotal,
      detail: `${incResolved} of ${incTotal} incidents resolved or closed`,
    },
    emergency_drills: {
      rate: drillTotal > 0 ? 100 : null,
      numerator: drillTotal,
      denominator: Math.max(1, drillTotal),
      detail: `${drillTotal} emergency drill record(s) logged`,
    },
  };
  const riskCalc = computeWeightedScore(riskComponents, mergedConfigs.risk.weights);

  // 4. Quality Components
  const qualityComponents = {
    cir_implemented: {
      rate: safeRatio(qualProgressed, qualTotal),
      numerator: qualProgressed,
      denominator: qualTotal,
      detail: `${qualProgressed} of ${qualTotal} quality improvement items in progress, implemented or closed`,
    },
    complaints_resolved: {
      rate: safeRatio(compResolved, compTotal),
      numerator: compResolved,
      denominator: compTotal,
      detail: `${compResolved} of ${compTotal} complaints resolved or closed`,
    },
    goals_active: {
      rate: goalTotal > 0 ? 100 : null,
      numerator: goalTotal,
      denominator: Math.max(1, goalTotal),
      detail: `${goalTotal} participant/organisational goals tracked`,
    },
    consents_active: {
      rate: safeRatio(partConsentActive, partConsentTotal),
      numerator: partConsentActive,
      denominator: partConsentTotal,
      detail: `${partConsentActive} of ${partConsentTotal} participant information sharing consents active`,
    },
  };
  const qualCalc = computeWeightedScore(qualityComponents, mergedConfigs.quality.weights);

  // 5. Organisation Health Composite Score
  const orgComponents = {
    compliance: {
      rate: compCalc.score,
      numerator: compCalc.score ?? 0,
      denominator: 100,
      detail: compCalc.score !== null ? `Compliance Score: ${compCalc.score}%` : 'Compliance Score unassessed',
    },
    workforce: {
      rate: workCalc.score,
      numerator: workCalc.score ?? 0,
      denominator: 100,
      detail: workCalc.score !== null ? `Workforce Score: ${workCalc.score}%` : 'Workforce Score unassessed',
    },
    risk: {
      rate: riskCalc.score,
      numerator: riskCalc.score ?? 0,
      denominator: 100,
      detail: riskCalc.score !== null ? `Risk Score: ${riskCalc.score}%` : 'Risk Score unassessed',
    },
    quality: {
      rate: qualCalc.score,
      numerator: qualCalc.score ?? 0,
      denominator: 100,
      detail: qualCalc.score !== null ? `Quality Score: ${qualCalc.score}%` : 'Quality Score unassessed',
    },
  };
  const orgCalc = computeWeightedScore(orgComponents, mergedConfigs.organisation_health.weights);

  const mapRecords = (items, entityType, route, titleField = 'title', statusField = 'status') =>
    items.map((item) => ({
      id: item.id,
      entityType,
      title: item[titleField] || item.full_name || item.document_id || item.id,
      status: item[statusField] || item.rating || 'Logged',
      owner: item.owner || item.responsible_manager || item.employee_name || 'Assigned Owner',
      date: (item.updated_date || item.created_date || '').slice(0, 10),
      route,
    }));

  const contributingRecordsByScore = {
    compliance: [
      ...mapRecords(sampleDocs, 'DocumentControl', '/governance'),
      ...mapRecords(sampleChecklists, 'Checklist', '/checklists'),
    ],
    workforce: [
      ...mapRecords(sampleStaff, 'StaffProfile', '/our-employees', 'full_name'),
      ...mapRecords(sampleEmpDocs, 'EmployeeDocument', '/documents'),
    ],
    risk: [
      ...mapRecords(sampleRisks, 'Risk', '/risks'),
      ...mapRecords(sampleIncidents, 'Incident', '/incidents'),
    ],
    quality: [
      ...mapRecords(sampleQuality, 'QualityItem', '/quality'),
      ...mapRecords(sampleComplaints, 'Complaint', '/feedback'),
    ],
  };
  contributingRecordsByScore.organisation_health = [
    ...contributingRecordsByScore.compliance.slice(0, 2),
    ...contributingRecordsByScore.workforce.slice(0, 2),
    ...contributingRecordsByScore.risk.slice(0, 2),
    ...contributingRecordsByScore.quality.slice(0, 2),
  ];

  const calculatedAt = new Date().toISOString();
  const hasQueryError = queryErrors.length > 0;

  const buildResult = (key, calc) => {
    const cfg = mergedConfigs[key];
    const resolvedScore = hasQueryError ? null : calc.score;
    const resolvedBreakdown = calc.breakdown;
    const evidenceCount = resolvedBreakdown.reduce((sum, b) => sum + (Number(b.denominator) || 0), 0);
    const band = evaluateThresholdBand(resolvedScore, cfg.warning_threshold, cfg.critical_threshold, hasQueryError);
    return {
      ...cfg,
      score: resolvedScore,
      band,
      breakdown: resolvedBreakdown,
      evidenceCount,
      calculatedAt,
      errors: queryErrors,
      contributingRecords: contributingRecordsByScore[key] || [],
    };
  };

  const scores = {
    organisation_health: buildResult('organisation_health', orgCalc),
    compliance: buildResult('compliance', compCalc),
    workforce: buildResult('workforce', workCalc),
    risk: buildResult('risk', riskCalc),
    quality: buildResult('quality', qualCalc),
  };

  // =========================================================================
  // ACCURACY CONTROL FRAMEWORK (5 Evidence-Backed Integrity Scores)
  // =========================================================================
  const accuracyNum = docApproved + chkApproved + empDocCurrent + partDocVerified;
  const accuracyDen = docTotal + chkTotal + empDocTotal + partDocTotal;
  const accuracyScore = hasQueryError ? null : safeRatio(accuracyNum, accuracyDen);

  const dataQualityNum = staffActive + certValid + riskControlled + taskNotOverdue;
  const dataQualityDen = staffTotal + certTotal + riskTotal + taskTotal;
  const dataQualityScore = hasQueryError ? null : safeRatio(dataQualityNum, dataQualityDen);

  const evidenceCompNum = empDocCurrent + partDocVerified + certValid + partConsentActive + empConsentActive;
  const evidenceCompDen = empDocTotal + partDocTotal + certTotal + partConsentTotal + empConsentTotal;
  const evidenceCompletenessScore = hasQueryError ? null : safeRatio(evidenceCompNum, evidenceCompDen);

  const compIntegrityNum = docApproved + chkApproved + taskNotOverdue;
  const compIntegrityDen = docTotal + chkTotal + taskTotal;
  const complianceIntegrityScore = hasQueryError ? null : safeRatio(compIntegrityNum, compIntegrityDen);

  const auditReadyNum = audCompleted + chkApproved + docApproved + partConsentActive;
  const auditReadyDen = audTotal + chkTotal + docTotal + partConsentTotal;
  const auditReadinessScore = hasQueryError ? null : safeRatio(auditReadyNum, auditReadyDen);

  const accuracyControl = [
    {
      key: 'accuracy_score',
      title: 'Accuracy Score',
      score: accuracyScore,
      band: evaluateThresholdBand(accuracyScore, 80, 65, hasQueryError),
      detail: `${accuracyNum} of ${accuracyDen} controlled docs, checklists & files verified`,
      route: '/compliance',
    },
    {
      key: 'data_quality_score',
      title: 'Data Quality Score',
      score: dataQualityScore,
      band: evaluateThresholdBand(dataQualityScore, 80, 65, hasQueryError),
      detail: `${dataQualityNum} of ${dataQualityDen} profiles, certificates, risks & tasks valid`,
      route: '/universal-storage',
    },
    {
      key: 'evidence_completeness_score',
      title: 'Evidence Completeness Score',
      score: evidenceCompletenessScore,
      band: evaluateThresholdBand(evidenceCompletenessScore, 80, 65, hasQueryError),
      detail: `${evidenceCompNum} of ${evidenceCompDen} evidence files, consents & credentials linked`,
      route: '/documents',
    },
    {
      key: 'compliance_integrity_score',
      title: 'Compliance Integrity Score',
      score: complianceIntegrityScore,
      band: evaluateThresholdBand(complianceIntegrityScore, 82, 68, hasQueryError),
      detail: `${compIntegrityNum} of ${compIntegrityDen} statutory controls & SLA tasks compliant`,
      route: '/governance',
    },
    {
      key: 'audit_readiness_score',
      title: 'Audit Readiness Score',
      score: auditReadinessScore,
      band: evaluateThresholdBand(auditReadinessScore, 80, 65, hasQueryError),
      detail: `${auditReadyNum} of ${auditReadyDen} audits, checklists & audit consents ready`,
      route: '/auditor-portal',
    },
  ];

  // =========================================================================
  // 13 LIVE COMPLIANCE INTELLIGENCE SCORES (Evidence-Backed)
  // =========================================================================
  const ndisScore = hasQueryError
    ? null
    : safeRatio(
        chkNdisCompliant + partConsentActive + partDocVerified + empDocCurrent,
        chkTotal + partConsentTotal + partDocTotal + empDocTotal
      );
  const agedCareScore = hasQueryError
    ? null
    : safeRatio(chkAgedCareCompliant + incResolved + docApproved, chkTotal + incTotal + docTotal);
  const clinicalGovScore = hasQueryError
    ? null
    : safeRatio(incResolved + riskControlled + partConsentActive, incTotal + riskTotal + partConsentTotal);
  const governanceScore = hasQueryError
    ? null
    : safeRatio(docApproved + audCompleted + policyTotal, docTotal + audTotal + Math.max(policyTotal, 0));
  const trainingScore = hasQueryError ? null : safeRatio(certValid, certTotal);
  const safetyScore = hasQueryError
    ? null
    : safeRatio(riskNonCritUntreated + incResolved + drillTotal, riskTotal + incTotal + Math.max(drillTotal, 0));
  const participantOutcomesScore = hasQueryError
    ? null
    : safeRatio(partConsentActive + compResolved + goalTotal, partConsentTotal + compTotal + Math.max(goalTotal, 0));

  const liveIntelligence13 = [
    { key: 'enterprise_compliance', title: 'Enterprise Compliance', score: scores.compliance.score, band: scores.compliance.band, route: '/compliance', detail: 'Composite statutory compliance' },
    { key: 'ndis_compliance', title: 'NDIS Compliance', score: ndisScore, band: evaluateThresholdBand(ndisScore, 82, 68, hasQueryError), route: '/ndis-portal', detail: 'NDIS Practice Standards & worker screening' },
    { key: 'aged_care_compliance', title: 'Aged Care Compliance', score: agedCareScore, band: evaluateThresholdBand(agedCareScore, 82, 68, hasQueryError), route: '/compliance', detail: 'Strengthened Aged Care Standards & SIRS' },
    { key: 'clinical_governance', title: 'Clinical Governance', score: clinicalGovScore, band: evaluateThresholdBand(clinicalGovScore, 80, 65, hasQueryError), route: '/incidents', detail: 'Clinical incidents, medications & risk controls' },
    { key: 'risk_score', title: 'Risk Score', score: scores.risk.score, band: scores.risk.band, route: '/risks', detail: 'ISO 31000 risk treatment & critical controls' },
    { key: 'quality_score', title: 'Quality Score', score: scores.quality.score, band: scores.quality.band, route: '/quality', detail: 'CAPA, continuous improvement & feedback' },
    { key: 'governance_score', title: 'Governance Score', score: governanceScore, band: evaluateThresholdBand(governanceScore, 80, 65, hasQueryError), route: '/governance', detail: 'Controlled documents, policies & internal audits' },
    { key: 'training_compliance', title: 'Training Compliance', score: trainingScore, band: evaluateThresholdBand(trainingScore, 85, 70, hasQueryError), route: '/training', detail: `${certValid} of ${certTotal} certificates current` },
    { key: 'workforce_compliance', title: 'Workforce Compliance', score: scores.workforce.score, band: scores.workforce.band, route: '/our-employees', detail: 'Cleared staff, credentials & employee consents' },
    { key: 'safety_score', title: 'Safety Score', score: safetyScore, band: evaluateThresholdBand(safetyScore, 80, 65, hasQueryError), route: '/emergency-response', detail: 'WHS controls, emergency drills & incident closure' },
    { key: 'audit_readiness', title: 'Audit Readiness', score: auditReadinessScore, band: evaluateThresholdBand(auditReadinessScore, 80, 65, hasQueryError), route: '/auditor-portal', detail: 'Continuous audit pack & consent readiness' },
    { key: 'evidence_completeness', title: 'Evidence Completeness', score: evidenceCompletenessScore, band: evaluateThresholdBand(evidenceCompletenessScore, 80, 65, hasQueryError), route: '/documents', detail: 'Mapped evidence across vaults & profiles' },
    { key: 'participant_outcomes', title: 'Participant Outcomes', score: participantOutcomesScore, band: evaluateThresholdBand(participantOutcomesScore, 80, 65, hasQueryError), route: '/goals', detail: 'Goals tracked, consents active & feedback resolved' },
  ];

  return {
    scores,
    accuracyControl,
    liveIntelligence13,
    calculatedAt,
    errors: queryErrors,
    snapshots: snapshots.sort((a, b) => (a.snapshot_date || '').localeCompare(b.snapshot_date || '')),
    rawCounts: {
      docTotal,
      chkTotal,
      audTotal,
      taskTotal,
      staffTotal,
      empDocTotal,
      certTotal,
      riskTotal,
      incTotal,
      qualTotal,
      compTotal,
      goalTotal,
      partDocTotal,
      policyTotal,
    },
  };
}