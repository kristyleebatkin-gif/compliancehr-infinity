// Centralised status → tone mapping for consistent badge/dot styling across registers.
// Tones use the app's semantic palette tokens (safe / warning / danger / teal / brand / muted).
// Usage: import { statusTone } from '@/lib/statusStyles'; className={statusTone('Resolved')}

const SAFE = 'bg-[#00C6FF]/15 text-[#0072FF] border-[#00C6FF]/50';
const WARNING = 'bg-[#A100FF]/15 text-[#5A00D6] border-[#A100FF]/50';
const DANGER = 'bg-[#FF2E9A]/15 text-[#FF2E9A] border-[#FF2E9A]/50';
const TEAL = 'bg-[#0072FF]/15 text-[#0072FF] border-[#0072FF]/50';
const BRAND = 'bg-[#5A00D6]/15 text-[#5A00D6] border-[#5A00D6]/50';
const ORANGE = 'bg-[#FF6EDB]/20 text-[#A100FF] border-[#FF6EDB]/60';
const MUTED = 'bg-[#C084FC]/20 text-[#0A2B6D] border-[#C084FC]/50';

// Module-specific statuses (ComplianceHR Portal registers)
const EXTENDED_TONES = {
  'On Hold': WARNING, 'In Maintenance': BRAND, 'Retired': MUTED, 'Complete': SAFE,
  'Follow-up Required': WARNING, 'Review Required': WARNING, 'Partial': WARNING,
  'Issues Found': DANGER, 'Achieved': SAFE, 'Approved': SAFE, 'Declined': DANGER,
  'In Assessment': TEAL, 'Paid': SAFE, 'Planned': BRAND, 'Ongoing': TEAL,
  'Onboarding': TEAL, 'Emergency': DANGER, 'Medical': TEAL, 'New': BRAND,
  'Mitigated': SAFE, 'Monitored': TEAL, 'Excellent': SAFE, 'Good': SAFE,
  'Fair': WARNING, 'Poor': DANGER, 'Reconciled': SAFE, 'Unreconciled': WARNING,
  'In Use': SAFE, 'On Leave': WARNING,
};

// Explicit status map (most common compliance statuses across registers)
const STATUS_TONES = {
  // Positive / complete
  Completed: SAFE, Current: SAFE, Active: SAFE, Verified: SAFE, Received: SAFE,
  Closed: SAFE, Resolved: SAFE, OnTrack: SAFE, 'On Track': SAFE, Exceeded: SAFE,
  Implemented: SAFE, UpToDate: SAFE, 'Up to Date': SAFE, Signed: SAFE, Acknowledged: TEAL,
  // In progress
  InProgress: BRAND, 'In Progress': BRAND, Draft: BRAND, Scheduled: BRAND, Sent: BRAND,
  Identified: BRAND, Investigating: BRAND, Implementing: BRAND, Reviewing: TEAL,
  Submitted: TEAL, 'Under Review': WARNING,
  // Attention / waiting
  Open: WARNING, Reported: WARNING, Pending: WARNING, ActionRequired: WARNING,
  'Action Required': WARNING, AtRisk: WARNING, 'At Risk': WARNING, NotStarted: WARNING,
  'Not Started': WARNING, ExpiringSoon: ORANGE, 'Expiring Soon': ORANGE,
  UnderInvestigation: WARNING, 'Under Investigation': WARNING, Revoked: WARNING,
  Due: ORANGE, Upcoming: ORANGE,
  // Negative / overdue
  Expired: DANGER, Overdue: DANGER, OffTrack: DANGER, 'Off Track': DANGER,
  Suspended: DANGER, Inactive: DANGER, Cancelled: DANGER, Missing: DANGER,
  Damaged: DANGER, Disposed: MUTED, Archived: MUTED,
};

const TONES = { ...EXTENDED_TONES, ...STATUS_TONES };

// Severity / rating tones (risk, incident, priority)
export const ratingTone = {
  Low: SAFE,
  Medium: WARNING,
  High: ORANGE,
  Critical: DANGER,
  Urgent: DANGER,
};

export function statusTone(status) {
  if (!status) return MUTED;
  return TONES[status] || MUTED;
}

// Dot colour for inline status indicators (matches tone families)
const EXTENDED_DOTS = {
  'In Maintenance': 'bg-brand', 'Retired': 'bg-foreground/40', 'Complete': 'bg-safe',
  'Achieved': 'bg-safe', 'Approved': 'bg-safe', 'Paid': 'bg-safe', 'New': 'bg-brand',
  'Onboarding': 'bg-teal', 'Planned': 'bg-brand', 'Mitigated': 'bg-safe',
};

const STATUS_DOTS = {
  Completed: 'bg-safe', Active: 'bg-safe', Resolved: 'bg-safe', Closed: 'bg-safe', Current: 'bg-safe',
  InProgress: 'bg-brand', 'In Progress': 'bg-brand', Draft: 'bg-brand',
  Open: 'bg-warning', Reported: 'bg-warning', Pending: 'bg-warning', NotStarted: 'bg-warning', 'Not Started': 'bg-warning',
  UnderInvestigation: 'bg-warning', 'Under Investigation': 'bg-warning',
  Expired: 'bg-danger', Overdue: 'bg-danger', Suspended: 'bg-danger',
};

export function statusDot(status) {
  if (!status) return 'bg-foreground/40';
  return { ...EXTENDED_DOTS, ...STATUS_DOTS }[status] || 'bg-foreground/40';
}

export default TONES;