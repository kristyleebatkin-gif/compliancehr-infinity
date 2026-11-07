import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ExecutiveMetricCard({ title, description, value, loading, path }) {
  return (
    <article className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-panel">
      <div>
        <h3 className="text-sm font-bold text-card-foreground">{title}</h3>
        <p className="mt-2 text-2xl font-extrabold tabular-nums text-card-foreground" aria-live="polite">
          {loading ? 'Loading…' : value === null ? 'Unavailable' : value}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Link to={path} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
        Open register <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}