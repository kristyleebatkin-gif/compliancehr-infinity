import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

const when = (value) => (value ? new Date(value).toLocaleString() : '—');

/** Delivery history: every event, where it went, and why it did not. */
export default function MessageTable({ messages = [], onOpen, onRetry, onReplay, busy } = {}) {
  if (!messages.length) {
    return (
      <FabricEmpty
        title="No events delivered yet"
        body="Publish an event from the catalogue to see it validated, routed and recorded here. Each delivery keeps its trace ID, attempt count, backoff and failure reason, with secret-looking values already removed."
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Redacted</TableHead>
            <TableHead>Last failure reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[220px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.event_type_name || row.event_key}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.message_ref}</div>
                <div className="text-[11px] text-[#0A2B6D]/50">trace {row.trace_id}</div>
              </TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">
                {row.attempts} of {row.max_attempts}
                {row.next_attempt_at && <div className="text-[11px] font-normal text-amber-700">next {when(row.next_attempt_at)}</div>}
              </TableCell>
              <TableCell className="min-w-[200px] text-[11px] text-[#0A2B6D]/80">
                {row.rule_name ? `Rule: ${row.rule_name}` : row.subscription_name ? `Subscription: ${row.subscription_name}` : 'No rule or subscription matched'}
                {row.workflow_definition_name && (
                  <div className="text-[#0A2B6D]">
                    {row.workflow_definition_name} v{row.workflow_definition_version} · run {String(row.workflow_instance_id).slice(0, 8)}
                  </div>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                {row.redacted_count ? `${row.redacted_count} field${row.redacted_count === 1 ? '' : 's'}` : 'None'}
              </TableCell>
              <TableCell className="min-w-[200px] text-[11px] text-rose-700">{row.last_error || '—'}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => onOpen?.(row)}><Search className="h-3.5 w-3.5" /> Open</Button>
                  {!['Delivered', 'Suppressed'].includes(row.status) && (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => onRetry?.(row)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Retry
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => onReplay?.(row)}>Replay</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}