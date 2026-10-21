import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

const PILL = {
  overdue: 'relative flex items-center gap-1.5 rounded-full border border-danger/30 bg-gradient-to-r from-danger/15 via-danger/10 to-transparent px-2.5 py-1 text-[10px] font-bold text-danger shadow-sm transition-transform hover:scale-105',
  soon: 'relative flex items-center gap-1.5 rounded-full border border-warning/40 bg-gradient-to-r from-warning/20 via-warning/10 to-transparent px-2.5 py-1 text-[10px] font-bold text-warning shadow-sm transition-transform hover:scale-105',
  clear: 'flex items-center gap-1.5 rounded-full border border-safe/25 bg-gradient-to-r from-safe/15 via-safe/10 to-transparent px-2.5 py-1 text-[10px] font-semibold text-safe shadow-sm',
};

function LiveDot({ tone }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${tone === 'soon' ? 'bg-warning' : 'bg-danger'}`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${tone === 'soon' ? 'bg-warning' : 'bg-danger'}`} />
    </span>
  );
}

export default function ModuleComplianceStrip({ path: requested }) {
  // Every module shows a live tracker; modules without their own registers use the organisation-wide one.
  const path = MODULE_TRACKERS[requested] ? requested : '/compliance';
  const items = MODULE_TRACKERS[path];
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!items) return;
    let cancelled = false;
    loadTrackerCounts(path).then((c) => { if (!cancelled && c) setCounts(c); });
    return () => { cancelled = true; };
  }, [path]);

  if (!items) return null;
  if (!counts) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold text-foreground/40">
        <ShieldCheck className="h-3 w-3 animate-pulse" />Checking tracker…
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  if (alerts.length === 0) {
    return (
      <span className={PILL.clear}>
        <ShieldCheck className="h-3 w-3" />All in date
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {alerts.map((a) => (
        <span key={a.label} title={a.label} className={PILL[a.mode === 'soon' ? 'soon' : 'overdue']}>
          <LiveDot tone={a.mode === 'soon' ? 'soon' : 'overdue'} />
          {a.mode === 'soon' ? <Clock3 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {a.value} {a.label}
        </span>
      ))}
    </div>
  );
}