import React from 'react';
import { Check } from 'lucide-react';

export const INCIDENT_STAGES = [
  { label: 'Submitted', desc: 'Incident reported' },
  { label: 'Manager Notification', desc: 'Manager notified' },
  { label: 'Investigation', desc: 'Under investigation' },
  { label: 'Action Assigned', desc: 'Corrective action' },
  { label: 'Closed', desc: 'Resolved & closed' },
];

export function statusToStageIndex(status) {
  switch (status) {
    case 'Reported': return 1;
    case 'Under Investigation': return 2;
    case 'Action Required': return 3;
    case 'Resolved': return 4;
    case 'Closed': return 4;
    default: return 0;
  }
}

export default function IncidentWorkflow({ status }) {
  const current = statusToStageIndex(status);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 text-sm font-semibold">Incident Workflow</div>
      <div className="mb-4 text-xs text-foreground/50">Current stage: <span className="font-medium text-brand">{INCIDENT_STAGES[current].label}</span></div>
      <div className="flex items-center">
        {INCIDENT_STAGES.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center text-center" style={{ flex: '0 0 auto' }}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${done ? 'border-safe bg-safe text-white' : active ? 'border-brand bg-brand text-white' : 'border-border bg-background text-foreground/40'}`}>
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className={`mt-2 w-20 text-[11px] font-medium leading-tight ${active || done ? 'text-foreground' : 'text-foreground/40'}`}>{stage.label}</div>
              </div>
              {i < INCIDENT_STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${i < current ? 'bg-safe' : 'bg-border'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}