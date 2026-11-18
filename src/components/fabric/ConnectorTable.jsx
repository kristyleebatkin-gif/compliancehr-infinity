import React from 'react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

/**
 * Integration connectors. The record holds the NAME of a secret, never the secret, so this table
 * prints the reference and never anything that could be replayed.
 */
export default function ConnectorTable({ connectors = [], canManage, onNew, onEdit, onStatus } = {}) {
  if (!connectors.length) {
    return (
      <FabricEmpty
        title="No connector registered"
        body="A connector records where messages may go and which app secret authenticates them. Only the secret's name is stored here; the value stays in the app's secrets and is never written to a record or returned by this screen."
      />
    );
  }
  return (
    <div className="space-y-3">
      {canManage && <div className="flex justify-end"><Button size="sm" onClick={onNew}>New connector</Button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Connector</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Secret reference</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectors.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[180px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.connector_key}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.kind}</TableCell>
                <TableCell className="min-w-[190px] text-[11px] text-[#0A2B6D]">{row.endpoint_label || '—'}</TableCell>
                <TableCell className="min-w-[170px] font-mono text-[11px] text-[#0A2B6D]">
                  {row.credential_ref || '—'}
                  <div className="font-sans text-[11px] text-[#0A2B6D]/60">{row.auth_scheme}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]">
                  {row.max_attempts} attempts
                  <div>{row.rate_limit_per_minute}/min</div>
                </TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>
                      {row.status === 'Active'
                        ? <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Disabled')}>Disable</Button>
                        : <Button size="sm" variant="secondary" onClick={() => onStatus?.(row, 'Active')}>Activate</Button>}
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