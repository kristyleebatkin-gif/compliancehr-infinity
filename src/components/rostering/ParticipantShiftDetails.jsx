import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, Trash2, Pencil, ClipboardList } from 'lucide-react';
import { addDays, format } from 'date-fns';

const SHIFT_TYPES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Sleepover', 'Active Overnight', 'Buddy Shift', 'Training Shift', 'Team Training', 'Activity'];
const STATUSES = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'];
const RESPONSES = ['Pending', 'Approved', 'Declined'];

const statusTone = (s) => {
  if (s === 'Confirmed' || s === 'Completed') return 'bg-safe/10 text-safe';
  if (s === 'Cancelled' || s === 'No-Show') return 'bg-destructive/10 text-destructive';
  if (s === 'In Progress') return 'bg-brand/10 text-brand';
  return 'bg-muted text-muted-foreground';
};
const responseTone = (r) => {
  if (r === 'Approved') return 'bg-safe/10 text-safe';
  if (r === 'Declined') return 'bg-destructive/10 text-destructive';
  return 'bg-warning/10 text-warning';
};

const EMPTY_FORM = {
  participant_id: '', participant_name: '', shift_id: '', shift_type: 'Activity',
  shift_date: '', start_time: '', end_time: '', staff_name: '', location: '',
  planned_mileage_km: '', risks_identified: '', incident_issue_concern: '',
  shift_instructions: '', status: 'Scheduled', participant_response: 'Pending',
};

// Participant shift details register: planned shift types, instructions, risks and
// participant responses captured per participant and optionally linked to a roster shift.
export default function ParticipantShiftDetails() {
  const [details, setDetails] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filterParticipant, setFilterParticipant] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detailPage, participantPage, staffPage, shiftPage] = await Promise.all([
        base44.entities.ParticipantShiftDetail.filter({}, { sort: '-shift_date', limit: 200 }),
        base44.entities.ParticipantProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['id', 'full_name'] }),
        base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
        base44.entities.Shift.filter({ date: { $gte: format(new Date(), 'yyyy-MM-dd'), $lte: format(addDays(new Date(), 60), 'yyyy-MM-dd') } }, { sort: 'date', limit: 200, fields: ['id', 'date', 'participant_name', 'start_time'] }),
      ]);
      setDetails(detailPage.items || []);
      setParticipants(participantPage.items || []);
      setStaff((staffPage.items || []).map((s) => s.full_name));
      setShifts(shiftPage.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = details.filter(
    (d) => (filterParticipant === 'all' || d.participant_name === filterParticipant)
      && (filterStatus === 'all' || d.status === filterStatus),
  );

  const pendingResponses = details.filter((d) => d.participant_response === 'Pending').length;
  const unlinked = details.filter((d) => !d.shift_id).length;

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, shift_date: format(new Date(), 'yyyy-MM-dd') });
    setFormOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      participant_id: d.participant_id || '', participant_name: d.participant_name || '',
      shift_id: d.shift_id || '', shift_type: d.shift_type || 'Activity',
      shift_date: d.shift_date || '', start_time: d.start_time || '', end_time: d.end_time || '',
      staff_name: d.staff_name || '', location: d.location || '',
      planned_mileage_km: d.planned_mileage_km ?? '', risks_identified: d.risks_identified || '',
      incident_issue_concern: d.incident_issue_concern || '', shift_instructions: d.shift_instructions || '',
      status: d.status || 'Scheduled', participant_response: d.participant_response || 'Pending',
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.participant_id || !form.shift_date || !form.start_time || !form.end_time) return;
    setSaving(true);
    try {
      const payload = {
        participant_id: form.participant_id,
        participant_name: form.participant_name,
        shift_id: form.shift_id || undefined,
        shift_type: form.shift_type,
        shift_date: form.shift_date,
        start_time: form.start_time,
        end_time: form.end_time,
        staff_name: form.staff_name || undefined,
        location: form.location || undefined,
        planned_mileage_km: form.planned_mileage_km !== '' ? Number(form.planned_mileage_km) : undefined,
        risks_identified: form.risks_identified || undefined,
        incident_issue_concern: form.incident_issue_concern || undefined,
        shift_instructions: form.shift_instructions || undefined,
        status: form.status,
        participant_response: form.participant_response,
      };
      if (editing) await base44.entities.ParticipantShiftDetail.update(editing.id, payload);
      else await base44.entities.ParticipantShiftDetail.create(payload);
      setFormOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d) => {
    await base44.entities.ParticipantShiftDetail.delete(d.id);
    await load();
  };

  const setParticipant = (id) => {
    const p = participants.find((x) => x.id === id);
    setForm((f) => ({ ...f, participant_id: id, participant_name: p?.full_name || '' }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterParticipant} onValueChange={setFilterParticipant}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All participants</SelectItem>
            {participants.map((p) => <SelectItem key={p.id} value={p.full_name}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge className="bg-warning/10 text-warning border-transparent">{pendingResponses} responses pending</Badge>
        <Badge className="bg-muted text-muted-foreground border-transparent">{unlinked} not linked to a shift</Badge>
        <div className="flex-1" />
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add shift detail</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/5 border border-brand/15">
              <ClipboardList className="h-7 w-7 text-brand" />
            </div>
            <div className="font-editorial text-lg font-semibold">No shift details recorded</div>
            <div className="mt-1.5 max-w-sm text-sm text-foreground/50">Capture planned shift types, instructions, risks and participant responses here, linked to roster shifts.</div>
            <div className="mt-5"><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add shift detail</Button></div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Linked shift</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30">
                    <TableCell className="whitespace-nowrap font-medium tabular-nums">{format(new Date(d.shift_date + 'T00:00:00'), 'd MMM yyyy')}</TableCell>
                    <TableCell>{d.participant_name}</TableCell>
                    <TableCell><Badge className="bg-brand/10 text-brand border-transparent">{d.shift_type || 'Activity'}</Badge></TableCell>
                    <TableCell className="tabular-nums whitespace-nowrap">{d.start_time} – {d.end_time}</TableCell>
                    <TableCell>{d.staff_name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge className={`${statusTone(d.status)} border-transparent`}>{d.status}</Badge></TableCell>
                    <TableCell><Badge className={`${responseTone(d.participant_response)} border-transparent`}>{d.participant_response || 'Pending'}</Badge></TableCell>
                    <TableCell>{d.shift_id ? <Badge className="bg-teal/10 text-teal border-transparent">Linked</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(d)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit shift detail' : 'Add participant shift detail'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Participant *</Label>
              <Select value={form.participant_id || undefined} onValueChange={setParticipant}>
                <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                <SelectContent>
                  {participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Shift type</Label>
              <Select value={form.shift_type} onValueChange={(v) => setForm((f) => ({ ...f, shift_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SHIFT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.shift_date} onChange={(e) => setForm((f) => ({ ...f, shift_date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Start *</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End *</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Primary employee</Label>
              <Select value={form.staff_name || 'none'} onValueChange={(v) => setForm((f) => ({ ...f, staff_name: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {staff.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Participant home" />
            </div>
            <div className="space-y-1.5">
              <Label>Planned mileage (km)</Label>
              <Input type="number" min="0" value={form.planned_mileage_km} onChange={(e) => setForm((f) => ({ ...f, planned_mileage_km: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Participant response</Label>
              <Select value={form.participant_response} onValueChange={(v) => setForm((f) => ({ ...f, participant_response: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RESPONSES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Linked roster shift (next 60 days for this participant)</Label>
              <Select
                value={form.shift_id || 'none'}
                onValueChange={(v) => setForm((f) => ({ ...f, shift_id: v === 'none' ? '' : v }))}
              >
                <SelectTrigger><SelectValue placeholder="No linked shift" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked shift</SelectItem>
                  {shifts
                    .filter((s) => !form.participant_id || s.participant_name === form.participant_name)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {format(new Date(s.date + 'T00:00:00'), 'd MMM')} · {s.start_time} · {s.participant_name || 'Unassigned'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Shift instructions</Label>
              <Textarea rows={2} value={form.shift_instructions} onChange={(e) => setForm((f) => ({ ...f, shift_instructions: e.target.value }))} placeholder="What the team needs to do on this shift" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Risks identified</Label>
              <Textarea rows={2} value={form.risks_identified} onChange={(e) => setForm((f) => ({ ...f, risks_identified: e.target.value }))} placeholder="Known risks or hazards for this shift" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Incident, issue or concern</Label>
              <Textarea rows={2} value={form.incident_issue_concern} onChange={(e) => setForm((f) => ({ ...f, incident_issue_concern: e.target.value }))} placeholder="Anything noted on or before the shift" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.participant_id || !form.shift_date || !form.start_time || !form.end_time}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {editing ? 'Save changes' : 'Add detail'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}