import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Download, FileDown, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { breachCsvRows, downloadBreachRecordPdf, downloadBreachResponsePlan } from '@/lib/dataBreachPdf';

const STATUSES = ['Identified', 'Contained', 'Assessing Notifiability', 'OAIC Notified', 'Individuals Notified', 'Remediation Underway', 'Resolved', 'Closed'];
const EMPTY_FORM = {
  title: '', breach_id: '', detected_date: '', detected_by: '', description: '', data_types: '',
  individuals_affected: '', severity: 'Medium', status: 'Identified', is_notifiable: false,
  assessment_notes: '', containment_actions: '', remediation_actions: '', lessons_learned: '',
};

export default function BreachRegister() {
  const { toast } = useToast();
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notifying, setNotifying] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.DataBreach.filter({}, { sort: '-detected_date', limit: 100 });
      setBreaches(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (b) => {
    setEditingId(b.id);
    setForm({ ...EMPTY_FORM, ...b, individuals_affected: b.individuals_affected ?? '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const data = { ...form, individuals_affected: form.individuals_affected === '' ? null : Number(form.individuals_affected) };
      if (editingId) await base44.entities.DataBreach.update(editingId, data);
      else await base44.entities.DataBreach.create(data);
      setOpen(false);
      await load();
      toast({ title: editingId ? 'Breach record updated' : 'Breach logged', description: 'The breach notification log has been updated.' });
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    downloadCsv('Data-Breach-Log.csv', Object.keys(breachCsvRows([{}])[0]).map((key) => ({ key, label: key })), breachCsvRows(breaches));
    toast({ title: 'Breach log exported' });
  };

  const notifyManagers = async (breach) => {
    setNotifying(breach.id);
    try {
      const users = await base44.entities.User.list();
      const admins = users.filter((u) => u.role === 'admin' && u.email);
      if (admins.length === 0) {
        toast({ title: 'No managers to notify', description: 'No admin users found to email.', variant: 'destructive' });
        return;
      }
      const body = [
        `DATA BREACH NOTIFICATION - ${breach.title}`,
        breach.breach_id ? `Reference: ${breach.breach_id}` : '',
        breach.detected_date ? `Detected: ${format(new Date(breach.detected_date), 'd MMM yyyy')}` : '',
        breach.detected_by ? `Reported by: ${breach.detected_by}` : '',
        breach.severity ? `Severity: ${breach.severity}` : '',
        `Status: ${breach.status}`,
        breach.is_notifiable ? 'Assessed as NOTIFIABLE under the Notifiable Data Breaches scheme.' : 'Assessed as not notifiable.',
        '',
        `Description: ${breach.description || '-'}`,
        `Data involved: ${breach.data_types || '-'}`,
        `Individuals affected: ${breach.individuals_affected ?? '-'}`,
        '',
        `Containment actions: ${breach.containment_actions || '-'}`,
        'Please review this breach in Data Control and follow the Data Breach Response Plan.',
      ].filter(Boolean).join('\n').slice(0, 5000);
      let failed = 0;
      for (const admin of admins) {
        try {
          const res = await base44.functions.invoke('sendAppEmail', { to: admin.email, subject: `Data breach notification: ${breach.title}`, body });
          if (res.data?.error) failed += 1;
        } catch { failed += 1; }
      }
      await base44.entities.DataBreach.update(breach.id, {
        management_notified_at: new Date().toISOString(),
        management_notified_to: admins.map((a) => a.email).join(', '),
      });
      await load();
      if (failed === 0) toast({ title: 'Breach notification sent', description: `Emailed ${admins.length} manager${admins.length === 1 ? '' : 's'}.` });
      else toast({ title: 'Partly sent', description: `${admins.length - failed} sent, ${failed} failed.` });
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Log a data breach</Button>
          <Button variant="outline" onClick={downloadBreachResponsePlan}><FileDown className="mr-2 h-4 w-4" />Download response plan</Button>
          <Button variant="outline" onClick={exportCsv} disabled={loading || breaches.length === 0}><Download className="mr-2 h-4 w-4" />Export breach log</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : breaches.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No data breaches logged. Log any suspected breach above — it stays in the notification log even if later assessed as not notifiable.</p>
      ) : (
        <div className="space-y-3">
          {breaches.map((b) => (
            <div key={b.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <button className="min-w-0 flex-1 text-left" onClick={() => openEdit(b)}>
                  <p className="font-semibold">{b.breach_id ? `${b.breach_id} · ` : ''}{b.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {[b.detected_date ? format(new Date(b.detected_date), 'd MMM yyyy') : '', b.severity, b.individuals_affected != null ? `${b.individuals_affected} affected` : '', b.data_types].filter(Boolean).join(' · ')}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className={statusTone(b.status)}>{b.status}</Badge>
                  {b.is_notifiable && <Badge variant="destructive">Notifiable</Badge>}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.DataBreach.delete(b.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              {b.description && <p className="mt-1.5 text-sm text-muted-foreground">{b.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={notifying === b.id} onClick={() => notifyManagers(b)}>
                  {notifying === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}Notify managers
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadBreachRecordPdf(b)}>
                  <Download className="h-3 w-3" />Breach record PDF
                </Button>
                {b.management_notified_at && <span className="text-xs text-muted-foreground">Managers notified {format(new Date(b.management_notified_at), 'd MMM yyyy, h:mm a')}</span>}
                {b.oaic_notified_at && <span className="text-xs text-muted-foreground">OAIC notified {b.oaic_reference ? `(ref ${b.oaic_reference})` : ''}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit breach record' : 'Log a data breach'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Breach ID</Label><Input value={form.breach_id} onChange={(e) => setForm({ ...form, breach_id: e.target.value })} placeholder="DB-2026-001" /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Date detected</Label><Input type="date" value={form.detected_date} onChange={(e) => setForm({ ...form, detected_date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Detected / reported by</Label><Input value={form.detected_by} onChange={(e) => setForm({ ...form, detected_by: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Individuals affected</Label><Input type="number" min="0" value={form.individuals_affected} onChange={(e) => setForm({ ...form, individuals_affected: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Low', 'Medium', 'High', 'Critical'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Description of breach</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Types of data involved</Label><Input value={form.data_types} onChange={(e) => setForm({ ...form, data_types: e.target.value })} placeholder="e.g. contact details, NDIS numbers, health records" /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form.is_notifiable)} onChange={(e) => setForm({ ...form, is_notifiable: e.target.checked })} />
              Assessed as notifiable under the Notifiable Data Breaches scheme
            </label>
            <div className="grid gap-1.5"><Label>Notifiability assessment notes</Label><Textarea rows={2} value={form.assessment_notes} onChange={(e) => setForm({ ...form, assessment_notes: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Containment actions</Label><Textarea rows={2} value={form.containment_actions} onChange={(e) => setForm({ ...form, containment_actions: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Remediation actions</Label><Textarea rows={2} value={form.remediation_actions} onChange={(e) => setForm({ ...form, remediation_actions: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Lessons learned / prevention</Label><Textarea rows={2} value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{editingId ? 'Save changes' : 'Log breach'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}