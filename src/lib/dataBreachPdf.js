import { buildChecklistPdf, downloadChecklistPdf } from '@/lib/checklistsPdf';

const PLAN_SECTIONS = [
  ['Phase 1 - Contain and assess (immediately, within 24 hours)', 'Take immediate steps to contain the breach (revoke access, reset credentials, isolate systems). Assign an incident owner. Gather the facts: what happened, when, how, and what data is involved.'],
  ['Phase 2 - Evaluate the risks (within 30 days)', 'Assess whether the breach is likely to result in serious harm to any individual (Notifiable Data Breaches scheme). Consider the sensitivity of the information, whether it is protected, and who could gain access. Document the assessment and the decision, even if the outcome is not notifiable.'],
  ['Phase 3 - Notify (if likely to result in serious harm)', 'Notify the OAIC as soon as practicable using the Notifiable Data Breach form, and record the OAIC reference. Notify affected individuals (and their nominees where relevant) with recommended steps they should take. Record the date and method of all notifications.'],
  ['Phase 4 - Remediate and review', 'Complete remediation actions (data recovery, access changes, system fixes). Record lessons learned and update policies, training and controls to prevent recurrence. Close the breach record once all actions are complete.'],
  ['Roles and responsibilities', 'Privacy Officer / Data Protection Lead: owns the response and notifications. Provider Administrator: approves notifications and external communications. Compliance Manager: maintains the breach register and reporting. All staff: report suspected breaches immediately to the Privacy Officer.'],
  ['Key timeframes', 'Contain immediately. Complete the notifiability assessment within 30 days of becoming aware. Notify the OAIC and affected individuals as soon as practicable once notifiable. Keep breach records for evidence of compliance.'],
];

export function downloadBreachResponsePlan() {
  downloadChecklistPdf({
    title: 'Data Breach Response Plan',
    code: 'DC-001',
    subtitle: 'Notifiable Data Breaches (NDB) scheme response procedure',
    fields: PLAN_SECTIONS.map(([label, value]) => ({ label, value, multiline: true })),
    signoffFields: ['Prepared by', 'Approved by', 'Review date'],
  });
}

const breachFields = (breach) => [
  { label: 'Breach ID / Title', value: [breach.breach_id, breach.title].filter(Boolean).join(' - ') },
  { label: 'Date detected', value: breach.detected_date || '' },
  { label: 'Detected / reported by', value: breach.detected_by || '' },
  { label: 'Types of data involved', value: breach.data_types || '', multiline: true },
  { label: 'Individuals affected', value: breach.individuals_affected != null ? String(breach.individuals_affected) : '' },
  { label: 'Severity', value: breach.severity || '' },
  { label: 'Description of breach', value: breach.description || '', multiline: true },
  { label: 'Notifiability assessment (NDB scheme)', value: [breach.is_notifiable ? 'Assessed as NOTIFIABLE' : 'Assessed as not notifiable', breach.assessment_notes].filter(Boolean).join('\n'), multiline: true },
  { label: 'Containment actions', value: breach.containment_actions || '', multiline: true },
  { label: 'Notifications', value: [breach.oaic_notified_at ? `OAIC notified: ${new Date(breach.oaic_notified_at).toLocaleString('en-AU')}${breach.oaic_reference ? ` (ref ${breach.oaic_reference})` : ''}` : '', breach.individuals_notified_at ? `Individuals notified: ${new Date(breach.individuals_notified_at).toLocaleString('en-AU')}` : '', breach.management_notified_at ? `Management notified: ${new Date(breach.management_notified_at).toLocaleString('en-AU')}` : ''].filter(Boolean).join('\n'), multiline: true },
  { label: 'Remediation actions', value: breach.remediation_actions || '', multiline: true },
  { label: 'Lessons learned / prevention', value: breach.lessons_learned || '', multiline: true },
  { label: 'Status', value: [breach.status, breach.closed_date ? `Closed ${breach.closed_date}` : ''].filter(Boolean).join(' - ') },
];

export function downloadBreachRecordPdf(breach) {
  downloadChecklistPdf({
    title: `Data Breach Record - ${breach.title}`,
    code: breach.breach_id || 'DC-002',
    subtitle: 'Data breach notification and response log',
    fields: breachFields(breach),
    signoffFields: ['Privacy Officer signature', 'Date', 'Approved by'],
  });
}

export function breachCsvRows(breaches) {
  return breaches.map((b) => ({
    breach_id: b.breach_id, title: b.title, detected_date: b.detected_date, detected_by: b.detected_by,
    data_types: b.data_types, individuals_affected: b.individuals_affected, severity: b.severity,
    status: b.status, is_notifiable: b.is_notifiable ? 'Yes' : 'No', assessment_notes: b.assessment_notes,
    containment_actions: b.containment_actions, oaic_notified_at: b.oaic_notified_at, oaic_reference: b.oaic_reference,
    individuals_notified_at: b.individuals_notified_at, management_notified_to: b.management_notified_to,
    remediation_actions: b.remediation_actions, lessons_learned: b.lessons_learned, closed_date: b.closed_date,
    recorded_by: b.recorded_by,
  }));
}