import React from 'react';
import { Plus } from 'lucide-react';
import { Button, FabricEmpty, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/fabric/fabricTableKit';

/** The event catalogue: every payload contract this business may route. */
export default function EventCatalogTable({ eventTypes = [], canConfigure, onNew, onEdit, onRetire } = {}) {
  if (!eventTypes.length) {
    return (
      <FabricEmpty
        title="The event catalogue is empty"
        body="An event type declares the fields its payload must carry and how sensitive it is. Nothing routes until an event type exists, so start here."
      />
    );
  }
  return (
    <div className="space-y-3">
      {canConfigure && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onNew}><Plus className="h-4 w-4" /> New event type</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payload contract</TableHead>
              <TableHead>Sensitivity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[220px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="font-mono text-[11px] text-[#0A2B6D]/60">{row.event_key}</div>
                  {row.description && <div className="text-[11px] text-[#0A2B6D]/70">{row.description}</div>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.category}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                  {row.field_count} fields
                  <div className="text-[11px] text-[#0A2B6D]/60">schema v{row.schema_version}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.sensitivity}</TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canConfigure && row.status === 'Active' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => onRetire?.(row)}>Retire</Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}