import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarRange, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Quick open view of the shifts rostered today.
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
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #0d9488 0%, #0891b2 52%, #0284c7 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <CalendarRange className="h-4 w-4 text-white" />
        </span>
        <h3 className="text-base font-bold">Roster</h3>
        <span className="ml-auto text-xs font-semibold text-white/90">{roster ? `${roster.length} shift${roster.length === 1 ? '' : 's'} today` : 'Loading…'}</span>
      </div>
      <div className="p-3.5">
        {!roster ? (
          <p className="py-3 text-center text-xs font-semibold text-muted-foreground">Loading today's shifts…</p>
        ) : roster.length === 0 ? (
          <p className="py-3 text-center text-xs sm:text-sm text-muted-foreground">No shifts rostered today.</p>
        ) : (
          <ul className="space-y-1.5">
            {roster.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold">
                <Clock className="h-4 w-4 shrink-0 text-teal-600" />
                <span className="min-w-0 flex-1 truncate">{s.employee_name || 'Unassigned'}{s.participant_name ? ` · ${s.participant_name}` : ''}</span>
                <span className="shrink-0 text-muted-foreground">{s.start_time || ''}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/roster" className="mt-2.5 block rounded-xl bg-teal-100 py-2 text-center text-xs font-bold text-teal-800 hover:bg-teal-200">
          Open Roster Dashboard
        </Link>
      </div>
    </section>
  );
}