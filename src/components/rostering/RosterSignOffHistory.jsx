import React from 'react';
import { format } from 'date-fns';

export default function RosterSignOffHistory({ signOffs }) {
  return <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <div className="border-b border-border bg-safe/10 px-3 py-2 text-xs font-bold text-safe">Recent sign-offs</div>
    <div className="max-h-64 overflow-auto">
      <table className="w-full min-w-[600px] text-left text-xs">
        <thead className="sticky top-0 bg-muted text-muted-foreground"><tr>{['Week starting', 'Signed off by', 'Signed date', 'Shifts', 'Exceptions', 'Notes'].map((heading) => <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{signOffs.map((s) => <tr key={s.id} className="even:bg-muted/40 hover:bg-accent/50">
          <td className="whitespace-nowrap px-3 py-2 font-semibold">{s.week_start ? format(new Date(s.week_start + 'T00:00:00'), 'd MMM yyyy') : '—'}</td>
          <td className="px-3 py-2">{s.signed_off_by || '—'}</td><td className="whitespace-nowrap px-3 py-2">{s.signed_off_date || '—'}</td>
          <td className="px-3 py-2 tabular-nums">{s.shift_count ?? '—'}</td>
          <td className="px-3 py-2"><span className="block">Unassigned: {s.unassigned_count ?? 0}</span><span className="block">Double-bookings: {s.double_bookings ?? 0}</span><span className="block">Missing instructions: {s.missing_instructions ?? 0}</span></td>
          <td className="max-w-xs whitespace-pre-wrap px-3 py-2">{s.notes || '—'}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}