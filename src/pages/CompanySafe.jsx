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
import { Plus, Trash2, Lock, IdCard, Building2, FolderLock } from 'lucide-react';
import { format } from 'date-fns';
import BusinessIdentityCard from '@/components/safe/BusinessIdentityCard';
import BusinessDetailsCard from '@/components/safe/BusinessDetailsCard';
import ComplianceUploads from '@/components/safe/ComplianceUploads';
import StaffBadgeCreator from '@/components/safe/StaffBadgeCreator';

const CATEGORIES = ['Policies', 'Templates', 'Certificates', 'Registrations', 'Licences', 'Financial', 'Other'];

export default function CompanySafe() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other', version: '', owner: '', review_date: '', status: 'Current', file_url: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.CompanyDocument.filter({ status: { $ne: 'Archived' } }, { sort: '-created_date', limit: 50 });
      setDocs(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.CompanyDocument.create(form);
      setForm({ name: '', category: 'Other', version: '', owner: '', review_date: '', status: 'Current', file_url: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Lock className="h-6 w-6" /> Company Safe</h1>
          <p className="text-sm text-muted-foreground">Central register of organisational documents, certificates and licences.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New company document</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Current', 'Review Required', 'Archived'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>File URL</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.name.trim()}>Save document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60"><Building2 className="h-4 w-4" />Business identity</div>
        <BusinessIdentityCard />
        <BusinessDetailsCard />
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60"><FolderLock className="h-4 w-4" />Compliance &amp; business documents</div>
        <ComplianceUploads />
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60"><IdCard className="h-4 w-4" />Staff badges</div>
        <StaffBadgeCreator />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : docs.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No documents in the safe yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2"><Lock className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{d.name}{d.version ? ` (v${d.version})` : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {[d.category, d.owner, d.review_date ? `Review ${format(new Date(d.review_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open file</a>}
                  <Badge className={statusTone(d.status)}>{d.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.CompanyDocument.delete(d.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}