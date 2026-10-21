import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EmployeeShiftCard({ shift, busy, onAction }) {
  return <article className="space-y-3 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{shift.date} · {shift.start_time || 'Time not set'} – {shift.end_time || 'Time not set'}</h3><Badge variant="outline">{shift.status}</Badge></div>
    <p className="text-sm">{shift.participant_name || 'No participant assigned'}{shift.service_type ? ` · ${shift.service_type}` : ''}</p>
    {shift.location && <p className="text-sm text-muted-foreground">{shift.location}</p>}
    {shift.notes && <p className="whitespace-pre-wrap text-sm">{shift.notes}</p>}
    <div className="flex flex-wrap gap-2">
      {shift.status === 'Scheduled' && shift.staff_confirmation !== 'Confirmed' && <Button variant="outline" disabled={busy} onClick={() => onAction('confirm', shift.id)}>Confirm shift</Button>}
      {shift.status === 'Scheduled' && <Button variant="outline" disabled={busy} onClick={() => onAction('start', shift.id)}>Clock in</Button>}
      {shift.status === 'In Progress' && <Button variant="outline" disabled={busy} onClick={() => onAction('finish', shift.id)}>Clock out</Button>}
      {shift.staff_confirmation === 'Confirmed' && <Badge variant="outline">Confirmed</Badge>}
    </div>
  </article>;
}