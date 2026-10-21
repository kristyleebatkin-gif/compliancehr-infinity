import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Eye, Pencil, Trash2, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function VolunteerRegisterCard({ volunteer: v, canManage, onView, onEdit, onDelete }) {
  return <article className="volunteer-register-card min-w-0 rounded-xl border p-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0"><h2 className="break-words text-sm font-bold">{v.full_name}</h2><p className="text-xs text-muted-foreground">{v.role || 'Volunteer'}{v.start_date ? ` · Started ${format(new Date(v.start_date), 'd MMM yyyy')}` : ''}</p></div>
      <Badge className={statusTone(v.status)}>{v.status}</Badge>
    </div>
    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
      <div><dt className="font-semibold">Supervisor</dt><dd>{v.supervisor || '—'}</dd></div>
      <div><dt className="font-semibold">Availability</dt><dd className="break-words">{v.availability || (v.weekly_hours != null ? `${v.weekly_hours} hrs/week` : '—')}</dd></div>
      <div><dt className="font-semibold">Intake form</dt><dd>{v.intake_form_uri ? 'Stored' : 'Pending'}</dd></div>
      <div className="flex items-center gap-1">
        {v.email && <a href={`mailto:${v.email}`} className="rounded-md border border-primary/30 bg-primary/10 p-1.5" aria-label={`Email ${v.full_name}`}><Mail className="h-3.5 w-3.5" /></a>}
        {v.phone && <a href={`sms:${v.phone}`} className="rounded-md border border-safe/30 bg-safe/10 p-1.5" aria-label={`Text ${v.full_name}`}><MessageSquare className="h-3.5 w-3.5" /></a>}
      </div>
    </dl>
    <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-primary/15 pt-2">
      <Button variant="outline" size="sm" onClick={onView}><Eye className="h-3.5 w-3.5" />Details</Button>
      {canManage && <><Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" />Edit</Button><Button variant="ghost" size="icon" aria-label={`Delete ${v.full_name}`} onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></>}
    </div>
  </article>;
}