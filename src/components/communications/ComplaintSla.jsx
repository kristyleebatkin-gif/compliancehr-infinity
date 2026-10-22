import React from 'react';
import { Clock } from 'lucide-react';

// Complaint SLA (benchmark rule): 21-day decision window, escalation warning at day 14.
const SLA_DAYS = 21;
const ESCALATION_DAY = 14;

export function complaintSla(complaint) {
  if (['Resolved', 'Closed'].includes(complaint.status)) return null;
  const start = complaint.date_received ? new Date(String(complaint.date_received).slice(0, 10)) : null;
  if (!start || isNaN(start.getTime())) return null;
  const due = complaint.target_resolution_date
    ? new Date(String(complaint.target_resolution_date).slice(0, 10))
    : new Date(start.getTime() + SLA_DAYS * 86400000);
  if (isNaN(due.getTime())) return null;
  const now = new Date();
  const daysLeft = Math.ceil((due - now) / 86400000);
  const dayOfSla = SLA_DAYS - daysLeft;
  if (daysLeft < 0) {
    return { tone: 'text-red-600 bg-red-500/10 border-red-200', label: `${Math.abs(daysLeft)}d overdue` };
  }
  if (dayOfSla >= ESCALATION_DAY) {
    return { tone: 'text-danger bg-danger/10 border-danger/30', label: `Escalate · ${daysLeft}d left` };
  }
  if (daysLeft <= 7) {
    return { tone: 'text-danger bg-danger/10 border-danger/30', label: `${daysLeft}d left` };
  }
  return { tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-200', label: `In SLA · ${daysLeft}d left` };
}

export default function ComplaintSlaPill({ complaint }) {
  const sla = complaintSla(complaint);
  if (!sla) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sla.tone}`}>
      <Clock className="h-3 w-3" />
      {sla.label}
    </span>
  );
}