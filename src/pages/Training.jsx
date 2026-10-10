import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, GraduationCap, Award } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Mandatory', 'Compliance', 'Clinical', 'Professional Development', 'Induction'];
const tone = (s) => (s === 'Current' ? 'default' : s === 'Expiring Soon' ? 'secondary' : 'destructive');

export default function Training() {
  const [modules, setModules] = useState([]);
  const [certs, setCerts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mOpen, setMOpen] = useState(false);
  const [cOpen, setCOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mForm, setMForm] = useState({ title: '', module_code: '', description: '', category: 'Mandatory', duration_hours: '', validity_months: '', pass_mark: '', status: 'Active' });
  const [cForm, setCForm] = useState({ staff_name: '', module_title: '', issue_date: '', expiry_date: '', score: '', status: 'Current', issued_by: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c, s] = await Promise.all([
        base44.entities.TrainingModule.filter({ status: { $ne: 'Archived' } }, { sort: '-created_date', limit: 50 }),
        base44.entities.Certificate.filter({}, { sort: '-created_date', limit: 50 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
      ]);
      setModules(m.items);
      setCerts(c.items);
      setStaff(s.items.map((i) => i.full_name));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveModule = async () => {
    if (!mForm.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.TrainingModule.create({ ...mForm, duration_hours: Number(mForm.duration_hours) || undefined, validity_months: Number(mForm.validity_months) || undefined, pass_mark: Number(mForm.pass_mark) || undefined });
      setMForm({ title: '', module_code: '', description: '', category: 'Mandatory', duration_hours: '', validity_months: '', pass_mark: '', status: 'Active' });
      setMOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveCert = async () => {
    if (!cForm.staff_name || !cForm.module_title) return;
    setSaving(true);
    try {
      await base44.entities.Certificate.create({ ...cForm, score: Number(cForm.score) || undefined });
      setCForm({ staff_name: '', module_title: '', issue_date: '', expiry_date: '', score: '', status: 'Current', issued_by: '' });
      setCOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><GraduationCap className="h-6 w-6" /> Training Centre</h1>
        <p className="text-sm text-muted-foreground">Training modules and issued certificates.</p>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={mOpen} onOpenChange={setMOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add module</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New training module</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Module title *</Label><Input value={mForm.title} onChange={(e) => setMForm({ ...mForm, title: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Module code</Label><Input value={mForm.module_code} onChange={(e) => setMForm({ ...mForm, module_code: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Category</Label>
                      <Select value={mForm.category} onValueChange={(v) => setMForm({ ...mForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1.5"><Label>Description</Label><Textarea value={mForm.description} onChange={(e) => setMForm({ ...mForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-1.5"><Label>Duration (hrs)</Label><Input type="number" value={mForm.duration_hours} onChange={(e) => setMForm({ ...mForm, duration_hours: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Validity (months)</Label><Input type="number" value={mForm.validity_months} onChange={(e) => setMForm({ ...mForm, validity_months: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Pass mark (%)</Label><Input type="number" value={mForm.pass_mark} onChange={(e) => setMForm({ ...mForm, pass_mark: e.target.value })} /></div>
                  </div>
                  <Button onClick={saveModule} disabled={saving || !mForm.title.trim()}>Save module</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primar00" /></div>
          ) : modules.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No training modules yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-sm text-muted-foreground">{m.module_code || m.category}</p>
                      </div>
                      <Badge variant="outline">{m.category}</Badge>
                    </div>
                    {m.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.validity_months ? `Valid ${m.validity_months} months` : ''}</span>
                      <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.TrainingModule.delete(m.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={cOpen} onOpenChange={setCOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Issue certificate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue certificate</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Staff member *</Label>
                    <Select value={cForm.staff_name} onValueChange={(v) => setCForm({ ...cForm, staff_name: v })}>
                      <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                      <SelectContent>{staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Module title *</Label><Input value={cForm.module_title} onChange={(e) => setCForm({ ...cForm, module_title: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-1.5"><Label>Issue date</Label><Input type="date" value={cForm.issue_date} onChange={(e) => setCForm({ ...cForm, issue_date: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Expiry date</Label><Input type="date" value={cForm.expiry_date} onChange={(e) => setCForm({ ...cForm, expiry_date: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Score (%)</Label><Input type="number" value={cForm.score} onChange={(e) => setCForm({ ...cForm, score: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Issued by</Label><Input value={cForm.issued_by} onChange={(e) => setCForm({ ...cForm, issued_by: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Status</Label>
                      <Select value={cForm.status} onValueChange={(v) => setCForm({ ...cForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Current', 'Expiring Soon', 'Expired', 'Revoked'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={saveCert} disabled={saving || !cForm.staff_name || !cForm.module_title}>Issue certificate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primar00" /></div>
          ) : certs.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No certificates issued yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {certs.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2"><Award className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{c.module_title}</p>
                        <p className="text-sm text-muted-foreground">{c.staff_name}</p>
                      </div>
                      <Badge variant={tone(c.status)}>{c.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.expiry_date ? `Expires ${format(new Date(c.expiry_date), 'd MMM yyyy')}` : 'No expiry'}{c.score ? ` · Score ${c.score}%` : ''}</span>
                      <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Certificate.delete(c.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}