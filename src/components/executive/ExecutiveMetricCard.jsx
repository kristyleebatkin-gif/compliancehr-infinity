import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ExecutiveMetricCard({ title, description, value, loading, path }) {
  return (
    <article className="executive-metric-card flex min-w-0 flex-col justify-between rounded-xl border border-header-foreground/20 bg-workspace-navy/80 p-4 text-header-foreground shadow-panel backdrop-blur-md">
      <div>
        <h3 className="text-sm font-bold text-header-foreground">{title}</h3>
        <p className="mt-2 text-2xl font-extrabold tabular-nums text-header-foreground" aria-live="polite">
          {loading ? 'Loading…' : value === null ? 'Unavailable' : value}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-header-foreground">{description}</p>
      </div>
      <Link to={path} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-header-foreground underline-offset-4 hover:underline">
        Open register <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}