import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Ban } from 'lucide-react';

const TONES = {
  ready: { label: 'Ready', className: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  complete: { label: 'Done', className: 'border-sky-200 bg-sky-50 text-[#0A2B6D]', Icon: CheckCircle2 },
  blocked: { label: 'Blocked', className: 'border-rose-200 bg-rose-50 text-rose-700', Icon: Ban },
  incomplete: { label: 'Unknown', className: 'border-amber-200 bg-amber-50 text-amber-800', Icon: HelpCircle },
};

export default function GateBadge({ state, count = null }) {
  const tone = TONES[state] || TONES.incomplete;
  const Icon = tone.Icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${tone.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {tone.label}
      {count !== null ? ` ${count}` : ''}
    </span>
  );
}

/** Blockers are faults; unknowns are honest gaps. Kept visually distinct on purpose. */
export function GateFindings({ blockers = [], unknowns = [], limit = 4 }) {
  if (!blockers.length && !unknowns.length) return null;
  return (
    <div className="space-y-1">
      {blockers.slice(0, limit).map((b) => (
        <div key={b.code + b.label} className="flex items-start gap-1.5 text-[11.5px] leading-4 text-rose-700">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{b.label}</span>
        </div>
      ))}
      {unknowns.slice(0, limit).map((u) => (
        <div key={u} className="flex items-start gap-1.5 text-[11.5px] leading-4 text-amber-800">
          <HelpCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{u}</span>
        </div>
      ))}
      {blockers.length + unknowns.length > limit && (
        <p className="text-[11px] text-muted-foreground">+{blockers.length + unknowns.length - limit} more</p>
      )}
    </div>
  );
}