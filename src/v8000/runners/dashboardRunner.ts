import { ENTRY_POINTS } from '../../lib/v8000Engine.js';
import type {
  DashboardKey,
  DashboardMetric,
  DashboardSnapshot,
  IsoDate,
  MetricTone,
  V8000Dataset,
} from '../types/index.ts';
import { percent } from '../types/index.ts';
import { metricTone } from '../types/dashboard.ts';
import { assessStandards } from '../lib/assurance.ts';
import { computeDatasetIntegrity } from '../lib/integrity.ts';
import { computeReadiness } from '../lib/readiness.ts';
import { computeTrust } from '../lib/trust.ts';
import { isActiveControl, isOpenFinding } from '../lib/datasetIndex.ts';
import { evidenceState, holdsAssurance } from '../lib/evidenceState.ts';

/** The engine's entry-point keys, which differ in punctuation from the Phase 1 dashboard keys. */
const ENGINE_KEY: Readonly<Record<DashboardKey, string>> = {
  executive: 'executive',
  board: 'board',
  trust: 'trust',
  ndis: 'ndis',
  aged_care: 'aged-care',
  clinical: 'clinical',
  workforce: 'workforce',
  audit: 'audit',
  risk: 'risk',
};

/** Fallback routes if the engine entry point is ever renamed; they are the published app paths. */
const FALLBACK_PATH: Readonly<Record<DashboardKey, string>> = {
  executive: '/executive-dashboards',
  board: '/board-ceo',
  trust: '/feedback',
  ndis: '/ndis-portal',
  aged_care: '/compliance',
  clinical: '/clinical-os',
  workforce: '/certificates',
  audit: '/auditors-portal',
  risk: '/risks',
};

function entryFor(key: DashboardKey): { label: string; path: string } {
  const match = (ENTRY_POINTS as readonly { key: string; label: string; path: string }[]).find(
    (entry) => entry.key === ENGINE_KEY[key]
  );
  return { label: match?.label ?? key, path: match?.path ?? FALLBACK_PATH[key] };
}

const scoreMetric = (key: string, label: string, value: number | null, detail: string): DashboardMetric => ({
  key,
  label,
  value,
  unit: 'score',
  tone: metricTone(value, 80, 60),
  source: 'Phase 1 dataset',
  detail,
});

const percentMetric = (key: string, label: string, value: number | null, detail: string): DashboardMetric => ({
  key,
  label,
  value,
  unit: 'percent',
  tone: metricTone(value, 85, 60),
  source: 'Phase 1 dataset',
  detail,
});

const countMetric = (
  key: string,
  label: string,
  value: number,
  detail: string,
  tone: MetricTone = 'neutral'
): DashboardMetric => ({ key, label, value, unit: 'count', tone, source: 'Phase 1 dataset', detail });

/**
 * The nine dashboard readings, computed from the dataset and pinned to the routes the command
 * centre already links to. Labels and paths come from the engine's ENTRY_POINTS, so the Phase 1
 * snapshot and the live command centre cannot drift apart.
 */
export function runDashboards(dataset: V8000Dataset, today: IsoDate): readonly DashboardSnapshot[] {
  const activeControls = dataset.controls.filter(isActiveControl);
  const holding = new Set(
    dataset.evidence
      .filter((item) => item.controlId !== null && holdsAssurance(evidenceState(item, today)))
      .map((item) => item.controlId as string)
  );
  const actionableFindings = dataset.findings.filter((finding) => finding.rating !== 'conformity');
  const openFindings = dataset.findings.filter((finding) => isOpenFinding(finding) && finding.rating !== 'conformity');
  const openHighFindings = openFindings.filter(
    (finding) => finding.severity === 'critical' || finding.severity === 'high'
  ).length;
  const applicableCapas = dataset.capas.filter((capa) => capa.effectivenessCheck !== 'not_required');
  const requiredCompetencies = dataset.competencies.filter((item) => item.required);
  const currentCompetencies = requiredCompetencies.filter(
    (item) => item.expiresOn !== null && item.expiresOn >= today
  ).length;

  const evidenceCoverage = percent(activeControls.filter((control) => holding.has(control.id)).length, activeControls.length);
  const findingsVerified = percent(
    actionableFindings.filter((finding) => finding.status === 'closed' && finding.closedBy !== null).length,
    actionableFindings.length
  );
  const reviewsCurrent = percent(dataset.reviews.filter((review) => review.dueOn >= today).length, dataset.reviews.length);
  const capasEffective = percent(applicableCapas.filter((capa) => capa.effectivenessCheck === 'effective').length, applicableCapas.length);
  const trainingCurrent = percent(currentCompetencies, requiredCompetencies.length);

  const trust = computeTrust(dataset, today);
  const readiness = computeReadiness(dataset, today);
  const integrity = computeDatasetIntegrity(dataset, today);
  const statements = assessStandards(dataset, today);
  const assured = statements.filter((statement) => statement.level === 'assured').length;

  const frameworkMetrics = (key: 'ndis' | 'aged_care', code: 'NDIS' | 'AGED_CARE'): DashboardMetric[] => {
    const frameworkStandards = statements.filter((statement) => statement.framework === code);
    const frameworkControls = activeControls.filter((control) => control.framework === code);
    const frameworkStandardIds = new Set(dataset.standards.filter((standard) => standard.framework === code).map((standard) => standard.id));
    return [
      percentMetric(
        'standards-assured',
        'Standards assured',
        percent(frameworkStandards.filter((statement) => statement.level === 'assured').length, frameworkStandards.length),
        `${frameworkStandards.length} standards assessed in this framework.`
      ),
      percentMetric(
        'controls-evidenced',
        'Active controls holding current evidence',
        percent(frameworkControls.filter((control) => holding.has(control.id)).length, frameworkControls.length),
        `${frameworkControls.length} active controls in this framework.`
      ),
      countMetric(
        'open-findings',
        'Open findings in this framework',
        openFindings.filter((finding) => finding.standardId !== null && frameworkStandardIds.has(finding.standardId)).length,
        'Findings still open against a standard in this framework.',
        'watch'
      ),
      countMetric(key === 'ndis' ? 'requirements' : 'requirements-aged', 'Requirements recorded', dataset.requirements.filter((requirement) => requirement.framework === code).length, 'Obligations in the dataset for this framework.')
    ];
  };

  const openRisks = dataset.risks.filter((risk) => risk.status !== 'closed');
  const clinicalControls = activeControls.filter((control) => control.framework === 'AGED_CARE');

  const metricsByKey: Readonly<Record<DashboardKey, readonly DashboardMetric[]>> = {
    executive: [
      scoreMetric('readiness', 'Readiness', readiness.score, `${readiness.label}; measured across ${readiness.coverage}% of the weighted parts.`),
      scoreMetric('integrity', 'Dataset integrity', integrity.score, `${integrity.label}; measured across ${integrity.coverage}% of the weighted dimensions.`),
      percentMetric('assurance', 'Standards assured', percent(assured, statements.length), `${assured} of ${statements.length} standards hold current evidence for every active control.`),
      percentMetric('evidence', 'Active controls holding current evidence', evidenceCoverage, `${activeControls.length} active controls recorded.`),
    ],
    board: [
      countMetric('open-high-findings', 'High or major findings open', openHighFindings, 'Findings that need a board-level owner.', openHighFindings > 0 ? 'risk' : 'good'),
      percentMetric('reviews-current', 'Reviews within their cycle', reviewsCurrent, 'Governance records that are current.'),
      percentMetric('capas-effective', 'Corrective actions proven effective', capasEffective, 'Actions with an independent effectiveness check.'),
      percentMetric('findings-verified', 'Findings closed with a named verifier', findingsVerified, 'Closures someone is named against.'),
    ],
    trust: [
      scoreMetric('trust', 'Trust position', trust.score, `${trust.band}; measured across ${trust.coverage}% of the weighted signals.`),
      percentMetric('evidence-verified', 'Evidence verified', evidenceCoverage, 'Active controls holding verified or in-date evidence.'),
      percentMetric('findings-verified', 'Findings closed with a named verifier', findingsVerified, 'Trust is built on closures someone signed.'),
    ],
    ndis: frameworkMetrics('ndis', 'NDIS'),
    aged_care: frameworkMetrics('aged_care', 'AGED_CARE'),
    clinical: [
      percentMetric(
        'clinical-controls-evidenced',
        'Clinical controls holding current evidence',
        percent(clinicalControls.filter((control) => holding.has(control.id)).length, clinicalControls.length),
        `${clinicalControls.length} clinical controls recorded.`
      ),
      percentMetric('training-current', 'Required clinical competencies current', trainingCurrent, `${currentCompetencies} of ${requiredCompetencies.length} required competencies are in date.`),
      countMetric('clinical-findings', 'Open clinical findings', openFindings.filter((finding) => finding.severity !== 'low').length, 'Open findings above low severity across the dataset.', 'watch'),
    ],
    workforce: [
      percentMetric('training-current', 'Mandated training current', trainingCurrent, `${requiredCompetencies.length} required competencies recorded.`),
      countMetric('training-lapsed', 'Competencies lapsed or unassessed', requiredCompetencies.length - currentCompetencies, 'People who cannot be shown to hold the training their role requires.', requiredCompetencies.length - currentCompetencies > 0 ? 'risk' : 'good'),
      percentMetric('reviews-current', 'Credential and control reviews current', reviewsCurrent, 'Reviews across the register.'),
    ],
    audit: [
      countMetric('audits-complete', 'Audits complete', dataset.audits.filter((audit) => audit.status === 'complete').length, 'Audits with a recorded completion.'),
      countMetric('audits-open', 'Audits planned or in progress', dataset.audits.filter((audit) => audit.status === 'planned' || audit.status === 'in_progress').length, 'Audits still to finish.', 'neutral'),
      percentMetric('findings-verified', 'Findings closed with a named verifier', findingsVerified, 'Audited closures that someone signed.'),
      countMetric('findings-open', 'Open findings', openFindings.length, 'Findings of any severity still open.', openFindings.length > 0 ? 'watch' : 'good'),
    ],
    risk: [
      countMetric('risks-open', 'Open risks', openRisks.length, 'Risks not yet closed.'),
      countMetric(
        'risks-high',
        'High or critical risks open',
        openRisks.filter((risk) => risk.rating === 'high' || risk.rating === 'critical').length,
        'Risks at or above the high band.',
        openRisks.some((risk) => risk.rating === 'critical') ? 'risk' : 'watch'
      ),
      percentMetric(
        'risks-treated',
        'Open risks linked to a treating control',
        percent(openRisks.filter((risk) => risk.controlIds.length > 0).length, openRisks.length),
        'A risk with no control is a risk with no treatment recorded.'
      ),
    ],
  };

  return (Object.keys(metricsByKey) as DashboardKey[]).map((key) => {
    const entry = entryFor(key);
    return {
      key,
      label: entry.label,
      path: entry.path,
      metrics: metricsByKey[key],
      asAt: today,
      generatedAt: `${today}T00:00:00.000Z`,
    };
  });
}