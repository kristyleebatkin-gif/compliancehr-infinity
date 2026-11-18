import React from 'react';
import { CheckCircle2, FileSearch, ShieldAlert, Gavel, Clock } from 'lucide-react';

const tiles = [
  { key: 'open', label: 'Open decisions', hint: 'Draft, proposed or in review', icon: FileSearch, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'awaitingDecision', label: 'Awaiting a decision', hint: 'Proposed or in review', icon: Gavel, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'highRiskOpen', label: 'High risk open', hint: 'High or critical risk, undecided', icon: ShieldAlert, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'overdueReview', label: 'Review overdue', hint: 'Past review date and still open', icon: Clock, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'outcomesAchieved', label: 'Outcomes achieved', hint: 'Measures all met', icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
];

/** @param {any} props */
export default function DecisionKpiStrip({ counts = {} } = {}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {tiles.map(({ key, label, hint, icon: Icon, tone }) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">{counts[key] ?? 0}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
          <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
        </div>
      ))}
    </div>
  );
}