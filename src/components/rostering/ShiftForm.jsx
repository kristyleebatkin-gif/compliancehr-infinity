import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { SERVICE_TYPES, FUNDING_SOURCES, SHIFT_STATUSES, availabilityForDate } from '@/lib/rostering';

const AVAILABILITY_LABEL = {
  available: { text: 'Free', cls: 'bg-safe/10 text-safe' },
  unavailable: { text: 'Unavailable', cls: 'bg-destructive/10 text-destructive' },
  none: null,
};

const BLANK = {
  employee_name: '', participant_name: '', date: '', start_time: '', end_time: '',
  status: 'Scheduled', service_type: '', funding_source: '', location: '',
  location_lat: '', location_lng: '',
  notes: '', break_minutes: '', travel_km: '', billable_rate: '', participant_goal: '',
  repeat_rule: 'none', repeat_until: '', approval_status: 'Not Required',
};

export default function ShiftForm({ open, onOpenChange, shift, prefillDate, onSave, saving }) {
  const editing = Boolean(shift && shift.id);
  const [form, setForm] = useState(BLANK);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [clearancesByStaff, setClearancesByStaff] = useState({});
  const [staffRates, setStaffRates] = useState({});
  const [overrideExpiredClearance, setOverrideExpiredClearance] = useState(false);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!open || !form.date) { setAvailability([]); return; }
    let cancelled = false;
    base44.entities.StaffAvailability.filter({ date: form.date }, { limit: 500 })
      .then((p) => { if (!cancelled) setAvailability(p.items || []); })
      .catch((e) => console.error(e));
    return () => { cancelled = true; };
  }, [open, form.date]);

  useEffect(() => {
    if (open) {
      setForm(shift ? {
        employee_name: shift.employee_name || '', participant_name: shift.participant_name || '',
        date: shift.date || '', start_time: shift.start_time || '', end_time: shift.end_time || '',
        status: shift.status || 'Scheduled', service_type: shift.service_type || '', funding_source: shift.funding_source || '',
        location: shift.location || '', location_lat: shift.location_lat ?? '', location_lng: shift.location_lng ?? '',
        notes: shift.notes || '',
        break_minutes: shift.break_minutes ?? '', travel_km: shift.travel_km ?? '', billable_rate: shift.billable_rate ?? '',
        participant_goal: shift.participant_goal || '',
        repeat_rule: shift.repeat_rule || 'none', repeat_until: shift.repeat_until || '',
        approval_status: shift.approval_status || 'Not Required',
      } : { ...BLANK, date: prefillDate || '' });
      setOverrideExpiredClearance(false);
      base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name', 'hourly_rate'] })
        .then((p) => {
          const items = p.items || [];
          setStaff(items.map((i) => i.full_name));
          const rMap = {};
          items.forEach((i) => {
            if (i.full_name && i.hourly_rate) rMap[i.full_name] = Number(i.hourly_rate);
          });
          setStaffRates(rMap);
        });
      base44.entities.ParticipantProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] })
        .then((p) => setParticipants(p.items.map((i) => i.full_name)));
      Promise.all([
        base44.entities.EmployeeDocument.filter({}, { limit: 200 }).catch(() => ({ items: [] })),
        base44.entities.Certificate.filter({}, { limit: 200 }).catch(() => ({ items: [] })),
      ]).then(([empDocsRes, certsRes]) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const map = {};
        const checkItem = (name, docTitle, status, expiry) => {
          if (!name) return;
          if (!map[name]) map[name] = { expired: [], expiring: [] };
          if (status === 'Expired' || (expiry && expiry < todayStr)) {
            map[name].expired.push(docTitle);
          } else if (status === 'Expiring Soon') {
            map[name].expiring.push(docTitle);
          }
        };
        (empDocsRes?.items || []).forEach((d) =>
          checkItem(d.employee_name, d.document_type || d.title, d.status, d.expiry_date)
        );
        (certsRes?.items || []).forEach((c) =>
          checkItem(c.staff_name, c.module_title || 'Certificate', c.status, c.expiry_date)
        );
        setClearancesByStaff(map);
      });
    }
  }, [open, shift]);

  useEffect(() => {
    setForm((f) => ({ ...f, participant_goal: '' }));
    setGoals([]);
    if (!form.participant_name) return;
    let cancelled = false;
    base44.entities.Goal.filter({ participant_name: form.participant_name }, { sort: '-created_date', limit: 50, fields: ['goal'] })
      .then((p) => { if (!cancelled) setGoals((p.items || []).map((i) => i.goal).filter(Boolean)); })
      .catch((e) => console.error(e));
    return () => { cancelled = true; };
  }, [form.participant_name]);

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
      location_lat: form.location_lat === '' ? undefined : Number(form.location_lat),
      location_lng: form.location_lng === '' ? undefined : Number(form.location_lng),
      notes: form.notes,
      break_minutes: form.break_minutes === '' ? undefined : Number(form.break_minutes),
      travel_km: form.travel_km === '' ? undefined : Number(form.travel_km),
      billable_rate: form.billable_rate === '' ? undefined : Number(form.billable_rate),
      participant_goal: form.participant_goal || undefined,
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
              <Select
                value={form.employee_name || '__none__'}
                onValueChange={(v) => {
                  const chosen = v === '__none__' ? '' : v;
                  const defaultRate = chosen && !form.billable_rate && staffRates[chosen] ? String(staffRates[chosen]) : form.billable_rate;
                  setOverrideExpiredClearance(false);
                  setForm({ ...form, employee_name: chosen, billable_rate: defaultRate });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="min-w-[15rem]">
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {staff.map((n) => {
                    const avail = AVAILABILITY_LABEL[availabilityForDate(availability, n, form.start_time, form.end_time)];
                    const clr = clearancesByStaff[n];
                    const hasExpired = clr?.expired?.length > 0;
                    const hasExpiring = !hasExpired && clr?.expiring?.length > 0;
                    return (
                      <SelectItem key={n} value={n}>
                        <span className="flex w-full items-center justify-between gap-2">
                          <span>{n}</span>
                          <span className="flex items-center gap-1">
                            {hasExpired ? (
                              <span className="whitespace-nowrap rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700">
                                Clearance Expired
                              </span>
                            ) : hasExpiring ? (
                              <span className="whitespace-nowrap rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                                Expiring Soon
                              </span>
                            ) : (
                              <span className="whitespace-nowrap rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                Screened
                              </span>
                            )}
                            {avail && <span className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${avail.cls}`}>{avail.text}</span>}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {form.employee_name && availabilityForDate(availability, form.employee_name, form.start_time, form.end_time) === 'unavailable' && (
                <p className="text-xs font-medium text-destructive">{form.employee_name} has marked themselves unavailable on this date.</p>
              )}
              {form.employee_name && clearancesByStaff[form.employee_name]?.expired?.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                  <p className="font-extrabold">
                    Smart Roster Screening Gate: {form.employee_name} has expired clearance(s) ({clearancesByStaff[form.employee_name].expired.slice(0, 2).join(', ')}).
                  </p>
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideExpiredClearance}
                      onChange={(e) => setOverrideExpiredClearance(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-rose-400"
                    />
                    <span>I acknowledge the expired clearance and authorise an administrative override</span>
                  </label>
                </div>
              )}
            </div>
            <div className="grid gap-1.5"><Label>Participant</Label>
              <Select value={form.participant_name || '__none__'} onValueChange={(v) => setForm({ ...form, participant_name: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">None</SelectItem>{participants.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Location pin (lat)</Label><Input type="number" step="any" placeholder="Optional — enables geofence check" value={form.location_lat} onChange={(e) => setForm({ ...form, location_lat: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Location pin (lng)</Label><Input type="number" step="any" placeholder="e.g. 151.2093" value={form.location_lng} onChange={(e) => setForm({ ...form, location_lng: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        {(() => {
          const hasExpiredForSelected = Boolean(
            form.employee_name && clearancesByStaff[form.employee_name]?.expired?.length > 0
          );
          const guardrailBlocked = hasExpiredForSelected && !overrideExpiredClearance;
          let hours = 0;
          if (form.start_time && form.end_time) {
            const [sh, sm] = form.start_time.split(':').map(Number);
            const [eh, em] = form.end_time.split(':').map(Number);
            const raw = (eh * 60 + em - (sh * 60 + sm) - (Number(form.break_minutes) || 0)) / 60;
            if (raw > 0) hours = Number(raw.toFixed(2));
          }
          const rate = Number(form.billable_rate) || (form.employee_name && staffRates[form.employee_name]) || 0;
          const estCost = hours > 0 && rate > 0 ? (hours * rate).toFixed(2) : null;
          return (
            <>
              {(hours > 0 || form.employee_name) && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#0A2B6D]">
                  <span>
                    Duration: <strong className="text-[#0072FF]">{hours > 0 ? `${hours} hrs` : 'Set times'}</strong>
                  </span>
                  <span>
                    Est. Shift Cost: <strong className="text-[#5A00D6]">{estCost ? `$${estCost}` : '—'}</strong>
                  </span>
                  <span>
                    Screening Gate:{' '}
                    <strong className={hasExpiredForSelected ? 'text-rose-600' : 'text-emerald-600'}>
                      {hasExpiredForSelected ? (overrideExpiredClearance ? 'Override Active' : 'Blocked (Expired)') : 'Cleared'}
                    </strong>
                  </span>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={submit} disabled={saving || !form.date || guardrailBlocked}>
                  {editing ? 'Save changes' : 'Schedule shift'}
                </Button>
              </DialogFooter>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}