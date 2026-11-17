import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { computeTrust } from '../lib/trust.ts';
import { evaluateCount } from './result.ts';

/** Trust position as checks: is the score real, is it measured widely enough, is it slipping? */
export function trustValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const trust = computeTrust(dataset, today);
  const weak = trust.signals.filter((signal) => signal.value !== null && signal.value < 50);
  const unmeasured = trust.signals.filter((signal) => signal.value === null);
  const belowFloor = trust.score !== null && trust.score < 60;

  return [
    evaluateCount(
      {
        id: 'trust.below-floor',
        dimension: 'trust',
        severity: 'high',
        title: 'Trust position below the review floor',
        detail:
          trust.score === null
            ? 'Trust cannot be measured yet: no signal has a denominator.'
            : `Trust is ${trust.score}% across ${trust.coverage}% of the weighted signals. Anything below 60% needs an owner and a plan.`,
      },
      belowFloor ? 1 : 0
    ),
    evaluateCount(
      {
        id: 'trust.weak-signal',
        dimension: 'trust',
        severity: 'medium',
        title: 'Trust signals scoring below half',
        detail: 'These signals are dragging the trust position down and are the places to act first.',
        statusWhenFound: 'warn',
      },
      weak.length
    ),
    evaluateCount(
      {
        id: 'trust.unmeasured-signal',
        dimension: 'trust',
        severity: 'low',
        title: 'Trust signals with no usable records',
        detail: 'An unmeasured signal is excluded from the score and reported in coverage, never counted as zero.',
        statusWhenFound: 'warn',
      },
      unmeasured.length
    ),
  ];
}