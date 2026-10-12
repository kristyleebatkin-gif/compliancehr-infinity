// Live compliance trackers: which records in each module are overdue or due soon.
// Each entry: { label, entity, field, base (static filter), soon (days) }
const D = (d) => d.toISOString().slice(0, 10);
const today = () => D(new Date());
const plus = (days) => D(new Date(Date.now() + days * 86400000));

const expiryPair = (entity, label, soonDays = 30) => ([
  { label: `${label} expired`, entity, field: 'expiry_date', base: { expiry_date: { $lt: '' } }, dynamic: 'overdue' },
  { label: `${label} expiring soon`, entity, field: 'expiry_date', base: { expiry_date: { $gte: '', $lte: '' } }, dynamic: 'soon', soon: soonDays },
]);

export const MODULE_TRACKERS = {
  '/tasks': [
    { label: 'Tasks overdue', entity: 'TodoTask', base: { due_date: { $lt: '' }, status: 'Pending' }, dynamic: 'overdue' },
    { label: 'Due within 7 days', entity: 'TodoTask', base: { due_date: { $gte: '', $lte: '' }, status: 'Pending' }, dynamic: 'soon', soon: 7 },
  ],
  '/training': expiryPair('TrainingCompletion', 'Modules'),
  '/certificates': expiryPair('Certificate', 'Certificates'),
  '/checklists': [
    { label: 'Checklists overdue', entity: 'ComplianceChecklistEntry', base: { next_due_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Due within 30 days', entity: 'ComplianceChecklistEntry', base: { next_due_date: { $gte: '', $lte: '' } }, dynamic: 'soon' },
  ],
  '/risks': [
    { label: 'Assessments overdue', entity: 'Risk', base: { next_due_date: { $lt: '' }, status: { $ne: 'Closed' } }, dynamic: 'overdue' },
    { label: 'Reviews overdue', entity: 'Risk', base: { review_date: { $lt: '' }, status: { $ne: 'Closed' } }, dynamic: 'overdue' },
  ],
  '/incidents': [
    { label: '5-day follow-ups overdue', entity: 'Incident', base: { five_day_follow_up_due: { $lt: '' }, five_day_follow_up_submitted: { $in: [null, ''] } }, dynamic: 'overdue' },
    { label: 'Final reports overdue', entity: 'Incident', base: { final_report_due: { $lt: '' }, final_report_submitted: { $in: [null, ''] } }, dynamic: 'overdue' },
  ],
  '/documents': expiryPair('EmployeeDocument', 'Staff documents'),
  '/company-safe': [
    { label: 'Policies past review', entity: 'Policy', base: { review_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Insurance expired', entity: 'InsurancePolicy', base: { expiry_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/invoicing': [
    { label: 'Invoices overdue unpaid', entity: 'Invoice', base: { due_date: { $lt: '' }, paid_date: { $in: [null, ''] } }, dynamic: 'overdue' },
  ],
  '/quotes': [
    { label: 'Quotes expired unaccepted', entity: 'Quote', base: { expiry_date: { $lt: '' }, status: 'Sent' }, dynamic: 'overdue' },
  ],
  '/assets': [
    { label: 'Services overdue', entity: 'Asset', base: { next_service_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/emergency-response': [
    { label: 'Safety checks overdue', entity: 'SafetyCheck', base: { next_due_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Emergency documents past review', entity: 'EmergencyDocument', base: { next_review_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/participants': [
    { label: 'Progress notes overdue', entity: 'ParticipantProfile', base: { progress_notes_due_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/dashboard': [
    { label: 'Tasks overdue', entity: 'TodoTask', base: { due_date: { $lt: '' }, status: 'Pending' }, dynamic: 'overdue' },
    { label: 'Certificates expired', entity: 'Certificate', base: { expiry_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Incident follow-ups overdue', entity: 'Incident', base: { five_day_follow_up_due: { $lt: '' }, five_day_follow_up_submitted: { $in: [null, ''] } }, dynamic: 'overdue' },
  ],
};

// Build concrete Mongo filters with real dates for one entry.
export function trackerQuery(item, mode) {
  const t = today();
  if (mode === 'overdue') return { ...item.base, ...Object.fromEntries(Object.entries(item.base).map(([k, v]) => [k, typeof v === 'object' && v !== null && '$lt' in v ? { ...v, $lt: t } : v])) };
  const soon = plus(item.soon || 30);
  return { ...item.base, ...Object.fromEntries(Object.entries(item.base).map(([k, v]) => [k, typeof v === 'object' && v !== null && '$lt' in v ? { $gte: t, $lte: soon } : v])) };
}