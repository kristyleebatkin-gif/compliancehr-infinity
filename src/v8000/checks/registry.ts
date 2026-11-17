import type { CheckResult, Dimension, Severity } from '../types/index.ts';
import { DIMENSIONS } from '../types/index.ts';
import { VALIDATORS } from '../validators/index.ts';

/** Failing checks at these severities stop a release gate; warnings never do. */
export const BLOCKING_SEVERITIES: readonly Severity[] = ['critical', 'high'];

export interface CheckSuite {
  readonly dimension: Dimension;
  readonly description: string;
  readonly blocking: boolean;
  readonly checks: number;
}

/**
 * The check registry. Each suite is one validator, and the registry states whether a failure in
 * that dimension blocks. `checks` is filled from the validator itself, so the registry cannot
 * claim coverage a validator does not have.
 */
export const CHECK_REGISTRY: readonly CheckSuite[] = (DIMENSIONS as readonly Dimension[]).map((dimension) => {
  const validator = VALIDATORS[dimension];
  const sample = validator(
    {
      meta: {
        key: 'registry-probe',
        label: 'Registry probe',
        seed: 0,
        builtOn: '2026-01-01T00:00:00.000Z',
        provenance: 'fixture',
        synthetic: true,
        note: 'Empty dataset used only to count the rules a validator evaluates.',
      },
      frameworks: [],
      standards: [],
      requirements: [],
      outcomes: [],
      owners: [],
      policies: [],
      procedures: [],
      training: [],
      competencies: [],
      assessments: [],
      controls: [],
      evidence: [],
      audits: [],
      findings: [],
      capas: [],
      workflows: [],
      instances: [],
      reviews: [],
      risks: [],
    },
    '2026-01-01'
  );
  return {
    dimension,
    description: `${dimension} checks`,
    blocking: BLOCKING_SEVERITIES.length > 0,
    checks: sample.length,
  };
});

/** A result blocks when it failed at a blocking severity. Warns and passes never block. */
export function isBlocking(result: CheckResult): boolean {
  return result.status === 'fail' && BLOCKING_SEVERITIES.includes(result.severity);
}

export function blockingResults(results: readonly CheckResult[]): readonly CheckResult[] {
  return results.filter(isBlocking);
}

/** How many of the 13 dimensions have at least one evaluated rule. */
export function coveredDimensions(results: readonly CheckResult[]): number {
  return new Set(results.map((result) => result.dimension)).size;
}