import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { computeDatasetIntegrity } from '../lib/integrity.ts';
import { evaluateCount } from './result.ts';

/** Dataset integrity: is the chain joined up enough to be trusted as a whole? */
export function integrityValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const integrity = computeDatasetIntegrity(dataset, today);
  const weak = integrity.dimensions.filter((dimension) => dimension.value !== null && dimension.value < 50);
  const belowFloor = integrity.score !== null && integrity.score < 70;

  return [
    evaluateCount(
      {
        id: 'integrity.below-floor',
        dimension: 'integrity',
        severity: 'high',
        title: 'Dataset integrity below the review floor',
        detail:
          integrity.score === null
            ? 'Integrity cannot be measured yet: no dimension has a denominator.'
            : `Integrity is ${integrity.score}% across ${integrity.coverage}% of the weighted dimensions.`,
      },
      belowFloor ? 1 : 0
    ),
    evaluateCount(
      {
        id: 'integrity.weak-dimension',
        dimension: 'integrity',
        severity: 'medium',
        title: 'Integrity dimensions below half',
        detail: weak.map((dimension) => dimension.label).join('; ') || 'No measured dimension is below half.',
        statusWhenFound: 'warn',
      },
      weak.length
    ),
    evaluateCount(
      {
        id: 'integrity.coverage',
        dimension: 'integrity',
        severity: 'low',
        title: 'Integrity is only partly measured',
        detail: `${integrity.coverage}% of the weighted dimensions have records behind them. The rest are excluded from the score rather than counted as zero.`,
        statusWhenFound: 'warn',
      },
      integrity.coverage < 100 ? 1 : 0
    ),
  ];
}