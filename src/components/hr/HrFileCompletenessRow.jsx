import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function HrFileCompletenessRow({ row }) {
  const tone = row.pct >= 80 ? 'text-safe bg-safe/10' : row.pct >= 50 ? 'text-warning bg-warning/10' : 'text-danger bg-danger/10';
  const bar = row.pct >= 80 ? 'bg-safe' : row.pct >= 50 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="space-y-2 border-b border-border pb-4 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/staff/${row.id}`} className="break-words text-sm font-semibold text-primary hover:underline">{row.name}</Link>
          {row.status !== 'Active' && <Badge variant="outline" className="ml-2">{row.status}</Badge>}
        </div>
        <div className="flex items-center gap-2 text-xs"><span className="text-muted-foreground">{row.onFile}/{row.total} on file</span><span className={`rounded-md px-2 py-1 font-semibold ${tone}`}>{row.pct}%</span></div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${row.name} file completeness`} aria-valuenow={row.pct} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${bar}`} style={{ width: `${row.pct}%` }} /></div>
      {row.missingCount > 0 && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">{row.missingCount} missing documents</summary><ul className="mt-2 list-disc space-y-1 pl-5">{row.missing.map((type) => <li key={type}>{type}</li>)}</ul></details>}
    </div>
  );
}