import type {
  Assessment,
  Audit,
  Capa,
  Competency,
  Control,
  EntityName,
  EntityRef,
  Finding,
  Framework,
  Outcome,
  Owner,
  Policy,
  Procedure,
  RecordId,
  Requirement,
  Review,
  RiskRecord,
  Standard,
  Training,
  V8000Dataset,
  WorkflowDefinition,
  WorkflowInstance,
  Evidence,
} from '../types/index.ts';

/** Id → record maps for one dataset. Built once per runner; never kept on the dataset itself. */
export interface DatasetLookup {
  readonly frameworks: ReadonlyMap<RecordId, Framework>;
  readonly standards: ReadonlyMap<RecordId, Standard>;
  readonly requirements: ReadonlyMap<RecordId, Requirement>;
  readonly outcomes: ReadonlyMap<RecordId, Outcome>;
  readonly owners: ReadonlyMap<RecordId, Owner>;
  readonly policies: ReadonlyMap<RecordId, Policy>;
  readonly procedures: ReadonlyMap<RecordId, Procedure>;
  readonly training: ReadonlyMap<RecordId, Training>;
  readonly competencies: ReadonlyMap<RecordId, Competency>;
  readonly assessments: ReadonlyMap<RecordId, Assessment>;
  readonly controls: ReadonlyMap<RecordId, Control>;
  readonly evidence: ReadonlyMap<RecordId, Evidence>;
  readonly audits: ReadonlyMap<RecordId, Audit>;
  readonly findings: ReadonlyMap<RecordId, Finding>;
  readonly capas: ReadonlyMap<RecordId, Capa>;
  readonly workflows: ReadonlyMap<RecordId, WorkflowDefinition>;
  readonly instances: ReadonlyMap<RecordId, WorkflowInstance>;
  readonly reviews: ReadonlyMap<RecordId, Review>;
  readonly risks: ReadonlyMap<RecordId, RiskRecord>;
}

/**
 * A duplicate id inside a collection makes every reference ambiguous, so indexing refuses it
 * rather than silently keeping the last record. The dataset runner reports duplicates.
 */
function indexCollection<T extends { readonly id: RecordId }>(
  rows: readonly T[],
  collection: string
): ReadonlyMap<RecordId, T> {
  const map = new Map<RecordId, T>();
  rows.forEach((row) => {
    if (map.has(row.id)) throw new Error(`Duplicate id ${row.id} in ${collection}`);
    map.set(row.id, row);
  });
  return map;
}

export function indexDataset(dataset: V8000Dataset): DatasetLookup {
  return {
    frameworks: indexCollection(dataset.frameworks, 'frameworks'),
    standards: indexCollection(dataset.standards, 'standards'),
    requirements: indexCollection(dataset.requirements, 'requirements'),
    outcomes: indexCollection(dataset.outcomes, 'outcomes'),
    owners: indexCollection(dataset.owners, 'owners'),
    policies: indexCollection(dataset.policies, 'policies'),
    procedures: indexCollection(dataset.procedures, 'procedures'),
    training: indexCollection(dataset.training, 'training'),
    competencies: indexCollection(dataset.competencies, 'competencies'),
    assessments: indexCollection(dataset.assessments, 'assessments'),
    controls: indexCollection(dataset.controls, 'controls'),
    evidence: indexCollection(dataset.evidence, 'evidence'),
    audits: indexCollection(dataset.audits, 'audits'),
    findings: indexCollection(dataset.findings, 'findings'),
    capas: indexCollection(dataset.capas, 'capas'),
    workflows: indexCollection(dataset.workflows, 'workflows'),
    instances: indexCollection(dataset.instances, 'instances'),
    reviews: indexCollection(dataset.reviews, 'reviews'),
    risks: indexCollection(dataset.risks, 'risks'),
  };
}

/**
 * Id sets for every entity type, for reference resolution. Built from the raw arrays, so a
 * duplicate id is counted once rather than crashing a report.
 */
export type IdSets = Readonly<Record<EntityName, ReadonlySet<RecordId>>>;

export function buildIdSets(dataset: V8000Dataset): IdSets {
  const ids = (rows: readonly { readonly id: RecordId }[]): ReadonlySet<RecordId> => new Set(rows.map((row) => row.id));
  return {
    framework: ids(dataset.frameworks),
    standard: ids(dataset.standards),
    requirement: ids(dataset.requirements),
    outcome: ids(dataset.outcomes),
    control: ids(dataset.controls),
    policy: ids(dataset.policies),
    procedure: ids(dataset.procedures),
    training: ids(dataset.training),
    competency: ids(dataset.competencies),
    assessment: ids(dataset.assessments),
    evidence: ids(dataset.evidence),
    audit: ids(dataset.audits),
    finding: ids(dataset.findings),
    capa: ids(dataset.capas),
    owner: ids(dataset.owners),
    workflow: ids(dataset.workflows),
    workflow_instance: ids(dataset.instances),
    review: ids(dataset.reviews),
    risk: ids(dataset.risks),
  };
}

export function refExists(sets: IdSets, ref: EntityRef): boolean {
  return sets[ref.type].has(ref.id);
}

/** Last-wins index for reporting paths that must not throw on a duplicated id. */
export function safeIndex<T extends { readonly id: RecordId }>(rows: readonly T[]): ReadonlyMap<RecordId, T> {
  const map = new Map<RecordId, T>();
  rows.forEach((row) => map.set(row.id, row));
  return map;
}

/** A control that still imposes an obligation. Retired controls are history, not gaps. */
export function isActiveControl(control: Control): boolean {
  return control.status === 'active' || control.status === 'under_review';
}

const CLOSED_FINDING_STATES: readonly Finding['status'][] = ['closed'];

export function isOpenFinding(finding: Finding): boolean {
  return !CLOSED_FINDING_STATES.includes(finding.status);
}

export function isHighFinding(finding: Finding): boolean {
  return finding.rating === 'major_nonconformity' || finding.severity === 'critical' || finding.severity === 'high';
}