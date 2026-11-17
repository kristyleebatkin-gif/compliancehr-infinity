import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { evaluate, ref } from './result.ts';

/** Corrective action: on time, completed, and proven to have worked. */
export function capaValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const overdue = dataset.capas.filter((capa) => capa.completedOn === null && capa.dueOn < today);
  const effectiveUnverified = dataset.capas.filter(
    (capa) => capa.effectivenessCheck === 'effective' && (capa.verifiedBy === null || capa.completedOn === null)
  );
  const ineffective = dataset.capas.filter((capa) => capa.effectivenessCheck === 'ineffective');
  const completeUnchecked = dataset.capas.filter(
    (capa) => capa.completedOn !== null && capa.effectivenessCheck === 'pending'
  );
  const closedFindingOpenAction = dataset.capas.filter((capa) => {
    const finding = dataset.findings.find((item) => item.id === capa.findingId);
    return finding?.status === 'closed' && capa.completedOn === null;
  });

  return [
    evaluate(
      {
        id: 'capa.overdue',
        dimension: 'capa',
        severity: 'high',
        title: 'Corrective actions past their due date',
        detail: 'The action has not been completed in the time allowed.',
      },
      overdue.map((capa) => ref('capa', capa.id))
    ),
    evaluate(
      {
        id: 'capa.effective-unverified',
        dimension: 'capa',
        severity: 'medium',
        title: 'Actions marked effective with no verifier or completion',
        detail: 'Effectiveness cannot be claimed without a completion date and a named person.',
      },
      effectiveUnverified.map((capa) => ref('capa', capa.id))
    ),
    evaluate(
      {
        id: 'capa.ineffective',
        dimension: 'capa',
        severity: 'high',
        title: 'Corrective actions shown to be ineffective',
        detail: 'The action did not fix the cause, so the finding is not truly closed.',
      },
      ineffective.map((capa) => ref('capa', capa.id))
    ),
    evaluate(
      {
        id: 'capa.complete-unchecked',
        dimension: 'capa',
        severity: 'medium',
        title: 'Actions completed but never checked for effect',
        detail: 'Completing an action is not the same as proving it worked.',
      },
      completeUnchecked.map((capa) => ref('capa', capa.id))
    ),
    evaluate(
      {
        id: 'capa.finding-closed-action-open',
        dimension: 'capa',
        severity: 'high',
        title: 'Findings closed while their action is incomplete',
        detail: 'The finding cannot be relied on as closed.',
      },
      closedFindingOpenAction.map((capa) => ref('capa', capa.id))
    ),
  ];
}