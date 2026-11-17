import { z } from 'zod';
import { idSchema, isoDateTimeSchema, provenanceSchema } from './base.ts';
import { frameworkSchema, standardSchema } from './framework.ts';
import { requirementSchema } from './requirement.ts';
import { outcomeSchema } from './outcome.ts';
import { ownerSchema } from './owner.ts';
import { policySchema } from './policy.ts';
import { procedureSchema } from './procedure.ts';
import { trainingSchema } from './training.ts';
import { competencySchema } from './competency.ts';
import { assessmentSchema } from './assessment.ts';
import { controlSchema } from './control.ts';
import { evidenceSchema } from './evidence.ts';
import { auditSchema } from './audit.ts';
import { findingSchema } from './finding.ts';
import { capaSchema } from './capa.ts';
import { workflowDefinitionSchema, workflowInstanceSchema } from './workflow.ts';
import { reviewSchema } from './review.ts';
import { riskRecordSchema } from './risk.ts';

/** Schema for `DatasetMeta`. */
export const datasetMetaSchema = z.object({
  key: idSchema,
  label: z.string().min(1),
  seed: z.number().int(),
  builtOn: isoDateTimeSchema,
  provenance: provenanceSchema,
  synthetic: z.boolean(),
  note: z.string().min(1),
});

/**
 * Schema for the assembled `V8000Dataset`. Cross-record integrity (do the references resolve,
 * are the ids unique) is not expressible here: that is the dataset runner's job, because it has
 * to report every offending record rather than reject the first one.
 */
export const v8000DatasetSchema = z.object({
  meta: datasetMetaSchema,
  frameworks: z.array(frameworkSchema),
  standards: z.array(standardSchema),
  requirements: z.array(requirementSchema),
  outcomes: z.array(outcomeSchema),
  owners: z.array(ownerSchema),
  policies: z.array(policySchema),
  procedures: z.array(procedureSchema),
  training: z.array(trainingSchema),
  competencies: z.array(competencySchema),
  assessments: z.array(assessmentSchema),
  controls: z.array(controlSchema),
  evidence: z.array(evidenceSchema),
  audits: z.array(auditSchema),
  findings: z.array(findingSchema),
  capas: z.array(capaSchema),
  workflows: z.array(workflowDefinitionSchema),
  instances: z.array(workflowInstanceSchema),
  reviews: z.array(reviewSchema),
  risks: z.array(riskRecordSchema),
});