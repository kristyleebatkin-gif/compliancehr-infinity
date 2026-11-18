import React from 'react';
import { RotateCcw, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MiniTable, StatusBadge, TableCell, TableRow } from '@/components/fabric/fabricTableKit';

const when = (value) => (value ? new Date(value).toLocaleString() : '—');

/** One delivery in full: its route, its attempts, and the payload exactly as stored. */
export default function MessageDialog({ open, onOpenChange, detail, loading, busy, onRetry, onReplay } = {}) {
  const message = detail?.message || null;
  const attempts = detail?.attempts || [];
  const redacted = detail?.redactedFields || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{message ? `${message.event_type_name || message.event_key}` : 'Delivery detail'}</DialogTitle>
          <DialogDescription>
            {message ? `${message.message_ref} · trace ${message.trace_id}` : 'Reading the delivery record.'}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="py-6 text-center text-sm text-[#0A2B6D]/70">Loading the delivery…</p>}

        {message && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Status</p>
                <StatusBadge status={message.status} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Attempts</p>
                <p className="text-sm font-bold text-[#0A2B6D]">{message.attempts} of {message.max_attempts}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Source</p>
                <p className="text-sm text-[#0A2B6D]">{message.source_ref || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Rule matched</p>
                <p className="text-sm text-[#0A2B6D]">{message.rule_name || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Subscription</p>
                <p className="text-sm text-[#0A2B6D]">{message.subscription_name || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Workflow started</p>
                <p className="text-sm text-[#0A2B6D]">
                  {message.workflow_definition_name
                    ? `${message.workflow_definition_name} v${message.workflow_definition_version}`
                    : 'None'}
                </p>
              </div>
            </div>

            {message.last_error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                Last failure: {message.last_error}
              </p>
            )}

            {redacted.length > 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                Withheld before storage: {redacted.join(', ')}
              </p>
            )}

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Payload as stored</p>
              <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-[#0A2B6D]">
                {message.payload_json || '{}'}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Delivery attempts</p>
              <MiniTable
                head={['Attempt', 'Outcome', 'Started', 'Duration', 'Reason', 'Next retry']}
                rows={attempts.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs font-bold text-[#0A2B6D]">{row.attempt_number}</TableCell>
                    <TableCell><StatusBadge status={row.outcome} /></TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]">{when(row.started_at)}</TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]">{row.duration_ms ?? '—'} ms</TableCell>
                    <TableCell className="min-w-[160px] text-[11px] text-rose-700">{row.error_detail || row.error_code || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]">{when(row.next_retry_at)}</TableCell>
                  </TableRow>
                ))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Close</Button>
          {message && !['Delivered', 'Suppressed'].includes(message.status) && (
            <Button variant="secondary" disabled={busy} onClick={() => onRetry?.(message)}>
              <RotateCcw className="h-3.5 w-3.5" /> Retry now
            </Button>
          )}
          {message && (
            <Button disabled={busy} onClick={() => onReplay?.(message)}>
              <Send className="h-3.5 w-3.5" /> Replay
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}