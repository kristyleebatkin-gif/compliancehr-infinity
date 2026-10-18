import React from 'react';
import { Button } from '@/components/ui/button';

export default function OnlineDocumentHistory({ records, selectedId, onSelect, onNew, onMore, hasMore, disabled }) {
  return <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
        <span>My saved documents and drafts</span>
        <select value={selectedId || ''} onChange={(event) => onSelect(event.target.value)} disabled={disabled} className="h-11 w-full rounded-md border border-input bg-background px-3 text-foreground">
          <option value="">New document</option>
          {records.map((record) => <option key={record.id} value={record.id}>{record.status === 'Draft' ? 'Draft' : 'Completed'} · {new Date(record.updated_date || record.created_date).toLocaleString()} · {record.submitted_by}</option>)}
        </select>
      </label>
      <Button type="button" variant="outline" onClick={onNew} disabled={disabled}>New document</Button>
    </div>
    {!records.length && <p className="text-xs text-muted-foreground">No saved documents yet.</p>}
    {hasMore && <Button type="button" size="sm" variant="ghost" onClick={onMore} disabled={disabled}>Load more saved documents</Button>}
  </div>;
}