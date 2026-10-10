import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Users } from 'lucide-react';

const ROLES = ['Support Worker', 'Team Leader', 'Compliance Manager', 'Administration', 'Management'];
const STATUSES = ['Active', 'On Leave', 'Inactive'];

const statusTone = (s) => (s === 'Active' ? 'default' : s === 'On Leave' ? 'secondary' : 'destructive');

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', position: '', role: 'Support Worker', status: 'Active', start_date: '', supervisor: '', emergency_contact: '' });

  const load = useCallback(async (term) => {
    setLoading(true);
    try {
      const query = term ? { full_name: { $regex: term, $options: 'i' } } : {};
      const page = await base44.entities.StaffProfile.filter(query, { sort: '-created_date', limit: 50 });
      setStaff(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(search); }, [load, search]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.StaffProfile.create(form);
      setForm({ full_name: '', email: '', phone: '', position: '', role: 'Support Worker', status: 'Active', start_date: '', supervisor: '', emergency_contact: '' });
      setOpen(false);
      await load(search);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.StaffProfile.delete(id);
    await load(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6" /> Staff Profiles</h1>
          <p className="text-sm text-muted-foreground">Your team members and their compliance roles.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add staff member</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New staff member</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => set('full_name')(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Role</Label>
                  <Select value={form.role} onValueChange={set('role')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={set('status')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Position</Label><Input value={form.position} onChange={(e) => set('position')(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => set('start_date')(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Supervisor</Label><Input value={form.supervisor} onChange={(e) => set('supervisor')(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Emergency contact</Label><Input value={form.emergency_contact} onChange={(e) => set('emergency_contact')(e.target.value)} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.full_name.trim()}>Save staff member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search staff by name" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : staff.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No staff members found. Add your first one above.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.full_name}</p>
                    <p className="text-sm text-muted-foreground">{s.position || s.role}</p>
                  </div>
                  <Badge variant={statusTone(s.status)}>{s.status}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {s.email && <p>{s.email}</p>}
                  {s.phone && <p>{s.phone}</p>}
                  <p>Role: {s.role}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}