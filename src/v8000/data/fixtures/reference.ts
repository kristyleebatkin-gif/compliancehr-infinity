import type {
  Framework,
  Outcome,
  Policy,
  Procedure,
  Requirement,
  Standard,
  Training,
} from '../../types/index.ts';
import { addDays, FIXTURE_TODAY } from './factories.ts';

/**
 * Starter reference set for the Phase 1 dataset.
 *
 * This is fixture-grade reference data: it mirrors the structure of the NDIS Practice Standards
 * and the strengthened Aged Care Quality Standards closely enough to exercise the whole evidence
 * chain, but it is NOT the authoritative instrument text and must not be shown to an auditor as
 * such. The live obligation registers (RegulatoryStandard, 57 records) remain the source of truth;
 * the framework validator exists precisely to catch drift between the two.
 */

export const FRAMEWORK_IDS = {
  ndis: 'ndis',
  agedCare: 'aged-care',
} as const;

export const STANDARD_IDS = {
  ndisPersonCentred: 'std-ndis-1.1',
  ndisValues: 'std-ndis-1.2',
  ndisRisk: 'std-ndis-3.3',
  ndisScreening: 'std-ndis-2A',
  agedPerson: 'std-ac-1',
  agedClinical: 'std-ac-5',
  agedNutrition: 'std-ac-6',
} as const;

export const REQUIREMENT_IDS = {
  supportPlanning: 'req-ndis-1.1a',
  accessibleCommunication: 'req-ndis-1.1b',
  valuesAndBeliefs: 'req-ndis-1.2a',
  riskRegister: 'req-ndis-3.3a',
  riskReview: 'req-ndis-3.3b',
  workerScreening: 'req-ndis-2A.a',
  agedPersonCentred: 'req-ac-1a',
  agedClinicalGovernance: 'req-ac-5a',
  agedMedication: 'req-ac-5b',
} as const;

export const POLICY_IDS = {
  personCentred: 'pol-person-centred',
  risk: 'pol-risk-management',
  clinical: 'pol-clinical-care',
} as const;

export const PROCEDURE_IDS = {
  supportPlanning: 'proc-support-planning',
  riskReview: 'proc-risk-review',
  medication: 'proc-medication',
} as const;

export const TRAINING_IDS = {
  screening: 'trn-worker-screening',
  medication: 'trn-medication-safety',
} as const;

export interface ReferenceSet {
  readonly frameworks: readonly Framework[];
  readonly standards: readonly Standard[];
  readonly requirements: readonly Requirement[];
  readonly outcomes: readonly Outcome[];
  readonly policies: readonly Policy[];
  readonly procedures: readonly Procedure[];
  readonly training: readonly Training[];
}

export function buildReferenceSet(): ReferenceSet {
  const frameworks: readonly Framework[] = [
    {
      id: FRAMEWORK_IDS.ndis,
      code: 'NDIS',
      label: 'NDIS Practice Standards',
      legislation: 'National Disability Insurance Scheme Act 2013 (Cth)',
      version: '2025.1',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 180),
    },
    {
      id: FRAMEWORK_IDS.agedCare,
      code: 'AGED_CARE',
      label: 'Aged Care Quality Standards',
      legislation: 'Aged Care Act 2024 (Cth)',
      version: '2025.1',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 240),
    },
  ];

  const standards: readonly Standard[] = [
    {
      id: STANDARD_IDS.ndisPersonCentred,
      framework: 'NDIS',
      code: 'Core 1.1',
      title: 'Person-centred supports',
      moduleArea: 'Core Module — Person-centred supports',
      outcome: 'Each participant receives supports that are safe, effective and tailored to their needs and goals.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 180),
      status: 'active',
    },
    {
      id: STANDARD_IDS.ndisValues,
      framework: 'NDIS',
      code: 'Core 1.2',
      title: 'Individual values and beliefs',
      moduleArea: 'Core Module — Person-centred supports',
      outcome: 'Each participant’s values, beliefs and culture are respected in the supports they receive.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 180),
      status: 'active',
    },
    {
      id: STANDARD_IDS.ndisRisk,
      framework: 'NDIS',
      code: 'Core 3.3',
      title: 'Risk management',
      moduleArea: 'Core Module — Governance and operational management',
      outcome: 'Risks to participants and to the service are identified, assessed and managed.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 180),
      status: 'active',
    },
    {
      id: STANDARD_IDS.ndisScreening,
      framework: 'NDIS',
      code: 'Module 2A',
      title: 'Worker screening and training',
      moduleArea: 'Module 2A — Employment of workers',
      outcome: 'Only workers with current screening and the required training support participants.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 180),
      status: 'active',
    },
    {
      id: STANDARD_IDS.agedPerson,
      framework: 'AGED_CARE',
      code: 'Standard 1',
      title: 'The Person',
      moduleArea: 'Strengthened Standards',
      outcome: 'Older people are treated with dignity and their individual identity, culture and choices shape their care.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 240),
      status: 'active',
    },
    {
      id: STANDARD_IDS.agedClinical,
      framework: 'AGED_CARE',
      code: 'Standard 5',
      title: 'Clinical Care',
      moduleArea: 'Strengthened Standards',
      outcome: 'Clinical care is safe, effective and coordinated, and medicines are managed safely.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 240),
      status: 'active',
    },
    {
      id: STANDARD_IDS.agedNutrition,
      framework: 'AGED_CARE',
      code: 'Standard 6',
      title: 'Food and Nutrition',
      moduleArea: 'Strengthened Standards',
      outcome: 'Older people receive food and fluids that meet their needs and preferences, and are at low risk of malnutrition.',
      effectiveFrom: '2025-11-01',
      reviewDue: addDays(FIXTURE_TODAY, 240),
      status: 'active',
    },
  ];

  const requirements: readonly Requirement[] = [
    {
      id: REQUIREMENT_IDS.supportPlanning,
      standardId: STANDARD_IDS.ndisPersonCentred,
      framework: 'NDIS',
      code: 'Core 1.1.1',
      obligation: 'Plan supports with the participant.',
      requirement: 'Supports are developed with each participant, in a way the participant understands, and reflect their goals.',
      mandatory: true,
      evidenceExpectation: 'A signed support plan recording the participant’s goals and choices, reviewed on schedule.',
      ownerRole: 'Support Coordinator',
    },
    {
      id: REQUIREMENT_IDS.accessibleCommunication,
      standardId: STANDARD_IDS.ndisPersonCentred,
      framework: 'NDIS',
      code: 'Core 1.1.2',
      obligation: 'Communicate in a form the participant can use.',
      requirement: 'Information is provided in the format each participant needs, including easy-read and interpreter support.',
      mandatory: true,
      evidenceExpectation: 'A record of the communication format agreed with the participant and evidence it was used.',
      ownerRole: 'Support Coordinator',
    },
    {
      id: REQUIREMENT_IDS.valuesAndBeliefs,
      standardId: STANDARD_IDS.ndisValues,
      framework: 'NDIS',
      code: 'Core 1.2.1',
      obligation: 'Respect culture, values and beliefs.',
      requirement: 'Workers support each participant to practise their culture, values and beliefs.',
      mandatory: true,
      evidenceExpectation: 'Support records and participant feedback showing cultural and belief needs were met.',
      ownerRole: 'Team Leader',
    },
    {
      id: REQUIREMENT_IDS.riskRegister,
      standardId: STANDARD_IDS.ndisRisk,
      framework: 'NDIS',
      code: 'Core 3.3.1',
      obligation: 'Hold a live risk register.',
      requirement: 'Risks are identified, assessed and recorded, with a named owner and a treatment.',
      mandatory: true,
      evidenceExpectation: 'The risk register extract showing current risks, owners and treatment dates.',
      ownerRole: 'Quality Manager',
    },
    {
      id: REQUIREMENT_IDS.riskReview,
      standardId: STANDARD_IDS.ndisRisk,
      framework: 'NDIS',
      code: 'Core 3.3.2',
      obligation: 'Review risks on a set cycle.',
      requirement: 'Each risk is reviewed at the cadence its rating requires, and the review is recorded.',
      mandatory: true,
      evidenceExpectation: 'Minutes of the risk review meeting, dated within the required cadence.',
      ownerRole: 'Quality Manager',
    },
    {
      id: REQUIREMENT_IDS.workerScreening,
      standardId: STANDARD_IDS.ndisScreening,
      framework: 'NDIS',
      code: 'Module 2A.1',
      obligation: 'Screen every worker before they start.',
      requirement: 'Workers hold a current NDIS Worker Screening clearance and complete required training before providing supports.',
      mandatory: true,
      evidenceExpectation: 'A clearance register showing each worker’s clearance number, expiry and training completion.',
      ownerRole: 'Workforce Manager',
    },
    {
      id: REQUIREMENT_IDS.agedPersonCentred,
      standardId: STANDARD_IDS.agedPerson,
      framework: 'AGED_CARE',
      code: 'Standard 1.1',
      obligation: 'Deliver care that fits the person.',
      requirement: 'Care is planned with the older person and responds to their identity, culture, choices and clinical needs.',
      mandatory: true,
      evidenceExpectation: 'A current care plan signed with the older person, and records showing the plan was followed.',
      ownerRole: 'Clinical Lead',
    },
    {
      id: REQUIREMENT_IDS.agedClinicalGovernance,
      standardId: STANDARD_IDS.agedClinical,
      framework: 'AGED_CARE',
      code: 'Standard 5.1',
      obligation: 'Govern clinical care.',
      requirement: 'Clinical care is provided by suitably qualified staff under clinical governance with regular review.',
      mandatory: true,
      evidenceExpectation: 'Clinical review minutes, credential records and care plan evaluations.',
      ownerRole: 'Clinical Lead',
    },
    {
      id: REQUIREMENT_IDS.agedMedication,
      standardId: STANDARD_IDS.agedClinical,
      framework: 'AGED_CARE',
      code: 'Standard 5.3',
      obligation: 'Manage medicines safely.',
      requirement: 'Medicines are administered, recorded and reviewed safely, with errors identified and acted on.',
      mandatory: true,
      evidenceExpectation: 'Medication charts and a medication audit with corrective actions closed.',
      ownerRole: 'Clinical Lead',
    },
  ];

  const outcomes: readonly Outcome[] = [
    {
      id: 'out-support-planning',
      requirementId: REQUIREMENT_IDS.supportPlanning,
      statement: 'The participant can describe how their supports reflect what matters to them.',
      beneficiary: 'participant',
      indicator: 'Support plan content matches the participant’s stated goals at review.',
      status: 'met',
      source: 'recorded',
    },
    {
      id: 'out-accessible-communication',
      requirementId: REQUIREMENT_IDS.accessibleCommunication,
      statement: 'The participant receives information in a form they can understand and use.',
      beneficiary: 'participant',
      indicator: 'Communication needs recorded and evidenced in the support record.',
      status: 'not_measured',
      source: 'none',
    },
    {
      id: 'out-values',
      requirementId: REQUIREMENT_IDS.valuesAndBeliefs,
      statement: 'The participant practises their culture, values and beliefs with support.',
      beneficiary: 'participant',
      indicator: 'Support records show cultural and belief needs were met.',
      status: 'partial',
      source: 'derived',
    },
    {
      id: 'out-risk-register',
      requirementId: REQUIREMENT_IDS.riskRegister,
      statement: 'Risks that could harm participants are known, owned and treated.',
      beneficiary: 'participant',
      indicator: 'Every open risk has an owner, a rating and a current treatment.',
      status: 'partial',
      source: 'derived',
    },
    {
      id: 'out-worker-screening',
      requirementId: REQUIREMENT_IDS.workerScreening,
      statement: 'Only screened and trained workers support participants.',
      beneficiary: 'participant',
      indicator: 'No worker provides support with a lapsed clearance or mandated training.',
      status: 'not_met',
      source: 'derived',
    },
    {
      id: 'out-aged-person',
      requirementId: REQUIREMENT_IDS.agedPersonCentred,
      statement: 'The older person’s care reflects who they are and what they choose.',
      beneficiary: 'resident',
      indicator: 'Care plan signed with the resident, reviewed within its cycle.',
      status: 'met',
      source: 'recorded',
    },
    {
      id: 'out-aged-clinical',
      requirementId: REQUIREMENT_IDS.agedClinicalGovernance,
      statement: 'Clinical care is coordinated and reviewed by qualified staff.',
      beneficiary: 'resident',
      indicator: 'Clinical reviews current for every resident on a clinical plan.',
      status: 'met',
      source: 'derived',
    },
    {
      id: 'out-aged-medication',
      requirementId: REQUIREMENT_IDS.agedMedication,
      statement: 'Medicines are given safely and errors are corrected.',
      beneficiary: 'resident',
      indicator: 'Medication audit findings closed with an effective corrective action.',
      status: 'not_met',
      source: 'derived',
    },
  ];

  const policies: readonly Policy[] = [
    {
      id: POLICY_IDS.personCentred,
      title: 'Person-centred supports policy',
      framework: 'NDIS',
      standardCodes: ['Core 1.1', 'Core 1.2'],
      version: '3.0',
      approvedBy: 'Chief Executive Officer',
      approvedOn: '2026-02-01',
      reviewDue: addDays(FIXTURE_TODAY, 200),
      status: 'active',
    },
    {
      id: POLICY_IDS.risk,
      title: 'Risk management policy',
      framework: 'NDIS',
      standardCodes: ['Core 3.3'],
      version: '2.1',
      approvedBy: 'Chief Executive Officer',
      approvedOn: '2026-01-15',
      reviewDue: addDays(FIXTURE_TODAY, 45),
      status: 'active',
    },
    {
      id: POLICY_IDS.clinical,
      title: 'Clinical care and medication policy',
      framework: 'AGED_CARE',
      standardCodes: ['Standard 1', 'Standard 5'],
      version: '4.2',
      approvedBy: 'Director of Nursing',
      approvedOn: '2026-03-10',
      reviewDue: addDays(FIXTURE_TODAY, 120),
      status: 'active',
    },
  ];

  const procedures: readonly Procedure[] = [
    {
      id: PROCEDURE_IDS.supportPlanning,
      policyId: POLICY_IDS.personCentred,
      title: 'Support planning conversation',
      steps: [
        'Confirm the participant’s goals and preferred communication format',
        'Record choices, cultural needs and consent',
        'Approve, issue and schedule the review',
      ],
      ownerRole: 'Support Coordinator',
      reviewDue: addDays(FIXTURE_TODAY, 200),
      status: 'active',
    },
    {
      id: PROCEDURE_IDS.riskReview,
      policyId: POLICY_IDS.risk,
      title: 'Monthly risk review',
      steps: [
        'Confirm each risk owner and rating',
        'Check treatments are progressing',
        'Record the review and escalate anything overdue',
      ],
      ownerRole: 'Quality Manager',
      reviewDue: addDays(FIXTURE_TODAY, 45),
      status: 'active',
    },
    {
      id: PROCEDURE_IDS.medication,
      policyId: POLICY_IDS.clinical,
      title: 'Medication administration and audit',
      steps: [
        'Check the chart against the prescription before administration',
        'Record administration at the time it happens',
        'Escalate any error the same shift and log it',
        'Audit a sample monthly and close findings',
      ],
      ownerRole: 'Clinical Lead',
      reviewDue: addDays(FIXTURE_TODAY, 120),
      status: 'active',
    },
  ];

  const training: readonly Training[] = [
    {
      id: TRAINING_IDS.screening,
      title: 'Worker orientation, screening and safe support',
      moduleCode: 'MOD-ORI-01',
      mandatedBy: ['Module 2A'],
      refresherMonths: 12,
      ownerRole: 'Workforce Manager',
      status: 'active',
    },
    {
      id: TRAINING_IDS.medication,
      title: 'Medication safety and administration',
      moduleCode: 'MOD-MED-02',
      mandatedBy: ['Standard 5'],
      refresherMonths: 12,
      ownerRole: 'Clinical Lead',
      status: 'active',
    },
  ];

  return { frameworks, standards, requirements, outcomes, policies, procedures, training };
}