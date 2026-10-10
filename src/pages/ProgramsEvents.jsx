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
import { Plus, Trash2, PartyPopper, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Planned', 'Ongoing', 'Completed', 'Cancelled'];
const NEXT = { Planned: 'Ongoing', Ongoing: 'Completed', Completed: 'Cancelled', Cancelled: 'Planned' };
const tone = (s) => (s === 'Planned' || s === 'Ongoing' ? 'default' : s === 'Completed' ? 'secondary' : 'destructive');

export default function ProgramsEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Program', date: '', location: '', description: '', attendees: '', status: 'Planned' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Event.filter({}, { sort: '-date', limit: 50 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Event.create(form);
      setForm({ title: '', type: 'Program', date: '', location: '', description: '', attendees: '', status: 'Planned' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (item) => {
    await base44.entities.Event.update(item.id, { status: NEXT[item.status] });
    await load();
  };

  const List = ({ type }) => {
    const filtered = items.filter((i) => i.type === type);
    if (filtered.length === 0) {
      return <Card><CardContent className="p-10 text-center text-muted-foreground">Nothing here yet.</CardContent></Card>;
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{i.title}</p>
                <Badge variant={tone(i.status)}>{i.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {[i.date ? format(new Date(i.date), 'EEE d MMM yyyy') : '', i.location].filter(Boolean).join(' · ') || 'No date set'}
              </p>
              {i.description && <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>}
              <div className="mt-3 flex justify-between">
                {i.attendees ? <span className="text-xs text-muted-foreground">{i.attendees}</span> : <span />}
                <span className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => advance(i)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Event.delete(i.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><PartyPopper className="h-6 w-6" /> Programs & Events</h1>
          <p className="text-sm text-muted-foreground">Community programs and upcoming events.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add program/event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New program or event</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Program', 'Event'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Attendees</Label><Input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="Program">
        <TabsList>
          <TabsTrigger value="Program">Programs</TabsTrigger>
          <TabsTrigger value="Event">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="Program" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
          ) : <List type="Program" />}
        </TabsContent>
        <TabsContent value="Event" className="mt-4">
          {!loading && <List type="Event" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}