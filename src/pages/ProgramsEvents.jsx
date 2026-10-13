import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, PartyPopper, Megaphone, Mail, Pencil, Eye, MapPin, Clock, Users, DollarSign, User, Loader2, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import EventCalendar from '@/components/events/EventCalendar';
import { format } from 'date-fns';
import EventAdBuilder from '@/components/events/EventAdBuilder';
import EventInviteDialog from '@/components/events/EventInviteDialog';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import ModuleAuditButton from '@/components/ModuleAuditButton';

const EMPTY = {
  title: '', type: 'Program', date: '', end_date: '', start_time: '', end_time: '',
  location: '', description: '', attendees: '', status: 'Planned', organiser: '', contact_email: '', cost_text: '',
};
const STATUSES = ['Planned', 'Ongoing', 'Completed', 'Cancelled'];

export default function ProgramsEvents() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [business, setBusiness] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [viewing, setViewing] = useState(null);
  const [adFor, setAdFor] = useState(null);
  const [inviteFor, setInviteFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, businessPage] = await Promise.all([
        base44.entities.Event.filter({}, { sort: 'date', limit: 200 }),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
      ]);
      setItems(page.items);
      setBusiness(businessPage.items?.[0] || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportRegister = async () => {
    const page = await base44.entities.Event.filter({}, { sort: 'date', limit: 1000 });
    downloadCsv('Programs-Events-Register.csv', [
      { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date' }, { key: 'end_date', label: 'End Date' },
      { key: 'start_time', label: 'Start Time' }, { key: 'end_time', label: 'End Time' },
      { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' },
      { key: 'organiser', label: 'Organiser' }, { key: 'contact_email', label: 'Contact Email' },
      { key: 'cost_text', label: 'Cost' }, { key: 'attendees', label: 'Attendees' },
      { key: 'description', label: 'Description' },
    ], page.items);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...EMPTY, ...item }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) await base44.entities.Event.update(editing.id, form);
      else await base44.entities.Event.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const grouped = useMemo(() => ({
    Upcoming: items.filter((i) => i.date >= today),
    Past: items.filter((i) => i.date && i.date < today),
  }), [items, today]);

  const EventCard = ({ item }) => {
    const when = item.date ? format(new Date(item.date), 'EEE d MMM yyyy') : 'No date set';
    const times = [item.start_time, item.end_time].filter(Boolean).join(' - ');
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-4">
          <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 py-3 text-white">
            <span className="text-[10px] font-semibold uppercase tracking-wide">{item.date ? format(new Date(item.date), 'MMM') : '—'}</span>
            <span className="text-2xl font-bold">{item.date ? format(new Date(item.date), 'd') : '–'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold">{item.title}</p>
              <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
              <Badge className={statusTone(item.status)}>{item.status}</Badge>
              {item.ad_image_url && <Badge variant="secondary" className="text-[10px]">Ad ready</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{when}{times ? ` · ${times}` : ''}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
              {item.organiser && <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.organiser}</span>}
              {item.cost_text && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{item.cost_text}</span>}
              {item.attendees && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.attendees}</span>}
              {item.invited_to && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />Invites sent</span>}
            </div>
            {item.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewing(item)}><Eye className="h-3 w-3" />Details</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAdFor(item)}><Megaphone className="h-3 w-3" />Advertisement</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setInviteFor(item)}><Mail className="h-3 w-3" />Invite users</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" />Edit</Button>
              <Select value={item.status} onValueChange={async (v) => { await base44.entities.Event.update(item.id, { status: v }); await load(); }}>
                <SelectTrigger className="ml-auto h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Event.delete(item.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyList = () => (
    <Card><CardContent className="p-10 text-center text-muted-foreground">Nothing here yet. Use Add program/event to create one.</CardContent></Card>
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3"><PartyPopper className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Program Design Centre</h1>
              <p className="text-sm text-orange-100">Design bright community programs and events, advertise them and invite attendees.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ModuleComplianceStrip path="/programs" />
            <ModuleAuditButton />
            {[['Programs', String(items.filter((i) => i.type === 'Program').length)], ['Events', String(items.filter((i) => i.type === 'Event').length)], ['Upcoming', String(grouped.Upcoming.length)]].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-100">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Button className="bg-white text-rose-700 hover:bg-rose-50" onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add program/event</Button>
          <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" onClick={exportRegister} disabled={loading || items.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
        </div>
      </div>

      {!loading && grouped.Upcoming[0] && (() => {
        const spotlight = grouped.Upcoming[0];
        return (
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white shadow-lg">
            <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
              <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/15 py-4 backdrop-blur">
                <span className="text-[11px] font-semibold uppercase tracking-wide">{format(new Date(spotlight.date), 'MMM')}</span>
                <span className="text-3xl font-bold">{format(new Date(spotlight.date), 'd')}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">Next up</span>
                  <p className="text-lg font-bold">{spotlight.title}</p>
                </div>
                {spotlight.description && <p className="mt-1 line-clamp-2 text-sm text-white/80">{spotlight.description}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
                  {spotlight.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{spotlight.start_time}{spotlight.end_time ? ` - ${spotlight.end_time}` : ''}</span>}
                  {spotlight.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{spotlight.location}</span>}
                  {spotlight.cost_text && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{spotlight.cost_text}</span>}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button className="bg-white text-purple-700 hover:bg-purple-50" size="sm" onClick={() => setViewing(spotlight)}><Eye className="mr-1.5 h-3.5 w-3.5" />Details</Button>
                <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" size="sm" onClick={() => setInviteFor(spotlight)}><Mail className="mr-1.5 h-3.5 w-3.5" />Invite</Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="Upcoming">Upcoming &amp; current ({grouped.Upcoming.length})</TabsTrigger>
          <TabsTrigger value="Past">Past ({grouped.Past.length})</TabsTrigger>
          <TabsTrigger value="All">All ({items.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : (
            <EventCalendar events={items.filter((i) => i.date)} onSelect={(event) => setViewing(event)} />
          )}
        </TabsContent>
        {['Upcoming', 'Past', 'All'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
            ) : (
              (() => {
                const list = tab === 'All' ? items : grouped[tab];
                if (!list.length) return <EmptyList />;
                return <div className="grid gap-4 md:grid-cols-2">{list.map((item) => <EventCard key={item.id} item={item} />)}</div>;
              })()
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit program/event' : 'New program or event'}</DialogTitle></DialogHeader>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>End date (multi-day)</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5"><Label>Start time</Label><Input placeholder="9:00 am" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>End time</Label><Input placeholder="3:00 pm" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Cost</Label><Input placeholder="Free or $20 per person" value={form.cost_text} onChange={(e) => setForm({ ...form, cost_text: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Organiser</Label><Input value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Contact email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Attendees</Label><Input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editing ? 'Save changes' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewing)} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewing?.title}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid gap-3 text-sm">
              <div className="flex gap-2">
                <Badge variant="outline">{viewing.type}</Badge>
                <Badge className={statusTone(viewing.status)}>{viewing.status}</Badge>
              </div>
              {viewing.date && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />{format(new Date(viewing.date), 'EEEE, d MMMM yyyy')}{viewing.end_date && viewing.end_date !== viewing.date ? ` to ${format(new Date(viewing.end_date), 'EEEE, d MMMM yyyy')}` : ''}{[viewing.start_time, viewing.end_time].filter(Boolean).length ? ` · ${[viewing.start_time, viewing.end_time].filter(Boolean).join(' - ')}` : ''}</p>}
              {viewing.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{viewing.location}</p>}
              {viewing.organiser && <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Organiser: {viewing.organiser}</p>}
              {viewing.cost_text && <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Cost: {viewing.cost_text}</p>}
              {viewing.attendees && <p className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Attendees: {viewing.attendees}</p>}
              {viewing.contact_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />Contact: {viewing.contact_email}</p>}
              {viewing.description && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p><p className="whitespace-pre-line text-muted-foreground">{viewing.description}</p></div>}
              {viewing.invited_to && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invites sent to</p><p className="text-muted-foreground">{viewing.invited_to}{viewing.invited_at ? ` (on ${format(new Date(viewing.invited_at), 'd MMM yyyy')})` : ''}</p></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { setAdFor(viewing); setViewing(null); }}><Megaphone className="mr-2 h-4 w-4" />Advertisement</Button>
                <Button size="sm" variant="outline" onClick={() => { setInviteFor(viewing); setViewing(null); }}><Mail className="mr-2 h-4 w-4" />Invite users</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EventAdBuilder open={Boolean(adFor)} onOpenChange={(v) => !v && setAdFor(null)} event={adFor} business={business} onSaved={load} />
      <EventInviteDialog open={Boolean(inviteFor)} onOpenChange={(v) => !v && setInviteFor(null)} event={inviteFor} business={business} onSaved={load} />
    </div>
  );
}