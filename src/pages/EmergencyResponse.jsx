import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Siren } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Fire Evacuation', 'Lockdown', 'Medical Emergency', 'Natural Disaster', 'Other'];

export default function EmergencyResponse() {
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', drill_type: 'Fire Evacuation', date: '', location: '', attendees_count: '', outcome: 'Completed', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.EmergencyDrill.filter({}, { sort: '-date', limit: 50 });
      setDrills(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.EmergencyDrill.create({ ...form, attendees_count: Number(form.attendees_count) || undefined });
      setForm({ title: '', drill_type: 'Fire Evacuation', date: '', location: '', attendees_count: '', outcome: 'Completed', notes: '' });
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
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Siren className="h-6 w-6" /> Emergency Response</h1>
          <p className="text-sm text-muted-foreground">Drill history and emergency preparedness.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Log drill</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New emergency drill</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Drill type</Label>
                  <Select value={form.drill_type} onValueChange={(v) => setForm({ ...form, drill_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Participants</Label><Input type="number" value={form.attendees_count} onChange={(e) => setForm({ ...form, attendees_count: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Outcome</Label>
                  <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Completed', 'Partial', 'Issues Found'].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Log drill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : drills.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No drills logged yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {drills.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2"><Siren className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[d.drill_type, d.date ? format(new Date(d.date), 'd MMM yyyy') : '', d.location, d.attendees_count ? `${d.attendees_count} participants` : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusTone(d.outcome)}>{d.outcome}</Badge>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.EmergencyDrill.delete(d.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}