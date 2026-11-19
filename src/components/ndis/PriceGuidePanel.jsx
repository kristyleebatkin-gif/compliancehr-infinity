import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

// Reads a CSV file (the NDIS Support Catalogue saved as CSV) into objects keyed by its header row.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headerIndex = rows.findIndex((r) => r.some((c) => /support item number/i.test(c)));
  if (headerIndex < 0) return [];
  const headers = rows[headerIndex].map((h) => h.trim());
  return rows.slice(headerIndex + 1)
    .filter((r) => r.some((c) => String(c).trim()))
    .map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ''])));
}

const fmt = (v) => (v === null || v === undefined ? '—' : `$${Number(v).toFixed(2)}`);
const STATUS_TONE = { Active: 'bg-emerald-100 text-emerald-800', Imported: 'bg-amber-100 text-amber-900', Superseded: 'bg-slate-100 text-slate-700', Rejected: 'bg-rose-100 text-rose-800' };

export default function PriceGuidePanel() {
  const { toast } = useToast();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [busy, setBusy] = useState('');
  const [preview, setPreview] = useState(null);

  const call = async (payload) => {
    const res = await base44.functions.invoke('priceGuide', payload);
    if (res?.data?.error) throw new Error(res.data.error);
    return res?.data || {};
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setReleases((await call({ action: 'list' })).releases || []); }
    catch (e) { toast({ title: 'Price guide unavailable', description: e?.response?.data?.error || e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const importFile = async () => {
    if (!file || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) {
      toast({ title: 'Choose the CSV file and the date the new prices start', variant: 'destructive' });
      return;
    }
    setBusy('import');
    try {
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error('No "Support Item Number" column found. Save the NDIS Support Catalogue as CSV and try again.');
      const out = await call({ action: 'import', effective_from: effectiveFrom, title: file.name.replace(/\.csv$/i, ''), rows });
      toast({ title: 'Catalogue imported', description: `${out.item_count} support items loaded. Check the impact preview, then approve.` });
      setFile(null);
      await load();
      await showPreview(out.release.id);
    } catch (e) {
      toast({ title: 'Import failed', description: e?.response?.data?.error || e.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const showPreview = async (releaseId) => {
    setBusy(`preview-${releaseId}`);
    try { setPreview(await call({ action: 'preview', release_id: releaseId })); }
    catch (e) { toast({ title: 'Preview failed', description: e?.response?.data?.error || e.message, variant: 'destructive' }); }
    finally { setBusy(''); }
  };

  const approve = async () => {
    if (!preview?.release) return;
    if (!window.confirm(`Apply "${preview.release.title}" from ${preview.release.effective_from}? ${preview.summary.shifts_to_reprice} future shifts will be re-priced. Invoiced shifts and sent invoices will not change.`)) return;
    setBusy('apply');
    try {
      await call({ action: 'apply', release_id: preview.release.id, confirm: true });
      toast({ title: 'Price guide applied', description: 'New prices are active and the change is in the audit log.' });
      setPreview(null);
      await load();
    } catch (e) {
      toast({ title: 'Not applied', description: e?.response?.data?.error || e.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const active = releases.find((r) => r.status === 'Active');

  return (
    <div className="space-y-3">
      <Card className="ndis-panel">
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="font-semibold">NDIS price guide</p>
            <p className="text-xs text-muted-foreground">
              {active ? `Active: ${active.title} (from ${active.effective_from}, ${active.item_count || 0} items).` : 'No price guide is active yet, so shifts cannot be priced automatically.'}
              {' '}Queensland prices are used. New prices apply only from their start date; invoiced shifts and sent or claimed invoices never change.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold">Support Catalogue (CSV)
              <Input type="file" accept=".csv,text/csv" className="mt-1 h-9 w-64 text-xs" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <label className="text-xs font-semibold">Prices start on
              <Input type="date" className="mt-1 h-9 w-40 text-xs" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </label>
            <Button size="sm" onClick={importFile} disabled={busy === 'import'}>
              {busy === 'import' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Import
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Download the catalogue from ndis.gov.au (Pricing Arrangements), open it in Excel and use File &rarr; Save As &rarr; CSV.</p>
        </CardContent>
      </Card>

      <Card className="ndis-panel">
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-semibold">Releases</p>
          {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : releases.length === 0 ? (
            <p className="text-xs text-muted-foreground">No catalogue has been imported yet.</p>
          ) : (
            <ul className="divide-y">
              {releases.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">From {r.effective_from}{r.effective_to ? ` to ${r.effective_to}` : ''} · {r.item_count || 0} items · imported by {r.imported_by || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[r.status] || STATUS_TONE.Superseded}`}>{r.status}</span>
                    {r.status === 'Imported' && (
                      <Button size="sm" variant="outline" onClick={() => showPreview(r.id)} disabled={busy === `preview-${r.id}`}>
                        {busy === `preview-${r.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}Impact preview
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {preview && (
        <Card className="ndis-panel border-amber-300">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-600" />Impact preview: {preview.release.title}</p>
                <p className="text-xs text-muted-foreground">
                  {preview.summary.first_release ? 'This is the first price guide, so nothing is being replaced. ' : `Replaces ${preview.current_release?.title}. `}
                  {preview.summary.increases} increases · {preview.summary.decreases} decreases · {preview.summary.new_items} new · {preview.summary.removed_items} removed · <strong>{preview.summary.shifts_to_reprice} future shifts re-priced</strong>
                </p>
              </div>
              <Button size="sm" onClick={approve} disabled={busy === 'apply'}>
                {busy === 'apply' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Approve &amp; apply
              </Button>
            </div>
            {preview.shifts?.length > 0 && (
              <div className="overflow-x-auto">
                <p className="mb-1 text-xs font-semibold">Shifts that will change</p>
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">Date</th><th>Participant</th><th>Item</th><th>Now</th><th>New</th></tr></thead>
                  <tbody>{preview.shifts.map((s) => <tr key={s.shift_id} className="border-t"><td className="py-1">{s.date}</td><td>{s.participant_name}</td><td>{s.support_item_number}</td><td>{fmt(s.old_rate)}</td><td className="font-semibold">{fmt(s.new_rate)}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            {preview.changes?.filter((c) => c.change === 'increase' || c.change === 'decrease').length > 0 && (
              <div className="max-h-72 overflow-auto">
                <p className="mb-1 text-xs font-semibold">Price changes</p>
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">Item</th><th>Name</th><th>Old</th><th>New</th></tr></thead>
                  <tbody>{preview.changes.filter((c) => c.change === 'increase' || c.change === 'decrease').map((c) => (
                    <tr key={c.support_item_number} className="border-t"><td className="py-1">{c.support_item_number}</td><td className="max-w-xs truncate">{c.support_item_name}</td><td>{fmt(c.old_price)}</td><td className={c.change === 'increase' ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{fmt(c.new_price)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
