import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, UserX, Users, FileWarning } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';
import { findUnassigned, findDoubleBookings, findMissingInstructions } from '@/lib/rosterValidation';

const label = (s) => `${s.date ? format(new Date(s.date + 'T00:00:00'), 'd MMM') : '?'} · ${s.start_time || '?'}–${s.end_time || '?'} · ${s.participant_name || 'no participant'}${s.location ? ` · ${s.location}` : ''}`;

// Cross-entity validation panel: unassigned shifts, double-bookings and shifts missing instructions.
export default function RosterExceptions({ shifts = [], onEdit }) {
  const unassigned = findUnassigned(shifts);
  const doubleBooked = findDoubleBookings(shifts);
  const missingInstructions = findMissingInstructions(shifts);

  const group = (icon, title, tone, items, render) => (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
        <Badge className={`border-transparent ${tone}`}>{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-foreground/50">Nothing to action.</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 12).map((item, i) => (
            <li key={i} className="text-xs text-foreground/70">
              {render(item)}
            </li>
          ))}
          {items.length > 12 && <li className="text-xs text-foreground/40">+ {items.length - 12} more</li>}
        </ul>
      )}
    </div>
  );

  return (
    <SectionCard
      title="Roster exceptions"
      description="Unassigned shifts, double-bookings and shifts missing participant instructions — review before the week goes live"
    >
      {unassigned.length === 0 && doubleBooked.length === 0 && missingInstructions.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No roster exceptions" subtitle="Every shift is assigned, booked cleanly and carries instructions." />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {group(<UserX className="h-4 w-4 text-warning" />, 'Unassigned shifts', 'bg-warning/15 text-warning', unassigned,
            (s) => <button className="hover:underline" onClick={() => onEdit?.(s)}>{label(s)}</button>)}
          {group(<Users className="h-4 w-4 text-danger" />, 'Double-bookings', 'bg-danger/15 text-danger', doubleBooked,
            (d) => <button className="hover:underline" onClick={() => onEdit?.(d.a)}><span className="font-semibold">{d.a[d.field]}</span> is double-booked: {label(d.a)} vs {label(d.b)}</button>)}
          {group(<FileWarning className="h-4 w-4 text-brand" />, 'Missing instructions', 'bg-brand/15 text-brand', missingInstructions,
            (s) => <button className="hover:underline" onClick={() => onEdit?.(s)}>{label(s)}</button>)}
        </div>
      )}
    </SectionCard>
  );
}