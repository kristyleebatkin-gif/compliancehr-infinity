import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { buildIdSets, isActiveControl } from '../lib/datasetIndex.ts';
import { evaluate, ref } from './result.ts';

/**
 * Every typed reference in the dataset must resolve. An unresolvable reference is a defect in the
 * record, not a missing control: the traceability validators deal with the latter.
 */
export function referenceValidator(dataset: V8000Dataset, _today: IsoDate): readonly CheckResult[] {
  const sets = buildIdSets(dataset);
  const reviews = dataset.reviews;

  const requirementsWithoutStandard = dataset.requirements.filter((item) => !sets.standard.has(item.standardId));
  const findingsWithoutStandard = dataset.findings.filter((item) => item.standardId !== null && !sets.standard.has(item.standardId));

  const controlRequirementRefs = dataset.controls.flatMap((control) =>
    control.requirementIds.filter((id) => !sets.requirement.has(id)).map((id) => ({ control, id }))
  );
  const controlPolicyRefs = dataset.controls.filter(
    (control) => control.policyId !== null && !sets.policy.has(control.policyId)
  );
  const controlProcedureRefs = dataset.controls.flatMap((control) =>
    control.procedureIds.filter((id) => !sets.procedure.has(id)).map((id) => ({ control, id }))
  );
  const controlOwnerRefs = dataset.controls.filter(
    (control) => control.ownerId !== null && !sets.owner.has(control.ownerId)
  );
  const controlTrainingRefs = dataset.controls.flatMap((control) =>
    control.trainingIds.filter((id) => !sets.training.has(id)).map((id) => ({ control, id }))
  );

  const evidenceWithoutControl = dataset.evidence.filter(
    (item) => item.controlId !== null && !sets.control.has(item.controlId)
  );
  const evidenceWithoutRequirement = dataset.evidence.filter(
    (item) => item.requirementId !== null && !sets.requirement.has(item.requirementId)
  );
  const findingsWithoutAudit = dataset.findings.filter((item) => item.auditId !== null && !sets.audit.has(item.auditId));
  const findingsWithoutControl = dataset.findings.filter(
    (item) => item.controlId !== null && !sets.control.has(item.controlId)
  );
  const capasWithoutFinding = dataset.capas.filter((item) => !sets.finding.has(item.findingId));
  const instancesWithoutDefinition = dataset.instances.filter((item) => !sets.workflow.has(item.definitionId));
  const reviewsWithoutSubject = reviews.filter((review) => !sets[review.subjectRef.type].has(review.subjectRef.id));
  const assessmentsWithoutControl = dataset.assessments.filter((item) => !sets.control.has(item.controlId));
  const competenciesWithoutTraining = dataset.competencies.filter((item) => !sets.training.has(item.trainingId));
  const risksWithoutControl = dataset.risks.filter((risk) => risk.controlIds.some((id) => !sets.control.has(id)));

  return [
    evaluate(
      {
        id: 'reference.requirement-standard',
        dimension: 'reference',
        severity: 'high',
        title: 'Requirements pointing at a standard that does not exist',
        detail: 'The requirement cannot be traced to a standard until its standard is corrected.',
      },
      requirementsWithoutStandard.map((item) => ref('requirement', item.id))
    ),
    evaluate(
      {
        id: 'reference.finding-standard',
        dimension: 'reference',
        severity: 'medium',
        title: 'Findings pointing at a standard that does not exist',
        detail: 'The finding cannot be reported against a standard until its reference is corrected.',
      },
      findingsWithoutStandard.map((item) => ref('finding', item.id))
    ),
    evaluate(
      {
        id: 'reference.control-requirement',
        dimension: 'reference',
        severity: 'high',
        title: 'Controls meeting a requirement that does not exist',
        detail: 'A control must resolve to at least one requirement for the chain to hold.',
      },
      controlRequirementRefs.map((item) => ref('control', item.control.id))
    ),
    evaluate(
      {
        id: 'reference.control-policy',
        dimension: 'reference',
        severity: 'medium',
        title: 'Controls citing a policy that does not exist',
        detail: 'A control whose authorising policy is missing cannot show that it was approved.',
      },
      controlPolicyRefs.map((item) => ref('control', item.id))
    ),
    evaluate(
      {
        id: 'reference.control-procedure',
        dimension: 'reference',
        severity: 'medium',
        title: 'Controls citing a procedure that does not exist',
        detail: 'Workers are pointed at a procedure that is not in the register.',
      },
      controlProcedureRefs.map((item) => ref('control', item.control.id))
    ),
    evaluate(
      {
        id: 'reference.control-owner',
        dimension: 'reference',
        severity: 'high',
        title: 'Controls owned by a person who is not in the register',
        detail: 'Ownership must resolve to a real owner record.',
      },
      controlOwnerRefs.map((item) => ref('control', item.id))
    ),
    evaluate(
      {
        id: 'reference.control-training',
        dimension: 'reference',
        severity: 'medium',
        title: 'Controls citing training that does not exist',
        detail: 'The control claims training support that is not in the register.',
      },
      controlTrainingRefs.map((item) => ref('control', item.control.id))
    ),
    evaluate(
      {
        id: 'reference.evidence-control',
        dimension: 'reference',
        severity: 'high',
        title: 'Evidence attached to a control that does not exist',
        detail: 'Evidence cannot support a record that is absent; it will read as assurance for nothing.',
      },
      evidenceWithoutControl.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'reference.evidence-requirement',
        dimension: 'reference',
        severity: 'medium',
        title: 'Evidence attached to a requirement that does not exist',
        detail: 'The requirement reference on these evidence records does not resolve.',
      },
      evidenceWithoutRequirement.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'reference.finding-audit',
        dimension: 'reference',
        severity: 'medium',
        title: 'Findings raised by an audit that does not exist',
        detail: 'A finding must resolve to its raising audit, or to no audit at all.',
      },
      findingsWithoutAudit.map((item) => ref('finding', item.id))
    ),
    evaluate(
      {
        id: 'reference.finding-control',
        dimension: 'reference',
        severity: 'medium',
        title: 'Findings pointing at a control that does not exist',
        detail: 'The control named on these findings is not in the register.',
      },
      findingsWithoutControl.map((item) => ref('finding', item.id))
    ),
    evaluate(
      {
        id: 'reference.capa-finding',
        dimension: 'reference',
        severity: 'high',
        title: 'Corrective actions answering a finding that does not exist',
        detail: 'The action cannot be traced to the finding it was raised for.',
      },
      capasWithoutFinding.map((item) => ref('capa', item.id))
    ),
    evaluate(
      {
        id: 'reference.instance-definition',
        dimension: 'reference',
        severity: 'high',
        title: 'Workflow runs whose definition does not exist',
        detail: 'The run is following a process that is not in the register.',
      },
      instancesWithoutDefinition.map((item) => ref('workflow_instance', item.id))
    ),
    evaluate(
      {
        id: 'reference.review-subject',
        dimension: 'reference',
        severity: 'medium',
        title: 'Reviews of a record that does not exist',
        detail: 'A review must resolve to the record it is reviewing.',
      },
      reviewsWithoutSubject.map((item) => ref('review', item.id))
    ),
    evaluate(
      {
        id: 'reference.assessment-control',
        dimension: 'reference',
        severity: 'medium',
        title: 'Assessments of a control that does not exist',
        detail: 'The test cannot be reported against a control that is absent.',
      },
      assessmentsWithoutControl.map((item) => ref('assessment', item.id))
    ),
    evaluate(
      {
        id: 'reference.competency-training',
        dimension: 'reference',
        severity: 'medium',
        title: 'Competencies tied to training that does not exist',
        detail: 'The competency cannot be confirmed against a training product in the register.',
      },
      competenciesWithoutTraining.map((item) => ref('competency', item.id))
    ),
    evaluate(
      {
        id: 'reference.risk-control',
        dimension: 'reference',
        severity: 'medium',
        title: 'Risks treated by a control that does not exist',
        detail: 'The treatment claim cannot be supported by a control record.',
      },
      risksWithoutControl.map((item) => ref('risk', item.id))
    ),
    evaluate(
      {
        id: 'reference.control-status',
        dimension: 'reference',
        severity: 'low',
        title: 'Controls whose retirement leaves evidence unsupported',
        detail: 'Retired controls that still hold in-date evidence are counted but not treated as active assurance.',
        statusWhenFound: 'warn',
      },
      dataset.controls
        .filter((control) => !isActiveControl(control) && dataset.evidence.some((item) => item.controlId === control.id))
        .map((control) => ref('control', control.id))
    ),
  ];
}