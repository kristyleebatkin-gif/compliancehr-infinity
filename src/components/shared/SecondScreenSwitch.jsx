import React from 'react';
import { ExternalLink, Monitor } from 'lucide-react';
import { SECOND_SCREEN_VIEWS, openSecondScreen } from '@/lib/secondScreen';

export default function SecondScreenSwitch({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-2xs">
      <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        <Monitor className="h-3.5 w-3.5" /> Second screen
      </span>
      {SECOND_SCREEN_VIEWS.map((view) =>
        view.key === current ? (
          <span
            key={view.key}
            className="rounded-full bg-workspace-navy px-2.5 py-1 text-[11px] font-extrabold text-header-foreground"
          >
            {view.label} · this window
          </span>
        ) : (
          <button
            key={view.key}
            type="button"
            onClick={() => openSecondScreen(view.key)}
            title={`Open ${view.label} in its own window for a second screen`}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-extrabold text-workspace-navy transition hover:bg-muted"
          >
            {view.label}
            <ExternalLink className="h-3 w-3" />
          </button>
        )
      )}
    </div>
  );
}