import type { DashboardSnapshot, GapReport, IsoDate, TrustScore, V8000Dataset, ValidationSummary } from '../types/index.ts';
import type { DatasetIntegrity } from '../lib/integrity.ts';
import type { ReadinessPosition } from '../lib/readiness.ts';
import type { AssuranceRun } from './assuranceRunner.ts';
import type { DatasetReport } from './datasetRunner.ts';
import type { HealthReport } from './healthRunner.ts';
import { runAssurance } from './assuranceRunner.ts';
import { runDashboards } from './dashboardRunner.ts';
import { runDatasetChecks } from './datasetRunner.ts';
import { runGaps } from './gapRunner.ts';
import { runHealth } from './healthRunner.ts';
import { runIntegrity } from './integrityRunner.ts';
import { runReadiness } from './readinessRunner.ts';
import { runTrust } from './trustRunner.ts';
import { runValidation } from './validationRunner.ts';

export type NightlyStatus = 'clear' | 'attention' | 'blocked';

export interface NightlyReport {
  readonly runId: string;
  readonly generatedAt: string;
  readonly asAt: IsoDate;
  readonly datasetKey: string;
  readonly status: NightlyStatus;
  readonly validation: ValidationSummary;
  readonly dataset: DatasetReport;
  readonly health: HealthReport;
  readonly readiness: ReadinessPosition;
  readonly trust: TrustScore;
  readonly integrity: DatasetIntegrity;
  readonly gaps: GapReport;
  readonly gapDensity: number | null;
  readonly assurance: AssuranceRun;
  readonly dashboards: readonly DashboardSnapshot[];
  readonly deferred: readonly string[];
}

/** What the nightly runner deliberately does not do. Stated in the report, not implied. */
export const NIGHTLY_DEFERRED: readonly string[] = [
  'No scheduling: the runner is pure, so a platform workflow must call it.',
  'No persistence: nothing is written to an entity by this runner.',
  'No email or notification fan-out.',
  'No external system calls.',
];

/**
 * The nightly pass over the dataset: every runner, one report.
 *
 * It is deterministic for a given dataset and date, which is what makes it safe to run in a test,
 * a workflow, or by hand before a board pack. Status precedence is blocking, then attention.
 */
export function runNightly(
  dataset: V8000Dataset,
  today: IsoDate,
  generatedAt: string = `${today}T00:00:00.000Z`
): NightlyReport {
  const health = runHealth(dataset, today);
  const gaps = runGaps(dataset, today);
  const readiness = runReadiness(dataset, today);
  const trust = runTrust(dataset, today);
  const integrity = runIntegrity(dataset, today);
  const assurance = runAssurance(dataset, today);
  const dashboards = runDashboards(dataset, today);
  const validation = runValidation(dataset, today);
  const datasetReport = runDatasetChecks(dataset);

  const blocked =
    health.status === 'blocking' || gaps.report.bySeverity.critical > 0 || !datasetReport.valid;
  const attention = gaps.report.bySeverity.high > 0 || validation.warned > 0;

  return {
    runId: `${dataset.meta.key}:${today}`,
    generatedAt,
    asAt: today,
    datasetKey: dataset.meta.key,
    status: blocked ? 'blocked' : attention ? 'attention' : 'clear',
    validation,
    dataset: datasetReport,
    health,
    readiness,
    trust,
    integrity,
    gaps: gaps.report,
    gapDensity: gaps.density,
    assurance,
    dashboards,
    deferred: NIGHTLY_DEFERRED,
  };
}