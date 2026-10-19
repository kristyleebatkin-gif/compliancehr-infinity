import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ClipboardCheck, Download, Pencil } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Closed'];
const FREQUENCIES = ['Monthly', 'Quarterly', '6 Monthly', 'Annually', 'Ad hoc'];
const RATINGS = ['Low', 'Medium', 'High', 'Critical'];

const blank = {
  audit_id: '', audit_category: '', register_audited: '', audit_frequency: 'Quarterly', scheduled_months: '',
  audit_date_completed: '', auditor: '', audit_scope: '', framework_standard: 'NDIS Practice Standards',
  findings_identified: '', finding_reference: '', linked_improvement_action_id: '', risk_rating: 'Medium',
  corrective_actions_required: '', responsible_person: '', due_date: '', status: 'Scheduled',
  follow_up_date: '', outcome: '', approved_by: '', signoff_full_name: '', signoff_date: '',
};

const CSV_COLUMNS = [
  { key: 'audit_id', label: 'Audit ID' }, { key: 'audit_category', label: 'Category' },
  { key: 'register_audited', label: 'Register / File Audited' }, { key: 'audit_frequency', label: 'Frequency' },
  { key: 'scheduled_months', label: 'Scheduled Months' }, { key: 'audit_date_completed', label: 'Completed' },
  { key: 'auditor', label: 'Auditor' }, { key: 'framework_standard', label: 'Framework / Standard' },
  { key: 'findings_identified', label: 'Findings' }, { key: 'risk_rating', label: 'Risk Rating' },
  { key: 'corrective_actions_required', label: 'Corrective Actions' }, { key: 'responsible_person', label: 'Responsible Person' },
  { key: 'due_date', label: 'Due Date' }, { key: 'status', label: 'Status' }, { key: 'outcome', label: 'Outcome' },
  { key: 'signoff_full_name', label: 'Signed Off By' }, { key: 'signoff_date', label: 'Signed Off On' },
];

export default function InternalAuditRegister() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.InternalAudit.filter({}, { sort: '-created_date', limit: 100 });
      setAudits(page.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setEditingId(null); setForm(blank); setOpen(true); };
  const openEdit = (a) => { setEditingId(a.id); setForm({ ...blank, ...a }); setOpen(true); };

  const save = async () => {
    if (!form.audit_id.trim()) return;
    setSaving(true);
    try {
      if (editingId) await base44.entities.InternalAudit.update(editingId, form);
      else await base44.entities.InternalAudit.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete audit "${a.audit_id}"?`)) return;
    await base44.entities.InternalAudit.delete(a.id);
    await load();
  };

  const exportCsv = async () => {
    const rows = await fetchAllRecords(base44.entities.InternalAudit, {}, '-created_date');
    downloadCsv('internal-audit-register.csv', CSV_COLUMNS, rows);
  };

  const counts = { Scheduled: 0, 'In Progress': 0, Completed: 0 };
  audits.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status] += 1; });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums">{audits.length}</div><div className="text-xs text-muted-foreground">Total audits</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-primary">{counts.Scheduled}</div><div className="text-xs text-muted-foreground">Scheduled</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-warning">{counts['In Progress']}</div><div className="text-xs text-muted-foreground">In progress</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-safe">{counts.Completed}</div><div className="text-xs text-muted-foreground">Completed</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add audit</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? 'Edit internal audit' : 'New internal audit'}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Audit ID *</Label><Input value={form.audit_id} onChange={(e) => set('audit_id', e.target.value)} placeholder="IA-2026-01" /></div>
                <div className="grid gap-1.5"><Label>Category</Label><Input value={form.audit_category} onChange={(e) => set('audit_category', e.target.value)} placeholder="Governance, WHS, Files..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Register / file audited</Label><Input value={form.register_audited} onChange={(e) => set('register_audited', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Frequency</Label>
                  <Select value={form.audit_frequency} onValueChange={(v) => set('audit_frequency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Audit date completed</Label><Input type="date" value={form.audit_date_completed} onChange={(e) => set('audit_date_completed', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Auditor</Label><Input value={form.auditor} onChange={(e) => set('auditor', e.target.value)} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Audit scope</Label><Textarea rows={2} value={form.audit_scope} onChange={(e) => set('audit_scope', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Framework / standard</Label><Input value={form.framework_standard} onChange={(e) => set('framework_standard', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Risk rating</Label>
                  <Select value={form.risk_rating} onValueChange={(v) => set('risk_rating', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Findings identified</Label><Textarea rows={3} value={form.findings_identified} onChange={(e) => set('findings_identified', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Corrective actions required</Label><Textarea rows={2} value={form.corrective_actions_required} onChange={(e) => set('corrective_actions_required', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Responsible person</Label><Input value={form.responsible_person} onChange={(e) => set('responsible_person', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Outcome</Label><Input value={form.outcome} onChange={(e) => set('outcome', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Signed off by</Label><Input value={form.signoff_full_name} onChange={(e) => set('signoff_full_name', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Sign-off date</Label><Input type="date" value={form.signoff_date} onChange={(e) => set('signoff_date', e.target.value)} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.audit_id.trim()}>{editingId ? 'Save changes' : 'Save audit'}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export (CSV)</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : audits.length === 0 ? (
        <EmptyState icon={ClipboardCheck} modulePath="/compliance" title="No internal audits yet" message="Schedule your first internal audit — NDIS Practice Standards expect a recurring internal audit programme." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Audit</th>
                    <th className="px-3 py-2 font-medium">Register / File</th>
                    <th className="px-3 py-2 font-medium">Framework</th>
                    <th className="px-3 py-2 font-medium">Auditor</th>
                    <th className="px-3 py-2 font-medium">Completed</th>
                    <th className="px-3 py-2 font-medium">Rating</th>
                    <th className="px-3 py-2 font-medium">Responsible</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-3 py-2.5"><div className="font-medium">{a.audit_id}</div>{a.audit_category && <div className="text-xs text-muted-foreground">{a.audit_category}</div>}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.register_audited || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.framework_standard || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{a.auditor || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs tabular-nums">{a.audit_date_completed || '—'}</td>
                      <td className="px-3 py-2.5"><Badge className={statusTone(a.risk_rating)}>{a.risk_rating || '—'}</Badge></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{a.responsible_person || '—'}</td>
                      <td className="px-3 py-2.5"><Badge className={statusTone(a.status)}>{a.status}</Badge></td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(a)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}