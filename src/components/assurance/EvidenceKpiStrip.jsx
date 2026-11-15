import React from 'react';
import { Layers, ShieldCheck, FileCheck2, Clock3, AlertTriangle } from 'lucide-react';

const TILES = [
  { key: 'controlsTotal', label: 'Controls in scope', hintKey: 'controlsHint', icon: Layers, tone: 'text-brand' },
  { key: 'coveragePercent', label: 'Evidence coverage', suffix: '%', hintKey: 'coverageHint', icon: ShieldCheck, tone: 'text-safe' },
  { key: 'verified', label: 'Verified evidence', hintKey: 'verifiedHint', icon: FileCheck2, tone: 'text-brand' },
  { key: 'expiring', label: 'Expiring / expired', hintKey: 'expiryHint', icon: Clock3, tone: 'text-warning' },
  { key: 'openFindings', label: 'Open findings', hintKey: 'findingsHint', icon: AlertTriangle, tone: 'text-danger' },
];

export default function EvidenceKpiStrip({ summary }) {
  const hints = {
    controlsHint: `${summary.controlsCovered} covered by verified evidence · ${summary.controlsMissing} without`,
    coverageHint: summary.coveragePercent >= 80 ? 'Audit ready' : 'Needs evidence before audit',
    verifiedHint: `${summary.inReview} in review · ${summary.unverified} unverified`,
    expiryHint: `${summary.expired} already expired · review within 30 days`,
    findingsHint: 'Awaiting CAPA closure and verification',
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
              {summary[tile.key]}
              {tile.suffix || ''}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">{hints[tile.hintKey]}</div>
          </div>
        );
      })}
    </div>
  );
}