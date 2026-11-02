import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={{ border: '2px solid #FF2E9A', color: '#0A2B6D' }}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: '#FF2E9A' }} />
        <span style={{ color: '#0A2B6D' }}>Compliance counts unavailable</span>
      </span>
    );
  }
  if (!counts) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={{ border: '2px solid #0072FF', color: '#0A2B6D' }}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 animate-pulse" style={{ color: '#0072FF' }} />
        <span style={{ color: '#0A2B6D' }}>Checking tracker…</span>
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  const totalOpen = alerts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Small Header Tile 1: App Design Coloured Border + White Background + Dark Blue Writing + App Design Coloured Symbol */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={{ border: '2px solid #0072FF', color: '#0A2B6D' }}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: '#0072FF' }} />
        <span style={{ color: '#0A2B6D' }}>
          {totalOpen} tracked review item{totalOpen === 1 ? '' : 's'} due
        </span>
      </span>

      {/* Small Header Tile 2: App Design Coloured Border + White Background + Dark Blue Writing + App Design Coloured Symbol */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
        style={{ border: '2px solid #5A00D6', color: '#0A2B6D' }}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#5A00D6' }} />
        <span style={{ color: '#0A2B6D' }}>
          Evidence and audit readiness: not assessed here
        </span>
      </span>

      {/* Individual Tracker Alert Small Tiles */}
      {alerts.map((a, idx) => {
        const borderCol = APP_COLOURS[(idx + 2) % APP_COLOURS.length];
        return (
          <span
            key={a.label}
            title={a.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs"
            style={{ border: `2px solid ${borderCol}`, color: '#0A2B6D' }}
          >
            {a.mode === 'soon' ? (
              <Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: borderCol }} />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: borderCol }} />
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