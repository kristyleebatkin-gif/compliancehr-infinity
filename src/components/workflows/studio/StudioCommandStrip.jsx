import React from 'react';
import { Activity, AlarmClock, GitBranch, Inbox, ShieldCheck } from 'lucide-react';

const TILES = [
  { key: 'running', label: 'Running workflows', icon: Activity, tone: 'text-brand', hint: 'openHint' },
  { key: 'waitingApproval', label: 'Awaiting approval', icon: Inbox, tone: 'text-accent', hint: 'approvalHint' },
  { key: 'breaches', label: 'SLA breaches', icon: AlarmClock, tone: 'text-danger', hint: 'breachHint' },
  { key: 'completionRate', label: 'Completion rate', suffix: '%', icon: ShieldCheck, tone: 'text-safe', hint: 'completionHint' },
  { key: 'escalated', label: 'Escalations', icon: GitBranch, tone: 'text-warning', hint: 'escalationHint' },
];

export default function StudioCommandStrip({ summary }) {
  const hints = {
    openHint: `${summary.open} open · ${summary.failed} failed`,
    approvalHint: 'Waiting on a named approver',
    breachHint: 'Historical SLA compliance not yet verified',
    completionHint: `${summary.completed} completed · ${summary.averageHours === null ? 'duration unavailable' : `${summary.averageHours}h average`}`,
    escalationHint: 'Raised above the assigned role',
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${tile.tone}`} />
            </div>
            <div className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">
              {summary[tile.key] ?? 'Unavailable'}{summary[tile.key] == null ? '' : tile.suffix || ''}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">{hints[tile.hint]}</div>
          </div>
        );
      })}
    </div>
  );
}