import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

export default function RegisterInsights({ module, compact = true, wrapSummary = true, recordsClassName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('registerInsights', { module });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div
        className="rounded-3xl p-[10px] shadow-md"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex items-center gap-2 rounded-[14px] bg-white px-4 py-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-[#5A00D6]" />
          <span className="text-xs font-extrabold text-[#0A2B6D]">Reading the register…</span>
        </div>
      </div>
    );
  }
  if (!data || !data.insights) return null;

  const { insights } = data;

  return (
    <div
      className="rounded-3xl p-[10px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div
        className={`flex items-center gap-2.5 rounded-[14px] bg-white ${
          compact ? 'px-3.5 py-2' : 'flex-wrap px-4 py-2.5'
        } ${wrapSummary ? 'flex-wrap' : ''}`}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-2xs"
          style={{ background: ICON_GRADIENT }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </span>
        <p
          className={`min-w-0 font-extrabold text-[#0A2B6D] ${
            wrapSummary ? 'flex-[1_1_16rem] whitespace-normal break-words leading-snug' : 'flex-1 truncate'
          } text-xs`}
          title={insights.summary}
        >
          {insights.summary}
        </p>
        <span className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold tabular-nums text-[#5A00D6]">
          <span className={`rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[#0A2B6D] ${recordsClassName || ''}`}>
            {data.total} records
          </span>
          <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[#0072FF]">
            {data.open} open
          </span>
          {data.overdue > 0 && (
            <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[#A100FF]">
              {data.overdue} overdue
            </span>
          )}
          {data.expiring > 0 && (
            <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[#FF2E9A]">
              {data.expiring} due 30d
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={load}
          title="Refresh insight"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}