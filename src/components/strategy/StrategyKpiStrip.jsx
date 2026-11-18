import React from 'react';
import { AlertTriangle, BadgeCheck, Coins, Gauge, Layers, Target } from 'lucide-react';

const tiles = [
  { key: 'portfolios', label: 'Portfolios', hint: 'Active strategy portfolios', icon: Layers, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'objectives', label: 'Objectives', hint: 'Across every program', icon: Target, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'overdueObjectives', label: 'Overdue', hint: 'Past their due date', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'benefitValue', label: 'Valued benefit', hint: 'Validated benefits only', icon: Coins, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'capabilities', label: 'Capabilities', hint: 'Tracked maturity', icon: Gauge, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'evidenceBackedCapabilities', label: 'Evidence backed', hint: 'Validated proof of maturity', icon: BadgeCheck, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
];

/** @param {any} props */
export default function StrategyKpiStrip({ counts = {} } = {}) {
  const valueOf = (key) => {
    if (key === 'benefitValue') {
      const amount = counts.benefitValue;
      return typeof amount === 'number' && amount > 0
        ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount)
        : '$0';
    }
    return counts[key] ?? 0;
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ key, label, hint, icon: Icon, tone }) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">{valueOf(key)}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
          <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
        </div>
      ))}
      <p className="col-span-full text-[11px] text-[#0A2B6D]/70">
        Every figure is calculated from records in this business. Progress shows only where a baseline, a target and an actual measure exist, and a capability counts as evidence backed only when a validated assessment carries evidence references.
      </p>
    </div>
  );
}