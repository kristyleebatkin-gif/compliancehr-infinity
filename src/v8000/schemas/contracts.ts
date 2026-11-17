import type { z } from 'zod';
import type {
  Assessment,
  Audit,
  Capa,
  Competency,
  Control,
  Evidence,
  Finding,
  Framework,
  Outcome,
  Owner,
  Policy,
  Procedure,
  Requirement,
  Review,
  RiskRecord,
  Standard,
  Training,
  V8000Dataset,
  WorkflowDefinition,
  WorkflowInstance,
} from '../types/index.ts';
import { frameworkSchema, standardSchema } from './framework.ts';
import { requirementSchema } from './requirement.ts';
import { outcomeSchema } from './outcome.ts';
import { controlSchema } from './control.ts';
import { policySchema } from './policy.ts';
import { procedureSchema } from './procedure.ts';
import { trainingSchema } from './training.ts';
import { competencySchema } from './competency.ts';
import { evidenceSchema } from './evidence.ts';
import { assessmentSchema } from './assessment.ts';
import { auditSchema } from './audit.ts';
import { findingSchema } from './finding.ts';
import { capaSchema } from './capa.ts';
import { ownerSchema } from './owner.ts';
import { reviewSchema } from './review.ts';
import { riskRecordSchema } from './risk.ts';
import { workflowDefinitionSchema, workflowInstanceSchema } from './workflow.ts';
import { v8000DatasetSchema } from './dataset.ts';

/**
 * Compile-time contracts between the domain types and the Zod schemas.
 *
 * Each line says: whatever the schema produces must be a valid member of the domain type.
 * If a field is renamed, dropped or widened on one side only, `npm run typecheck:v8000` fails
 * here instead of a runner failing at runtime on a field that silently became `undefined`.
 */
export const frameworkContract: Framework = null as unknown as z.infer<typeof frameworkSchema>;
export const standardContract: Standard = null as unknown as z.infer<typeof standardSchema>;
export const requirementContract: Requirement = null as unknown as z.infer<typeof requirementSchema>;
export const outcomeContract: Outcome = null as unknown as z.infer<typeof outcomeSchema>;
export const controlContract: Control = null as unknown as z.infer<typeof controlSchema>;
export const policyContract: Policy = null as unknown as z.infer<typeof policySchema>;
export const procedureContract: Procedure = null as unknown as z.infer<typeof procedureSchema>;
export const trainingContract: Training = null as unknown as z.infer<typeof trainingSchema>;
export const competencyContract: Competency = null as unknown as z.infer<typeof competencySchema>;
export const evidenceContract: Evidence = null as unknown as z.infer<typeof evidenceSchema>;
export const assessmentContract: Assessment = null as unknown as z.infer<typeof assessmentSchema>;
export const auditContract: Audit = null as unknown as z.infer<typeof auditSchema>;
export const findingContract: Finding = null as unknown as z.infer<typeof findingSchema>;
export const capaContract: Capa = null as unknown as z.infer<typeof capaSchema>;
export const ownerContract: Owner = null as unknown as z.infer<typeof ownerSchema>;
export const reviewContract: Review = null as unknown as z.infer<typeof reviewSchema>;
export const riskContract: RiskRecord = null as unknown as z.infer<typeof riskRecordSchema>;
export const workflowContract: WorkflowDefinition = null as unknown as z.infer<typeof workflowDefinitionSchema>;
export const instanceContract: WorkflowInstance = null as unknown as z.infer<typeof workflowInstanceSchema>;
export const datasetContract: V8000Dataset = null as unknown as z.infer<typeof v8000DatasetSchema>;