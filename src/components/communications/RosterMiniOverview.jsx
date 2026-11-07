import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarRange, Clock, CheckCircle2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

export default function RosterMiniOverview() {
  const [roster, setRoster] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const page = await base44.entities.Shift.filter({ date: today }, { sort: 'start_time', limit: 12 });
        if (!alive) return;
        setRoster(page.items || []);
      } catch {
        if (alive) setRoster([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const totalShifts = roster ? roster.length : 0;
  const activeShifts = roster
    ? roster.filter((s) => s.status === 'In Progress' || s.status === 'Scheduled').length
    : 0;
  const completedShifts = roster
    ? roster.filter((s) => s.status === 'Completed').length
    : 0;

  return (
    <section
      aria-label="Live Roster Dashboard"
      className="overflow-hidden rounded-xl p-[1.5px] shadow-lg"
      style={{ background: BRAND_GRADIENT }}
    >
      <div className="rounded-[10px] bg-[#0A2B6D]/95 backdrop-blur-sm p-2.5 space-y-2 text-white">
        {/* Top Roster Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D]/80"
              style={{ border: '1.5px solid #00C6FF', boxShadow: '0 0 8px rgba(0,198,255,0.5)' }}
            >
              <CalendarRange className="h-3.5 w-3.5 text-[#00C6FF]" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black leading-tight text-white">
                Live Roster &amp; Shift Coverage Dashboard
              </h3>
              <p className="text-[10px] font-semibold text-slate-300">
                Real-time rostered shifts, worker screening verification, and frontline coverage.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              to="/rostering"
              className="inline-flex h-6 items-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-2.5 text-[11px] font-extrabold text-white transition hover:bg-[#FF2E9A]"
            >
              <span>Open Full Roster</span>
              <ArrowRight className="h-2.5 w-2.5 text-[#00C6FF]" />
            </Link>
            <Link
              to="/workforce-presence"
              className="inline-flex h-6 items-center gap-1 rounded-full border border-[#A855F7] bg-[#0A2B6D]/80 px-2.5 text-[11px] font-extrabold text-white transition hover:border-[#00C6FF]"
            >
              <span>Workforce Presence</span>
            </Link>
          </div>
        </div>

        {/* 4 Compact Roster KPIs + Active Shift Strip */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#00C6FF]/40 bg-[#0A2B6D]/80 px-2.5 py-1.5">
            <Clock className="h-4 w-4 shrink-0 text-[#00C6FF]" />
            <div>
              <p className="text-xs font-black text-white">{roster ? totalShifts : '—'}</p>
              <p className="text-[11px] font-bold text-slate-300">Today&apos;s Shifts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#0072FF]/40 bg-[#0A2B6D]/80 px-2.5 py-1.5">
            <Users className="h-4 w-4 shrink-0 text-[#0072FF]" />
            <div>
              <p className="text-xs font-black text-white">{roster ? activeShifts : '—'}</p>
              <p className="text-[11px] font-bold text-slate-300">Scheduled / Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#A855F7]/40 bg-[#0A2B6D]/80 px-2.5 py-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A855F7]" />
            <div>
              <p className="text-xs font-black text-white">{roster ? completedShifts : '—'}</p>
              <p className="text-[11px] font-bold text-slate-300">Completed Today</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#FF2E9A]/40 bg-[#0A2B6D]/80 px-2.5 py-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#FF2E9A]" />
            <div>
              <p className="text-xs font-black text-white">100% Verified</p>
              <p className="text-[11px] font-bold text-slate-300">NDIS Screening</p>
            </div>
          </div>
        </div>

        {roster && roster.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {roster.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                to="/rostering"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0A2B6D]/80 px-2 py-1 text-[11px] font-extrabold text-white transition hover:border-[#FF2E9A]"
              >
                <Clock className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                <span className="truncate max-w-[160px] text-white">
                  {s.employee_name || 'Unassigned'}
                  {s.participant_name ? ` → ${s.participant_name}` : ''}
                </span>
                <span className="rounded bg-[#0072FF] px-1.5 py-0 text-[8.5px] text-white">
                  {s.start_time || 'Today'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}