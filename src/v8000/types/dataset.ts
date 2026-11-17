import type { IsoDateTime, Provenance } from './common.ts';
import type { Framework, Outcome, Requirement, Standard } from './framework.ts';
import type { Owner } from './owner.ts';
import type {
  Assessment,
  Audit,
  Capa,
  Competency,
  Control,
  Finding,
  Policy,
  Procedure,
  Training,
} from './compliance.ts';
import type { Evidence } from './evidence.ts';
import type { Review } from './review.ts';
import type { RiskRecord } from './risk.ts';
import type { WorkflowDefinition, WorkflowInstance } from './workflow.ts';

/** What produced a dataset, so provenance can be stated wherever it is reported. */
export interface DatasetMeta {
  readonly key: string;
  readonly label: string;
  readonly seed: number;
  readonly builtOn: IsoDateTime;
  readonly provenance: Provenance;
  readonly synthetic: boolean;
  readonly note: string;
}

/**
 * The complete Phase 1 dataset. One shape, assembled by fixtures, so every validator and runner
 * works on the same object and a fixture can be swapped without touching the checks.
 * Collections are arrays, not maps: order is stable and diffable in tests.
 */
export interface V8000Dataset {
  readonly meta: DatasetMeta;
  readonly frameworks: readonly Framework[];
  readonly standards: readonly Standard[];
  readonly requirements: readonly Requirement[];
  readonly outcomes: readonly Outcome[];
  readonly owners: readonly Owner[];
  readonly policies: readonly Policy[];
  readonly procedures: readonly Procedure[];
  readonly training: readonly Training[];
  readonly competencies: readonly Competency[];
  readonly assessments: readonly Assessment[];
  readonly controls: readonly Control[];
  readonly evidence: readonly Evidence[];
  readonly audits: readonly Audit[];
  readonly findings: readonly Finding[];
  readonly capas: readonly Capa[];
  readonly workflows: readonly WorkflowDefinition[];
  readonly instances: readonly WorkflowInstance[];
  readonly reviews: readonly Review[];
  readonly risks: readonly RiskRecord[];
}

/** Every collection key, typed. Used by the dataset runner and the health runner. */
export type DatasetCollection = Exclude<keyof V8000Dataset, 'meta'>;

export const DATASET_COLLECTIONS: readonly DatasetCollection[] = [
  'frameworks',
  'standards',
  'requirements',
  'outcomes',
  'owners',
  'policies',
  'procedures',
  'training',
  'competencies',
  'assessments',
  'controls',
  'evidence',
  'audits',
  'findings',
  'capas',
  'workflows',
  'instances',
  'reviews',
  'risks',
];