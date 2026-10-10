import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, FolderOpen, RefreshCw, UploadCloud, Eye } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import AttachedFormsLibrary from '@/components/documents/AttachedFormsLibrary';
import BulkUploadDocuments from '@/components/documents/BulkUploadDocuments';
import BusinessDocumentsLibrary from '@/components/documents/BusinessDocumentsLibrary';
import { EMPLOYEE_FILE_SECTIONS, EMPLOYEE_FORM_CODES, EMPLOYEE_FORM_FILES } from '@/lib/employeeDocuments';
import { PARTICIPANT_FILE_SECTIONS, PARTICIPANT_FORM_META, PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES } from '@/lib/participantDocuments';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];
const CATEGORIES = ['Mandatory', 'Compliance', 'Clinical', 'Professional Development', 'Induction'];

const expiryTone = (expiry) => {
  if (!expiry) return 'bg-muted text-foreground/60';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_url: '', file_uri: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        base44.entities.EmployeeDocument.filter({ status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 50 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
      ]);
      setDocs(d.items);
      setStaff(s.items.map((i) => i.full_name));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.EmployeeDocument.create(form);
      setForm({ title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_url: '', file_uri: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this document?')) return;
    await base44.entities.EmployeeDocument.delete(id);
    await load();
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((f) => ({ ...f, file_uri }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const viewDoc = async (doc) => {
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (doc.file_url) {
        window.open(doc.file_url, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runScan = async () => {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await base44.functions.invoke('complianceExpiryScan', {});
      const { documents, certificates } = res.data || {};
      setScanMsg(`Scan complete: ${documents.updated + certificates.updated} records updated`);
      await load();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><FolderOpen className="h-6 w-6" /> Document Vault</h1>
          <p className="text-sm text-muted-foreground">Employee documents and their expiry tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          {scanMsg && <span className="text-sm text-muted-foreground">{scanMsg}</span>}
          <Button variant="outline" onClick={runScan} disabled={scanning}>
            <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? 'animate-spin' : ''}`} /> Scan expiries
          </Button>
        </div>
        <BulkUploadDocuments staff={staff} onDone={load} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New employee document</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Employee</Label>
                <Select value={form.employee_name} onValueChange={(v) => setForm({ ...form, employee_name: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                  <SelectContent>{staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Document type</Label>
                  <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Current', 'Expiring Soon', 'Expired', 'Archived'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Document file (optional)</Label>
                <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm font-medium hover:bg-accent">
                  {uploading
                    ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    : <UploadCloud className="h-4 w-4" />}
                  {form.file_uri ? 'File attached' : 'Upload file'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.txt"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
                  />
                </label>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AttachedFormsLibrary
        title="Employee Forms Library"
        subtitle="Official employee onboarding forms - download templates or upload completed records"
        libraryKey="Employee"
        sections={EMPLOYEE_FILE_SECTIONS}
        formFiles={EMPLOYEE_FORM_FILES}
        formCodes={EMPLOYEE_FORM_CODES}
      />
      <AttachedFormsLibrary
        title="Participant Forms Library"
        subtitle="Official participant service forms - download templates or upload completed records"
        libraryKey="Participant"
        sections={PARTICIPANT_FILE_SECTIONS}
        formFiles={PARTICIPANT_FORM_FILES}
        formCodes={Object.fromEntries(Object.entries(PARTICIPANT_FORM_META).map(([key, meta]) => [key, meta.code]))}
        definitions={PARTICIPANT_FORM_DEFINITIONS}
      />
      <BusinessDocumentsLibrary />

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : docs.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No documents on file yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-sm text-muted-foreground">{d.employee_name || 'Unassigned'} · {d.document_type}</p>
                  </div>
                  <Badge className={expiryTone(d.expiry_date)}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.expiry_date ? `Expires ${format(new Date(d.expiry_date), 'd MMM yyyy')}` : 'No expiry'}</span>
                  <div className="flex items-center gap-1">
                    {(d.file_uri || d.file_url) && (
                      <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}