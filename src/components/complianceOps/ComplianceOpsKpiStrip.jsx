import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Gauge, Timer } from 'lucide-react';

const tiles = [
  { key: 'latestScore', label: 'Latest score', hint: 'Mean control score, most recent run', icon: Gauge, tone: 'text-blue-700 bg-blue-50 border-blue-200', suffix: '%' },
  { key: 'latestConfidence', label: 'Confidence', hint: 'Share of controls holding evidence', icon: Activity, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200', suffix: '%' },
  { key: 'passRate', label: 'Pass rate', hint: 'Controls passing their tests', icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', suffix: '%' },
  { key: 'openGaps', label: 'Open gaps', hint: 'Not closed or risk accepted', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50 border-rose-200', suffix: '' },
  { key: 'highGaps', label: 'High or critical', hint: 'Gaps needing remediation now', icon: ClipboardList, tone: 'text-amber-700 bg-amber-50 border-amber-200', suffix: '' },
  { key: 'plansOverdue', label: 'Remediation overdue', hint: 'Past target date and open', icon: Timer, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200', suffix: '' },
];

/** @param {any} props */
export default function ComplianceOpsKpiStrip({ counts = {} } = {}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ key, label, hint, icon: Icon, tone, suffix }) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">
            {counts[key] ?? 0}{suffix}
          </div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
          <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
        </div>
      ))}
    </div>
  );
}