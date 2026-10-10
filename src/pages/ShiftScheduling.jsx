import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CalendarClock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Scheduled', 'Completed', 'Cancelled'];
const NEXT = { Scheduled: 'Completed', Completed: 'Cancelled', Cancelled: 'Scheduled' };
const tone = (s) => (s === 'Scheduled' ? 'default' : s === 'Completed' ? 'secondary' : 'destructive');

export default function ShiftScheduling() {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ employee_name: '', participant_name: '', date: '', start_time: '', end_time: '', status: 'Scheduled', location: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e, p] = await Promise.all([
        base44.entities.Shift.filter({}, { sort: '-date', limit: 50 }),
        base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
        base44.entities.ParticipantProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
      ]);
      setShifts(s.items);
      setStaff(e.items.map((i) => i.full_name));
      setParticipants(p.items.map((i) => i.full_name));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.employee_name || !form.date) return;
    setSaving(true);
    try {
      await base44.entities.Shift.create(form);
      setForm({ employee_name: '', participant_name: '', date: '', start_time: '', end_time: '', status: 'Scheduled', location: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (shift) => {
    await base44.entities.Shift.update(shift.id, { status: NEXT[shift.status] });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarClock className="h-6 w-6" /> Shift Scheduling</h1>
          <p className="text-sm text-muted-foreground">Upcoming and recent shifts.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Schedule shift</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New shift</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Employee *</Label>
                  <Select value={form.employee_name} onValueChange={(v) => setForm({ ...form, employee_name: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Participant</Label>
                  <Select value={form.participant_name} onValueChange={(v) => setForm({ ...form, participant_name: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{participants.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Start time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>End time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={save} disabled={saving || !form.employee_name || !form.date}>Schedule shift</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>
      ) : shifts.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No shifts scheduled yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {shifts.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2"><CalendarClock className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{s.employee_name}{s.participant_name ? ` → ${s.participant_name}` : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(s.date), 'EEE d MMM yyyy')}
                      {s.start_time ? ` · ${s.start_time}${s.end_time ? `–${s.end_time}` : ''}` : ''}
                      {s.location ? ` · ${s.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tone(s.status)}>{s.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => advance(s)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Shift.delete(s.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}