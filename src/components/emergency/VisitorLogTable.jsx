import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, Download, Loader2, LogOut, Plus, Trash2 } from 'lucide-react';
import { downloadChecklistPdf } from '@/lib/checklistsPdf';
import { EMERGENCY_TEMPLATES } from '@/lib/emergencyTemplates';
import { downloadCsv } from '@/lib/csvExport';
import { format } from 'date-fns';

export default function VisitorLogTable() {
  const { toast } = useToast();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ visitor_name: '', organisation: '', host: '', date: '', time_in: '', time_out: '', purpose: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.VisitorLog.filter({}, { sort: '-date', limit: 200 });
      setVisitors(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.visitor_name.trim() || !form.date) return;
    setSaving(true);
    try {
      await base44.entities.VisitorLog.create(form);
      setForm({ visitor_name: '', organisation: '', host: '', date: '', time_in: '', time_out: '', purpose: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const signOut = async (v) => {
    const now = format(new Date(), 'HH:mm');
    await base44.entities.VisitorLog.update(v.id, { time_out: now });
    await load();
    toast({ title: `${v.visitor_name} signed out at ${now}` });
  };

  const downloadSheet = () => {
    const t = EMERGENCY_TEMPLATES['Visitor Sign In / Out Sheet'];
    downloadChecklistPdf({
      title: 'Visitor Sign In / Out Sheet',
      code: t.code,
      subtitle: t.subtitle,
      columns: t.columns,
      rows: t.rows,
      signoffFields: ['Site', 'Date', 'Supervisor'],
    });
  };

  const exportCsv = () => {
    downloadCsv(
      'Visitor-Log.csv',
      [
        { key: 'date', label: 'Date' }, { key: 'visitor_name', label: 'Visitor' },
        { key: 'organisation', label: 'Organisation' }, { key: 'time_in', label: 'Sign In' },
        { key: 'time_out', label: 'Sign Out' }, { key: 'host', label: 'Host' },
        { key: 'purpose', label: 'Purpose' }, { key: 'notes', label: 'Notes' },
      ],
      visitors,
    );
    toast({ title: 'Visitor log exported' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Everyone entering the site signs in and signs out. Print a blank sheet for reception or record visits here.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadSheet}><Download className="mr-2 h-4 w-4" />Blank sign in / out sheet</Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={loading || visitors.length === 0}><ClipboardList className="mr-2 h-4 w-4" />Export CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Record visit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record a visitor</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Visitor name *</Label><Input value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Organisation</Label><Input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Sign in time</Label><Input placeholder="09:00" value={form.time_in} onChange={(e) => setForm({ ...form, time_in: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Sign out time</Label><Input placeholder="17:00" value={form.time_out} onChange={(e) => setForm({ ...form, time_out: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Host / visiting</Label><Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Purpose</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
                </div>
                <Button onClick={save} disabled={saving || !form.visitor_name.trim() || !form.date}>Record visit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : visitors.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No visits recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-3 py-2">Date</th><th className="px-3 py-2">Visitor</th><th className="px-3 py-2">Organisation</th>
                <th className="px-3 py-2">In</th><th className="px-3 py-2">Out</th><th className="px-3 py-2">Host</th>
                <th className="px-3 py-2">Purpose</th><th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} className="border-t border-border/60">
                  <td className="px-3 py-2 whitespace-nowrap">{v.date ? format(new Date(v.date), 'd MMM yyyy') : ''}</td>
                  <td className="px-3 py-2 font-medium">{v.visitor_name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{v.organisation}</td>
                  <td className="px-3 py-2">{v.time_in}</td>
                  <td className="px-3 py-2">{v.time_out || <Badge className="bg-warning/10 text-warning">On site</Badge>}</td>
                  <td className="px-3 py-2 text-muted-foreground">{v.host}</td>
                  <td className="px-3 py-2 text-muted-foreground">{v.purpose}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {!v.time_out && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => signOut(v)}><LogOut className="mr-1 h-3 w-3" />Sign out</Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.VisitorLog.delete(v.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}