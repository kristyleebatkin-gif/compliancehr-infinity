import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import '@/components/v8000/v8000Glass.css';
import { loadFabric, loadEntryPointCounts, v8000Position, validationChecks, readinessBand, EVIDENCE_STATE_LABELS } from '@/lib/v8000Fabric';
import ReadinessStrip from '@/components/v8000/ReadinessStrip';
import ValidationPanel from '@/components/v8000/ValidationPanel';
import FabricExplorer from '@/components/v8000/FabricExplorer';
import EntryPointGrid from '@/components/v8000/EntryPointGrid';

const TABS = [
  { key: 'readiness', label: 'Readiness' },
  { key: 'fabric', label: 'Evidence Fabric' },
  { key: 'validation', label: 'Validation' },
  { key: 'entry-points', label: 'Entry points' },
];

const STATE_TONE = { verified: 'verified', expiring: 'expiring', in_review: 'review', unverified: 'muted', rejected: 'risk', expired: 'risk' };

export default function V8000CommandCentre() {
  const [data, setData] = useState(null);
  const [entryPoints, setEntryPoints] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('readiness');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setRefreshing(true);
    try {
      const fabric = await loadFabric();
      setData(fabric);
      setEntryPoints(await loadEntryPointCounts(fabric.tenantId));
    } catch (err) {
      setError(err?.message || 'The evidence fabric could not load.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = useMemo(() => new Date(), [data]);
  const position = useMemo(() => (data ? v8000Position({ ...data, today }) : null), [data, today]);
  const checks = useMemo(() => (data ? validationChecks({ ...data, today }) : []), [data, today]);

  return (
    <div className="v8-shell mx-auto w-full max-w-[1440px] space-y-3">
      <div className="v8-panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="v8-muted font-bold uppercase tracking-wide">V8000 foundation</p>
            <h1 className="text-lg font-extrabold text-white">Evidence Fabric &amp; Readiness</h1>
            <p className="v8-sub mt-1 max-w-3xl">
              Every framework, standard, control, evidence record and finding you hold, traced in one place. Readiness,
              trust, gaps, reviews and evidence states are calculated from those records only: an empty register reads as
              not measured, never as assurance.
            </p>
          </div>
          <button type="button" onClick={load} disabled={refreshing} className="v8-link disabled:opacity-60">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
            Refresh
          </button>
        </div>

        {data && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="v8-chip" data-state="review">{data.standards.length} standards</span>
            <span className="v8-chip" data-state="review">{data.controls.length} controls</span>
            <span className="v8-chip" data-state="review">{data.evidence.length} evidence records</span>
            <span className="v8-chip" data-state="review">{data.findings.length} findings</span>
            <span className="v8-chip" data-state="muted">{data.links.length} recorded links</span>
            {position && <span className="v8-chip" data-state={readinessBand(position.readiness.score).tone === 'risk' ? 'risk' : 'verified'}>{readinessBand(position.readiness.score).label}</span>}
          </div>
        )}
        {data?.truncated && (
          <p className="v8-sub mt-2" role="status">
            At least one register reached the {500}-record read limit. The calculations below describe this loaded subset,
            not the whole register history.
          </p>
        )}
      </div>

      {error ? (
        <div role="alert" className="v8-panel p-4">
          <p className="text-sm font-extrabold text-white">Evidence fabric unavailable</p>
          <p className="v8-sub mt-1">{error}</p>
          <button type="button" onClick={load} className="v8-link mt-2">Retry</button>
        </div>
      ) : !data ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" style={{ color: '#8FD8FF' }} aria-hidden="true" /></div>
      ) : (
        <>
          <div className="v8-tablist" role="tablist" aria-label="V8000 views">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`v8-tab-${item.key}`}
                aria-selected={tab === item.key}
                aria-controls={`v8-panel-${item.key}`}
                className="v8-tab"
                onClick={() => setTab(item.key)}
              >
                {item.label}
                {item.key === 'validation' && checks.length > 0 ? ` (${checks.length})` : ''}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`v8-panel-${tab}`} aria-labelledby={`v8-tab-${tab}`} className="space-y-3">
            {tab === 'readiness' && (
              <>
                <ReadinessStrip position={position} />
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="v8-panel p-3.5">
                    <p className="v8-muted font-bold uppercase tracking-wide">How readiness is calculated</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {position.readiness.parts.map((part) => (
                        <li key={part.key} className="flex items-start justify-between gap-2">
                          <span className="v8-sub">{part.label} <span className="v8-muted">({part.weight}% weight)</span></span>
                          <span className="v8-chip" data-state={Number.isFinite(part.value) ? 'verified' : 'muted'}>
                            {Number.isFinite(part.value) ? `${part.value}%` : 'Not measured'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="v8-muted mt-2">
                      Unmeasured parts are excluded from the score and reported as coverage, so missing records can never
                      raise the result.
                    </p>
                  </div>
                  <div className="v8-panel p-3.5">
                    <p className="v8-muted font-bold uppercase tracking-wide">Evidence state</p>
                    {position.evidenceTotal === 0 ? (
                      <p className="v8-sub mt-1">No evidence records are held, so no evidence state can be reported.</p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {Object.entries(position.states).map(([state, count]) => (
                          <li key={state} className="flex items-center justify-between gap-2">
                            <span className="v8-chip" data-state={STATE_TONE[state]}>{EVIDENCE_STATE_LABELS[state]}</span>
                            <span className="text-xs font-extrabold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {count} of {position.evidenceTotal}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === 'fabric' && (
              <FabricExplorer
                standards={data.standards}
                controls={data.controls}
                evidence={data.evidence}
                findings={data.findings}
                today={today}
              />
            )}

            {tab === 'validation' && <ValidationPanel checks={checks} />}

            {tab === 'entry-points' && <EntryPointGrid entryPoints={entryPoints} loading={refreshing && !entryPoints.length} />}
          </div>
        </>
      )}
    </div>
  );
}