import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarRange, UserX, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Small live overview of the roster dashboard: today's shift picture at a glance.
export default function RosterMiniOverview() {
  const [stats, setStats] = useState(null);
  const [next, setNext] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const weekEnd = format(new Date(Date.now() + 6 * 86400000), 'yyyy-MM-dd');
        const page = await base44.entities.Shift.filter(
          { date: { $gte: today, $lte: weekEnd } },
          { sort: 'date', limit: 500 }
        );
        if (!alive) return;
        const shifts = page.items || [];
        const todays = shifts.filter((s) => s.date === today);
        setStats({
          todayTotal: todays.length,
          unassigned: todays.filter((s) => !s.employee_name).length,
          inProgress: todays.filter((s) => s.status === 'In Progress').length,
          completed: todays.filter((s) => s.status === 'Completed').length,
          weekTotal: shifts.length,
        });
        setNext(todays.find((s) => s.status === 'Scheduled' && s.employee_name) || null);
      } catch {
        // Roles without Shift read access simply don't show the overview.
        if (alive) setStats({ todayTotal: 0, unassigned: 0, inProgress: 0, completed: 0, weekTotal: 0 });
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg">
      <div className="flex items-center gap-2.5 px-3 py-2" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <CalendarRange className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-sm font-bold">Roster Dashboard</h3>
          <p className="text-[10px] font-semibold text-white/85">Today's shifts and the week ahead</p>
        </div>
      </div>

      {!stats ? (
        <div className="py-6 text-center text-xs font-semibold text-muted-foreground">Loading roster…</div>
      ) : (
        <div className="p-2.5">
          <div className="grid grid-cols-4 gap-1.5">
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-2 text-center">
              <CalendarRange className="mx-auto mb-1 h-3.5 w-3.5 text-blue-600" />
              <p className="text-lg font-bold leading-5 text-blue-700">{stats.todayTotal}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Today</p>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-rose-50 to-pink-50 p-2 text-center">
              <UserX className="mx-auto mb-1 h-3.5 w-3.5 text-rose-600" />
              <p className="text-lg font-bold leading-5 text-rose-700">{stats.unassigned}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Unassigned</p>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-2 text-center">
              <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-amber-600" />
              <p className="text-lg font-bold leading-5 text-amber-700">{stats.inProgress}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">On Shift</p>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-50 p-2 text-center">
              <CheckCircle2 className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-600" />
              <p className="text-lg font-bold leading-5 text-emerald-700">{stats.completed}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Done</p>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold text-muted-foreground">
            {stats.weekTotal} shifts scheduled over the next 7 days
            {next?.start_time && next?.employee_name ? ` · Next: ${next.employee_name}${next.participant_name ? ` with ${next.participant_name}` : ''} at ${next.start_time}` : ''}
          </p>
          <Link to="/roster" className="mt-1 block rounded-lg border py-1 text-center text-[11px] font-bold text-violet-700 hover:bg-violet-50">
            Open Roster Dashboard
          </Link>
        </div>
      )}
    </section>
  );
}