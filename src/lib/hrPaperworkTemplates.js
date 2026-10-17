/**
 * Professional default wording for employment contracts and position
 * descriptions, tailored per staff role. The user can edit every field
 * before generating the paperwork.
 */

const SUPPORT_WORKER_DUTIES = `Deliver person-centred supports to participants in line with their NDIS plans, support plans and individual routines.
Assist participants with daily living activities, community access, skill development and social participation in a safe and respectful manner.
Follow each participant's support plan, risk management plan and behaviour support plan at all times.
Keep accurate, timely records including shift notes, progress notes and incident reports in the company's systems.
Support participants with medication in line with policy, and complete medication administration records where trained and authorised.
Report all incidents, hazards, near misses and concerns to the nominated supervisor immediately.
Maintain participant privacy, dignity and confidentiality at all times, in line with the NDIS Code of Conduct.`;

const TEAM_LEADER_DUTIES = `Lead, supervise and mentor an allocated team of support workers across rostered services.
Coordinate day-to-day service delivery, including rostering coverage, shift allocation and participant changes.
Review shift notes, progress notes and records completed by the support team and escalate issues promptly.
Support induction, buddy shifts, on-the-job training and competency checks for new team members.
Model and enforce compliance with the NDIS Code of Conduct, company policies and participant support plans.
Complete regular participant file reviews, progress note cycles and audit preparation activities.`;

const ADMIN_DUTIES = `Provide professional administration support including reception, correspondence, data entry and filing.
Maintain accurate staff, participant and compliance records in the company's systems.
Prepare documents, registers and reports as directed by management, maintaining confidentiality at all times.
Support intake, rostering and billing processes as required.
Follow all company policies, privacy requirements and information handling procedures.`;

const MANAGEMENT_DUTIES = `Provide operational and strategic leadership of the service in line with the NDIS Practice Standards and company goals.
Oversee service delivery, quality and safeguards, workforce management and financial performance.
Maintain governance records, risk management, continuous improvement and audit readiness.
Lead, support and develop the management and frontline teams.
Ensure compliance with all legislative, regulatory and funding requirements.`;

const GENERIC_DUTIES = `Perform the duties of the position professionally and in line with the position description, company policies and the NDIS Code of Conduct.
Maintain accurate records and complete required documentation in company systems.
Report incidents, risks and concerns promptly through the required channels.
Support a safe, respectful and inclusive workplace for participants, colleagues and visitors.`;

export function contractDutiesDefault(role) {
  if (/Support Worker|Disability/.test(role || '')) return SUPPORT_WORKER_DUTIES;
  if (/Team Leader|Coordinator/.test(role || '')) return TEAM_LEADER_DUTIES;
  if (/Administration|Finance|Accounts|HR|Marketing|Intake|Compliance|Quality|CRM/.test(role || '')) return ADMIN_DUTIES;
  if (/Management|Manager/.test(role || '')) return MANAGEMENT_DUTIES;
  return GENERIC_DUTIES;
}

const ROLE_PD_DEFAULTS = {
  'Support Worker': {
    purpose: 'To deliver safe, high-quality, person-centred supports that help participants achieve their NDIS goals, live as independently as possible and take part in their community.',
    essential: 'Current NDIS Worker Screening Check. Current First Aid and CPR certificates. Right to work in Australia. Valid driver licence and own reliable vehicle (where community access is required). Clear written and verbal communication skills.',
    qualifications: 'Certificate III in Individual Support (Disability) or equivalent experience supporting people with disability. Experience working under the NDIS Practice Standards is well regarded.',
    measures: 'Quality and timeliness of shift notes and records; participant feedback; compliance currency (screening, first aid, CPR, training); incident and hazard reporting; reliability and roster adherence.',
  },
  'Team Leader': {
    purpose: 'To lead an allocated support team, coordinate day-to-day service delivery and ensure every shift is delivered safely, compliantly and in line with participant support plans.',
    essential: 'Current NDIS Worker Screening Check. Current First Aid and CPR certificates. Right to work in Australia. Demonstrated supervisory or leadership experience in disability or community services. Strong knowledge of the NDIS Code of Conduct and Practice Standards.',
    qualifications: 'Certificate IV in Disability or Leadership and Management (or working towards), with substantial frontline experience in disability services.',
    measures: 'Team compliance currency and training completion; documentation quality across the team; roster coverage and shift fill rates; participant feedback and incident follow-up timeliness.',
  },
  Administration: {
    purpose: 'To provide professional, well-organised administration support that keeps staff, participant and compliance records accurate and up to date.',
    essential: 'Right to work in Australia. Strong computer and record-keeping skills. High attention to detail and confidentiality. Professional written and verbal communication.',
    qualifications: 'Experience in office administration, ideally in health, community services or a NDIS provider environment. Certificate III/IV in Business Administration is well regarded.',
    measures: 'Accuracy and currency of records and registers; turnaround of correspondence and data entry; support of intake, rostering and billing processes; confidentiality compliance.',
  },
  Management: {
    purpose: 'To lead the organisation in delivering safe, high-quality NDIS services while meeting all legislative, regulatory and funding obligations.',
    essential: 'Right to work in Australia. Deep knowledge of the NDIS Practice Standards and NDIS Code of Conduct. Proven leadership in community services or disability support. Strong governance, risk and financial management capability.',
    qualifications: 'Diploma or degree-level qualifications in management, community services or a related field, with significant senior experience in disability services.',
    measures: 'Audit and registration outcomes; compliance readiness across all modules; workforce stability and training completion; participant and staff satisfaction; financial performance.',
  },
};

export function pdDefaults(role, positionTitle) {
  const key = Object.keys(ROLE_PD_DEFAULTS).find((k) => new RegExp(k.replace(/ \/.*/, ''), 'i').test(role || ''))
    || (/Team Leader|Coordinator/.test(role || '') ? 'Team Leader' : null);
  const base = ROLE_PD_DEFAULTS[key] || ROLE_PD_DEFAULTS['Support Worker'];
  return {
    position_purpose: base.purpose,
    key_responsibilities: contractDutiesDefault(role),
    essential_requirements: base.essential,
    qualifications_experience: base.qualifications,
    performance_measures: base.measures,
    reports_to_title: 'the nominated supervisor',
  };
}