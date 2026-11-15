import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ListChecks, ShieldAlert } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { GAP_SEVERITIES, GAP_SEVERITY_ORDER, summariseGaps } from '@/lib/assuranceGaps';

export default function GapEnginePanel({ gaps, existingTitles, onCreateActions, creating }) {
  const counts = useMemo(() => summariseGaps(gaps), [gaps]);

  const openGaps = useMemo(() => gaps.filter((gap) => !existingTitles.has(gap.action)), [gaps, existingTitles]);
  const [selected, setSelected] = useState(() => new Set(openGaps.map((gap) => gap.id)));

  useEffect(() => {
    setSelected(new Set(openGaps.map((gap) => gap.id)));
  }, [openGaps]);

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectBySeverities = (severities) => {
    setSelected(new Set(openGaps.filter((gap) => severities.includes(gap.severity)).map((gap) => gap.id)));
  };

  const chosen = openGaps.filter((gap) => selected.has(gap.id));

  if (!gaps.length) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No assurance gaps detected"
        message="Every registered control holds verified, in-date evidence, no corrective actions are overdue and every standard is mapped. This is what audit-ready looks like."
        modulePath="Compliance"
        createLabel="Open the evidence register"
        createHref="/evidence"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {GAP_SEVERITY_ORDER.map((severity) => (
          <span
            key={severity}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${GAP_SEVERITIES[severity].chip}`}
          >
            {GAP_SEVERITIES[severity].label}: {counts[severity]}
          </span>
        ))}
        <span className="text-[11px] font-semibold text-muted-foreground">
          {openGaps.length === 0 ? 'Every gap already has a remediation action' : `${openGaps.length} without an action`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => selectBySeverities(['critical', 'high'])}>
          <ShieldAlert className="h-4 w-4" /> Select critical &amp; high
        </Button>
        <Button size="sm" variant="ghost" onClick={() => selectBySeverities(GAP_SEVERITY_ORDER)}>
          <ListChecks className="h-4 w-4" /> Select all
        </Button>
        <Button size="sm" onClick={() => onCreateActions(chosen)} disabled={creating || chosen.length === 0}>
          {creating ? 'Creating…' : `Create ${chosen.length} remediation action${chosen.length === 1 ? '' : 's'}`}
        </Button>
        <span className="text-[11px] font-semibold text-muted-foreground">
          Actions land in Tasks with the control linked back.
        </span>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="text-left">Gap</th>
              <th className="text-left">Severity</th>
              <th className="text-left">Rule</th>
              <th className="text-left">Standard</th>
              <th className="text-left">Due</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap) => {
              const raised = existingTitles.has(gap.action);
              const tone = GAP_SEVERITIES[gap.severity];
              return (
                <tr key={gap.id} className="border-b border-border/60 last:border-0">
                  <td className="align-top">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!raised && selected.has(gap.id)}
                      disabled={raised}
                      onChange={() => toggle(gap.id)}
                      aria-label={`Select ${gap.action}`}
                    />
                  </td>
                  <td className="align-top">
                    <div className="font-semibold text-foreground">{gap.title}</div>
                    <div className="max-w-[420px] text-[11px] font-medium leading-snug text-muted-foreground">{gap.detail}</div>
                    <div className="mt-1 text-[11px] font-bold text-brand">{gap.action}</div>
                  </td>
                  <td className="align-top">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone.chip}`}>
                      {tone.label}
                    </span>
                    {raised ? (
                      <div className="mt-1 text-[10px] font-bold text-safe">Action raised</div>
                    ) : null}
                  </td>
                  <td className="align-top text-[11px] font-semibold text-muted-foreground">{gap.rule}</td>
                  <td className="align-top text-xs font-bold text-foreground">{gap.standardCode || '—'}</td>
                  <td className="align-top text-xs font-semibold text-foreground">{gap.dueDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}