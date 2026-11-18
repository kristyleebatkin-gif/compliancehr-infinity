import React from 'react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

const stepLabel = (step) => {
  if (step.kind === 'Route to workflow') return `Route to ${step.workflow_definition_name || 'a workflow'}`;
  return step.kind || 'Unknown step';
};

/** Automation flows: ordered, validated routes. A published version is immutable. */
export default function FlowTable({ flows = [], canConfigure, onNew, onEdit, onValidate, onPublish, onStatus, onRevise } = {}) {
  if (!flows.length) {
    return (
      <FabricEmpty
        title="No automation flow yet"
        body="A flow is an ordered routing plan for one event. Only step kinds the fabric can genuinely perform are accepted, so a flow that validates is a route this app really runs."
      />
    );
  }
  return (
    <div className="space-y-3">
      {canConfigure && <div className="flex justify-end"><Button size="sm" onClick={onNew}>New flow</Button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flow</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Validation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((row) => {
              let steps = [];
              try { steps = JSON.parse(row.steps_json || '[]'); } catch { steps = []; }
              const outOfDate = Boolean(row.validated_hash) && row.validated_hash !== row.content_hash;
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.flow_key} · v{row.version}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.run_count || 0} times routed</div>
                  </TableCell>
                  <TableCell className="min-w-[150px] font-mono text-[11px] text-[#0A2B6D]">{row.trigger_event_key}</TableCell>
                  <TableCell className="min-w-[200px] text-[11px] text-[#0A2B6D]">
                    {steps.length
                      ? steps.map((step, index) => <div key={step.id || index}>{index + 1}. {stepLabel(step)}</div>)
                      : 'No steps'}
                  </TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="min-w-[160px] text-[11px]">
                    {row.validated_hash && !outOfDate && <span className="font-bold text-emerald-700">Validated by {row.validated_by}</span>}
                    {outOfDate && <span className="font-bold text-amber-700">Changed since validation</span>}
                    {!row.validated_hash && <span className="text-[#0A2B6D]/70">Not validated</span>}
                    {row.publisher_independent && <div className="text-[#0A2B6D]/60">Published by someone else</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {canConfigure && ['Draft', 'Validated', 'Paused'].includes(row.status) && (
                        <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>
                      )}
                      {canConfigure && ['Draft', 'Validated', 'Paused'].includes(row.status) && (
                        <Button size="sm" variant="secondary" onClick={() => onValidate?.(row)}>Validate</Button>
                      )}
                      {canConfigure && row.status === 'Validated' && <Button size="sm" onClick={() => onPublish?.(row)}>Publish</Button>}
                      {canConfigure && row.status === 'Published' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Paused')}>Pause</Button>
                          <Button size="sm" variant="ghost" onClick={() => onRevise?.(row)}>New version</Button>
                        </>
                      )}
                      {canConfigure && row.status === 'Paused' && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Archived')}>Archive</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}