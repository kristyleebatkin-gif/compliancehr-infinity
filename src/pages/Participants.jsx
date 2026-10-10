import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Trash2, Heart } from 'lucide-react';

const tone = (s) => (s === 'Active' ? 'default' : s === 'On Hold' ? 'secondary' : 'destructive');

export default function Participants() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', date_of_birth: '', ndis_number: '', support_coordinator: '', status: 'Active', notes: '' });

  const load = useCallback(async (term) => {
    setLoading(true);
    try {
      const query = term ? { full_name: { $regex: term, $options: 'i' } } : {};
      const page = await base44.entities.ParticipantProfile.filter(query, { sort: '-created_date', limit: 50 });
      setPeople(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(search); }, [load, search]);

  const save = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.ParticipantProfile.create(form);
      setForm({ full_name: '', email: '', phone: '', address: '', date_of_birth: '', ndis_number: '', support_coordinator: '', status: 'Active', notes: '' });
      setOpen(false);
      await load(search);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.ParticipantProfile.delete(id);
    await load(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Heart className="h-6 w-6" /> Participant Profiles</h1>
          <p className="text-sm text-muted-foreground">People you support and their details.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add participant</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New participant</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>NDIS number</Label><Input value={form.ndis_number} onChange={(e) => setForm({ ...form, ndis_number: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Support coordinator</Label><Input value={form.support_coordinator} onChange={(e) => setForm({ ...form, support_coordinator: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Active', 'On Hold', 'Inactive'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.full_name.trim()}>Save participant</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search participants" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : people.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No participants yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.full_name}</p>
                    <p className="text-sm text-muted-foreground">{p.ndis_number ? `NDIS ${p.ndis_number}` : 'No NDIS number'}</p>
                  </div>
                  <Badge variant={tone(p.status)}>{p.status}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {p.phone && <p>{p.phone}</p>}
                  {p.support_coordinator && <p>Coordinator: {p.support_coordinator}</p>}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}