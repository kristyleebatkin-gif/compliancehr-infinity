import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskWorkloadStrip({ tasks }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const byPerson = new Map();
  tasks.filter((t) => !['Completed', 'Finalised', 'Pending Approval', 'Cancelled'].includes(t.status)).forEach((t) => {
    const name = t.assigned_to || 'Unallocated';
    const row = byPerson.get(name) || { name, open: 0, overdue: 0 };
    row.open += 1;
    if (t.due_date && t.due_date < today) row.overdue += 1;
    byPerson.set(name, row);
  });
  const rows = [...byPerson.values()].sort((a, b) => (b.overdue * 3 + b.open) - (a.overdue * 3 + a.open)).slice(0, 6);
  const max = Math.max(1, ...rows.map((r) => r.open));
  return <Card className="task-workload-panel min-w-0"><CardContent className="task-overview-content">
    <h3 className="task-panel-heading"><Users className="h-4 w-4" />Who is carrying what (live)</h3>
    {!rows.length && <p className="text-xs text-muted-foreground">No pending workload.</p>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{rows.map((r) => <div key={r.name} className="min-w-0 rounded-lg border border-primary/15 bg-card/70 p-2">
      <p className="break-words text-xs font-semibold">{r.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{r.open} open{r.overdue ? ` · ${r.overdue} overdue` : ''}</p>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted"><div className="shrink-0 bg-danger" style={{ width: `${r.overdue / max * 100}%` }} /><div className="bg-primary" style={{ width: `${(r.open - r.overdue) / max * 100}%` }} /></div>
    </div>)}</div>
  </CardContent></Card>;
}