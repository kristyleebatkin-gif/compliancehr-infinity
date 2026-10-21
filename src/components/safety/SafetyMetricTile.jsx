import React from 'react';

export default function SafetyMetricTile({ icon: Icon, label, value, colour }) {
  return <div className="safety-summary-tile relative overflow-hidden rounded-xl border p-4" style={{ borderColor: `${colour}99`, background: `linear-gradient(125deg, ${colour}40, ${colour}14)`, boxShadow: `inset 0 4px 0 ${colour}` }}>
    <div className="relative mb-3 flex items-start gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: colour }}><Icon className="h-4 w-4" /></span>
      <span className="pt-1 text-xs font-bold leading-4 text-foreground">{label}</span>
    </div>
    <p className="relative text-3xl font-extrabold leading-none tracking-tight tabular-nums" style={{ color: colour }}>{value}</p>
  </div>;
}