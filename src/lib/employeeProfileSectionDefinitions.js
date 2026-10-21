import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import { STAFF_FILLABLE_FORMS } from '@/lib/staffFillableForms';
import { normaliseFormFields } from '@/lib/formQuestionModel';

const form = (code, labels, columns) => ({ code, fields: normaliseFormFields(labels.map((label) => ({ label, multiline: /notes|actions|hazards|controls|outcome/i.test(label) }))), columns });
export const EMPLOYEE_PROFILE_FORMS = {
  ...EMPLOYEE_FORM_DEFINITIONS,
  ...Object.fromEntries(STAFF_FILLABLE_FORMS.map((item) => [item.key, item])),
  'Staff Training Plan': form('EMP-TRAINING-PLAN', ['Employee full name', 'Plan start date', 'Plan review date', 'Supervisor', 'Development objectives', 'Support and resources required', 'Employee comments'], ['Training / competency', 'Provider', 'Target date', 'Completed date', 'Outcome', 'Next review date']),
  'Take Five Safety Check': form('EMP-TAKE-FIVE', ['Employee full name', 'Assessment date', 'Location / task', 'Stop: describe the task', 'Look: hazards identified', 'Assess: risk level and who may be harmed', 'Control: actions before starting', 'Proceed: safe to continue and authorisation', 'Completed by', 'Follow-up date']),
  'Staff Safety Check': form('EMP-SAFETY', ['Employee full name', 'Check date', 'Check type', 'Location', 'Completed by', 'Overall outcome', 'Next due date', 'Follow-up actions'], ['Item checked', 'Result', 'Issue / hazard', 'Action / control', 'Responsible person', 'Due date']),
  'Staff Risk Assessment': form('EMP-RISK', ['Employee full name', 'Assessment date', 'Task / location', 'Assessor', 'Hazards identified', 'People at risk', 'Likelihood', 'Consequence', 'Initial risk rating', 'Control measures', 'Residual risk rating', 'Review date', 'Review outcome']),
  'Yellow Card Details': form('EMP-YELLOW-CARD', ['Employee full name', 'Employee number', 'Yellow card / clearance number', 'State or territory of issue', 'Issue date', 'Expiry date', 'Clearance status', 'Verified by', 'Verification date', 'Renewal due date', 'Notes']),
  'Buddy Shift Log': form('EMP-BUDDY', ['Employee full name', 'Supervisor', 'Overall competency outcome', 'Follow-up actions'], ['Shift date', 'Start time', 'End time', 'Buddy / supervisor', 'Skills practised', 'Outcome / feedback']),
  'Staff Availability': form('EMP-AVAILABILITY', ['Employee full name', 'Effective from date', 'Effective until date', 'Preferred weekly hours', 'Restrictions / preferences', 'Submitted date'], ['Day / date', 'Available / unavailable', 'Start time', 'End time', 'All day', 'Notes']),
};
export const EMPLOYEE_PROFILE_SECTION_FORMS = [
  { title: 'Skills, Assessments & Training Plan', forms: ['Skill Assessment Form', 'Training Record', 'Staff Training Plan'] },
  { title: 'Safety Checks & Risk Assessments', forms: ['Take Five Safety Check', 'Staff Safety Check', 'Staff Risk Assessment', 'Car Safety Check Form'] },
  { title: 'Performance, Appraisals & Goals', forms: ['Performance Review Schedule', 'Performance Review Form'] },
  { title: 'Yellow Card, Blue Card & Screening', forms: ['Yellow Card Details', 'Blue Card Details', 'NDIS Worker Screening Clearance'] },
  { title: 'Employment Documents & Declarations', forms: ['Employment Contract', 'Position Description', 'Staff Commitment Declaration Form', 'Secondary Employment Form'] },
  { title: 'Reference Checks & Buddy Shifts', forms: ['Referee Checks Form', 'Buddy Shift Log'] },
  { title: 'Availability', forms: ['Staff Availability'] },
];