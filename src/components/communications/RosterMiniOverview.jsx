import React from 'react';
import { CalendarRange } from 'lucide-react';
import { Link } from 'react-router-dom';

// Slim launch card: the Roster Dashboard itself lives on its own page.
export default function RosterMiniOverview() {
  return (
    <Link
      to="/roster"
      className="group flex items-center gap-2.5 overflow-hidden rounded-2xl border-2 border-black bg-white px-3 py-2 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow" style={{ background: 'var(--header-gradient)' }}>
        <CalendarRange className="h-4 w-4 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold">Roster Dashboard</h3>
        <p className="text-[10px] font-semibold text-muted-foreground">Today's shifts and the week ahead</p>
      </div>
      <span className="shrink-0 rounded-lg bg-violet-100 px-3 py-1 text-[11px] font-bold text-violet-700 transition group-hover:bg-violet-200">
        Open Roster Dashboard
      </span>
    </Link>
  );
}