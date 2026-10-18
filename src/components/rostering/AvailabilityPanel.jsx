import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';

const BLANK = { staff_name: '', type: 'Unavailable', date: '', start_time: '', end_time: '', all_day: false, notes: '' };

export default function AvailabilityPanel({ staff }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.StaffAvailability.filter({}, { sort: '-date', limit: 100 });
      setEntries(page.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.staff_name || !form.date) return;
    setSaving(true);
    try {
      await base44.entities.StaffAvailability.create({
        staff_name: form.staff_name,
        type: form.type,
        date: form.date,
        start_time: form.all_day ? undefined : (form.start_time || undefined),
        end_time: form.all_day ? undefined : (form.end_time || undefined),
        all_day: form.all_day,
        notes: form.notes || undefined,
      });
      setForm(BLANK);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry) => {
    await base44.entities.StaffAvailability.delete(entry.id);
    await load();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Availability & unavailability</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record when staff can or cannot work — used to suggest who can fill a shift.</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add entry</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No availability entries yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{e.staff_name}</p>
                    <Badge className={statusTone(e.type)}>{e.type}</Badge>
                    {e.all_day && <Badge className="bg-muted text-foreground/60">All day</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[
                      format(new Date(e.date), 'EEE d MMM yyyy'),
                      !e.all_day && e.start_time ? `${e.start_time}${e.end_time ? `–${e.end_time}` : ''}` : '',
                      e.notes,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(e)} title="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AvailabilityFormDialog({ open, onOpenChange, form, setForm, onSave, saving, staff }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add availability entry</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Staff *</Label>
              <Select value={form.staff_name} onValueChange={(v) => setForm({ ...form, staff_name: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>{staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Unavailable">Unavailable</SelectItem><SelectItem value="Available">Available</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            {!form.all_day && (
              <>
                <div className="grid gap-1.5"><Label>From</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>To</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
              </>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.all_day} onCheckedChange={(c) => setForm({ ...form, all_day: Boolean(c) })} /> All day
          </label>
          <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving || !form.staff_name || !form.date}>Save entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}