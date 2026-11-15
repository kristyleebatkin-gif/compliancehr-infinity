import React from 'react';
import { Flag, History } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { confidenceBand } from '@/lib/aiIntelligence';

const DATE = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 16).replace('T', ' ');
};

export default function AiAuditLogTable({ interactions, onFlag }) {
  if (!interactions.length) {
    return (
      <EmptyState
        icon={History}
        title="No AI activity recorded"
        message="Every copilot run writes an immutable audit entry: who asked, which agent, how many records were read, the confidence returned and how long it took."
        modulePath="Compliance"
        createLabel="Run a copilot review"
        createHref="/ai-os"
      />
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left">Run</th>
            <th className="text-left">Requested by</th>
            <th className="text-left">Confidence</th>
            <th className="text-left">Records read</th>
            <th className="text-left">Duration</th>
            <th className="text-right">Quality</th>
          </tr>
        </thead>
        <tbody>
          {interactions.map((entry) => {
            const band = confidenceBand(entry.confidence);
            return (
              <tr key={entry.id} className="border-b border-border/60 last:border-0">
                <td className="align-top">
                  <div className="text-xs font-bold text-foreground">{entry.agent_name}</div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {entry.interaction_type || entry.module} · {DATE(entry.created_date)}
                  </div>
                  <div className="mt-0.5 max-w-[380px] text-[11px] font-medium leading-snug text-muted-foreground">
                    {entry.response_summary}
                  </div>
                </td>
                <td className="align-top text-xs font-semibold text-foreground">{entry.user_email || '—'}</td>
                <td className="align-top">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${band.chip}`}>
                    {entry.confidence ?? 0}%
                  </span>
                </td>
                <td className="align-top text-xs font-semibold text-foreground">{entry.source_count ?? 0}</td>
                <td className="align-top text-xs font-semibold text-foreground">
                  {entry.duration_ms ? `${Math.round(entry.duration_ms / 100) / 10}s` : '—'}
                </td>
                <td className="align-top text-right">
                  <Button
                    size="sm"
                    variant={entry.flagged ? 'secondary' : 'ghost'}
                    onClick={() => onFlag(entry)}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {entry.flagged ? 'Flagged' : 'Flag'}
                  </Button>
                  {entry.override ? (
                    <div className="mt-1 text-[10px] font-bold text-warning">Overridden</div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}