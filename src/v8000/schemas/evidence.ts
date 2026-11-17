import { z } from 'zod';
import { confidenceSchema, idSchema, isoDateSchema, verificationStatusSchema } from './base.ts';
import { orderedDates } from './base.ts';

export const EVIDENCE_TYPES = [
  'document',
  'record',
  'register_extract',
  'photo',
  'sign_off',
  'system_export',
  'certificate',
  'training_record',
  'minutes',
  'other',
] as const;

/** Schema for `Evidence`. Validity must run forwards; a reversed window is rejected outright. */
export const evidenceSchema = z
  .object({
    id: idSchema,
    controlId: idSchema.nullable(),
    requirementId: idSchema.nullable(),
    title: z.string().min(1),
    type: z.enum(EVIDENCE_TYPES),
    source: z.string().min(1),
    ownerId: idSchema.nullable(),
    collectedOn: isoDateSchema,
    validFrom: isoDateSchema,
    validTo: isoDateSchema.nullable(),
    confidence: confidenceSchema,
    verificationStatus: verificationStatusSchema,
    verifiedBy: z.string().min(1).nullable(),
    verifiedOn: isoDateSchema.nullable(),
    fileRef: z.string().min(1).nullable(),
    provenance: z.enum(['recorded', 'fixture']),
  })
  .refine((value) => orderedDates(value.validFrom, value.validTo), {
    message: 'validTo cannot precede validFrom',
    path: ['validTo'],
  });