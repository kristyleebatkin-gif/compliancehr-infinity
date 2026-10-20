import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export default function ActionReportList() {
  const [page, setPage] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async (cursor) => {
    setLoading(true); setError('');
    try {
      const next = await base44.entities.ActionReport.list({ sort: '-created_date', limit: 10, ...(cursor ? { cursor } : {}) });
      setPage((previous) => ({ ...next, items: cursor ? [...previous.items, ...next.items] : next.items }));
    } catch (failure) { setError(failure.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); return base44.entities.ActionReport.subscribe(() => load()); }, [load]);
  const generate = async () => {
    setBusy('generate'); setError('');
    try { const { data } = await base44.functions.invoke('actionBatchReport', { latest: true }); if (data.error) throw new Error(data.error); await load(); }
    catch (failure) { setError(failure.message); } finally { setBusy(''); }
  };
  const download = async (report, kind) => {
    setBusy(`${report.id}-${kind}`); setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: report[`${kind}_file_uri`] });
      const response = await fetch(signed_url);
      if (!response.ok) throw new Error('Unable to download this report. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = `${report.title.replace(/[^a-z0-9-]/gi, '-')}.${kind}`; link.click(); URL.revokeObjectURL(url);
    } catch (failure) { setError(failure.message); } finally { setBusy(''); }
  };
  return <section className="space-y-2 rounded-lg border border-border bg-card p-2">
    <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold">Saved 30-action reports</h3><Button size="sm" variant="ghost" disabled={loading || !!busy} onClick={generate}>{busy === 'generate' ? 'Generating...' : 'Generate latest report'}</Button></div>
    <p className="text-xs text-muted-foreground">Every 30 logged app actions, a PDF and CSV are generated and stored privately. Includes access events and record changes.</p>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {page.items.map((report) => <div key={report.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
      <div className="min-w-0 flex-1"><p className="text-xs font-medium">{report.title}</p><p className="text-xs text-muted-foreground">{report.action_count} actions · {new Date(report.created_date).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p></div>
      {['pdf', 'csv'].map((kind) => <Button key={kind} size="sm" variant="outline" disabled={!!busy || !report[`${kind}_file_uri`]} onClick={() => download(report, kind)}>{busy === `${report.id}-${kind}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}{kind.toUpperCase()}</Button>)}
    </div>)}
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading reports...</p>}
    {!loading && !error && !page.items.length && <p className="text-xs text-muted-foreground">The first report will appear when the next batch of 30 logged actions is complete.</p>}
    {page.has_more && <Button size="sm" variant="outline" disabled={loading} onClick={() => load(page.next_cursor)}>Load more reports</Button>}
  </section>;
}