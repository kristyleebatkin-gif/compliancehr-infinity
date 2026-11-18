import React from 'react';
import { Pencil, Power } from 'lucide-react';
import { Button, NewRow, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

/** Per-agent, per-tool grants: the only place autonomy is ever written down. */
export default function PolicyTable({ assignments = [], canManage, onNew, onEdit, onStatus } = {}) {
  return (
    <div>
      <NewRow canConfigure={canManage} label="New tool grant" onNew={onNew} />
      {!assignments.length ? (
        <WorkforceEmpty
          title="No tool grant yet"
          body="A tool does nothing until an agent is granted it. Each grant names one tool, one policy and the reason the agent needs it, so least privilege is written down rather than assumed."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Grant</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Justification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[130px] text-[11px] text-[#0A2B6D]/70">
                  {row.assignment_key}
                  <div>{row.granted_by || '—'}</div>
                </TableCell>
                <TableCell className="min-w-[130px] text-xs font-bold text-[#0A2B6D]">{row.agent_name}</TableCell>
                <TableCell className="min-w-[150px] text-[11px] text-[#0A2B6D]/80">
                  <div className="text-xs font-bold text-[#0A2B6D]">{row.tool_name}</div>
                  <div>{row.tool_kind} · {row.tool_risk_level}</div>
                </TableCell>
                <TableCell><StatusBadge status={row.policy} /></TableCell>
                <TableCell className="text-[11px] text-[#0A2B6D]/80">
                  {row.requires_human_approval ? 'A person must approve' : 'Recorded internally'}
                  {row.idempotency_required && <div>idempotency key required</div>}
                </TableCell>
                <TableCell className="min-w-[180px] text-[11px] text-[#0A2B6D]/70">{row.least_privilege_note}</TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canManage && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                    {canManage && (
                      <Button size="sm" variant="ghost" disabled={!row.status} onClick={() => onStatus?.(row, row.status === 'Active' ? 'Disabled' : 'Active')}>
                        <Power className="h-3.5 w-3.5" /> {row.status === 'Active' ? 'Disable' : 'Enable'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}