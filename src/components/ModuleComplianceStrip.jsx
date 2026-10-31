import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

export default function ModuleComplianceStrip({ path: requested }) {
  const path = MODULE_TRACKERS[requested] ? requested : '/compliance';
  const items = MODULE_TRACKERS[path];
  const [counts, setCounts] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!items) return;
    let cancelled = false;
    setCounts(null);
    setLoadError(false);
    loadTrackerCounts(path).then((c) => {
      if (!cancelled && Array.isArray(c)) setCounts(c);
      else if (!cancelled) setLoadError(true);
    }).catch(() => { if (!cancelled) setLoadError(true); });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!items) return null;
  if (loadError) return <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Compliance counts unavailable</span>;
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
        <span>
          {totalOpen} tracked review item{totalOpen === 1 ? '' : 's'} due
        </span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
        Evidence and audit readiness: not assessed here
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