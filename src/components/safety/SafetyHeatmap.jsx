import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin } from 'lucide-react';

// Shift time buckets (24h), parsed from the incident's time_occurred
const TIME_BUCKETS = [
  { label: 'Morning\n6-12', from: 6, to: 12 },
  { label: 'Afternoon\n12-18', from: 12, to: 18 },
  { label: 'Evening\n18-22', from: 18, to: 22 },
  { label: 'Night\n22-6', from: 22, to: 6 },
];

const parseHour = (t) => {
  if (!t) return null;
  const m = String(t).match(/^(\d{1,2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  return h >= 0 && h <= 23 ? h : null;
};

const bucketIndex = (hour) => {
  if (hour === null || hour === undefined) return -1;
  const idx = TIME_BUCKETS.findIndex((b) => (b.from < b.to ? hour >= b.from && hour < b.to : hour >= b.from || hour < b.to));
  return idx;
};

// Heat colour scale (white -> warm red), based on count relative to max
const heatColor = (count, max) => {
  if (!count) return 'rgba(148, 163, 184, 0.08)';
  const t = Math.min(1, 0.15 + 0.85 * (count / max));
  return `rgba(220, 38, 38, ${t.toFixed(2)})`;
};

export default function SafetyHeatmap() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Incident.filter({}, { sort: '-date_occurred', limit: 500 });
      setIncidents(page.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => (
    base44.entities.Incident.subscribe(() => load())
  ), [load]);

  // Build the area x time bucket matrix
  const areasMap = new Map(); // area -> { total, buckets: number[] }
  incidents.forEach((inc) => {
    const area = (inc.location || '').trim() || 'Unspecified';
    if (!areasMap.has(area)) areasMap.set(area, { total: 0, buckets: Array(TIME_BUCKETS.length).fill(0) });
    const entry = areasMap.get(area);
    entry.total += 1;
    const bi = bucketIndex(parseHour(inc.time_occurred));
    if (bi >= 0) entry.buckets[bi] += 1;
  });
  const areas = Array.from(areasMap.entries()).sort((a, b) => b[1].total - a[1].total);
  const maxCell = Math.max(1, ...areas.flatMap(([, v]) => v.buckets));

  const hottest = areas.reduce((best, [area, v]) => {
    const hi = Math.max(...v.buckets);
    return hi > (best?.count || 0) ? { area, count: hi } : best;
  }, null);

  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Incident heatmap — area by shift time</h4>
        {hottest && hottest.count > 0 && (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-300">
            Hotspot: {hottest.area} ({TIME_BUCKETS.findIndex((b, i) => areas.find(([a]) => a === hottest.area)?.buckets[i] === hottest.count) >= 0 ? TIME_BUCKETS[TIME_BUCKETS.findIndex((b, i) => areas.find(([a]) => a === hottest.area)?.buckets[i] === hottest.count)].label.replace('\n', ' ') : ''})
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-foreground" />
        </div>
      ) : areas.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No incidents recorded yet — the heatmap appears once incidents have a location and time.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="w-40 px-2 text-left font-semibold text-foreground/60">Facility / location</th>
                  {TIME_BUCKETS.map((b) => (
                    <th key={b.label} className="px-1 py-1 text-center font-semibold text-foreground/60 whitespace-pre-line">{b.label}</th>
                  ))}
                  <th className="px-2 text-center font-semibold text-foreground/60">Total</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(([area, v]) => (
                  <tr key={area}>
                    <td className="max-w-[160px] truncate px-2 py-1 font-medium" title={area}>{area}</td>
                    {v.buckets.map((count, i) => (
                      <td key={i} className="p-0">
                        <div
                          className="flex h-8 items-center justify-center rounded-md text-[11px] font-semibold"
                          style={{ backgroundColor: heatColor(count, maxCell), color: count / maxCell > 0.55 ? '#ffffff' : '#0f172a' }}
                          title={`${area}: ${count} incident${count === 1 ? '' : 's'}`}
                        >
                          {count || ''}
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-bold">{v.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Fewer</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.75, 1].map((t) => (
                <div key={t} className="h-3 w-6 rounded-sm" style={{ backgroundColor: heatColor(t * maxCell, maxCell) }} />
              ))}
            </div>
            <span>More incidents</span>
          </div>
        </>
      )}
    </div>
  );
}