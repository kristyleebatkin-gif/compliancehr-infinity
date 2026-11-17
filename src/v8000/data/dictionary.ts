import type { EntityName } from '../types/index.ts';

/**
 * One field in the Phase 1 data dictionary. `required` means a record without it cannot be
 * validated, not merely that it is nice to have. `mapsTo` names the Base44 entity field the
 * value will be stored in when the record graduates from the Phase 1 dataset to live registers.
 */
export interface FieldDefinition {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
  readonly mapsTo: string | null;
}

export interface EntityDefinition {
  readonly entity: EntityName;
  readonly purpose: string;
  /** The live register this record type writes to, or `null` while it is dataset-only. */
  readonly base44Entity: string | null;
  readonly ownerRule: string;
  readonly fields: readonly FieldDefinition[];
}

const field = (
  name: string,
  type: string,
  required: boolean,
  description: string,
  mapsTo: string | null = null
): FieldDefinition => ({ name, type, required, description, mapsTo });

/**
 * The Phase 1 data dictionary. Every entity the Phase 1 validators read is described here,
 * with its live-register mapping where one exists. `base44Entity: null` marks a record type that
 * is dataset-only in Phase 1 and has no entity yet; that is a known gap, not an omission.
 */
export const DATA_DICTIONARY: readonly EntityDefinition[] = [
  {
    entity: 'framework',
    purpose: 'The regulatory instrument the business is measured against.',
    base44Entity: null,
    ownerRule: 'Set by the compliance administrator; not editable by workers.',
    fields: [
      field('id', 'RecordId', true, 'Readable slug, e.g. ndis.'),
      field('code', 'FrameworkCode', true, 'Union of the seven frameworks the app already models.', 'RegulatoryStandard.framework'),
      field('label', 'string', true, 'Full instrument name.', 'RegulatoryStandard.framework'),
      field('legislation', 'string', true, 'Act or instrument the framework sits under.'),
      field('version', 'string', true, 'Version of the instrument in force.'),
      field('effectiveFrom', 'IsoDate', true, 'Date the version took effect.'),
      field('reviewDue', 'IsoDate', true, 'Date the business must re-read the instrument.'),
    ],
  },
  {
    entity: 'standard',
    purpose: 'A standard or module area inside a framework.',
    base44Entity: 'RegulatoryStandard',
    ownerRule: 'Compliance administrator.',
    fields: [
      field('id', 'RecordId', true, 'Slug unique across the dataset.'),
      field('framework', 'FrameworkCode', true, 'Owning instrument.', 'framework'),
      field('code', 'string', true, 'Citation staff quote, e.g. Core 1.1.', 'standard_code'),
      field('title', 'string', true, 'Standard title.', 'standard_title'),
      field('moduleArea', 'string', true, 'Module the standard sits in.', 'module_area'),
      field('outcome', 'string', false, 'What the standard exists to achieve.', 'outcome'),
      field('effectiveFrom', 'IsoDate', true, 'Effective date.', 'effective_date'),
      field('reviewDue', 'IsoDate', true, 'Next review date.', 'review_date'),
      field('status', 'enum', true, 'draft | active | superseded | retired.', 'status'),
    ],
  },
  {
    entity: 'requirement',
    purpose: 'One obligation inside a standard. The atom of traceability.',
    base44Entity: null,
    ownerRule: 'Compliance manager, with the control owner accountable for meeting it.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('standardId', 'RecordId', true, 'Must resolve to a standard.'),
      field('framework', 'FrameworkCode', true, 'Must equal the standard framework.'),
      field('code', 'string', true, 'Clause reference.'),
      field('obligation', 'string', true, 'Plain-language summary of the duty.'),
      field('requirement', 'string', true, 'The requirement as written.'),
      field('mandatory', 'boolean', true, 'Whether the duty is mandatory.'),
      field('evidenceExpectation', 'string', true, 'What evidence would satisfy it.'),
      field('ownerRole', 'string', true, 'Role accountable for meeting it.'),
    ],
  },
  {
    entity: 'outcome',
    purpose: 'What changes for the person when the requirement is truly met.',
    base44Entity: null,
    ownerRule: 'Accountable owner of the control; clinical lead for care outcomes.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('requirementId', 'RecordId', true, 'Must resolve to a requirement.'),
      field('statement', 'string', true, 'Outcome in the person’s terms.'),
      field('beneficiary', 'enum', true, 'participant | resident | worker | organisation.'),
      field('indicator', 'string', true, 'How the outcome is detected.'),
      field('status', 'enum', true, 'met | partial | not_met | not_measured.'),
      field('source', 'enum', true, 'recorded | derived | none. `none` keeps the status honest.'),
    ],
  },
  {
    entity: 'owner',
    purpose: 'The accountable person for a record set.',
    base44Entity: 'User',
    ownerRule: 'Appointed by the provider administrator.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('name', 'string', true, 'Person’s name.', 'full_name'),
      field('role', 'string', true, 'App role.', 'role'),
      field('department', 'string', true, 'Operating area.'),
      field('email', 'string | null', true, 'Contact address, or null when not recorded.', 'email'),
      field('accountableFor', 'EntityName[]', true, 'Record types this person answers for.'),
      field('active', 'boolean', true, 'Inactive owners cannot hold new controls.'),
    ],
  },
  {
    entity: 'control',
    purpose: 'What the business actually does to meet a requirement.',
    base44Entity: 'ComplianceControl',
    ownerRule: 'Named owner; a control with no owner is reported as a gap.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('requirementIds', 'RecordId[]', true, 'Requirements this control meets.', 'standard_id'),
      field('framework', 'FrameworkCode', true, 'Owning instrument.', 'framework'),
      field('statement', 'string', true, 'What is done, in one sentence.', 'control_statement'),
      field('type', 'ControlType', true, 'preventive | detective | corrective.', 'control_type'),
      field('cadence', 'Cadence', true, 'How often it is evidenced.', 'frequency'),
      field('ownerId', 'RecordId | null', true, 'Accountable owner.', 'owner'),
      field('policyId', 'RecordId | null', true, 'Authorising policy.', 'policy_reference'),
      field('procedureIds', 'RecordId[]', true, 'Procedures workers follow.', 'procedure_reference'),
      field('trainingIds', 'RecordId[]', true, 'Training that supports the control.'),
      field('evidenceRequired', 'boolean', true, 'Whether evidence is mandatory.', 'evidence_required'),
      field('lastTestedOn', 'IsoDate | null', true, 'Last test date.', 'last_tested_date'),
      field('nextTestOn', 'IsoDate | null', true, 'Next test date.', 'next_test_date'),
      field('status', 'enum', true, 'draft | active | under_review | retired.', 'status'),
    ],
  },
  {
    entity: 'policy',
    purpose: 'An approved position statement authorising a control.',
    base44Entity: 'Policy',
    ownerRule: 'Approved by management; owned by the relevant manager.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('title', 'string', true, 'Policy title.', 'title'),
      field('framework', 'FrameworkCode', true, 'Instrument it serves.', 'framework'),
      field('standardCodes', 'string[]', true, 'Standards cited.'),
      field('version', 'string', true, 'Version.'),
      field('approvedBy', 'string | null', true, 'Approver, null when unapproved.'),
      field('approvedOn', 'IsoDate | null', true, 'Approval date.'),
      field('reviewDue', 'IsoDate', true, 'Next review.', 'review_date'),
      field('status', 'enum', true, 'draft | active | retired.', 'status'),
    ],
  },
  {
    entity: 'procedure',
    purpose: 'The steps a worker follows to operate a control.',
    base44Entity: null,
    ownerRule: 'Control owner.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('policyId', 'RecordId | null', true, 'Authorising policy.'),
      field('title', 'string', true, 'Procedure title.'),
      field('steps', 'string[]', true, 'Ordered steps; at least one.'),
      field('ownerRole', 'string', true, 'Role that keeps it current.'),
      field('reviewDue', 'IsoDate', true, 'Next review.'),
      field('status', 'enum', true, 'draft | active | retired.'),
    ],
  },
  {
    entity: 'training',
    purpose: 'A training product required by a framework.',
    base44Entity: 'TrainingModule',
    ownerRule: 'Workforce manager.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('title', 'string', true, 'Module title.', 'title'),
      field('moduleCode', 'string', true, 'Internal module code.', 'code'),
      field('mandatedBy', 'string[]', true, 'Standards that mandate it.'),
      field('refresherMonths', 'number | null', true, 'Refresher interval, null when one-off.'),
      field('ownerRole', 'string', true, 'Role accountable for delivery.'),
      field('status', 'enum', true, 'draft | active | retired.', 'status'),
    ],
  },
  {
    entity: 'competency',
    purpose: 'A named person’s assessed competence, and when it lapses.',
    base44Entity: 'TrainingCompletion',
    ownerRule: 'Workforce manager; evidence held against the worker record.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('trainingId', 'RecordId', true, 'Must resolve to training.'),
      field('holder', 'string', true, 'Worker name.', 'user_name'),
      field('role', 'string', true, 'Role the competency is required for.'),
      field('required', 'boolean', true, 'Whether the role requires it.'),
      field('assessedOn', 'IsoDate | null', true, 'Assessment date.'),
      field('expiresOn', 'IsoDate | null', true, 'Expiry date.'),
      field('assessor', 'string | null', true, 'Who assessed it.'),
    ],
  },
  {
    entity: 'assessment',
    purpose: 'A point-in-time test of a control.',
    base44Entity: 'AuditChecklistFile',
    ownerRule: 'Assessor independent of the control owner where practicable.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('controlId', 'RecordId', true, 'Control tested.'),
      field('assessedOn', 'IsoDate', true, 'Date tested.'),
      field('assessor', 'string', true, 'Who tested it.'),
      field('method', 'enum', true, 'walkthrough | record_review | observation | sampling | system_export.'),
      field('sampleSize', 'number', true, 'Records sampled.'),
      field('score', 'percent | null', true, 'Sample pass rate, null when not scored.'),
      field('findings', 'number', true, 'Findings raised by the test.'),
    ],
  },
  {
    entity: 'evidence',
    purpose: 'A collected artefact offered as proof a control operated.',
    base44Entity: 'AssuranceEvidence',
    ownerRule: 'Control owner; verified by someone else.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('controlId', 'RecordId | null', true, 'Control supported; null is an orphan gap.', 'control_id'),
      field('requirementId', 'RecordId | null', true, 'Requirement supported.'),
      field('title', 'string', true, 'Evidence title.', 'title'),
      field('type', 'enum', true, 'Evidence type.', 'evidence_type'),
      field('source', 'string', true, 'System or location it came from.', 'source'),
      field('ownerId', 'RecordId | null', true, 'Evidence owner.', 'owner'),
      field('collectedOn', 'IsoDate', true, 'Date collected.'),
      field('validFrom', 'IsoDate', true, 'Start of validity.', 'valid_from'),
      field('validTo', 'IsoDate | null', true, 'End of validity.', 'valid_to'),
      field('confidence', 'percent', true, 'Strength of support.', 'confidence'),
      field('verificationStatus', 'VerificationStatus', true, 'Verification position.', 'verification_status'),
      field('verifiedBy', 'string | null', true, 'Verifier.', 'verified_by'),
      field('verifiedOn', 'IsoDate | null', true, 'Verification date.', 'verified_date'),
      field('fileRef', 'string | null', true, 'Private storage URI.', 'file_url'),
      field('provenance', 'enum', true, 'recorded | fixture.'),
    ],
  },
  {
    entity: 'audit',
    purpose: 'An audit event and its independence.',
    base44Entity: 'InternalAudit',
    ownerRule: 'Quality manager schedules; auditor performs.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('framework', 'FrameworkCode', true, 'Instrument audited.'),
      field('scope', 'string', true, 'What was in scope.'),
      field('standardIds', 'RecordId[]', true, 'Standards audited.'),
      field('plannedFor', 'IsoDate', true, 'Planned date.'),
      field('completedOn', 'IsoDate | null', true, 'Completion date.'),
      field('auditor', 'string', true, 'Auditor.'),
      field('independence', 'enum', true, 'internal | external | desk.'),
      field('method', 'enum', true, 'Audit method.'),
      field('status', 'enum', true, 'planned | in_progress | complete | cancelled.'),
    ],
  },
  {
    entity: 'finding',
    purpose: 'A raised non-conformity, observation or opportunity.',
    base44Entity: 'AssuranceFinding',
    ownerRule: 'Action owner named on the day it is raised.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('auditId', 'RecordId | null', true, 'Raising audit.'),
      field('controlId', 'RecordId | null', true, 'Control implicated.'),
      field('standardId', 'RecordId | null', true, 'Standard implicated.'),
      field('title', 'string', true, 'Finding title.', 'title'),
      field('rating', 'enum', true, 'conformity | minor | major | observation | opportunity.', 'rating'),
      field('severity', 'Severity', true, 'Severity used for ranking and gaps.'),
      field('source', 'enum', true, 'Where it came from.', 'source'),
      field('detail', 'string', true, 'What was found.', 'finding_detail'),
      field('rootCause', 'string', true, 'Root cause.', 'root_cause'),
      field('ownerId', 'RecordId', true, 'Action owner.', 'owner'),
      field('raisedOn', 'IsoDate', true, 'Date raised.'),
      field('dueOn', 'IsoDate', true, 'Action due date.', 'due_date'),
      field('status', 'enum', true, 'open | in_progress | verification | closed.', 'status'),
      field('closedOn', 'IsoDate | null', true, 'Closure date.'),
      field('closedBy', 'string | null', true, 'Closure verifier.', 'closure_verified_by'),
    ],
  },
  {
    entity: 'capa',
    purpose: 'Corrective or preventive action with an effectiveness check.',
    base44Entity: 'ImprovementAction',
    ownerRule: 'Action owner; effectiveness verified independently.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('findingId', 'RecordId', true, 'Finding it answers.'),
      field('type', 'enum', true, 'corrective | preventive.'),
      field('action', 'string', true, 'The action taken.'),
      field('ownerId', 'RecordId', true, 'Action owner.'),
      field('dueOn', 'IsoDate', true, 'Due date.'),
      field('completedOn', 'IsoDate | null', true, 'Completion date.'),
      field('effectivenessCheck', 'enum', true, 'pending | effective | ineffective | not_required.'),
      field('verifiedBy', 'string | null', true, 'Who checked effectiveness.'),
    ],
  },
  {
    entity: 'workflow',
    purpose: 'A published process: steps, roles and SLAs.',
    base44Entity: 'WorkflowDefinition',
    ownerRule: 'Process owner; published by an independent publisher.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('code', 'string', true, 'Workflow code.', 'code'),
      field('name', 'string', true, 'Workflow name.', 'name'),
      field('framework', 'FrameworkCode', true, 'Instrument served.'),
      field('domain', 'string', true, 'Operating system.', 'domain'),
      field('steps', 'WorkflowStep[]', true, 'Ordered steps with roles, SLAs and next steps.', 'nodes_json'),
      field('ownerRole', 'string', true, 'Process owner.', 'owner_role'),
      field('slaHours', 'number', true, 'End-to-end target.', 'sla_hours'),
      field('published', 'boolean', true, 'Only published workflows may open instances.'),
    ],
  },
  {
    entity: 'workflow_instance',
    purpose: 'One run of a workflow.',
    base44Entity: 'WorkflowInstance',
    ownerRule: 'Current step role.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('definitionId', 'RecordId', true, 'Definition the run follows.'),
      field('state', 'enum', true, 'running | waiting | paused | escalated | completed | cancelled.', 'state'),
      field('currentNodeId', 'RecordId', true, 'Current step.', 'current_node_id'),
      field('openedOn', 'IsoDateTime', true, 'Opened at.', 'started_at'),
      field('dueOn', 'IsoDate', true, 'Due date.', 'due_at'),
      field('closedOn', 'IsoDateTime | null', true, 'Closed at.', 'completed_at'),
      field('subjectRef', 'EntityRef | null', true, 'Record the run is about.', 'context_label'),
      field('ownerId', 'RecordId | null', true, 'Accountable person.', 'assigned_to'),
    ],
  },
  {
    entity: 'review',
    purpose: 'A scheduled review proving the record is still current.',
    base44Entity: 'DocumentControl',
    ownerRule: 'Record owner.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('subjectRef', 'EntityRef', true, 'Record reviewed.'),
      field('title', 'string', true, 'Review title.'),
      field('type', 'enum', true, 'document | control | policy | procedure | workflow | framework | clinical_plan | credential | risk.'),
      field('cadence', 'Cadence', true, 'Review cadence.'),
      field('lastReviewedOn', 'IsoDate | null', true, 'Last review.'),
      field('dueOn', 'IsoDate', true, 'Next due date.'),
      field('ownerId', 'RecordId | null', true, 'Reviewer.'),
      field('reviewerName', 'string | null', true, 'Named reviewer.'),
      field('outcome', 'enum', true, 'effective | changes_required | not_reviewed.'),
      field('notes', 'string', true, 'Review notes.'),
    ],
  },
  {
    entity: 'risk',
    purpose: 'A risk in the register, linked to its treating controls.',
    base44Entity: 'Risk',
    ownerRule: 'Risk owner named in the register.',
    fields: [
      field('id', 'RecordId', true, 'Slug.'),
      field('title', 'string', true, 'Risk title.', 'title'),
      field('category', 'enum', true, 'Risk category.', 'category'),
      field('likelihood', '1..5', true, 'Likelihood.', 'likelihood'),
      field('consequence', '1..5', true, 'Consequence.', 'consequence'),
      field('rating', 'RiskRating', true, 'Derived band; must agree with likelihood x consequence.', 'rating'),
      field('status', 'enum', true, 'identified | assessed | treating | monitored | closed.', 'status'),
      field('ownerId', 'RecordId', true, 'Risk owner.', 'owner'),
      field('reviewDue', 'IsoDate', true, 'Next review.', 'review_date'),
      field('controlIds', 'RecordId[]', true, 'Treating controls.'),
      field('treatment', 'string', true, 'Treatment summary.', 'treatment'),
    ],
  },
];

/** Dictionary lookup by entity name, built once. */
export const DICTIONARY_BY_ENTITY: ReadonlyMap<EntityName, EntityDefinition> = new Map(
  DATA_DICTIONARY.map((entry) => [entry.entity, entry])
);