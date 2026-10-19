import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Trash2, Heart, UserRound, Download, MessageSquarePlus } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { Link } from 'react-router-dom';
import { SHIFT_TYPES } from '@/lib/commTypes';
import { logCommunicationRegister } from '@/lib/commRouting';


export default function Participants() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [savingDiary, setSavingDiary] = useState(false);
  const blankDiary = () => ({ person_name: '', entry_date: new Date().toISOString().slice(0, 10), entry_time: '', shift_type: '', goal: '', travel_location: '', travel_km: '', body: '' });
  const [diary, setDiary] = useState(blankDiary());
  const setDiaryField = (key) => (e) => setDiary({ ...diary, [key]: e.target.value });
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', date_of_birth: '', ndis_number: '', support_coordinator: '', status: 'Active', notes: '' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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

  const saveDiary = async () => {
    if (!diary.person_name || !diary.body.trim()) return;
    setSavingDiary(true);
    try {
      const user = await base44.auth.me();
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Shift Note',
        person_type: 'Participant',
        person_name: diary.person_name,
        note_type: 'Shift Note',
        entry_date: diary.entry_date,
        entry_time: diary.entry_time,
        shift_type: diary.shift_type,
        goal: diary.goal,
        travel_location: diary.travel_location,
        travel_km: Number(diary.travel_km) || 0,
        body: diary.body,
        module: 'Participants',
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
      });
      await logCommunicationRegister(record);
      setDiary(blankDiary());
      setShowDiary(false);
    } finally {
      setSavingDiary(false);
    }
  };

  const exportRegister = async () => {
    const rows = await fetchAllRecords(base44.entities.ParticipantProfile, {}, 'full_name');
    downloadCsv('Participant-Register.csv', [
      { key: 'full_name', label: 'Full Name' }, { key: 'ndis_number', label: 'NDIS Number' },
      { key: 'ndis_reference_number', label: 'NDIS Reference Number' }, { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' },
      { key: 'date_of_birth', label: 'Date of Birth' }, { key: 'support_coordinator', label: 'Support Coordinator' },
      { key: 'plan_manager', label: 'Plan Manager' }, { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Notes' },
    ], rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Heart} title="Participant Profiles" subtitle="People you support and their details." />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><UserRound className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="register"><Heart className="mr-1.5 h-4 w-4" />Profiles &amp; register</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OurProfilesTab kind="participant" />
        </TabsContent>

        <TabsContent value="register" className="mt-4 space-y-6">
      <RegisterInsights module="participants" />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={exportRegister} disabled={loading || people.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
        <Dialog open={showDiary} onOpenChange={setShowDiary}>
          <DialogTrigger asChild><Button variant="outline"><MessageSquarePlus className="mr-2 h-4 w-4" />Diary entry</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add diary entry</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Participant *</Label>
                <Select value={diary.person_name || undefined} onValueChange={(v) => setDiary({ ...diary, person_name: v })}>
                  <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                  <SelectContent>{people.map((p) => <SelectItem key={p.id} value={p.full_name}>{p.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={diary.entry_date} onChange={setDiaryField('entry_date')} /></div>
                <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={diary.entry_time} onChange={setDiaryField('entry_time')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Support type</Label>
                  <Select value={diary.shift_type || undefined} onValueChange={(v) => setDiary({ ...diary, shift_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select support type" /></SelectTrigger>
                    <SelectContent>{SHIFT_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Relevant goal</Label><Input value={diary.goal} onChange={setDiaryField('goal')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Travel location</Label><Input value={diary.travel_location} onChange={setDiaryField('travel_location')} /></div>
                <div className="grid gap-1.5"><Label>Travel (km)</Label><Input type="number" value={diary.travel_km} onChange={setDiaryField('travel_km')} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Entry *</Label><Textarea value={diary.body} onChange={setDiaryField('body')} placeholder="Record what you saw, heard and did - facts only." /></div>
              <Button onClick={saveDiary} disabled={savingDiary || !diary.person_name || !diary.body.trim()}>Save diary entry</Button>
            </div>
          </DialogContent>
        </Dialog>
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
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={set('notes')} /></div>
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
        <EmptyState icon={Heart} modulePath="/participants" title="No participants yet" message="Add your first participant to start their profile." />
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
                  <Badge className={statusTone(p.status)}>{p.status}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {p.email && <p>{p.email}</p>}
                  {p.phone && <p>{p.phone}</p>}
                  {p.address && <p>{p.address}</p>}
                  {p.support_coordinator && <p>Coordinator: {p.support_coordinator}</p>}
                  {p.notes && <p className="pt-1 italic">{p.notes}</p>}
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/participants/${p.id}`}><UserRound className="h-4 w-4" />Open profile</Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}