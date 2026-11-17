import { readinessBand, readinessFromParts } from '../../lib/v8000Engine.js';
import type { IsoDate, TrustBand, TrustScore, TrustSignal, V8000Dataset } from '../types/index.ts';
import { percent } from '../types/index.ts';
import { isActiveControl, isOpenFinding } from './datasetIndex.ts';
import { evidenceState } from './evidenceState.ts';

const BAND_BY_TONE: Readonly<Record<string, TrustBand>> = {
  good: 'assured',
  watch: 'developing',
  risk: 'at_risk',
  unmeasured: 'not_measured',
};

/**
 * The trust position: what the business has earned from the people it serves, measured from
 * records only. Complaints and feedback themselves live in their own registers and are counted
 * by the live integrity index; here the trust question is whether the business kept its promises
 * (evidence verified, findings closed with verification, actions that actually worked).
 *
 * Weighting and "not measured" arithmetic are delegated to the existing engine, so Phase 1 and
 * the live command centre can never drift on how a partial score is reported.
 */
export function computeTrust(dataset: V8000Dataset, today: IsoDate): TrustScore {
  const activeControls = dataset.controls.filter(isActiveControl);
  const activeIds = new Set(activeControls.map((control) => control.id));
  const linkedEvidence = dataset.evidence.filter((item) => item.controlId !== null && activeIds.has(item.controlId));
  const actionableFindings = dataset.findings.filter((finding) => finding.rating !== 'conformity');
  const applicableCapas = dataset.capas.filter((capa) => capa.effectivenessCheck !== 'not_required');
  const requiredCompetencies = dataset.competencies.filter((item) => item.required);

  const signals: TrustSignal[] = [
    {
      key: 'evidence',
      label: 'Evidence verified against an active control',
      weight: 30,
      value: percent(linkedEvidence.filter((item) => evidenceState(item, today) === 'verified').length, linkedEvidence.length),
      source: 'AssuranceEvidence',
      refCount: linkedEvidence.length,
    },
    {
      key: 'findings',
      label: 'Findings closed with a named verifier',
      weight: 25,
      value: percent(
        actionableFindings.filter((finding) => finding.status === 'closed' && finding.closedBy !== null).length,
        actionableFindings.length
      ),
      source: 'AssuranceFinding',
      refCount: actionableFindings.length,
    },
    {
      key: 'capa',
      label: 'Corrective actions shown to be effective',
      weight: 20,
      value: percent(applicableCapas.filter((capa) => capa.effectivenessCheck === 'effective').length, applicableCapas.length),
      source: 'ImprovementAction',
      refCount: applicableCapas.length,
    },
    {
      key: 'reviews',
      label: 'Reviews within their cycle',
      weight: 15,
      value: percent(dataset.reviews.filter((review) => review.dueOn >= today).length, dataset.reviews.length),
      source: 'DocumentControl',
      refCount: dataset.reviews.length,
    },
    {
      key: 'training',
      label: 'Mandated training current',
      weight: 10,
      value: percent(
        requiredCompetencies.filter((item) => item.expiresOn !== null && item.expiresOn >= today).length,
        requiredCompetencies.length
      ),
      source: 'TrainingCompletion',
      refCount: requiredCompetencies.length,
    },
  ];

  const weighted = readinessFromParts(
    signals.map((signal) => ({ key: signal.key, label: signal.label, weight: signal.weight, value: signal.value }))
  ) as { score: number | null; coverage: number };
  const tone = (readinessBand(weighted.score) as { tone: string }).tone;

  return {
    score: weighted.score,
    coverage: weighted.coverage,
    band: BAND_BY_TONE[tone] ?? 'not_measured',
    signals,
    asAt: today,
  };
}

/** Open findings that still undermine trust, counted for reporting. */
export function trustOpenFindings(dataset: V8000Dataset): number {
  return dataset.findings.filter((finding) => isOpenFinding(finding) && finding.rating !== 'conformity').length;
}