import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { isHighFinding, isOpenFinding } from '../lib/datasetIndex.ts';
import { blank, evaluate, ref } from './result.ts';

/** Finding health: is anything overdue, unactioned, or closed without verification? */
export function findingValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const open = dataset.findings.filter(isOpenFinding);
  const overdue = open.filter((finding) => finding.dueOn < today);
  const severeWithoutCapa = dataset.findings.filter(
    (finding) => isOpenFinding(finding) && isHighFinding(finding) && !dataset.capas.some((capa) => capa.findingId === finding.id)
  );
  const closedUnverified = dataset.findings.filter(
    (finding) => !isOpenFinding(finding) && finding.closedBy === null && finding.rating !== 'conformity'
  );
  const closedWithOpenAction = dataset.findings.filter((finding) => {
    if (isOpenFinding(finding)) return false;
    return dataset.capas.some(
      (capa) => capa.findingId === finding.id && (capa.completedOn === null || capa.effectivenessCheck === 'pending')
    );
  });
  const noRootCause = dataset.findings.filter(
    (finding) => finding.rating !== 'conformity' && blank(finding.rootCause)
  );
  const backwards = dataset.findings.filter((finding) => finding.dueOn < finding.raisedOn);

  return [
    evaluate(
      {
        id: 'finding.overdue',
        dimension: 'finding',
        severity: 'high',
        title: 'Open findings past their action due date',
        detail: 'Corrective action is late on these findings.',
      },
      overdue.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'finding.severe-without-capa',
        dimension: 'finding',
        severity: 'high',
        title: 'High or major findings with no corrective action',
        detail: 'A serious finding with no recorded action has no path to closure.',
      },
      severeWithoutCapa.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'finding.closed-unverified',
        dimension: 'finding',
        severity: 'medium',
        title: 'Findings closed without a named verifier',
        detail: 'Closure was recorded but nobody is named as having checked it.',
      },
      closedUnverified.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'finding.closed-with-open-action',
        dimension: 'finding',
        severity: 'medium',
        title: 'Findings closed while their corrective action is still open',
        detail: 'The finding was closed before the action that answers it was finished or checked.',
      },
      closedWithOpenAction.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'finding.no-root-cause',
        dimension: 'finding',
        severity: 'low',
        title: 'Findings with no recorded root cause',
        detail: 'Without a root cause the corrective action treats the symptom.',
        statusWhenFound: 'warn',
      },
      noRootCause.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'finding.due-before-raised',
        dimension: 'finding',
        severity: 'medium',
        title: 'Findings due before they were raised',
        detail: 'The action window is impossible, so the due date cannot be relied on.',
      },
      backwards.map((finding) => ref('finding', finding.id))
    ),
  ];
}