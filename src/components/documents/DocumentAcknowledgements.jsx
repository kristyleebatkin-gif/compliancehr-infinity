import React, { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DocumentAcknowledgementHistory from '@/components/documents/DocumentAcknowledgementHistory';
import useDocumentAcknowledgements from '@/components/documents/useDocumentAcknowledgements';
export default function DocumentAcknowledgements({ entity, documentId, title }) {
  const [open, setOpen] = useState(false);
  const checkboxId = useId();
  const { query, save, page, records, error, confirmed, setConfirmed } = useDocumentAcknowledgements(entity, documentId, open);
  const changeOpen = (value) => { if (!save.isPending) { setOpen(value); setConfirmed(false); save.reset(); } };
  return <>
    <Button type="button" variant="outline" size="sm" onClick={() => changeOpen(true)}>Acknowledgements</Button>
    <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto bg-card">
      <DialogHeader><DialogTitle>Document acknowledgements</DialogTitle><DialogDescription>{page?.title || title}</DialogDescription></DialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {query.isPending ? <p role="status" className="text-sm">Loading acknowledgements…</p> : query.isError ? <Button type="button" variant="outline" onClick={() => query.refetch()}>Try again</Button> : <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{page?.can_review ? 'Acknowledgements for this document, including earlier saved revisions.' : 'Your acknowledgements for this document.'} Times are shown in your local timezone.</p>
        {page?.acknowledged ? <p role="status" className="rounded-lg bg-safe/10 p-3 text-sm text-safe">You have acknowledged the current saved revision.</p> : <div className="space-y-3 rounded-lg border border-border p-3">
          <label htmlFor={checkboxId} className="flex items-start gap-2 text-sm"><input id={checkboxId} type="checkbox" className="mt-1" checked={confirmed} disabled={save.isPending} onChange={(event) => setConfirmed(event.target.checked)} />I confirm that I have read and acknowledge this saved revision of the document.</label>
          <Button type="button" variant="outline" disabled={!confirmed || save.isPending || query.isFetching} onClick={() => save.mutate()}>{save.isPending ? 'Recording…' : 'Record my acknowledgement'}</Button>
        </div>}
        <DocumentAcknowledgementHistory records={records} hasMore={query.hasNextPage} loadingMore={query.isFetchingNextPage} onMore={() => query.fetchNextPage()} />
      </div>}
    </DialogContent></Dialog>
  </>;
}