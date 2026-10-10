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
import { Plus, Trash2, FolderOpen, GraduationCap, Award } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];
const CATEGORIES = ['Mandatory', 'Compliance', 'Clinical', 'Professional Development', 'Induction'];

const expiryTone = (expiry) => {
  if (!expiry) return 'secondary';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'destructive';
  if (days <= 30) return 'secondary';
  return 'default';
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_url: '', notes: '' });

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
      setForm({ title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_url: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.EmployeeDocument.delete(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><FolderOpen className="h-6 w-6" /> Document Vault</h1>
          <p className="text-sm text-muted-foreground">Employee documents and their expiry tracking.</p>
        </div>
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
              <div className="grid gap-1.5"><Label>File URL (optional)</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>
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
                  <Badge variant={expiryTone(d.expiry_date)}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.expiry_date ? `Expires ${format(new Date(d.expiry_date), 'd MMM yyyy')}` : 'No expiry'}</span>
                  <Button variant="ghost" size="icon" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}