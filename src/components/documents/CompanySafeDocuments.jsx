import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { safeUrl } from '@/lib/safeUrl';
import { statusTone } from '@/lib/statusStyles';
import { Plus, Trash2 } from 'lucide-react';
import CompanyDocumentDialog, { COMPANY_CATEGORIES } from '@/components/documents/CompanyDocumentDialog';
import CompanySafeUploads from '@/components/documents/CompanySafeUploads';

export default function CompanySafeDocuments({ role }) {
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const canManage = ['admin', 'Provider Administrator', 'Administration'].includes(role);
  const load = useCallback(async (cursor) => {
    setLoading(true); setError('');
    try {
      const next = await base44.entities.CompanyDocument.filter({ status: { $ne: 'Archived' }, ...(category === 'all' ? {} : { category }) }, { sort: '-created_date', limit: 50, ...(cursor ? { cursor } : {}) });
      setPage((previous) => ({ ...next, items: cursor ? [...previous.items, ...next.items] : next.items }));
    } catch (error) { setError(error.message); } finally { setLoading(false); }
  }, [category]);
  useEffect(() => { load(); }, [load]);
  return <section className="space-y-3 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-sm font-semibold">Company documents</h2>
      <Select value={category} onValueChange={setCategory}><SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{COMPANY_CATEGORIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
      {canManage && <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add document</Button>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!loading && !error && !page.items.length && <p className="text-sm text-muted-foreground">No company documents in this category.</p>}
    {page.items.map((document) => <div key={document.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{document.name}{document.version ? ` (v${document.version})` : ''}</p><p className="text-xs text-muted-foreground">{[document.category, document.owner, document.review_date && `Review ${document.review_date}`].filter(Boolean).join(' · ')}</p></div>
      <Badge className={statusTone(document.status)}>{document.status}</Badge>
      {safeUrl(document.file_url) && <a className="text-sm text-primary underline" href={safeUrl(document.file_url)} target="_blank" rel="noreferrer">Open file</a>}
      {canManage && <Button variant="ghost" size="icon" aria-label={`Delete ${document.name}`} onClick={async () => { if (confirm('Delete this document?')) { await base44.entities.CompanyDocument.delete(document.id); await load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
    </div>)}
    {loading && <p role="status" className="text-sm text-muted-foreground">Loading company documents...</p>}
    {page.has_more && <Button variant="outline" size="sm" disabled={loading} onClick={() => load(page.next_cursor)}>Load more</Button>}
    <CompanySafeUploads />
    <CompanyDocumentDialog open={open} onOpenChange={setOpen} onSaved={() => load()} />
  </section>;
}