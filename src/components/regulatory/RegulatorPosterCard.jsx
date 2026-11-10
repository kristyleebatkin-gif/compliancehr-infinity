import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function RegulatorPosterCard({ poster, band, label }) {
  return (
    <article className="flex min-w-[240px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
      <header className="px-3 py-2 text-header-foreground" style={{ background: band }}>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-header-foreground/85">{label}</p>
        {poster.category && (
          <p className="mt-0.5 text-[10px] font-bold text-header-foreground/75">{poster.category}</p>
        )}
      </header>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-extrabold leading-snug text-workspace-navy">{poster.title}</h3>
        {poster.summary && (
          <p className="line-clamp-3 text-xs font-medium leading-relaxed text-muted-foreground">{poster.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {formatDate(poster.published_date) || 'Date not stated'}
          </span>
          <a
            href={poster.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand hover:underline"
          >
            Open update <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}