import React from 'react';
import { BadgeCheck, Pencil, Trash2 } from 'lucide-react';
import { Button, NewRow, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

/** Registered models and providers. The provider key is referenced by secret name, never stored. */
export default function ModelTable({ models = [], canManage, onNew, onEdit, onValidate, onRetire } = {}) {
  return (
    <div>
      <NewRow canConfigure={canManage} label="Register model" onNew={onNew} />
      {!models.length ? (
        <WorkforceEmpty
          title="No model registered yet"
          body="Register the provider and model this business uses, and reference the app secret that holds its key. Validation checks the settings and the reference; no provider is called from here."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Provider key</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Ceiling</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[180px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.model_key}</div>
                  {row.validation_note && <div className="text-[11px] text-[#0A2B6D]/60">{row.validation_note}</div>}
                </TableCell>
                <TableCell className="text-xs text-[#0A2B6D]">{row.provider}</TableCell>
                <TableCell className="min-w-[160px] text-[11px] text-[#0A2B6D]/80">
                  <div className="text-xs font-bold text-[#0A2B6D]">{row.provider_model_id}</div>
                  <div>{row.credential_ref || 'No secret referenced'}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{Number(row.context_window || 0).toLocaleString()}</TableCell>
                <TableCell><StatusBadge status={row.sensitivity_ceiling} /></TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canManage && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                    {canManage && row.status !== 'Validated' && row.status !== 'Retired' && (
                      <Button size="sm" variant="secondary" onClick={() => onValidate?.(row)}><BadgeCheck className="h-3.5 w-3.5" /> Validate</Button>
                    )}
                    {canManage && row.status !== 'Retired' && (
                      <Button size="sm" variant="ghost" onClick={() => onRetire?.(row)}><Trash2 className="h-3.5 w-3.5" /> Retire</Button>
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