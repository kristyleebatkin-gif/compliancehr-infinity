import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, GitBranch, Pencil, ExternalLink } from 'lucide-react';
import { EVIDENCE_STATES, confidenceTone, daysUntil, evidenceState } from '@/lib/assuranceChain';

const DATE = (value) => (value ? String(value).slice(0, 10) : '—');

function ValidityCell({ validTo }) {
  const state = evidenceState({ valid_to: validTo, verification_status: undefined });
  const remaining = daysUntil(validTo);
  if (remaining === null) return <span className="text-xs text-muted-foreground">No expiry set</span>;
  const tone = state === 'expired' ? 'text-danger font-bold' : state === 'expiring' ? 'text-warning font-bold' : 'text-muted-foreground';
  return (
    <span className={`text-xs ${tone}`}>
      {DATE(validTo)}
      <span className="ml-1">
        {remaining < 0 ? `(${Math.abs(remaining)}d overdue)` : `(${remaining}d left)`}
      </span>
    </span>
  );
}

export default function EvidenceRegisterTable({ rows, onVerify, onEdit, onOpenChain, verifyingId }) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left">Evidence</th>
            <th className="text-left">Control</th>
            <th className="text-left">Owner</th>
            <th className="text-left">Valid to</th>
            <th className="text-left">Confidence</th>
            <th className="text-left">Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const state = evidenceState(item);
            const tone = EVIDENCE_STATES[state];
            const score = Number(item.confidence);
            const width = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
            return (
              <tr key={item.id} className="border-b border-border/60 last:border-0">
                <td className="align-top">
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {item.evidence_type}
                    {item.framework ? ` · ${item.framework}` : ''}
                  </div>
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Open evidence
                    </a>
                  ) : null}
                </td>
                <td className="align-top">
                  <div className="text-xs font-bold text-foreground">{item.standard_code || 'Unlinked'}</div>
                  <div className="max-w-[240px] text-[11px] font-medium leading-snug text-muted-foreground">
                    {item.control_statement || 'No control linked yet'}
                  </div>
                </td>
                <td className="align-top text-xs font-semibold text-foreground">{item.owner || '—'}</td>
                <td className="align-top">
                  <ValidityCell validTo={item.valid_to} />
                </td>
                <td className="align-top">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${confidenceTone(score)}`} style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-foreground">{Number.isFinite(score) ? `${score}%` : '—'}</span>
                  </div>
                </td>
                <td className="align-top">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone.chip}`}>{tone.label}</span>
                  {item.verified_by ? (
                    <div className="mt-1 text-[10px] font-medium text-muted-foreground">
                      {item.verified_by} · {DATE(item.verified_date)}
                    </div>
                  ) : null}
                </td>
                <td className="align-top">
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {state !== 'verified' ? (
                      <Button size="sm" variant="outline" onClick={() => onVerify(item)} disabled={verifyingId === item.id}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {verifyingId === item.id ? 'Verifying…' : 'Verify'}
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => onOpenChain(item.control_id)}>
                      <GitBranch className="h-3.5 w-3.5" /> Chain
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}