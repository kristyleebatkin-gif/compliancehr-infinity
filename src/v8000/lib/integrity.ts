import { readinessBand, readinessFromParts } from '../../lib/v8000Engine.js';
import type { IsoDate, V8000Dataset } from '../types/index.ts';
import { percent } from '../types/index.ts';
import { isActiveControl, isOpenFinding } from './datasetIndex.ts';
import { evidenceState, holdsAssurance } from './evidenceState.ts';

export interface IntegrityDimension {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  readonly value: number | null;
  readonly source: string;
}

export interface DatasetIntegrity {
  readonly score: number | null;
  readonly coverage: number;
  readonly label: string;
  readonly tone: string;
  readonly dimensions: readonly IntegrityDimension[];
  readonly asAt: IsoDate;
}

/** A workflow whose next-step pointers resolve and which captures evidence at some point. */
function workflowIntact(steps: readonly { readonly id: string; readonly kind: string; readonly next: readonly string[] }[]): boolean {
  const ids = new Set(steps.map((step) => step.id));
  const pointersResolve = steps.every((step) => step.next.every((next) => ids.has(next)));
  return pointersResolve && steps.some((step) => step.kind === 'evidence');
}

/**
 * Dataset integrity: how completely the evidence chain is joined up, across seven dimensions.
 *
 * This is NOT the Enterprise Integrity Index in `src/lib/integrityIndex.js`. That index scores
 * ten business dimensions from live entity counts and is the figure reported to the board. This
 * one scores the Phase 1 dataset so the Phase 1 checks have something to validate against, and it
 * is labelled as dataset-scoped everywhere it is reported.
 */
export function computeDatasetIntegrity(dataset: V8000Dataset, today: IsoDate): DatasetIntegrity {
  const activeControls = dataset.controls.filter(isActiveControl);
  const holdingControls = new Set(
    dataset.evidence
      .filter((item) => item.controlId !== null && holdsAssurance(evidenceState(item, today)))
      .map((item) => item.controlId as string)
  );
  const controlsFor = new Map<string, number>();
  activeControls.forEach((control) => {
    control.requirementIds.forEach((id) => controlsFor.set(id, (controlsFor.get(id) ?? 0) + 1));
  });
  const outcomeFor = new Set(dataset.outcomes.map((outcome) => outcome.requirementId));
  const owners = new Map(dataset.owners.map((owner) => [owner.id, owner]));
  const actionableFindings = dataset.findings.filter((finding) => finding.rating !== 'conformity');
  const applicableCapas = dataset.capas.filter((capa) => capa.effectivenessCheck !== 'not_required');
  const published = dataset.workflows.filter((workflow) => workflow.published);

  const dimensions: IntegrityDimension[] = [
    {
      key: 'traceability',
      label: 'Requirements traced to a control and an outcome',
      weight: 25,
      value: percent(
        dataset.requirements.filter((requirement) => (controlsFor.get(requirement.id) ?? 0) > 0 && outcomeFor.has(requirement.id)).length,
        dataset.requirements.length
      ),
      source: 'Requirement, Control, Outcome',
    },
    {
      key: 'evidence',
      label: 'Active controls holding current evidence',
      weight: 20,
      value: percent(activeControls.filter((control) => holdingControls.has(control.id)).length, activeControls.length),
      source: 'AssuranceEvidence',
    },
    {
      key: 'ownership',
      label: 'Active controls with an active owner',
      weight: 15,
      value: percent(
        activeControls.filter((control) => control.ownerId !== null && owners.get(control.ownerId)?.active === true).length,
        activeControls.length
      ),
      source: 'User, ComplianceControl',
    },
    {
      key: 'accountability',
      label: 'Findings closed by a named verifier',
      weight: 10,
      value: percent(
        actionableFindings.filter((finding) => !isOpenFinding(finding) && finding.closedBy !== null).length,
        actionableFindings.length
      ),
      source: 'AssuranceFinding',
    },
    {
      key: 'workflow',
      label: 'Published workflows that capture evidence and resolve their steps',
      weight: 10,
      value: percent(published.filter((workflow) => workflowIntact(workflow.steps)).length, published.length),
      source: 'WorkflowDefinition',
    },
    {
      key: 'learning',
      label: 'Corrective actions shown to be effective',
      weight: 10,
      value: percent(applicableCapas.filter((capa) => capa.effectivenessCheck === 'effective').length, applicableCapas.length),
      source: 'ImprovementAction',
    },
    {
      key: 'review',
      label: 'Reviews within their cycle',
      weight: 10,
      value: percent(dataset.reviews.filter((review) => review.dueOn >= today).length, dataset.reviews.length),
      source: 'DocumentControl',
    },
  ];

  const weighted = readinessFromParts(
    dimensions.map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      value: dimension.value,
    }))
  ) as { score: number | null; coverage: number };
  const band = readinessBand(weighted.score) as { label: string; tone: string };

  return {
    score: weighted.score,
    coverage: weighted.coverage,
    label: band.label,
    tone: band.tone,
    dimensions,
    asAt: today,
  };
}