import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, trackerQuery } from '@/lib/moduleTrackers';

// 5-minute cache so navigating between tabs does not re-run every count.
const cache = new Map(); // path -> { at, counts }
const TTL = 5 * 60 * 1000;

export default function ModuleComplianceStrip({ path }) {
  const items = MODULE_TRACKERS[path];
  const [counts, setCounts] = useState(() => (cache.get(path)?.counts || null));

  useEffect(() => {
    if (!items || counts) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        items.map((item) => base44.entities[item.entity].count(trackerQuery(item, item.dynamic))),
      );
      if (cancelled) return;
      const next = items.map((item, i) => ({
        label: item.label,
        value: results[i].status === 'fulfilled' ? results[i].value : 0,
      }));
      cache.set(path, { at: Date.now(), counts: next });
      setCounts(next);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (!items) return null;
  if (!counts) {
    return <span className="hidden rounded-md border border-border/60 bg-white px-2 py-1 text-[10px] font-semibold text-foreground/40 lg:block">Checking tracker…</span>;
  }

  const alerts = counts.filter((c) => c.value > 0);
  if (alerts.length === 0) {
    return (
      <span className="hidden items-center gap-1 rounded-md border border-safe/25 bg-safe/10 px-2 py-1 text-[10px] font-semibold text-safe sm:flex">
        <ShieldCheck className="h-3 w-3" />All in date
      </span>
    );
  }
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {alerts.map((a) => (
        <span key={a.label} title={a.label} className="flex items-center gap-1 rounded-md border border-danger/25 bg-danger/10 px-2 py-1 text-[10px] font-bold text-danger">
          {a.label.includes('expiring') || a.label.includes('within') ? <Clock3 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {a.value} {a.label}
        </span>
      ))}
    </div>
  );
}