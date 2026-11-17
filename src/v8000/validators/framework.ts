import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { isActiveControl, safeIndex } from '../lib/datasetIndex.ts';
import { blank, evaluate, ref } from './result.ts';

/** The framework and standard layer: is the obligation set complete and current? */
export function frameworkValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const standards = safeIndex(dataset.standards);
  const activeControls = dataset.controls.filter(isActiveControl);
  const controlledRequirementIds = new Set(activeControls.flatMap((control) => control.requirementIds));

  const standing = dataset.standards.filter((standard) => standard.status === 'active');
  const noOutcome = standing.filter((standard) => blank(standard.outcome));
  const reviewsOverdue = dataset.frameworks.filter((framework) => framework.reviewDue < today);
  const retiredInUse = activeControls.filter((control) => {
    const requirement = dataset.requirements.find((item) => control.requirementIds.includes(item.id));
    const standard = requirement ? standards.get(requirement.standardId) : undefined;
    return standard !== undefined && standard.status !== 'active';
  });
  const codeMismatch = dataset.requirements.filter((requirement) => {
    const standard = standards.get(requirement.standardId);
    return standard !== undefined && standard.framework !== requirement.framework;
  });
  const knownFrameworks = new Set(dataset.frameworks.map((framework) => framework.code));
  const unmappedInstrument = dataset.standards.filter((standard) => !knownFrameworks.has(standard.framework));
  const duplicateCodes = dataset.standards.filter(
    (standard) => dataset.standards.filter((other) => other.framework === standard.framework && other.code === standard.code).length > 1
  );
  const unusedStandards = standing.filter(
    (standard) =>
      !dataset.requirements.some(
        (requirement) => requirement.standardId === standard.id && controlledRequirementIds.has(requirement.id)
      )
  );

  return [
    evaluate(
      {
        id: 'framework.standard-no-outcome',
        dimension: 'framework',
        severity: 'medium',
        title: 'Active standards with no stated outcome',
        detail: 'A standard with no outcome cannot say what it is for, so no control can be judged against it.',
        statusWhenFound: 'warn',
      },
      noOutcome.map((standard) => ref('standard', standard.id))
    ),
    evaluate(
      {
        id: 'framework.review-overdue',
        dimension: 'framework',
        severity: 'high',
        title: 'Frameworks past their review date',
        detail: 'The business has not re-read the instrument since its review date passed.',
      },
      reviewsOverdue.map((framework) => ref('framework', framework.id))
    ),
    evaluate(
      {
        id: 'framework.retired-standard-in-use',
        dimension: 'framework',
        severity: 'medium',
        title: 'Controls still meeting a superseded or retired standard',
        detail: 'The control is aimed at a standard that no longer stands, so its evidence may not count.',
      },
      retiredInUse.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'framework.code-mismatch',
        dimension: 'framework',
        severity: 'high',
        title: 'Requirements whose framework differs from their standard',
        detail: 'A requirement cannot belong to a different instrument than the standard it sits under.',
      },
      codeMismatch.map((requirement) => ref('requirement', requirement.id))
    ),
    evaluate(
      {
        id: 'framework.instrument-unknown',
        dimension: 'framework',
        severity: 'high',
        title: 'Standards pointing at an instrument that is not registered',
        detail: 'The instrument must exist in the framework register before its standards can be assured.',
      },
      unmappedInstrument.map((standard) => ref('standard', standard.id))
    ),
    evaluate(
      {
        id: 'framework.duplicate-code',
        dimension: 'framework',
        severity: 'medium',
        title: 'Standards sharing a code inside one framework',
        detail: 'Two standards with the same citation make every reference to that code ambiguous.',
      },
      duplicateCodes.map((standard) => ref('standard', standard.id))
    ),
    evaluate(
      {
        id: 'framework.standard-without-control',
        dimension: 'framework',
        severity: 'high',
        title: 'Active standards with no control at all',
        detail: 'Nothing in the business is recorded as meeting these standards.',
        statusWhenFound: 'warn',
      },
      unusedStandards.map((standard) => ref('standard', standard.id))
    ),
  ];
}