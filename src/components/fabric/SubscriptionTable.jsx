import React from 'react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

/** Subscriptions: which event goes to which published target, and on what terms. */
export default function SubscriptionTable({ subscriptions = [], canConfigure, onNew, onEdit, onStatus } = {}) {
  if (!subscriptions.length) {
    return (
      <FabricEmpty
        title="No subscription yet"
        body="A subscription says what a validated event should reach: a published workflow, a published automation flow, or the record only. It also carries the retry and rate limits used when delivery runs."
      />
    );
  }
  return (
    <div className="space-y-3">
      {canConfigure && <div className="flex justify-end"><Button size="sm" onClick={onNew}>New subscription</Button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Delivers to</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[200px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.subscription_key} · v{row.version}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">
                    {row.delivery_count || 0} delivered · {row.failure_count || 0} failed
                  </div>
                </TableCell>
                <TableCell className="min-w-[160px]">
                  <div className="text-xs font-bold text-[#0A2B6D]">{row.event_type_name || row.event_type_key}</div>
                  <div className="font-mono text-[11px] text-[#0A2B6D]/60">{row.event_type_key}</div>
                  {row.filter_count > 0 && <div className="text-[11px] text-[#0A2B6D]/60">{row.filter_count} filters</div>}
                </TableCell>
                <TableCell className="min-w-[180px] text-xs text-[#0A2B6D]">
                  {row.target_kind === 'Workflow' ? `Workflow: ${row.workflow_definition_name || '—'}`
                    : row.target_kind === 'Automation flow' ? `Flow: ${row.flow_name || '—'}`
                      : 'Record only'}
                  {row.connector_name && <div className="text-[11px] text-[#0A2B6D]/60">via {row.connector_name}</div>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]">
                  {row.max_attempts} attempts
                  <div>{row.rate_limit_per_minute}/min</div>
                </TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  {canConfigure && (
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>
                      {row.status === 'Active'
                        ? <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Paused')}>Pause</Button>
                        : <Button size="sm" variant="secondary" onClick={() => onStatus?.(row, 'Active')}>Resume</Button>}
                      {row.status !== 'Retired' && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Retired')}>Retire</Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}