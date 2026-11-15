import React from 'react';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Layers } from 'lucide-react';

function CoverageBar({ value }) {
  const tone = value >= 80 ? 'bg-safe' : value >= 50 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="text-[11px] font-bold text-foreground">{value}%</span>
    </div>
  );
}

export default function ControlCoveragePanel({ rows, onOpenStandard }) {
  if (!rows.length) {
    return (
      <EmptyState
        icon={Layers}
        title="No standards registered yet"
        message="Add a regulatory standard first, then link controls and evidence to it. Coverage is calculated from verified evidence only."
        modulePath="Compliance"
        createLabel="Open Compliance Centre"
        createHref="/compliance"
      />
    );
  }

  const sorted = [...rows].sort((a, b) => a.coverage - b.coverage);
  const weakest = sorted[0];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-warning">Weakest standard</div>
        <div className="mt-0.5 text-sm font-extrabold text-foreground">
          {weakest.standard_code} — {weakest.standard_title}
        </div>
        <div className="mt-0.5 text-xs font-semibold text-foreground/80">
          {weakest.covered} of {weakest.controls} controls hold verified evidence
          {weakest.openFindings ? ` · ${weakest.openFindings} open finding(s)` : ''}
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left">Standard</th>
              <th className="text-left">Framework</th>
              <th className="text-left">Controls</th>
              <th className="text-left">Evidenced</th>
              <th className="text-left">Open findings</th>
              <th className="text-left">Coverage</th>
              <th className="text-right">Chain</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-border/60 last:border-0">
                <td className="align-top">
                  <div className="text-xs font-extrabold text-foreground">{row.standard_code}</div>
                  <div className="max-w-[300px] text-[11px] font-medium leading-snug text-muted-foreground">{row.standard_title}</div>
                </td>
                <td className="align-top text-xs font-semibold text-foreground">{row.framework || '—'}</td>
                <td className="align-top text-xs font-bold text-foreground">{row.controls}</td>
                <td className="align-top text-xs font-bold text-foreground">{row.covered}</td>
                <td className="align-top">
                  <span className={`text-xs font-bold ${row.openFindings ? 'text-danger' : 'text-safe'}`}>{row.openFindings}</span>
                </td>
                <td className="align-top">
                  <CoverageBar value={row.coverage} />
                </td>
                <td className="align-top text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenStandard(row)}
                    disabled={row.controls === 0}
                    title={row.controls === 0 ? 'Add a control against this standard first' : 'Trace standard to evidence'}
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Trace
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}