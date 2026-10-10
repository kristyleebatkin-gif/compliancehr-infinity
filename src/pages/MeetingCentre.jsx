import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, Download, FileDown, Plus, Trash2, CalendarDays, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { downloadMinutesTemplate } from '@/lib/meetingPdf';
import MeetingCalendar from '@/components/meetings/MeetingCalendar';
import MeetingDetail from '@/components/meetings/MeetingDetail';

const TYPES = ['Compliance Review', 'Governance / Board', 'Staff Meeting', 'Participant Planning', 'Quality & Improvement', 'Incident / Risk Review', 'Other'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled'];
const EMPTY_FORM = {
  title: '', meeting_type: 'Staff Meeting', date: '', time: '', duration: '', location: '', meeting_link: '',
  chair: '', minute_taker: '', attendees: '', attendee_emails: '', purpose: '', agenda: '', status: 'Scheduled',
};

export default function MeetingCentre() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Meeting.filter({}, { sort: '-date', limit: 200 });
      setMeetings(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({
      title: m.title || '', meeting_type: m.meeting_type || 'Staff Meeting', date: m.date || '', time: m.time || '',
      duration: m.duration || '', location: m.location || '', meeting_link: m.meeting_link || '',
      chair: m.chair || '', minute_taker: m.minute_taker || '', attendees: m.attendees || '',
      attendee_emails: m.attendee_emails || '', purpose: m.purpose || '', agenda: m.agenda || '', status: m.status || 'Scheduled',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) await base44.entities.Meeting.update(editingId, form);
      else await base44.entities.Meeting.create(form);
      setOpen(false);
      await load();
      toast({ title: editingId ? 'Meeting updated' : 'Meeting scheduled', description: 'It is recorded in the meeting register and shown on the calendar.' });
    } finally {
      setSaving(false);
    }
  };

  const exportRegister = () => {
    downloadCsv(
      'Meeting-Register.csv',
      [
        { key: 'title', label: 'Title' }, { key: 'meeting_type', label: 'Type' },
        { key: 'date', label: 'Date' }, { key: 'time', label: 'Time' },
        { key: 'duration', label: 'Duration' }, { key: 'location', label: 'Location' },
        { key: 'meeting_link', label: 'Meeting Link' }, { key: 'chair', label: 'Chairperson' },
        { key: 'minute_taker', label: 'Minute Taker' }, { key: 'attendees', label: 'Attendees' },
        { key: 'attendance', label: 'Attendance / Apologies' }, { key: 'purpose', label: 'Purpose' },
        { key: 'agenda', label: 'Agenda' }, { key: 'minutes', label: 'Minutes / Decisions' },
        { key: 'assessment', label: 'Assessment' }, { key: 'invited_to', label: 'Invites Sent To' },
        { key: 'status', label: 'Status' },
      ],
      meetings,
    );
    toast({ title: 'Meeting register exported' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarDays className="h-6 w-6" /> Meeting Centre</h1>
          <p className="text-sm text-muted-foreground">Meeting register, calendar, invites, minutes and follow-up tasks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadMinutesTemplate}><FileDown className="mr-2 h-4 w-4" />Minutes template</Button>
          <Button variant="outline" onClick={exportRegister} disabled={loading || meetings.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Schedule meeting</Button>
        </div>
      </div>

      <Tabs defaultValue="register">
        <TabsList className="flex-wrap">
          <TabsTrigger value="register">Meeting register</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : meetings.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No meetings scheduled yet. Schedule your first meeting above.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {[m.meeting_type, m.date ? format(new Date(m.date), 'EEE d MMM yyyy') : '', m.time, m.location].filter(Boolean).join(' · ')}
                        </p>
                        {m.attendees && <p className="mt-0.5 truncate text-xs text-muted-foreground">Attendees: {m.attendees}</p>}
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge className={statusTone(m.status)}>{m.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.Meeting.delete(m.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <ChevronDown className={`h-4 w-4 text-foreground/40 transition-transform ${expanded[m.id] ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {expanded[m.id] && <MeetingDetail meeting={m} onSaved={load} onEdit={openEdit} />}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : (
            <MeetingCalendar meetings={meetings} />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit meeting' : 'Schedule meeting'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Meeting type</Label>
                <Select value={form.meeting_type} onValueChange={(v) => setForm({ ...form, meeting_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Start time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Expected duration</Label><Input placeholder="1 hour" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Video / meeting link</Label><Input placeholder="https://meet..." value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Chairperson</Label><Input value={form.chair} onChange={(e) => setForm({ ...form, chair: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Minute taker</Label><Input value={form.minute_taker} onChange={(e) => setForm({ ...form, minute_taker: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Attendees</Label><Input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} placeholder="Names of expected attendees" /></div>
            <div className="grid gap-1.5"><Label>Attendee emails (for invites)</Label><Input value={form.attendee_emails} onChange={(e) => setForm({ ...form, attendee_emails: e.target.value })} placeholder="name@example.com, name2@example.com" /></div>
            <div className="grid gap-1.5"><Label>Purpose</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Agenda</Label><Textarea rows={3} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{editingId ? 'Save changes' : 'Schedule meeting'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}