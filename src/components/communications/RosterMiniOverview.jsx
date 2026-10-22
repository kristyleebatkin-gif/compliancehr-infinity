import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarRange, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Quick open view of the shifts rostered, sitting under Team Banter.
export default function RosterMiniOverview() {
  const [roster, setRoster] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const page = await base44.entities.Shift.filter({ date: today }, { sort: 'start_time', limit: 10 });
        if (!alive) return;
        setRoster(page.items || []);
      } catch {
        // Roles without Shift read access simply don't show the roster list.
        if (alive) setRoster([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg">
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <CalendarRange className="h-4 w-4 text-white" />
        <h3 className="text-sm font-bold">Roster</h3>
        <span className="ml-auto text-[10px] font-semibold text-white/85">{roster ? `${roster.length} shift${roster.length === 1 ? '' : 's'} today` : 'Loading…'}</span>
      </div>
      <div className="p-2">
        {!roster ? (
          <p className="py-2 text-center text-[11px] font-semibold text-muted-foreground">Loading today's shifts…</p>
        ) : roster.length === 0 ? (
          <p className="py-2 text-center text-[11px] text-muted-foreground">No shifts rostered today.</p>
        ) : (
          <ul className="space-y-1">
            {roster.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
                <Clock className="h-3 w-3 shrink-0 text-blue-600" />
                <span className="min-w-0 flex-1 truncate">{s.employee_name || 'Unassigned'}{s.participant_name ? ` · ${s.participant_name}` : ''}</span>
                <span className="shrink-0 text-muted-foreground">{s.start_time || ''}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/roster" className="mt-1.5 block rounded-lg bg-violet-100 py-1 text-center text-[11px] font-bold text-violet-700 hover:bg-violet-200">
          Open Roster Dashboard
        </Link>
      </div>
    </section>
  );
}