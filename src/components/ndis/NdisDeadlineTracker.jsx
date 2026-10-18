import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarClock } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';

const daysUntil = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
};

const toneFor = (d) => (d < 0 ? 'bg-rose-500/10 text-rose-600' : d <= 14 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600');
const labelFor = (d) => (d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `${d}d left`);

// NDIS compliance deadline tracker: upcoming and overdue regulatory deadlines.
export default function NdisDeadlineTracker() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let live = true;
    base44.entities.NDISComplianceDeadline.filter({}, { sort: 'due_date', limit: 100 })
      .then((page) => { if (live) setItems(page.items || []); })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, []);

  if (!items) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading NDIS deadlines...
      </CardContent></Card>
    );
  }

  const open = items.filter((i) => !['Completed', 'Submitted'].includes(i.status));
  const done = items.length - open.length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-500/10 p-2"><CalendarClock className="h-4 w-4 text-teal-600" /></div>
            <div>
              <p className="text-sm font-bold">NDIS Compliance Deadlines</p>
              <p className="text-xs text-muted-foreground">Registration, audits, reporting and plan reviews</p>
            </div>
          </div>
          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-700">{done} of {items.length} completed</span>
        </div>

        <div className="mt-4 space-y-2">
          {open.map((i) => {
            const d = daysUntil(i.due_date);
            return (
              <div key={i.id} className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">{i.title}</p>
                  <p className="text-[11px] text-muted-foreground">{i.deadline_type} · Owner: {i.owner || 'Unassigned'}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneFor(d ?? 999)}`}>{labelFor(d ?? 0)}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusTone(i.status)}`}>{i.status}</Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">{i.priority}</Badge>
                </div>
              </div>
            );
          })}
          {open.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">All NDIS deadlines are completed or submitted.</p>}
        </div>
      </CardContent>
    </Card>
  );
}