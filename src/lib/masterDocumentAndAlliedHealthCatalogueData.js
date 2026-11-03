// ComplianceHR Infinity — Master 12-Register Document Catalogue & Numbered Allied Health OS Master Catalogue
// Every item includes: Numbered Code, Clinical/Operational Owner, Review Cycle, and Multi-Standard Mapping.

export const LEVEL_2_DOCUMENT_STANDARDS = [
  { field: 'Purpose', spec: 'Statutory, clinical or operational objective of the controlled document/form' },
  { field: 'Scope', spec: 'Applicable operating system, discipline, workforce roles and participant cohorts' },
  { field: 'Author', spec: 'Subject-matter clinical lead or governance author' },
  { field: 'Approver', spec: 'Executive, Clinical Governance Lead or Provider Administrator sign-off' },
  { field: 'Version', spec: 'Semantic version control (v1.0+) with immutable supersession history' },
  { field: 'Review Date', spec: 'Automated review cycle (Quarterly, 6-Monthly, Annual, Per Episode)' },
  { field: 'Compliance Standards Mapping', spec: 'NDIS Practice Standards, Strengthened Aged Care Standards, WHS & Privacy' },
  { field: 'Evidence Mapping', spec: 'Direct link to Evidence Register, Audit Checklist & 360° Dossier' },
  { field: 'Owner', spec: 'Designated Clinical Owner or Operational Manager accountable for currency' },
  { field: 'Workflow', spec: 'Draft → Submitted → Under Review → Approved → Evidenced → Archived' },
  { field: 'Auto Fill Rules', spec: '90% pre-filled from Participant/Staff 360° Profile & Organisational Memory' },
  { field: 'AI Guidance', spec: 'Domain AI Agent pre-populates clinical summaries, risks and recommendations' },
  { field: 'Mobile Support', spec: 'Responsive offline-capable capture for frontline and community clinicians' },
  { field: 'Digital Signatures', spec: 'Multi-party timestamped participant, guardian, witness & clinician sign-off' },
  { field: 'Attachments', spec: 'Private URI evidence uploads linked to Universal Storage & Company Safe' },
  { field: 'Related Documents', spec: 'Bi-directional links to Policies, Procedures, Risks, Goals & Reports' },
];

export const OT_FCA_13_SECTIONS = [
  {
    sectionNumber: 'Section 1',
    title: 'Participant Details & Consent',
    fields: [
      { key: 'participant_full_name', label: 'Participant Full Name', type: 'text', autoFillFrom: 'full_name' },
      { key: 'ndis_aged_care_number', label: 'NDIS / Aged Care ID Number', type: 'text', autoFillFrom: 'ndis_number' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', autoFillFrom: 'date_of_birth' },
      { key: 'primary_address', label: 'Residential Address & SIL/SDA Setting', type: 'text', autoFillFrom: 'address' },
      { key: 'nominee_guardian', label: 'Nominee / Guardian / Advocate Details', type: 'text', autoFillFrom: 'emergency_contact_name' },
      { key: 'informed_consent_verified', label: 'Informed Consent & Authority to Share Verified', type: 'select', options: ['Verified - Signed Consent on File', 'Verbal Consent Recorded', 'Guardian Consent Verified'] },
    ],
  },
  {
    sectionNumber: 'Section 2',
    title: 'Referral Information & Clinical Trigger',
    fields: [
      { key: 'referral_source', label: 'Referrer Name, Role & Organisation', type: 'text' },
      { key: 'referral_reason', label: 'Reason for Functional Capacity Assessment (Plan Review / Change of Circumstances / SIL-SDA)', type: 'textarea' },
      { key: 'assessment_dates', label: 'Assessment Date(s) & Clinical Setting (Home / Community / Clinic)', type: 'text' },
    ],
  },
  {
    sectionNumber: 'Section 3',
    title: 'Living Situation & Social Environment',
    fields: [
      { key: 'housing_type', label: 'Current Accommodation Type (Private / SIL / SDA / Residential Aged Care)', type: 'select', options: ['Private Residence - Alone', 'Private Residence - With Family/Informal Supports', 'Supported Independent Living (SIL)', 'Specialist Disability Accommodation (SDA)', 'Residential Aged Care'] },
      { key: 'informal_supports', label: 'Informal Support Network & Carer Sustainability Assessment', type: 'textarea' },
      { key: 'environmental_barriers', label: 'Access, Steps, Bathroom, Kitchen & Emergency Egress Barriers', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 4',
    title: 'Medical History, Diagnoses & Clinical Baseline',
    fields: [
      { key: 'primary_disability', label: 'Primary Disability / Diagnosis', type: 'text', autoFillFrom: 'primary_diagnosis' },
      { key: 'secondary_conditions', label: 'Secondary Diagnoses & Co-occurring Conditions', type: 'textarea' },
      { key: 'medications_impact', label: 'Current Medications & Functional Impact (Fatigue, Balance, Cognition)', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 5',
    title: 'Standardised Functional Assessment Measures',
    fields: [
      { key: 'whodas_score', label: 'WHODAS 2.0 / Care and Need Scale (CANS) / FIM Composite Score', type: 'text' },
      { key: 'cognitive_executive', label: 'Cognition, Memory, Orientation, Insight & Decision-Making Capacity', type: 'textarea' },
      { key: 'sensory_profile', label: 'Sensory Processing Profile (Auditory, Visual, Tactile, Proprioceptive)', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 6',
    title: 'Personal Activities of Daily Living (PADLs)',
    fields: [
      { key: 'padl_showering_dressing', label: 'Showering, Grooming, Dressing & Hygiene Independence Rating', type: 'select', options: ['Independent', 'Independent with Assistive Technology', 'Supervision / Prompting Required', '1:1 Physical Assistance Required', '2:1 High-Intensity Support Required'] },
      { key: 'padl_toileting_continence', label: 'Toileting & Continence Management', type: 'textarea' },
      { key: 'padl_eating_drinking', label: 'Eating, Drinking & Mealtime Setup', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 7',
    title: 'Instrumental Activities of Daily Living (IADLs)',
    fields: [
      { key: 'iadl_meal_prep', label: 'Meal Planning, Safe Cooking & Kitchen Safety', type: 'textarea' },
      { key: 'iadl_domestic_laundry', label: 'Domestic Cleaning, Laundry & Home Maintenance Capacity', type: 'textarea' },
      { key: 'iadl_finance_medication', label: 'Financial Management, Shopping & Medication Self-Management', type: 'textarea' },
      { key: 'iadl_community_transport', label: 'Community Access, Public Transport & Road Safety', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 8',
    title: 'Mobility, Transfers & Falls Profile',
    fields: [
      { key: 'bed_chair_transfers', label: 'Bed, Chair, Toilet & Vehicle Transfers', type: 'select', options: ['Independent', 'Standby Supervision', '1-Person Minimal Assist', 'Mechanical Hoist / Standing Lifter (2:1)'] },
      { key: 'indoor_outdoor_mobility', label: 'Indoor & Outdoor Mobility, Endurance & Gait Stability', type: 'textarea' },
      { key: 'falls_history', label: '12-Month Falls History & Falls Risk Score (FRAT / Berg)', type: 'text' },
    ],
  },
  {
    sectionNumber: 'Section 9',
    title: 'Assistive Technology (AT) & Equipment Prescription',
    fields: [
      { key: 'current_at', label: 'Existing Assistive Technology & Maintenance Condition', type: 'textarea' },
      { key: 'recommended_at', label: 'Prescribed Low-Cost / Mid-Cost / High-Cost AT & Trial Outcomes', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 10',
    title: 'Clinical, Environmental & Safeguarding Risks',
    fields: [
      { key: 'overall_risk_rating', label: 'ISO 31000 Functional Risk Rating', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'pressure_skin_risk', label: 'Waterlow / Braden Pressure Injury & Skin Integrity Risk', type: 'text' },
      { key: 'emergency_evacuation', label: 'Personal Emergency Evacuation Plan (PEEP) Requirements', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 11',
    title: '24-Hour Daily Function & Support Ratio Profile',
    fields: [
      { key: 'morning_afternoon_support', label: 'Morning (06:00–14:00) & Afternoon (14:00–22:00) Support Ratio', type: 'text' },
      { key: 'overnight_support', label: 'Overnight Support Requirement (Unattended / Passive Sleepover / Active Night)', type: 'select', options: ['No Overnight Support Required', 'On-Call Drop-In Support', 'Passive Overnight Sleepover (1:1 or Shared)', 'Active Overnight Awake Support (1:1 or 2:1)'] },
    ],
  },
  {
    sectionNumber: 'Section 12',
    title: 'Clinical & Multidisciplinary Recommendations',
    fields: [
      { key: 'ot_therapy_plan', label: 'Recommended Occupational Therapy Intervention Frequency & Hours', type: 'textarea' },
      { key: 'multidisciplinary_referrals', label: 'Recommended Allied Health / Nursing Referrals (Speech, Physio, PBS, RN)', type: 'textarea' },
    ],
  },
  {
    sectionNumber: 'Section 13',
    title: 'NDIS Reasonable & Necessary / Aged Care Funding Justification',
    fields: [
      { key: 'core_supports_hours', label: 'Recommended Core Daily Living & Community Access Hours (Per Week)', type: 'text' },
      { key: 'capacity_building_hours', label: 'Recommended Capacity Building Improved Daily Living Hours (Annual)', type: 'text' },
      { key: 'capital_at_home_mods', label: 'Recommended Capital AT & Home Modifications Budget ($)', type: 'text' },
      { key: 'clinician_signoff', label: 'Assessing OT Name, AHPRA Registration Number & Digital Signature', type: 'text' },
    ],
  },
];

// ============================================================================
// NUMBERED ALLIED HEALTH OS MASTER CATALOGUE
// ============================================================================
const buildNumberedItems = (prefix, discipline, defaultOwner, defaultApprover, items) =>
  items.map((item, idx) => ({
    code: `${prefix}-${String(idx + 1).padStart(3, '0')}`,
    discipline,
    subGroup: item.subGroup,
    title: item.title,
    docType: item.docType,
    clinicalOwner: item.clinicalOwner || defaultOwner,
    approver: item.approver || defaultApprover,
    reviewCycle: item.reviewCycle || 'Annual',
    ndisStandard: item.ndisStandard || 'NDIS Core Module 1 & 3 (Person-Centred Supports)',
    agedCareStandard: item.agedCareStandard || 'Aged Care Std 3 & Std 5 (Assessment & Clinical Care)',
    clinicalGovStandard: item.clinicalGovStandard || 'Clinical Governance Standard 1 & 3 (Safe & Effective Care)',
    professionalStandard: item.professionalStandard || 'AHPRA & National Allied Health Competency Framework',
    evidenceRegister: item.evidenceRegister || 'Allied Health Assessment & Evidence Register',
    riskControl: item.riskControl || 'Clinical Risk & Safeguarding Control Matrix',
    operatingSystem: 'Allied Health OS',
  }));

export const ALLIED_HEALTH_NUMBERED_CATALOGUE = [
  ...buildNumberedItems(
    'AH-GOV',
    '1. Allied Health Clinical Governance Layer',
    'Director of Allied Health & Clinical Governance',
    'Chief Executive Officer / Clinical Governance Committee',
    [
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Framework', docType: 'Framework', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 2 Provider Governance', agedCareStandard: 'Aged Care Std 2 & Std 5 Clinical Governance' },
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Committee Charter & Minutes', docType: 'Governance Record', reviewCycle: 'Quarterly', ndisStandard: 'NDIS Core 2 Governance', agedCareStandard: 'Aged Care Std 2 Governing Body' },
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Master Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Core 2 Quality Management', agedCareStandard: 'Aged Care Std 5.1 Clinical Governance' },
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Executive Dashboard', docType: 'Dashboard Spec', reviewCycle: 'Monthly', ndisStandard: 'NDIS Core 2 Performance Monitoring', agedCareStandard: 'Aged Care Std 2 Quality Indicators' },
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Annual Review', docType: 'Review', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 2 Management Review', agedCareStandard: 'Aged Care Std 5 Annual Clinical Review' },
      { subGroup: 'Clinical Governance', title: 'Clinical Governance Audit Program', docType: 'Audit Program', reviewCycle: '6-Monthly', ndisStandard: 'NDIS Internal Audit Requirement', agedCareStandard: 'Aged Care Std 2 Continuous Improvement' },
      { subGroup: 'Clinical Governance', title: 'Clinical Risk Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Core 2 Risk Management', agedCareStandard: 'Aged Care Std 5 Clinical Risk' },
      { subGroup: 'Clinical Governance', title: 'Clinical Incident Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Reportable Incidents Rules', agedCareStandard: 'Aged Care SIRS Priority 1 & 2' },
      { subGroup: 'Clinical Governance', title: 'Clinical Escalation Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Core 4 Safe Environment', agedCareStandard: 'Aged Care Std 5 Deterioration Escalation' },
      { subGroup: 'Clinical Governance', title: 'Clinical Competency Framework', docType: 'Framework', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 2 Human Resource Management', agedCareStandard: 'Aged Care Std 2 Skilled Workforce' },
      { subGroup: 'Clinical Governance', title: 'Clinical Supervision Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Worker Supervision Standard', agedCareStandard: 'Aged Care Std 2 Workforce Support' },
      { subGroup: 'Clinical Governance', title: 'Clinical Training Register', docType: 'Register', reviewCycle: 'Quarterly', ndisStandard: 'NDIS Mandatory & Clinical Training', agedCareStandard: 'Aged Care Std 2 Clinical Education' },
      { subGroup: 'Clinical Governance', title: 'Clinical Quality Improvement Register', docType: 'Register', reviewCycle: 'Quarterly', ndisStandard: 'NDIS Core 2 Continuous Improvement', agedCareStandard: 'Aged Care Std 2 CAPA' },
      { subGroup: 'Clinical Evidence Library', title: 'Allied Health Practice Guidelines', docType: 'Guideline', reviewCycle: 'Annual', professionalStandard: 'AHPRA Evidence-Based Practice Guidelines' },
      { subGroup: 'Clinical Evidence Library', title: 'Multidisciplinary Clinical Pathways', docType: 'Pathway', reviewCycle: 'Annual', professionalStandard: 'National Allied Health Clinical Pathways' },
      { subGroup: 'Clinical Evidence Library', title: 'Evidence-Based Practice Resource Compendium', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Clinical Evidence Library', title: 'Clinical Research & Outcomes Register', docType: 'Register', reviewCycle: 'Annual' },
      { subGroup: 'Clinical Evidence Library', title: 'Clinical Resource Library', docType: 'Library', reviewCycle: 'Annual' },
      { subGroup: 'Clinical Evidence Library', title: 'Allied Health Professional Standards Library', docType: 'Standard', reviewCycle: 'Annual', professionalStandard: 'AHPRA / OTA / SPA / APA / APS / AASW / ESSA' },
    ]
  ),
  ...buildNumberedItems(
    'AH-OT',
    '2. Occupational Therapy (OT) Master Catalogue',
    'Principal Occupational Therapist (AHPRA Registered)',
    'Allied Health Clinical Director',
    [
      { subGroup: 'OT Intake', title: 'OT Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'Occupational Therapy Australia (OTA) & AHPRA' },
      { subGroup: 'OT Intake', title: 'OT Intake Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'OTA Clinical Intake Standard' },
      { subGroup: 'OT Intake', title: 'OT Waiting List & Priority Register', docType: 'Register', reviewCycle: 'Monthly', professionalStandard: 'OTA Triage & Equity Standard' },
      { subGroup: 'OT Intake', title: 'OT Clinical Triage Tool', docType: 'Assessment', reviewCycle: '6-Monthly', professionalStandard: 'OTA Risk-Based Triage' },
      { subGroup: 'OT Intake', title: 'OT Informed Consent Form', docType: 'Consent', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 1 Privacy & Dignity' },
      { subGroup: 'OT Assessments — Functional', title: 'Functional Capacity Assessment (13-Section Enterprise FCA)', docType: 'Assessment', reviewCycle: 'Per Episode / Annual', ndisStandard: 'NDIS Core 3 Assessment & Planning', has13SectionFca: true },
      { subGroup: 'OT Assessments — Functional', title: 'Functional Independence Assessment (FIM / FAM)', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Functional', title: 'Personal Daily Living (PADL) Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Functional', title: 'Instrumental ADL (IADL) Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Functional', title: 'Community Access & Mobility Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Environmental', title: 'Comprehensive Home Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 4 Safe Environment' },
      { subGroup: 'OT Assessments — Environmental', title: 'Home Safety & Falls Hazard Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Environmental', title: 'Sensory & Environmental Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Environmental', title: 'Workplace Ergonomic & Access Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Environmental', title: 'School & Educational Participation Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Equipment', title: 'Assistive Technology (AT) Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Capital Assistive Technology Guidelines' },
      { subGroup: 'OT Assessments — Equipment', title: 'Complex Equipment Trial & Prescription Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Equipment', title: 'Wheelchair & Power Mobility Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Equipment', title: 'Custom Seating & Postural Positioning Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Equipment', title: 'Pressure Care & Mattress/Cushion Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', agedCareStandard: 'Aged Care Std 5 Pressure Injury Prevention' },
      { subGroup: 'OT Assessments — Housing', title: 'Specialist Disability Accommodation (SDA) Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Module 5 SDA Standards' },
      { subGroup: 'OT Assessments — Housing', title: 'Supported Independent Living (SIL) Roster of Care Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS 2026 SIL Practice Standards' },
      { subGroup: 'OT Assessments — Housing', title: 'Complex Home Modification Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'OT Assessments — Risk', title: 'OT Falls Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Assessments — Risk', title: 'Manual Handling & Transfer Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'WHS Manual Tasks Code of Practice' },
      { subGroup: 'OT Assessments — Risk', title: 'Individual Functional Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Reports', title: 'OT Initial Assessment Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'OT Reports', title: 'Functional Capacity Assessment (FCA) Report', docType: 'Report', reviewCycle: 'Annual' },
      { subGroup: 'OT Reports', title: 'OT Therapy Progress Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Reports', title: 'OT Plan Review Report', docType: 'Report', reviewCycle: 'Annual' },
      { subGroup: 'OT Reports', title: 'NDIS Assistive Technology Justification Report', docType: 'Report', reviewCycle: 'Per Prescription' },
      { subGroup: 'OT Reports', title: 'Complex Home Modification Scope & Report', docType: 'Report', reviewCycle: 'Per Project' },
      { subGroup: 'OT Reports', title: 'SIL / SDA Funding Recommendation Report', docType: 'Report', reviewCycle: 'Annual' },
      { subGroup: 'OT Reviews', title: 'OT Goal Achievement Review', docType: 'Review', reviewCycle: 'Quarterly' },
      { subGroup: 'OT Reviews', title: 'Functional Capacity Re-Review', docType: 'Review', reviewCycle: 'Annual' },
      { subGroup: 'OT Reviews', title: 'Prescribed Equipment Safety & Fit Review', docType: 'Review', reviewCycle: '6-Monthly' },
      { subGroup: 'OT Reviews', title: 'OT Participant Outcome Review', docType: 'Review', reviewCycle: '6-Monthly' },
    ]
  ),
  ...buildNumberedItems(
    'AH-SP',
    '3. Speech Pathology Master Catalogue',
    'Principal Speech Pathologist (CPSPs / SPA)',
    'Allied Health Clinical Director',
    [
      { subGroup: 'Speech Intake', title: 'Speech Pathology Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'Speech Pathology Australia (SPA) Standards' },
      { subGroup: 'Speech Intake', title: 'Speech Pathology Intake & Case History', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'SPA Clinical Practice Standards' },
      { subGroup: 'Speech Intake', title: 'Personalised Communication Profile', docType: 'Profile', reviewCycle: '6-Monthly', ndisStandard: 'NDIS Core 1 Communication & Choice' },
      { subGroup: 'Assessments — Communication', title: 'Comprehensive Communication Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Communication', title: 'Functional Communication Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Communication', title: 'Expressive Language Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Communication', title: 'Receptive Language & Comprehension Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Swallowing', title: 'Clinical Swallowing Examination', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'NDIS Mealtime Management Practice Standard', agedCareStandard: 'Aged Care Std 5 Safe Mealtime & Nutrition' },
      { subGroup: 'Assessments — Swallowing', title: 'Mealtime Management & IDDSI Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'NDIS High Intensity Dysphagia & Mealtime' },
      { subGroup: 'Assessments — Swallowing', title: 'Dysphagia Choking & Aspiration Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — AAC', title: 'Augmentative & Alternative Communication (AAC) Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — AAC', title: 'Speech Generating Device Trial & Prescription Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Social', title: 'Pragmatic & Social Skills Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Social', title: 'Community Communication Participation Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Speech Reports', title: 'Speech & Language Assessment Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'Speech Reports', title: 'AAC AT Device Recommendation Report', docType: 'Report', reviewCycle: 'Per Prescription' },
      { subGroup: 'Speech Reports', title: 'Swallowing & Mealtime Management Plan Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'Speech Reports', title: 'Speech Pathology Progress Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'Speech Reports', title: 'Speech Pathology Plan Review Report', docType: 'Report', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-PT',
    '4. Physiotherapy Master Catalogue',
    'Principal Physiotherapist (AHPRA / APA)',
    'Allied Health Clinical Director',
    [
      { subGroup: 'Physiotherapy Intake', title: 'Physiotherapy Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'AHPRA Physiotherapy Board & APA' },
      { subGroup: 'Physiotherapy Intake', title: 'Physiotherapy Clinical Intake & Screening', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Mobility', title: 'Comprehensive Mobility & Postural Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', agedCareStandard: 'Aged Care Std 5 Mobility & Falls' },
      { subGroup: 'Assessments — Mobility', title: 'Observational Gait & Biomechanical Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Mobility', title: 'Berg Balance & Dynamic Stability Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Strength', title: 'Manual Muscle Testing & Strength Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Strength', title: '6-Minute Walk & Cardiorespiratory Endurance Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Functional', title: 'Functional Mobility & Gross Motor Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Functional', title: 'Safe Transfer & Hoist/Sling Prescription Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'WHS Safe Patient Handling' },
      { subGroup: 'Assessments — Risk', title: 'Multifactorial Falls Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Risk', title: 'Physical Musculoskeletal & Contracture Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Physiotherapy Reports', title: 'Initial Physiotherapy Assessment Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'Physiotherapy Reports', title: 'Physiotherapy Progress Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'Physiotherapy Reports', title: 'Physiotherapy NDIS / Aged Care Review Report', docType: 'Report', reviewCycle: 'Annual' },
      { subGroup: 'Physiotherapy Reports', title: 'Individualised Exercise & Mobility Program Report', docType: 'Report', reviewCycle: '6-Monthly' },
    ]
  ),
  ...buildNumberedItems(
    'AH-PSY',
    '5. Psychology & Behaviour Support Master Catalogue',
    'Principal Psychologist / Specialist Behaviour Support Practitioner (AHPRA / NDIS Commission)',
    'Director of Clinical Governance',
    [
      { subGroup: 'Psychology Intake', title: 'Psychology & Behaviour Support Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'AHPRA Psychology Board & NDIS PBS Capability Framework' },
      { subGroup: 'Psychology Intake', title: 'Psychological Intake & Trauma-Informed Screening', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Mental Health', title: 'Comprehensive Mental Health &MSE Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Mental Health', title: 'Psychosocial Disability & Recovery Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Behaviour', title: 'Functional Behaviour Assessment (FBA)', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Module 2a Specialist Behaviour Support' },
      { subGroup: 'Assessments — Behaviour', title: 'Behaviour Support & Restrictive Practice Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'NDIS Regulated Restrictive Practices Rules', agedCareStandard: 'Aged Care Restrictive Practices Governance' },
      { subGroup: 'Assessments — Capacity', title: 'Supported Decision-Making Capacity Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 1 Support for Decision-Making' },
      { subGroup: 'Assessments — Capacity', title: 'Cognitive & Adaptive Functioning Capacity Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Wellbeing', title: 'Emotional Wellbeing & Quality of Life Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Wellbeing', title: 'Psychological Resilience & Coping Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Psychology Reports', title: 'Psychological Assessment & Diagnostic Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'Psychology Reports', title: 'Interim & Comprehensive Behaviour Support Plan (BSP) Report', docType: 'Report', reviewCycle: 'Annual', ndisStandard: 'NDIS Module 2a Lodging Requirement' },
      { subGroup: 'Psychology Reports', title: 'Psychology & Therapy Progress Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'Psychology Reports', title: 'Psychology Plan Review Report', docType: 'Report', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-SW',
    '6. Social Work Master Catalogue',
    'Principal Social Worker (AASW Accredited)',
    'Allied Health Clinical Director',
    [
      { subGroup: 'Social Work Intake', title: 'Social Work Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'Australian Association of Social Workers (AASW) Practice Standards' },
      { subGroup: 'Social Work Intake', title: 'Social Work Psychosocial Intake Form', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Family', title: 'Family Systems & Carer Sustainability Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Family', title: 'Domestic, Family & Interpersonal Relationship Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Community', title: 'Community Participation & Social Capital Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Community', title: 'Social Inclusion, Cultural Safety & Belonging Assessment', docType: 'Assessment', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 1 Culture, Diversity & Values' },
      { subGroup: 'Assessments — Advocacy', title: 'Independent Advocacy & Rights Needs Assessment', docType: 'Assessment', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Welfare', title: 'Social Determinants & Housing/Financial Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Welfare', title: 'Vulnerability, Abuse/Neglect & Safeguarding Assessment', docType: 'Assessment', reviewCycle: '6-Monthly', ndisStandard: 'NDIS Core 1 Violence, Abuse, Neglect & Exploitation' },
      { subGroup: 'Social Work Reports', title: 'Comprehensive Social Work Assessment Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'Social Work Reports', title: 'Systemic & Individual Advocacy Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'Social Work Reports', title: 'Community Participation & Psychosocial Outcomes Report', docType: 'Report', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-EP',
    '7. Exercise Physiology Master Catalogue',
    'Principal Accredited Exercise Physiologist (ESSA AEP)',
    'Allied Health Clinical Director',
    [
      { subGroup: 'EP Intake', title: 'Exercise Physiology Referral Form', docType: 'Form', reviewCycle: 'Annual', professionalStandard: 'Exercise & Sports Science Australia (ESSA) AEP Standards' },
      { subGroup: 'EP Intake', title: 'Exercise Physiology Pre-Exercise Screening (APSS)', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Assessments — Activity', title: 'Habitual Physical Activity & Sedentary Behaviour Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Fitness', title: 'Submaximal Aerobic Fitness Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Fitness', title: 'Functional Strength & Muscular Conditioning Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Fitness', title: 'Muscular Endurance & Fatigue Tolerance Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Health', title: 'Cardiometabolic & Chronic Disease Risk Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'Assessments — Health', title: 'Exercise Safety & Vital Sign Threshold Assessment', docType: 'Assessment', reviewCycle: '6-Monthly' },
      { subGroup: 'EP Reports', title: 'Exercise Physiology Initial Assessment Report', docType: 'Report', reviewCycle: 'Per Episode' },
      { subGroup: 'EP Reports', title: 'Prescribed Clinical Exercise & Reablement Program Report', docType: 'Report', reviewCycle: '6-Monthly' },
      { subGroup: 'EP Reports', title: 'Exercise Physiology Progress & NDIS Review Report', docType: 'Report', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-MDT',
    '8. Multidisciplinary Shared Catalogue',
    'Multidisciplinary Case Lead / Allied Health Manager',
    'Director of Allied Health & Clinical Governance',
    [
      { subGroup: 'Shared Intake', title: 'Multidisciplinary Allied Health Referral', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Shared Intake', title: 'Unified Allied Health Intake Dossier', docType: 'Form', reviewCycle: 'Annual' },
      { subGroup: 'Shared Intake', title: 'Multidisciplinary Informed Consent & Sharing Authority', docType: 'Consent', reviewCycle: 'Annual' },
      { subGroup: 'Shared Planning', title: 'Allied Health Care Plan', docType: 'Plan', reviewCycle: '6-Monthly' },
      { subGroup: 'Shared Planning', title: 'Allied Health Goal & GAS Scale Plan', docType: 'Plan', reviewCycle: '6-Monthly' },
      { subGroup: 'Shared Planning', title: 'Integrated Multidisciplinary Care Plan', docType: 'Plan', reviewCycle: '6-Monthly', agedCareStandard: 'Aged Care Std 3 & Std 5 Multidisciplinary Care' },
      { subGroup: 'Shared Reviews', title: 'Multidisciplinary Case Review', docType: 'Review', reviewCycle: 'Quarterly' },
      { subGroup: 'Shared Reviews', title: 'Multidisciplinary Case Conference Record', docType: 'Record', reviewCycle: 'Per Conference' },
      { subGroup: 'Shared Reviews', title: 'Allied Health Goal Attainment Review', docType: 'Review', reviewCycle: 'Quarterly' },
      { subGroup: 'Shared Reviews', title: 'Multidisciplinary Outcome Evaluation Review', docType: 'Review', reviewCycle: '6-Monthly' },
      { subGroup: 'Outcomes Registers', title: 'Standardised Outcome Measures Register (GAS / COPM / WHODAS)', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Outcomes Registers', title: 'Participant Goal Achievement Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Outcomes Registers', title: 'Clinical Progress Tracking Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Shared Communication', title: 'General Practitioner (GP) Shared Care Communication Template', docType: 'Template', reviewCycle: 'Annual' },
      { subGroup: 'Shared Communication', title: 'Medical Specialist & Hospital Handover Communication Template', docType: 'Template', reviewCycle: 'Annual', ndisStandard: 'NDIS Transitions of Care Standard' },
      { subGroup: 'Shared Communication', title: 'Support Worker Clinical Handover & Team Communication Record', docType: 'Record', reviewCycle: 'Monthly' },
    ]
  ),
  ...buildNumberedItems(
    'AH-RES',
    '9. Allied Health Resource Catalogue',
    'Allied Health Education & Resource Lead',
    'Allied Health Clinical Director',
    [
      { subGroup: 'Client Resources', title: 'Condition & Therapy Easy-Read Information Sheets', docType: 'Resource', reviewCycle: 'Annual', ndisStandard: 'NDIS Core 1 Accessible Communication' },
      { subGroup: 'Client Resources', title: 'Illustrated Home Therapy Programs', docType: 'Resource', reviewCycle: '6-Monthly' },
      { subGroup: 'Client Resources', title: 'Tailored Home Exercise Programs', docType: 'Resource', reviewCycle: '6-Monthly' },
      { subGroup: 'Client Resources', title: 'Low-Tech & High-Tech Communication Tools', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Client Resources', title: 'Visual Schedules, Social Stories & Sensory Supports', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Client Resources', title: 'Participant Self-Management Education Resources', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Family Resources', title: 'Family & Nominee Clinical Education Packs', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Family Resources', title: 'Carer Safe Transfer & Mealtime Guides', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Family Resources', title: 'Home Environment Support Resources', docType: 'Resource', reviewCycle: 'Annual' },
      { subGroup: 'Staff Resources', title: 'Support Worker Clinical Implementation Guides', docType: 'Guide', reviewCycle: 'Annual' },
      { subGroup: 'Staff Resources', title: 'Standardised Clinical Assessment Manuals', docType: 'Manual', reviewCycle: 'Annual' },
      { subGroup: 'Staff Resources', title: 'NDIS & Aged Care Clinical Report Writing Guides', docType: 'Guide', reviewCycle: 'Annual' },
      { subGroup: 'Staff Resources', title: 'Outcome Measurement (COPM / GAS / FIM) Administration Guides', docType: 'Guide', reviewCycle: 'Annual' },
      { subGroup: 'Staff Resources', title: 'Clinical Governance & Escalation Pocket Guides', docType: 'Guide', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-REG',
    '10. Allied Health Registers & Workforce Trackers',
    'Allied Health Operations & Credentialing Manager',
    'Director of Allied Health & Clinical Governance',
    [
      { subGroup: 'Clinical Registers', title: 'Allied Health Active Caseload Register', docType: 'Register', reviewCycle: 'Weekly' },
      { subGroup: 'Clinical Registers', title: 'Allied Health Intake & Referral Register', docType: 'Register', reviewCycle: 'Weekly' },
      { subGroup: 'Clinical Registers', title: 'Clinical Triage & Waitlist Register', docType: 'Register', reviewCycle: 'Weekly' },
      { subGroup: 'Clinical Registers', title: 'Completed & Due Clinical Assessment Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Clinical Registers', title: 'Multidisciplinary Goal Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Clinical Registers', title: 'Clinical Outcome Measurement Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Governance Registers', title: 'Allied Health Clinical Supervision Register', docType: 'Register', reviewCycle: 'Monthly', ndisStandard: 'NDIS Core 2 Supervision & Support' },
      { subGroup: 'Governance Registers', title: 'Clinician Scope of Practice & Competency Register', docType: 'Register', reviewCycle: '6-Monthly' },
      { subGroup: 'Governance Registers', title: 'Clinical Peer File Audit Register', docType: 'Register', reviewCycle: 'Quarterly' },
      { subGroup: 'Governance Registers', title: 'Allied Health Clinical Incident Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Governance Registers', title: 'Allied Health Clinical Risk Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Workforce Registers', title: 'Continuing Professional Development (CPD) Hours Register', docType: 'Register', reviewCycle: 'Annual', professionalStandard: 'AHPRA / SPA / AASW / ESSA Mandatory CPD' },
      { subGroup: 'Workforce Registers', title: 'AHPRA & Peak Body Professional Registration Register', docType: 'Register', reviewCycle: 'Monthly' },
      { subGroup: 'Workforce Registers', title: 'Allied Health Clinician Credentialing & Medicare/NDIS Provider Register', docType: 'Register', reviewCycle: 'Annual' },
    ]
  ),
  ...buildNumberedItems(
    'AH-RPT',
    '11. Allied Health Enterprise Report Library (All Disciplines)',
    'Discipline Clinical Lead',
    'Allied Health Clinical Director',
    [
      { subGroup: 'Enterprise Reports', title: 'Standardised Initial Clinical Assessment Report', docType: 'Report Template', reviewCycle: 'Annual' },
      { subGroup: 'Enterprise Reports', title: 'Discipline Therapy Progress Report', docType: 'Report Template', reviewCycle: '6-Monthly' },
      { subGroup: 'Enterprise Reports', title: 'Goal Attainment & Review Report', docType: 'Report Template', reviewCycle: 'Quarterly' },
      { subGroup: 'Enterprise Reports', title: 'Validated Functional Outcome Report', docType: 'Report Template', reviewCycle: '6-Monthly' },
      { subGroup: 'Enterprise Reports', title: 'NDIS Reasonable & Necessary Funding Justification Report', docType: 'Report Template', reviewCycle: 'Annual' },
      { subGroup: 'Enterprise Reports', title: 'Plan Reassessment & Annual Review Report', docType: 'Report Template', reviewCycle: 'Annual' },
      { subGroup: 'Enterprise Reports', title: 'Clinical Transition & Discharge Summary Report', docType: 'Report Template', reviewCycle: 'Per Episode' },
      { subGroup: 'Enterprise Reports', title: 'Multidisciplinary Case Conference Summary Report', docType: 'Report Template', reviewCycle: 'Per Conference' },
      { subGroup: 'Enterprise Reports', title: 'Medical Specialist / Hospital Consultation Report', docType: 'Report Template', reviewCycle: 'Per Referral' },
      { subGroup: 'Enterprise Reports', title: 'Allied Health Board & Executive Clinical Governance Summary Report', docType: 'Report Template', reviewCycle: 'Quarterly' },
    ]
  ),
];

// ============================================================================
// 12 MASTER DOCUMENT REGISTERS (FOUNDATION FOR 1,000+ ENTERPRISE DOCUMENTS)
// ============================================================================
const buildRegisterDocs = (regNum, regTitle, operatingSystem, owner, ndisStd, agedStd, groups) => {
  let counter = 1;
  const items = [];
  for (const g of groups) {
    for (const docName of g.docs) {
      items.push({
        code: `REG${String(regNum).padStart(2, '0')}-${String(counter++).padStart(3, '0')}`,
        registerNumber: `Register ${regNum}`,
        registerTitle: regTitle,
        subGroup: g.subGroup,
        docType: g.docType || 'Form / Record',
        title: docName,
        operatingSystem,
        clinicalOwner: owner,
        version: 'v2.4',
        status: 'Active',
        reviewCycle: g.reviewCycle || 'Annual',
        ndisStandard: ndisStd,
        agedCareStandard: agedStd,
        evidenceType: g.evidenceType || 'Statutory Audit Evidence',
        autoFill: 'Yes (90% 360° Profile)',
        aiSupported: 'Yes',
        workflowLinked: 'Yes',
        auditCritical: 'Yes',
        mobileEnabled: 'Yes',
      });
    }
  }
  return items;
};

export const MASTER_12_DOCUMENT_REGISTERS = [
  ...buildRegisterDocs(
    1,
    'Register 1: HR & Workforce Document Register',
    'HR OS & Workforce OS',
    'Human Resources & Workforce Compliance Manager',
    'NDIS Core 2 Human Resource Management & Worker Screening',
    'Aged Care Std 2 Workforce Planning & Competency',
    [
      {
        subGroup: 'Recruitment Forms',
        docType: 'Form',
        docs: [
          'Employment Application', 'Candidate Profile', 'Resume Record', 'Job Requisition Form',
          'Recruitment Approval Form', 'Interview Schedule', 'Interview Questions', 'Interview Scorecard',
          'Candidate Assessment', 'Reference Check Form', 'Criminal History Declaration',
          'Eligibility to Work Declaration', 'Recruitment Outcome Form',
        ],
      },
      {
        subGroup: 'Employment Documents',
        docType: 'Contract / Agreement',
        docs: [
          'Employment Contract', 'Casual Contract', 'Part-Time Contract', 'Full-Time Contract',
          'Fixed-Term Contract', 'Contractor Agreement', 'Volunteer Agreement', 'Position Description',
          'Code of Conduct', 'Confidentiality Agreement', 'Conflict of Interest Declaration',
          'Employee Handbook Acknowledgement', 'IT Usage Agreement', 'Vehicle Use Agreement',
        ],
      },
      {
        subGroup: 'Screening Registers',
        docType: 'Register',
        reviewCycle: 'Monthly',
        docs: [
          'NDIS Screening Register', 'Police Check Register', 'Blue Card Register', 'Driver Licence Register',
          'First Aid Register', 'CPR Register', 'Vaccination Register', 'Professional Registration Register',
          'Qualification Register',
        ],
      },
      {
        subGroup: 'Onboarding & Workforce Forms',
        docType: 'Checklist / Form',
        docs: [
          'Employee Setup Form', 'Onboarding Checklist', 'Induction Checklist', 'Orientation Checklist',
          'Buddy Shift Record', 'Equipment Allocation Form', 'Uniform Allocation Form',
          'Credential Verification Form', 'Availability Form', 'Leave Request', 'Return To Work Plan',
          'Flexible Work Request', 'Timesheet Approval', 'Overtime Approval', 'Shift Change Request',
        ],
      },
      {
        subGroup: 'Performance, Supervision & Development',
        docType: 'Review / Plan',
        reviewCycle: '6-Monthly',
        docs: [
          'Probation Review', 'Performance Review', 'Annual Review', 'Mid-Year Review',
          'Leadership Review', 'Development Review', 'Exit Interview', 'Supervision Record',
          'Clinical Supervision Record', 'Peer Supervision Record', 'Leadership Coaching Record',
          'Development Plan', 'Learning Plan', 'Career Plan', 'Leadership Plan',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    2,
    'Register 2: Participant Document Register',
    'Participant OS & Intake OS',
    'Participant Services & Intake Manager',
    'NDIS Core 1 Rights & Core 3 Provision of Supports',
    'Aged Care Std 1 Person-Centred Care & Std 3 Care Planning',
    [
      {
        subGroup: 'Intake',
        docType: 'Form',
        docs: [
          'Referral Form', 'Intake Form', 'Participant Registration', 'Client Profile',
          'Demographics Form', 'Contact Details Form', 'Emergency Contact Form',
          'Cultural Information Form', 'Communication Profile',
        ],
      },
      {
        subGroup: 'Consent & Agreements',
        docType: 'Consent / Agreement',
        docs: [
          'Consent To Services', 'Consent To Share Information', 'Consent To Collect Information',
          'Telehealth Consent', 'Photography Consent', 'Media Consent', 'Clinical Consent',
          'Guardian Consent', 'Service Agreement', 'Schedule Of Supports', 'Fee Agreement',
          'Terms & Conditions', 'Participant Charter', 'Rights & Responsibilities',
        ],
      },
      {
        subGroup: 'Planning, Reviews & Records',
        docType: 'Plan / Review / Record',
        reviewCycle: '6-Monthly',
        docs: [
          'Initial Support Plan', 'Goal Plan', 'Outcome Plan', 'Service Delivery Plan', 'Care Plan',
          'Participant Review', 'Goal Review', 'Outcome Review', 'Support Plan Review',
          'Service Review', 'Family Review', 'Progress Notes', 'Case Notes', 'Contact Logs',
          'Communication Records',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    3,
    'Register 3: Support Work & Community Supports',
    'Service Delivery OS',
    'Service Delivery & Rostering Operations Lead',
    'NDIS Core 3 Daily Personal Activities & Community Participation',
    'Aged Care Std 4 Services & Supports for Daily Living',
    [
      {
        subGroup: 'Support Work Forms, Assessments & Reviews',
        docType: 'Operational Record',
        reviewCycle: 'Quarterly',
        docs: [
          'Shift Note', 'Progress Note', 'Community Access Record', 'Transport Record',
          'Personal Care Record', 'Meal Assistance Record', 'Medication Assistance Record',
          'Community Participation Record', 'Community Participation Assessment',
          'Support Needs Assessment', 'Daily Living Assessment', 'Community Risk Assessment',
          'Community Support Review', 'Service Review', 'Goal Review',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    4,
    'Register 4: Support Coordination & Recovery Coaching',
    'Outcomes OS & Participant OS',
    'Specialist Support Coordination Lead',
    'NDIS Module 4 Support Coordination Standards',
    'Aged Care Care Management & Care Partner Standards',
    [
      {
        subGroup: 'Intake, Coordination, Reviews & Reports',
        docType: 'Coordination Artefact',
        reviewCycle: '6-Monthly',
        docs: [
          'Support Coordination Intake', 'Complexity Assessment', 'Funding Assessment',
          'Service Mapping Assessment', 'Action Plan', 'Capacity Building Plan',
          'Service Coordination Plan', 'Advocacy Record', 'Provider Engagement Record',
          'Support Coordination Review', 'Funding Review', 'Progress Review', 'Outcome Review',
          'Initial Coordination Report', 'Progress Report', 'Review Report', 'Exit Report',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    5,
    'Register 5: Allied Health Document Register',
    'Allied Health OS',
    'Director of Allied Health & Clinical Governance',
    'NDIS Early Childhood, Behaviour Support & Therapy Standards',
    'Aged Care Std 5 Clinical & Reablement Care',
    [
      {
        subGroup: 'OT, Speech, Physio, Psychology, Social Work & EP',
        docType: 'Clinical Assessment / Report',
        reviewCycle: '6-Monthly',
        docs: [
          'Functional Capacity Assessment', 'Home Assessment', 'ADL Assessment',
          'Assistive Technology Assessment', 'SDA Assessment', 'SIL Assessment',
          'Sensory Assessment', 'Falls Assessment', 'FCA Report', 'AT Report',
          'Home Modifications Report', 'Communication Assessment', 'Swallowing Assessment',
          'AAC Assessment', 'Functional Communication Assessment', 'Mobility Assessment',
          'Strength Assessment', 'Functional Mobility Assessment', 'Mental Health Assessment',
          'Psychosocial Assessment', 'Behaviour Assessment', 'Social Assessment',
          'Family Assessment', 'Community Assessment', 'Advocacy Report',
          'Exercise Assessment', 'Physical Activity Assessment', 'Exercise Physiology Report',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    6,
    'Register 6: Nursing & High-Intensity Clinical Register',
    'Nursing OS & Clinical Governance OS',
    'Clinical Nurse Consultant (CNC) / Registered Nurse Lead',
    'NDIS Module 1 High Intensity Daily Personal Activities',
    'Aged Care Std 5 Clinical Care & Medication Safety',
    [
      {
        subGroup: 'Nursing Assessments, Care Plans, Medication & Reviews',
        docType: 'Clinical Nursing Record',
        reviewCycle: 'Quarterly',
        docs: [
          'Initial Clinical Assessment', 'Health Assessment', 'Falls Assessment',
          'Nutritional Assessment', 'Skin Integrity Assessment', 'Wound Assessment',
          'Clinical Risk Assessment', 'Care Plan', 'Clinical Care Plan', 'Support Plan',
          'Escalation Plan', 'Medication Administration Record', 'Medication Review',
          'Medication Incident Form', 'Clinical Review', 'Care Review',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    7,
    'Register 7: Incidents, Complaints & Investigations',
    'Clinical Governance OS & Quality OS',
    'Compliance & Safeguarding Investigations Manager',
    'NDIS Incident Management & Complaints Rules 2018',
    'Aged Care SIRS & Open Disclosure Framework',
    [
      {
        subGroup: 'Incidents, Investigations & Complaints',
        docType: 'Statutory Investigation Record',
        reviewCycle: 'Monthly',
        docs: [
          'Incident Report', 'Serious Incident Report', 'Near Miss Report', 'Death Report',
          'Injury Report', 'Investigation Record', 'Root Cause Analysis',
          'Corrective Action Plan', 'Preventive Action Plan', 'Complaint Form',
          'Complaint Investigation', 'Complaint Resolution',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    8,
    'Register 8: Risk Register Library',
    'Risk OS',
    'Enterprise Risk & WHS Manager',
    'NDIS Core 2 Risk Management',
    'Aged Care Std 2 & Std 5 Risk Governance',
    [
      {
        subGroup: 'Participant & Organisational Risks',
        docType: 'Risk Assessment / Register',
        reviewCycle: '6-Monthly',
        docs: [
          'Risk Assessment', 'Behaviour Risk Assessment', 'Restrictive Practice Assessment',
          'Environmental Risk Assessment', 'Risk Register', 'Risk Review',
          'Control Assessment', 'Treatment Plan',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    9,
    'Register 9: Quality, Audit & Compliance Library',
    'Quality OS, Audit OS & Compliance OS',
    'Quality & Continuous Improvement Manager',
    'NDIS Core 2 Quality Management & Internal Audit',
    'Aged Care Std 2 Continuous Improvement & Quality Indicators',
    [
      {
        subGroup: 'Quality, Audit & Compliance',
        docType: 'Assurance Record',
        reviewCycle: 'Quarterly',
        docs: [
          'Continuous Improvement Record', 'Improvement Register', 'Improvement Action Plan',
          'Internal Audit Checklist', 'Audit Program', 'Evidence Checklist', 'Audit Report',
          'Audit Findings Register', 'Compliance Review', 'Standards Assessment',
          'Compliance Gap Analysis',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    10,
    'Register 10: Governance & Board Register',
    'Governance OS & Reporting OS',
    'Company Secretary / Chief Executive Officer',
    'NDIS Core 2 Governance & Operational Management',
    'Aged Care Std 2 The Organisation (Governing Body)',
    [
      {
        subGroup: 'Board & Executive Governance',
        docType: 'Board & Executive Artefact',
        reviewCycle: 'Quarterly',
        docs: [
          'Board Agenda', 'Board Minutes', 'Board Action Register', 'Governance Review',
          'Executive Report', 'Compliance Report', 'Risk Report', 'Quality Report',
          'Workforce Report',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    11,
    'Register 11: Safety, WHS & Emergency Register',
    'Safety OS & Emergency Management OS',
    'WHS & Emergency Readiness Coordinator',
    'NDIS Core 2 Emergency & Disaster Management + Core 4 Safe Environment',
    'Aged Care Std 4 Safe Environment & Emergency Readiness',
    [
      {
        subGroup: 'WHS, Emergency & Registers',
        docType: 'WHS / Emergency Record',
        reviewCycle: '6-Monthly',
        docs: [
          'Hazard Report', 'Hazard Assessment', 'Workplace Inspection', 'Incident Investigation',
          'Emergency Plan', 'Evacuation Record', 'Fire Drill Record', 'Emergency Training Record',
          'PPE Register', 'SDS Register', 'First Aid Register', 'Equipment Register',
        ],
      },
    ]
  ),
  ...buildRegisterDocs(
    12,
    'Register 12: Training & Competency Register',
    'Learning OS',
    'Learning, Development & Clinical Educator Lead',
    'NDIS Core 2 Worker Training & High-Intensity Competency',
    'Aged Care Std 2 Skilled & Competent Workforce',
    [
      {
        subGroup: 'Training, Competency & Development',
        docType: 'Competency / LMS Record',
        reviewCycle: 'Annual',
        docs: [
          'Training Record', 'Training Attendance', 'Training Completion',
          'Competency Assessment', 'Observation Checklist', 'Skill Verification',
          'Development Plan', 'Leadership Plan', 'Learning Plan',
        ],
      },
    ]
  ),
];