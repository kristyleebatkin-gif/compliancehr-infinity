import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LinkedRecordsEditor from '@/components/strategy/LinkedRecordsEditor';

const blank = () => ({
  capability_id: '', score: '3', assessed_at: new Date().toISOString().slice(0, 10),
  assessor: '', rationale: '', next_review: '', notes: '', evidence_refs: [],
});

/** A score of 4 or 5 needs at least one evidence reference before it can be recorded. */
export default function AssessmentDialog({ open, onOpenChange, capability, capabilities = [], meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (capability) {
      setForm({ ...blank(), capability_id: capability.id, score: String(capability.current_maturity ?? 3), assessor: capability.owner || '' });
      return;
    }
    setForm({ ...blank(), capability_id: capabilities.length === 1 ? capabilities[0].id : '' });
  }, [open, capability, capabilities]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const highScore = Number(form.score) >= 4;
  const ready = form.capability_id && form.assessor.trim() && form.rationale.trim().length >= 20
    && (!highScore || form.evidence_refs.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record a maturity assessment</DialogTitle>
          <DialogDescription>
            The assessment is saved as a draft. A capability only rolls up a validated assessment, and only an assessment with evidence references is marked evidence backed.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="assessment-capability">Capability</Label>
            <Select value={form.capability_id} onValueChange={(capability_id) => set({ capability_id })} disabled={Boolean(capability)}>
              <SelectTrigger id="assessment-capability"><SelectValue placeholder="Choose a capability" /></SelectTrigger>
              <SelectContent>{capabilities.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assessment-score">Score</Label>
            <Select value={form.score} onValueChange={(score) => set({ score })}>
              <SelectTrigger id="assessment-score"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.maturityLevels || []).map((row) => <SelectItem key={row.score} value={String(row.score)}>{row.score} · {row.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assessment-assessor">Assessor</Label>
            <Input id="assessment-assessor" value={form.assessor} onChange={(e) => set({ assessor: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="assessment-date">Assessed on</Label>
            <Input id="assessment-date" type="date" value={String(form.assessed_at).slice(0, 10)} onChange={(e) => set({ assessed_at: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="assessment-rationale">Rationale</Label>
            <Textarea id="assessment-rationale" rows={3} value={form.rationale} onChange={(e) => set({ rationale: e.target.value })} placeholder="Why this score, in at least a sentence." />
          </div>
          <div>
            <Label htmlFor="assessment-review">Next review</Label>
            <Input id="assessment-review" type="date" value={form.next_review} onChange={(e) => set({ next_review: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="assessment-notes">Notes</Label>
            <Input id="assessment-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
          {highScore && (
            <p className="sm:col-span-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">
              A maturity of 4 or 5 is only recorded when evidence references are attached below.
            </p>
          )}
          <LinkedRecordsEditor
            value={form.evidence_refs}
            registers={meta.linkedRegisters || []}
            onChange={(evidence_refs) => set({ evidence_refs })}
            label="Evidence references"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.(form)}>{busy ? 'Saving…' : 'Record assessment'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}