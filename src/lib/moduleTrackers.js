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
  '/staff': [
    { label: 'Certificates expired', entity: 'Certificate', base: { expiry_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Staff documents expiring soon', entity: 'EmployeeDocument', base: { expiry_date: { $gte: '', $lte: '' }, status: { $ne: 'Archived' } }, dynamic: 'soon', soon: 30 },
  ],
  '/intake': [
    { label: 'Intake cases ready for review', entity: 'IntakeCase', base: { status: 'Ready for Review' }, dynamic: 'overdue' },
  ],
  '/receipts': [
    { label: 'Receipts unreconciled', entity: 'Receipt', base: { status: 'Unreconciled' }, dynamic: 'overdue' },
  ],
  '/procurement': [
    { label: 'Orders awaiting approval', entity: 'PurchaseOrder', base: { status: 'Submitted' }, dynamic: 'overdue' },
  ],
  '/crm': [
    { label: 'Follow-ups overdue', entity: 'Lead', base: { follow_up_date: { $lt: '' }, stage: { $nin: ['Won', 'Lost'] } }, dynamic: 'overdue' },
  ],
  '/hr': [
    { label: 'Leave requests pending', entity: 'LeaveRequest', base: { status: 'Pending' }, dynamic: 'overdue' },
  ],
  '/projects': [
    { label: 'Projects overdue', entity: 'BusinessProject', base: { due_date: { $lt: '' }, status: { $ne: 'Complete' } }, dynamic: 'overdue' },
  ],
  '/volunteers': [
    { label: 'Volunteers onboarding', entity: 'Volunteer', base: { status: 'Onboarding' }, dynamic: 'overdue' },
  ],
  '/programs': [
    { label: 'Events coming up', entity: 'Event', base: { date: { $gte: '', $lte: '' }, status: 'Planned' }, dynamic: 'soon', soon: 14 },
  ],
  '/equipment-manuals': [
    { label: 'Manuals past review', entity: 'EquipmentManual', base: { review_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/dashboard': [
    { label: 'Tasks overdue', entity: 'TodoTask', base: { due_date: { $lt: '' }, status: 'Pending' }, dynamic: 'overdue' },
    { label: 'Certificates expired', entity: 'Certificate', base: { expiry_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'Incident follow-ups overdue', entity: 'Incident', base: { five_day_follow_up_due: { $lt: '' }, five_day_follow_up_submitted: { $in: [null, ''] } }, dynamic: 'overdue' },
  ],
  '/compliance': [
    { label: 'Compliance checklists overdue', entity: 'ComplianceChecklistEntry', base: { next_due_date: { $lt: '' } }, dynamic: 'overdue' },
    { label: 'NDIS deadlines overdue', entity: 'NDISComplianceDeadline', base: { due_date: { $lt: '' }, status: { $nin: ['Completed'] } }, dynamic: 'overdue' },
  ],
  '/ndis-portal': [
    { label: 'NDIS deadlines overdue', entity: 'NDISComplianceDeadline', base: { due_date: { $lt: '' }, status: { $nin: ['Completed'] } }, dynamic: 'overdue' },
  ],
  '/ndis-updates': [
    { label: 'NDIS updates to review', entity: 'NdisUpdate', base: { published_date: { $gte: '', $lte: '' } }, dynamic: 'soon', soon: 7 },
  ],
  '/feedback': [
    { label: 'Feedback awaiting action', entity: 'Feedback', base: { status: 'Pending Further Action' }, dynamic: 'overdue' },
  ],
  '/goals': [
    { label: 'Goals past target date', entity: 'Goal', base: { target_date: { $lt: '' }, status: { $nin: ['Achieved'] } }, dynamic: 'overdue' },
  ],
  '/meetings': [
    { label: 'Meeting actions overdue', entity: 'MeetingActionRecord', base: { due_date: { $lt: '' }, status: { $in: ['Open', 'In Progress', 'Overdue'] } }, dynamic: 'overdue' },
  ],
  '/quality': [
    { label: 'Improvement items open', entity: 'QualityItem', base: { status: { $in: ['New', 'In Progress'] } }, dynamic: 'overdue' },
  ],
  '/visual-boards': [
    { label: 'Routines past their date', entity: 'VisualRoutine', base: { routine_date: { $lt: '' } }, dynamic: 'overdue' },
  ],
  '/communications': [
    { label: 'Entries flagging issues', entity: 'CommunicationEntry', base: { issues_concerns: { $exists: true, $ne: '' } }, dynamic: 'overdue' },
  ],
  '/analytics': [
    { label: 'KPIs at risk or off track', entity: 'KPI', base: { status: { $in: ['At Risk', 'Off Track'] } }, dynamic: 'overdue' },
  ],
  '/community-council': [
    { label: 'Community events coming up', entity: 'CommunityEvent', base: { event_date: { $gte: '', $lte: '' } }, dynamic: 'soon', soon: 14 },
    { label: 'Programs still open', entity: 'CommunityProgram', base: { status: 'Open' }, dynamic: 'overdue' },
  ],
  '/contacts': [
    { label: 'Contacts missing phone or email', entity: 'Contact', base: { $or: [{ phone: { $in: [null, ''] } }, { email: { $in: [null, ''] } }] }, dynamic: 'overdue' },
  ],
  '/help': [
    { label: 'Help tickets open', entity: 'HelpDeskTicket', base: { status: { $in: ['Open', 'In Progress'] } }, dynamic: 'overdue' },
  ],
};

// Build concrete Mongo filters with real dates for one entry.
export function trackerQuery(item, mode) {
  const t = today();
  if (mode === 'overdue') return { ...item.base, ...Object.fromEntries(Object.entries(item.base).map(([k, v]) => [k, typeof v === 'object' && v !== null && '$lt' in v ? { ...v, $lt: t } : v])) };
  const soon = plus(item.soon || 30);
  return { ...item.base, ...Object.fromEntries(Object.entries(item.base).map(([k, v]) => [k, typeof v === 'object' && v !== null && ('$lt' in v || '$lte' in v) ? { $gte: t, $lte: soon } : v])) };
}

// Route aliases so every URL of a module shares one live tracker.
MODULE_TRACKERS['/volunteering-placements'] = MODULE_TRACKERS['/volunteers'];
MODULE_TRACKERS['/key-contacts'] = MODULE_TRACKERS['/contacts'];
MODULE_TRACKERS['/community-referral'] = MODULE_TRACKERS['/referrals'];
MODULE_TRACKERS['/rostering'] = MODULE_TRACKERS['/roster'];
MODULE_TRACKERS['/msds'] = MODULE_TRACKERS['/equipment-manuals'];