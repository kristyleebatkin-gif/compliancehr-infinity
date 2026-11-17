import type { GapReport, IsoDate, V8000Dataset } from '../types/index.ts';
import { collectGaps, gapDensity } from '../lib/gaps.ts';

export interface GapRun {
  readonly report: GapReport;
  readonly density: number | null;
}

/** Every gap in the dataset, with structural density against the active control set. */
export function runGaps(dataset: V8000Dataset, today: IsoDate): GapRun {
  const report = collectGaps(dataset, today);
  return { report, density: gapDensity(report, dataset) };
}