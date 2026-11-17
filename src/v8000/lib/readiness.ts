import { readinessBand, readinessFromParts } from '../../lib/v8000Engine.js';
import type { IsoDate, V8000Dataset } from '../types/index.ts';
import { percent, round } from '../types/index.ts';
import { assessStandards } from './assurance.ts';
import { isActiveControl, isOpenFinding } from './datasetIndex.ts';
import { evidenceState, holdsAssurance } from './evidenceState.ts';
import { computeTrust } from './trust.ts';

export interface ReadinessPart {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  readonly value: number | null;
}

export interface ReadinessPosition {
  readonly score: number | null;
  readonly coverage: number;
  readonly label: string;
  readonly tone: string;
  readonly parts: readonly ReadinessPart[];
  readonly asAt: IsoDate;
}

/**
 * Weighted readiness for the dataset.
 *
 * The arithmetic (measured-weight only, coverage reported separately, `null` never treated as
 * zero) is the existing engine's, not a second implementation. Only the inputs are Phase 1's.
 */
export function computeReadiness(dataset: V8000Dataset, today: IsoDate): ReadinessPosition {
  const activeControls = dataset.controls.filter(isActiveControl);
  const holdingControls = new Set(
    dataset.evidence
      .filter((item) => item.controlId !== null && holdsAssurance(evidenceState(item, today)))
      .map((item) => item.controlId as string)
  );
  const trust = computeTrust(dataset, today);
  const statements = assessStandards(dataset, today);
  const actionableFindings = dataset.findings.filter((finding) => finding.rating !== 'conformity');
  const assured = statements.filter((item) => item.level === 'assured').length;
  const partial = statements.filter((item) => item.level === 'partial').length;

  const parts: ReadinessPart[] = [
    { key: 'trust', label: 'Trust position', weight: 30, value: trust.score },
    {
      key: 'coverage',
      label: 'Active controls holding current evidence',
      weight: 25,
      value: percent(activeControls.filter((control) => holdingControls.has(control.id)).length, activeControls.length),
    },
    {
      key: 'findings',
      label: 'Findings with a verified closure',
      weight: 20,
      value: percent(
        actionableFindings.filter((finding) => !isOpenFinding(finding) && finding.closedBy !== null).length,
        actionableFindings.length
      ),
    },
    {
      key: 'assurance',
      label: 'Standards assured or partly assured',
      weight: 15,
      value: statements.length === 0 ? null : round(((assured + partial * 0.5) / statements.length) * 100),
    },
    {
      key: 'reviews',
      label: 'Reviews within their cycle',
      weight: 10,
      value: percent(dataset.reviews.filter((review) => review.dueOn >= today).length, dataset.reviews.length),
    },
  ];

  const weighted = readinessFromParts(
    parts.map((part) => ({ key: part.key, label: part.label, weight: part.weight, value: part.value }))
  ) as { score: number | null; coverage: number };
  const band = readinessBand(weighted.score) as { label: string; tone: string };

  return {
    score: weighted.score,
    coverage: weighted.coverage,
    label: band.label,
    tone: band.tone,
    parts,
    asAt: today,
  };
}