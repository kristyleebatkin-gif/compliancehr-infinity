import React from 'react';
import { AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { FINDING_TONES, daysUntil } from '@/lib/assuranceChain';

const STATUSES = ['Open', 'In Progress', 'Verification', 'Closed'];

const DATE = (value) => (value ? String(value).slice(0, 10) : '—');

export default function FindingsPanel({ findings, controlsById, onStatusChange }) {
  if (!findings.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No findings recorded"
        message="Findings appear here when an audit test, desktop review or spot check finds a gap. Each finding needs a root cause, a corrective action and a verification before it can close."
        modulePath="Audit"
        createLabel="Open Audit Centre"
        createHref="/compliance"
      />
    );
  }

  const sorted = [...findings].sort((a, b) => {
    if (a.status === 'Closed' && b.status !== 'Closed') return 1;
    if (b.status === 'Closed' && a.status !== 'Closed') return -1;
    return String(a.due_date || '9999').localeCompare(String(b.due_date || '9999'));
  });

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left">Finding</th>
            <th className="text-left">Rating</th>
            <th className="text-left">Control</th>
            <th className="text-left">Owner</th>
            <th className="text-left">Due</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((finding) => {
            const control = controlsById.get(finding.control_id);
            const overdue = finding.status !== 'Closed' && (daysUntil(finding.due_date) ?? 1) < 0;
            return (
              <tr key={finding.id} className="border-b border-border/60 last:border-0">
                <td className="align-top">
                  <div className="font-semibold text-foreground">{finding.title}</div>
                  <div className="text-[11px] font-medium text-muted-foreground">{finding.source}</div>
                  {finding.corrective_action ? (
                    <div className="mt-1 max-w-[320px] text-[11px] font-medium leading-snug text-foreground/80">
                      CAPA: {finding.corrective_action}
                    </div>
                  ) : null}
                </td>
                <td className="align-top">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                      FINDING_TONES[finding.rating] || 'border-border bg-muted text-foreground'
                    }`}
                  >
                    {finding.rating}
                  </span>
                </td>
                <td className="align-top">
                  <div className="text-xs font-bold text-foreground">{finding.standard_code || control?.standard_code || 'Unlinked'}</div>
                  <div className="max-w-[220px] text-[11px] font-medium leading-snug text-muted-foreground">
                    {control?.control_statement || 'No control linked'}
                  </div>
                </td>
                <td className="align-top text-xs font-semibold text-foreground">{finding.owner || '—'}</td>
                <td className="align-top">
                  <span className={`text-xs font-semibold ${overdue ? 'text-danger font-bold' : 'text-muted-foreground'}`}>
                    {DATE(finding.due_date)}
                  </span>
                </td>
                <td className="align-top">
                  <select
                    value={finding.status || 'Open'}
                    onChange={(event) => onStatusChange(finding, event.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold text-foreground"
                    aria-label={`Status for ${finding.title}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}