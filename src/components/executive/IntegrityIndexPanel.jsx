import React, { useState } from 'react';
import { Gauge, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useIntegrityIndex from '@/components/executive/useIntegrityIndex';
import IntegrityDimensionCard from '@/components/executive/IntegrityDimensionCard';
import { integrityDimensions } from '@/lib/integrityIndex';

const BAND_CHIP = {
  exemplary: 'bg-safe text-white',
  assured: 'bg-brand text-white',
  developing: 'bg-warning text-white',
  risk: 'bg-danger text-white',
  unmeasured: 'bg-header-foreground/20 text-header-foreground',
};

export default function IntegrityIndexPanel() {
  const { data, isLoading, isFetching, isError, refetch, dataUpdatedAt } = useIntegrityIndex();
  const [openKey, setOpenKey] = useState(null);
  const band = data?.band || { label: 'Not measured', tone: 'unmeasured' };
  const dimensions = data?.dimensions || [];

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-header-foreground" role="status">Provisional scoring model — requires governance approval and authenticated validation. The overall score is withheld until all ten dimensions have complete reads and countable records.</p>
      <div className="flex flex-col gap-3 rounded-xl border border-header-foreground/20 bg-workspace-navy/70 p-4 text-header-foreground shadow-panel backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Gauge className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-header-foreground">Enterprise Integrity Index</h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-header-foreground">
              Proposed operational indicators across the ten weighted dimensions. Register counts do not establish verified assurance or regulatory compliance.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" disabled={isFetching} onClick={() => refetch()} className="shrink-0">
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : 'Refresh index'}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center rounded-xl border border-header-foreground/20 bg-workspace-navy/80 p-4 text-header-foreground shadow-panel backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wide text-header-foreground">Integrity score</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tabular-nums text-header-foreground" aria-live="polite">
              {isLoading ? '—' : data?.score ?? '—'}
            </span>
            <span className="text-sm font-bold text-header-foreground">/ 100</span>
          </p>
          <span className={`mt-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${BAND_CHIP[band.tone]}`}>{band.label}</span>
          <p className="mt-3 text-xs font-medium leading-relaxed text-header-foreground">
            {isLoading
              ? 'Reading your registers…'
              : data
                ? `${data.coverage} of 100 points of weight measured across ${data.measuredDimensions} of ${data.totalDimensions} dimensions.`
                : 'The index needs an approved business account with access to these registers.'}
          </p>
          {data?.today && <p className="mt-2 text-xs font-medium text-header-foreground">Measured as at {data.today} (Brisbane).</p>}
          {dataUpdatedAt > 0 && <p className="mt-1 text-xs font-medium text-header-foreground">Last refreshed {new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Brisbane', hour: '2-digit', minute: '2-digit' }).format(new Date(dataUpdatedAt))} (Brisbane).</p>}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {(dimensions.length ? dimensions : integrityDimensions('1900-01-01').map((dimension) => ({ ...dimension, good: 0, bad: 0, coverage: 0, score: null, contribution: null }))).map((dimension) => (
            <IntegrityDimensionCard
              key={dimension.key}
              dimension={dimension}
              counts={data?.counts}
              expanded={openKey === dimension.key}
              onToggle={() => setOpenKey(openKey === dimension.key ? null : dimension.key)}
            />
          ))}
        </div>
      </div>

      {isError && <p className="text-sm font-semibold text-danger" role="alert">The index could not be read. Refresh to try again.</p>}
      {data?.unavailableReads > 0 && <p className="text-sm font-semibold text-warning" role="status">{data.unavailableReads} required reads are unavailable or restricted. Affected scores are withheld. Refresh to retry.</p>}

      <p className="text-xs font-medium leading-relaxed text-header-foreground">
        Indicators use register counts available to your account in this business. Missing, denied or failed reads withhold the affected dimension and the overall score. Counts represent measure occurrences and may overlap; active or closed status alone is not independent evidence verification. Open a dimension to inspect the counts.
      </p>
    </div>
  );
}