import type { ZodType } from 'zod';
import type { DatasetCollection, RecordId, V8000Dataset } from '../types/index.ts';
import { DATASET_COLLECTIONS } from '../types/index.ts';
import { frameworkSchema, standardSchema } from '../schemas/framework.ts';
import { requirementSchema } from '../schemas/requirement.ts';
import { outcomeSchema } from '../schemas/outcome.ts';
import { ownerSchema } from '../schemas/owner.ts';
import { policySchema } from '../schemas/policy.ts';
import { procedureSchema } from '../schemas/procedure.ts';
import { trainingSchema } from '../schemas/training.ts';
import { competencySchema } from '../schemas/competency.ts';
import { assessmentSchema } from '../schemas/assessment.ts';
import { controlSchema } from '../schemas/control.ts';
import { evidenceSchema } from '../schemas/evidence.ts';
import { auditSchema } from '../schemas/audit.ts';
import { findingSchema } from '../schemas/finding.ts';
import { capaSchema } from '../schemas/capa.ts';
import { workflowDefinitionSchema, workflowInstanceSchema } from '../schemas/workflow.ts';
import { reviewSchema } from '../schemas/review.ts';
import { riskRecordSchema } from '../schemas/risk.ts';

const SCHEMAS: Readonly<Record<DatasetCollection, ZodType>> = {
  frameworks: frameworkSchema,
  standards: standardSchema,
  requirements: requirementSchema,
  outcomes: outcomeSchema,
  owners: ownerSchema,
  policies: policySchema,
  procedures: procedureSchema,
  training: trainingSchema,
  competencies: competencySchema,
  assessments: assessmentSchema,
  controls: controlSchema,
  evidence: evidenceSchema,
  audits: auditSchema,
  findings: findingSchema,
  capas: capaSchema,
  workflows: workflowDefinitionSchema,
  instances: workflowInstanceSchema,
  reviews: reviewSchema,
  risks: riskRecordSchema,
};

export interface SchemaIssue {
  readonly collection: DatasetCollection;
  readonly index: number;
  readonly id: RecordId | null;
  readonly message: string;
}

export interface CollectionReport {
  readonly collection: DatasetCollection;
  readonly records: number;
  readonly schemaIssues: readonly SchemaIssue[];
  readonly duplicateIds: readonly RecordId[];
}

export interface DatasetReport {
  readonly datasetKey: string;
  readonly valid: boolean;
  readonly totalRecords: number;
  readonly collections: readonly CollectionReport[];
  readonly schemaIssueCount: number;
  readonly duplicateCount: number;
  readonly emptyCollections: readonly DatasetCollection[];
}

/**
 * Structural integrity of the dataset: every record parses against its schema, no collection
 * holds a duplicate id, and the collections that must have content are reported when empty.
 * A record is checked even if another record in the same collection is broken, so the report
 * lists every problem in one pass.
 */
export function runDatasetChecks(dataset: V8000Dataset): DatasetReport {
  const collections: CollectionReport[] = DATASET_COLLECTIONS.map((collection) => {
    const rows = dataset[collection] as readonly { readonly id?: unknown }[];
    const schemaIssues: SchemaIssue[] = [];
    const seen = new Set<string>();
    const duplicateIds: RecordId[] = [];

    rows.forEach((row, index) => {
      const id = typeof row.id === 'string' ? row.id : null;
      if (id !== null) {
        if (seen.has(id) && !duplicateIds.includes(id)) duplicateIds.push(id);
        seen.add(id);
      }
      const parsed = SCHEMAS[collection].safeParse(row);
      if (!parsed.success) {
        schemaIssues.push({
          collection,
          index,
          id,
          message: parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('; '),
        });
      }
    });

    return { collection, records: rows.length, schemaIssues, duplicateIds };
  });

  const schemaIssueCount = collections.reduce((sum, item) => sum + item.schemaIssues.length, 0);
  const duplicateCount = collections.reduce((sum, item) => sum + item.duplicateIds.length, 0);

  return {
    datasetKey: dataset.meta.key,
    valid: schemaIssueCount === 0 && duplicateCount === 0,
    totalRecords: collections.reduce((sum, item) => sum + item.records, 0),
    collections,
    schemaIssueCount,
    duplicateCount,
    emptyCollections: collections.filter((item) => item.records === 0).map((item) => item.collection),
  };
}