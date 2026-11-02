import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  color: '#0A2B6D',
};

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
    loadTrackerCounts(path)
      .then((c) => {
        if (!cancelled && Array.isArray(c)) setCounts(c);
        else if (!cancelled) setLoadError(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!items) return null;
  if (loadError) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={GRADIENT_BORDER_STYLE}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: '#FF2E9A' }} />
        <span style={{ color: '#0A2B6D' }}>Compliance counts unavailable</span>
      </span>
    );
  }
  if (!counts) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={GRADIENT_BORDER_STYLE}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 animate-pulse" style={{ color: '#0072FF' }} />
        <span style={{ color: '#0A2B6D' }}>Checking tracker…</span>
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  const totalOpen = alerts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={GRADIENT_BORDER_STYLE}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: '#0072FF' }} />
        <span style={{ color: '#0A2B6D' }}>
          {totalOpen} tracked review item{totalOpen === 1 ? '' : 's'} due
        </span>
      </span>

      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={GRADIENT_BORDER_STYLE}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#5A00D6' }} />
        <span style={{ color: '#0A2B6D' }}>
          Evidence and audit readiness: not assessed here
        </span>
      </span>

      {alerts.map((a, idx) => {
        const symCol = APP_COLOURS[(idx + 2) % APP_COLOURS.length];
        return (
          <span
            key={a.label}
            title={a.label}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
            style={GRADIENT_BORDER_STYLE}
          >
            {a.mode === 'soon' ? (
              <Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: symCol }} />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: symCol }} />
            )}
            <span style={{ color: '#0A2B6D' }}>
              {a.value} {a.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}