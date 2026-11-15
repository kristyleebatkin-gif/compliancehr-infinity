import React from 'react';
import { AlertTriangle, FileCheck2, Gauge, ShieldCheck, Workflow } from 'lucide-react';

const TILES = [
  { key: 'percent', label: 'Enterprise compliance', suffix: '%', icon: Gauge, tone: 'text-brand', hint: 'rating' },
  { key: 'assured', label: 'Checkpoints assured', icon: ShieldCheck, tone: 'text-safe', hint: 'assuredHint' },
  { key: 'evidenceGaps', label: 'Evidence gaps', icon: FileCheck2, tone: 'text-warning', hint: 'gapHint' },
  { key: 'openFindings', label: 'Open findings', icon: AlertTriangle, tone: 'text-danger', hint: 'findingHint' },
  { key: 'openActions', label: 'Corrective actions', icon: Workflow, tone: 'text-accent', hint: 'actionHint' },
];

export default function MatrixCommandStrip({ enterprise, counts }) {
  const values = { ...counts, percent: enterprise.percent };
  const hints = {
    rating: enterprise.rating.label,
    assuredHint: `${counts.exception} exception · ${counts.pending} pending verification`,
    gapHint: `${counts.missing} no evidence · ${counts.unmapped} not mapped`,
    findingHint: `${counts.criticalFindings} on critical checkpoints`,
    actionHint: 'Corrective actions awaiting closure',
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${tile.tone}`} />
            </div>
            <div className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">
              {values[tile.key] ?? 0}{tile.suffix || ''}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">{hints[tile.hint]}</div>
          </div>
        );
      })}
    </div>
  );
}