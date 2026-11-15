import React from 'react';
import { cn } from '@/lib/utils';

export default function DomainMatrixGrid({ domains = [], activeDomain = 'All', onSelect }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-extrabold text-foreground">Domain scorecard</h2>
        <p className="text-xs text-muted-foreground">
          Draft catalogue domains. Compliance remains unavailable until applicability and checkpoint results are reviewed.
        </p>
      </div>
      <div className="divide-y divide-border">
        {domains.map((domain) => (
          <button
            key={domain.domain}
            type="button"
            onClick={() => onSelect?.(activeDomain === domain.domain ? 'All' : domain.domain)}
            className={cn(
              'flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/60',
              activeDomain === domain.domain && 'bg-muted/70'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-foreground">{domain.domain}</span>
              <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', domain.rating.tone)}>
                {domain.percent == null ? domain.rating.label : `${domain.percent}% · ${domain.rating.label}`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full',
                  domain.percent >= 90 ? 'bg-safe' : domain.percent >= 70 ? 'bg-warning' : 'bg-danger'
                )}
                style={{ width: `${Math.min(domain.percent ?? 0, 100)}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-muted-foreground">
              <span>{domain.first} – {domain.last}</span>
              <span>{domain.count} checkpoints</span>
              <span>{domain.assured} assured</span>
              <span>Assessment not connected</span>

            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
