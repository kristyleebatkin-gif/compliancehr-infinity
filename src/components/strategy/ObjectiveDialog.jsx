import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LinkedRecordsEditor from '@/components/strategy/LinkedRecordsEditor';
import { parseList } from '@/components/strategy/strategyKit';

const blank = () => ({
  program_id: '', name: '', owner: '', measure: '', unit: '', baseline_value: '', target_value: '',
  current_value: '', due_date: '', notes: '', linked_records: [],
});

/** An objective needs an owner, a measure, a target and a due date. Progress comes from the actual figure. */
export default function ObjectiveDialog({ open, onOpenChange, objective, programs = [], meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!objective) { setForm({ ...blank(), program_id: programs.length === 1 ? programs[0].id : '' }); return; }
    setForm({
      program_id: objective.program_id || '', name: objective.name || '', owner: objective.owner || '',
      measure: objective.measure || '', unit: objective.unit || '',
      baseline_value: objective.baseline_value ?? '', target_value: objective.target_value ?? '',
      current_value: objective.current_value ?? '', due_date: objective.due_date || '',
      notes: objective.notes || '', linked_records: parseList(objective.linked_records_json),
    });
  }, [open, objective, programs]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const ready = form.program_id && form.name.trim() && form.owner.trim() && form.measure.trim().length >= 5
    && form.target_value !== '' && form.due_date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{objective ? `Edit ${objective.name}` : 'Record an objective'}</DialogTitle>
          <DialogDescription>
            Progress is calculated from baseline, target and actual. Until all three exist the objective shows no measure rather than a made-up percentage.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!programs.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Record a program before adding an objective.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="objective-program">Program</Label>
            <Select value={form.program_id} onValueChange={(program_id) => set({ program_id })}>
              <SelectTrigger id="objective-program"><SelectValue placeholder="Choose a program" /></SelectTrigger>
              <SelectContent>{programs.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="objective-name">Objective</Label>
            <Input id="objective-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Every participant file complete at audit" />
          </div>
          <div>
            <Label htmlFor="objective-owner">Owner</Label>
            <Input id="objective-owner" value={form.owner} onChange={(e) => set({ owner: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="objective-measure">Measure</Label>
            <Input id="objective-measure" value={form.measure} onChange={(e) => set({ measure: e.target.value })} placeholder="Percentage of files complete" />
          </div>
          <div>
            <Label htmlFor="objective-unit">Unit</Label>
            <Input id="objective-unit" value={form.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="%" />
          </div>
          <div>
            <Label htmlFor="objective-due">Due date</Label>
            <Input id="objective-due" type="date" value={form.due_date} onChange={(e) => set({ due_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="objective-baseline">Baseline</Label>
            <Input id="objective-baseline" type="number" value={form.baseline_value} onChange={(e) => set({ baseline_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="objective-target">Target</Label>
            <Input id="objective-target" type="number" value={form.target_value} onChange={(e) => set({ target_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="objective-current">Current measure</Label>
            <Input id="objective-current" type="number" value={form.current_value} onChange={(e) => set({ current_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="objective-notes">Notes</Label>
            <Input id="objective-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
          <LinkedRecordsEditor
            value={form.linked_records}
            registers={meta.linkedRegisters || []}
            onChange={(linked_records) => set({ linked_records })}
            label="Linked decisions, risks, controls, evidence, workflows and AI recommendations"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.({ ...form, ...(objective ? { objective_id: objective.id } : {}) })}>
            {busy ? 'Saving…' : objective ? 'Save objective' : 'Record objective'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}