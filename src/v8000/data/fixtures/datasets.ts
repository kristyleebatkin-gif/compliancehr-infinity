import type { DatasetMeta, V8000Dataset } from '../../types/index.ts';
import { FIXTURE_BUILT_ON, FIXTURE_TODAY, makeEvidence, makeOwner, makeStep, makeWorkflow, resetFixtureIds } from './factories.ts';
import { buildReferenceSet } from './reference.ts';
import { buildOperations, WORKFLOW_IDS } from './operations.ts';

/** Fixed seeds, so a fixture change is a deliberate diff rather than random churn. */
export const SEEDS = { baseline: 44, degraded: 44, empty: 0 } as const;

/** The dataset fixture set was assembled against this date. Runners still take `today`. */
export const DATASET_TODAY = FIXTURE_TODAY;

function meta(key: string, label: string, note: string, seed: number): DatasetMeta {
  return {
    key,
    label,
    seed,
    builtOn: FIXTURE_BUILT_ON,
    provenance: 'fixture',
    synthetic: true,
    note,
  };
}

/**
 * The baseline dataset: a small but complete provider with two frameworks, both in a realistic
 * condition. It contains named defects on purpose (see operations.ts) so every validator has
 * something real to find and nothing is asserted that the data does not support.
 */
export function buildBaselineDataset(): V8000Dataset {
  resetFixtureIds();
  return {
    meta: meta(
      'baseline',
      'Baseline provider dataset',
      'Synthetic two-framework provider used for Phase 1 validation. Not client data.',
      SEEDS.baseline
    ),
    ...buildReferenceSet(),
    ...buildOperations(),
  };
}

/** A business with the registers connected but nothing in them yet. */
export function buildEmptyDataset(): V8000Dataset {
  resetFixtureIds();
  return {
    meta: meta('empty', 'Empty dataset', 'No records: every measure must report as not measured.', SEEDS.empty),
    frameworks: [],
    standards: [],
    requirements: [],
    outcomes: [],
    owners: [],
    policies: [],
    procedures: [],
    training: [],
    competencies: [],
    assessments: [],
    controls: [],
    evidence: [],
    audits: [],
    findings: [],
    capas: [],
    workflows: [],
    instances: [],
    reviews: [],
    risks: [],
  };
}

/**
 * A dataset that is broken on purpose in every way the dataset runner must catch: duplicate ids,
 * references to records that do not exist, a workflow cycle, and an instance sitting on a step
 * that is not in its definition. Used to prove the checks fail loudly rather than pass quietly.
 */
export function buildDegradedDataset(): V8000Dataset {
  const base = buildBaselineDataset();

  const duplicateOwner = makeOwner({ id: base.owners[0]?.id ?? 'own-duplicate', name: 'Duplicate record' });
  const brokenControl = {
    ...(base.controls[0] ?? {
      id: 'ctl-broken',
      requirementIds: [],
      framework: 'NDIS' as const,
      statement: 'Placeholder control',
      type: 'preventive' as const,
      cadence: 'monthly' as const,
      ownerId: null,
      policyId: null,
      procedureIds: [],
      trainingIds: [],
      evidenceRequired: true,
      lastTestedOn: null,
      nextTestOn: null,
      status: 'active' as const,
    }),
    id: 'ctl-unknown-requirement',
    requirementIds: ['req-does-not-exist'],
    ownerId: 'own-does-not-exist',
  };

  const orphanEvidence = makeEvidence({
    id: 'ev-missing-control',
    controlId: 'ctl-does-not-exist',
    title: 'Evidence against a control that does not exist',
  });

  const cyclicWorkflow = makeWorkflow({
    id: 'wf-cyclic',
    code: 'WF-CYC-99',
    name: 'Cyclic workflow',
    steps: [
      makeStep({ id: 'cyc-a', label: 'A', next: ['cyc-b'] }),
      makeStep({ id: 'cyc-b', label: 'B', next: ['cyc-a'] }),
    ],
    published: true,
  });

  return {
    ...base,
    meta: meta('degraded', 'Degraded dataset', 'Deliberately broken records used to prove the checks fail loudly.', SEEDS.degraded),
    owners: [...base.owners, duplicateOwner],
    controls: [...base.controls, brokenControl],
    evidence: [...base.evidence, orphanEvidence],
    workflows: [...base.workflows, cyclicWorkflow],
    instances: [
      ...base.instances,
      {
        id: 'inst-unknown-step',
        definitionId: WORKFLOW_IDS.incident,
        state: 'running',
        currentNodeId: 'step-not-in-definition',
        openedOn: `${FIXTURE_TODAY}T00:00:00.000Z`,
        dueOn: FIXTURE_TODAY,
        closedOn: null,
        subjectRef: { type: 'finding', id: 'fnd-does-not-exist' },
        ownerId: null,
      },
    ],
    reviews: [
      ...base.reviews,
      {
        id: 'rev-missing-subject',
        subjectRef: { type: 'policy', id: 'pol-does-not-exist' },
        title: 'Review of a policy that does not exist',
        type: 'policy',
        cadence: 'annually',
        lastReviewedOn: null,
        dueOn: FIXTURE_TODAY,
        ownerId: null,
        reviewerName: null,
        outcome: 'not_reviewed',
        notes: '',
      },
    ],
    capas: [
      ...base.capas,
      {
        id: 'capa-missing-finding',
        findingId: 'fnd-does-not-exist',
        type: 'corrective',
        action: 'Act on a finding that does not exist.',
        ownerId: 'own-does-not-exist',
        dueOn: FIXTURE_TODAY,
        completedOn: null,
        effectivenessCheck: 'pending',
        verifiedBy: null,
      },
    ],
  };
}