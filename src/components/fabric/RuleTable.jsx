import React from 'react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

const describe = (rule) => {
  if (rule.action === 'Route to workflow') return `Workflow: ${rule.target_workflow_name || '—'}`;
  if (rule.action === 'Route to flow') return `Flow: ${rule.target_flow_name || '—'}`;
  return rule.action;
};

/** Orchestration rules: the first matching active rule owns the event, so priorities are visible. */
export default function RuleTable({ rules = [], canConfigure, onNew, onEdit, onStatus } = {}) {
  if (!rules.length) {
    return (
      <FabricEmpty
        title="No orchestration rule yet"
        body="A rule decides which published workflow an event of a given type should start, and on what conditions. Lower priority numbers are read first, and the first matching rule owns the event, so two rules can never claim one event."
      />
    );
  }
  return (
    <div className="space-y-3">
      {canConfigure && <div className="flex justify-end"><Button size="sm" onClick={onNew}>New rule</Button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((row) => {
              let conditions = [];
              try { conditions = JSON.parse(row.conditions_json || '[]'); } catch { conditions = []; }
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[190px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.rule_key}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.match_count || 0} matched</div>
                  </TableCell>
                  <TableCell className="min-w-[140px] font-mono text-[11px] text-[#0A2B6D]">{row.event_type_key}</TableCell>
                  <TableCell className="min-w-[190px] text-[11px] text-[#0A2B6D]">
                    {conditions.length
                      ? conditions.map((condition, index) => (
                        <div key={index}>{condition.field} {condition.op} {String(condition.value)}</div>
                      ))
                      : 'Every event of this type'}
                  </TableCell>
                  <TableCell className="min-w-[160px] text-xs text-[#0A2B6D]">{describe(row)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.priority}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-right">
                    {canConfigure && (
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>
                        {row.status === 'Active'
                          ? <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Disabled')}>Disable</Button>
                          : <Button size="sm" variant="secondary" onClick={() => onStatus?.(row, 'Active')}>Enable</Button>}
                      </div>
                    )}
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