import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import RoadmapPlanEditor from '@/components/strategy/RoadmapPlanEditor';
import { parseList } from '@/components/strategy/strategyKit';

const blank = () => ({ program_id: '', name: '', summary: '', notes: '', change_note: '' });

/** Saving a submitted or approved roadmap creates the next version instead of rewriting the approved one. */
export default function RoadmapDialog({ open, onOpenChange, roadmap, programs = [], meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);
  const [plan, setPlan] = useState({ initiatives: [], dependencies: [], milestones: [] });

  useEffect(() => {
    if (!open) return;
    if (!roadmap) {
      setForm({ ...blank(), program_id: programs.length === 1 ? programs[0].id : '' });
      setPlan({ initiatives: [], dependencies: [], milestones: [] });
      return;
    }
    setForm({
      program_id: roadmap.program_id || '', name: roadmap.name || '', summary: roadmap.summary || '',
      notes: roadmap.notes || '', change_note: '',
    });
    setPlan({
      initiatives: parseList(roadmap.initiatives_json),
      dependencies: parseList(roadmap.dependencies_json),
      milestones: parseList(roadmap.milestones_json),
    });
  }, [open, roadmap, programs]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const ready = form.program_id && form.name.trim() && form.summary.trim().length >= 10 && plan.initiatives.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{roadmap ? `Edit ${roadmap.name} (version ${roadmap.version})` : 'Record a roadmap'}</DialogTitle>
          <DialogDescription>
            Initiatives carry their own version, dependencies point at initiatives in this roadmap, and milestones date the plan. Approval needs someone other than the author.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!programs.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Record a program before adding a roadmap.</p>}
        {roadmap && ['Submitted', 'Approved'].includes(roadmap.status) && (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
            This version is {roadmap.status.toLowerCase()}. Saving records a new draft version {Number(roadmap.version || 1) + 1} and leaves this one intact.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="roadmap-program">Program</Label>
            <Select value={form.program_id} onValueChange={(program_id) => set({ program_id })}>
              <SelectTrigger id="roadmap-program"><SelectValue placeholder="Choose a program" /></SelectTrigger>
              <SelectContent>{programs.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="roadmap-name">Roadmap name</Label>
            <Input id="roadmap-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Practice assurance roadmap" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="roadmap-summary">What this roadmap delivers</Label>
            <Textarea id="roadmap-summary" rows={2} value={form.summary} onChange={(e) => set({ summary: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="roadmap-change">What changed in this version</Label>
            <Input id="roadmap-change" value={form.change_note} onChange={(e) => set({ change_note: e.target.value })} placeholder="Initial version" />
          </div>
          <div>
            <Label htmlFor="roadmap-notes">Notes</Label>
            <Input id="roadmap-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>

          <RoadmapPlanEditor value={plan} meta={meta} onChange={setPlan} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy || !ready}
            onClick={() => onSave?.({ ...form, ...plan, ...(roadmap ? { roadmap_id: roadmap.id } : {}) })}
          >
            {busy ? 'Saving…' : roadmap ? 'Save roadmap' : 'Record roadmap'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}