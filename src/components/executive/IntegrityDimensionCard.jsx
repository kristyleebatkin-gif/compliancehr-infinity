import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { integrityBand } from '@/lib/integrityIndex';

const TONE_BAR = {
  exemplary: 'bg-safe',
  assured: 'bg-brand',
  developing: 'bg-warning',
  risk: 'bg-danger',
  unmeasured: 'bg-header-foreground/30',
};

export default function IntegrityDimensionCard({ dimension, counts, expanded, onToggle }) {
  const label = dimension.score === null ? 'Not measured' : `${dimension.score}%`;
  const tone = dimension.score === null ? 'unmeasured' : integrityBand(dimension.score).tone;
  return (
    <article className="rounded-xl border border-header-foreground/20 bg-workspace-navy/70 p-3 text-header-foreground shadow-panel backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-header-foreground">{dimension.label}</span>
          <span className="mt-0.5 block text-xs font-semibold text-header-foreground">Weight {dimension.weight}%{dimension.contribution !== null ? ` · adds ${dimension.contribution} points` : ''}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-extrabold tabular-nums text-header-foreground">{label}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-header-foreground/15" role="img" aria-label={`${dimension.label} score ${label}`}>
        <div className={`h-full rounded-full ${TONE_BAR[tone]}`} style={{ width: `${dimension.score ?? 0}%` }} />
      </div>

      {expanded && (
        <dl className="mt-3 space-y-1.5 border-t border-header-foreground/20 pt-2">
          {dimension.measures.map((measure) => {
            const value = counts?.[measure.key];
            const available = Number.isSafeInteger(value) && value >= 0;
            return (
              <div key={measure.key} className="flex items-start justify-between gap-3 text-xs">
                <dt className="min-w-0 font-medium leading-snug text-header-foreground">{measure.label}</dt>
                <dd className={`shrink-0 font-bold tabular-nums ${measure.side === 'bad' && available && value > 0 ? 'text-warning' : 'text-header-foreground'}`}>
                  {available ? value : 'Not available'}
                </dd>
              </div>
            );
          })}
          <p className="pt-1 text-[11px] font-medium leading-snug text-header-foreground">
            Good evidence {dimension.good} · open or failing evidence {dimension.bad}. {dimension.score === null ? 'No countable records yet, so this dimension is excluded from the index.' : `Scored ${dimension.score}% across ${dimension.coverage}% of this dimension's measures.`}
          </p>
        </dl>
      )}
    </article>
  );
}