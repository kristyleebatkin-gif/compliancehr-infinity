import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeStatus } from '@/lib/statusLog';
import { downloadCsv } from '@/lib/csvExport';
import { AUDIT_AREA_OPTIONS } from '@/lib/auditSchedule';
import ReviewSchedule from '@/components/audit/ReviewSchedule';
import NdisAudits from '@/components/audit/NdisAudits';
import AuditActions from '@/components/audit/AuditActions';
import AuditChecklistLibrary from '@/components/audit/AuditChecklistLibrary';
import AuditCalendar from '@/components/audit/AuditCalendar';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { format } from 'date-fns';
import { Plus, Trash2, ClipboardCheck, Download, History, Upload, FileDown, Loader2, Pencil } from 'lucide-react';

const STATUSES = ['Scheduled', 'In Progress', 'Complete', 'Follow-up Required'];
const AUDIT_TYPES = ['Internal', 'NDIS Verification', 'NDIS Certification', 'NDIS Mid-term', 'Other'];
const EMPTY = { title: '', audit_area: 'Participant Files', audit_type: 'Internal', date: '', auditor: '', status: 'Scheduled', score: '', findings: '', actions: '' };

/**
 * Audit Centre merged into the Compliance & Report Centre as a tab.
 * Corrective actions recorded on completed internal audits are
 * automatically added to the continuous improvement register.
 */
export default function AuditsTab() {
  const { toast } = useToast();
  const { user } = useRole();
  const [audits, setAudits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [auditPage, logPage] = await Promise.all([
        base44.entities.Audit.filter({}, { sort: '-date', limit: 300 }),
        base44.entities.StatusLog.filter({ entity_type: { $in: ['Audit', 'AuditAction'] } }, { sort: '-created_date', limit: 300 }),
      ]);
      setAudits(auditPage.items);
      setLogs(logPage.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCorrectiveActionsToImprovement = async (audit) => {
    if (audit.status !== 'Complete' && audit.status !== 'Follow-up Required') return;
    if (!String(audit.actions || '').trim()) return;
    const existing = await base44.entities.QualityItem.filter({ source: `Internal audit - ${audit.title}` }, { limit: 100 });
    const lines = audit.actions.split('\n').map((line) => line.trim()).filter(Boolean);
    const missing = lines.filter((line) => !existing.items.some((item) => item.title === line));
    if (!missing.length) return;
    await base44.entities.QualityItem.bulkCreate(missing.map((line) => ({
      title: line,
      type: 'Corrective Action',
      description: `Corrective action found in audit "${audit.title}"${audit.audit_area ? ` (${audit.audit_area})` : ''}.`,
      source: `Internal audit - ${audit.title}`,
      raised_by: user?.full_name || user?.email || 'Audit Centre',
      raised_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'New',
      priority: audit.status === 'Follow-up Required' ? 'High' : 'Medium',
    })));
    toast({ title: `${missing.length} corrective action(s) added to the continuous improvement register` });
  };

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title || '', audit_area: a.audit_area || 'Other', audit_type: a.audit_type || 'Internal', date: a.date || '', auditor: a.auditor || '', status: a.status, score: a.score ?? '', findings: a.findings || '', actions: a.actions || '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, score: form.score === '' ? undefined : Number(form.score) };
      const saved = editing
        ? { ...editing, ...(await (async () => { await base44.entities.Audit.update(editing.id, payload); return payload; })()) }
        : await base44.entities.Audit.create(payload);
      setOpen(false);
      await load();
      await addCorrectiveActionsToImprovement({ ...saved, title: saved.title || form.title, status: form.status, actions: form.actions, audit_area: form.audit_area });
      toast({ title: editing ? 'Audit updated' : 'Audit created' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (a, status) => {
    if (status === a.status) return;
    await changeStatus({ entityType: 'Audit', entity: 'Audit', record: a, toStatus: status });
    await addCorrectiveActionsToImprovement({ ...a, status });
    await load();
  };

  const uploadToAudit = async (audit, field, file) => {
    if (!file) return;
    setUploading(audit.id + field);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Audit.update(audit.id, { [`${field}_uri`]: file_uri, [`${field}_name`]: file.name });
      await load();
      toast({ title: 'File stored securely' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  const downloadFile = async (uri) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Could not open file', description: error.message, variant: 'destructive' });
    }
  };

  const exportRegister = () => {
    downloadCsv('audit-register.csv', [
      { key: 'title', label: 'Title' }, { key: 'audit_area', label: 'Audit Area' }, { key: 'audit_type', label: 'Audit Type' },
      { key: 'date', label: 'Date' }, { key: 'auditor', label: 'Auditor' }, { key: 'status', label: 'Status' },
      { key: 'score', label: 'Score (%)' }, { key: 'findings', label: 'Findings' }, { key: 'actions', label: 'Corrective Actions' },
      { key: 'status_log', label: 'Status History' },
    ], audits.map((a) => ({ ...a, findings: a.findings || '', actions: a.actions || '', status_log: a.status_log || '', score: a.score ?? '' })));
    toast({ title: 'Audit register exported' });
  };

  const exportLog = () => {
    downloadCsv('audit-status-log.csv', [
      { key: 'entity_type', label: 'Module' }, { key: 'record_title', label: 'Record' },
      { key: 'from_status', label: 'From' }, { key: 'to_status', label: 'To' },
      { key: 'changed_by', label: 'Changed By' }, { key: 'created_date', label: 'Changed At' },
      { key: 'notes', label: 'Notes' },
    ], logs.map((l) => ({ ...l, notes: l.notes || '' })));
    toast({ title: 'Audit status log exported' });
  };

  const completed = audits.filter((a) => a.status === 'Complete' || a.status === 'Follow-up Required');

  return (
    <div className="space-y-2">
      <div className="module-action-bar flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRegister}><Download className="mr-2 h-4 w-4" />Export register</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New audit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit audit' : 'New audit'}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Audit area</Label>
                    <Select value={form.audit_area} onValueChange={(v) => setForm({ ...form, audit_area: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{AUDIT_AREA_OPTIONS.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Audit type</Label>
                    <Select value={form.audit_type} onValueChange={(v) => setForm({ ...form, audit_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{AUDIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Auditor</Label><Input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Score (%)</Label><Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Findings</Label><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Corrective actions</Label><Textarea value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} /></div>
                <Button onClick={save} disabled={saving || !form.title.trim()}>Save audit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="h-auto flex-wrap gap-1 rounded-2xl border border-border/60 bg-muted/50 p-1 shadow-sm">
          <TabsTrigger value="dashboard" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-400 data-[state=active]:text-white">Dashboard</TabsTrigger>
          <TabsTrigger value="audits" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-400 data-[state=active]:text-white">Audit register</TabsTrigger>
          <TabsTrigger value="actions" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-400 data-[state=active]:text-white">Actions</TabsTrigger>
          <TabsTrigger value="checklists" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-400 data-[state=active]:text-white">Checklists</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-orange-400 data-[state=active]:text-white">Calendar</TabsTrigger>
          <TabsTrigger value="log" className="rounded-lg px-2.5 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-400 data-[state=active]:text-white">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-2 space-y-4">
          <ReviewSchedule audits={audits} />
          <NdisAudits audits={audits} />
        </TabsContent>

        <TabsContent value="audits" className="mt-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : audits.length === 0 ? (
            <Card><CardContent className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-5 w-5" /></div>
              <p className="font-semibold">No audits recorded yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Audits track compliance reviews, their scores and the corrective actions they raise.</p>
              <Button className="mt-2" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New audit</Button>
            </CardContent></Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60 shadow-panel">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5 font-semibold">Audit</th>
                    <th className="px-3 py-2.5 font-semibold">Area</th>
                    <th className="px-3 py-2.5 font-semibold">Date</th>
                    <th className="px-3 py-2.5 font-semibold">Auditor</th>
                    <th className="px-3 py-2.5 text-right font-semibold tabular-nums">Score</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-3 py-2.5 font-semibold">Evidence</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
              <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2.5">
                  <button className="text-left font-semibold hover:underline" onClick={() => openEdit(a)}>{a.title}</button>
                  <div className="text-xs text-muted-foreground">{a.audit_type || 'Internal'}</div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.audit_area || '-'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{a.date ? format(new Date(a.date), 'd MMM yyyy') : '-'}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{a.auditor || '-'}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{a.score != null ? `${a.score}%` : '-'}</td>
                <td className="px-3 py-2.5"><Badge className={statusTone(a.status)}>{a.status}</Badge></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {a.checklist_file_uri && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={a.checklist_file_name} onClick={() => downloadFile(a.checklist_file_uri)}><FileDown className="h-3.5 w-3.5" /></Button>
                    )}
                    {a.report_file_uri && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={a.report_file_name} onClick={() => downloadFile(a.report_file_uri)}><FileDown className="h-3.5 w-3.5" /></Button>
                    )}
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" onChange={(e) => uploadToAudit(a, 'checklist_file', e.target.files?.[0])} />
                      <span title="Upload checklist" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
                        {uploading === a.id + 'checklist_file' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      </span>
                    </label>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Select value={a.status} onValueChange={(v) => setStatus(a, v)}>
                      <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete" onClick={async () => { if (confirm('Delete this audit?')) { await base44.entities.Audit.delete(a.id); await load(); } }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="mt-2">
          <AuditActions audits={audits} />
        </TabsContent>

        <TabsContent value="checklists" className="mt-2">
          <AuditChecklistLibrary />
        </TabsContent>

        <TabsContent value="calendar" className="mt-2">
          <AuditCalendar audits={audits} />
        </TabsContent>

        <TabsContent value="log" className="mt-2 space-y-4">
          <Card>
            <CardContent className="p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#6d28d9]" />
                  <p className="font-semibold">Completed audits - full details</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportRegister}><Download className="mr-2 h-4 w-4" />Export</Button>
              </div>
              {completed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No audits completed yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-3">Audit</th><th className="py-2 pr-3">Area</th><th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Auditor</th><th className="py-2 pr-3">Score</th><th className="py-2 pr-3">Findings</th><th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completed.map((a) => (
                        <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 align-top">
                          <td className="py-2 pr-3 font-medium">{a.title}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{a.audit_area || '-'}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{a.date ? format(new Date(a.date), 'd MMM yyyy') : '-'}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{a.auditor || '-'}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{a.score != null ? `${a.score}%` : '-'}</td>
                          <td className="max-w-48 py-2 pr-3 text-muted-foreground">{a.findings || '-'}</td>
                          <td className="max-w-48 py-2 text-muted-foreground">{a.actions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-semibold">Every status change (audits and actions)</p>
                <Button variant="outline" size="sm" onClick={exportLog}><Download className="mr-2 h-4 w-4" />Export log</Button>
              </div>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-3">Module</th><th className="py-2 pr-3">Record</th><th className="py-2 pr-3">From</th>
                        <th className="py-2 pr-3">To</th><th className="py-2 pr-3">Changed By</th><th className="py-2">Changed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="py-2 pr-3 text-muted-foreground">{l.entity_type}</td>
                          <td className="py-2 pr-3 font-medium">{l.record_title}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{l.from_status || '-'}</td>
                          <td className="py-2 pr-3">{l.to_status}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{l.changed_by}</td>
                          <td className="py-2 text-muted-foreground">{format(new Date(l.created_date), 'd MMM yyyy HH:mm')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}