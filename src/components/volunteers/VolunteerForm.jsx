import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BLANK = {
  full_name: '', role: '', start_date: '', status: 'Onboarding', supervisor: '', weekly_hours: '', availability: '',
  email: '', phone: '', address: '', date_of_birth: '', emergency_contact: '', emergency_contact_phone: '',
  ndis_worker_screening: '', blue_card_number: '', police_check_date: '', reference_checks: '', induction_date: '', notes: '',
};
const STATUSES = ['Onboarding', 'Active', 'On Leave', 'Inactive'];

export default function VolunteerForm({ open, onOpenChange, editing, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { ...BLANK, ...editing } : BLANK);
  }, [open, editing]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, weekly_hours: form.weekly_hours === '' ? undefined : Number(form.weekly_hours) };
      if (editing) await base44.entities.Volunteer.update(editing.id, payload);
      else await base44.entities.Volunteer.create(payload);
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit volunteer' : 'New volunteer intake'}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Personal &amp; contact details</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={set('full_name')} /></div>
              <div className="grid gap-1.5"><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} /></div>
              <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set('phone')} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={set('address')} /></div>
              <div className="grid gap-1.5"><Label>Emergency contact</Label><Input value={form.emergency_contact} onChange={set('emergency_contact')} /></div>
              <div className="grid gap-1.5"><Label>Emergency contact phone</Label><Input value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} /></div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Placement details</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Volunteer role</Label><Input value={form.role} onChange={set('role')} /></div>
              <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={set('start_date')} /></div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Supervisor</Label><Input value={form.supervisor} onChange={set('supervisor')} /></div>
              <div className="grid gap-1.5"><Label>Weekly hours</Label><Input type="number" value={form.weekly_hours} onChange={set('weekly_hours')} /></div>
              <div className="grid gap-1.5"><Label>Induction date</Label><Input type="date" value={form.induction_date} onChange={set('induction_date')} /></div>
              <div className="grid gap-1.5 sm:col-span-3"><Label>Availability (days / hours)</Label><Input value={form.availability} onChange={set('availability')} placeholder="e.g. Weekdays 9am-2pm" /></div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Screening &amp; checks</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5 sm:col-span-3"><Label>NDIS Worker Screening</Label><Input value={form.ndis_worker_screening} onChange={set('ndis_worker_screening')} placeholder="Clearance number and expiry, or Not required" /></div>
              <div className="grid gap-1.5"><Label>Blue Card number</Label><Input value={form.blue_card_number} onChange={set('blue_card_number')} /></div>
              <div className="grid gap-1.5"><Label>Police check date</Label><Input type="date" value={form.police_check_date} onChange={set('police_check_date')} /></div>
              <div className="grid gap-1.5"><Label>Reference checks</Label><Input value={form.reference_checks} onChange={set('reference_checks')} placeholder="Completed / pending" /></div>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={set('notes')} /></div>
          <Button onClick={save} disabled={saving || !form.full_name.trim()}>{editing ? 'Save changes' : 'Add volunteer to register'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}