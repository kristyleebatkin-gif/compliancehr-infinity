import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function TeamScreen({ team, derived, onBack }) {
  return (
    <div className="px-3.5 pt-3.5">
      <header className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back" className="tl-btn tl-ghost !px-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="tl-text min-w-0 flex-1 truncate text-[16px] font-extrabold">Team right now</h1>
      </header>
      <section className="tl-card p-3">
        <div className="divide-y divide-[#0A2B6D]/8">
          {team.map((member) => {
            const status = derived.statusFor(member);
            return (
              <div key={member.id} className="flex items-center gap-2 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0A2B6D]/8 text-[10px] font-extrabold text-[#0A2B6D]">
                  {(member.full_name || '?').slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="tl-text truncate text-[12px] font-bold">{member.full_name}</p>
                  <p className="tl-muted truncate text-[9.5px]">{member.position || member.role || 'Team member'}</p>
                </div>
                <span className={`tl-pill tl-${status.tone}`}>{status.label}</span>
              </div>
            );
          })}
          {!team.length ? <p className="tl-muted py-3 text-[11px]">No team profiles yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

export function RosterScreen({ shifts, derived, onBack }) {
  return (
    <div className="px-3.5 pt-3.5">
      <header className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back" className="tl-btn tl-ghost !px-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="tl-text min-w-0 flex-1 truncate text-[16px] font-extrabold">Today's roster</h1>
      </header>
      <section className="tl-card p-3">
        <div className="divide-y divide-[#0A2B6D]/8">
          {shifts.map((shift) => {
            const late = derived.late.some((item) => item.id === shift.id);
            const on = shift.clock_in && !shift.clock_out;
            return (
              <div key={shift.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="tl-text truncate text-[12px] font-bold">{shift.participant_name || 'No participant'}</p>
                  <p className="tl-muted truncate text-[9.5px]">
                    {shift.start_time || '—'}–{shift.end_time || '—'} · {shift.employee_name || 'Unfilled'}
                  </p>
                </div>
                <span className={`tl-pill ${!shift.employee_name ? 'tl-pink' : late ? 'tl-amber' : on ? 'tl-blue' : 'tl-green'}`}>
                  {!shift.employee_name ? 'Unfilled' : late ? 'Not clocked in' : on ? 'On shift' : 'Covered'}
                </span>
              </div>
            );
          })}
          {!shifts.length ? <p className="tl-muted py-3 text-[11px]">No shifts scheduled today.</p> : null}
        </div>
      </section>
    </div>
  );
}