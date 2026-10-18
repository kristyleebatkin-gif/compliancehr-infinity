import React from 'react';
import { intakeReadiness } from '@/lib/intakeCases';
import { STATUS_CLASS, initials, scoreTone } from './intakeDisplay';

export default function IntakeCaseList({ cases, activeCaseId, onSelect }) {
  return (
    <div className="space-y-2">
      {cases.map((record) => {
        const score = intakeReadiness(record).score;
        return (
          <button
            key={record.id}
            type="button"
            onClick={() => onSelect(record.id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              record.id === activeCaseId ? 'border-primary bg-primary/5 shadow-panel' : 'border-border hover:bg-muted/50'
            }`}
          >
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
            </span>
            <span className={`shrink-0 text-xs font-bold ${scoreTone(score)}`}>{score}%</span>
          </button>
        );
      })}
    </div>
  );
}