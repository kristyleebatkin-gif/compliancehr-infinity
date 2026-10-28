import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { downloadCsv } from '@/lib/csvExport';

export const VAULT_15_CATEGORIES = [
  'Governance',
  'Compliance',
  'Risk',
  'Incident',
  'Audit',
  'NDIS',
  'HR',
  'Workforce',
  'Training',
  'Communications',
  'Reports',
  'Policies',
  'Procedures',
  'Reviews',
  'Templates',
];

export const QUICK_16_DATE_FILTERS = [
  { id: 'ALL', label: 'All Dates' },
  { id: 'TODAY', label: 'Today' },
  { id: 'YESTERDAY', label: 'Yesterday' },
  { id: 'THIS_WEEK', label: 'This Week' },
  { id: 'LAST_WEEK', label: 'Last Week' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'LAST_MONTH', label: 'Last Month' },
  { id: 'THIS_QUARTER', label: 'This Quarter' },
  { id: 'LAST_QUARTER', label: 'Last Quarter' },
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'LAST_YEAR', label: 'Last Year' },
  { id: 'NEXT_7_DAYS', label: 'Next 7 Days' },
  { id: 'NEXT_30_DAYS', label: 'Next 30 Days' },
  { id: 'NEXT_90_DAYS', label: 'Next 90 Days' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'UPCOMING_REVIEWS', label: 'Upcoming Reviews' },
  { id: 'UPCOMING_AUDITS', label: 'Upcoming Audits' },
];

export const RECORD_16_RELATIONSHIP_TARGETS = [
  'Participants',
  'Employees',
  'Contractors',
  'Sites',
  'Departments',
  'Goals',
  'Risks',
  'Incidents',
  'Audits',
  'Reviews',
  'Policies',
  'Procedures',
  'Communications',
  'Training',
  'Actions',
  'Compliance Obligations',
];

export const QUALITY_GATE_19_CHECKS = [
  { id: 'QG-01', label: 'Accurate subject matter' },
  { id: 'QG-02', label: 'Correct fields' },
  { id: 'QG-03', label: 'Correct document control (16 mandatory fields)' },
  { id: 'QG-04', label: 'Correct business information' },
  { id: 'QG-05', label: 'Correct review schedule' },
  { id: 'QG-06', label: 'Correct next review date' },
  { id: 'QG-07', label: 'Correct permissions (RLS enforced)' },
  { id: 'QG-08', label: 'Correct workflow routing' },
  { id: 'QG-09', label: 'Correct storage location (Vault & Company Safe)' },
  { id: 'QG-10', label: 'Correct module classification' },
  { id: 'QG-11', label: 'Correct relationships (16 linked domains)' },
  { id: 'QG-12', label: 'Correct reporting' },
  { id: 'QG-13', label: 'Correct exports (PDF, Excel, Word, CSV)' },
  { id: 'QG-14', label: 'Correct auditing & permanent change history' },
  { id: 'QG-15', label: 'Professional appearance' },
  { id: 'QG-16', label: 'NDIS suitability where applicable' },
  { id: 'QG-17', label: 'Governance readiness' },
  { id: 'QG-18', label: 'Audit readiness' },
  { id: 'QG-19', label: 'Executive readiness' },
];

export const ENTERPRISE_12_REPORT_TYPES = [
  {
    id: 'audit-report',
    title: 'Audit Reports',
    module: 'Compliance & Report Centre',
    category: 'Audit',
    subject: 'NDIS 17-Category & 356-Checkpoint Audit Verification',
    entity: 'InternalAudit',
    ndisStandard: 'NDIS Practice Standards — Core Module 2 (Provider Governance)',
  },
  {
    id: 'review-report',
    title: 'Review Reports',
    module: 'Participant & Staff Reviews',
    category: 'Reviews',
    subject: '10-Weekly Participant Progress & 6-Monthly Risk Reviews',
    entity: 'ParticipantReview',
    ndisStandard: 'NDIS Practice Standards — Core Module 3 (Provision of Supports)',
  },
  {
    id: 'compliance-report',
    title: 'Compliance Reports',
    module: 'Compliance & Report Centre',
    category: 'Compliance',
    subject: 'Whole-of-Organisation Statutory & NDIS Compliance Posture',
    entity: 'ComplianceIssue',
    ndisStandard: 'NDIS Quality & Safeguards Commission Framework 2026',
  },
  {
    id: 'risk-report',
    title: 'Risk Reports',
    module: 'Risk Reporting',
    category: 'Risk',
    subject: 'ISO 31000 Hierarchy of Controls, Treatments & Residual Ratings',
    entity: 'Risk',
    ndisStandard: 'ISO 31000:2018 & NDIS Risk Management Standard',
  },
  {
    id: 'incident-report',
    title: 'Incident Reports',
    module: 'Incident Clinic',
    category: 'Incident',
    subject: '24-Hour & 5-Day Reportable Incidents, Investigations & CAPA',
    entity: 'Incident',
    ndisStandard: 'NDIS (Incident Management and Reportable Incidents) Rules',
  },
  {
    id: 'ndis-report',
    title: 'NDIS Reports',
    module: 'NDIS Provider Portal',
    category: 'NDIS',
    subject: 'Registration Groups, 3-Part Consents, Goals & Claim Integrity',
    entity: 'ParticipantProfile',
    ndisStandard: 'NDIS Practice Standards — Core Modules 1–4',
  },
  {
    id: 'governance-report',
    title: 'Governance Reports',
    module: 'Company Safe & Governance',
    category: 'Governance',
    subject: 'Controlled Policies, Legal Obligations, Delegations & Disclosures',
    entity: 'Policy',
    ndisStandard: 'Corporations Act & NDIS Governance Standard',
  },
  {
    id: 'training-report',
    title: 'Training Reports',
    module: 'Training Centre',
    category: 'Training',
    subject: '100-Point Screening, LMS Competencies, First Aid, CPR & Certs',
    entity: 'Certificate',
    ndisStandard: 'NDIS Workforce Capability & Screening Rules',
  },
  {
    id: 'executive-report',
    title: 'Executive Reports',
    module: 'Operations Centre',
    category: 'Reports',
    subject: 'Executive KPI Trajectory, Workforce Readiness & Financial Health',
    entity: 'KPI',
    ndisStandard: 'Executive Governance & Strategic Oversight Standard',
  },
  {
    id: 'board-report',
    title: 'Board Reports',
    module: 'Compliance & Report Centre',
    category: 'Governance',
    subject: 'Board Quality, Safety, Risk, Financial & Audit Assurance Pack',
    entity: 'AuditReport',
    ndisStandard: 'Board Clinical & Corporate Governance Standard',
  },
  {
    id: 'activity-report',
    title: 'Activity Reports',
    module: 'Document Vault & Data Control',
    category: 'Audit',
    subject: 'Cross-Module Operational Activity, Shifts, Tasks & Communications',
    entity: 'AuditLog',
    ndisStandard: 'Privacy Act 1988 & Information Security Standard',
  },
  {
    id: 'change-history-report',
    title: 'Change History Reports',
    module: 'Company Safe & Data Control',
    category: 'Audit',
    subject: 'Permanent Version, Review, Approval & Field-Level Change Ledger',
    entity: 'StatusLog',
    ndisStandard: 'ISO 9001 Document & Record Traceability Standard',
  },
];

export const ENTERPRISE_12_FORM_TEMPLATES = [
  {
    id: 'TPL-HR-001',
    domain: 'HR',
    documentName: 'Employee 100-Point Screening, Contract & Onboarding Dossier',
    documentNumber: 'CHR-HR-2026-001',
    recordId: 'REC-HR-001',
    versionNumber: 'v4.2',
    status: 'Approved',
    module: 'HR Hub & Volunteering',
    category: 'HR',
    owner: 'Human Resources Manager',
    department: 'People & Culture',
    createdDate: '2026-01-15',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-01',
    nextReviewDate: '2027-03-01',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-02',
    purpose:
      'Verify and record mandatory 100-point identity, NDIS Worker Screening Check, Working with Children (Blue Card), National Police Check, First Aid/CPR, and signed employment contract prior to roster allocation.',
    scope:
      'Applies to all permanent, part-time, casual support workers, team leaders, contractors, and volunteers across all service delivery sites.',
    relatedDocuments: [
      'CHR-POL-014 Worker Screening & Credentials Policy',
      'CHR-HR-002 Position Description & SCHADS Classification',
      'CHK-041 Roster Screening Gatekeeper Protocol',
    ],
    mainFields: [
      { key: 'employeeName', label: 'Employee Full Name', value: 'Verified Staff Record' },
      { key: 'ndisScreeningNumber', label: 'NDIS Worker Screening Clearance # & Expiry', value: 'NSWSC-2026-88412 · Exp 2029-06-30' },
      { key: 'blueCardNumber', label: 'Working With Children / Blue Card # & Expiry', value: 'BC-992014 · Exp 2028-11-15' },
      { key: 'firstAidCpr', label: 'HLTAID011 First Aid & HLTAID009 CPR Expiry', value: 'Current · Verified in Document Vault' },
      { key: 'schadsLevel', label: 'Award Classification & Employment Status', value: 'SCHADS Level 3.2 · Permanent Part-Time' },
      { key: 'inductionCompleted', label: 'NDIS Worker Orientation & Code of Conduct', value: 'Completed & Certificate Filed' },
    ],
    evidenceItems: [
      'Verified 100-Point Primary & Secondary ID Sighted',
      'NDIS Worker Screening Portal Live Match Confirmed',
      'Signed Employment Contract & Confidentiality Undertaking Filed in Company Safe',
    ],
    actionsItems: [
      'Enforce automated 90/60/30/14-day credential expiry reminders',
      'Activate Roster Screening Gatekeeper upon approval',
    ],
  },
  {
    id: 'TPL-WF-002',
    domain: 'Workforce',
    documentName: 'Workforce Roster Validation, Fatigue & Shift Handover Control Form',
    documentNumber: 'CHR-WF-2026-002',
    recordId: 'REC-WF-002',
    versionNumber: 'v3.8',
    status: 'Approved',
    module: 'Rostering',
    category: 'Workforce',
    owner: 'Rostering Coordinator',
    department: 'Service Delivery & Operations',
    createdDate: '2026-02-01',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-08-15',
    nextReviewDate: '2027-02-15',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-08-16',
    purpose:
      'Ensure every rostered shift satisfies NDIS worker screening clearance, participant support ratio, qualification matching, SCHADS minimum break rules, and mandatory end-of-shift handover documentation.',
    scope:
      'All rostered community access, SIL, high-intensity, and in-home support shifts across all regions.',
    relatedDocuments: [
      'CHR-SOP-022 Safe Rostering & Fatigue Management Procedure',
      'CHR-FRM-009 End-of-Shift Checklist & Progress Note',
      'CHK-112 Shift-to-Invoice 3-Way Reconciliation Standard',
    ],
    mainFields: [
      { key: 'rosterPeriod', label: 'Roster Cycle & Site / Region', value: 'Fortnightly Cycle · Head Office & North QLD' },
      { key: 'screeningGate', label: 'Automated Unscreened Worker Block Status', value: 'Armed & Active (0 Exceptions)' },
      { key: 'fatigueCompliance', label: 'Minimum 10-Hour Rest Break & Max Hours Check', value: '100% Compliant Across All Shifts' },
      { key: 'handoverCompletion', label: 'Mandatory Shift Progress Note Completion SLA', value: 'Verified Within 2 Hours of Clock-Out' },
    ],
    evidenceItems: [
      'Live Roster Validation Log & Exception Register',
      'Signed Shift Handover Notes Linked to Participant Goals',
    ],
    actionsItems: [
      'Escalate any unsubmitted shift note after 4 hours to Team Leader',
      'Sync verified timesheets to NDIS Price Guide Invoicing',
    ],
  },
  {
    id: 'TPL-NDIS-003',
    domain: 'NDIS',
    documentName: 'NDIS Participant Intake, 3-Part Informed Consent & Support Plan Agreement',
    documentNumber: 'CHR-NDIS-2026-003',
    recordId: 'REC-NDIS-003',
    versionNumber: 'v5.0',
    status: 'Approved',
    module: 'Participant Profiles',
    category: 'NDIS',
    owner: 'Intake Officer',
    department: 'Participant Services',
    createdDate: '2026-01-10',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-10',
    nextReviewDate: '2026-12-10',
    reviewFrequency: 'Quarterly (10-Weekly Cycle)',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-11',
    purpose:
      'Capture person-centred participant goals, NDIS funding categories, individual risk controls, and explicit 3-part consents (Information Sharing, Advocacy/Nominee, Medication & External NDIS Audit Consent).',
    scope:
      'Mandatory for all NDIS and Aged Care participants prior to commencement of service delivery and during 10-weekly progress reviews.',
    relatedDocuments: [
      'CHR-NDIS-001 Participant Charter of Rights & Easy Read Handbook',
      'CHR-NDIS-004 Individual & Home Safety Risk Assessment',
      'CHR-NDIS-008 Schedule of Supports & Service Agreement',
    ],
    mainFields: [
      { key: 'participantRef', label: 'Participant Name & NDIS Number', value: 'Linked Participant Profile Record' },
      { key: 'threePartConsent', label: '3-Part Consent (Sharing / Advocate / Medication)', value: 'Consent Received & Timestamped' },
      { key: 'auditConsent', label: 'External NDIS Quality Commission Audit Consent', value: 'Audit consent received (RLS Enforced)' },
      { key: 'planBudget', label: 'Core, Capacity Building & Capital Allocation', value: 'Verified Against Current NDIS Plan' },
    ],
    evidenceItems: [
      'Signed Service Agreement & Schedule of Supports',
      '3-Part Informed Consent Log with Witness Signature',
      'Baseline Individual & Home Risk Assessment',
    ],
    actionsItems: [
      'Schedule automated 10-weekly progress review task',
      'Link participant goals to daily shift note templates',
    ],
  },
  {
    id: 'TPL-CMP-004',
    domain: 'Compliance',
    documentName: 'NDIS Practice Standards 356-Checkpoint Verification & Evidence Control Form',
    documentNumber: 'CHR-CMP-2026-004',
    recordId: 'REC-CMP-004',
    versionNumber: 'v4.5',
    status: 'Approved',
    module: 'Compliance & Report Centre',
    category: 'Compliance',
    owner: 'Compliance Manager',
    department: 'Quality, Risk & Compliance',
    createdDate: '2026-01-05',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-10-01',
    nextReviewDate: '2027-01-01',
    reviewFrequency: 'Quarterly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-10-02',
    purpose:
      'Substantiate ongoing compliance across all 17 NDIS Audit Categories and 356 Checkpoints using live operational register records rather than static templates.',
    scope:
      'Covers Core Modules 1–4, High-Intensity Daily Personal Activities, Behaviour Support, Early Childhood, SIL, WHS, HR, and Financial Governance.',
    relatedDocuments: [
      'CHR-AUD-001 Master 356-Checkpoint Audit Register',
      'CHR-DOC-098 Master 98-Document Control Ledger',
      'CHR-QMS-010 Continuous Improvement Register (CIR)',
    ],
    mainFields: [
      { key: 'scopeCovered', label: 'NDIS Practice Standards & Audit Scope', value: '17 Categories · 356 Checkpoints Reconciled' },
      { key: 'evidenceRule', label: 'Operational Evidence Verification Rule', value: 'Live Register Records Required (Strict Gate)' },
      { key: 'auditorPortal', label: 'External Auditor Portal RLS & Consent Gate', value: 'Active & Consent-Filtered' },
      { key: 'nonConformities', label: 'Open Major / Minor Non-Conformities', value: '0 Open · CAPA Linked' },
    ],
    evidenceItems: [
      'Live Operational Counts Across All 46 Connected Modules',
      'Reconciled 98 Controlled Master Documents in Company Safe',
    ],
    actionsItems: [
      'Generate monthly Board Compliance Assurance Pack',
      'Auto-route any checkpoint gap to Shared To-Do Register',
    ],
  },
  {
    id: 'TPL-GOV-005',
    domain: 'Governance',
    documentName: 'Corporate & Clinical Governance, Delegations & Board Assurance Charter',
    documentNumber: 'CHR-GOV-2026-005',
    recordId: 'REC-GOV-005',
    versionNumber: 'v3.4',
    status: 'Approved',
    module: 'Company Safe',
    category: 'Governance',
    owner: 'Provider Administrator',
    department: 'Executive & Board Governance',
    createdDate: '2026-01-12',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-15',
    nextReviewDate: '2027-03-15',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-16',
    purpose:
      'Establish clear executive accountabilities, financial and clinical delegations of authority, conflict-of-interest declarations, and legislative compliance monitoring.',
    scope:
      'Applies to Key Management Personnel, Directors, Provider Administrators, Compliance Managers, and Financial Officers.',
    relatedDocuments: [
      'CHR-GOV-001 Key Personnel & Financial Delegations Register',
      'CHR-GOV-002 Conflict of Interest & Related Party Register',
      'CHR-GOV-003 Notifiable Data Breach (OAIC) Response Plan',
    ],
    mainFields: [
      { key: 'keyPersonnel', label: 'Key Management Personnel Screening & Suitability', value: '100% Verified & Current' },
      { key: 'delegationLimits', label: 'Financial & Clinical Delegation Matrix', value: 'Enforced via 15 Role Permission Tiers' },
      { key: 'insuranceCurrency', label: 'Public Liability, Professional Indemnity & WorkCover', value: 'Current Certificates in Company Safe' },
      { key: 'legislativeRegister', label: 'Australian & State Legislative Obligations', value: 'Monitored & Reviewed Quarterly' },
    ],
    evidenceItems: [
      'Signed Key Personnel Declarations & suitability checks',
      'Current Insurance & NDIS Registration Certificates',
    ],
    actionsItems: [
      'Conduct quarterly Board Governance & Risk Review',
      'Maintain immutable master copies in Company Safe',
    ],
  },
  {
    id: 'TPL-RSK-006',
    domain: 'Risk',
    documentName: 'ISO 31000 Enterprise, Clinical & Home Risk Assessment & Control Matrix',
    documentNumber: 'CHR-RSK-2026-006',
    recordId: 'REC-RSK-006',
    versionNumber: 'v4.1',
    status: 'Approved',
    module: 'Risk Reporting',
    category: 'Risk',
    owner: 'Compliance Manager',
    department: 'WHS & Risk Management',
    createdDate: '2026-01-20',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-20',
    nextReviewDate: '2027-03-20',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-21',
    purpose:
      'Identify, rate, treat, and monitor operational, clinical, participant, financial, and WHS risks using the ISO 31000 Hierarchy of Controls (Eliminate, Substitute, Isolate, Engineering, Administrative, PPE).',
    scope:
      'All organisational operations, participant homes, community outings, fleet vehicles, and support environments.',
    relatedDocuments: [
      'CHR-RSK-001 Enterprise Risk Management Framework',
      'CHR-WHS-004 Home & Environment Safety Inspection Checklist',
      'CHR-WHS-007 Pre-Shift Take-5 Safety Check Register',
    ],
    mainFields: [
      { key: 'inherentRating', label: 'Inherent Likelihood × Consequence Rating', value: 'Assessed via 5×5 ISO 31000 Matrix' },
      { key: 'hierarchyControls', label: 'Hierarchy of Controls Applied', value: 'Elimination, Isolation, Training & Supervision' },
      { key: 'residualRating', label: 'Post-Treatment Residual Risk Rating', value: 'Low / Controlled & Monitored' },
      { key: 'linkedAudit', label: 'Linked NDIS Practice Standard & Audit Ref', value: 'Core Module 2 & Module 4 Safe Environment' },
    ],
    evidenceItems: [
      'Completed Home & Individual Risk Assessments',
      'Staff Training & Competency Sign-Offs for High-Risk Supports',
    ],
    actionsItems: [
      'Trigger automatic 6-monthly risk review reminder',
      'Link high/critical risks directly to Board Risk Register',
    ],
  },
  {
    id: 'TPL-INC-007',
    domain: 'Incident',
    documentName: 'NDIS Reportable Incident, 24h/5d Statutory Notification & Root-Cause Investigation',
    documentNumber: 'CHR-INC-2026-007',
    recordId: 'REC-INC-007',
    versionNumber: 'v4.6',
    status: 'Approved',
    module: 'Incident Clinic',
    category: 'Incident',
    owner: 'Compliance Manager',
    department: 'Clinical Governance & Safeguarding',
    createdDate: '2026-01-18',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-10-05',
    nextReviewDate: '2027-01-05',
    reviewFrequency: 'Quarterly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-10-06',
    purpose:
      'Record immediate participant safeguarding actions, enforce statutory 24-hour and 5-day NDIS Quality and Safeguards Commission notification countdowns, document root-cause investigations, and link CAPA outcomes.',
    scope:
      'All reportable and non-reportable incidents, near misses, medication errors, and unauthorised restrictive practices.',
    relatedDocuments: [
      'CHR-INC-001 Incident Management & Reportable Incidents Policy',
      'CHR-INC-003 Open Disclosure & Participant Support Protocol',
      'CHR-QMS-010 Continuous Improvement & Corrective Action Register',
    ],
    mainFields: [
      { key: 'statutoryTimer', label: 'NDIS Commission 24-Hour & 5-Day SLA Timer', value: 'Automated Countdown Armed Upon Awareness' },
      { key: 'immediateAction', label: 'Immediate First Aid, Safeguarding & Medical Care', value: 'Documented & Verified by Supervisor' },
      { key: 'openDisclosure', label: 'Participant / Nominee Open Disclosure Notification', value: 'Completed & Timestamped' },
      { key: 'rootCauseCapa', label: 'Investigation Findings & Corrective Action (CAPA)', value: 'Linked to Risk Register & Quality Improvement' },
    ],
    evidenceItems: [
      'Timestamped Incident Report & Photographic/Witness Evidence',
      'NDIS Commission Portal Submission Reference Receipt',
    ],
    actionsItems: [
      'Update participant risk assessment and support plan controls',
      'Log systemic lesson learned in Continuous Improvement Register',
    ],
  },
  {
    id: 'TPL-AUD-008',
    domain: 'Audit',
    documentName: 'Internal & External NDIS Certification Audit Schedule, Findings & CAPA Form',
    documentNumber: 'CHR-AUD-2026-008',
    recordId: 'REC-AUD-008',
    versionNumber: 'v3.9',
    status: 'Approved',
    module: 'Auditor Portal',
    category: 'Audit',
    owner: 'Quality & Improvement Manager',
    department: 'Internal Audit & Assurance',
    createdDate: '2026-02-05',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-25',
    nextReviewDate: '2027-03-25',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-26',
    purpose:
      'Conduct structured internal and pre-certification audits across participant files, employee 100-point folders, governance registers, and clinical safeguards.',
    scope:
      'All organisational departments, service sites, and external auditor portal verifications.',
    relatedDocuments: [
      'CHR-AUD-002 Participant File Audit Checklist',
      'CHR-AUD-003 Staff Credential & Training File Audit',
      'CHR-AUD-005 External Auditor Consent-Gated Access Protocol',
    ],
    mainFields: [
      { key: 'auditType', label: 'Audit Scope & Methodology', value: 'Full 17-Category Internal & External Readiness Audit' },
      { key: 'sampleSize', label: 'Participant & Staff Dossiers Sampled', value: '100% Consent-Verified Records' },
      { key: 'findingsSummary', label: 'Conformities, Observations & Opportunities', value: 'All Checkpoints Mapped to Live Registers' },
      { key: 'capaTracking', label: 'Corrective Action Closure Verification', value: 'Tracked to 100% Completion' },
    ],
    evidenceItems: [
      'Signed Auditor Observation Log & Evidence Pack',
      'Participant & Staff Audit Consent Verification Trail',
    ],
    actionsItems: [
      'File signed Audit Report in Document Vault & Company Safe',
      'Present executive audit summary at next Board meeting',
    ],
  },
  {
    id: 'TPL-QMS-009',
    domain: 'Quality',
    documentName: 'Continuous Improvement Register (CIR), Feedback & CAPA Closure Record',
    documentNumber: 'CHR-QMS-2026-009',
    recordId: 'REC-QMS-009',
    versionNumber: 'v3.6',
    status: 'Approved',
    module: 'Quality & Improvement',
    category: 'Reviews',
    owner: 'Quality & Improvement Manager',
    department: 'Quality Management',
    createdDate: '2026-02-10',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-18',
    nextReviewDate: '2027-03-18',
    reviewFrequency: 'Quarterly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-19',
    purpose:
      'Translate complaints, participant feedback, incident investigations, and audit observations into measurable corrective and preventative actions with verified outcomes.',
    scope:
      'Whole-of-organisation quality management system aligned with NDIS Core Module 2 and ISO 9001.',
    relatedDocuments: [
      'CHR-QMS-001 Quality Management & Continuous Improvement Policy',
      'CHR-FBK-002 Complaints & Feedback 24-Hour SLA Procedure',
    ],
    mainFields: [
      { key: 'improvementSource', label: 'Source (Audit / Incident / Feedback / Staff Suggestion)', value: 'Auto-Routed Across All 46 Modules' },
      { key: 'rootCause', label: 'Problem Statement & Root-Cause Analysis', value: 'Documented with Measurable Target Outcome' },
      { key: 'assignedOwner', label: 'Responsible Officer & Target Completion Date', value: 'Assigned & Tracked in Task Dashboard' },
      { key: 'effectivenessReview', label: 'Post-Implementation Effectiveness Verification', value: 'Verified & Signed Off by Management' },
    ],
    evidenceItems: [
      'Before & After Operational Evidence Comparison',
      'Updated Policy / Training Communication Read-Receipts',
    ],
    actionsItems: [
      'Close linked compliance issue and update readiness score',
      'Include improvement outcome in Participant Newsletter & Board Pack',
    ],
  },
  {
    id: 'TPL-TRN-010',
    domain: 'Training',
    documentName: 'Workforce LMS Competency Assessment, Buddy Shift & 17-Point Skill Record',
    documentNumber: 'CHR-TRN-2026-010',
    recordId: 'REC-TRN-010',
    versionNumber: 'v4.0',
    status: 'Approved',
    module: 'Training Centre',
    category: 'Training',
    owner: 'Human Resources Manager',
    department: 'Learning & Development',
    createdDate: '2026-02-14',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-22',
    nextReviewDate: '2027-03-22',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-23',
    purpose:
      'Assess and certify frontline worker competency across mandatory NDIS orientation, infection control, manual handling, medication administration, and high-intensity supports.',
    scope:
      'All support workers, team leaders, volunteers, and student placements.',
    relatedDocuments: [
      'CHR-TRN-001 Workforce Training & Competency Matrix',
      'CHR-TRN-004 Medication Administration SAM Competency Checklist',
      'CHR-TRN-006 Buddy Shift Supervision Sign-Off Form',
    ],
    mainFields: [
      { key: 'courseModule', label: 'LMS Module & 17-Point Skill Standard', value: 'NDIS High-Intensity & Core Support Competencies' },
      { key: 'quizPassScore', label: 'Knowledge Assessment & Practical Observation', value: '100% Pass Threshold Verified' },
      { key: 'certificateIssued', label: 'Accredited Certificate Serial & Expiry Date', value: 'Auto-Issued & Synced to Staff Profile' },
      { key: 'supervisorSignOff', label: 'Workplace Assessor / Team Leader Verification', value: 'Digitally Signed & Logged' },
    ],
    evidenceItems: [
      'Completed AI Knowledge Quiz & Practical Observation Checklist',
      'Generated PDF Certificate Filed in Employee Document Vault',
    ],
    actionsItems: [
      'Schedule annual refresher reminder 60 days prior to expiry',
      'Update Roster Qualification Matrix automatically',
    ],
  },
  {
    id: 'TPL-COM-011',
    domain: 'Communications',
    documentName: 'Controlled Organisational Broadcast, Shift Handover & Read-Receipt Record',
    documentNumber: 'CHR-COM-2026-011',
    recordId: 'REC-COM-011',
    versionNumber: 'v3.2',
    status: 'Approved',
    module: 'Communication Centre',
    category: 'Communications',
    owner: 'Administration',
    department: 'Operations & Communications',
    createdDate: '2026-02-20',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-09-28',
    nextReviewDate: '2027-03-28',
    reviewFrequency: '6-Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-09-29',
    purpose:
      'Ensure all policy updates, safety alerts, participant handover notes, and executive directives track target audience, delivery status, read status, and mandatory staff acknowledgements.',
    scope:
      'All internal and external communications across staff, participants, nominees, and management.',
    relatedDocuments: [
      'CHR-COM-001 Professional Communication & Handover Policy',
      'CHR-DOC-012 Mandatory Policy & Document Read-Receipt Register',
    ],
    mainFields: [
      { key: 'audienceScope', label: 'Target Audience & Role Distribution', value: 'All Active Staff / Assigned Support Team' },
      { key: 'deliveryStatus', label: 'In-App & Branded Email Delivery Status', value: 'Delivered & Timestamped' },
      { key: 'readAcknowledgement', label: 'Read Status & Signed Acknowledgement Tracking', value: 'Tracked in DocumentAcknowledgement Register' },
      { key: 'linkedProfile', label: 'Linked Participant / Employee / Incident Record', value: 'Bi-Directionally Linked' },
    ],
    evidenceItems: [
      'Timestamped Delivery & Read-Receipt Ledger',
      'Signed Declaration in DocumentAcknowledgement Entity',
    ],
    actionsItems: [
      'Send automated reminder for any unacknowledged directive after 48 hours',
      'Archive communication copy in Participant / Staff Dossier',
    ],
  },
  {
    id: 'TPL-EXE-012',
    domain: 'Executive Reporting',
    documentName: 'Executive & Board Monthly Governance, Financial, Risk & NDIS Assurance Report',
    documentNumber: 'CHR-EXE-2026-012',
    recordId: 'REC-EXE-012',
    versionNumber: 'v5.1',
    status: 'Approved',
    module: 'Business Analytics',
    category: 'Reports',
    owner: 'Provider Administrator',
    department: 'Executive Leadership',
    createdDate: '2026-01-25',
    modifiedDate: '2026-10-28',
    lastReviewDate: '2026-10-15',
    nextReviewDate: '2026-11-15',
    reviewFrequency: 'Monthly',
    approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
    approvalDate: '2026-10-16',
    purpose:
      'Provide the Board and Executive Leadership with a single verified assurance pack uniting NDIS audit readiness, workforce screening, reportable incidents, ISO 31000 risks, and NDIS claim reconciliation.',
    scope:
      'Whole-of-enterprise executive and board reporting across all 46 connected modules.',
    relatedDocuments: [
      'CHR-EXE-001 Monthly Board Quality & Safety Intelligence Pack',
      'CHR-FIN-004 3-Way NDIS Claim, Shift & Invoice Reconciliation Report',
    ],
    mainFields: [
      { key: 'overallReadiness', label: 'Enterprise NDIS Audit Readiness Score', value: 'Verified Across 17 Categories & 356 Checkpoints' },
      { key: 'workforceAssurance', label: '100-Point Screening & Credential Currency', value: 'Monitored Live with Roster Gate Active' },
      { key: 'safetySla', label: 'Reportable Incidents & High/Critical Risk Controls', value: '100% Within Statutory NDIS Timelines' },
      { key: 'financialIntegrity', label: 'NDIS Invoicing, Payroll & Claim Reconciliation', value: '3-Way Matched & Audit-Ready' },
    ],
    evidenceItems: [
      'Live Aggregated Telemetry from All Operational Registers',
      'Permanent Audit, Change, Review & Approval Logs',
    ],
    actionsItems: [
      'File approved Executive & Board Report in Document Vault & Company Safe',
      'Track board strategic actions in Projects Hub & Shared To-Do Register',
    ],
  },
];

export function matchQuickDateFilter(dateStr, filterId, customFrom, customTo) {
  if (!filterId || filterId === 'ALL') {
    if (!customFrom && !customTo) return true;
  }
  if (!dateStr) return filterId === 'ALL' && !customFrom && !customTo;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 86400000;
  const diffDays = Math.floor((d - startOfToday) / dayMs);

  if (customFrom) {
    const fromD = new Date(customFrom);
    if (!Number.isNaN(fromD.getTime()) && d < fromD) return false;
  }
  if (customTo) {
    const toD = new Date(customTo);
    if (!Number.isNaN(toD.getTime()) && d > new Date(toD.getTime() + dayMs - 1)) return false;
  }

  switch (filterId) {
    case 'TODAY':
      return diffDays === 0;
    case 'YESTERDAY':
      return diffDays === -1;
    case 'THIS_WEEK':
      return diffDays >= -7 && diffDays <= 7;
    case 'LAST_WEEK':
      return diffDays >= -14 && diffDays < -7;
    case 'THIS_MONTH':
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case 'LAST_MONTH': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
    }
    case 'THIS_QUARTER': {
      const q = Math.floor(now.getMonth() / 3);
      return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
    }
    case 'LAST_QUARTER': {
      const lqDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const lq = Math.floor(lqDate.getMonth() / 3);
      return d.getFullYear() === lqDate.getFullYear() && Math.floor(d.getMonth() / 3) === lq;
    }
    case 'THIS_YEAR':
      return d.getFullYear() === now.getFullYear();
    case 'LAST_YEAR':
      return d.getFullYear() === now.getFullYear() - 1;
    case 'NEXT_7_DAYS':
      return diffDays >= 0 && diffDays <= 7;
    case 'NEXT_30_DAYS':
      return diffDays >= 0 && diffDays <= 30;
    case 'NEXT_90_DAYS':
      return diffDays >= 0 && diffDays <= 90;
    case 'OVERDUE':
      return diffDays < 0;
    case 'UPCOMING_REVIEWS':
    case 'UPCOMING_AUDITS':
      return diffDays >= 0 && diffDays <= 90;
    default:
      return true;
  }
}

export function exportControlledRecordAsPdf(record) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 36;

  // Header wave band
  doc.setFillColor(10, 43, 109);
  doc.rect(0, 0, pageWidth, 68, 'F');
  doc.setFillColor(255, 46, 154);
  doc.rect(0, 68, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('COMPLIANCEHR INFINITY · CONTROLLED ENTERPRISE DOCUMENT & AUDIT RECORD', 36, 22);
  doc.setFontSize(14);
  doc.text(String(record.documentName || record.title || 'Controlled Record').slice(0, 75), 36, 42);
  doc.setFontSize(8.5);
  doc.text(
    `Doc No: ${record.documentNumber} · Record ID: ${record.recordId} · Version: ${record.versionNumber} · Status: ${record.status}`,
    36,
    58
  );

  y = 90;
  doc.setTextColor(10, 43, 109);
  doc.setFontSize(10);
  doc.text('2. MANDATORY 16-FIELD DOCUMENT CONTROL LEDGER', 36, y);
  y += 8;

  const metaPairs = [
    ['Document Name', record.documentName],
    ['Document Number', record.documentNumber],
    ['Record ID', record.recordId],
    ['Version Number', record.versionNumber],
    ['Status', record.status],
    ['Module', record.module],
    ['Category', record.category],
    ['Owner', record.owner],
    ['Department', record.department],
    ['Created Date', record.createdDate],
    ['Modified Date', record.modifiedDate],
    ['Last Review Date', record.lastReviewDate],
    ['Next Review Date', record.nextReviewDate],
    ['Review Frequency', record.reviewFrequency],
    ['Approved By', record.approvedBy],
    ['Approval Date', record.approvalDate],
  ];

  doc.setFontSize(8);
  metaPairs.forEach((pair, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 36 : pageWidth / 2 + 6;
    const rowY = y + row * 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`${pair[0]}:`, x, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(String(pair[1] || '—').slice(0, 42), x + 92, rowY);
  });

  y += Math.ceil(metaPairs.length / 2) * 15 + 14;

  const writeSection = (heading, bodyText) => {
    if (y > 740) {
      doc.addPage();
      y = 40;
    }
    doc.setFillColor(245, 240, 255);
    doc.rect(36, y - 10, pageWidth - 72, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(90, 0, 214);
    doc.text(heading, 42, y + 1);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(10, 43, 109);
    const lines = doc.splitTextToSize(String(bodyText || '—'), pageWidth - 80);
    doc.text(lines, 40, y);
    y += lines.length * 11 + 10;
  };

  writeSection('3. PURPOSE', record.purpose);
  writeSection('4. SCOPE', record.scope);
  writeSection('5. RELATED DOCUMENTS & OBLIGATIONS', (record.relatedDocuments || []).join(' · '));
  writeSection(
    '6. MAIN CONTROLLED CONTENT & VERIFICATION FIELDS',
    (record.mainFields || []).map((f) => `${f.label}: ${f.value}`).join('\n')
  );
  writeSection('7. EVIDENCE SECTION', (record.evidenceItems || []).map((e, i) => `${i + 1}. ${e}`).join('\n'));
  writeSection('8. ACTIONS SECTION', (record.actionsItems || []).map((a, i) => `${i + 1}. ${a}`).join('\n'));
  writeSection(
    '9. REVIEW SECTION',
    `Reviewer: ${record.reviewer || record.owner} · Review Date: ${record.lastReviewDate} · Outcome: ${record.reviewOutcome || 'Compliant & Verified'} · Next Review: ${record.nextReviewDate}\nFindings & Recommendations: ${record.reviewNotes || 'All NDIS & enterprise governance checkpoints verified.'}`
  );
  writeSection(
    '10. APPROVAL SECTION',
    `Approver: ${record.approvedBy} · Approval Date: ${record.approvalDate} · Status: ${record.status}\nApproval Notes: ${record.approvalNotes || 'Approved for live production use and filed to Document Vault & Company Safe.'}`
  );

  // 11. Footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(90, 0, 214);
  doc.text(
    `11. CONTROLLED FOOTER — Filed in Document Vault (${record.category}) & Company Safe Master Copy (${record.documentNumber} ${record.versionNumber})`,
    36,
    815
  );

  doc.save(`${record.documentNumber}-${record.versionNumber}.pdf`);
}

export function exportControlledRecordAsWord(record) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${record.documentNumber} - ${record.documentName}</title>
<style>
  body { font-family: Arial, sans-serif; color: #0A2B6D; margin: 28px; }
  .header { background: linear-gradient(120deg, #0072FF, #5A00D6, #FF2E9A); color: #ffffff; padding: 18px; border-bottom: 4px solid #FF2E9A; }
  h1 { font-size: 18px; margin: 4px 0; }
  h2 { font-size: 13px; color: #5A00D6; border-bottom: 2px solid #C084FC; padding-bottom: 4px; margin-top: 16px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
  th { background: #0A2B6D; color: #ffffff; padding: 6px; text-align: left; border: 1px solid #0A2B6D; }
  td { padding: 6px; border: 1px solid #C084FC; }
  .label { background: #F5F0FF; font-weight: bold; width: 24%; }
  .footer { margin-top: 20px; padding: 10px; background: #F5F0FF; border: 1px solid #5A00D6; font-size: 10px; font-weight: bold; }
</style>
</head>
<body>
  <div class="header">
    <div>1. HEADER · COMPLIANCEHR INFINITY CONTROLLED ENTERPRISE RECORD</div>
    <h1>${record.documentName}</h1>
    <div>Document No: ${record.documentNumber} · Record ID: ${record.recordId} · Version: ${record.versionNumber} · Status: ${record.status}</div>
  </div>

  <h2>2. Document Control (16 Mandatory Governance Fields)</h2>
  <table>
    <tr><td class="label">Document Name</td><td>${record.documentName}</td><td class="label">Document Number</td><td>${record.documentNumber}</td></tr>
    <tr><td class="label">Record ID</td><td>${record.recordId}</td><td class="label">Version Number</td><td>${record.versionNumber}</td></tr>
    <tr><td class="label">Status</td><td>${record.status}</td><td class="label">Module</td><td>${record.module}</td></tr>
    <tr><td class="label">Category</td><td>${record.category}</td><td class="label">Owner</td><td>${record.owner}</td></tr>
    <tr><td class="label">Department</td><td>${record.department}</td><td class="label">Review Frequency</td><td>${record.reviewFrequency}</td></tr>
    <tr><td class="label">Created Date</td><td>${record.createdDate}</td><td class="label">Modified Date</td><td>${record.modifiedDate}</td></tr>
    <tr><td class="label">Last Review Date</td><td>${record.lastReviewDate}</td><td class="label">Next Review Date</td><td>${record.nextReviewDate}</td></tr>
    <tr><td class="label">Approved By</td><td>${record.approvedBy}</td><td class="label">Approval Date</td><td>${record.approvalDate}</td></tr>
  </table>

  <h2>3. Purpose</h2>
  <p>${record.purpose}</p>

  <h2>4. Scope</h2>
  <p>${record.scope}</p>

  <h2>5. Related Documents &amp; Linked Records</h2>
  <p>${(record.relatedDocuments || []).join(' · ')}</p>

  <h2>6. Main Content</h2>
  <table>
    <tr><th>Controlled Field</th><th>Verified Operational Value</th></tr>
    ${(record.mainFields || []).map((f) => `<tr><td class="label">${f.label}</td><td>${f.value}</td></tr>`).join('')}
  </table>

  <h2>7. Evidence Section</h2>
  <ul>${(record.evidenceItems || []).map((e) => `<li>${e}</li>`).join('')}</ul>

  <h2>8. Actions Section</h2>
  <ul>${(record.actionsItems || []).map((a) => `<li>${a}</li>`).join('')}</ul>

  <h2>9. Review Section</h2>
  <p><strong>Reviewer:</strong> ${record.reviewer || record.owner} | <strong>Review Date:</strong> ${record.lastReviewDate} | <strong>Outcome:</strong> ${record.reviewOutcome || 'Verified'} | <strong>Next Review:</strong> ${record.nextReviewDate}</p>
  <p><strong>Findings &amp; Recommendations:</strong> ${record.reviewNotes || 'Substantiated with live operational evidence.'}</p>

  <h2>10. Approval Section</h2>
  <p><strong>Approver:</strong> ${record.approvedBy} | <strong>Approval Date:</strong> ${record.approvalDate} | <strong>Status:</strong> ${record.status}</p>
  <p><strong>Notes:</strong> ${record.approvalNotes || 'Approved and locked in Company Safe Master Copy.'}</p>

  <div class="footer">
    11. FOOTER · ComplianceHR Infinity Controlled Master Copy · Automatically filed to Document Vault (${record.category}) &amp; Company Safe (${record.documentNumber} · ${record.versionNumber})
  </div>
</body>
</html>`;
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${record.documentNumber}-${record.versionNumber}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportControlledRecordAsExcel(record) {
  const rows = [
    ['Section', 'Field / Control', 'Verified Value'],
    ['1. Header', 'Platform', 'ComplianceHR Infinity'],
    ['2. Document Control', 'Document Name', record.documentName],
    ['2. Document Control', 'Document Number', record.documentNumber],
    ['2. Document Control', 'Record ID', record.recordId],
    ['2. Document Control', 'Version Number', record.versionNumber],
    ['2. Document Control', 'Status', record.status],
    ['2. Document Control', 'Module', record.module],
    ['2. Document Control', 'Category', record.category],
    ['2. Document Control', 'Owner', record.owner],
    ['2. Document Control', 'Department', record.department],
    ['2. Document Control', 'Created Date', record.createdDate],
    ['2. Document Control', 'Modified Date', record.modifiedDate],
    ['2. Document Control', 'Last Review Date', record.lastReviewDate],
    ['2. Document Control', 'Next Review Date', record.nextReviewDate],
    ['2. Document Control', 'Review Frequency', record.reviewFrequency],
    ['2. Document Control', 'Approved By', record.approvedBy],
    ['2. Document Control', 'Approval Date', record.approvalDate],
    ['3. Purpose', 'Purpose', record.purpose],
    ['4. Scope', 'Scope', record.scope],
    ['5. Related Documents', 'Linked Documents', (record.relatedDocuments || []).join(' | ')],
    ...(record.mainFields || []).map((f) => ['6. Main Content', f.label, f.value]),
    ...(record.evidenceItems || []).map((e, i) => ['7. Evidence Section', `Evidence ${i + 1}`, e]),
    ...(record.actionsItems || []).map((a, i) => ['8. Actions Section', `Action ${i + 1}`, a]),
    ['9. Review Section', 'Reviewer & Outcome', `${record.reviewer || record.owner} (${record.reviewOutcome || 'Verified'})`],
    ['10. Approval Section', 'Approver & Date', `${record.approvedBy} (${record.approvalDate})`],
    ['11. Footer', 'Vault & Safe Storage', `Document Vault -> ${record.category} -> ${record.documentName}`],
  ];

  const tableHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><table border="1">${rows
    .map(
      (r, idx) =>
        `<tr>${r
          .map((c) =>
            idx === 0
              ? `<th style="background:#0A2B6D;color:#ffffff;padding:6px;">${c}</th>`
              : `<td style="padding:6px;">${String(c ?? '')}</td>`
          )
          .join('')}</tr>`
    )
    .join('')}</table></body></html>`;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${record.documentNumber}-${record.versionNumber}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportControlledRecordAsCsv(record) {
  const rows = [
    { section: 'Document Control', field: 'Document Name', value: record.documentName },
    { section: 'Document Control', field: 'Document Number', value: record.documentNumber },
    { section: 'Document Control', field: 'Record ID', value: record.recordId },
    { section: 'Document Control', field: 'Version Number', value: record.versionNumber },
    { section: 'Document Control', field: 'Status', value: record.status },
    { section: 'Document Control', field: 'Module', value: record.module },
    { section: 'Document Control', field: 'Category', value: record.category },
    { section: 'Document Control', field: 'Owner', value: record.owner },
    { section: 'Document Control', field: 'Department', value: record.department },
    { section: 'Document Control', field: 'Created Date', value: record.createdDate },
    { section: 'Document Control', field: 'Modified Date', value: record.modifiedDate },
    { section: 'Document Control', field: 'Last Review Date', value: record.lastReviewDate },
    { section: 'Document Control', field: 'Next Review Date', value: record.nextReviewDate },
    { section: 'Document Control', field: 'Review Frequency', value: record.reviewFrequency },
    { section: 'Document Control', field: 'Approved By', value: record.approvedBy },
    { section: 'Document Control', field: 'Approval Date', value: record.approvalDate },
    { section: 'Purpose', field: 'Purpose', value: record.purpose },
    { section: 'Scope', field: 'Scope', value: record.scope },
    ...(record.mainFields || []).map((f) => ({ section: 'Main Content', field: f.label, value: f.value })),
    ...(record.evidenceItems || []).map((e, i) => ({ section: 'Evidence', field: `Evidence ${i + 1}`, value: e })),
    ...(record.actionsItems || []).map((a, i) => ({ section: 'Actions', field: `Action ${i + 1}`, value: a })),
  ];
  downloadCsv(`${record.documentNumber}-${record.versionNumber}.csv`, [
    { key: 'section', label: 'Section' },
    { key: 'field', label: 'Field' },
    { key: 'value', label: 'Value' },
  ], rows);
}

/**
 * Automatically saves any generated form, template, or report into:
 * 1) Document Vault (FormsLibraryDocument & FormSubmission under Module -> Category -> Subject)
 * 2) Company Safe (CompanySafeDocument & CompanyDocument as Protected Master Copy + Version/Review/Approval History)
 * 3) Permanent Audit & Change History (AuditLog & StatusLog)
 */
export async function autoFileToVaultAndCompanySafe(record, actionKind = 'Controlled Form Filed') {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  await Promise.allSettled([
    // 1. Document Vault (FormsLibraryDocument)
    base44.entities.FormsLibraryDocument.create({
      library: `Document Vault · ${record.category || 'Compliance'}`,
      document_type: record.category || 'Compliance',
      title: `${record.documentNumber} — ${record.documentName} (${record.versionNumber})`,
      person_name: record.owner || 'ComplianceHR Infinity',
      file_name: `${record.documentNumber}-${record.versionNumber}.pdf`,
      uploaded_date: today,
      uploaded_by: record.approvedBy || record.owner || 'Provider Administrator',
    }),
    // 2. Online Vault Submission (FormSubmission)
    base44.entities.FormSubmission.create({
      form_title: `${record.documentNumber} — ${record.documentName}`,
      category: record.category || 'Compliance',
      submitted_by: record.owner || 'Provider Administrator',
      submitted_date: today,
      submission_method: 'Online',
      online_document: true,
      status: 'Reviewed',
      review_outcome: 'Approved',
      reviewed_date: today,
      submission_summary: `Filed under Document Vault → ${record.module} → ${record.category} → ${record.documentName} (${record.versionNumber}).`,
      data: JSON.stringify(record),
    }),
    // 3. Company Safe Protected Master Copy (CompanyDocument)
    base44.entities.CompanyDocument.create({
      name: `[MASTER COPY] ${record.documentNumber} — ${record.documentName}`,
      category: record.category || 'Governance',
      version: record.versionNumber || 'v1.0',
      status: 'Current',
      issue_date: record.createdDate || today,
      expiry_date: record.nextReviewDate || today,
      notes: `Protected Master Copy & Working Copy History | Module: ${record.module} | Owner: ${record.owner} | Approved By: ${record.approvedBy} on ${record.approvalDate}`,
    }),
    // 4. Permanent Audit & Change Log
    base44.entities.AuditLog?.create?.({
      action: actionKind,
      entity_type: record.module || 'ControlledDocument',
      entity_id: record.documentNumber,
      details: `${record.documentNumber} (${record.versionNumber}) filed to Document Vault (${record.category}) & Company Safe Master Copy. Approved by ${record.approvedBy}.`,
      performed_by: record.approvedBy || 'Provider Administrator',
      timestamp: nowIso,
    }),
  ]);
}