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
    <section className="overflow-hidden rounded-lg border border-purple-300 bg-white shadow-sm">
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-1.5 px-2 py-1 text-white"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)',
          '--comm-bar-bg': 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)',
          color: '#fff',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20">
            <CalendarRange className="h-2.5 w-2.5 text-white" />
          </span>
          <h3 className="text-[10px] font-extrabold leading-none">Today&apos;s Roster Overview</h3>
          <span className="rounded-full bg-white/20 px-1.5 py-0 text-[8.5px] font-bold text-white">
            {roster ? `${roster.length} shift${roster.length === 1 ? '' : 's'}` : '…'}
          </span>
        </div>
        <Link
          to="/roster"
          className="rounded bg-white px-1.5 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] shadow-sm hover:bg-pink-50"
          style={{ color: '#0A2B6D' }}
        >
          Open Roster
        </Link>
      </div>
      {roster && roster.length > 0 && (
        <div className="flex flex-wrap gap-1 p-1">
          {roster.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="inline-flex items-center gap-1 rounded border border-[#0A2B6D]/25 bg-white px-1.5 py-0 text-[8.5px] font-bold text-[#0A2B6D]"
              style={{ color: '#0A2B6D' }}
            >
              <Clock className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" style={{ color: '#0A2B6D' }} />
              <span className="truncate max-w-[110px] text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                {s.employee_name || 'Unassigned'}
                {s.participant_name ? ` · ${s.participant_name}` : ''}
              </span>
              <span className="text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>{s.start_time || ''}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}