import type { CheckResult, IsoDate, ValidationSummary, V8000Dataset } from '../types/index.ts';
import { DIMENSIONS } from '../types/index.ts';
import { blockingResults, coveredDimensions } from '../checks/registry.ts';
import { runAllValidators } from '../validators/index.ts';

export interface ValidationReport extends ValidationSummary {
  readonly asAt: IsoDate;
  readonly datasetKey: string;
  readonly dimensionsCovered: number;
  readonly dimensionsExpected: number;
}

/** Turn a flat list of check results into a summary: what passed, what failed, what blocks. */
export function summariseResults(results: readonly CheckResult[], datasetKey: string, asAt: IsoDate): ValidationReport {
  return {
    total: results.length,
    passed: results.filter((result) => result.status === 'pass').length,
    failed: results.filter((result) => result.status === 'fail').length,
    warned: results.filter((result) => result.status === 'warn').length,
    results,
    blocking: blockingResults(results),
    asAt,
    datasetKey,
    dimensionsCovered: coveredDimensions(results),
    dimensionsExpected: DIMENSIONS.length,
  };
}

/** Run every validator over the dataset and summarise the outcome. */
export function runValidation(dataset: V8000Dataset, today: IsoDate): ValidationReport {
  return summariseResults(runAllValidators(dataset, today), dataset.meta.key, today);
}