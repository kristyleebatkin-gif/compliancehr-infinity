import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { isActiveControl } from '../lib/datasetIndex.ts';
import { evaluate, ref } from './result.ts';

/**
 * Traceability: requirement → control → evidence → outcome. The chain is what turns a pile of
 * documents into an assurance position, so each broken link is reported separately.
 */
export function traceabilityValidator(dataset: V8000Dataset, _today: IsoDate): readonly CheckResult[] {
  const activeControls = dataset.controls.filter(isActiveControl);
  const controlledRequirementIds = new Set(activeControls.flatMap((control) => control.requirementIds));
  const outcomeRequirementIds = new Set(dataset.outcomes.map((outcome) => outcome.requirementId));
  const evidencedControlIds = new Set(
    dataset.evidence.filter((item) => item.controlId !== null).map((item) => item.controlId as string)
  );

  const requirementsWithoutControl = dataset.requirements.filter(
    (requirement) => !controlledRequirementIds.has(requirement.id)
  );
  const requirementsWithoutOutcome = dataset.requirements.filter(
    (requirement) => !outcomeRequirementIds.has(requirement.id)
  );
  const controlsWithoutEvidence = activeControls.filter((control) => !evidencedControlIds.has(control.id));
  const standardsWithoutControl = dataset.standards.filter((standard) => {
    const requirementIds = dataset.requirements
      .filter((requirement) => requirement.standardId === standard.id)
      .map((requirement) => requirement.id);
    return requirementIds.length === 0 || !requirementIds.some((id) => controlledRequirementIds.has(id));
  });
  const controlsWithoutRequirement = dataset.controls.filter((control) => control.requirementIds.length === 0);
  const unmeasuredOutcomes = dataset.outcomes.filter(
    (outcome) => outcome.status === 'not_measured' && outcome.source === 'none'
  );
  const evidenceOffRequirement = dataset.evidence.filter((item) => {
    if (item.controlId === null || item.requirementId === null) return false;
    const control = dataset.controls.find((candidate) => candidate.id === item.controlId);
    return control !== undefined && !control.requirementIds.includes(item.requirementId);
  });

  return [
    evaluate(
      {
        id: 'traceability.requirement-no-control',
        dimension: 'traceability',
        severity: 'high',
        title: 'Requirements with no active control',
        detail: 'The obligation is recorded but nothing in the business is recorded as meeting it.',
      },
      requirementsWithoutControl.map((requirement) => ref('requirement', requirement.id))
    ),
    evaluate(
      {
        id: 'traceability.requirement-no-outcome',
        dimension: 'traceability',
        severity: 'medium',
        title: 'Requirements with no stated outcome',
        detail: 'The chain stops at the control and never reaches the person it protects.',
      },
      requirementsWithoutOutcome.map((requirement) => ref('requirement', requirement.id))
    ),
    evaluate(
      {
        id: 'traceability.control-no-evidence',
        dimension: 'traceability',
        severity: 'high',
        title: 'Active controls with no evidence record at all',
        detail: 'The chain breaks between the control and its evidence.',
      },
      controlsWithoutEvidence.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'traceability.standard-no-control',
        dimension: 'traceability',
        severity: 'high',
        title: 'Standards with no control meeting any requirement',
        detail: 'Nothing recorded in the business can be traced to these standards.',
      },
      standardsWithoutControl.map((standard) => ref('standard', standard.id))
    ),
    evaluate(
      {
        id: 'traceability.control-no-requirement',
        dimension: 'traceability',
        severity: 'high',
        title: 'Controls meeting no requirement',
        detail: 'A control that traces to no obligation cannot support an assurance statement.',
      },
      controlsWithoutRequirement.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'traceability.outcome-unmeasured',
        dimension: 'traceability',
        severity: 'low',
        title: 'Outcomes declared with no measurement source',
        detail: 'The outcome is stated but nothing measures it, so it cannot be reported as met.',
        statusWhenFound: 'warn',
      },
      unmeasuredOutcomes.map((outcome) => ref('outcome', outcome.id))
    ),
    evaluate(
      {
        id: 'traceability.evidence-off-requirement',
        dimension: 'traceability',
        severity: 'low',
        title: 'Evidence tagged to a requirement its control does not meet',
        detail: 'The evidence points at an obligation the control is not recorded against.',
        statusWhenFound: 'warn',
      },
      evidenceOffRequirement.map((item) => ref('evidence', item.id))
    ),
  ];
}