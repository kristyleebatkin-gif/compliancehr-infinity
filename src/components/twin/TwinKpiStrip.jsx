import React from 'react';
import { Activity, Boxes, ClipboardCheck, FlaskConical, Gauge, PlayCircle } from 'lucide-react';

const tiles = [
  { key: 'models', label: 'Twin models', hint: 'Draft, validated and approved', icon: Boxes, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'approvedModels', label: 'Approved models', hint: 'Version approved for use', icon: ClipboardCheck, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'approvedScenarios', label: 'Approved scenarios', hint: 'Decided by a reviewer', icon: FlaskConical, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'runs', label: 'Simulations run', hint: 'Every run is kept with its inputs', icon: PlayCircle, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
  { key: 'latestProjected', label: 'Latest estimate', hint: 'Modelled index, not observed', icon: Gauge, tone: 'text-amber-700 bg-amber-50 border-amber-200', suffix: '/100' },
  { key: 'latestConfidence', label: 'Confidence', hint: 'Share of inputs with records', icon: Activity, tone: 'text-slate-700 bg-slate-50 border-slate-200', suffix: '%' },
];

/** @param {any} props */
export default function TwinKpiStrip({ counts = {} } = {}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ key, label, hint, icon: Icon, tone, suffix = '' }) => {
        const value = counts[key];
        return (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">
              {value === null || value === undefined ? '—' : `${value}${suffix}`}
            </div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
            <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
          </div>
        );
      })}
    </div>
  );
}