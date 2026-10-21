import React from 'react';
import { Users, UserCheck, CalendarClock } from 'lucide-react';

const TILES = [
  { key: 'total', label: 'Total profiles', Icon: Users, tone: 'var(--primary)' },
  { key: 'active', label: 'Active', Icon: UserCheck, tone: 'var(--safe)' },
  { key: 'onLeave', label: 'On leave', Icon: CalendarClock, tone: 'var(--chart-5)' },
];
export default function EmployeeDirectorySummary({ summary, loading, error, onRetry }) {
  return <section aria-label="Employee profile summary" className="space-y-2">
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {TILES.map(({ key, label, Icon, tone }) => <div key={key} className="employee-directory-tile employee-directory-summary-tile flex min-w-0 flex-col justify-center gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:p-5" style={{ '--directory-tone': tone }}>
        <Icon className="h-6 w-6 shrink-0" />
        <div><p className="text-2xl font-extrabold tabular-nums sm:text-3xl">{loading ? '…' : error ? '—' : summary?.[key] ?? 0}</p><p className="text-xs font-bold">{label}</p></div>
      </div>)}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">Unable to load employee totals. <button type="button" onClick={onRetry} className="underline">Retry</button></p>}
  </section>;
}