import React from 'react';
import { ExternalLink, Loader2, PenLine, Undo2, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ApprovalChainTrack from '@/components/approvals/ApprovalChainTrack';
import { STATUS_TONE, canDecideNow, decisionsOf, currentStage, progress, when } from '@/lib/approvalChain';

export default function ApprovalChainCard({ chain, role, busy, onDecide, onWithdraw }) {
  const stage = currentStage(chain);
  const decisions = decisionsOf(chain);
  const { decided, total, percent } = progress(chain);
  const canDecide = canDecideNow(chain, role);

  return (
    <li className="space-y-2 rounded-xl border border-border bg-card p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-foreground">{chain.title}</p>
          <p className="text-xs text-muted-foreground">
            {chain.category}
            {Number(chain.amount) > 0 ? ` · $${Number(chain.amount).toLocaleString('en-AU')}` : ''}
            {' · '}{chain.risk_level} risk · raised by {chain.requested_by_name || 'unknown'} {when(chain.requested_at)}
            {chain.due_date ? ` · due ${chain.due_date}` : ''}
          </p>
          {chain.summary && <p className="mt-1 text-xs text-muted-foreground">{chain.summary}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted-foreground">{decided} of {total} signed · {percent}%</span>
          <Badge className={STATUS_TONE[chain.status] || ''}>{chain.status}</Badge>
        </div>
      </div>

      <ApprovalChainTrack chain={chain} />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-muted-foreground">
          {chain.status === 'Pending' && stage
            ? `Level ${stage.level} of ${total} waiting on ${(stage.roles || []).join(', ')}`
            : chain.status === 'Approved'
              ? `Approved through all ${total} levels`
              : chain.status === 'Returned'
                ? `Returned at level ${chain.current_level} for more work`
                : 'Withdrawn by the person who raised it'}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {chain.record_url && (
            <Button asChild size="sm" variant="ghost">
              <Link to={chain.record_url}><ExternalLink className="h-4 w-4" />Open record</Link>
            </Button>
          )}
          {chain.mine && chain.status === 'Pending' && (
            <Button size="sm" variant="ghost" onClick={() => onWithdraw(chain)} disabled={Boolean(busy)}>
              {busy === chain.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}Withdraw
            </Button>
          )}
          {canDecide && (
            <>
              <Button size="sm" variant="outline" onClick={() => onDecide(chain, 'return')} disabled={Boolean(busy)}>
                <Undo2 className="h-4 w-4" />Return
              </Button>
              <Button size="sm" onClick={() => onDecide(chain, 'approve')} disabled={Boolean(busy)}>
                <PenLine className="h-4 w-4" />Approve level {chain.current_level}
              </Button>
            </>
          )}
        </div>
      </div>

      {decisions.length > 0 && (
        <details className="rounded-lg border border-border/70 px-2.5 py-1.5">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Decision history ({decisions.length})
          </summary>
          <ul className="mt-1.5 space-y-1 text-xs">
            {decisions.map((entry, index) => (
              <li key={`${entry.level}-${index}`} className="border-b border-border/50 pb-1 last:border-0">
                <span className="font-bold text-foreground">Level {entry.level} · {entry.stage}</span>
                <span className="text-muted-foreground"> · {entry.decision === 'approve' ? 'approved' : 'returned'} by {entry.by} {when(entry.at)}</span>
                {entry.signature && <span className="block text-[11px] text-muted-foreground">Signed: {entry.signature}</span>}
                {entry.note && <span className="block text-[11px] text-muted-foreground">Note: {entry.note}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}