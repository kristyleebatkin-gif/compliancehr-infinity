import type { CheckResult, IsoDate, V8000Dataset, WorkflowDefinition } from '../types/index.ts';
import { OPEN_INSTANCE_STATES } from '../types/index.ts';
import { safeIndex } from '../lib/datasetIndex.ts';
import { evaluate, ref } from './result.ts';

/** Depth-first cycle detection over a definition's next-step pointers. */
function detectCycle(definition: WorkflowDefinition): readonly string[] | null {
  const byId = new Map(definition.steps.map((step) => [step.id, step]));
  const visiting = new Set<string>();
  const done = new Set<string>();
  const found: { cycle: readonly string[] | null } = { cycle: null };

  const walk = (id: string, trail: readonly string[]): void => {
    if (found.cycle) return;
    if (visiting.has(id)) {
      const start = trail.indexOf(id);
      found.cycle = [...(start >= 0 ? trail.slice(start) : trail), id];
      return;
    }
    if (done.has(id)) return;
    visiting.add(id);
    const step = byId.get(id);
    (step?.next ?? []).forEach((next) => {
      if (byId.has(next)) walk(next, [...trail, id]);
    });
    visiting.delete(id);
    done.add(id);
  };

  definition.steps.forEach((step) => walk(step.id, []));
  return found.cycle;
}

/** Workflow health: the definition resolves, captures evidence, and its runs are on time. */
export function workflowValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const definitions = safeIndex(dataset.workflows);

  const brokenPointers = dataset.workflows.filter((workflow) =>
    workflow.steps.some((step) => step.next.some((next) => !workflow.steps.some((candidate) => candidate.id === next)))
  );
  const cyclic = dataset.workflows
    .map((workflow) => ({ workflow, cycle: detectCycle(workflow) }))
    .filter((item): item is { workflow: WorkflowDefinition; cycle: readonly string[] } => item.cycle !== null);
  const noEvidenceStep = dataset.workflows.filter(
    (workflow) => workflow.published && !workflow.steps.some((step) => step.kind === 'evidence')
  );
  const openInstances = dataset.instances.filter((instance) => OPEN_INSTANCE_STATES.includes(instance.state));
  const overdue = openInstances.filter((instance) => instance.dueOn < today);
  const unknownStep = dataset.instances.filter((instance) => {
    const definition = definitions.get(instance.definitionId);
    return definition !== undefined && !definition.steps.some((step) => step.id === instance.currentNodeId);
  });
  const unpublishedRuns = dataset.instances.filter((instance) => {
    const definition = definitions.get(instance.definitionId);
    return definition !== undefined && !definition.published;
  });
  const duplicateCodes = dataset.workflows.filter(
    (workflow) => dataset.workflows.filter((other) => other.code === workflow.code).length > 1
  );

  return [
    evaluate(
      {
        id: 'workflow.broken-next',
        dimension: 'workflow',
        severity: 'high',
        title: 'Workflow steps pointing at a step that does not exist',
        detail: 'A broken pointer leaves a run with nowhere to go.',
      },
      brokenPointers.map((workflow) => ref('workflow', workflow.id))
    ),
    evaluate(
      {
        id: 'workflow.cycle',
        dimension: 'workflow',
        severity: 'high',
        title: 'Workflow definitions with a cycle',
        detail: 'A workflow that can return to an earlier step never completes on its own.',
      },
      cyclic.map((item) => ref('workflow', item.workflow.id))
    ),
    evaluate(
      {
        id: 'workflow.no-evidence-step',
        dimension: 'workflow',
        severity: 'medium',
        title: 'Published workflows that never capture evidence',
        detail: 'A process that does not ask for evidence cannot produce assurance.',
        statusWhenFound: 'warn',
      },
      noEvidenceStep.map((workflow) => ref('workflow', workflow.id))
    ),
    evaluate(
      {
        id: 'workflow.instance-overdue',
        dimension: 'workflow',
        severity: 'high',
        title: 'Open workflow runs past their due date',
        detail: 'The run is still open after the SLA its definition sets.',
      },
      overdue.map((instance) => ref('workflow_instance', instance.id))
    ),
    evaluate(
      {
        id: 'workflow.instance-unknown-step',
        dimension: 'workflow',
        severity: 'high',
        title: 'Workflow runs sitting on a step outside their definition',
        detail: 'The run cannot be advanced against the definition it claims to follow.',
      },
      unknownStep.map((instance) => ref('workflow_instance', instance.id))
    ),
    evaluate(
      {
        id: 'workflow.instance-unpublished',
        dimension: 'workflow',
        severity: 'medium',
        title: 'Runs opened against an unpublished definition',
        detail: 'Only a published workflow should start a run.',
      },
      unpublishedRuns.map((instance) => ref('workflow_instance', instance.id))
    ),
    evaluate(
      {
        id: 'workflow.duplicate-code',
        dimension: 'workflow',
        severity: 'medium',
        title: 'Workflow definitions sharing a code',
        detail: 'Two definitions with the same code make reporting and permissions ambiguous.',
      },
      duplicateCodes.map((workflow) => ref('workflow', workflow.id))
    ),
  ];
}