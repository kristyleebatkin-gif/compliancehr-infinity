import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

const UNCHANGED = '__unchanged__';
const CLEAR = '__clear__';

// Bulk edit: multi-select shifts in a date range and apply a shared change in one go.
export default function BulkShiftEditor({ open, onOpenChange, staff = [], onChanged }) {
  const { toast } = useToast();
  const [range, setRange] = useState({ from: format(new Date(), 'yyyy-MM-dd'), to: format(addDays(new Date(), 14), 'yyyy-MM-dd') });
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [employee, setEmployee] = useState(UNCHANGED);
  const [status, setStatus] = useState(UNCHANGED);

  const load = async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const page = await base44.entities.Shift.filter({ date: { $gte: range.from, $lte: range.to } }, { sort: 'date', limit: 300 });
      setShifts(page.items || []);
    } finally {
      setLoading(false);
    }
  };

  const onOpen = (o) => {
    onOpenChange(o);
    if (o) load();
  };

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const apply = async () => {
    if (selected.size === 0 || (employee === UNCHANGED && status === UNCHANGED)) return;
    setSaving(true);
    try {
      const changes = {};
      if (employee !== UNCHANGED) changes.employee_name = employee === CLEAR ? '' : employee;
      if (status !== UNCHANGED) changes.status = status;
      const updates = Array.from(selected).map((id) => ({ id, ...changes }));
      await base44.entities.Shift.bulkUpdate(updates);
      toast({ title: `${updates.length} shift(s) updated` });
      await load();
      onChanged?.();
    } catch (err) {
      toast({ title: 'Bulk update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeSelected = async () => {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} selected shift(s)? This cannot be undone.`)) return;
    setSaving(true);
    try {
      for (const id of Array.from(selected)) await base44.entities.Shift.delete(id);
      toast({ title: `${selected.size} shift(s) deleted` });
      await load();
      onChanged?.();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Bulk edit shifts</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1.5"><Label>From</Label><Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="w-36" /></div>
            <div className="grid gap-1.5"><Label>To</Label><Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="w-36" /></div>
            <Button variant="outline" onClick={load} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load shifts'}</Button>
          </div>

          {shifts.length > 0 && (
            <>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-2">
                {shifts.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30">
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                    <span className="font-medium">{s.date ? format(new Date(s.date + 'T00:00:00'), 'd MMM') : '—'}</span>
                    <span>{s.start_time || '—'}–{s.end_time || '—'}</span>
                    <span className="text-foreground/60">{s.participant_name || '—'}</span>
                    <span className="ml-auto text-foreground/60">{s.employee_name || 'Unassigned'} · {s.status}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label>Assign employee</Label>
                  <Select value={employee} onValueChange={setEmployee}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNCHANGED}>Leave unchanged</SelectItem>
                      <SelectItem value={CLEAR}>Clear assignment</SelectItem>
                      {staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Set status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNCHANGED}>Leave unchanged</SelectItem>
                      {['Scheduled', 'In Progress', 'Completed', 'Missed', 'Cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-foreground/60">{selected.size} of {shifts.length} selected</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={removeSelected} disabled={saving || selected.size === 0}>Delete selected</Button>
                  <Button onClick={apply} disabled={saving || selected.size === 0 || (employee === UNCHANGED && status === UNCHANGED)}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : `Apply to ${selected.size}`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}