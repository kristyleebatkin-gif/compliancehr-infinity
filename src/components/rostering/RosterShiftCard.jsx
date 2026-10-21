import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, UserRound, UserX } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';
import { shiftHours } from '@/lib/rostering';

export default function RosterShiftCard({ shift, onEdit }) {
  const hours = shiftHours(shift.start_time, shift.end_time);
  return <button type="button" onClick={() => onEdit(shift)} className="w-full space-y-3 rounded-lg border border-border border-l-4 border-l-primary bg-card p-3 text-left shadow-sm transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-foreground"><Clock className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{shift.start_time || 'Time not set'}{shift.end_time ? ` – ${shift.end_time}` : ''}</span></div>
    <p className="flex items-start gap-1.5 break-words text-sm font-semibold">{shift.employee_name ? <><UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />{shift.employee_name}</> : <span className="inline-flex items-center gap-1 text-warning"><UserX className="h-3.5 w-3.5" />Unassigned</span>}</p>
    {shift.participant_name && <p className="break-words text-xs text-foreground">{shift.participant_name}</p>}
    {shift.location && <p className="flex items-start gap-1 break-words text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" />{shift.location}</p>}
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"><Badge className={statusTone(shift.status)}>{shift.status}</Badge>{Boolean(hours) && <span className="text-xs font-semibold tabular-nums text-muted-foreground">{hours}h</span>}</div>
  </button>;
}