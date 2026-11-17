import type { CheckResult, EntityRef, Gap, IsoDate, V8000Dataset } from '../types/index.ts';
import { isActiveControl } from '../lib/datasetIndex.ts';
import { collectGaps, gapDensity } from '../lib/gaps.ts';
import { evaluateCount } from './result.ts';

function refsOf(gaps: readonly Gap[]): readonly EntityRef[] {
  const seen = new Set<string>();
  const list: EntityRef[] = [];
  gaps.forEach((gap) => {
    gap.refs.forEach((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(item);
    });
  });
  return list;
}

/** Gaps as checks: how many, how severe, and how much of the control set they touch. */
export function gapValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const report = collectGaps(dataset, today);
  const density = gapDensity(report, dataset);
  const activeControls = dataset.controls.filter(isActiveControl).length;
  const critical = report.gaps.filter((gap) => gap.severity === 'critical');
  const high = report.gaps.filter((gap) => gap.severity === 'high');

  return [
    evaluateCount(
      {
        id: 'gap.critical',
        dimension: 'gap',
        severity: 'critical',
        title: 'Critical gaps in the evidence chain',
        detail: 'A critical gap is an open serious finding or an obligation with nothing behind it.',
      },
      critical.length,
      refsOf(critical)
    ),
    evaluateCount(
      {
        id: 'gap.high',
        dimension: 'gap',
        severity: 'high',
        title: 'High gaps in the evidence chain',
        detail: 'Unsupported controls, lapsed evidence, lapsed training and overdue reviews are high gaps.',
      },
      high.length,
      refsOf(high)
    ),
    evaluateCount(
      {
        id: 'gap.density',
        dimension: 'gap',
        severity: 'high',
        title: 'Structural evidence gaps touch too much of the control set',
        detail:
          density === null
            ? 'No active controls, so gap density is not measured.'
            : `${density}% of active controls are unsupported or running on stale or rejected evidence (threshold 30%).`,
        statusWhenFound: 'warn',
      },
      density !== null && density > 30 ? 1 : 0
    ),
    evaluateCount(
      {
        id: 'gap.unmapped-requirement',
        dimension: 'gap',
        severity: 'high',
        title: 'Mandatory requirements with no control',
        detail: 'The business is obliged to meet these and has recorded nothing that meets them.',
      },
      report.byKind.unmapped_requirement,
      refsOf(report.gaps.filter((gap) => gap.kind === 'unmapped_requirement'))
    ),
    evaluateCount(
      {
        id: 'gap.training',
        dimension: 'gap',
        severity: 'medium',
        title: 'Mandated training lapsed against a control',
        detail: 'The control depends on training that some required people have not kept current.',
        statusWhenFound: 'warn',
      },
      report.byKind.inadequate_training,
      refsOf(report.gaps.filter((gap) => gap.kind === 'inadequate_training'))
    ),
    evaluateCount(
      {
        id: 'gap.no-controls',
        dimension: 'gap',
        severity: 'low',
        title: 'No active controls recorded',
        detail: 'Without controls there is nothing to assure and no gap position to report.',
        statusWhenFound: 'warn',
      },
      activeControls === 0 ? 1 : 0
    ),
  ];
}