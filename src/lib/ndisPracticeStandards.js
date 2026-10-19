// NDIS Practice Standards (Core Module) mapped control-to-evidence.
// Every control lists the in-app registers that hold its audit evidence, so
// checklist items always trace to live, countable proof.
export const NDIS_CORE_STANDARDS = [
  {
    standard: '1. Rights and Responsibility',
    controls: [
      { control: 'Person-centred outcomes, consultation and choice', evidence: [{ label: 'Participant goals', entity: 'Goal' }, { label: 'Goal progress notes', entity: 'GoalProgressNote' }] },
      { control: 'Privacy, dignity and information consent', evidence: [{ label: 'Information sharing consents', entity: 'InformationSharingConsent' }, { label: 'Data breach register', entity: 'DataBreach' }] },
      { control: 'Safeguarding participants', evidence: [{ label: 'Safeguard records', entity: 'ParticipantSafeguardRecord' }] },
    ],
  },
  {
    standard: '2. Governance and Operational Management',
    controls: [
      { control: 'Governance framework and oversight', evidence: [{ label: 'Governance controls', entity: 'GovernanceControlRecord' }, { label: 'Governance meetings', entity: 'MeetingRecord' }] },
      { control: 'Business and registration profile current', evidence: [{ label: 'Registration profile', entity: 'NDISRegistrationProfile' }, { label: 'Business details', entity: 'BusinessDetails' }] },
    ],
  },
  {
    standard: '3. Regulation',
    controls: [
      { control: 'Registration groups and scope', evidence: [{ label: 'Registration groups', entity: 'NDISRegistrationGroup' }] },
      { control: 'Compliance obligations tracked', evidence: [{ label: 'Compliance deadlines', entity: 'NDISComplianceDeadline' }, { label: 'Legal requirements', entity: 'LegalRequirement' }] },
    ],
  },
  {
    standard: '4. Provision of Supports',
    controls: [
      { control: 'Supports delivered as planned', evidence: [{ label: 'Shifts', entity: 'Shift' }, { label: 'Shift details', entity: 'ParticipantShiftDetail' }] },
      { control: 'Communication with participants', evidence: [{ label: 'Support letters', entity: 'SupportLetter' }] },
    ],
  },
  {
    standard: '5. Support Provision Environment',
    controls: [
      { control: 'Safe physical environment', evidence: [{ label: 'Safety checks', entity: 'SafetyCheck' }] },
      { control: 'Emergency preparedness', evidence: [{ label: 'Emergency drills', entity: 'EmergencyDrill' }, { label: 'Emergency documents', entity: 'EmergencyDocument' }] },
      { control: 'Visitor access control', evidence: [{ label: 'Visitor log', entity: 'VisitorLog' }] },
    ],
  },
  {
    standard: '6. Complaints and Grievances',
    controls: [
      { control: 'Complaints resolved within SLA', evidence: [{ label: 'Complaints', entity: 'Complaint' }, { label: 'Feedback register', entity: 'Feedback' }] },
      { control: 'Participant satisfaction measured', evidence: [{ label: 'Satisfaction surveys', entity: 'SatisfactionSurvey' }] },
    ],
  },
  {
    standard: '7. Incident Management',
    controls: [
      { control: 'Incidents reported, investigated and closed', evidence: [{ label: 'Incidents', entity: 'Incident' }, { label: 'Investigations', entity: 'Investigation' }] },
      { control: 'NDIS Commission reporting', evidence: [{ label: 'Incidents (reportable fields)', entity: 'Incident' }] },
    ],
  },
  {
    standard: '8. Human Resources',
    controls: [
      { control: 'Workforce screening and qualifications', evidence: [{ label: 'Staff profiles', entity: 'StaffProfile' }, { label: 'Employee documents', entity: 'EmployeeDocument' }] },
      { control: 'Training and competency current', evidence: [{ label: 'Training completions', entity: 'TrainingCompletion' }, { label: 'Certificates', entity: 'Certificate' }] },
      { control: 'Performance management', evidence: [{ label: 'Appraisals', entity: 'EmployeePerformanceAppraisal' }] },
    ],
  },
  {
    standard: '9. Risk Management',
    controls: [
      { control: 'Risk register and assessments', evidence: [{ label: 'Risks', entity: 'Risk' }] },
      { control: 'On-the-spot hazard screening', evidence: [{ label: 'Take Fives', entity: 'TakeFive' }] },
    ],
  },
  {
    standard: '10. Continuous Improvement',
    controls: [
      { control: 'Improvement actions tracked to closure', evidence: [{ label: 'Quality items', entity: 'QualityItem' }, { label: 'Improvement actions', entity: 'ImprovementAction' }] },
      { control: 'Internal audit program', evidence: [{ label: 'Internal audits', entity: 'InternalAudit' }, { label: 'Improvement reviews', entity: 'ImprovementReview' }] },
    ],
  },
];