import React from 'react';
import '@/components/finance/financeWorkspace.css';

const TONES = { primary: 'finance-tone-primary', evidence: 'finance-tone-evidence', safe: 'finance-tone-safe', warning: 'finance-tone-warning', pink: 'finance-tone-pink', danger: 'finance-tone-danger' };
export default function FinanceMetricCards({ entries, compact = false }) {
  return <div className={compact ? 'flex flex-wrap gap-2' : 'finance-metrics grid grid-cols-2 gap-3'}>{entries.map(({ label, value, Icon, tone }) => <section key={label} className={`finance-metric min-w-0 ${compact ? 'px-3 py-2' : 'p-4'} ${TONES[tone] || TONES.primary}`}>
    {Icon && <div className="finance-metric-icon mb-2 inline-flex rounded-lg p-2"><Icon className="h-4 w-4" /></div>}
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`finance-metric-value mt-1 break-words font-bold tabular-nums ${compact ? 'text-sm' : 'text-xl'}`}>{value}</p>
  </section>)}</div>;
}