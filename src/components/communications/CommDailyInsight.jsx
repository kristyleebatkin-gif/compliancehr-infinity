import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function CommDailyInsight() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      const cacheKey = `comm-insight-${new Date().toISOString().slice(0, 10)}`;
      if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setInsight(cached);
          setLoading(false);
          return;
        }
      }
      const res = await base44.functions.invoke('commDailyInsight', {});
      const text = res.data?.insight || '';
      if (text) {
        localStorage.setItem(cacheKey, text);
        setInsight(text);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2 px-2.5 py-1" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
          <Sparkles className="h-3 w-3 text-white" />
        </span>
        <div className="flex flex-1 flex-wrap items-baseline gap-2">
          <h3 className="text-xs font-bold">Daily AI Insight</h3>
          <p className="text-[9px] font-semibold text-white/85">A fresh focus for the team today</p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          className="rounded-md bg-white/15 p-1 ring-1 ring-white/30 transition hover:bg-white/25 disabled:opacity-50"
          title="Refresh insight"
        >
          <RefreshCw className={`h-3 w-3 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="px-2.5 py-1.5">
        {loading ? (
          <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-semibold text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Thinking about your day…
          </div>
        ) : error ? (
          <p className="py-1 text-center text-[10px] text-muted-foreground">Insight unavailable right now — tap refresh to try again.</p>
        ) : (
          <p className="line-clamp-2 text-[11px] font-medium leading-snug">{insight}</p>
        )}
      </div>
    </section>
  );
}