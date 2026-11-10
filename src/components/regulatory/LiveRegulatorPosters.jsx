import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Megaphone, RefreshCw } from 'lucide-react';
import RegulatorPosterCard from '@/components/regulatory/RegulatorPosterCard';
import { fetchRegulatorPosters, readPosterCache } from '@/lib/regulatorNews';

const REGULATORS = [
  { key: 'ndis-commission', label: 'NDIS Commission', band: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)' },
  { key: 'aged-care-commission', label: 'Aged Care Commission', band: 'linear-gradient(135deg, #5A00D6 0%, #0A2B6D 100%)' },
  { key: 'fair-work', label: 'Fair Work Ombudsman', band: 'linear-gradient(135deg, #0E9F6E 0%, #0A2B6D 100%)' },
  { key: 'worksafe-qld', label: 'WorkSafe QLD', band: 'linear-gradient(135deg, #FF2E9A 0%, #5A00D6 100%)' },
];

const styleFor = (key) => REGULATORS.find((regulator) => regulator.key === key) || REGULATORS[0];

export default function LiveRegulatorPosters() {
  const cached = readPosterCache();
  const [posters, setPosters] = useState(cached?.posters || []);
  const [loading, setLoading] = useState(!cached?.posters?.length);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchRegulatorPosters();
      setPosters(payload.posters);
    } catch (err) {
      setError(err?.message || 'The regulator updates could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!posters.length) load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="space-y-2" aria-label="Live regulator posters">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-workspace-navy">
          <Megaphone className="h-3.5 w-3.5" /> Live regulator posters
        </h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-extrabold text-workspace-navy disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {loading ? 'Checking regulators…' : 'Refresh posters'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs font-semibold text-destructive">
          {error} Nothing is being shown rather than stale regulator content. <button type="button" className="underline" onClick={load}>Retry</button>
        </p>
      )}

      {loading && !posters.length ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => <div key={key} className="h-36 animate-pulse rounded-2xl border border-border bg-muted" />)}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {posters.map((poster, index) => {
            const style = styleFor(poster.regulator);
            return (
              <RegulatorPosterCard
                key={`${poster.regulator}-${poster.url}-${index}`}
                poster={poster}
                band={style.band}
                label={style.label}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}