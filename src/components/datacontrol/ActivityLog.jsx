import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Download, History, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';

const LIMIT = 50;

export default function ActivityLog() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (term = '') => {
    setLoading(true);
    try {
      const query = term.trim()
        ? { $or: [{ performed_by: { $regex: term.trim(), $options: 'i' } }, { entity_type: { $regex: term.trim(), $options: 'i' } }, { action: { $regex: term.trim(), $options: 'i' } }, { record_title: { $regex: term.trim(), $options: 'i' } }] }
        : {};
      const page = await base44.entities.AuditLog.filter(query, { sort: '-timestamp', limit: LIMIT });
      setRows(page.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = [];
      let cursor;
      do {
        const page = await base44.entities.AuditLog.filter({}, { sort: '-timestamp', limit: 500, cursor });
        all.push(...page.items);
        cursor = page.next_cursor;
      } while (cursor);
      const cols = ['timestamp', 'action', 'entity_type', 'record_id', 'record_title', 'performed_by', 'performed_by_email', 'performed_by_role', 'route', 'details'];
      const csv = [
        cols.join(','),
        ...all.map((r) => cols.map((c) => {
          const v = r[c] == null ? '' : String(r[c]);
          return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(',')),
      ].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Access-Activity-Log.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Activity log exported', description: `${all.length} access and action records.` });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-brand" />Access and action log</div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting}>
          {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}Export log
        </Button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by person, module, action or record..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => load(search)}>Search</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No access or action records yet. Page views and record actions are logged automatically.</p>
      ) : (
        <div className="max-h-64 overflow-auto rounded-lg border border-border/60">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted text-left">
              <tr>
                <th className="p-2 font-semibold">When</th>
                <th className="p-2 font-semibold">Action</th>
                <th className="p-2 font-semibold">Module</th>
                <th className="p-2 font-semibold">Record</th>
                <th className="p-2 font-semibold">By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="whitespace-nowrap p-2 text-muted-foreground">{r.timestamp ? format(new Date(r.timestamp), 'd MMM yyyy, h:mm a') : '-'}</td>
                  <td className="p-2 font-medium">{r.action}</td>
                  <td className="p-2">{r.entity_type}</td>
                  <td className="max-w-48 truncate p-2 text-muted-foreground">{r.record_title || r.record_id || '-'}</td>
                  <td className="p-2">{r.performed_by || r.performed_by_email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}