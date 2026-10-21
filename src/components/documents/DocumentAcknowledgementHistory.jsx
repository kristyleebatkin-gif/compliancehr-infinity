import React from 'react';
import { Button } from '@/components/ui/button';
export default function DocumentAcknowledgementHistory({ records, hasMore, loadingMore, onMore }) {
  return <section className="space-y-3">
    <h3 className="text-sm font-semibold">Acknowledgement log</h3>
    {!records.length && <p className="text-sm text-muted-foreground">No acknowledgements recorded yet.</p>}
    {records.map((item) => <article key={item.id} className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <p className="font-semibold">{item.acknowledged_by_name}</p>
      <p className="break-all text-xs text-muted-foreground">{item.acknowledged_by_email} · {item.acknowledged_by_role}</p>
      <p>{new Date(item.acknowledged_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZoneName: undefined })}</p>
      <p className="text-xs text-muted-foreground">Saved revision: {item.document_revision ? new Date(item.document_revision).toLocaleString() : 'Original'}</p>
      <p className="text-xs">{item.declaration}</p>
    </article>)}
    {hasMore && <Button type="button" variant="outline" size="sm" onClick={onMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more acknowledgements'}</Button>}
  </section>;
}