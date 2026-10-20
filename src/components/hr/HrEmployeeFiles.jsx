import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import HrEmployeeFileCard from '@/components/hr/HrEmployeeFileCard';

const CATEGORIES = { contract: 'Employment contracts', position: 'Position descriptions', upload: 'Employee documents', form: 'Completed HR forms', letter: 'HR letters', appraisal: 'Performance appraisals' };
export default function HrEmployeeFiles({ profile }) {
  const [kind, setKind] = useState('contract');
  const [page, setPage] = useState({ items: [] });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);
  const load = async (cursor) => {
    const active = ++request.current;
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('hrPaperwork', { action: 'list', kind, ...(profile?.id ? { staff_profile_id: profile.id } : {}), ...(cursor ? { cursor } : {}) });
      if (data.error) throw new Error(data.error);
      if (active !== request.current) return;
      setPage((old) => ({ ...data, items: cursor ? [...old.items, ...data.items] : data.items }));
    } catch (e) { if (active === request.current) setError(e.response?.data?.error || e.message); }
    finally { if (active === request.current) setBusy(false); }
  };
  useEffect(() => { setPage({ items: [] }); load(); return () => { request.current++; }; }, [kind, profile?.id]);
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
      <div><h2 className="text-sm font-semibold">{profile ? `${profile.full_name}'s HR files` : 'My HR files'}</h2><p className="text-xs text-muted-foreground">View and download your employee records. Editing remains with authorised HR staff.</p></div>
      <div className="grid gap-1"><Label htmlFor="hr-file-category" className="text-xs">File category</Label><select id="hr-file-category" value={kind} onChange={(e) => setKind(e.target.value)} className="h-8 max-w-full rounded-md border border-input bg-background px-2 text-xs">{Object.entries(CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    </div>
    {error ? <div role="alert" className="rounded-xl border border-destructive/30 p-3 text-sm text-destructive">{error}<Button size="sm" variant="outline" className="ml-2" onClick={() => load()}>Retry</Button></div> : busy && !page.items.length ? <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading HR files…</p> : !page.items.length ? <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{page.linked === false ? 'No employee profile is linked to your sign-in email. Ask HR to link your profile so your files can appear here.' : `No ${CATEGORIES[kind].toLowerCase()} filed yet.`}</p> : <div className="grid gap-3 md:grid-cols-2">{page.items.map((record) => <HrEmployeeFileCard key={record.id} record={record} kind={kind} />)}</div>}
    {page.has_more && <Button variant="outline" size="sm" disabled={busy} onClick={() => load(page.next_cursor)}>{busy ? 'Loading…' : 'Load more files'}</Button>}
  </section>;
}