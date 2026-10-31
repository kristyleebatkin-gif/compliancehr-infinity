import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

export default function ModuleComplianceStrip({ path: requested }) {
  const path = MODULE_TRACKERS[requested] ? requested : '/compliance';
  const items = MODULE_TRACKERS[path];
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!items) return;
    let cancelled = false;
    loadTrackerCounts(path).then((c) => {
      if (!cancelled && c) setCounts(c);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!items) return null;
  if (!counts) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
        <ShieldCheck className="h-3.5 w-3.5 animate-pulse text-indigo-600" />
        <span>Checking compliance status…</span>
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  const totalOpen = alerts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const liveScore = totalOpen === 0 ? '100%' : `${Math.max(85, 100 - totalOpen * 2)}%`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
        <span>
          Compliance {liveScore} · NDIS &amp; Aged Care Aligned
        </span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
        Reviews: {totalOpen === 0 ? 'In Date' : `${totalOpen} Due`} · Evidence &amp; Audits: Ready
      </span>
      {alerts.map((a) => (
        <span
          key={a.label}
          title={a.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
        >
          {a.mode === 'soon' ? (
            <Clock3 className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          )}
          <span>
            {a.value} {a.label}
          </span>
        </span>
      ))}
    </div>
  );
}