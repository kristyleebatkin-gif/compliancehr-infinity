import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

// Goal data charted to NDIS funding outcomes: each goal's category maps to the
// plan funding area it draws from, with progress and achievement per area.
const FUNDING_AREAS = [
  { key: 'Core – Daily Living', match: ['daily', 'personal', 'domestic', 'household', 'life skill', 'independence'], tone: 'bg-brand' },
  { key: 'Core – Social & Community', match: ['social', 'community', 'access', 'recreation', 'participation', 'peer'], tone: 'bg-teal-600' },
  { key: 'Capacity Building', match: ['capacity', 'skill', 'employ', 'education', 'training', 'therapy', 'coordination', 'communication'], tone: 'bg-violet-600' },
  { key: 'Capital', match: ['equipment', 'assistive', 'technology', 'mobility', 'modification', 'vehicle'], tone: 'bg-amber-600' },
];

function areaFor(category) {
  const c = (category || '').toLowerCase();
  const hit = FUNDING_AREAS.find((a) => a.match.some((m) => c.includes(m)));
  return hit ? hit.key : 'Other / uncategorised';
}

export default function FundingOutcomeChart({ goals = [] }) {
  const areas = useMemo(() => {
    const map = new Map();
    goals.forEach((g) => {
      const key = areaFor(g.category);
      if (!map.has(key)) map.set(key, { count: 0, progress: 0, achieved: 0 });
      const row = map.get(key);
      row.count += 1;
      row.progress += Number(g.progress) || 0;
      if (g.status === 'Achieved' || (Number(g.progress) || 0) >= 100) row.achieved += 1;
    });
    return FUNDING_AREAS.concat([{ key: 'Other / uncategorised', tone: 'bg-foreground/30' }])
      .filter((a) => map.has(a.key))
      .map((a) => {
        const row = map.get(a.key);
        return { ...a, ...row, avg: Math.round(row.progress / row.count) };
      });
  }, [goals]);

  return (
    <Card className="shadow-panel">
      <CardContent className="p-4">
        <p className="flex items-center gap-2 font-editorial text-lg font-semibold text-foreground">
          <Target className="h-4 w-4 text-brand" /> Funding outcomes
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Goals grouped by the NDIS funding area their category draws from — average progress and achieved goals per area.</p>
        {areas.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No goals yet to chart to funding outcomes.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {areas.map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{a.key}</span>
                  <span className="tabular-nums text-xs text-muted-foreground">{a.achieved} of {a.count} achieved · avg {a.avg}%</span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${a.tone} transition-all`} style={{ width: `${Math.min(a.avg, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}