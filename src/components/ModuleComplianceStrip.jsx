import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

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
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
          style={{ background: ICON_GRADIENT }}
        >
          <ShieldCheck className="h-3 w-3 animate-pulse text-white" />
        </span>
        <span>Checking tracker…</span>
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  if (alerts.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold text-white shadow-2xs"
        style={{ background: BADGE_GRADIENT }}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
          <ShieldCheck className="h-3 w-3 text-[#0072FF]" />
        </span>
        <span>All in date</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {alerts.map((a) => (
        <span
          key={a.label}
          title={a.label}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs"
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
            style={{ background: ICON_GRADIENT }}
          >
            {a.mode === 'soon' ? (
              <Clock3 className="h-3 w-3 text-white" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-white" />
            )}
          </span>
          <span>
            {a.value} {a.label}
          </span>
        </span>
      ))}
    </div>
  );
}