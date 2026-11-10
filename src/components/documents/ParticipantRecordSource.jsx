import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ParticipantRecordDetails from '@/components/documents/ParticipantRecordDetails';

export default function ParticipantRecordSource({ entity, query, title }) {
  const [items, setItems] = useState([]), [cursor, setCursor] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [opening, setOpening] = useState('');
  const filter = JSON.stringify(query);
  const load = useCallback(async (next) => {
    setLoading(true); setError('');
    try {
      const page = await base44.entities[entity].filter(JSON.parse(filter), { sort: '-created_date', limit: 20, cursor: next });
      setItems((current) => next ? [...current, ...page.items] : page.items);
      setCursor(page.has_more ? page.next_cursor : null);
    } catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, [entity, filter]);
  useEffect(() => { load(); }, [load]);
  const open = async (record) => {
    setOpening(record.id); setError('');
    try {
      const { openDocumentInViewer } = await import('@/lib/openDocument');
      await openDocumentInViewer(record);
    } catch (failure) { setError(failure.message); }
    finally { setOpening(''); }
  };
  return <section className="space-y-2 rounded-xl border border-border bg-card p-3">
    <h3 className="text-sm font-semibold">{title}</h3>
    {error && <p role="alert" className="text-sm text-destructive">{error}<Button size="sm" variant="outline" onClick={() => load()}>Retry</Button></p>}
    {loading && <p role="status" className="text-sm text-muted-foreground">Loading records...</p>}
    {!loading && !error && !items.length && <p className="text-xs text-muted-foreground">No records filed here yet.</p>}
    {items.map((record) => <article key={record.id} className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><button type="button" onClick={() => open(record)} className="break-words text-left text-sm font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline">{record.form_type || record.form_title || record.document_type || record.entry_type || record.title}</button><p className="text-xs text-muted-foreground">{[record.completed_date || record.recorded_date || record.uploaded_date || record.submitted_date, record.completed_by || record.recorded_by || record.uploaded_by || record.submitted_by, record.status || record.review_outcome].filter(Boolean).join(' · ')}</p></div>
      <Button size="sm" variant="outline" disabled={opening === record.id} onClick={() => open(record)}>{opening === record.id ? 'Opening...' : 'Open document'}</Button></div>
      {(record.answers || record.data || record.notes || record.review_notes) && <details><summary className="cursor-pointer text-xs font-semibold text-primary">View saved content</summary><div className="mt-3"><ParticipantRecordDetails record={record} /></div></details>}
    </article>)}
    {cursor && <Button variant="outline" size="sm" disabled={loading} onClick={() => load(cursor)}>Load more</Button>}
  </section>;
}