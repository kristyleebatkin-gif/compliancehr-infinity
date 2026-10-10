import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';

import { statusTone } from '@/lib/statusStyles';

const tone = statusTone;

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', role: '', start_date: '', status: 'Onboarding', supervisor: '', weekly_hours: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Volunteer.filter({}, { sort: '-created_date', limit: 50 });
      setVolunteers(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Volunteer.create({ ...form, weekly_hours: Number(form.weekly_hours) || undefined });
      setForm({ full_name: '', role: '', start_date: '', status: 'Onboarding', supervisor: '', weekly_hours: '', notes: '' });
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
          <h1 className="flex items-center gap-2 text-2xl font-bold"><HeartHandshake className="h-6 w-6" /> Volunteer Placements</h1>
          <p className="text-sm text-muted-foreground">Volunteers, their roles and placements.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add volunteer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New volunteer</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Supervisor</Label><Input value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Onboarding', 'Active', 'Inactive'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Weekly hours</Label><Input type="number" value={form.weekly_hours} onChange={(e) => setForm({ ...form, weekly_hours: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.full_name.trim()}>Save volunteer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : volunteers.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No volunteers yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {volunteers.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2"><HeartHandshake className="h-5 w-5 text-muted-foreground" /></div>
                    <div>
                      <p className="font-semibold">{v.full_name}</p>
                      <p className="text-sm text-muted-foreground">{v.role}{v.supervisor ? ` · Sup: ${v.supervisor}` : ''}</p>
                    </div>
                  </div>
                  <Badge className={statusTone(v.status)}>{v.status}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {[v.start_date ? `Started ${format(new Date(v.start_date), 'd MMM yyyy')}` : '', v.weekly_hours != null ? `${v.weekly_hours} hrs/week` : ''].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-2 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Volunteer.delete(v.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}