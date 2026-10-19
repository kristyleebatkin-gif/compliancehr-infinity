import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, History } from 'lucide-react';

// Employment timeline view (Rippling/ADP benchmark): every dated employment event in one trail.
const fmt = (d) => (d ? String(d).slice(0, 10) : '');

export default function EmploymentTimeline({ staff }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    let live = true;
    const name = staff?.full_name || '';
    Promise.all([
      base44.entities.EmployeeEmploymentContract.filter({ employee_name: name }),
      base44.entities.EmployeePerformanceAppraisal.filter({ employee_name: name }),
    ])
      .then(([contracts, appraisals]) => {
        if (!live) return;
        const list = [];
        contracts.forEach((c) => {
          if (c.commencement_date) list.push({ date: fmt(c.commencement_date), label: `Employment commenced${c.position_title ? ` as ${c.position_title}` : ''}`, detail: [c.employment_type, c.classification].filter(Boolean).join(' · ') });
          if (c.probation_end_date) list.push({ date: fmt(c.probation_end_date), label: 'Probation period completed', detail: c.contract_status ? `Contract: ${c.contract_status}` : '' });
          if (c.employee_signed_date || c.employer_signed_date) list.push({ date: fmt(c.employee_signed_date || c.employer_signed_date), label: 'Employment contract signed', detail: '' });
          if (c.end_date) list.push({ date: fmt(c.end_date), label: 'Employment ended', detail: '' });
        });
        appraisals.forEach((a) => {
          const when = a.completed_date || a.scheduled_review_date;
          if (!when) return;
          const pending = !a.completed_date;
          list.push({
            date: fmt(when),
            label: pending ? 'Performance review scheduled' : `Performance review completed${a.overall_rating ? ` · Rated ${a.overall_rating}` : ''}`,
            detail: pending ? `Due ${fmt(when)}` : a.outcome || '',
          });
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setEvents(list);
      })
      .catch(() => live && setEvents([]));
    return () => { live = false; };
  }, [staff?.id, staff?.full_name]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-sky-500/10 p-2"><History className="h-4 w-4 text-sky-600" /></div>
          <div>
            <p className="text-sm font-bold">Employment timeline</p>
            <p className="text-xs text-muted-foreground">Contracts, probation and reviews for {staff?.full_name}, newest first</p>
          </div>
        </div>

        {events === null ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Loading timeline...
          </div>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No dated employment events yet. Events appear here when a contract is signed or a review is scheduled.
          </p>
        ) : (
          <ol className="mt-4 space-y-0 border-l border-border/60 pl-4">
            {events.map((e, i) => (
              <li key={i} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-500" />
                <p className="text-[11px] font-semibold tabular-nums text-muted-foreground">{e.date}</p>
                <p className="text-sm font-semibold leading-snug">{e.label}</p>
                {e.detail && <p className="text-xs text-muted-foreground">{e.detail}</p>}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}