import type {
  Cadence,
  ControlType,
  FrameworkCode,
  IsoDate,
  RecordId,
  Severity,
} from './common.ts';

/** An approved position statement. Controls point at the policy that authorises them. */
export interface Policy {
  readonly id: RecordId;
  readonly title: string;
  readonly framework: FrameworkCode;
  readonly standardCodes: readonly string[];
  readonly version: string;
  readonly approvedBy: string | null;
  readonly approvedOn: IsoDate | null;
  readonly reviewDue: IsoDate;
  readonly status: 'draft' | 'active' | 'retired';
}

/** The steps a worker follows. A procedure with no steps is not usable evidence of practice. */
export interface Procedure {
  readonly id: RecordId;
  readonly policyId: RecordId | null;
  readonly title: string;
  readonly steps: readonly string[];
  readonly ownerRole: string;
  readonly reviewDue: IsoDate;
  readonly status: 'draft' | 'active' | 'retired';
}

/** A training product. It does not by itself prove anyone is competent. */
export interface Training {
  readonly id: RecordId;
  readonly title: string;
  readonly moduleCode: string;
  readonly mandatedBy: readonly string[];
  readonly refresherMonths: number | null;
  readonly ownerRole: string;
  readonly status: 'draft' | 'active' | 'retired';
}

/** A named person's assessed competency, with the date it lapses. */
export interface Competency {
  readonly id: RecordId;
  readonly trainingId: RecordId;
  readonly holder: string;
  readonly role: string;
  readonly required: boolean;
  readonly assessedOn: IsoDate | null;
  readonly expiresOn: IsoDate | null;
  readonly assessor: string | null;
}

/** A point-in-time test of a control. The `score` is the tested sample's pass rate. */
export interface Assessment {
  readonly id: RecordId;
  readonly controlId: RecordId;
  readonly assessedOn: IsoDate;
  readonly assessor: string;
  readonly method: 'walkthrough' | 'record_review' | 'observation' | 'sampling' | 'system_export';
  readonly sampleSize: number;
  readonly score: number | null;
  readonly findings: number;
}

/** What the business actually does to meet its requirements. The chain's middle link. */
export interface Control {
  readonly id: RecordId;
  readonly requirementIds: readonly RecordId[];
  readonly framework: FrameworkCode;
  readonly statement: string;
  readonly type: ControlType;
  readonly cadence: Cadence;
  readonly ownerId: RecordId | null;
  readonly policyId: RecordId | null;
  readonly procedureIds: readonly RecordId[];
  readonly trainingIds: readonly RecordId[];
  readonly evidenceRequired: boolean;
  readonly lastTestedOn: IsoDate | null;
  readonly nextTestOn: IsoDate | null;
  readonly status: 'draft' | 'active' | 'under_review' | 'retired';
}

/** An audit event. Independence is recorded because self-assessment is weaker assurance. */
export interface Audit {
  readonly id: RecordId;
  readonly framework: FrameworkCode;
  readonly scope: string;
  readonly standardIds: readonly RecordId[];
  readonly plannedFor: IsoDate;
  readonly completedOn: IsoDate | null;
  readonly auditor: string;
  readonly independence: 'internal' | 'external' | 'desk';
  readonly method: 'document_review' | 'interview' | 'observation' | 'sampling' | 'site_visit';
  readonly status: 'planned' | 'in_progress' | 'complete' | 'cancelled';
}

/** A raised non-conformity, observation or opportunity for improvement. */
export interface Finding {
  readonly id: RecordId;
  readonly auditId: RecordId | null;
  readonly controlId: RecordId | null;
  readonly standardId: RecordId | null;
  readonly title: string;
  readonly rating:
    | 'conformity'
    | 'minor_nonconformity'
    | 'major_nonconformity'
    | 'observation'
    | 'opportunity';
  readonly severity: Severity;
  readonly source: 'internal_audit' | 'external_audit' | 'desk_review' | 'spot_check' | 'incident' | 'complaint';
  readonly detail: string;
  readonly rootCause: string;
  readonly ownerId: RecordId;
  readonly raisedOn: IsoDate;
  readonly dueOn: IsoDate;
  readonly status: 'open' | 'in_progress' | 'verification' | 'closed';
  readonly closedOn: IsoDate | null;
  readonly closedBy: string | null;
}

/** Corrective or preventive action. Closure requires an effectiveness check, not just completion. */
export interface Capa {
  readonly id: RecordId;
  readonly findingId: RecordId;
  readonly type: 'corrective' | 'preventive';
  readonly action: string;
  readonly ownerId: RecordId;
  readonly dueOn: IsoDate;
  readonly completedOn: IsoDate | null;
  readonly effectivenessCheck: 'pending' | 'effective' | 'ineffective' | 'not_required';
  readonly verifiedBy: string | null;
}