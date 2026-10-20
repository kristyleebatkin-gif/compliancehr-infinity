import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

const ROLES = ['admin', 'Provider Administrator', 'Administration', 'Compliance Manager', 'Team Leader', 'Finance & Accounts Officer', 'Human Resources Manager', 'Rostering Coordinator', 'Quality & Improvement Manager', 'CRM & Marketing Officer', 'Intake Officer'];
export default function TaskCompletionReports() {
  const [page, setPage] = useState({ items: [] });
  const [allowed, setAllowed] = useState(false);
  const [canTrack, setCanTrack] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async (cursor) => {
    setLoading(true);
    try {
      const next = await base44.entities.TaskCompletionReport.list({ sort: '-created_date', limit: 10, ...(cursor ? { cursor } : {}) });
      setPage((previous) => ({ ...next, items: cursor ? [...previous.items, ...next.items] : next.items }));
    } catch (failure) { setError(failure.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { base44.auth.me().then((user) => { setAllowed(ROLES.includes(user.role)); setCanTrack(['admin', 'Provider Administrator'].includes(user.role)); }); }, []);
  useEffect(() => {
    if (!allowed) return;
    const refresh = () => { load(); if (canTrack) base44.functions.invoke('taskCompletionReports', { mode: 'progress' }).then(({ data }) => setProgress(data)); };
    refresh();
    const reports = base44.entities.TaskCompletionReport.subscribe(refresh);
    const completions = canTrack ? base44.entities.TaskCompletionRecord.subscribe(refresh) : () => {};
    return () => { reports(); completions(); };
  }, [allowed, canTrack, load]);
  const download = async (report, kind) => {
    setBusy(`${report.id}-${kind}`); setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: report[`${kind}_file_uri`] });
      const response = await fetch(signed_url);
      if (!response.ok) throw new Error('Unable to download this report.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = `${report.title.replace(/[^a-z0-9-]/gi, '-')}.${kind}`; link.click(); URL.revokeObjectURL(url);
    } catch (failure) { setError(failure.message); } finally { setBusy(''); }
  };
  if (!allowed) return null;
  return <section aria-label="Saved completed task reports" className="space-y-2 rounded-xl border border-border bg-card p-3">
    <h3 className="text-sm font-semibold">Saved 30-task completion reports{progress && <span className="ml-2 text-xs text-muted-foreground">{progress.in_next_batch}/30 toward the next report</span>}</h3>
    <p className="text-xs text-muted-foreground">Each 30 newly completed tasks are saved as PDF and CSV reports, including tasks awaiting sign-off. Reopening or signing off a task does not count it twice.</p>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {page.items.map((report) => <div key={report.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
      <div className="min-w-0 flex-1"><p className="text-xs font-medium">{report.title}</p><p className="text-xs text-muted-foreground">{report.task_count} tasks · {new Date(report.created_date).toLocaleDateString('en-AU')}</p></div>
      {['pdf', 'csv'].map((kind) => <Button key={kind} size="sm" variant="outline" disabled={!!busy || !report[`${kind}_file_uri`]} onClick={() => download(report, kind)}>{busy === `${report.id}-${kind}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}{kind.toUpperCase()}</Button>)}
    </div>)}
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading saved reports...</p>}
    {!loading && !error && !page.items.length && <p className="text-xs text-muted-foreground">The first report will appear after 30 task completions from now.</p>}
    {page.has_more && <Button size="sm" variant="outline" disabled={loading} onClick={() => load(page.next_cursor)}>Load more reports</Button>}
  </section>;
}