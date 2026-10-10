import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Scheduled', 'Completed', 'Cancelled'];
const NEXT = { Scheduled: 'Completed', Completed: 'Cancelled', Cancelled: 'Scheduled' };
const tone = (s) => (s === 'Scheduled' ? 'default' : s === 'Completed' ? 'secondary' : 'destructive');

export default function MeetingCentre() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', location: '', attendees: '', agenda: '', minutes: '', status: 'Scheduled' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Meeting.filter({}, { sort: '-date', limit: 50 });
      setMeetings(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Meeting.create(form);
      setForm({ title: '', date: '', time: '', location: '', attendees: '', agenda: '', minutes: '', status: 'Scheduled' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (m) => {
    await base44.entities.Meeting.update(m.id, { status: NEXT[m.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarDays className="h-6 w-6" /> Meeting Centre</h1>
          <p className="text-sm text-muted-foreground">Board, compliance and team meetings with minutes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Schedule meeting</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New meeting</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Attendees</Label><Input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Agenda</Label><Textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Schedule meeting</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : meetings.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No meetings scheduled yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[m.date ? format(new Date(m.date), 'EEE d MMM yyyy') : '', m.time, m.location, m.attendees].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge variant={tone(m.status)}>{m.status}</Badge>
                </div>
                {m.agenda && <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Agenda:</span> {m.agenda}</p>}
                {m.minutes && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Minutes:</span> {m.minutes}</p>}
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => advance(m)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Meeting.delete(m.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}