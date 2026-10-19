import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, Tags, X, ListChecks } from 'lucide-react';

// Shared bulk action bar for register lists: appears when records are selected.
export default function BulkActionBar({ count, label = 'selected', statuses, busy, onExport, onStatus, onDelete, onClear, onSelectAll }) {
  const [status, setStatus] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5">
      <span className="text-sm font-semibold text-brand">{count} {label}</span>
      {onSelectAll && (
        <Button variant="ghost" size="sm" onClick={onSelectAll} disabled={busy}>
          <ListChecks className="mr-1 h-4 w-4" />Select all
        </Button>
      )}
      <div className="flex-1" />
      <Button variant="outline" size="sm" onClick={onExport} disabled={busy}>
        <Download className="mr-1.5 h-4 w-4" />Export
      </Button>
      {statuses && (
        <>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-44 bg-card text-xs"><SelectValue placeholder="Set status to..." /></SelectTrigger>
            <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" disabled={!status || busy} onClick={() => onStatus(status).then(() => setStatus(''))}>
            <Tags className="mr-1.5 h-4 w-4" />Apply
          </Button>
        </>
      )}
      <Button variant="destructive" size="sm" onClick={onDelete} disabled={busy}>
        <Trash2 className="mr-1.5 h-4 w-4" />Delete
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
        <X className="mr-1 h-4 w-4" />Clear
      </Button>
    </div>
  );
}