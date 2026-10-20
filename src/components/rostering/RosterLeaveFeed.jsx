import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarOff } from 'lucide-react';
import { format } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';

// Admin-only feed of approved and pending leave so rostering can plan
// coverage around time off.
export default function RosterLeaveFeed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.LeaveRequest.filter(
        { status: { $in: ['Pending', 'Approved'] } },
        { sort: 'start_date', limit: 100 },
      );
      setRows(page.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><CalendarOff className="h-4 w-4" /></span>
          <p className="text-sm font-bold">Leave &amp; unavailability</p>
          <Badge variant="secondary" className="tabular-nums">{rows.length}</Badge>
        </div>
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading leave…</p>
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No pending or approved leave. Leave requests raised in HR Hub appear here automatically.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">From</th><th className="py-2 pr-3">To</th><th className="py-2 pr-3">Days</th><th className="py-2 pr-3">Coverage</th><th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.staff_name || '—'}</td>
                    <td className="py-2 pr-3">{r.leave_type || '—'}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.start_date ? format(new Date(r.start_date), 'd MMM yyyy') : '—'}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.end_date ? format(new Date(r.end_date), 'd MMM yyyy') : '—'}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.days ?? '—'}</td>
                    <td className="py-2 pr-3">{r.coverage_arranged || '—'}</td>
                    <td className="py-2"><Badge className={statusTone(r.status)}>{r.status || 'Pending'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}