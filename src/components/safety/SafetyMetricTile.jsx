import React from 'react';

export default function SafetyMetricTile({ icon: Icon, label, value, tone }) {
  const tones = { warning: 'border-warning/35 bg-warning/10 text-warning', primary: 'border-primary/35 bg-primary/10 text-primary', danger: 'border-danger/35 bg-danger/10 text-danger', teal: 'border-hr-evidence/35 bg-hr-evidence/10 text-hr-evidence' };
  return <div data-safety-tone={tone} className={`safety-summary-tile relative overflow-hidden rounded-xl border p-4 ${tones[tone] || tones.primary}`}>
    <div className="safety-metric-topline absolute inset-x-0 top-0 h-1" />
    <div className="relative mb-3 flex items-start gap-2">
      <span className="safety-metric-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"><Icon className="h-4 w-4" /></span>
      <span className="pt-1 text-xs font-bold leading-4 text-foreground">{label}</span>
    </div>
    <p className="safety-metric-value relative text-3xl font-extrabold leading-none tracking-tight tabular-nums">{value}</p>
  </div>;
}