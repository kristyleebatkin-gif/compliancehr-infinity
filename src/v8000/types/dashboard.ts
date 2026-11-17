import type { IsoDate, IsoDateTime } from './common.ts';

/** The dashboard entry points already published in `ENTRY_POINTS` (src/lib/v8000Engine.js). */
export type DashboardKey =
  | 'executive'
  | 'board'
  | 'trust'
  | 'ndis'
  | 'aged_care'
  | 'clinical'
  | 'workforce'
  | 'audit'
  | 'risk';

export type MetricUnit = 'count' | 'percent' | 'score';

/** Tone is always rendered with text next to it; colour alone never carries the meaning. */
export type MetricTone = 'good' | 'watch' | 'risk' | 'neutral' | 'unmeasured';

export interface DashboardMetric {
  readonly key: string;
  readonly label: string;
  /** `null` is "not measured". A reader must see the difference between none and zero. */
  readonly value: number | null;
  readonly unit: MetricUnit;
  readonly tone: MetricTone;
  readonly source: string;
  readonly detail: string;
}

/** A dashboard reading computed from the dataset, keyed to the published route it belongs on. */
export interface DashboardSnapshot {
  readonly key: DashboardKey;
  readonly label: string;
  readonly path: string;
  readonly metrics: readonly DashboardMetric[];
  readonly asAt: IsoDate;
  readonly generatedAt: IsoDateTime;
}

/** Band a percentage for display. Text accompanies every tone. */
export function metricTone(value: number | null, goodFrom = 85, watchFrom = 60): MetricTone {
  if (value === null) return 'unmeasured';
  if (value >= goodFrom) return 'good';
  if (value >= watchFrom) return 'watch';
  return 'risk';
}