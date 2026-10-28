import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Car, StickyNote, Clock, ClipboardCheck, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

// Operations overview for rostering: shift notes done/not done, car safety
// checks done/not done, and clock-in/out approvals — with bulk approval.
export default function RosterOpsOverview({ onOpenApprovals }) {
  const [range, setRange] = useState({ from: format(addDays(new Date(), -30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftPage, notes, checks] = await Promise.all([
        base44.entities.Shift.filter({ status: 'Completed', date: { $gte: range.from, $lte: range.to } }, { sort: '-date', limit: 500 }),
        base44.entities.ShiftNote.filter({ date: { $gte: range.from, $lte: range.to } }, { limit: 500 }),
        base44.entities.VehicleSafetyCheck.filter({ check_date: { $gte: range.from, $lte: range.to } }, { limit: 500 }),
      ]);
      const shifts = shiftPage.items || [];
      const noteKeys = new Set((notes.items || []).map((n) => `${n.date}|${(n.participant_name || '').trim().toLowerCase()}`));
      const checkShiftIds = new Set((checks.items || []).map((c) => c.shift_id));
      const missingNotes = shifts.filter((s) => !noteKeys.has(`${s.date}|${(s.participant_name || '').trim().toLowerCase()}`));
      const travelShifts = shifts; // Provider policy: check every shift.
      const missingChecks = travelShifts.filter((s) => !checkShiftIds.has(s.id));
      setData({
        shifts,
        notesDone: shifts.length - missingNotes.length,
        missingNotes: missingNotes.slice(0, 20),
        travelCount: travelShifts.length,
        checksDone: travelShifts.length - missingChecks.length,
        missingChecks: missingChecks.slice(0, 20),
        pending: shifts.filter((s) => s.approval_status === 'Pending Approval'),
        approved: shifts.filter((s) => s.approval_status === 'Approved').length,
        rejected: shifts.filter((s) => s.approval_status === 'Rejected').length,
        notClocked: shifts.filter((s) => !s.clock_in).length,
      });
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const Stat = ({ icon: Icon, tone, label, value }) => (
    <div className="flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><ClipboardCheck className="h-4 w-4" /></span>
            <p className="text-sm font-bold">Operations overview</p>
          </div>
          <div className="flex-1" />
          <Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="w-36" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="w-36" />
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data ? null : (
          <>
            {/* Shift notes */}
            <div className="rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-brand" /><p className="text-sm font-bold">Shift notes</p></div>
                <div className="flex flex-wrap items-center gap-4">
                  <Stat icon={CheckCircle2} tone="bg-safe/10 text-safe" label="completed" value={data.notesDone} />
                  <Stat icon={AlertTriangle} tone="bg-warning/10 text-warning" label="not completed" value={data.missingNotes.length === 20 ? '20+' : data.missingNotes.length} />
                </div>
              </div>
              {data.missingNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">Every completed shift in this period has a shift note.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {data.missingNotes.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-warning/5 px-2.5 py-1.5 text-xs">
                      <span className="font-semibold tabular-nums">{format(new Date(s.date), 'd MMM yyyy')}</span>
                      <span>{s.participant_name || 'No participant'}</span>
                      <span className="text-muted-foreground">{s.employee_name || 'Unassigned'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car safety checks */}
            <div className="rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Car className="h-4 w-4 text-warning" /><p className="text-sm font-bold">Car safety checks</p><Badge variant="secondary">{data.travelCount} shift(s) requiring a check</Badge></div>
                <div className="flex flex-wrap items-center gap-4">
                  <Stat icon={CheckCircle2} tone="bg-safe/10 text-safe" label="completed" value={data.checksDone} />
                  <Stat icon={AlertTriangle} tone="bg-warning/10 text-warning" label="not completed" value={data.missingChecks.length === 20 ? '20+' : data.missingChecks.length} />
                </div>
              </div>
              {data.missingChecks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Every loaded completed shift has a linked check. Review unsuccessful checks separately.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {data.missingChecks.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-warning/5 px-2.5 py-1.5 text-xs">
                      <span className="font-semibold tabular-nums">{format(new Date(s.date), 'd MMM yyyy')}</span>
                      <span>{s.employee_name || 'Unassigned'}</span>
                      <span className="text-muted-foreground">→ {s.participant_name || 'No participant'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clock in/out approvals */}
            <div className="rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-teal" /><p className="text-sm font-bold">Clock in / out &amp; approvals</p></div>
                <div className="flex flex-wrap items-center gap-4">
                  <Stat icon={Clock} tone="bg-warning/10 text-warning" label="awaiting approval" value={data.pending.length} />
                  <Stat icon={CheckCircle2} tone="bg-safe/10 text-safe" label="approved" value={data.approved} />
                  <Stat icon={AlertTriangle} tone="bg-destructive/10 text-destructive" label="rejected" value={data.rejected} />
                  <Stat icon={AlertTriangle} tone="bg-muted text-muted-foreground" label="not clocked in" value={data.notClocked} />
                </div>
              </div>
              {data.pending.length === 0 ? (
                <p className="text-xs text-muted-foreground">No clocked hours awaiting approval in this period.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={onOpenApprovals}>Open approvals ({data.pending.length})</Button>
                  <p className="text-xs text-muted-foreground">First pending: {format(new Date(data.pending[0].date), 'd MMM')} · {data.pending[0].employee_name || 'Unassigned'}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}