import React from 'react';
import { AlertOctagon, Inbox, RotateCcw, ShieldCheck, Timer, Workflow } from 'lucide-react';

const tiles = [
  { key: 'activeTypes', label: 'Event types', hint: 'Validated payload contracts', icon: ShieldCheck, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'activeSubscriptions', label: 'Subscriptions', hint: 'Live delivery routes', icon: Inbox, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'publishedFlows', label: 'Published flows', hint: 'Ordered, validated routes', icon: Workflow, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
  { key: 'delivered', label: 'Delivered', hint: 'Routed in the last 100 messages', icon: ShieldCheck, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'retrying', label: 'Retrying', hint: 'Waiting on backoff', icon: Timer, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'deadLetters', label: 'Dead letters', hint: 'Need a person to act', icon: AlertOctagon, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
];

/** @param {any} props */
export default function FabricKpiStrip({ counts = {} } = {}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
      <p className="col-span-full flex items-center gap-1.5 text-[11px] text-[#0A2B6D]/70">
        <RotateCcw className="h-3 w-3" /> Counts read the latest 100 deliveries in this business only.
      </p>
    </div>
  );
}