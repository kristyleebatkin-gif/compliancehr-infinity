import { z } from 'zod';
import type {
  Cadence,
  ControlType,
  Dimension,
  EntityName,
  FrameworkCode,
  Provenance,
  Severity,
  VerificationStatus,
} from '../types/index.ts';

/**
 * Shared Zod primitives. Domain schemas are built only from these, so a format change
 * (a new severity, a stricter id) lands in one place.
 */

export const FRAMEWORK_CODES = ['NDIS', 'AGED_CARE', 'ISO_9001', 'ISO_27001', 'NSQHS', 'HSQF', 'FAIR_WORK'] as const satisfies readonly FrameworkCode[];

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const satisfies readonly Severity[];

export const CADENCES = [
  'continuous',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
  'event_driven',
] as const satisfies readonly Cadence[];

export const CONTROL_TYPES = ['preventive', 'detective', 'corrective'] as const satisfies readonly ControlType[];

export const PROVENANCES = ['reference', 'fixture', 'recorded', 'derived'] as const satisfies readonly Provenance[];

export const VERIFICATION_STATUSES = [
  'unverified',
  'in_review',
  'verified',
  'rejected',
  'expired',
] as const satisfies readonly VerificationStatus[];

export const ENTITY_NAMES = [
  'framework',
  'standard',
  'requirement',
  'outcome',
  'control',
  'policy',
  'procedure',
  'training',
  'competency',
  'assessment',
  'evidence',
  'audit',
  'finding',
  'capa',
  'owner',
  'workflow',
  'workflow_instance',
  'review',
  'risk',
] as const satisfies readonly EntityName[];

export const DIMENSION_NAMES = [
  'reference',
  'framework',
  'owner',
  'workflow',
  'review',
  'evidence',
  'audit',
  'finding',
  'capa',
  'trust',
  'gap',
  'traceability',
  'integrity',
] as const satisfies readonly Dimension[];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

const isRealDate = (value: string): boolean => {
  const parsed = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed)) return false;
  return new Date(parsed).toISOString().slice(0, 10) === value;
};

/** Readable slug ids keep fixtures diagnosable and survive a JSON round trip. */
export const idSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, 'ids are slugs containing letters, digits, dot, colon, underscore or hyphen');

export const isoDateSchema = z
  .string()
  .regex(DATE, 'expected YYYY-MM-DD')
  .refine(isRealDate, 'not a real calendar date');

export const isoDateTimeSchema = z.string().regex(DATE_TIME, 'expected an ISO instant ending in Z');

export const severitySchema = z.enum(SEVERITIES);
export const frameworkCodeSchema = z.enum(FRAMEWORK_CODES);
export const cadenceSchema = z.enum(CADENCES);
export const controlTypeSchema = z.enum(CONTROL_TYPES);
export const provenanceSchema = z.enum(PROVENANCES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export const entityNameSchema = z.enum(ENTITY_NAMES);

export const entityRefSchema = z.object({
  type: entityNameSchema,
  id: idSchema,
});

/** A stored percentage. `null` is not measured and is never coerced to zero. */
export const percentSchema = z.number().min(0).max(100);

export const confidenceSchema = z.number().min(0).max(100);

/** Rules that a plain shape cannot express are named here once and reused. */
export function orderedDates(from: string, to: string | null): boolean {
  return to === null || from <= to;
}

export const checkStatusSchema = z.enum(['pass', 'fail', 'warn']);

export const checkResultSchema = z.object({
  id: idSchema,
  dimension: z.enum(DIMENSION_NAMES),
  severity: severitySchema,
  status: checkStatusSchema,
  title: z.string().min(1),
  detail: z.string().min(1),
  count: z.number().int().min(0),
  refs: z.array(entityRefSchema),
});

export const validationSummarySchema = z.object({
  total: z.number().int().min(0),
  passed: z.number().int().min(0),
  failed: z.number().int().min(0),
  warned: z.number().int().min(0),
  results: z.array(checkResultSchema),
  blocking: z.array(checkResultSchema),
});

export type SeverityInput = z.infer<typeof severitySchema>;