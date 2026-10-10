import { base44 } from '@/api/base44Client';
import { downloadChecklistPdf } from '@/lib/checklistsPdf';

const commonRecordFields = [
  { label: 'Record ID' },
  { label: 'Date and time' },
  { label: 'Location' },
  { label: 'Completed / reported by' },
  { label: 'Participant(s) / employee(s) involved' },
];

export const SAFETY_DOCUMENTS = [
  {
    type: 'Incident Report',
    code: 'CM-FORM-049',
    fields: [...commonRecordFields, { label: 'What happened', multiline: true }, { label: 'Immediate actions taken', multiline: true }, { label: 'Risks / hazards identified', multiline: true }, { label: 'Risk assessment - likelihood, consequence and rating', multiline: true }, { label: 'Control measures and responsible person', multiline: true }, { label: 'NDIS / police notification details', multiline: true }],
  },
  {
    type: 'Investigation Report',
    code: 'CM-FORM-050',
    fields: [...commonRecordFields, { label: 'Investigator and person receiving report' }, { label: 'Incident summary', multiline: true }, { label: 'Evidence reviewed and persons interviewed', multiline: true }, { label: 'Root cause and findings', multiline: true }, { label: 'Risks / hazards identified', multiline: true }, { label: 'Risk assessment', multiline: true }, { label: 'Control measures, recommendations and corrective actions', multiline: true }],
  },
  {
    type: 'Risk Assessment',
    code: 'CM-FORM-051',
    fields: [...commonRecordFields, { label: 'Activity / risk description', multiline: true }, { label: 'Risks / hazards identified', multiline: true }, { label: 'People exposed and potential harm', multiline: true }, { label: 'Existing controls', multiline: true }, { label: 'Likelihood, consequence and initial rating' }, { label: 'Additional control measures', multiline: true }, { label: 'Residual risk and review date' }],
  },
  {
    type: 'Hazard Report',
    code: 'CM-FORM-052',
    fields: [...commonRecordFields, { label: 'Hazard identified', multiline: true }, { label: 'Potential harm', multiline: true }, { label: 'Immediate action', multiline: true }, { label: 'Risk rating' }, { label: 'Control measures, owner and due date', multiline: true }],
  },
  {
    type: 'Near Miss Report',
    code: 'CM-FORM-053',
    fields: [...commonRecordFields, { label: 'What nearly happened', multiline: true }, { label: 'Contributing hazards', multiline: true }, { label: 'Potential consequence', multiline: true }, { label: 'Immediate and ongoing control measures', multiline: true }, { label: 'Risk rating and review date' }],
  },
  {
    type: 'Take Five Assessment',
    code: 'CM-FORM-054',
    fields: [...commonRecordFields, { label: 'Task / activity' }, { label: 'STOP - risks / hazards identified', multiline: true }, { label: 'LOOK - potential harm', multiline: true }, { label: 'ASSESS - likelihood, consequence and rating' }, { label: 'CONTROL - control measures', multiline: true }, { label: 'Residual risk' }, { label: 'PROCEED - safe to proceed and supervisor sign-off' }],
  },
  {
    type: 'Individual Risk Assessment',
    code: 'CM-FORM-055',
    fields: [...commonRecordFields, { label: 'Individual goals, activities and environment', multiline: true }, { label: 'Health, behaviour, mobility and safeguarding risks', multiline: true }, { label: 'Likelihood, consequence and rating for each risk', multiline: true }, { label: 'Control measures and support strategies', multiline: true }, { label: 'Responsible team members and review date' }],
  },
  {
    type: 'Daily Vehicle Check',
    code: 'CM-FORM-056',
    fields: [...commonRecordFields, { label: 'Vehicle registration and odometer' }, { label: 'Driver name' }, { label: 'Tyres, lights, mirrors and windows' }, { label: 'Brakes, steering, fuel and warning lights' }, { label: 'First aid kit, fire extinguisher and restraints' }, { label: 'Hazards / defects identified', multiline: true }, { label: 'Control action / vehicle isolation', multiline: true }, { label: 'Safe to operate and supervisor sign-off' }],
  },
  {
    type: 'Home Risk Assessment',
    code: 'CM-FORM-057',
    fields: [...commonRecordFields, { label: 'Participant and property address' }, { label: 'Entry, exit, access and neighbourhood hazards', multiline: true }, { label: 'Fire, electrical, trip, manual handling and infection hazards', multiline: true }, { label: 'Animals, smoking, aggression and environmental risks', multiline: true }, { label: 'Likelihood, consequence and risk rating', multiline: true }, { label: 'Control measures, responsible person and review date', multiline: true }],
  },
];

export function downloadSafetyDocument(document) {
  downloadChecklistPdf({
    title: document.type,
    code: document.code,
    subtitle: 'Fillable safety and risk management record',
    fields: document.fields,
  });
}

// Opens an uploaded safety record. Private uploads are stored as a storage
// URI and need a short-lived signed URL; ordinary links open directly.
export async function openSafetyFile(uriOrUrl) {
  if (!uriOrUrl) return;
  if (/^https?:/i.test(uriOrUrl)) {
    window.open(uriOrUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uriOrUrl });
  window.open(signed_url, '_blank', 'noopener,noreferrer');
}