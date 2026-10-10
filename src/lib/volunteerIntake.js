import { EMPLOYEE_FORM_FILES } from '@/lib/employeeDocuments';

/* The usual staff intake requirements, applied to every volunteer on the register. */
export const VOLUNTEER_INTAKE_SECTIONS = [
  {
    name: 'Personal & contact details',
    fields: ['full_name', 'email', 'phone', 'address', 'date_of_birth', 'emergency_contact', 'emergency_contact_phone'],
  },
  {
    name: 'Placement details',
    fields: ['role', 'start_date', 'status', 'supervisor', 'availability', 'weekly_hours', 'induction_date'],
  },
  {
    name: 'Screening & checks',
    fields: ['ndis_worker_screening', 'blue_card_number', 'police_check_date', 'reference_checks'],
  },
  {
    name: 'Notes',
    fields: ['notes'],
  },
];

export const VOLUNTEER_DOC_TYPES = [
  'Staff Information Form',
  'Staff Onboarding Form',
  'Staff Induction Form',
  'NDIS Code of Conduct Acknowledgement',
  'NDIS Worker Screening Clearance',
  'Blue Card',
  'Police Check',
  "Driver's License",
  '100 Points of Identification Checklist',
  'Reference Checks Form',
  'First Aid Certificate',
  'CPR Certificate',
  'Manual Handling Training Certificate',
  'NDIS Worker Orientation Module Certificate',
  'Training Record',
  'Resume',
  'Qualifications',
  'Other',
];

export const VOLUNTEER_TRAINING_MODULES = [
  'NDIS Worker Orientation Module',
  'NDIS Code of Conduct',
  'Volunteer Induction',
  'Work Health and Safety',
  'Manual Handling',
  'First Aid',
  'CPR',
  'Infection Control',
  'Supporting Safe and Enjoyable Meals',
  'Effective Communication',
  'Emergency Procedures',
  'Other',
];

/* Official blank staff intake forms volunteers (and staff) can download before completing. */
export const BLANK_INTAKE_FORMS = [
  { name: 'Staff Information Form', url: EMPLOYEE_FORM_FILES['Staff Information Form'] },
  { name: 'Staff Onboarding Form', url: EMPLOYEE_FORM_FILES['Staff Onboarding Form'] },
  { name: 'Staff Induction Form', url: EMPLOYEE_FORM_FILES['Staff Induction Form'] },
];