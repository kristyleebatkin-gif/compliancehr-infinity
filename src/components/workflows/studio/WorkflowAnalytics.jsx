import React from 'react';
import { bottlenecks, summariseInstances, typeBreakdown } from '@/lib/workflowStudio';

export default function WorkflowAnalytics({ instances = [] }) {
  const summary = summariseInstances(instances);
  const types = typeBreakdown(instances);
  const stuck = bottlenecks(instances);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Completion rate', value: `${summary.completionRate}%`, hint: `${summary.completed} of ${summary.total} runs closed` },
          { label: 'SLA compliance', value: `${summary.slaCompliance}%`, hint: `${summary.breaches} breach(es) recorded` },
          { label: 'Average duration', value: `${summary.averageHours}h`, hint: 'From start to completion' },
          { label: 'Open work', value: summary.open, hint: `${summary.waitingApproval} awaiting approval` },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">{tile.value}</p>
            <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{tile.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold text-foreground">By workflow type</h2>
            <p className="text-xs text-muted-foreground">Volume, completion and breaches for each process family.</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Runs</th>
                <th className="px-3 py-2">Open</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Breached</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {types.map((row) => (
                <tr key={row.type}>
                  <td className="px-3 py-2 text-sm font-semibold text-foreground">{row.type}</td>
                  <td className="px-3 py-2 text-sm text-foreground">{row.total}</td>
                  <td className="px-3 py-2 text-sm text-foreground">{row.open}</td>
                  <td className="px-3 py-2 text-sm text-foreground">{row.completed}</td>
                  <td className="px-3 py-2 text-sm font-semibold text-danger">{row.breaches}</td>
                </tr>
              ))}
              {!types.length && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">No runs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold text-foreground">Bottlenecks</h2>
            <p className="text-xs text-muted-foreground">Where open runs are currently waiting — the steps to unblock first.</p>
          </div>
          <ul className="divide-y divide-border">
            {stuck.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-sm font-semibold text-foreground">{row.label}</span>
                <span className="rounded-full border border-warning/50 bg-warning/20 px-2 py-0.5 text-[11px] font-bold text-warning">
                  {row.count} waiting
                </span>
              </li>
            ))}
            {!stuck.length && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing is waiting right now.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}