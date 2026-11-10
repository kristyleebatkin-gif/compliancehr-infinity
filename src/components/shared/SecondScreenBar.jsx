import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, LayoutDashboard, X } from 'lucide-react';
import { SECOND_SCREEN_VIEWS } from '@/lib/secondScreen';

export default function SecondScreenBar({ current, onChange }) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        <Monitor className="h-3.5 w-3.5" /> Second screen
      </p>

      <nav className="flex flex-wrap items-center gap-1" aria-label="Second screen module">
        {SECOND_SCREEN_VIEWS.map((view) => {
          const active = view.key === current;
          return (
            <button
              key={view.key}
              type="button"
              onClick={() => onChange(view.key)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-3 py-1 text-[11.5px] font-extrabold transition ${
                active
                  ? 'bg-workspace-navy text-header-foreground'
                  : 'border border-border text-workspace-navy hover:bg-muted'
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-1">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-extrabold text-workspace-navy transition hover:bg-muted"
        >
          <LayoutDashboard className="h-3 w-3" /> Main app
        </Link>
        <button
          type="button"
          onClick={() => window.close()}
          aria-label="Close this window"
          className="inline-flex items-center rounded-full border border-border px-2 py-1 text-workspace-navy transition hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}