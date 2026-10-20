import React from 'react';
import { format } from 'date-fns';
import { CalendarDays, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { statusTone } from '@/lib/statusStyles';
import GoalNotes from '@/components/goals/GoalNotes';

export default function GoalProgressCard({ g, compact, isAdmin, ourView, onProgress, onApprove, onDelete }) {
  return <Card className="min-w-0 overflow-hidden rounded-xl border-border/70 shadow-sm">
    <CardContent className={compact ? 'space-y-1.5 p-2' : 'space-y-2 p-2.5'}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 basis-48">
          <p className="text-[11px] font-semibold text-primary">{g.participant_name}{g.category ? ` · ${g.category}` : ''}</p>
          <h3 className="mt-0.5 break-words text-sm font-bold leading-5 text-foreground">{g.goal}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">{!g.admin_approved && <Badge variant="outline" className="text-[10px]">Awaiting approval</Badge>}<Badge className={statusTone(g.status)}>{g.status}</Badge></div>
      </div>
      <div className="rounded-lg bg-muted/40 p-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
          {compact ? <span className="text-sm font-bold tabular-nums text-primary">{g.progress || 0}%</span> : <div className="flex items-center gap-1.5"><Input aria-label={`Progress percentage for ${g.goal}`} type="number" min="0" max="100" value={g.progress ?? 0} onChange={(event) => onProgress(g, Number(event.target.value) || 0)} className="h-8 w-20 bg-card text-right text-sm tabular-nums" /><span className="text-xs text-muted-foreground">%</span></div>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(g.progress || 0, 100)}%` }} /></div>
      </div>
      {(g.target_date || g.support_needed) && <div className="grid gap-2 text-xs text-muted-foreground">
        {g.target_date && <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 shrink-0" />Target {format(new Date(g.target_date), 'd MMM yyyy')}</p>}
        {g.support_needed && <p className="break-words leading-5"><span className="font-semibold text-foreground">Support needed: </span>{g.support_needed}</p>}
      </div>}
      {!compact && <>
        <div className="flex items-center justify-end gap-1.5 border-t border-border/60 pt-2">
          {isAdmin && !g.admin_approved && <Button variant="outline" size="sm" className="h-8" onClick={() => onApprove(g)}>Approve</Button>}
          <Button aria-label={`Delete goal: ${g.goal}`} variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(g)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
        <GoalNotes goal={g} participantName={g.participant_name} readOnly={ourView} />
      </>}
    </CardContent>
  </Card>;
}