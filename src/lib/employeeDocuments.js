import { ClipboardList, ShieldCheck, GraduationCap, ClipboardCheck, CarFront, BookOpen } from 'lucide-react';

export const EMPLOYEE_FILE_SECTIONS = [
  { name: 'Employment & Onboarding', icon: ClipboardCheck, docs: ['Staff Information Form', 'Staff Onboarding Form', 'Staff Induction Form', 'Employment Contract', 'Position Description', 'Secondary Employment Form', 'Staff Commitment Declaration Form'] },
  { name: 'Identity, Qualifications & Vehicle Records', icon: ShieldCheck, docs: ['100 Points of Identification Checklist', "Driver's License", 'Medicare Card', 'Passport', 'Birth Certificate', 'Qualifications', 'Resume', 'Car Registration', 'Immunisation Record', 'Vehicle Safety Inspection', 'Superannuation Details', 'Tax File Number'] },
  { name: 'NDIS Screening & Clearances', icon: ShieldCheck, docs: ['NDIS Code of Conduct Acknowledgement', 'NDIS Worker Screening Clearance', 'Blue Card and/or Police Check'] },
  {
    name: 'Mandatory NDIS Training Certificates',
    icon: GraduationCap,
    docs: [
      'NDIS Worker Orientation Module Certificate',
      'NDIS Worker Induction Module Certificate',
      'NDIS Supporting Safe and Enjoyable Meals Certificate',
      'NDIS Supporting Effective Communication Certificate',
      'Australian Commission on Safety and Quality in Health Care Medication Safety Certificate',
      'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate',
      'Australian Commission on Safety and Quality in Health Care Infection Control Certificate',
      'Manual Handling Training Certificate',
      'First Aid Certificate',
      'CPR Certificate',
      'Medication Administration Training Certificate',
      'NDIS Relevant Qualification',
    ],
  },
  { name: 'Training Records', icon: GraduationCap, docs: ['Training Record'] },
  { name: 'Training & Competency', icon: GraduationCap, docs: ['Staff Training Plan', 'Skill Assessment Form'] },
  { name: 'Performance Management', icon: ClipboardList, docs: ['Performance Review Schedule', 'Performance Review Form'] },
  { name: 'Workforce Exit & File Management', icon: ShieldCheck, docs: ['Staff Exit Form', 'Staff File Checklist'] },
  { name: 'Vehicle & Safety Compliance', icon: CarFront, docs: ['Car Safety Check Form'] },
  { name: 'Staff Resources', icon: BookOpen, docs: ['Staff Handbook'] },
  { name: 'Legislation & Worker Acknowledgements', icon: BookOpen, docs: ['NDIS Act 2013 Acknowledgement', 'NDIS Practice Standards Acknowledgement', 'Work Health and Safety Act 2011 (Qld) Acknowledgement', 'Disability Discrimination Act 1992', 'Mandatory Reporting Information'] },
];

export const EMPLOYEE_DOC_TYPES = EMPLOYEE_FILE_SECTIONS.flatMap((s) => s.docs);

export const EMPLOYEE_FORM_CODES = Object.fromEntries(
  EMPLOYEE_DOC_TYPES.map((documentType, index) => [
    documentType,
    String(index + 1).padStart(3, '0'),
  ]),
);

// Official attached templates from the previous app; missing entries fall back to a generated blank form.
const BASE = 'https://media.base44.com/files/public/6a776de48a60f37fdc68021d';
export const EMPLOYEE_FORM_FILES = {
  'Staff Information Form': `${BASE}/7deafcf93_CM-FORM-004-StaffInformationForm31-10-2024_Cleaned.docx`,
  'Staff Onboarding Form': `${BASE}/8c98a1820_CM-FORM-005-StaffOnboardingChecklist31-10-2024_Cleaned.docx`,
  'Staff Induction Form': `${BASE}/cc218937f_CM-FORM-006-StaffInductionChecklist31-10-2024_Cleaned.docx`,
  'Secondary Employment Form': `${BASE}/3fc36bacd_CM-FORM-007-SecondaryEmploymentReport31-10-2024_Cleaned.docx`,
  'Staff Commitment Declaration Form': `${BASE}/46673b2b9_CM-FORM-008-StaffCommitmentDeclarationForm31-10-2024-Copy_Cleaned.docx`,
  'Training Record': `${BASE}/679e55d40_CM-FORM-010-TrainingAttendanceRecord31-10-2024_Cleaned.docx`,
  'Performance Review Schedule': `${BASE}/9a477c865_CM-FORM-011-PerformanceReviewSchedule31-10-2024_Cleaned.docx`,
  'Performance Review Form': `${BASE}/05e89d67e_CM-FORM-012-PerformanceReviewForm31-10-2024_Cleaned.docx`,
  'Skill Assessment Form': `${BASE}/a7ea73fdf_CM-FORM-013-SkillAssessmentForm31-10-2024_Cleaned.docx`,
  'Staff Exit Form': `${BASE}/63043108b_CM-FORM-014-StaffExitForm31-10-2024_Cleaned.docx`,
  'Staff File Checklist': `${BASE}/66c34e356_CM-FORM-015-StaffFileChecklist31-10-2024_Cleaned.docx`,
  'Car Safety Check Form': `${BASE}/318917952_CM-FORM-081DailyVehicleSafetyCheckSheet31-10-2024_Cleaned.docx`,
  'Staff Handbook': `${BASE}/b65b623ec_CM-PRC-001-StaffHandbook31-10-2024_Cleaned.docx`,
};