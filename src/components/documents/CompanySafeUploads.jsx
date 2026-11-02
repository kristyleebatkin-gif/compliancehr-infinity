import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { companySafeBusinessQuery } from '@/lib/companySafeVault';
import { openDocumentInViewer } from '@/lib/openDocument';

const queryFor = (type) => type === 'all' ? companySafeBusinessQuery : { library: 'company-safe', document_type: type };
export default function CompanySafeUploads() {
  const [type, setType] = useState('all');
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async (cursor) => {
    setLoading(true); setError('');
    try {
      const [next, summary] = await Promise.all([
        base44.entities.FormsLibraryDocument.filter(queryFor(type), { sort: '-uploaded_date', limit: 25, ...(cursor ? { cursor } : {}) }),
        base44.entities.FormsLibraryDocument.aggregate({ query: queryFor('all'), groupBy: 'document_type' }),
      ]);
      setPage((previous) => ({ ...next, items: cursor ? [...previous.items, ...next.items] : next.items })); setGroups(summary.rows);
    } catch (failure) { setError(failure.message); } finally { setLoading(false); }
  }, [type]);
  useEffect(() => { load(); return base44.entities.FormsLibraryDocument.subscribe(() => load()); }, [load]);
  const open = async (document) => {
    setOpening(document.id); setError('');
    try {
      await openDocumentInViewer(document);
    } catch (failure) { setError(failure.message); } finally { setOpening(''); }
  };
  return <section className="space-y-2 rounded-lg border border-border bg-card p-2">
    <div className="flex flex-wrap items-center gap-2"><h3 className="mr-auto text-xs font-semibold">Company Safe uploads</h3><Select value={type} onValueChange={setType}><SelectTrigger className="h-8 w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All document types</SelectItem>{groups.filter((group) => group.document_type).map((group) => <SelectItem key={group.document_type} value={group.document_type}>{group.document_type} ({group.count})</SelectItem>)}</SelectContent></Select></div>
    <p className="text-xs text-muted-foreground">Registrations, insurances and business compliance uploads (stored privately). Plans are in Business Plans; badges are in Staff Documents.</p>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {page.items.map((document) => <div key={document.id} className="flex items-center gap-2 rounded-md border border-border p-2"><div className="min-w-0 flex-1"><button type="button" onClick={() => open(document)} className="break-words text-left text-xs font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline">{document.title}</button><p className="text-xs text-muted-foreground">{[document.document_type, document.uploaded_date, document.uploaded_by].filter(Boolean).join(' · ')}</p></div><Button size="sm" variant="outline" disabled={!!opening} onClick={() => open(document)}>{opening === document.id ? 'Opening...' : 'Open file'}</Button></div>)}
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading Company Safe uploads...</p>}
    {!loading && !error && !page.items.length && <p className="text-xs text-muted-foreground">No Company Safe uploads in this category.</p>}
    {page.has_more && <Button size="sm" variant="outline" disabled={loading} onClick={() => load(page.next_cursor)}>Load more uploads</Button>}
  </section>;
}