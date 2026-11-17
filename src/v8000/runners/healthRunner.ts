import type { Dimension, IsoDate, V8000Dataset } from '../types/index.ts';
import { DIMENSIONS, percent } from '../types/index.ts';
import { coveredDimensions } from '../checks/registry.ts';
import { runDatasetChecks, type DatasetReport } from './datasetRunner.ts';
import { runValidation, type ValidationReport } from './validationRunner.ts';

export interface DimensionHealth {
  readonly dimension: Dimension;
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly warned: number;
  readonly blocking: number;
}

export type HealthStatus = 'healthy' | 'attention' | 'blocking';

export interface HealthReport {
  readonly status: HealthStatus;
  readonly score: number | null;
  readonly asAt: IsoDate;
  readonly dimensions: readonly DimensionHealth[];
  readonly dimensionsCovered: number;
  readonly dimensionsExpected: number;
  readonly dataset: DatasetReport;
  readonly validation: ValidationReport;
  readonly note: string;
}

/**
 * The health of the evidence system itself: do the checks run, does the data hold together,
 * and is anything blocking. `score` is the share of rules that passed; a partial score is
 * reported as a percentage of the rules that ran, with the rule count beside it.
 */
export function runHealth(dataset: V8000Dataset, today: IsoDate): HealthReport {
  const validation = runValidation(dataset, today);
  const datasetReport = runDatasetChecks(dataset);

  const dimensions: DimensionHealth[] = DIMENSIONS.map((dimension) => {
    const results = validation.results.filter((result) => result.dimension === dimension);
    return {
      dimension,
      total: results.length,
      passed: results.filter((result) => result.status === 'pass').length,
      failed: results.filter((result) => result.status === 'fail').length,
      warned: results.filter((result) => result.status === 'warn').length,
      blocking: validation.blocking.filter((result) => result.dimension === dimension).length,
    };
  });

  const status: HealthStatus = !datasetReport.valid || validation.blocking.length > 0
    ? 'blocking'
    : validation.warned > 0
      ? 'attention'
      : 'healthy';

  return {
    status,
    score: percent(validation.passed, validation.total),
    asAt: today,
    dimensions,
    dimensionsCovered: coveredDimensions(validation.results),
    dimensionsExpected: DIMENSIONS.length,
    dataset: datasetReport,
    validation,
    note:
      status === 'blocking'
        ? 'The dataset is structurally invalid or a blocking check failed.'
        : status === 'attention'
          ? 'Nothing is blocking, but warnings need an owner.'
          : 'Every evaluated rule passed and the dataset is structurally valid.',
  };
}