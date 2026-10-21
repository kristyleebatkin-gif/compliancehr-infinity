import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Card, CardContent } from '@/components/ui/card';
import { AREAS } from '@/lib/auditSchedule';
import { addMonths, differenceInDays, format } from 'date-fns';
import { CalendarClock } from 'lucide-react';

const toneForState = (state) => {
  if (state === 'Overdue') return statusTone('Overdue');
  if (state === 'Due soon') return statusTone('In Progress');
  if (state === 'Current') return statusTone('Complete');
  return 'bg-muted text-muted-foreground';
};

export default function ReviewSchedule({ audits }) {
  const rows = useMemo(() => AREAS.map((entry) => {
    const matching = audits
      .filter((a) => (a.audit_area || '').trim().toLowerCase() === entry.area.toLowerCase())
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const last = matching[0];
    const nextDue = last?.date ? format(addMonths(new Date(last.date), entry.months), 'yyyy-MM-dd') : '';
    let state = 'Not started';
    if (nextDue) {
      const days = differenceInDays(new Date(nextDue), new Date());
      state = days < 0 ? 'Overdue' : days <= 30 ? 'Due soon' : 'Current';
    }
    return { ...entry, lastDate: last?.date || '', nextDue, state, count: matching.length };
  }), [audits]);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#6d28d9]" />
          <p className="font-semibold">Audit review schedule</p>
          <span className="text-xs text-muted-foreground">required review cycles by area</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Area</th>
                <th className="py-2 pr-3">Frequency</th>
                <th className="py-2 pr-3">Last audit</th>
                <th className="py-2 pr-3">Next due</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.area} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium">{row.area}</td>
                  <td className="py-2 pr-3 text-muted-foreground">Every {row.months} months</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.lastDate ? format(new Date(row.lastDate), 'd MMM yyyy') : 'No audit yet'}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.nextDue ? format(new Date(row.nextDue), 'd MMM yyyy') : '-'}</td>
                  <td className="py-2"><Badge className={toneForState(row.state)}>{row.state}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}