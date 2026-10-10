import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { SERVICE_TYPES, FUNDING_SOURCES, SHIFT_STATUSES } from '@/lib/rostering';

const BLANK = {
  employee_name: '', participant_name: '', date: '', start_time: '', end_time: '',
  status: 'Scheduled', service_type: '', funding_source: '', location: '',
  notes: '', break_minutes: '', travel_km: '', billable_rate: '',
  repeat_rule: 'none', repeat_until: '', approval_status: 'Not Required',
};

export default function ShiftForm({ open, onOpenChange, shift, prefillDate, onSave, saving }) {
  const editing = Boolean(shift && shift.id);
  const [form, setForm] = useState(BLANK);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(shift ? {
        employee_name: shift.employee_name || '', participant_name: shift.participant_name || '',
        date: shift.date || '', start_time: shift.start_time || '', end_time: shift.end_time || '',
        status: shift.status || 'Scheduled', service_type: shift.service_type || '', funding_source: shift.funding_source || '',
        location: shift.location || '', notes: shift.notes || '',
        break_minutes: shift.break_minutes ?? '', travel_km: shift.travel_km ?? '', billable_rate: shift.billable_rate ?? '',
        repeat_rule: shift.repeat_rule || 'none', repeat_until: shift.repeat_until || '',
        approval_status: shift.approval_status || 'Not Required',
      } : { ...BLANK, date: prefillDate || '' });
      base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] })
        .then((p) => setStaff(p.items.map((i) => i.full_name)));
      base44.entities.ParticipantProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] })
        .then((p) => setParticipants(p.items.map((i) => i.full_name)));
    }
  }, [open, shift]);

  const submit = () => {
    onSave({
      employee_name: form.employee_name || '',
      participant_name: form.participant_name || '',
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: form.status,
      service_type: form.service_type || undefined,
      funding_source: form.funding_source || undefined,
      location: form.location,
      notes: form.notes,
      break_minutes: form.break_minutes === '' ? undefined : Number(form.break_minutes),
      travel_km: form.travel_km === '' ? undefined : Number(form.travel_km),
      billable_rate: form.billable_rate === '' ? undefined : Number(form.billable_rate),
      repeat_rule: editing ? undefined : form.repeat_rule,
      repeat_until: form.repeat_rule !== 'none' && !editing ? form.repeat_until : undefined,
      approval_status: form.approval_status,
    });
  };

  const showRepeat = !editing && form.repeat_rule !== 'none';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? 'Edit shift' : 'New shift'}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Employee</Label>
              <Select value={form.employee_name || '__none__'} onValueChange={(v) => setForm({ ...form, employee_name: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Participant</Label>
              <Select value={form.participant_name || '__none__'} onValueChange={(v) => setForm({ ...form, participant_name: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">None</SelectItem>{participants.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Service type</Label>
              <Select value={form.service_type || '__none__'} onValueChange={(v) => setForm({ ...form, service_type: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">None</SelectItem>{SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Funding</Label>
              <Select value={form.funding_source || '__none__'} onValueChange={(v) => setForm({ ...form, funding_source: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">None</SelectItem>{FUNDING_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SHIFT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Break (min)</Label><Input type="number" min="0" value={form.break_minutes} onChange={(e) => setForm({ ...form, break_minutes: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Travel (km)</Label><Input type="number" min="0" value={form.travel_km} onChange={(e) => setForm({ ...form, travel_km: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Rate ($/hr)</Label><Input type="number" min="0" step="0.01" value={form.billable_rate} onChange={(e) => setForm({ ...form, billable_rate: e.target.value })} /></div>
          </div>
          {!editing && (
            <div className="grid gap-3 rounded-lg border p-3">
              <Label className="font-medium">Repeat</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Pattern</Label>
                  <Select value={form.repeat_rule} onValueChange={(v) => setForm({ ...form, repeat_rule: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Does not repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showRepeat && (
                  <div className="grid gap-1.5"><Label>Until</Label><Input type="date" value={form.repeat_until} onChange={(e) => setForm({ ...form, repeat_until: e.target.value })} /></div>
                )}
              </div>
            </div>
          )}
          <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.date}>{editing ? 'Save changes' : 'Schedule shift'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}