import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { isActiveControl, safeIndex } from '../lib/datasetIndex.ts';
import { evaluate, ref } from './result.ts';

/** Ownership: every active control has one accountable, active person who can answer for it. */
export function ownerValidator(dataset: V8000Dataset, _today: IsoDate): readonly CheckResult[] {
  const owners = safeIndex(dataset.owners);
  const activeControls = dataset.controls.filter(isActiveControl);

  const unowned = activeControls.filter((control) => control.ownerId === null);
  const inactive = activeControls.filter((control) => {
    const owner = control.ownerId ? owners.get(control.ownerId) : undefined;
    return owner !== undefined && owner.active === false;
  });
  const noScope = dataset.owners.filter((owner) => owner.accountableFor.length === 0 && owner.active);
  const notAccountable = activeControls.filter((control) => {
    const owner = control.ownerId ? owners.get(control.ownerId) : undefined;
    return owner !== undefined && owner.active && !owner.accountableFor.includes('control');
  });
  const unownedFindings = dataset.findings.filter(
    (finding) => finding.status !== 'closed' && (finding.ownerId === null || !owners.has(finding.ownerId))
  );
  const overloaded = dataset.owners.filter(
    (owner) => owner.active && activeControls.filter((control) => control.ownerId === owner.id).length > 5
  );

  return [
    evaluate(
      {
        id: 'owner.control-unowned',
        dimension: 'owner',
        severity: 'high',
        title: 'Active controls with no named owner',
        detail: 'No one is accountable for the evidence of these controls.',
      },
      unowned.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'owner.inactive-owner',
        dimension: 'owner',
        severity: 'medium',
        title: 'Active controls held by an inactive owner',
        detail: 'The owner has left or been deactivated, so ownership has lapsed in practice.',
      },
      inactive.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'owner.no-scope',
        dimension: 'owner',
        severity: 'low',
        title: 'Owners accountable for nothing',
        detail: 'An owner with no accountable record types cannot be held to anything.',
        statusWhenFound: 'warn',
      },
      noScope.map((owner) => ref('owner', owner.id))
    ),
    evaluate(
      {
        id: 'owner.not-accountable',
        dimension: 'owner',
        severity: 'low',
        title: 'Owners holding controls they are not accountable for',
        detail: 'The owner exists but is not accountable for controls, so accountability is informal.',
        statusWhenFound: 'warn',
      },
      notAccountable.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'owner.finding-unowned',
        dimension: 'owner',
        severity: 'high',
        title: 'Open findings with no resolvable action owner',
        detail: 'A finding without an owner does not move.',
      },
      unownedFindings.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'owner.overloaded',
        dimension: 'owner',
        severity: 'low',
        title: 'Owners holding more than five active controls',
        detail: 'Concentration of ownership is a capacity risk worth reviewing.',
        statusWhenFound: 'warn',
      },
      overloaded.map((owner) => ref('owner', owner.id))
    ),
  ];
}