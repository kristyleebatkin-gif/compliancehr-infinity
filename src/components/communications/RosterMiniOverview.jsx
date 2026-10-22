import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarRange, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Quick open view of the shifts rostered today — styled in bright purple.
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
        if (alive) setRoster([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-purple-300 bg-card shadow-sm">
      <div className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-2 px-3 py-1.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)', color: '#fff' }}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
            <CalendarRange className="h-3.5 w-3.5 text-white" />
          </span>
          <h3 className="text-xs font-extrabold">Today&apos;s Roster Overview</h3>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
            {roster ? `${roster.length} shift${roster.length === 1 ? '' : 's'} today` : 'Loading…'}
          </span>
        </div>
        <Link to="/roster" className="rounded-lg bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-purple-900 shadow-sm hover:bg-pink-50">
          Open Roster
        </Link>
      </div>
      {roster && roster.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2">
          {roster.slice(0, 6).map((s) => (
            <div key={s.id} className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50/60 px-2 py-0.5 text-[10px] font-bold">
              <Clock className="h-3 w-3 shrink-0 text-purple-600" />
              <span className="truncate">{s.employee_name || 'Unassigned'}{s.participant_name ? ` · ${s.participant_name}` : ''}</span>
              <span className="text-muted-foreground">{s.start_time || ''}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}