import React from 'react';
import { Pencil } from 'lucide-react';
import { Button, NewRow, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

/** Tools an agent could use. The kind fixes the risk; nothing here is executed by this app. */
export default function ToolTable({ tools = [], canManage, onNew, onEdit } = {}) {
  return (
    <div>
      <NewRow canConfigure={canManage} label="New tool" onNew={onNew} />
      {!tools.length ? (
        <WorkforceEmpty
          title="No tool defined yet"
          body="A tool records what an agent could do and how risky that is. External, financial, employment, clinical, participant-impacting, permission-changing, destructive and compliance-status-changing kinds can never be granted autonomy."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Autonomy</TableHead>
              <TableHead>Idempotency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[200px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.tool_key}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.description}</div>
                </TableCell>
                <TableCell className="min-w-[150px] text-xs text-[#0A2B6D]">{row.kind}</TableCell>
                <TableCell><StatusBadge status={row.risk_level} /></TableCell>
                <TableCell className="min-w-[160px] text-[11px] text-[#0A2B6D]/80">
                  {row.autonomous_allowed ? 'May run internally with a grant' : 'Never without a person'}
                </TableCell>
                <TableCell className="text-xs text-[#0A2B6D]">{row.idempotency_supported ? 'Supports it' : 'Not supported'}</TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  {canManage && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}