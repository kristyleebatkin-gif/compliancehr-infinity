/**
 * C7 digital twin engine.
 *
 * A twin model chooses inputs; a scenario states one lever per input; a simulation computes an
 * ESTIMATE from the records held right now. Every number here is arithmetic over stored records
 * plus the lever the user declared. Nothing is predicted, observed or asserted as an outcome:
 * the run carries ESTIMATE_NOTICE and the UI prints it beside every figure.
 */

export const ENGINE_VERSION = 'digital-twin-1.0';

export const ESTIMATE_NOTICE = 'Modelled estimate calculated from the records held at run time. It is not an observed outcome, not a forecast of an audit result, and not evidence of compliance.';

export const MODEL_STATUSES = ['Draft', 'Validated', 'Approved', 'Retired'];
export const SCENARIO_STATUSES = ['Draft', 'Submitted', 'Approved', 'Returned', 'Archived'];

/**
 * The finite set of inputs a twin can read. Each one names the register it comes from, so an
 * estimate can always be traced back to records rather than to an assumption.
 */
export const METRICS = [
  {
    key: 'control_coverage', label: 'Verified control coverage', unit: '%', direction: 'higher_better', ceiling: 100,
    source: 'ComplianceControl + AssuranceEvidence',
    description: 'Share of active controls holding at least one verified, in-date evidence record.',
  },
  {
    key: 'evidence_currency', label: 'Evidence currency', unit: '%', direction: 'higher_better', ceiling: 100,
    source: 'AssuranceEvidence',
    description: 'Share of evidence records that are verified and inside their validity date.',
  },
  {
    key: 'gap_exposure', label: 'Open high or critical gaps', unit: 'count', direction: 'lower_better', ceiling: 20,
    source: 'ComplianceGapAnalysis',
    description: 'Gaps recorded as high or critical that are still open, planned or in progress.',
  },
  {
    key: 'remediation_overdue', label: 'Overdue remediation plans', unit: 'count', direction: 'lower_better', ceiling: 15,
    source: 'RemediationPlan',
    description: 'Plans still active whose target date has passed.',
  },
  {
    key: 'finding_backlog', label: 'Open assurance findings', unit: 'count', direction: 'lower_better', ceiling: 20,
    source: 'AssuranceFinding',
    description: 'Findings not yet closed.',
  },
  {
    key: 'risk_exposure', label: 'Open high or critical risks', unit: 'count', direction: 'lower_better', ceiling: 20,
    source: 'Risk',
    description: 'Risks rated high or critical that are not closed.',
  },
  {
    key: 'graph_coverage', label: 'Records linked in the graph', unit: '%', direction: 'higher_better', ceiling: 100,
    source: 'GraphEntity',
    description: 'Share of indexed records that hold at least one relationship. Empty until the graph is indexed.',
  },
  {
    key: 'assessment_score', label: 'Latest assessment score', unit: '%', direction: 'higher_better', ceiling: 100,
    source: 'AutonomousAssessment',
    description: 'Score of the most recent completed compliance operations assessment.',
  },
];

export const metricByKey = (key: string) => METRICS.find((metric) => metric.key === key) || null;

export const parseJson = (value: any, fallback: any) => {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
const todayIso = () => new Date().toISOString().slice(0, 10);

const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);

/* ---------------------------------------------------------------------------------------------
 * Observations: what the records actually say right now
 * -------------------------------------------------------------------------------------------*/

export async function computeObservations(entities: any, tenantId: string) {
  const asOf = new Date().toISOString();
  const [controlsPage, evidencePage, gapsPage, plansPage, findingsPage, risksPage, assessmentsPage, entitiesPage] = await Promise.all([
    entities.ComplianceControl.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.AssuranceEvidence.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.ComplianceGapAnalysis.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.RemediationPlan.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.AssuranceFinding.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.Risk.filter({ tenant_id: tenantId }, { limit: 500 }),
    entities.AutonomousAssessment.filter({ tenant_id: tenantId }, { sort: '-assessed_on', limit: 20 }),
    entities.GraphEntity.filter({ tenant_id: tenantId }, { limit: 500 }),
  ]);

  const controls = items(controlsPage).filter((row: any) => row.status !== 'Retired');
  const evidence = items(evidencePage);
  const gaps = items(gapsPage);
  const plans = items(plansPage);
  const findings = items(findingsPage);
  const risks = items(risksPage);
  const assessments = items(assessmentsPage);
  const graphEntities = items(entitiesPage);
  const today = todayIso();

  const current = (row: any) => row.verification_status === 'Verified' && (!row.valid_to || row.valid_to >= today);
  const evidenceByControl = new Map<string, any[]>();
  evidence.forEach((row: any) => {
    if (!row.control_id) return;
    evidenceByControl.set(row.control_id, [...(evidenceByControl.get(row.control_id) || []), row]);
  });
  const coveredControls = controls.filter((control: any) => (evidenceByControl.get(control.id) || []).some(current));
  const currentEvidence = evidence.filter(current);

  const openGaps = gaps.filter((row: any) => ['Open', 'Remediation planned', 'In progress'].includes(row.status));
  const highGaps = openGaps.filter((row: any) => ['High', 'Critical'].includes(row.severity));
  const activePlans = plans.filter((row: any) => ['Not started', 'In progress', 'Blocked'].includes(row.status));
  const overduePlans = activePlans.filter((row: any) => row.target_date && row.target_date < today);
  const openFindings = findings.filter((row: any) => row.status !== 'Closed');
  const openRisks = risks.filter((row: any) => row.status !== 'Closed' && ['High', 'Critical'].includes(row.rating));
  const linkedEntities = graphEntities.filter((row: any) => Number(row.relationship_count || 0) > 0);
  const latestAssessment = assessments[0] || null;

  const observation = (value: number | null, recordCount: number, note: string) => ({
    value, recordCount, note, asOf,
  });

  const metrics: Record<string, any> = {
    control_coverage: observation(
      controls.length ? pct(coveredControls.length, controls.length) : null,
      controls.length,
      controls.length ? `${coveredControls.length} of ${controls.length} active controls hold verified, in-date evidence.` : 'No active controls are recorded.',
    ),
    evidence_currency: observation(
      evidence.length ? pct(currentEvidence.length, evidence.length) : null,
      evidence.length,
      evidence.length ? `${currentEvidence.length} of ${evidence.length} evidence records are verified and in date.` : 'No evidence records are held.',
    ),
    gap_exposure: observation(gaps.length ? highGaps.length : null, gaps.length, gaps.length ? `${highGaps.length} of ${gaps.length} gaps are high or critical and still open.` : 'No gap analysis has been recorded.'),
    remediation_overdue: observation(plans.length ? overduePlans.length : null, plans.length, plans.length ? `${overduePlans.length} of ${plans.length} plans are past their target date.` : 'No remediation plans are recorded.'),
    finding_backlog: observation(findings.length ? openFindings.length : null, findings.length, findings.length ? `${openFindings.length} of ${findings.length} findings are open.` : 'No assurance findings are recorded.'),
    risk_exposure: observation(risks.length ? openRisks.length : null, risks.length, risks.length ? `${openRisks.length} of ${risks.length} risks are high or critical and open.` : 'No risks are recorded.'),
    graph_coverage: observation(
      graphEntities.length ? pct(linkedEntities.length, graphEntities.length) : null,
      graphEntities.length,
      graphEntities.length
        ? `${linkedEntities.length} of ${graphEntities.length} indexed records hold at least one relationship.`
        : 'The graph index has not been built yet.',
    ),
    assessment_score: observation(
      latestAssessment ? Number(latestAssessment.score ?? 0) : null,
      assessments.length,
      latestAssessment ? `Latest ${latestAssessment.framework} assessment, scored ${latestAssessment.score ?? 0}%.` : 'No compliance assessment has run.',
    ),
  };

  return { metrics, asOf };
}

/* ---------------------------------------------------------------------------------------------
 * Validation
 * -------------------------------------------------------------------------------------------*/

export function validateModelMetrics(input: any) {
  const rows = Array.isArray(input) ? input : [];
  const metrics: any[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const key = typeof row?.metric === 'string' ? row.metric : '';
    const metric = metricByKey(key);
    if (!metric) return { error: `Unknown model input "${key}". Choose one of the ${METRICS.length} inputs this app can read.` };
    if (seen.has(key)) return { error: `The input ${metric.label} is listed twice.` };
    seen.add(key);
    const weight = Number(row?.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      return { error: `Give ${metric.label} a weight between 1 and 100.` };
    }
    const ceiling = metric.unit === 'count'
      ? Math.min(1000, Math.max(1, Number(row?.ceiling) || metric.ceiling))
      : metric.ceiling;
    metrics.push({ metric: key, weight: Math.round(weight), ceiling });
  }
  if (!metrics.length) return { error: 'Add at least one model input.' };
  return { metrics };
}

export function validateLevers(input: any, modelMetrics: any[]) {
  const rows = Array.isArray(input) ? input : [];
  const allowed = new Map(modelMetrics.map((row: any) => [row.metric, row]));
  const levers: any[] = [];
  for (const row of rows) {
    const key = typeof row?.metric === 'string' ? row.metric : '';
    if (!key) continue;
    const modelMetric = allowed.get(key);
    const metric = metricByKey(key);
    if (!modelMetric || !metric) return { error: `${metric?.label || key} is not an input of this model, so it has no baseline to move.` };
    const delta = Number(row?.delta);
    if (!Number.isFinite(delta)) return { error: `Enter a numeric change for ${metric.label}.` };
    const bound = metric.unit === 'count' ? modelMetric.ceiling : 100;
    if (Math.abs(delta) > bound) return { error: `The change to ${metric.label} must be between -${bound} and ${bound}.` };
    const rationale = String(row?.rationale ?? '').trim();
    if (delta !== 0 && rationale.length < 4) return { error: `State why ${metric.label} moves by ${delta}. A lever without a reason is a hidden assumption.` };
    if (rationale.length > 400) return { error: `Keep the reason for ${metric.label} under 400 characters.` };
    levers.push({ metric: key, delta: Math.round(delta * 10) / 10, rationale: rationale.slice(0, 400) });
  }
  return { levers };
}

/* ---------------------------------------------------------------------------------------------
 * Simulation
 * -------------------------------------------------------------------------------------------*/

export function normalise(metric: any, ceiling: number, value: number) {
  const bounded = clamp(value, 0, metric.unit === 'count' ? ceiling : 100);
  if (metric.unit === 'count') {
    const pressure = ceiling ? (bounded / ceiling) * 100 : 0;
    return metric.direction === 'lower_better' ? Math.round((100 - pressure) * 10) / 10 : Math.round(pressure * 10) / 10;
  }
  return metric.direction === 'lower_better' ? Math.round((100 - bounded) * 10) / 10 : Math.round(bounded * 10) / 10;
}

export function simulate(model: any, scenario: any, observations: any) {
  const modelMetrics = model?.metrics_json || [];
  const levers = scenario?.levers_json || [];
  const results: any[] = [];
  let weightWithData = 0;
  let weightTotal = 0;
  let baselineSum = 0;
  let projectedSum = 0;
  let usedWeight = 0;
  let used = 0;
  let missing = 0;

  modelMetrics.forEach((row: any) => {
    const metric = metricByKey(row.metric);
    if (!metric) return;
    const ceiling = row.ceiling || metric.ceiling;
    const observation = observations?.metrics?.[row.metric] || null;
    const lever = levers.find((entry: any) => entry.metric === row.metric) || null;
    const delta = lever ? Number(lever.delta) || 0 : 0;
    const observed = observation?.value ?? null;
    weightTotal += row.weight;

    if (observed === null) {
      missing += 1;
      results.push({
        metric: metric.key, label: metric.label, unit: metric.unit, weight: row.weight,
        observed: null, delta, projected: null, baseline_score: null, projected_score: null,
        score_delta: null, record_count: 0,
        note: observation?.note || 'No records behind this input.',
        source: metric.source, rationale: lever?.rationale || '',
        status: 'No data behind this input; it is left out of the estimate.',
      });
      return;
    }

    used += 1;
    weightWithData += row.weight;
    usedWeight += row.weight;
    const upper = metric.unit === 'count' ? ceiling : 100;
    const projected = Math.round(clamp(observed + delta, 0, upper) * 10) / 10;
    const baselineScore = normalise(metric, ceiling, observed);
    const projectedScore = normalise(metric, ceiling, projected);
    baselineSum += baselineScore * row.weight;
    projectedSum += projectedScore * row.weight;
    results.push({
      metric: metric.key, label: metric.label, unit: metric.unit, weight: row.weight,
      observed: Math.round(observed * 10) / 10, delta, projected,
      baseline_score: baselineScore, projected_score: projectedScore,
      score_delta: Math.round((projectedScore - baselineScore) * 10) / 10,
      record_count: observation?.recordCount || 0,
      note: observation?.note || '',
      source: metric.source, rationale: lever?.rationale || '',
      status: delta === 0 ? 'Held at the observed value.' : 'Moved by the scenario lever.',
    });
  });

  if (!usedWeight) {
    return { error: 'None of this model\'s inputs has records behind it yet, so there is nothing to model. Record the underlying evidence, gaps, risks or assessments first.' };
  }

  const indexBaseline = Math.round((baselineSum / usedWeight) * 10) / 10;
  const indexProjected = Math.round((projectedSum / usedWeight) * 10) / 10;
  return {
    results,
    index_baseline: indexBaseline,
    index_projected: indexProjected,
    index_delta: Math.round((indexProjected - indexBaseline) * 10) / 10,
    confidence: weightTotal ? Math.round((weightWithData / weightTotal) * 100) : 0,
    data_completeness: weightTotal ? Math.round((weightWithData / weightTotal) * 100) : 0,
    metrics_used: used,
    metrics_missing: missing,
  };
}