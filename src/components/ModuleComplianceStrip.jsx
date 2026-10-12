import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, trackerQuery } from '@/lib/moduleTrackers';

// 5-minute cache so navigating between tabs does not re-run every count.
const cache = new Map(); // path -> { at, counts }
const TTL = 5 * 60 * 1000;

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

export default function ModuleComplianceStrip({ path }) {
  const items = MODULE_TRACKERS[path];
  const [counts, setCounts] = useState(() => (cache.get(path)?.counts || null));

  useEffect(() => {
    const cached = cache.get(path);
    if (!items || (cached && Date.now() - cached.at < TTL)) {
      if (cached?.counts) setCounts(cached.counts);
      return;
    }
    if (counts) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        items.map((item) => base44.entities[item.entity].count(trackerQuery(item, item.dynamic))),
      );
      if (cancelled) return;
      const next = items.map((item, i) => ({
        label: item.label,
        value: results[i].status === 'fulfilled' ? results[i].value : 0,
        mode: item.dynamic,
      }));
      cache.set(path, { at: Date.now(), counts: next });
      setCounts(next);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (!items) return null;
  if (!counts) {
    return (
      <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[10px] font-semibold text-foreground/40 lg:flex">
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
    <div className="hidden items-center gap-1.5 sm:flex">
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