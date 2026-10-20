import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
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
import { ChevronDown, Copy, Download, FileDown, Plus, Trash2, CalendarDays, Pencil, Search, Clock } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { format, differenceInCalendarDays } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { downloadMinutesTemplate } from '@/lib/meetingPdf';
import { AGENDA_TEMPLATES } from '@/lib/meetingAgendaTemplates';
import MeetingCalendar from '@/components/meetings/MeetingCalendar';
import MeetingDetail from '@/components/meetings/MeetingDetail';

const TYPES = ['Compliance Review', 'Governance / Board', 'Staff Meeting', 'Participant Planning', 'Quality & Improvement', 'Incident / Risk Review', 'Other'];
const STATUS_BORDERS = { Scheduled: 'border-l-sky-500', Completed: 'border-l-emerald-500', Cancelled: 'border-l-rose-400' };
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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [openActions, setOpenActions] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Meeting.filter({}, { sort: '-date', limit: 200 });
      setMeetings(page.items);
      const actions = await base44.entities.TodoTask.count({ linked_entity_type: 'Meeting', status: { $in: ['Open', 'In Progress', 'Overdue'] } });
      setOpenActions(actions);
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

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const upcoming = meetings
    .filter((m) => m.status === 'Scheduled' && m.date && m.date >= todayStr)
    .sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`));
  const nextMeeting = upcoming[0];
  const minutesOutstanding = meetings.filter((m) => m.status === 'Scheduled' && m.date && m.date < todayStr && !m.minutes);
  const completedCount = meetings.filter((m) => m.status === 'Completed').length;
  const visibleMeetings = meetings.filter((m) =>
    (typeFilter === 'All' || m.meeting_type === typeFilter) &&
    (!search.trim() || [m.title, m.meeting_type, m.chair, m.attendees, m.location].some((v) => (v || '').toLowerCase().includes(search.trim().toLowerCase())))
  );

  const duplicateMeeting = async (m) => {
    try {
      const { id, created_date, updated_date, created_by_id, attendance, minutes, assessment, minutes_file_uri, minutes_file_name, invited_at, invited_to, status, ...rest } = m;
      await base44.entities.Meeting.create({
        ...rest,
        status: 'Scheduled',
        attendance: '', minutes: '', assessment: '', minutes_file_uri: '', minutes_file_name: '', invited_at: '', invited_to: '',
      });
      await load();
      toast({ title: 'Meeting duplicated', description: 'A fresh scheduled copy was created. Set the new date and details.' });
    } catch (error) {
      toast({ title: 'Could not duplicate', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        icon={CalendarDays}
        title="Meeting Centre"
        subtitle="Meeting register, calendar, agenda assistant, invites, minutes and follow-up actions."
        showAlerts={false}

      />

      <Tabs defaultValue="register">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1.5">
          <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" />Schedule meeting</Button>
          <TabsList className="h-8 bg-muted/50 p-0.5">
            <TabsTrigger value="register" className="px-2 text-[11px]">Meeting register</TabsTrigger>
            <TabsTrigger value="calendar" className="px-2 text-[11px]">Calendar</TabsTrigger>
          </TabsList>
          <Button size="sm" variant="outline" onClick={exportRegister} disabled={loading || meetings.length === 0}><Download className="h-3.5 w-3.5" />Export register</Button>
          <Button size="sm" variant="outline" onClick={downloadMinutesTemplate}><FileDown className="h-3.5 w-3.5" />Minutes template</Button>
        </div>
        <div className="mt-2"><RegisterInsights module="meetings" /></div>

        <TabsContent value="register" className="mt-2 space-y-3">
          {nextMeeting && (
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-sky-600 via-violet-600 to-brand text-white shadow-lg">
              <CardContent className="flex flex-wrap items-center gap-3 p-3">
                <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/15 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide">{format(new Date(nextMeeting.date), 'MMM')}</span>
                  <span className="text-2xl font-bold">{format(new Date(nextMeeting.date), 'd')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">Next meeting</span>
                    <p className="text-lg font-bold">{nextMeeting.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-white/80">
                    {format(new Date(nextMeeting.date), 'EEEE d MMM yyyy')}{nextMeeting.time ? ` at ${nextMeeting.time}` : ''}
                    {nextMeeting.location ? ` · ${nextMeeting.location}` : ''}
                    {' '}· in {Math.max(0, differenceInCalendarDays(new Date(nextMeeting.date), new Date()))} day{Math.max(0, differenceInCalendarDays(new Date(nextMeeting.date), new Date())) === 1 ? '' : 's'}
                  </p>
                </div>
                {safeUrl(nextMeeting.meeting_link) && (
                  <a href={safeUrl(nextMeeting.meeting_link)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50">
                    <Clock className="h-4 w-4" />Join online
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Scheduled', value: meetings.filter((m) => m.status === 'Scheduled').length, grad: 'from-sky-500 via-blue-600 to-indigo-600' },
              { label: 'Completed', value: completedCount, grad: 'from-emerald-500 via-teal-500 to-cyan-600' },
              { label: 'Open follow-up actions', value: openActions, grad: 'from-amber-500 via-orange-500 to-rose-500' },
              { label: 'Minutes outstanding', value: minutesOutstanding.length, grad: 'from-fuchsia-500 via-pink-500 to-rose-500' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm ${s.grad}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/85">{s.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
          <div className="module-filter-bar flex flex-wrap items-center">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search meetings, chair or attendees..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All meeting types</SelectItem>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {minutesOutstanding.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
              <p className="font-bold text-warning">Minutes outstanding ({minutesOutstanding.length})</p>
              <p className="mt-1 text-xs text-foreground/70">{minutesOutstanding.map((m) => `${m.title}${m.date ? ` (${format(new Date(m.date), 'd MMM')})` : ''}`).join(' · ')} - open a meeting below to record its minutes.</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : meetings.length === 0 ? (
            <EmptyState icon={CalendarDays} modulePath="/meetings" title="No meetings scheduled yet" message="Schedule your first meeting to start the calendar." />
          ) : visibleMeetings.length === 0 ? (
            <EmptyState icon={Search} modulePath="/meetings" title="No meetings match" message="Try a different search term or filter." />
          ) : (
            <div className="space-y-3">
              {visibleMeetings.map((m) => (
                <Card key={m.id} className={`border-l-4 shadow-sm transition hover:shadow-md ${STATUS_BORDERS[m.status] || ''}`}>
                  <CardContent className="px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}>
                        <p className="flex items-center gap-2 font-semibold">
                          <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">{m.meeting_type}</span>
                          {m.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {[m.date ? format(new Date(m.date), 'EEE d MMM yyyy') : '', m.time, m.location].filter(Boolean).join(' · ')}
                        </p>
                        {m.attendees && <p className="mt-0.5 truncate text-xs text-muted-foreground">Attendees: {m.attendees}</p>}
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge className={statusTone(m.status)}>{m.status}</Badge>
                        {m.status === 'Scheduled' && m.date && m.date < todayStr && <Badge className="bg-warning/10 text-warning text-[10px]">Minutes due</Badge>}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateMeeting(m)} title="Duplicate"><Copy className="h-4 w-4" /></Button>
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
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-2">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">Agenda assistant - insert a structured template</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(AGENDA_TEMPLATES).map((t) => (
                  <Button key={t} variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setForm((f) => ({ ...f, agenda: AGENDA_TEMPLATES[t] }))}>{t}</Button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Agenda</Label><Textarea rows={5} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{editingId ? 'Save changes' : 'Schedule meeting'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}