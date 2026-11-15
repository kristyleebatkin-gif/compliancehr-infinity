import React from 'react';
import { FileCheck2, FileWarning, Gavel, ShieldAlert, Sparkles, Wrench } from 'lucide-react';

const tilesFor = (metrics) => [
  { key: 'verifiedEvidence', label: 'Verified evidence', icon: FileCheck2, hint: `${metrics.evidence || 0} evidence records in scope` },
  { key: 'expiredEvidence', label: 'Evidence expired', icon: FileWarning, hint: 'Needs recollection before an audit' },
  { key: 'openFindings', label: 'Open findings', icon: ShieldAlert, hint: 'Findings not yet closed' },
  { key: 'openActions', label: 'Open corrective actions', icon: Wrench, hint: 'CAPA work still in progress' },
  { key: 'awaitingAi', label: 'AI drafts to review', icon: Sparkles, hint: 'Recommendations awaiting a human decision' },
  { key: 'approvedResolutions', label: 'Resolutions approved', icon: Gavel, hint: 'Board resolutions recorded as approved' },
];

export default function BoardKpiStrip({ metrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tilesFor(metrics).map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</span>
              <Icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <div className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">{metrics[tile.key] ?? 0}</div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">{tile.hint}</div>
          </div>
        );
      })}
    </div>
  );
}