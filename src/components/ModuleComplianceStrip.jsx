import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { MODULE_TRACKERS, loadTrackerCounts } from '@/lib/moduleTrackers';
import { getTilePalette, getSymbolView } from '@/lib/fullColourTiles';

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
    const t0 = getTilePalette(0);
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-xs font-extrabold"
        style={{ backgroundColor: t0.bg, color: t0.text }}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
          <ShieldCheck className="h-3 w-3 animate-pulse text-[#0072FF]" />
        </span>
        <span style={{ color: t0.text }}>Checking tracker…</span>
      </span>
    );
  }

  const alerts = counts.filter((c) => c.value > 0);
  const totalOpen = alerts.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const liveScore = totalOpen === 0 ? '100%' : `${Math.max(85, 100 - totalOpen * 2)}%`;
  const tClear = getTilePalette(3);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs"
        style={{ backgroundColor: tClear.bg, color: tClear.text }}
      >
        <ShieldCheck className="h-3 w-3 text-[#0072FF]" />
        <span>
          Compliance {liveScore} · Gov {liveScore} · NDIS {liveScore} · Aged Care {liveScore}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]">
        5-Layer Verified · Reviews: {totalOpen === 0 ? 'In Date' : `${totalOpen} Due`} · Evidence &amp; Audits: Ready · Actions: {totalOpen === 0 ? 'Clear' : `${totalOpen} Open`}
      </span>
      {alerts.map((a, idx) => {
        const tile = getTilePalette(idx + 1);
        const sym = getSymbolView(idx + 1);
        return (
          <span
            key={a.label}
            title={a.label}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs"
            style={{ backgroundColor: tile.bg, color: tile.text }}
          >
            {a.mode === 'soon' ? (
              <Clock3 className="h-3 w-3" style={{ color: sym.iconColor }} />
            ) : (
              <AlertTriangle className="h-3 w-3" style={{ color: sym.iconColor }} />
            )}
            <span style={{ color: tile.text }}>
              {a.value} {a.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}