import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';

export default function MyAvailability() {
  const [me, setMe] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'Available', date: '', start_time: '', end_time: '', all_day: false, notes: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled || !user) return;
        setMe(user);
        const page = await base44.entities.StaffAvailability.filter(
          { staff_name: user.full_name },
          { sort: '-date', limit: 60 }
        );
        if (cancelled) return;
        setEntries(page.items || []);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    if (!form.date || !me) return;
    setSaving(true);
    try {
      await base44.entities.StaffAvailability.create({
        staff_name: me.full_name,
        type: form.type,
        date: form.date,
        start_time: form.all_day ? undefined : (form.start_time || undefined),
        end_time: form.all_day ? undefined : (form.end_time || undefined),
        all_day: form.all_day,
        notes: form.notes || undefined,
      });
      const page = await base44.entities.StaffAvailability.filter({ staff_name: me.full_name }, { sort: '-date', limit: 60 });
      setEntries(page.items || []);
      setForm({ type: form.type, date: '', start_time: '', end_time: '', all_day: false, notes: '' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry) => {
    await base44.entities.StaffAvailability.delete(entry.id);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-brand" /> My availability</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tell your coordinators when you can or cannot work — they use this before assigning shifts.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-border/60 p-3">
          <div>
            <Label className="text-[11px]">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px]">Date *</Label>
            <Input type="date" className="w-40" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          {!form.all_day && (
            <>
              <div>
                <Label className="text-[11px]">From</Label>
                <Input type="time" className="w-28" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <Label className="text-[11px]">To</Label>
                <Input type="time" className="w-28" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </>
          )}
          <label className="flex items-center gap-2 pb-2 text-sm">
            <Checkbox checked={form.all_day} onCheckedChange={(c) => setForm({ ...form, all_day: Boolean(c) })} /> All day
          </label>
          <Button onClick={save} disabled={saving || !form.date} className="mb-0.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No availability recorded yet — add your first entry above.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusTone(e.type)}>{e.type}</Badge>
                  <span className="text-sm font-medium">{format(new Date(e.date + 'T00:00:00'), 'EEE d MMM yyyy')}</span>
                  {e.all_day ? <Badge className="bg-muted text-foreground/60">All day</Badge> : e.start_time ? <span className="text-sm text-muted-foreground">{e.start_time}{e.end_time ? `–${e.end_time}` : ''}</span> : null}
                  {e.notes && <span className="text-xs text-muted-foreground">· {e.notes}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(e)} title="Remove entry"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}