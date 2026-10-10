import React from 'react';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Download } from 'lucide-react';

const TONE = {
  'Reported': 'bg-brand/10 text-brand',
  'Under Investigation': 'bg-warning/15 text-warning',
  'Action Required': 'bg-orange-500/15 text-orange-600',
  'Resolved': 'bg-safe/15 text-safe',
  'Identified': 'bg-brand/10 text-brand',
  'Assessed': 'bg-purple-100 text-purple-700',
  'Treating': 'bg-warning/15 text-warning',
  'Monitored': 'bg-teal/10 text-teal',
};
const CLOSED_TONE = 'bg-muted text-foreground/60';

export default function StatusDashboard({
  title,
  description,
  records = [],
  statuses = [],
  subField,
  onChange,
  disabled = false,
  onExport,
  emptyTitle,
}) {
  const counts = Object.fromEntries(statuses.map((s) => [s, records.filter((r) => (r.status || '') === s).length]));

  return (
    <SectionCard
      title={title}
      description={description}
      action={onExport ? (
        <button onClick={onExport} disabled={records.length === 0} className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 disabled:opacity-50">
          <Download className="h-3.5 w-3.5" />Export CSV
        </button>
      ) : null}
    >
      {records.length === 0 ? (
        <EmptyState title={emptyTitle || `Nothing in the ${title.toLowerCase()} yet`} subtitle="Records will appear here with a changeable status." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <div key={s} className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[s] || CLOSED_TONE}`}>{s}: {counts[s]}</div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.title || 'Untitled'}</div>
                  {subField && r[subField] && <div className="text-[11px] text-foreground/40">{r[subField]}</div>}
                </div>
                <select
                  disabled={disabled}
                  value={r.status || ''}
                  onChange={(e) => onChange(r, e.target.value)}
                  className="shrink-0 rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-semibold disabled:opacity-70"
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
}