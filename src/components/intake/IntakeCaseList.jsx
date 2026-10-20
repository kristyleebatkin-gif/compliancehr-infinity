import React from 'react';
import { intakeReadiness } from '@/lib/intakeCases';
import { STATUS_CLASS, STATUS_HEX, initials, scoreTone } from './intakeDisplay';

export default function IntakeCaseList({ cases, activeCaseId, onSelect }) {
  if (!cases.length) {
    return <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">No cases match this filter or search.</div>;
  }
  return (
    <div className="space-y-2">
      {cases.map((record) => {
        const score = intakeReadiness(record).score;
        return (
          <button
            key={record.id}
            type="button"
            onClick={() => onSelect(record.id)}
            className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl border py-2.5 pl-4 pr-3 text-left transition-all ${
              record.id === activeCaseId ? 'border-primary bg-primary/5 shadow-panel ring-1 ring-primary/25' : 'border-border hover:bg-muted/50 hover:shadow-sm'
            }`}
          >
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: STATUS_HEX[record.status] || '#94a3b8' }} />
            <span className="gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
              {initials(record.applicant_name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{record.applicant_name}</span>
              <span className="mt-1 flex items-center gap-2">
                <span className="text-xs text-foreground/50">{record.case_number}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[record.status] || 'bg-muted text-muted-foreground'}`}>
                  {record.status}
                </span>
              </span>
              <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${score}%`,
                    background: score >= 90 ? 'linear-gradient(90deg,#34d399,#059669)' : score >= 50 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#fb7185,#e11d48)',
                  }}
                />
              </span>
            </span>
            <span className={`shrink-0 text-xs font-bold ${scoreTone(score)}`}>{score}%</span>
          </button>
        );
      })}
    </div>
  );
}